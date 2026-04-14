// ChannelHub — Server Component
// 테넌트 SNS 계정별 활성화 점수 링 게이지 UI

import { scoreChannel } from '@/lib/pomelli/channel-score';
import type { SnsAccount } from '@/lib/db/schema';

// ---- 배지 색상 맵 ----
const GRADE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  active:      { label: '활성',    bg: '#22C55E', text: '#fff' },
  warming:     { label: '육성중',  bg: '#F59E0B', text: '#fff' },
  dormant:     { label: '휴면',    bg: '#9CA3AF', text: '#fff' },
  unconnected: { label: '미연결',  bg: '#E5E7EB', text: '#6B7280' },
};

// ---- SVG 링 게이지 ----
function RingGauge({
  score,
  color,
  size = 80,
}: {
  score: number;
  color: string;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.35;           // 28 for size=80
  const strokeWidth = size * 0.075;     // 6 for size=80
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`활성화 점수 ${score}%`}
    >
      {/* 배경 트랙 */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke="#E5E7EB"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* 활성화 진행 */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      {/* 중앙 점수 텍스트 */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.2}
        fontWeight="700"
        fill="#111827"
      >
        {score}
      </text>
    </svg>
  );
}

// ---- 채널 카드 ----
function ChannelCard({
  score,
}: {
  score: ReturnType<typeof scoreChannel>;
}) {
  const badge = GRADE_BADGE[score.grade] ?? GRADE_BADGE.unconnected;

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* 링 게이지 */}
      <RingGauge score={score.score} color={score.color} />

      {/* 플랫폼 라벨 */}
      <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
        {score.label}
      </span>

      {/* 등급 배지 */}
      <span
        className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold"
        style={{ background: badge.bg, color: badge.text }}
      >
        {badge.label}
      </span>

      {/* CTA */}
      <p className="text-[11px] text-gray-500 text-center leading-tight">
        {score.nextAction}
      </p>
    </div>
  );
}

// ---- 메인 섹션 ----
interface ChannelHubProps {
  snsAccounts: SnsAccount[];
  snsHistory?: Array<{
    platform: string;
    status: string;
    createdAt: Date | null;
  }>;
}

export function ChannelHub({ snsAccounts, snsHistory = [] }: ChannelHubProps) {
  // 빈 상태
  if (snsAccounts.length === 0) {
    return (
      <section className="mt-6 mb-2">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">채널 활성화</h2>
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-8 text-center">
          {/* 링크 아이콘 */}
          <svg
            className="w-8 h-8 mx-auto mb-3 text-gray-300"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
          <p className="text-sm text-gray-500">연결된 채널이 없습니다.</p>
          <p className="text-xs text-gray-400 mt-1">
            <span className="font-medium text-gray-500">/pd/sns-accounts</span>에서 SNS 계정을 추가하세요.
          </p>
        </div>
      </section>
    );
  }

  // snsHistory에서 플랫폼별 최신 성공 날짜 + 30일 게시 횟수 계산
  const now = Date.now();
  const ms30d = 30 * 24 * 60 * 60 * 1000;

  const historyMap: Record<string, { lastPostAt: Date | null; postCount30d: number }> = {};
  for (const h of snsHistory) {
    if (h.status !== 'published' && h.status !== 'success') continue;
    const date = h.createdAt ? new Date(h.createdAt) : null;
    if (!date) continue;

    const key = h.platform;
    if (!historyMap[key]) {
      historyMap[key] = { lastPostAt: null, postCount30d: 0 };
    }

    // 가장 최신 날짜
    if (!historyMap[key].lastPostAt || date > historyMap[key].lastPostAt!) {
      historyMap[key].lastPostAt = date;
    }

    // 30일 이내 카운트
    if (now - date.getTime() <= ms30d) {
      historyMap[key].postCount30d += 1;
    }
  }

  // 점수 계산
  const scores = snsAccounts.map((account) => {
    const hist = historyMap[account.platform] ?? { lastPostAt: null, postCount30d: 0 };
    return scoreChannel({
      platform: account.platform,
      isActive: account.isActive ?? false,
      lastPostAt: hist.lastPostAt,
      postCount30d: hist.postCount30d,
    });
  });

  // 점수 내림차순 정렬
  scores.sort((a, b) => b.score - a.score);

  // 전체 평균 점수
  const avgScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);

  return (
    <section className="mt-6 mb-2">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">채널 활성화</h2>
        <span className="text-xs text-gray-500">
          전체 평균{' '}
          <span className="font-bold text-gray-800">{avgScore}%</span>
        </span>
      </div>

      {/* 카드 그리드: 모바일 2열, 데스크톱 4열 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {scores.map((s) => (
          <ChannelCard key={s.platform} score={s} />
        ))}
      </div>
    </section>
  );
}
