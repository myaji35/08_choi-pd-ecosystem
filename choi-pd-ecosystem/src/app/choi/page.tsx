// /choi — 팔로워 관점 공개 페이지 (자긍심 A+C+D)
// A: 프로필 + 활동 콜라주 / C: imPD 검증+수상 / D: 팔로워 수 + 활동 중 배지
import Link from 'next/link';
import { CHOIPD_DNA } from '@/lib/data/choipd-townin';
import { db } from '@/lib/db';
import {
  members,
  memberAwards,
  memberProfileMedia,
  memberFollowers,
  memberActivityTimeline,
} from '@/lib/db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';
import { FollowButton } from '@/components/choi/FollowButton';

const d = CHOIPD_DNA;
export const dynamic = 'force-dynamic';

async function loadChoiLive() {
  const member = await db.select().from(members).where(eq(members.slug, 'choi-pd')).get();
  if (!member) return null;
  const [awards, media, followerStats, lastTimeline] = await Promise.all([
    db.select().from(memberAwards).where(eq(memberAwards.memberId, member.id)).orderBy(memberAwards.displayOrder).all(),
    db.select().from(memberProfileMedia).where(eq(memberProfileMedia.memberId, member.id)).orderBy(memberProfileMedia.displayOrder).all(),
    db.select({ c: sql<number>`count(*)` }).from(memberFollowers).where(and(eq(memberFollowers.memberId, member.id), eq(memberFollowers.status, 'active'))).get(),
    db.select().from(memberActivityTimeline).where(eq(memberActivityTimeline.memberId, member.id)).orderBy(desc(memberActivityTimeline.occurredAt)).limit(1).get(),
  ]);
  const isLive = lastTimeline?.occurredAt
    ? Date.now() - new Date(lastTimeline.occurredAt).getTime() < 14 * 86400000
    : false;
  return {
    awards,
    heroCover: media.find((m) => m.role === 'hero_cover'),
    heroCollage: media.filter((m) => m.role === 'hero_collage').slice(0, 3),
    followerCount: Number(followerStats?.c || 0),
    isLive,
  };
}

