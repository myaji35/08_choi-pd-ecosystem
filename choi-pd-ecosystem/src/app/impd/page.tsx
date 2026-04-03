'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ─── 타입 정의 ────────────────────────────────────────────

interface ImpdStatus {
  impdStatus: 'none' | 'in_progress' | 'completed' | 'rejected';
  isExpired: boolean;
  deadline: string | null;
  remainingDays: number | null;
  startedAt: string | null;
  steps: {
    profile: 'completed' | 'pending';
    introduction: 'completed' | 'pending';
    business_plan: 'completed' | 'pending';
  };
  completedStepsCount: number;
  totalSteps: number;
  towninInfo: {
    name: string;
    email: string;
    role: string;
  };
}

// ─── 아이콘 컴포넌트 (Feather Style) ──────────────────────

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function CircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ─── 단계별 폼 ────────────────────────────────────────────

function ProfileStepForm({ onSubmit, loading }: { onSubmit: (data: Record<string, string>) => void; loading: boolean }) {
  const [name, setName] = useState('');
  const [intro, setIntro] = useState('');
  const [photo, setPhoto] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">이름 *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="실명을 입력하세요"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">프로필 사진 URL *</label>
        <input
          type="url"
          value={photo}
          onChange={e => setPhoto(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">한 줄 소개 * (10자 이상)</label>
        <input
          type="text"
          value={intro}
          onChange={e => setIntro(e.target.value)}
          placeholder="내가 하는 일을 한 줄로 설명해주세요"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
        />
        <p className="text-xs text-gray-400 mt-1">{intro.length}자</p>
      </div>
      <button
        onClick={() => onSubmit({ name, photo, intro })}
        disabled={loading || !name || !photo || intro.length < 10}
        className="w-full py-2.5 bg-[#00A1E0] text-white text-sm font-semibold rounded-lg hover:bg-[#0090C8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '저장 중...' : '프로필 저장'}
      </button>
    </div>
  );
}

function IntroductionStepForm({ onSubmit, loading }: { onSubmit: (data: Record<string, string>) => void; loading: boolean }) {
  const [text, setText] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">자기소개 * (100자 이상)</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={6}
          placeholder="나는 누구인지, 어떤 경험을 했는지, 왜 Chopd에 합류하고 싶은지 자유롭게 써주세요."
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0] resize-none"
        />
        <p className={`text-xs mt-1 ${text.length >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
          {text.length}자 / 최소 100자
        </p>
      </div>
      <button
        onClick={() => onSubmit({ text })}
        disabled={loading || text.length < 100}
        className="w-full py-2.5 bg-[#00A1E0] text-white text-sm font-semibold rounded-lg hover:bg-[#0090C8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '저장 중...' : '자기소개 저장'}
      </button>
    </div>
  );
}

function BusinessPlanStepForm({ onSubmit, loading }: { onSubmit: (data: Record<string, string>) => void; loading: boolean }) {
  const [what, setWhat] = useState('');
  const [why, setWhy] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">무엇을 할 것인가? * (50자 이상)</label>
        <textarea
          value={what}
          onChange={e => setWhat(e.target.value)}
          rows={4}
          placeholder="Chopd에서 어떤 콘텐츠/서비스를 제공할 계획인지 구체적으로 설명하세요."
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0] resize-none"
        />
        <p className={`text-xs mt-1 ${what.length >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
          {what.length}자 / 최소 50자
        </p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">왜 하려는가? * (50자 이상)</label>
        <textarea
          value={why}
          onChange={e => setWhy(e.target.value)}
          rows={4}
          placeholder="이 일을 하고자 하는 동기와 이유를 진심으로 적어주세요."
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0] resize-none"
        />
        <p className={`text-xs mt-1 ${why.length >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
          {why.length}자 / 최소 50자 | 합계: {what.length + why.length}자 / 최소 200자
        </p>
      </div>
      <button
        onClick={() => onSubmit({ what, why })}
        disabled={loading || what.length < 50 || why.length < 50 || what.length + why.length < 200}
        className="w-full py-2.5 bg-[#00A1E0] text-white text-sm font-semibold rounded-lg hover:bg-[#0090C8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '저장 중...' : '사업 계획 저장'}
      </button>
    </div>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────

export default function ImpdPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ImpdStatus | null>(null);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const STEPS = [
    {
      key: 'profile',
      label: '프로필 완성',
      desc: '이름, 사진, 소개를 입력하세요',
      Form: ProfileStepForm,
    },
    {
      key: 'introduction',
      label: '자기소개',
      desc: '100자 이상 자유롭게 작성하세요',
      Form: IntroductionStepForm,
    },
    {
      key: 'business_plan',
      label: '사업 계획',
      desc: '무엇을, 왜 할 것인지 200자 이상 작성하세요',
      Form: BusinessPlanStepForm,
    },
  ];

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/impd/status');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setStatus(data);
      }
    } catch {
      // ignore
    }
  }, [router]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/impd/start', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '시작에 실패했습니다');
      } else {
        setSuccess(data.message);
        await fetchStatus();
      }
    } catch {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStep = async (step: string, data: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/impd/submit-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, data }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || '제출에 실패했습니다');
      } else {
        setSuccess(`${step} 단계가 저장되었습니다`);
        setActiveStep(null);
        await fetchStatus();
      }
    } catch {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    setError(null);
    try {
      const res = await fetch('/api/impd/complete', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '완료 처리에 실패했습니다');
      } else {
        setSuccess(data.message);
        await fetchStatus();
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    } catch {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setCompleting(false);
    }
  };

  // ─ 완료 상태
  if (status?.impdStatus === 'completed') {
    return (
      <div className="min-h-screen bg-[#F3F2F2] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-[#16325C] mb-2">IMPD 검증 완료!</h1>
          <p className="text-sm text-gray-600 mb-6">의지를 증명했습니다. Chopd 멤버십이 활성화되었습니다.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-2.5 bg-[#00A1E0] text-white text-sm font-semibold rounded-lg hover:bg-[#0090C8] transition-colors"
          >
            대시보드로 이동
          </button>
        </div>
      </div>
    );
  }

  // ─ 거부/만료 상태
  if (status?.impdStatus === 'rejected' || status?.isExpired) {
    return (
      <div className="min-h-screen bg-[#F3F2F2] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertIcon className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-[#16325C] mb-2">IMPD 검증 종료</h1>
          <p className="text-sm text-gray-600 mb-2">
            7일 내에 3단계를 완료하지 못했습니다.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            의지 있는 분만 Chopd에서 함께합니다.
          </p>
          <a
            href="mailto:hello@chopd.kr"
            className="block w-full py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            문의하기
          </a>
        </div>
      </div>
    );
  }

  const allCompleted = status?.completedStepsCount === 3;

  return (
    <div className="min-h-screen bg-[#F3F2F2] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#16325C] text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <span style={{ background: '#00A1E0', width: 8, height: 8, borderRadius: '50%', display: 'inline-block' }} />
            IMPD — 의지 검증 프로세스
          </div>
          <h1 className="text-2xl font-bold text-[#16325C] mb-2">Chopd 멤버십 신청</h1>
          <p className="text-sm text-gray-600">
            Chopd를 사용하려면 Townin 회원이어야 합니다.<br />
            7일 안에 3단계를 완료하면 멤버십이 활성화됩니다.
          </p>
        </div>

        {/* Townin 연동 정보 */}
        {status?.towninInfo && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00A1E0]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[#00A1E0] font-bold text-sm">T</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{status.towninInfo.name}</p>
              <p className="text-xs text-gray-500">{status.towninInfo.email} · Townin {status.towninInfo.role}</p>
            </div>
            <span className="flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full" style={{ background: '#00A1E0', color: 'white' }}>
              Townin 연동됨
            </span>
          </div>
        )}

        {/* 데드라인 카운트다운 */}
        {status?.impdStatus === 'in_progress' && status.deadline && (
          <div className={`rounded-xl border p-4 mb-6 flex items-center gap-3 ${
            (status.remainingDays ?? 0) <= 2 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <ClockIcon className={`w-5 h-5 flex-shrink-0 ${(status.remainingDays ?? 0) <= 2 ? 'text-red-500' : 'text-amber-500'}`} />
            <div>
              <p className={`text-sm font-semibold ${(status.remainingDays ?? 0) <= 2 ? 'text-red-700' : 'text-amber-700'}`}>
                남은 시간: {status.remainingDays}일
              </p>
              <p className={`text-xs ${(status.remainingDays ?? 0) <= 2 ? 'text-red-600' : 'text-amber-600'}`}>
                마감: {new Date(status.deadline).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )}

        {/* 에러/성공 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
            {success}
          </div>
        )}

        {/* 시작 전 상태 */}
        {(!status || status.impdStatus === 'none') && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <h2 className="text-lg font-bold text-[#16325C] mb-3">IMPD 검증을 시작하세요</h2>
            <p className="text-sm text-gray-600 mb-6">
              3단계를 7일 안에 완료하면 Chopd 멤버십이 활성화됩니다.<br />
              <strong>7일 안에 완료하지 못하면 신청이 거부됩니다.</strong>
            </p>
            <div className="flex flex-col gap-2 mb-6 text-left">
              {STEPS.map((step, i) => (
                <div key={step.key} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="w-6 h-6 rounded-full bg-[#16325C] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-gray-800">{step.label}</span>
                    <span className="text-gray-500"> — {step.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full py-3 bg-[#16325C] text-white text-sm font-bold rounded-lg hover:bg-[#0d1f3c] disabled:opacity-50 transition-colors"
            >
              {loading ? '시작 중...' : '7일 검증 시작하기'}
            </button>
          </div>
        )}

        {/* 진행 중 상태 */}
        {status?.impdStatus === 'in_progress' && (
          <div className="space-y-3">
            {/* 진행률 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">진행률</span>
                <span className="text-sm font-bold text-[#00A1E0]">{status.completedStepsCount} / {status.totalSteps}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00A1E0] rounded-full transition-all duration-500"
                  style={{ width: `${(status.completedStepsCount / status.totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* 단계 카드 */}
            {STEPS.map((step, i) => {
              const isDone = status.steps[step.key as keyof typeof status.steps] === 'completed';
              const isActive = activeStep === step.key;

              return (
                <div key={step.key} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${isDone ? 'border-green-200' : 'border-gray-200'}`}>
                  <button
                    onClick={() => setActiveStep(isActive ? null : step.key)}
                    disabled={isDone}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 disabled:cursor-default transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {isDone ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      ) : (
                        <CircleIcon className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400">STEP {i + 1}</span>
                        {isDone && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#10b981', color: 'white' }}>완료</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">{step.label}</p>
                      <p className="text-xs text-gray-500">{step.desc}</p>
                    </div>
                    {!isDone && (
                      <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isActive ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    )}
                  </button>

                  {isActive && !isDone && (
                    <div className="border-t border-gray-100 p-4">
                      <step.Form
                        onSubmit={(data) => handleSubmitStep(step.key, data)}
                        loading={loading}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* 최종 완료 버튼 */}
            {allCompleted && (
              <div className="bg-white rounded-xl border border-[#00A1E0] shadow-sm p-6 text-center mt-4">
                <CheckCircleIcon className="w-10 h-10 text-[#00A1E0] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#16325C] mb-2">3단계 모두 완료!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  이제 IMPD 검증을 최종 제출하면 Chopd 멤버십이 활성화됩니다.
                </p>
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="w-full py-3 bg-[#16325C] text-white text-sm font-bold rounded-lg hover:bg-[#0d1f3c] disabled:opacity-50 transition-colors"
                >
                  {completing ? '처리 중...' : '최종 제출 및 멤버십 활성화'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
