import { ExternalLink } from 'lucide-react';
import type { PublicIntegrationEntry } from '@/lib/integrations/public-snapshots';

interface Props {
  integrations: PublicIntegrationEntry[];
  primaryColor?: string;
}

function formatNumber(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000) return n.toLocaleString('ko-KR');
  return String(n);
}

/**
 * 공개 페이지의 "다른 플랫폼에서의 활동" 섹션 — 실시간 연동 기반.
 * Identity Hub 기반의 OtherProjectsSection과 보완적으로 작동.
 */
export function IntegrationProjectsSection({ integrations, primaryColor = '#00A1E0' }: Props) {
  if (integrations.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[#16325C]">
            연결된 플랫폼의 활동
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            다른 프로젝트에서의 실시간 성과를 한눈에 확인하세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {integrations.map((entry) => {
            const s = entry.snapshot!;
            const color = entry.brandColor || primaryColor;
            const profileUrl = s.publicUrl || entry.externalUrl || s.profileUrl;

            return (
              <article
                key={entry.linkId}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {entry.logoUrl ? (
                      <img
                        src={entry.logoUrl}
                        alt={entry.projectName}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        aria-hidden
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ background: color }}
                      >
                        {entry.projectName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#16325C] truncate">
                        {entry.projectName}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{s.displayName}</p>
                    </div>
                  </div>
                  {entry.role && (
                    <span
                      className="text-[10px] font-semibold px-2 py-1 rounded-full flex-shrink-0"
                      style={{ background: color, color: 'white' }}
                    >
                      {entry.role}
                    </span>
                  )}
                </div>

                {/* KPIs */}
                {s.kpis.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {s.kpis.slice(0, 3).map((k) => (
                      <div
                        key={k.key}
                        className="rounded-lg bg-slate-50 border border-gray-100 px-3 py-2 text-center"
                      >
                        <div className="text-lg font-bold text-[#16325C]">
                          {formatNumber(k.value)}
                          {k.unit && (
                            <span className="text-xs font-normal text-gray-500 ml-0.5">
                              {k.unit}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{k.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent items */}
                {s.recentItems.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      최근 활동
                    </p>
                    <ul className="space-y-1">
                      {s.recentItems.slice(0, 3).map((it) => (
                        <li key={it.id} className="text-sm">
                          <a
                            href={it.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gray-700 hover:text-[#00A1E0] truncate block"
                          >
                            • {it.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Footer link */}
                {profileUrl && (
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium"
                    style={{ color }}
                  >
                    {entry.projectName}에서 보기
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {entry.source === 'cache' && (
                  <p className="text-[10px] text-gray-400 mt-2">
                    최근 {entry.lastSyncedAt
                      ? new Date(entry.lastSyncedAt).toLocaleDateString('ko-KR')
                      : ''}{' '}
                    기준
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
