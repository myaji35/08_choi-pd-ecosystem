'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  User,
  FileText,
  BarChart3,
  ExternalLink,
  Upload,
  Sparkles,
  Trash2,
  RefreshCw,
  Activity,
} from 'lucide-react';
import MonitorTab from './MonitorTab';

interface MemberLite {
  id: number;
  slug: string;
  name: string;
  email: string;
  profession: string | null;
  businessType: string | null;
  region: string | null;
  status: string | null;
  bio: string | null;
  profileImage: string | null;
  themeConfig: string | null;
  createdAt: Date | string | null;
}

interface DocumentRow {
  id: number;
  filename: string;
  title: string | null;
  category: string;
  sizeBytes: number | null;
  parsedAt: Date | string | null;
  extractedSkillsCount: number | null;
  uploadedAt: Date | string;
}

interface SkillRow {
  id: number;
  skillId: number;
  canonicalName: string;
  category: string;
  axis: string | null;
  level: string;
  yearsExperience: number | null;
  weight: number;
  source: string;
}

interface GapReport {
  id: number;
  completenessScore: number | null;
  radarSelf: string;
  radarMedian: string;
  radarTop10: string;
  gapsJson: string;
  opportunitiesJson: string;
  growthPathJson: string;
  peerSampleSize: number | null;
  generatedAt: Date | string;
}

const TABS = [
  { key: 'monitor', label: '활동 모니터링', icon: Activity },
  { key: 'profile', label: '프로필', icon: User },
  { key: 'talents', label: '달란트 & 문서', icon: FileText },
  { key: 'gap', label: '갭 리포트', icon: BarChart3 },
  { key: 'preview', label: '공개 페이지 미리보기', icon: ExternalLink },
] as const;

function formatDate(d: Date | string | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('ko-KR');
}

