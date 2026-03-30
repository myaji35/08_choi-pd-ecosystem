'use client';

import { useState, useCallback } from 'react';

// ── 채널 설정 (카테고리별 그룹핑) ──────────────────────────────
const CHANNEL_CATEGORIES = [
  {
    category: 'SNS',
    channels: [
      {
        id: 'instagram',
        label: '인스타그램',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        ),
        color: '#E4405F',
      },
      {
        id: 'twitter',
        label: 'X (트위터)',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
          </svg>
        ),
        color: '#1DA1F2',
      },
      {
        id: 'kakao',
        label: '카카오',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
        color: '#FEE500',
      },
    ],
  },
  {
    category: '블로그',
    channels: [
      {
        id: 'naver-blog',
        label: '네이버 블로그',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4v16" />
            <path d="M6 4l12 16" />
            <path d="M18 4v16" />
          </svg>
        ),
        color: '#03C75A',
      },
      {
        id: 'wordpress',
        label: '워드프레스',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6l4 12 2-6 2 6 4-12" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        ),
        color: '#21759B',
      },
      {
        id: 'tistory',
        label: '티스토리',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="12" y1="6" x2="12" y2="20" />
            <line x1="8" y1="20" x2="16" y2="20" />
          </svg>
        ),
        color: '#FF5A00',
      },
      {
        id: 'brunch',
        label: '브런치',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
            <line x1="6" y1="2" x2="6" y2="4" />
            <line x1="10" y1="2" x2="10" y2="4" />
            <line x1="14" y1="2" x2="14" y2="4" />
          </svg>
        ),
        color: '#000000',
      },
    ],
  },
  {
    category: '기타',
    channels: [
      {
        id: 'newsletter',
        label: '뉴스레터',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        ),
        color: '#6366F1',
      },
    ],
  },
] as const;

// 전체 채널 flat 배열 (기존 호환)
const CHANNELS = CHANNEL_CATEGORIES.flatMap((cat) => cat.channels);

type ChannelId = (typeof CHANNELS)[number]['id'];

interface GeneratedResult {
  channel: string;
  content: string;
  hashtags?: string[];
}

// ── 스켈레톤 컴포넌트 ───────────────────────────────────────
function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="flex gap-2 mt-4">
        <div className="h-6 bg-gray-200 rounded-full w-16" />
        <div className="h-6 bg-gray-200 rounded-full w-20" />
        <div className="h-6 bg-gray-200 rounded-full w-14" />
      </div>
    </div>
  );
}

