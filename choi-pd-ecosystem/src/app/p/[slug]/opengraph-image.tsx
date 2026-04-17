/* eslint-disable react-hooks/error-boundaries */
import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
import { distributors } from '@/lib/db/schema/distribution';
import { eq, and } from 'drizzle-orm';

export const runtime = 'nodejs';

export const alt = 'imPD 브랜드 페이지';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const PROFESSION_LABELS: Record<string, string> = {
  pd: 'PD / 방송인',
  shopowner: '쇼핑몰 운영자',
  realtor: '부동산 중개인',
  educator: '교육자 / 강사',
  insurance: '보험 설계사',
  freelancer: '프리랜서',
};

const PROFESSION_COLORS: Record<string, string> = {
  pd: '#E4405F',
  shopowner: '#FF6B35',
  realtor: '#2EC4B6',
  educator: '#00A1E0',
  insurance: '#7B61FF',
  freelancer: '#16325C',
};

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 폰트 로드 (실패해도 fallback)
  let fontData: ArrayBuffer | null = null;
  try {
    const fontBuffer = await readFile(
      path.join(process.cwd(), 'public/fonts/og/pretendard-og.woff2')
    );
    fontData = fontBuffer.buffer.slice(
      fontBuffer.byteOffset,
      fontBuffer.byteOffset + fontBuffer.byteLength
    ) as ArrayBuffer;
  } catch {
    // 폰트 로드 실패 시 sans-serif fallback
  }

  const fonts = fontData
    ? [
        {
          name: 'Pretendard',
          data: fontData,
          style: 'normal' as const,
          weight: 700 as const,
        },
      ]
    : [];

  try {
    const result = await db
      .select({
        name: tenants.name,
        profession: tenants.profession,
        logoUrl: tenants.logoUrl,
        primaryColor: tenants.primaryColor,
        secondaryColor: tenants.secondaryColor,
        settings: tenants.settings,
        metadata: tenants.metadata,
      })
      .from(tenants)
      .where(and(eq(tenants.slug, slug), eq(tenants.status, 'active')))
      .limit(1);

    if (result.length === 0) {
      // tenants 없으면 distributors fallback
      const dist = await db
        .select({
          name: distributors.name,
          region: distributors.region,
          businessType: distributors.businessType,
          identityJson: distributors.identityJson,
        })
        .from(distributors)
        .where(eq(distributors.slug, slug))
        .limit(1);

      if (dist.length === 0) {
        return fallbackImage(fonts);
      }

      return distributorOgImage(dist[0], fonts, !!fontData);
    }

    const tenant = result[0];
    const primaryColor = tenant.primaryColor || '#3b82f6';
    const secondaryColor = tenant.secondaryColor || '#8b5cf6';
    const professionLabel =
      PROFESSION_LABELS[tenant.profession] || tenant.profession || '';
    const professionColor =
      PROFESSION_COLORS[tenant.profession] || '#16325C';
    const settings = tenant.settings ? JSON.parse(tenant.settings) : {};
    const metadata = tenant.metadata ? JSON.parse(tenant.metadata) : {};
    const bio =
      settings.bio ||
      metadata.bio ||
      `${tenant.name}의 브랜드 페이지`;
    const initials = (tenant.name || 'IM')
      .replace(/\s/g, '')
      .slice(0, 2)
      .toUpperCase();

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            fontFamily: fontData ? 'Pretendard, sans-serif' : 'sans-serif',
            padding: '60px 80px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 배경 장식 원 */}
          <div
            style={{
              position: 'absolute',
              top: '-120px',
              right: '-80px',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-100px',
              left: '-60px',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
            }}
          />

          {/* 왼쪽 콘텐츠 */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '24px',
              paddingRight: '60px',
            }}
          >
            {/* imPD 브랜드 레이블 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.9)',
                  letterSpacing: '0.05em',
                }}
              >
                imPD
              </div>
            </div>

            {/* 이름 */}
            <div
              style={{
                fontSize: '72px',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              {tenant.name}
            </div>

            {/* profession 배지 */}
            {professionLabel && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    background: professionColor,
                    color: '#ffffff',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontSize: '22px',
                    fontWeight: 700,
                  }}
                >
                  {professionLabel}
                </div>
              </div>
            )}

            {/* bio */}
            <div
              style={{
                fontSize: '24px',
                color: 'rgba(255,255,255,0.80)',
                lineHeight: 1.5,
                maxWidth: '580px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                overflow: 'hidden',
              }}
            >
              {bio}
            </div>
          </div>

          {/* 오른쪽: 로고 또는 이니셜 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '260px',
              flexShrink: 0,
            }}
          >
            {tenant.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenant.logoUrl}
                alt={`${tenant.name} 로고`}
                style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '6px solid rgba(255,255,255,0.3)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  border: '6px solid rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '72px',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                {initials}
              </div>
            )}
          </div>
        </div>
      ),
      {
        ...size,
        fonts,
      }
    );
  } catch {
    return fallbackImage(fonts);
  }
}

function safeParse<T>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

const BUSINESS_LABEL: Record<string, string> = {
  individual: '개인',
  company: '기업',
  organization: '기관/단체',
};

function distributorOgImage(
  d: {
    name: string;
    region: string | null;
    businessType: 'individual' | 'company' | 'organization';
    identityJson: string | null;
  },
  fonts: Array<{ name: string; data: ArrayBuffer; style: 'normal'; weight: 700 }>,
  hasFont: boolean,
) {
  const parsed = safeParse<{
    agenda?: string;
    heroCopy?: string;
    tone?: string[];
    keywords?: string[];
    usp?: string[];
  }>(d.identityJson);

  const agenda = parsed?.heroCopy || parsed?.agenda || `${d.name}의 imPD 홍보 페이지`;
  const chips = [
    ...(parsed?.keywords || []).slice(0, 3),
    ...(parsed?.usp || []).slice(0, 2),
  ].filter(Boolean);

  const primary = '#16325C';
  const accent = '#00A1E0';
  const initials = (d.name || 'IM').replace(/\s/g, '').slice(0, 2).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          background: `linear-gradient(135deg, ${primary} 0%, #1E3A8A 55%, ${accent} 100%)`,
          fontFamily: hasFont ? 'Pretendard, sans-serif' : 'sans-serif',
          padding: '60px 80px',
          position: 'relative',
          overflow: 'hidden',
          color: '#ffffff',
        }}
      >
        {/* 배경 장식 */}
        <div style={{ position: 'absolute', top: '-120px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        {/* 왼쪽 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '22px', paddingRight: '40px' }}>
          {/* imPD 배지 */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '6px', padding: '4px 12px', fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.95)', letterSpacing: '0.05em' }}>
              imPD · {BUSINESS_LABEL[d.businessType] || d.businessType}
            </div>
            {d.region && (
              <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '6px', padding: '4px 12px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                {d.region}
              </div>
            )}
          </div>

          {/* 이름 */}
          <div style={{ fontSize: '88px', fontWeight: 700, color: '#ffffff', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            {d.name}
          </div>

          {/* 아젠다/슬로건 */}
          <div style={{ fontSize: '26px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.45, maxWidth: '720px', display: '-webkit-box', WebkitLineClamp: 2, overflow: 'hidden', borderLeft: '4px solid rgba(255,255,255,0.5)', paddingLeft: '16px' }}>
            {agenda}
          </div>

          {/* 칩 */}
          {chips.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
              {chips.slice(0, 5).map((c, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.18)', color: '#ffffff', borderRadius: '6px', padding: '6px 14px', fontSize: '18px', fontWeight: 600 }}>
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 오른쪽 이니셜 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '240px', flexShrink: 0 }}>
          <div style={{ width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: '6px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px', fontWeight: 700, color: '#ffffff' }}>
            {initials}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}

function fallbackImage(
  fonts: Array<{ name: string; data: ArrayBuffer; style: 'normal'; weight: 700 }>
) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #00A1E0 0%, #16325C 100%)',
          fontFamily: fonts.length ? 'Pretendard, sans-serif' : 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: '96px',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.02em',
          }}
        >
          imPD
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    }
  );
}