function formatSize(bytes: number | null) {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseRadar(json: string): Record<string, number> {
  try {
    return JSON.parse(json) || {};
  } catch {
    return {};
  }
}

export default function MemberDetailClient({
  initialTab,
  member,
  documents,
  skills,
  gapReport,
}: {
  initialTab: string;
  member: MemberLite;
  documents: DocumentRow[];
  skills: SkillRow[];
  gapReport: GapReport | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState(initialTab);
  const [uploading, setUploading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const hardSkills = skills.filter((s) => s.category === 'hard');
  const metaSkills = skills.filter((s) => s.category === 'meta');
  const contextSkills = skills.filter((s) => s.category === 'context');

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setActionError(null);
    try {
      for (const file of Array.from(files)) {
        const text = await file.text();
        const res = await fetch(`/api/admin/members/${member.slug}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentMd: text,
            sizeBytes: file.size,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || `${file.name} 업로드 실패`);
        }
      }
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  const handleReparse = async (docId: number) => {
    try {
      await fetch(`/api/admin/members/${member.slug}/documents/${docId}/parse`, {
        method: 'POST',
      });
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '재파싱 실패');
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm('이 문서를 삭제하시겠습니까?')) return;
    try {
      await fetch(`/api/admin/members/${member.slug}/documents/${docId}`, {
        method: 'DELETE',
      });
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '삭제 실패');
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/members/${member.slug}/gap-report/generate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || '리포트 생성 실패');
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '리포트 생성 실패');
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/members')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          회원 관리
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {member.name}{' '}
            <span className="text-sm font-mono text-gray-500">impd.me/{member.slug}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {member.email} · {member.profession || '직종 미지정'} · {member.status}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={`/member/${member.slug}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-1" />
            공개 페이지
          </a>
        </Button>
      </div>

      {/* 탭 */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? 'border-[#00A1E0] text-[#00A1E0]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {actionError && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {actionError}
        </div>
      )}

      {/* Tab: 활동 모니터링 */}
      {tab === 'monitor' && <MonitorTab slug={member.slug} />}

      {/* Tab A: 프로필 */}
      {tab === 'profile' && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>회원 프로필 · 브랜드 DNA</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-600 font-semibold mb-1">이름</dt>
                <dd>{member.name}</dd>
              </div>
              <div>
                <dt className="text-gray-600 font-semibold mb-1">이메일</dt>
                <dd>{member.email}</dd>
              </div>
              <div>
                <dt className="text-gray-600 font-semibold mb-1">직종</dt>
                <dd>{member.profession || '-'}</dd>
              </div>
              <div>
                <dt className="text-gray-600 font-semibold mb-1">지역</dt>
                <dd>{member.region || '-'}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-gray-600 font-semibold mb-1">소개</dt>
                <dd className="whitespace-pre-line">{member.bio || '-'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Tab B: 달란트 & 문서 */}
      {tab === 'talents' && (
        <div className="space-y-6">
          {/* 달란트 */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                달란트 ({skills.length})
              </CardTitle>
              <CardDescription>문서에서 자동 추출되거나 수동 등록된 역량</CardDescription>
            </CardHeader>
            <CardContent>
              {skills.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">
                  아직 추출된 달란트가 없습니다. 아래에서 문서를 업로드하세요.
                </p>
              ) : (
                <div className="space-y-4">
                  {[
                    { title: 'Hard Skills', arr: hardSkills, color: 'bg-blue-100 text-blue-700' },
                    { title: 'Meta Skills', arr: metaSkills, color: 'bg-purple-100 text-purple-700' },
                    { title: 'Context', arr: contextSkills, color: 'bg-amber-100 text-amber-700' },
                  ].map((group) =>
                    group.arr.length > 0 ? (
                      <div key={group.title}>
                        <div className="text-xs font-semibold text-gray-600 mb-2">{group.title}</div>
                        <div className="flex flex-wrap gap-2">
                          {group.arr.map((s) => (
                            <Badge key={s.id} className={group.color}>
                              {s.canonicalName}
                              {s.yearsExperience ? ` · ${s.yearsExperience}년` : ''}
                              <span className="ml-1 opacity-60 text-[10px]">
                                [{s.level === 'expert' ? '전문가' : s.level === 'intermediate' ? '중급' : '초급'}]
                              </span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 문서 */}
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  문서 자료실 ({documents.length})
                </CardTitle>
                <CardDescription>
                  MD 파일을 업로드하면 달란트·경력·고객사가 자동 추출됩니다
                </CardDescription>
              </div>
              <div>
                <label className="inline-flex items-center gap-2 px-3 py-2 bg-[#00A1E0] text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#0082B3]">
                  <Upload className="h-4 w-4" />
                  {uploading ? '업로드 중...' : 'MD 업로드'}
                  <input
                    type="file"
                    accept=".md,text/markdown"
                    multiple
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files)}
                  />
                </label>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  아직 업로드된 문서가 없습니다.
                  <br />
                  위 버튼으로 .md 파일을 올려주세요.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {documents.map((d) => (
                    <li key={d.id} className="py-3 flex items-start gap-3">
                      <FileText className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">
                            {d.title || d.filename}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {d.category}
                          </Badge>
                          <span className="text-xs text-gray-500">{formatSize(d.sizeBytes)}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          자동추출 달란트 {d.extractedSkillsCount || 0}개 ·{' '}
                          {d.parsedAt ? `파싱 ${formatDate(d.parsedAt)}` : '파싱 대기'} ·{' '}
                          업로드 {formatDate(d.uploadedAt)}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReparse(d.id)}
                          title="재파싱"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(d.id)}
                          title="삭제"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab C: 갭 리포트 */}
      {tab === 'gap' && (
        <GapReportTab
          report={gapReport}
          onGenerate={handleGenerateReport}
          generating={generatingReport}
        />
      )}

      {/* Tab D: 공개 페이지 미리보기 */}
      {tab === 'preview' && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>공개 페이지 미리보기</CardTitle>
            <CardDescription>
              impd.me/{member.slug} — 실제 방문자가 보는 페이지
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-[4/3] rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
              <iframe
                src={`/member/${member.slug}`}
                title="공개 페이지 미리보기"
                className="w-full h-full border-0"
              />
            </div>
            <p className="text-xs text-gray-500 mt-3">
              미리보기에 문제가 있다면{' '}
              <a
                href={`/member/${member.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                새 탭에서 열기
              </a>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function GapReportTab({
  report,
  onGenerate,
  generating,
}: {
  report: GapReport | null;
  onGenerate: () => void;
  generating: boolean;
}) {
  if (!report) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            달란트 갭 리포트
          </CardTitle>
          <CardDescription>
            같은 직종 회원들과 비교해 부족한 달란트와 개선 기회를 자동 분석합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            아직 생성된 리포트가 없습니다.
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={onGenerate} disabled={generating}>
              <Sparkles className="h-4 w-4 mr-1" />
              {generating ? '생성 중...' : '지금 리포트 생성'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const self = parseRadar(report.radarSelf);
  const median = parseRadar(report.radarMedian);
  const top10 = parseRadar(report.radarTop10);
  const gaps = (() => {
    try {
      return JSON.parse(report.gapsJson) as Array<{
        severity: 'critical' | 'high' | 'medium';
        skill: string;
        reason: string;
        expectedRevenueLoss?: number;
        recommendation?: string;
      }>;
    } catch {
      return [];
    }
  })();
  const opportunities = (() => {
    try {
      return JSON.parse(report.opportunitiesJson) as Array<{
        title: string;
        description: string;
        recommendation?: string;
      }>;
    } catch {
      return [];
    }
  })();

  const sevColor: Record<string, string> = {
    critical: 'bg-red-50 border-red-200 text-red-700',
    high: 'bg-orange-50 border-orange-200 text-orange-700',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-200">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              포트폴리오 완성도
            </CardTitle>
            <CardDescription>
              같은 직종 {report.peerSampleSize}명과 비교 · 생성 {formatDate(report.generatedAt)}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-gray-900">{report.completenessScore}%</div>
            <div className="text-xs text-gray-500">완성도</div>
          </div>
        </CardHeader>
        <CardContent>
          <RadarChart self={self} median={median} top10={top10} />
        </CardContent>
      </Card>

      {gaps.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">🎯 개선 필요 갭</h3>
          {gaps.map((g, i) => (
            <div
              key={i}
              className={`border rounded-lg p-4 ${sevColor[g.severity] || sevColor.medium}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-white/60">
                  {g.severity === 'critical' ? 'CRITICAL' : g.severity === 'high' ? 'HIGH' : 'MEDIUM'}
                </Badge>
                <span className="font-bold">{g.skill}</span>
              </div>
              <p className="text-sm mb-2">{g.reason}</p>
              {g.expectedRevenueLoss && (
                <p className="text-xs opacity-80">
                  예상 매출 손실: 월 ₩
                  {g.expectedRevenueLoss.toLocaleString('ko-KR')}
                </p>
              )}
              {g.recommendation && (
                <p className="text-xs mt-2 font-semibold">→ {g.recommendation}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {opportunities.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">💡 기회</h3>
          {opportunities.map((o, i) => (
            <div key={i} className="border border-cyan-200 bg-cyan-50 rounded-lg p-4">
              <div className="font-bold text-cyan-900 mb-1">{o.title}</div>
              <p className="text-sm text-cyan-800">{o.description}</p>
              {o.recommendation && (
                <p className="text-xs mt-2 text-cyan-700 font-semibold">→ {o.recommendation}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onGenerate} disabled={generating} variant="outline">
          <RefreshCw className="h-4 w-4 mr-1" />
          {generating ? '재생성 중...' : '리포트 재생성'}
        </Button>
      </div>
    </div>
  );
}

function RadarChart({
  self,
  median,
  top10,
}: {
  self: Record<string, number>;
  median: Record<string, number>;
  top10: Record<string, number>;
}) {
  const axes = ['expertise', 'communication', 'marketing', 'operations', 'data', 'network'] as const;
  const labels: Record<string, string> = {
    expertise: '전문성',
    communication: '소통',
    marketing: '마케팅',
    operations: '운영',
    data: '데이터',
    network: '네트워크',
  };
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const max = 10;
  const radius = 120;

  const toPoint = (value: number, idx: number) => {
    const angle = (Math.PI * 2 * idx) / axes.length - Math.PI / 2;
    const r = (Math.min(value, max) / max) * radius;
    return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
  };

  const poly = (data: Record<string, number>) =>
    axes.map((a, i) => toPoint(data[a] || 0, i)).join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-72 h-72">
        {/* 배경 격자 */}
        {[0.25, 0.5, 0.75, 1].map((scale, i) => (
          <polygon
            key={i}
            points={axes
              .map((_, idx) => {
                const angle = (Math.PI * 2 * idx) / axes.length - Math.PI / 2;
                const r = radius * scale;
                return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
              })
              .join(' ')}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        ))}
        {/* 축 선 */}
        {axes.map((_, idx) => {
          const angle = (Math.PI * 2 * idx) / axes.length - Math.PI / 2;
          return (
            <line
              key={idx}
              x1={cx}
              y1={cy}
              x2={cx + Math.cos(angle) * radius}
              y2={cy + Math.sin(angle) * radius}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          );
        })}
        {/* Top 10% */}
        <polygon points={poly(top10)} fill="rgba(147,51,234,0.08)" stroke="#9333EA" strokeDasharray="3 3" />
        {/* 중앙값 */}
        <polygon points={poly(median)} fill="rgba(156,163,175,0.1)" stroke="#9CA3AF" strokeDasharray="4 2" />
        {/* 나 */}
        <polygon points={poly(self)} fill="rgba(0,161,224,0.2)" stroke="#00A1E0" strokeWidth="2" />
        {/* 라벨 */}
        {axes.map((a, idx) => {
          const angle = (Math.PI * 2 * idx) / axes.length - Math.PI / 2;
          return (
            <text
              key={a}
              x={cx + Math.cos(angle) * (radius + 20)}
              y={cy + Math.sin(angle) * (radius + 20) + 4}
              textAnchor="middle"
              className="text-xs fill-gray-700 font-semibold"
            >
              {labels[a]}
            </text>
          );
        })}
      </svg>
      <div className="flex gap-4 text-xs mt-2">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-[#00A1E0] rounded" />
          나
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-gray-400 rounded" />
          동료 중앙값
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-purple-600 rounded" />
          상위 10%
        </span>
      </div>
    </div>
  );
}
