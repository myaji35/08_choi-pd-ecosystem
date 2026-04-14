// Pomelli 살아있는 프로필 프로토타입 — ThemeInjector가 주입한 14 토큰으로 렌더
import { getSeedProfile } from '@/lib/seed/choipd-dna';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ThemeInjector } from '@/components/theme/ThemeInjector';
import type { BaseColors } from '@/lib/theme/types';

interface Props {
  params: Promise<{ username: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const HEX = /^#[0-9a-fA-F]{6}$/;

function pickColor(sp: Record<string, string | string[] | undefined> | undefined, key: string, fallback: string): string {
  const v = sp?.[key];
  const s = Array.isArray(v) ? v[0] : v;
  return s && HEX.test(s) ? s : fallback;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = getSeedProfile(username);
  if (!profile) return { title: 'Profile Not Found' };
  return {
    title: `${profile.meta.koreanName} | Pomelli DNA Profile`,
    description: profile.tagline,
    themeColor: profile.baseColors.primary,
  };
}

export default async function DnaProfilePage({ params, searchParams }: Props) {
  const { username } = await params;
  const profile = getSeedProfile(username);
  if (!profile) notFound();

  const sp = searchParams ? await searchParams : undefined;
  const baseColors: BaseColors = {
    primary: pickColor(sp, 'primary', profile.baseColors.primary) as BaseColors['primary'],
    trust: pickColor(sp, 'trust', profile.baseColors.trust) as BaseColors['trust'],
    secondary: pickColor(sp, 'secondary', profile.baseColors.secondary) as BaseColors['secondary'],
    accent: pickColor(sp, 'accent', profile.baseColors.accent) as BaseColors['accent'],
    surface: pickColor(sp, 'surface', profile.baseColors.surface) as BaseColors['surface'],
  };

  return (
    <>
      <ThemeInjector baseColors={baseColors} />
      <div style={{ background: 'var(--surface)', color: 'var(--ink-primary)', minHeight: '100vh' }}>
      {/* Hero — CSS 변수 사용 (하드코딩 컬러 없음) */}
      <section style={{
        background: 'linear-gradient(105deg, var(--brand-primary) 0%, var(--brand-primary-strong) 50%, var(--brand-trust) 100%)',
        color: 'var(--surface)',
        padding: '4rem 1.5rem 5rem',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <span style={{
            display: 'inline-block',
            background: 'var(--brand-accent)',
            color: 'var(--surface)',
            padding: '4px 14px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
          }}>
            POMELLI · LIVING PROFILE
          </span>
          <h1 style={{ fontSize: 60, fontWeight: 800, margin: '1rem 0 0.5rem', lineHeight: 1.05 }}>
            {profile.meta.koreanName}
          </h1>
          <p style={{ fontSize: 17, opacity: 0.95, marginBottom: 10 }}>
            {profile.meta.titles.join(' · ')}
          </p>
          <p style={{ fontSize: 15, opacity: 0.8 }}>
            {profile.meta.subtitles.join(' · ')}
          </p>
          <p style={{ fontSize: 19, fontWeight: 600, marginTop: '2rem', maxWidth: 720, lineHeight: 1.5 }}>
            “{profile.tagline}”
          </p>
        </div>
      </section>

      {/* Core Values 4-card — --brand-trust-soft 배경 */}
      <section style={{ padding: '3rem 1.5rem', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 26,
            fontWeight: 800,
            color: 'var(--brand-trust)',
            borderBottom: '3px solid var(--brand-primary)',
            display: 'inline-block',
            paddingBottom: 4,
            marginBottom: '1.5rem',
          }}>
            핵심 가치
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {profile.coreValues.map((v, i) => {
              const tokens = ['--brand-primary', '--brand-accent', '--brand-secondary', '--brand-trust'];
              const tone = tokens[i % tokens.length];
              return (
                <article key={v} style={{
                  border: '1px solid var(--border)',
                  borderTop: `4px solid var(${tone})`,
                  borderRadius: 8,
                  padding: '1.25rem',
                  background: 'var(--surface)',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-muted)', letterSpacing: '0.05em' }}>
                    VALUE {i + 1}
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, marginTop: 8, color: 'var(--ink-primary)', lineHeight: 1.4 }}>
                    {v}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Campaigns 6-card */}
      <section style={{ padding: '3rem 1.5rem', background: 'var(--surface-muted)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 26,
            fontWeight: 800,
            color: 'var(--brand-trust)',
            borderBottom: '3px solid var(--brand-primary)',
            display: 'inline-block',
            paddingBottom: 4,
            marginBottom: '1.5rem',
          }}>
            추천 캠페인
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {profile.campaigns.map((c, i) => {
              const accents = ['--brand-primary', '--brand-secondary', '--brand-accent', '--brand-accent', '--brand-primary', '--brand-trust'];
              const bg = accents[i % accents.length];
              return (
                <article key={c.title} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <span style={{
                    alignSelf: 'flex-start',
                    background: `var(${bg})`,
                    color: 'var(--surface)',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 999,
                  }}>
                    {c.category}
                  </span>
                  <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0.75rem 0 0.5rem', color: 'var(--ink-primary)' }}>
                    {c.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: 'var(--ink-muted)', flex: 1, lineHeight: 1.6 }}>
                    {c.body}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: '0.75rem' }}>
                    {c.channels.map((ch) => (
                      <span key={ch} style={{
                        background: 'var(--brand-secondary-soft)',
                        color: 'var(--brand-secondary)',
                        fontSize: 11,
                        padding: '3px 10px',
                        borderRadius: 4,
                        fontWeight: 600,
                      }}>
                        {ch}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer — --brand-trust 배경, white 80% 텍스트 (가독성 규칙 준수) */}
      <footer style={{
        background: 'var(--brand-trust)',
        color: 'rgba(255,255,255,0.8)',
        padding: '2rem 1.5rem',
        fontSize: 13,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong style={{ color: 'var(--surface)', fontSize: 15 }}>{profile.meta.koreanName}</strong>
            <p style={{ marginTop: 4 }}>Powered by Pomelli Personal DNA Engine</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>분석일 {profile.meta.analysisDate}</div>
            <div style={{ opacity: 0.7, marginTop: 4 }}>14 tokens · WCAG AA · SSR injected</div>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
