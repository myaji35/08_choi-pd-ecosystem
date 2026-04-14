'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import {
  ArrowLeft,
  ArrowUp,
  MessageCircle,
  Paperclip,
  Plus,
  X,
  BookOpen,
  Loader2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrls?: string[];
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Helper: format relative time in Korean                              */
/* ------------------------------------------------------------------ */

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

/* ------------------------------------------------------------------ */
/* Main Page Component                                                 */
/* ------------------------------------------------------------------ */

export default function ChatPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  /* ---- state ---- */
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pendingImages, setPendingImages] = useState<
    { file: File; preview: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [showList, setShowList] = useState(true); // mobile toggle

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---- auth guard ---- */
  useEffect(() => {
    if (!sessionLoading && !user) {
      router.push('/login?callbackUrl=/chopd/chat');
    }
  }, [sessionLoading, user, router]);

  /* ---- fetch conversations ---- */
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations ?? []);
      }
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    if (user) fetchConversations();
  }, [user, fetchConversations]);

  /* ---- fetch messages when conversation selected ---- */
  useEffect(() => {
    if (!activeConvId) return;
    setIsLoading(true);
    fetch(`/api/chat/conversations/${activeConvId}/messages`)
      .then((r) => (r.ok ? r.json() : { messages: [] }))
      .then((data) => setMessages(data.messages ?? []))
      .catch(() => setMessages([]))
      .finally(() => setIsLoading(false));
  }, [activeConvId]);

  /* ---- auto-scroll ---- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isResponding]);

  /* ---- create conversation ---- */
  const createConversation = async () => {
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '새 대화' }),
      });
      if (res.ok) {
        const data = await res.json();
        const conv: Conversation = data.conversation;
        setConversations((prev) => [conv, ...prev]);
        setActiveConvId(conv.id);
        setMessages([]);
        setShowList(false);
      }
    } catch {
      /* silent */
    }
  };

  /* ---- upload image ---- */
  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
    } catch {
      /* silent */
    }
    return null;
  };

  /* ---- send message ---- */
  const sendMessage = async () => {
    if ((!input.trim() && pendingImages.length === 0) || !activeConvId) return;

    const content = input.trim();
    setInput('');

    // Upload pending images
    let imageUrls: string[] = [];
    if (pendingImages.length > 0) {
      const uploads = await Promise.all(
        pendingImages.map((img) => uploadImage(img.file)),
      );
      imageUrls = uploads.filter((u): u is string => u !== null);
      // revoke previews
      pendingImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setPendingImages([]);
    }

    // Optimistic user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsResponding(true);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConvId,
          content,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Replace temp message with real ones (user + assistant)
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== tempUserMsg.id);
          const newMessages = data.messages ?? [data.userMessage, data.assistantMessage].filter(Boolean);
          return [...withoutTemp, ...newMessages];
        });
        // Refresh conversations to update title/timestamp
        fetchConversations();
      }
    } catch {
      /* silent */
    } finally {
      setIsResponding(false);
    }
  };

  /* ---- handle image attach ---- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPendingImages((prev) => [...prev, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (idx: number) => {
    setPendingImages((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[idx].preview);
      copy.splice(idx, 1);
      return copy;
    });
  };

  /* ---- handle key press ---- */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ---- select conversation ---- */
  const selectConversation = (id: string) => {
    setActiveConvId(id);
    setShowList(false);
  };

  /* ---- loading / auth gate ---- */
  if (sessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) return null;

  /* ================================================================ */
  /* RENDER                                                            */
  /* ================================================================ */

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* ---- Top Header ---- */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4">
        <button
          onClick={() => router.push('/chopd')}
          className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-gray-900">
          AI 활동 비서
        </h1>
        <div className="flex-1" />
        <button
          onClick={() => router.push('/chopd/chat/memories')}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label="기억 관리"
        >
          <BookOpen className="h-5 w-5" />
        </button>
      </header>

      {/* ---- Body ---- */}
      <div className="flex flex-1 overflow-hidden">
        {/* ============================================= */}
        {/* Conversation List (left panel)                */}
        {/* ============================================= */}
        <aside
          className={`${
            showList ? 'flex' : 'hidden'
          } w-full flex-col border-r border-gray-200 bg-gray-50 md:flex md:w-80`}
        >
          {/* List header */}
          <div className="flex h-12 items-center justify-between border-b border-gray-200 px-4">
            <span className="text-sm font-semibold text-gray-700">대화</span>
            <button
              onClick={createConversation}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" />
              새 대화
            </button>
          </div>

          {/* List body */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <MessageCircle className="mb-2 h-8 w-8" />
                <p className="text-sm">대화가 없습니다</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`w-full border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-100 ${
                    activeConvId === conv.id
                      ? 'bg-blue-50 border-l-2 border-l-blue-500'
                      : ''
                  }`}
                >
                  <p className="truncate text-sm font-medium text-gray-900">
                    {conv.title || '새 대화'}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    {relativeTime(conv.updatedAt)}
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ============================================= */}
        {/* Chat Area (right panel)                       */}
        {/* ============================================= */}
        <main
          className={`${
            !showList ? 'flex' : 'hidden'
          } flex-1 flex-col md:flex`}
        >
          {activeConvId ? (
            <>
              {/* Chat header */}
              <div className="flex h-12 items-center gap-2 border-b border-gray-200 px-4">
                {/* Mobile back button */}
                <button
                  onClick={() => setShowList(true)}
                  className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 md:hidden"
                  aria-label="대화 목록으로"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="truncate text-sm font-semibold text-gray-800">
                  {conversations.find((c) => c.id === activeConvId)?.title ||
                    '새 대화'}
                </h2>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {isLoading ? (
                  /* Skeleton */
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}
                      >
                        <div
                          className={`h-10 animate-pulse rounded-2xl ${
                            i % 2 === 0
                              ? 'w-48 bg-blue-100'
                              : 'w-56 bg-gray-200'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-gray-400">
                    <MessageCircle className="mb-3 h-12 w-12" />
                    <p className="text-sm">메시지를 보내 대화를 시작하세요</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={
                            msg.role === 'user'
                              ? 'bg-blue-500 text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[75%] ml-auto'
                              : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[75%]'
                          }
                        >
                          {/* Image attachments */}
                          {msg.imageUrls && msg.imageUrls.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-1.5">
                              {msg.imageUrls.map((url, idx) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt={`첨부 이미지 ${idx + 1}`}
                                  className="h-24 w-24 rounded-lg object-cover"
                                />
                              ))}
                            </div>
                          )}
                          {/* Text */}
                          {msg.content && (
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                              {msg.content}
                            </p>
                          )}
                          {/* Timestamp */}
                          <p
                            className={`mt-1 text-[11px] ${
                              msg.role === 'user'
                                ? 'text-white/60'
                                : 'text-gray-400'
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString(
                              'ko-KR',
                              { hour: '2-digit', minute: '2-digit' },
                            )}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Responding indicator */}
                    {isResponding && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md px-4 py-2.5">
                          <div className="flex items-center gap-1">
                            <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                            <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                            <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input area */}
              <div className="shrink-0 border-t border-gray-200 bg-white p-3">
                {/* Image previews */}
                {pendingImages.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {pendingImages.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={img.preview}
                          alt={`첨부 ${idx + 1}`}
                          className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700"
                          aria-label="이미지 제거"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-end gap-2">
                  {/* Attach button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="이미지 첨부"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Text input */}
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
                  />

                  {/* Send button */}
                  <button
                    onClick={sendMessage}
                    disabled={
                      isResponding ||
                      (!input.trim() && pendingImages.length === 0)
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    aria-label="전송"
                  >
                    <ArrowUp className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty state - no conversation selected */
            <div className="flex h-full flex-col items-center justify-center text-gray-400">
              <MessageCircle className="mb-3 h-14 w-14" />
              <p className="text-sm font-medium text-gray-500">
                대화를 선택하거나 새 대화를 시작하세요
              </p>
              <button
                onClick={createConversation}
                className="mt-4 flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                <Plus className="h-4 w-4" />
                새 대화 시작
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
