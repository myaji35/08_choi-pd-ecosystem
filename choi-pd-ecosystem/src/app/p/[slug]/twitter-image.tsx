/* eslint-disable react-hooks/error-boundaries */
import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const runtime = 'nodejs';

export const alt = 'imPD 브랜드 페이지';
export const size = { width: 1200, height: 600 };
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

export default async function TwitterImage({
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
      return fallbackImage(fonts);
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
            height: '600px',
            display: 'flex',
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            fontFamily: fontData ? 'Pretendard, sans-serif' : 'sans-serif',
            padding: '56px 80px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 배경 장식 원 */}
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              right: '-80px',
              width: '380px',
              height: '380px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-90px',
              left: '-60px',
              width: '280px',
              height: '280px',
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
              gap: '20px',
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
                fontSize: '68px',
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
                    padding: '7px 18px',
                    fontSize: '20px',
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
                fontSize: '22px',
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
              width: '240px',
              flexShrink: 0,
            }}
          >
            {tenant.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenant.logoUrl}
                alt={`${tenant.name} 로고`}
                style={{
                  width: '190px',
                  height: '190px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '6px solid rgba(255,255,255,0.3)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '190px',
                  height: '190px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  border: '6px solid rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '68px',
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

function fallbackImage(
  fonts: Array<{ name: string; data: ArrayBuffer; style: 'normal'; weight: 700 }>
) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '600px',
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
      height: 600,
      fonts,
    }
  );
}
