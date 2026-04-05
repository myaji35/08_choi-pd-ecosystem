import { NextRequest, NextResponse } from 'next/server';
import { gravatarCollector } from '@/lib/enrichment/gravatar';
import { socialLookupCollector } from '@/lib/enrichment/social-lookup';
import type { EnrichmentResult } from '@/lib/enrichment/types';

/**
 * POST /api/enrichment/self-scan
 * 사용자 본인의 공개 프로필을 탐색하여 제안 목록 반환
 * 결과는 DB에 저장하지 않음 — 사용자 동의 후 별도 저장 API 호출
 *
 * Body: { email: string, name?: string }
 * Response: { suggestions: EnrichmentResult[] }
 */
export async function POST(request: NextRequest) {
  try {
    // dev mode 또는 인증된 사용자만 허용
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
    if (!isDevMode) {
      const sessionCookie = request.cookies.get('impd_session')?.value;
      if (!sessionCookie) {
        return NextResponse.json(
          { error: '인증이 필요합니다.', suggestions: [] },
          { status: 401 }
        );
      }
    }

    const body = await request.json();
    const { email, name } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: '이메일이 필요합니다.', suggestions: [] },
        { status: 400 }
      );
    }

    const allResults: EnrichmentResult[] = [];

    // 수집기 순차 실행
    const collectors = [gravatarCollector, socialLookupCollector];

    for (const collector of collectors) {
      try {
        const data = await collector.collect(email, name);
        allResults.push(...data);
      } catch (error) {
        console.error(`[SelfScan:${collector.name}] Error:`, error);
      }
    }

    return NextResponse.json({
      suggestions: allResults,
      count: allResults.length,
    });
  } catch (error) {
    console.error('[SelfScan] Error:', error);
    return NextResponse.json(
      { error: '프로필 탐색에 실패했습니다.', suggestions: [] },
      { status: 500 }
    );
  }
}
