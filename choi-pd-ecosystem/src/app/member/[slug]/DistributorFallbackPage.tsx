import Link from 'next/link';
import { IntegrationProjectsSection } from '@/app/p/[slug]/sections/IntegrationProjectsSection';
import type { PublicIntegrationEntry } from '@/lib/integrations/public-snapshots';

/**
 * distributors 테이블에 등록된 회원을 /choi 레이아웃으로 공개 렌더.
 * - /choi 의 섹션 구조(Hero / KPI Bar / Trust / Campaigns / Channels / Contact)를 그대로 따름
 * - 데이터 소스: distributor 기본정보 + identity.md 파싱 결과
 * - CSS 변수(--choi-*)는 /choi/layout.tsx 에서만 주입되므로 여기선 <style>로 동일값 로컬 주입
 */

interface ParsedIdentity {
  agenda?: string | null;
  tone?: string[];
  keywords?: string[];
  target?: string[];
  usp?: string[];
  antiPatterns?: string[];
  heroCopy?: string | null;
  hashtags?: string[];
  mentions?: string[];
  sections?: Array<{ title: string; preview: string }>;
}

interface Props {
  slug: string;
  name: string;
  email: string;
  region: string | null;
  businessType: 'individual' | 'company' | 'organization';
  identity: ParsedIdentity | null;
  status: string;
  updatedAt: Date | null;
  integrations?: PublicIntegrationEntry[];
}

// /choi/layout.tsx에서 주입되는 brand 토큰과 동일 값
// (추후 회원별 brand 커스텀이 생기면 여기에 distributor.themeConfig 주입)
const DEFAULT_BRAND = {
  primary: '#D32F2F',
  primaryDark: '#B71C1C',
  accent: '#FF6F00',
  accentSoft: '#FFE5D0',
  secondary: '#00897B',
  secondarySoft: '#D6F0EC',
  trust: '#1A237E',
  trustSoft: '#E3E6F5',
  surface: '#FAFAFA',
  ink: '#1F2937',
  inkMuted: '#6B7280',
  border: '#E5E7EB',
};

const BUSINESS_LABEL: Record<Props['businessType'], string> = {
  individual: '개인',
  company: '기업',
  organization: '기관/단체',
};

const STATUS_CONFIG: Record<string, { text: string; color: string; live: boolean }> = {
  pending: { text: '심사 중', color: '#F59E0B', live: false },
  approved: { text: 'imPD 검증 회원', color: '#00A1E0', live: true },
  active: { text: '지금 활동 중', color: '#10B981', live: true },
  suspended: { text: '일시정지', color: '#6B7280', live: false },
  rejected: { text: '미승인', color: '#EF4444', live: false },
};

