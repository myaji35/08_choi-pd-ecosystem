'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, Heart, Mail, UserPlus } from 'lucide-react';

export function FollowButton({
  slug,
  initialCount = 0,
}: {
  slug: string;
  initialCount?: number;
}) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/member/${slug}/follow`);
        const data = await res.json();
        if (!cancelled && data?.success) {
          setIsFollowing(!!data.isFollowing);
          setCount(data.followerCount ?? initialCount);
        }
      } catch (err) {
        if (!cancelled) console.debug('[FollowButton] initial fetch failed:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, initialCount]);

  async function submit(body: Record<string, unknown> = {}) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/member/${slug}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || '팔로우 실패');
      setIsFollowing(!!data.isFollowing);
      setCount((c) => (data.isFollowing ? c + 1 : Math.max(0, c - 1)));
      setMsg(data.message || '완료!');
      setTimeout(() => setMsg(null), 2500);
      return true;
    } catch (err) {
      setMsg(err instanceof Error ? err.message : '오류');
      setTimeout(() => setMsg(null), 3000);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleClick() {
    // 이미 로그인된 경우 즉시 토글 시도. 서버가 401이면 모달 오픈.
    const ok = await submit();
    if (!ok && !isFollowing) {
      setModalOpen(true);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    const ok = await submit({ email: email.trim(), name: name.trim() || undefined });
    if (ok) {
      setModalOpen(false);
      setEmail('');
      setName('');
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        aria-pressed={isFollowing}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: isFollowing ? 'rgba(255,255,255,0.2)' : '#ffffff',
          color: isFollowing ? '#ffffff' : '#D32F2F',
          padding: '12px 22px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 800,
          border: isFollowing ? '1.5px solid rgba(255,255,255,0.5)' : '1.5px solid #ffffff',
          cursor: busy ? 'wait' : 'pointer',
          boxShadow: isFollowing ? 'none' : '0 4px 14px rgba(0,0,0,0.18)',
          transition: 'all 150ms',
        }}
      >
        {isFollowing ? (
          <>
            <Check className="w-4 h-4" />
            팔로잉 · {count.toLocaleString('ko-KR')}
          </>
        ) : (
          <>
            <Heart className="w-4 h-4" />
            팔로우 · {count.toLocaleString('ko-KR')}
          </>
        )}
      </button>

      {msg && (
        <span
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#16325C',
            color: 'white',
            padding: '10px 18px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            zIndex: 100,
          }}
        >
          {msg}
        </span>
      )}

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 80,
            padding: 16,
          }}
          onClick={() => setModalOpen(false)}
        >
          <form
            onSubmit={handleEmailSubmit}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 14,
              padding: 24,
              width: '100%',
              maxWidth: 420,
              boxShadow: '0 18px 48px rgba(0,0,0,0.35)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #D32F2F, #B71C1C)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <div style={{ fontWeight: 900, color: '#16325C', fontSize: 17 }}>팔로우하기</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  새 라이브·뉴스레터·수상 소식을 받아보세요
                </div>
              </div>
            </div>

            <label
              style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 6 }}
            >
              이름 (선택)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 14,
                marginBottom: 12,
                color: '#111',
              }}
            />

            <label
              style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 6 }}
            >
              이메일 *
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 14,
                marginBottom: 16,
                color: '#111',
              }}
            />

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '11px 14px',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  color: '#374151',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={busy}
                style={{
                  flex: 2,
                  padding: '11px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #D32F2F, #B71C1C)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: busy ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Bell className="w-4 h-4" />
                {busy ? '등록 중...' : '팔로우하고 알림 받기'}
              </button>
            </div>

            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Mail className="w-3 h-3" />
              주소는 새 소식 발송에만 사용되며, 언제든 구독 취소 가능합니다.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