// ── 메인 페이지 ─────────────────────────────────────────────
export default function AiContentPage() {
  const [text, setText] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<ChannelId[]>(['instagram', 'naver-blog']);
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ mode?: string; plan?: string }>({});

  // 채널 토글
  const toggleChannel = useCallback((channelId: ChannelId) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((c) => c !== channelId)
        : [...prev, channelId]
    );
  }, []);

  // AI 생성 요청
  const handleGenerate = useCallback(async () => {
    if (!text.trim()) {
      setError('텍스트를 입력해주세요.');
      return;
    }
    if (selectedChannels.length === 0) {
      setError('최소 1개 이상의 채널을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults([]);

    try {
      const res = await fetch('/api/ai/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), channels: selectedChannels }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || '생성에 실패했습니다.');
        if (data.remaining !== undefined) setRemaining(data.remaining);
        return;
      }

      setResults(data.results || []);
      setMeta(data.meta || {});
      if (data.meta?.remaining !== undefined) setRemaining(data.meta.remaining);
      // 첫 번째 결과 탭 활성화
      if (data.results?.length > 0) {
        setActiveTab(data.results[0].channel);
      }
    } catch (err: any) {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [text, selectedChannels]);

  // 클립보드 복사
  const handleCopy = useCallback(async (content: string, channel: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(channel);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(channel);
      setTimeout(() => setCopied(null), 2000);
    }
  }, []);

  const activeResult = results.find((r) => r.channel === activeTab);
  const channelMeta = CHANNELS.find((c) => c.id === activeTab);

  return (
    <div className="min-h-screen" style={{ background: '#F3F2F2' }}>
      {/* 페이지 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container px-4 md:px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ background: '#00A1E0' }}
            >
              <svg
                className="h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#16325C' }}>
                AI 콘텐츠 어시스턴트
              </h1>
              <p className="text-sm text-gray-500">
                텍스트를 입력하면 여러 SNS 채널에 맞는 콘텐츠를 자동 생성합니다
              </p>
            </div>
          </div>
          {/* 사용량 표시 */}
          {remaining !== null && remaining >= 0 && (
            <div className="mt-3 inline-flex items-center gap-2 text-sm">
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                style={{ background: remaining > 0 ? '#00A1E0' : '#EF4444' }}
              >
                {meta.plan === 'free' ? `Free` : 'Pro'}
              </span>
              <span className="text-gray-600">
                {remaining > 0
                  ? `월 5회 중 ${remaining}회 남음`
                  : '이번 달 무료 횟수를 모두 사용했습니다'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="container px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── 좌측: 입력 영역 ────────────────────────────── */}
          <div className="space-y-5">
            {/* 텍스트 에디터 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label
                htmlFor="content-input"
                className="block text-xs font-semibold text-gray-600 mb-1.5"
              >
                원본 텍스트
              </label>
              <textarea
                id="content-input"
                rows={8}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="블로그 글, 강의 요약, 아이디어 등을 자유롭게 입력하세요..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0] resize-y"
              />
              <p className="mt-1.5 text-xs text-gray-400">
                {text.length}자 입력됨
              </p>
            </div>

            {/* 채널 선택 (카테고리별 그룹핑) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-xs font-semibold text-gray-600 mb-3">
                생성할 채널 선택
              </label>
              <div className="space-y-4">
                {CHANNEL_CATEGORIES.map((cat) => (
                  <div key={cat.category}>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      {cat.category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {cat.channels.map((ch) => {
                        const isSelected = selectedChannels.includes(ch.id);
                        return (
                          <button
                            key={ch.id}
                            onClick={() => toggleChannel(ch.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                              isSelected
                                ? 'text-white border-transparent shadow-sm'
                                : 'text-gray-600 border-gray-300 bg-white hover:border-gray-400'
                            }`}
                            style={isSelected ? { background: ch.color } : undefined}
                          >
                            {ch.icon}
                            {ch.label}
                            {isSelected && (
                              <svg
                                className="w-3.5 h-3.5 ml-0.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 생성 버튼 */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !text.trim() || selectedChannels.length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-base font-semibold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              style={{ background: '#00A1E0' }}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  AI가 콘텐츠를 생성하고 있습니다...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  AI로 생성하기
                </>
              )}
            </button>

            {/* 에러 메시지 */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}
          </div>

          {/* ── 우측: 결과 영역 ────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* 탭 헤더 */}
            {results.length > 0 ? (
              <>
                <div className="flex border-b border-gray-200 overflow-x-auto">
                  {results.map((r) => {
                    const ch = CHANNELS.find((c) => c.id === r.channel);
                    const isActive = activeTab === r.channel;
                    return (
                      <button
                        key={r.channel}
                        onClick={() => setActiveTab(r.channel)}
                        className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                          isActive
                            ? 'border-[#00A1E0] text-[#16325C]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {ch?.icon}
                        {ch?.label || r.channel}
                      </button>
                    );
                  })}
                </div>

                {/* 결과 본문 */}
                {activeResult && (
                  <div className="p-6">
                    {/* 채널 배지 */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ background: channelMeta?.color || '#00A1E0' }}
                      >
                        {channelMeta?.icon}
                        {channelMeta?.label}
                      </span>
                      {meta.mode === 'mock' && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                          Demo 모드
                        </span>
                      )}
                    </div>

                    {/* 콘텐츠 */}
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed bg-gray-50 rounded-lg p-4 border border-gray-200">
                        {activeResult.content}
                      </div>
                    </div>

                    {/* 해시태그 */}
                    {activeResult.hashtags && activeResult.hashtags.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                          추천 해시태그
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {activeResult.hashtags.map((tag, i) => (
                            <span
                              key={i}
                              className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ background: channelMeta?.color || '#00A1E0' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 액션 버튼 */}
                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={() =>
                          handleCopy(
                            activeResult.content +
                              (activeResult.hashtags
                                ? '\n\n' + activeResult.hashtags.join(' ')
                                : ''),
                            activeResult.channel
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        {copied === activeResult.channel ? (
                          <>
                            <svg
                              className="w-4 h-4 text-green-600"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            복사됨!
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                x="9"
                                y="9"
                                width="13"
                                height="13"
                                rx="2"
                                ry="2"
                              />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            복사
                          </>
                        )}
                      </button>
                      <button
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-md"
                        style={{ background: '#00A1E0' }}
                        onClick={() =>
                          alert(
                            '예약 발행 기능은 SNS 계정 연동 후 사용 가능합니다.'
                          )
                        }
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        예약 발행
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : isLoading ? (
              /* 로딩 스켈레톤 */
              <div className="p-6 space-y-6">
                <div className="flex gap-3 border-b border-gray-200 pb-3">
                  {selectedChannels.map((ch) => (
                    <div
                      key={ch}
                      className="h-8 w-20 bg-gray-200 rounded animate-pulse"
                    />
                  ))}
                </div>
                <Skeleton />
              </div>
            ) : (
              /* 빈 상태 */
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
                  style={{ background: '#00A1E015' }}
                >
                  <svg
                    className="w-8 h-8"
                    style={{ color: '#00A1E0' }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: '#16325C' }}
                >
                  AI가 콘텐츠를 생성할 준비가 되었습니다
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  좌측에 텍스트를 입력하고 채널을 선택한 뒤
                  &ldquo;AI로 생성하기&rdquo; 버튼을 클릭하세요.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