export function DistributorFallbackPage({
  slug,
  name,
  email,
  region,
  businessType,
  identity,
  status,
  updatedAt,
  integrations = [],
}: Props) {
  const st = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const agenda = identity?.agenda?.trim() || null;
  const heroCopy = identity?.heroCopy?.trim() || null;
  const tone = identity?.tone || [];
  const keywords = identity?.keywords || [];
  const target = identity?.target || [];
  const usp = identity?.usp || [];
  const mentions = identity?.mentions || [];
  const hashtags = identity?.hashtags || [];
  const sections = identity?.sections || [];

  // KPI 계산 (파싱 결과 기반)
  const identityCompleteness = calcCompleteness({ agenda, tone, keywords, target, usp });
  const kpis = [
    { value: `${tone.length + keywords.length}`, label: '브랜드 키워드' },
    { value: `${target.length}`, label: '타겟 고객' },
    { value: `${usp.length}`, label: '차별점' },
    { value: `${mentions.length}`, label: '수상·소속', accent: true },
    { value: BUSINESS_LABEL[businessType], label: '사업 유형', accent: true },
    { value: `${identityCompleteness}%`, label: '정체성 완성도' },
  ];

  return (
    <>
      {/* CSS 변수 로컬 주입 (choi/layout.tsx와 동일 값) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .member-scope {
            --choi-primary: ${DEFAULT_BRAND.primary};
            --choi-primary-dark: ${DEFAULT_BRAND.primaryDark};
            --choi-accent: ${DEFAULT_BRAND.accent};
            --choi-accent-soft: ${DEFAULT_BRAND.accentSoft};
            --choi-secondary: ${DEFAULT_BRAND.secondary};
            --choi-secondary-soft: ${DEFAULT_BRAND.secondarySoft};
            --choi-trust: ${DEFAULT_BRAND.trust};
            --choi-trust-soft: ${DEFAULT_BRAND.trustSoft};
            --choi-surface: ${DEFAULT_BRAND.surface};
            --choi-ink: ${DEFAULT_BRAND.ink};
            --choi-ink-muted: ${DEFAULT_BRAND.inkMuted};
            --choi-border: ${DEFAULT_BRAND.border};
            background: var(--choi-surface);
            color: var(--choi-ink);
            min-height: 100vh;
          }
        `,
        }}
      />

      <div className="member-scope">
        {/* Hero */}
        <section
          style={{
            position: 'relative',
            background:
              'linear-gradient(105deg, var(--choi-primary) 0%, var(--choi-primary-dark) 55%, var(--choi-trust) 100%)',
            color: 'white',
            padding: '3rem 1.5rem 4rem',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.15), transparent 55%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.25), transparent 60%)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2 }}>
            {/* 배지 스트립 */}
            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: 22,
              }}
            >
              {st.live && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'var(--choi-secondary)',
                    color: 'white',
                    padding: '5px 12px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: '#B7F5C9',
                      boxShadow: '0 0 10px #B7F5C9',
                    }}
                  />
                  LIVE · {st.text}
                </span>
              )}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255,255,255,0.95)',
                  color: '#00A1E0',
                  padding: '5px 12px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                ✓ imPD · {BUSINESS_LABEL[businessType]}
              </span>
              {region && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(0,0,0,0.28)',
                    color: 'white',
                    padding: '5px 12px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  {region}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gap: 32, gridTemplateColumns: '1fr', alignItems: 'center' }}>
              <div>
                <h1
                  style={{
                    fontSize: 54,
                    fontWeight: 900,
                    margin: '0 0 0.75rem',
                    lineHeight: 1.05,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {name}
                </h1>
                {agenda && (
                  <p
                    style={{
                      fontSize: 17,
                      opacity: 0.95,
                      marginBottom: 4,
                      fontWeight: 500,
                    }}
                  >
                    {agenda}
                  </p>
                )}
                <p style={{ fontSize: 14, opacity: 0.8, marginBottom: '1.25rem' }}>
                  impd.me/{slug} · {email}
                </p>
                {heroCopy && (
                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      maxWidth: 620,
                      lineHeight: 1.55,
                      borderLeft: '3px solid rgba(255,255,255,0.4)',
                      paddingLeft: 14,
                    }}
                  >
                    "{heroCopy}"
                  </p>
                )}

                {/* CTA */}
                <div style={{ display: 'flex', gap: 12, marginTop: '2rem', flexWrap: 'wrap' }}>
                  <a
                    href="#contact"
                    style={{
                      background: 'var(--choi-accent)',
                      color: 'white',
                      padding: '12px 22px',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(255,111,0,0.35)',
                    }}
                  >
                    문의하기 →
                  </a>
                  {usp.length > 0 && (
                    <a
                      href="#usp"
                      style={{
                        background: 'rgba(255,255,255,0.15)',
                        color: 'white',
                        padding: '12px 22px',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        textDecoration: 'none',
                        border: '1px solid rgba(255,255,255,0.4)',
                      }}
                    >
                      차별점 보기
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KPI 바 */}
        <section
          style={{
            maxWidth: 1140,
            margin: '-28px auto 0',
            background: 'white',
            borderRadius: 8,
            boxShadow: '0 6px 20px rgba(22,50,92,0.1)',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              padding: '1.25rem 0',
            }}
          >
            {kpis.map((k, i) => (
              <Kpi
                key={k.label}
                value={k.value}
                label={k.label}
                accent={k.accent}
                last={i === kpis.length - 1}
              />
            ))}
          </div>
        </section>

        {/* 차별점 (USP) */}
        {usp.length > 0 && (
          <section id="usp" style={{ padding: '3rem 1.5rem 2rem', background: 'var(--choi-surface)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: 'var(--choi-trust)',
                  borderBottom: '3px solid var(--choi-primary)',
                  display: 'inline-block',
                  paddingBottom: 4,
                  marginBottom: '1.25rem',
                }}
              >
                차별점 · Unique Value
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))',
                  gap: '1rem',
                }}
              >
                {usp.map((u, i) => (
                  <article
                    key={`${i}-${u}`}
                    style={{
                      border: '1px solid var(--choi-border)',
                      borderLeft: '4px solid var(--choi-primary)',
                      borderRadius: 6,
                      padding: '1rem 1.25rem',
                      background: 'white',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--choi-primary)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      VALUE · {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: 'var(--choi-ink)',
                        margin: '6px 0 0',
                        lineHeight: 1.4,
                      }}
                    >
                      {u}
                    </h3>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 타겟 고객 + 톤 앤 매너 */}
        {(target.length > 0 || tone.length > 0 || keywords.length > 0) && (
          <section style={{ padding: '2rem 1.5rem', background: 'var(--choi-surface)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginBottom: '1.25rem',
                }}
              >
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: 'var(--choi-trust)',
                    borderBottom: '3px solid var(--choi-primary)',
                    display: 'inline-block',
                    paddingBottom: 4,
                    margin: 0,
                  }}
                >
                  브랜드 정체성
                </h2>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1rem',
                }}
              >
                <ChipCard
                  title="타겟 고객"
                  subtitle="AUDIENCE"
                  items={target}
                  badgeBg="var(--choi-secondary)"
                  chipBg="var(--choi-secondary-soft)"
                  chipFg="var(--choi-secondary)"
                />
                <ChipCard
                  title="톤 앤 매너"
                  subtitle="TONE"
                  items={tone}
                  badgeBg="var(--choi-trust)"
                  chipBg="var(--choi-trust-soft)"
                  chipFg="var(--choi-trust)"
                />
                <ChipCard
                  title="핵심 키워드"
                  subtitle="KEYWORDS"
                  items={keywords}
                  badgeBg="var(--choi-accent)"
                  chipBg="var(--choi-accent-soft)"
                  chipFg="var(--choi-accent)"
                />
              </div>
            </div>
          </section>
        )}

        {/* 섹션 아웃라인 (identity 섹션들) */}
        {sections.length > 0 && (
          <section style={{ padding: '2rem 1.5rem', background: 'var(--choi-surface)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginBottom: '1.25rem',
                }}
              >
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: 'var(--choi-trust)',
                    borderBottom: '3px solid var(--choi-primary)',
                    display: 'inline-block',
                    paddingBottom: 4,
                    margin: 0,
                  }}
                >
                  소개
                </h2>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
                  gap: '2rem',
                }}
              >
                <div>
                  {sections.slice(0, 8).map((s, i) => (
                    <div
                      key={`${i}-${s.title}`}
                      style={{
                        marginBottom: '0.9rem',
                        padding: '0.9rem 1rem',
                        background: 'white',
                        border: '1px solid var(--choi-border)',
                        borderRadius: 6,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: 'var(--choi-ink)',
                          marginBottom: 4,
                        }}
                      >
                        {s.title}
                      </div>
                      {s.preview && (
                        <div
                          style={{
                            fontSize: 12,
                            color: 'var(--choi-ink-muted)',
                            lineHeight: 1.5,
                          }}
                        >
                          {s.preview}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <aside
                  style={{
                    background: 'var(--choi-primary)',
                    color: 'white',
                    padding: '1.25rem',
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      marginBottom: 8,
                    }}
                  >
                    IDENTITY HIGHLIGHT
                  </div>
                  {mentions.length > 0 && (
                    <div style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>
                      <strong>📌 수상·소속:</strong> {mentions.slice(0, 3).join(', ')}
                    </div>
                  )}
                  {hashtags.length > 0 && (
                    <div style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>
                      <strong>#️⃣ 해시태그:</strong> {hashtags.slice(0, 5).join(' ')}
                    </div>
                  )}
                  <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                    <strong>✓ 완성도:</strong> {identityCompleteness}%
                  </div>
                  {updatedAt && (
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.7)',
                      }}
                    >
                      업데이트 {new Date(updatedAt).toLocaleDateString('ko-KR')}
                    </div>
                  )}
                </aside>
              </div>
            </div>
          </section>
        )}

        {/* Integration Projects — 연결된 플랫폼의 실시간 활동 */}
        {integrations.length > 0 && (
          <IntegrationProjectsSection integrations={integrations} />
        )}

        {/* Contact */}
        <section
          id="contact"
          style={{ padding: '3rem 1.5rem', background: 'var(--choi-trust-soft)' }}
        >
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: 'var(--choi-trust)',
                marginBottom: 12,
              }}
            >
              {name} 님에게 문의
            </h2>
            <p
              style={{
                fontSize: 15,
                color: 'var(--choi-ink-muted)',
                marginBottom: '1.5rem',
                lineHeight: 1.6,
              }}
            >
              imPD 에 검증된 회원입니다. 협업·출강·의뢰는 아래 경로로 연락 주세요.
            </p>
            <div
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <a
                href={`mailto:${email}`}
                style={{
                  background: 'var(--choi-primary)',
                  color: 'white',
                  padding: '12px 28px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                이메일 문의
              </a>
              <Link
                href="/"
                style={{
                  background: 'white',
                  color: 'var(--choi-trust)',
                  padding: '12px 28px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: '1px solid var(--choi-border)',
                }}
              >
                imPD 홈
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function Kpi({
  value,
  label,
  accent,
  last,
}: {
  value: string;
  label: string;
  accent?: boolean;
  last?: boolean;
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '0.5rem 0.75rem',
        borderRight: last ? 'none' : '1px solid var(--choi-border)',
      }}
    >
      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: accent ? 'var(--choi-accent)' : 'var(--choi-trust)',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          color: 'var(--choi-ink-muted)',
          marginTop: 3,
          letterSpacing: '0.03em',
        }}
      >
        {label}
      </div>
    </div>
  );
}

