import { db } from '@/lib/db';
import {
  members,
  memberSkills,
  memberGapReports,
  skills,
  type Member,
  type NewMemberGapReport,
} from '@/lib/db/schema';
import { and, eq, ne } from 'drizzle-orm';

type Axis = 'expertise' | 'communication' | 'marketing' | 'operations' | 'data' | 'network';
const AXES: Axis[] = ['expertise', 'communication', 'marketing', 'operations', 'data', 'network'];

interface RadarVec {
  expertise: number;
  communication: number;
  marketing: number;
  operations: number;
  data: number;
  network: number;
}

function emptyRadar(): RadarVec {
  return {
    expertise: 0,
    communication: 0,
    marketing: 0,
    operations: 0,
    data: 0,
    network: 0,
  };
}

async function computeRadarForMember(memberId: number): Promise<{ radar: RadarVec; skillNames: Set<string> }> {
  const rows = await db
    .select({ ms: memberSkills, s: skills })
    .from(memberSkills)
    .leftJoin(skills, eq(memberSkills.skillId, skills.id))
    .where(eq(memberSkills.memberId, memberId))
    .all();

  const radar = emptyRadar();
  const skillNames = new Set<string>();
  const axisCounts = emptyRadar();

  for (const r of rows) {
    if (!r.s) continue;
    skillNames.add(r.s.canonicalName);
    const axis = (r.s.axis as Axis | null) || 'expertise';
    const levelScore = r.ms.level === 'expert' ? 10 : r.ms.level === 'intermediate' ? 6 : 3;
    const yearsBoost = Math.min(3, Math.floor((r.ms.yearsExperience || 0) / 2));
    const val = Math.min(10, levelScore + yearsBoost);
    if (AXES.includes(axis)) {
      radar[axis] = Math.max(radar[axis], val);
      axisCounts[axis] += 1;
    }
  }

  // 1개 이상 skill이 있는 축은 최소 2점은 인정 (보유의 의미)
  for (const a of AXES) {
    if (axisCounts[a] === 0) {
      radar[a] = 0;
    } else {
      radar[a] = Math.max(radar[a], 2);
    }
  }

  return { radar, skillNames };
}

function medianPer(list: number[]): number {
  if (list.length === 0) return 0;
  const sorted = [...list].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function top10PercentAvg(list: number[]): number {
  if (list.length === 0) return 0;
  const sorted = [...list].sort((a, b) => b - a);
  const cut = Math.max(1, Math.ceil(sorted.length * 0.1));
  const top = sorted.slice(0, cut);
  return top.reduce((s, n) => s + n, 0) / top.length;
}

function completenessOf(radar: RadarVec): number {
  const sum = AXES.reduce((s, a) => s + radar[a], 0);
  return Math.round((sum / (AXES.length * 10)) * 100);
}

export async function generateGapReport(memberId: number) {
  const member = await db.select().from(members).where(eq(members.id, memberId)).get();
  if (!member) throw new Error('member not found');

  const { radar: selfRadar, skillNames: selfSkills } = await computeRadarForMember(member.id);

  // 같은 직종 peer
  const profession = member.profession || 'generic';
  const peers = await db
    .select()
    .from(members)
    .where(and(eq(members.profession, profession), ne(members.id, member.id)))
    .all();

  const peerRadars: RadarVec[] = [];
  const peerSkillFreq = new Map<string, number>();

  for (const p of peers) {
    const { radar, skillNames } = await computeRadarForMember(p.id);
    peerRadars.push(radar);
    for (const name of skillNames) {
      peerSkillFreq.set(name, (peerSkillFreq.get(name) || 0) + 1);
    }
  }

  // 축별 median / top10
  const median = emptyRadar();
  const top10 = emptyRadar();
  for (const a of AXES) {
    const vals = peerRadars.map((r) => r[a]).filter((v) => v > 0);
    median[a] = Math.round(medianPer(vals) * 10) / 10;
    top10[a] = Math.round(top10PercentAvg(vals) * 10) / 10;
  }

  // Gaps: peer에서 흔한데 나는 없는 skill
  const peerSize = peers.length;
  const gaps: Array<{
    severity: 'critical' | 'high' | 'medium';
    skill: string;
    reason: string;
    expectedRevenueLoss?: number;
    recommendation?: string;
  }> = [];

  if (peerSize >= 3) {
    const missing = [...peerSkillFreq.entries()]
      .filter(([name, count]) => !selfSkills.has(name) && count / peerSize >= 0.4)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    for (const [name, count] of missing) {
      const share = Math.round((count / peerSize) * 100);
      const severity: 'critical' | 'high' | 'medium' =
        share >= 80 ? 'critical' : share >= 60 ? 'high' : 'medium';
      gaps.push({
        severity,
        skill: name,
        reason: `같은 직종 동료의 ${share}%가 보유하고 있지만, 현재 프로필에는 등록되지 않았습니다.`,
        expectedRevenueLoss: severity === 'critical' ? 380_000 : severity === 'high' ? 180_000 : 80_000,
        recommendation: `이 달란트를 문서로 업로드하거나 서비스 항목에 추가하세요.`,
      });
    }
  } else {
    gaps.push({
      severity: 'medium',
      skill: '동료 표본 부족',
      reason: `같은 직종 "${profession}" 회원이 ${peerSize}명뿐이라 비교 데이터를 확보 중입니다.`,
      recommendation: '회원이 늘어나면 자동으로 더 정확한 갭 분석이 생성됩니다.',
    });
  }

  // Opportunities: 약축(나 < median) 강조
  const opportunities: Array<{ title: string; description: string; recommendation?: string }> = [];
  const axisLabels: Record<Axis, string> = {
    expertise: '전문성',
    communication: '소통',
    marketing: '마케팅',
    operations: '운영',
    data: '데이터',
    network: '네트워크',
  };
  for (const a of AXES) {
    if (selfRadar[a] > 0 && median[a] - selfRadar[a] >= 2) {
      opportunities.push({
        title: `${axisLabels[a]} 역량 보강 기회`,
        description: `동료 중앙값이 ${median[a].toFixed(1)}점인데 당신은 ${selfRadar[a]}점입니다. 관련 문서 1개만 추가해도 점수가 오릅니다.`,
        recommendation: `${axisLabels[a]} 관련 이력/포트폴리오를 MD로 업로드하세요.`,
      });
    }
  }
  if (opportunities.length === 0) {
    opportunities.push({
      title: '모든 축에서 중앙값 이상',
      description: '현재 달란트 분포가 같은 직종 평균을 상회합니다. Pro 티어로 업그레이드해 상위 10% 그룹과 비교해보세요.',
    });
  }

  const score = completenessOf(selfRadar);

  const growthPath = peers
    .filter((p) => true)
    .slice(0, 3)
    .map((p, i) => ({
      step: i + 1,
      title: `비슷하게 시작한 ${axisLabels.expertise} 강자 #${i + 1}`,
      hint: '그들이 6개월 안에 추가한 달란트 경로가 여기에 표시됩니다.',
    }));

  const payload: NewMemberGapReport = {
    tenantId: member.tenantId || 1,
    memberId: member.id,
    profession,
    completenessScore: score,
    radarSelf: JSON.stringify(selfRadar),
    radarMedian: JSON.stringify(median),
    radarTop10: JSON.stringify(top10),
    gapsJson: JSON.stringify(gaps),
    opportunitiesJson: JSON.stringify(opportunities),
    growthPathJson: JSON.stringify(growthPath),
    peerSampleSize: peerSize,
  };

  const [row] = await db.insert(memberGapReports).values(payload).returning();
  return row;
}