export default async function ChoiOpsHome() {
  const activeChannels = d.channels.filter((c) => c.status === '운영 중');
  const avgScore = Math.round(activeChannels.reduce((s, c) => s + c.activityScore, 0) / activeChannels.length);
  const runningCampaigns = d.campaigns.length;

  const live = await loadChoiLive();
  const awards = live?.awards || [];
  const heroCollage = live?.heroCollage || [];
  const heroCover = live?.heroCover;
  const followerCount = live?.followerCount || 0;
  const isLive = live?.isLive || false;
  const verifiedBadge = awards.find((a) => a.category === 'certification' && a.organization === 'imPD Platform');

  return (
    <>
      {/* Hero — 팔로워 관점 · 자긍심 A+C+D */}
      <section style={{ position: 'relative', background: 'linear-gradient(105deg, var(--choi-primary) 0%, var(--choi-primary-dark) 55%, var(--choi-trust) 100%)', color: 'white', padding: '3rem 1.5rem 4rem', overflow: 'hidden' }}>
        {heroCover?.mediaUrl && (
          <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: `url(${heroCover.mediaUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.18, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
        )}

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          {/* 배지 스트립: LIVE + imPD 검증 + 팔로워 수 */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 22 }}>
            {isLive && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--choi-secondary)', color: 'white', padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#B7F5C9', boxShadow: '0 0 10px #B7F5C9' }} />
                LIVE · 지금 활동 중
              </span>
            )}
            {verifiedBadge && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.95)', color: '#00A1E0', padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 800 }}>
                ✓ imPD 검증 회원 · {verifiedBadge.awardedYear}
              </span>
            )}
            {followerCount > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.28)', color: 'white', padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)' }}>
                팔로워 <strong style={{ marginLeft: 2 }}>{followerCount.toLocaleString('ko-KR')}</strong>명
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gap: 32, gridTemplateColumns: heroCollage.length > 0 ? 'minmax(0, 1.15fr) minmax(0, 1fr)' : '1fr', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: 54, fontWeight: 900, margin: '0 0 0.75rem', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
                {d.meta.koreanName} PD
              </h1>
              <p style={{ fontSize: 17, opacity: 0.95, marginBottom: 4, fontWeight: 500 }}>
                {d.meta.titles.join(' · ')}
              </p>
              <p style={{ fontSize: 14, opacity: 0.8, marginBottom: '1.25rem' }}>
                {d.meta.subtitles.join(' · ')}
              </p>
              <p style={{ fontSize: 18, fontWeight: 600, maxWidth: 620, lineHeight: 1.55, borderLeft: '3px solid rgba(255,255,255,0.4)', paddingLeft: 14 }}>
                "{d.identity.slogan}"
              </p>

              {/* CTA 스택: 팔로우 / B2G 문의 / 채널 */}
              <div style={{ display: 'flex', gap: 12, marginTop: '2rem', flexWrap: 'wrap' }}>
                <FollowButton slug="choi-pd" initialCount={followerCount} />
                <a href="#contact" style={{ background: 'var(--choi-accent)', color: 'white', padding: '12px 22px', borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(255,111,0,0.35)' }}>
                  B2G · 공공기관 강의 문의 →
                </a>
                <a href="#channels" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '12px 22px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.4)' }}>
                  운영 채널 바로가기
                </a>
              </div>
            </div>

            {/* 우: 활동 하이라이트 카드 — 실 자산 텍스트 (anti_patterns "이모지 사용" 준수) */}
            {heroCollage.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 140px)', gap: 10 }}>
                {heroCollage.slice(0, 3).map((m, idx) => {
                  const gradients = [
                    'linear-gradient(135deg, rgba(211,47,47,0.95) 0%, rgba(183,28,28,0.92) 55%, rgba(26,35,126,0.9) 100%)',
                    'linear-gradient(135deg, rgba(255,111,0,0.95) 0%, rgba(211,47,47,0.92) 100%)',
                    'linear-gradient(135deg, rgba(26,35,126,0.95) 0%, rgba(0,137,123,0.9) 100%)',
                  ];
                  // 실 데이터 힌트 (caption 기반 추출 + 기본 레이블)
                  const tagByIdx = ['공공기관 강의', '유튜브 제작', '수상·인증'];
                  const subByIdx = ['B2G 출강 기록', 'Press Awards 유튜버상', '서울시 청소년지도자 대상'];
                  return (
                    <div
                      key={m.id}
                      style={{
                        background: gradients[idx % gradients.length],
                        borderRadius: 12,
                        gridColumn: idx === 0 ? '1 / span 2' : undefined,
                        gridRow: idx === 0 ? '1 / span 2' : undefined,
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                        position: 'relative',
                        overflow: 'hidden',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      {/* 실 이미지 overlay (파일 존재 시만) */}
                      {m.mediaUrl && !m.mediaUrl.startsWith('/images/') && (
                        <div
                          aria-hidden
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url(${m.mediaUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: 0.55,
                            mixBlendMode: 'overlay',
                          }}
                        />
                      )}
                      <div style={{ position: 'relative', zIndex: 2 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: 999,
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            border: '1px solid rgba(255,255,255,0.35)',
                          }}
                        >
                          {tagByIdx[idx] || '활동'}
                        </span>
                      </div>
                      <div style={{ position: 'relative', zIndex: 2 }}>
                        <div
                          style={{
                            color: 'white',
                            fontWeight: 800,
                            fontSize: idx === 0 ? 18 : 13,
                            lineHeight: 1.3,
                            marginBottom: 4,
                            textShadow: '0 1px 6px rgba(0,0,0,0.35)',
                          }}
                        >
                          {m.caption || subByIdx[idx] || '활동 기록'}
                        </div>
                        <div
                          style={{
                            color: 'rgba(255,255,255,0.85)',
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                        >
                          {subByIdx[idx] || ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 운영 KPI 바 */}
      <section style={{ maxWidth: 1140, margin: '-28px auto 0', background: 'white', borderRadius: 8, boxShadow: '0 6px 20px rgba(22,50,92,0.1)', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', padding: '1.25rem 0' }}>
          <Kpi value={`${activeChannels.length}`} label="운영 중 채널" />
          <Kpi value={`${avgScore}%`} label="평균 활성화 점수" />
          <Kpi value={`${runningCampaigns}`} label="라이브 캠페인" />
          <Kpi value={`${d.awards.length}`} label="공식 수상" accent />
          <Kpi value="B2G" label="공공기관 출강" accent />
          <Kpi value="2+" label="신규 성장 기회" last />
        </div>
      </section>

      {/* 수상 · Trust 바 */}
      <section style={{ padding: '3rem 1.5rem 2rem', background: 'var(--choi-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--choi-trust)', borderBottom: '3px solid var(--choi-primary)', display: 'inline-block', paddingBottom: 4, marginBottom: '1.25rem' }}>
            공신력 · Trust Bar
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '1rem' }}>
            {d.awards.map((a) => (
              <article key={a.year} style={{ border: '1px solid var(--choi-border)', borderLeft: '4px solid var(--choi-primary)', borderRadius: 6, padding: '1rem 1.25rem', background: 'white' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--choi-primary)', letterSpacing: '0.05em' }}>AWARD · {a.year}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--choi-ink)', margin: '6px 0' }}>{a.name}</h3>
                <div style={{ fontSize: 12, color: 'var(--choi-ink-muted)' }}>{a.org}</div>
              </article>
            ))}
            <article style={{ background: 'var(--choi-trust)', color: 'white', borderRadius: 6, padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--choi-accent)', letterSpacing: '0.05em' }}>PUBLIC TRUST</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '6px 0' }}>해양경찰교육원 스마트폰·미디어 강의</h3>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>공공기관 정식 출강 · 경찰·공무원 대상</div>
            </article>
          </div>
        </div>
      </section>

      {/* 라이브 캠페인 (운영 스냅샷) */}
      <section style={{ padding: '2rem 1.5rem', background: 'var(--choi-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--choi-trust)', borderBottom: '3px solid var(--choi-primary)', display: 'inline-block', paddingBottom: 4, margin: 0 }}>
              라이브 캠페인
            </h2>
            <Link href="/choi/admin#campaigns" style={{ fontSize: 13, color: 'var(--choi-primary)', textDecoration: 'none', fontWeight: 600 }}>
              전체 캠페인 보기 →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {d.campaigns.slice(0, 3).map((c, i) => {
              const bgs = ['var(--choi-primary)', 'var(--choi-secondary)', 'var(--choi-accent)'];
              return (
                <article key={c.title} style={{ border: '1px solid var(--choi-border)', borderRadius: 6, padding: '1rem 1.25rem', background: 'white' }}>
                  <span style={{ display: 'inline-block', background: bgs[i], color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>
                    {c.category}
                  </span>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: '8px 0 4px', color: 'var(--choi-ink)' }}>{c.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--choi-ink-muted)', lineHeight: 1.5 }}>{c.body}</p>
                  <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {c.channels.map((ch) => (
                      <span key={ch} style={{ background: 'var(--choi-secondary-soft)', color: 'var(--choi-secondary)', fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{ch}</span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 채널 운영 현황 */}
      <section id="channels" style={{ padding: '2rem 1.5rem', background: 'var(--choi-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--choi-trust)', borderBottom: '3px solid var(--choi-primary)', display: 'inline-block', paddingBottom: 4, margin: 0 }}>
              채널 운영 현황
            </h2>
            <Link href="/choi/admin#channels" style={{ fontSize: 13, color: 'var(--choi-primary)', textDecoration: 'none', fontWeight: 600 }}>
              채널 전략 상세 →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            <div>
              {d.channels.map((ch) => (
                <div key={ch.name} style={{ marginBottom: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>
                      {ch.name}
                      <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: ch.status === '운영 중' ? 'var(--choi-secondary)' : 'var(--choi-accent)', background: ch.status === '운영 중' ? 'var(--choi-secondary-soft)' : 'var(--choi-accent-soft)', padding: '2px 8px', borderRadius: 4 }}>
                        {ch.status}
                      </span>
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--choi-ink-muted)' }}>{ch.activityScore}%</span>
                  </div>
                  <div style={{ height: 8, background: '#F3F2F2', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${ch.activityScore}%`, height: '100%', background: ch.activityScore >= 60 ? 'var(--choi-primary)' : ch.activityScore >= 40 ? 'var(--choi-trust)' : 'var(--choi-accent)' }} />
                  </div>
                </div>
              ))}
            </div>
            <aside style={{ background: 'var(--choi-primary)', color: 'white', padding: '1.25rem', borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8 }}>ACTION ITEMS</div>
              {d.channelInsights.map((i) => (
                <div key={i.label} style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>
                  <strong>{i.icon} {i.label}:</strong> {i.text}
                </div>
              ))}
              <Link href="/choi/admin#roadmap" style={{ display: 'inline-block', marginTop: 6, fontSize: 12, color: 'white', background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: 4, textDecoration: 'none', fontWeight: 600 }}>
                8주 로드맵 →
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* Contact / B2G CTA */}
      <section id="contact" style={{ padding: '3rem 1.5rem', background: 'var(--choi-trust-soft)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--choi-trust)', marginBottom: 12 }}>
            공공기관·기업 강의 문의
          </h2>
          <p style={{ fontSize: 15, color: 'var(--choi-ink-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            해양경찰교육원 등 공공기관 출강, 서울시 대상 수상 공신력 기반.<br />
            중장년 스마트폰 교육부터 1인미디어 크리에이터 양성까지.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:choipd@example.com" style={{ background: 'var(--choi-primary)', color: 'white', padding: '12px 28px', borderRadius: 6, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              이메일 문의
            </a>
            <Link href="/choi/admin" style={{ background: 'white', color: 'var(--choi-trust)', padding: '12px 28px', borderRadius: 6, fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid var(--choi-border)' }}>
              분석 리포트 전문 보기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Kpi({ value, label, accent, last }: { value: string; label: string; accent?: boolean; last?: boolean }) {
  return (
    <div style={{ textAlign: 'center', padding: '0.5rem 0.75rem', borderRight: last ? 'none' : '1px solid var(--choi-border)' }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: accent ? 'var(--choi-accent)' : 'var(--choi-trust)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--choi-ink-muted)', marginTop: 3, letterSpacing: '0.03em' }}>{label}</div>
    </div>
  );
}
