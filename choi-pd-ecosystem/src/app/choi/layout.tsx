import type { Metadata } from 'next';
import Link from 'next/link';
import { CHOIPD_DNA } from '@/lib/data/choipd-townin';
import { loadChoiBrand } from '@/lib/data/choi-brand-store';
import { getSession } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: '최범희 PD | Personal DNA Report',
  description: '최PD의 희스토리 — 스마트폰교실·해양경찰교육원 강사. Townin Personal DNA 기반 프로필.',
  openGraph: {
    title: '최범희 PD · 최PD의 희스토리',
    description: '스마트폰으로 사진·동영상·글을 만들어 홍보 마케팅 콘텐츠를 제작합니다',
    type: 'profile',
  },
};

export const dynamic = 'force-dynamic';

export default async function ChoiLayout({ children }: { children: React.ReactNode }) {
  const brand = await loadChoiBrand();
  const session = await getSession();
  const isOwner =
    session?.role === 'admin' ||
    session?.email === 'choi@impd.me' ||
    session?.userId === 'choi-pd';

  const NAV: Array<{ href: string; label: string; admin?: boolean }> = [
    { href: '/choi', label: '홈' },
  ];
  if (isOwner) {
    NAV.push({ href: '/choi/admin', label: '관리 · 리포트', admin: true });
  }
  const themeCss = `
    :root {
      --choi-primary: ${brand.primary};
      --choi-primary-dark: ${brand.primaryDark};
      --choi-accent: ${brand.accent};
      --choi-accent-soft: ${brand.accentSoft};
      --choi-secondary: ${brand.secondary};
      --choi-secondary-soft: ${brand.secondarySoft};
      --choi-trust: ${brand.trust};
      --choi-trust-soft: ${brand.trustSoft};
      --choi-surface: ${brand.surface};
      --choi-ink: ${brand.ink};
      --choi-ink-muted: ${brand.inkMuted};
      --choi-border: ${brand.border};
    }
  `;

  return (
    <div style={{ background: 'var(--choi-surface)', color: 'var(--choi-ink)', minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      <meta name="theme-color" content={brand.primary} />
      <header
        style={{
          background: 'var(--choi-trust)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Link href="/choi" style={{ color: 'white', fontSize: 17, fontWeight: 700, textDecoration: 'none' }}>
            최PD의 희스토리
            <span style={{ fontWeight: 400, opacity: 0.8, marginLeft: 8, fontSize: 13 }}>Personal DNA</span>
          </Link>
          <nav style={{ display: 'flex', gap: '1.25rem', fontSize: 14, alignItems: 'center' }}>
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                style={{
                  color: n.admin ? 'var(--choi-accent)' : 'rgba(255,255,255,0.85)',
                  textDecoration: 'none',
                  fontWeight: n.admin ? 700 : 400,
                }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer style={{ background: 'var(--choi-trust)', color: 'rgba(255,255,255,0.75)', padding: '2rem 1.5rem', marginTop: '3rem', fontSize: 13 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{CHOIPD_DNA.meta.koreanName} PD</div>
            <div>{CHOIPD_DNA.identity.slogan}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>Powered by Townin Algorithm · Veo 3.1 · Imagen 4 · Gemini 2.5</div>
            <div style={{ opacity: 0.65, marginTop: 4 }}>분석일 {CHOIPD_DNA.meta.analysisDate}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