function ChipCard({
  title,
  subtitle,
  items,
  badgeBg,
  chipBg,
  chipFg,
}: {
  title: string;
  subtitle: string;
  items: string[];
  badgeBg: string;
  chipBg: string;
  chipFg: string;
}) {
  if (!items || items.length === 0) {
    return (
      <article
        style={{
          border: '1px dashed var(--choi-border)',
          borderRadius: 6,
          padding: '1rem 1.25rem',
          background: 'white',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            background: 'var(--choi-border)',
            color: 'var(--choi-ink-muted)',
            fontSize: 10,
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 999,
          }}
        >
          {subtitle}
        </span>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            margin: '8px 0 4px',
            color: 'var(--choi-ink-muted)',
          }}
        >
          {title}
        </h3>
        <p style={{ fontSize: 12, color: 'var(--choi-ink-muted)' }}>
          identity.md 에 섹션을 추가하면 여기에 자동 반영됩니다.
        </p>
      </article>
    );
  }
  return (
    <article
      style={{
        border: '1px solid var(--choi-border)',
        borderRadius: 6,
        padding: '1rem 1.25rem',
        background: 'white',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          background: badgeBg,
          color: 'white',
          fontSize: 10,
          fontWeight: 700,
          padding: '3px 10px',
          borderRadius: 999,
        }}
      >
        {subtitle}
      </span>
      <h3
        style={{
          fontSize: 15,
          fontWeight: 700,
          margin: '8px 0 8px',
          color: 'var(--choi-ink)',
        }}
      >
        {title}
      </h3>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {items.slice(0, 10).map((v, i) => (
          <span
            key={`${i}-${v}`}
            style={{
              background: chipBg,
              color: chipFg,
              fontSize: 11,
              padding: '3px 10px',
              borderRadius: 4,
              fontWeight: 600,
            }}
          >
            {v}
          </span>
        ))}
      </div>
    </article>
  );
}

function calcCompleteness(fields: {
  agenda: string | null;
  tone: string[];
  keywords: string[];
  target: string[];
  usp: string[];
}): number {
  const required = [
    fields.agenda,
    fields.tone.length > 0 ? 'y' : null,
    fields.keywords.length > 0 ? 'y' : null,
    fields.target.length > 0 ? 'y' : null,
    fields.usp.length > 0 ? 'y' : null,
  ];
  const filled = required.filter(Boolean).length;
  return Math.round((filled / required.length) * 100);
}
