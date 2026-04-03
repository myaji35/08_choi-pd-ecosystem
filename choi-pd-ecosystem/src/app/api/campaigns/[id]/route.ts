import { NextRequest, NextResponse } from 'next/server';
import { getCampaign, executeCampaign } from '@/lib/sns/campaign-client';

/**
 * GET /api/campaigns/[id]
 * SocialDoctors에서 캠페인 상세 조회 (프록시)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const campaign = await getCampaign(id);

    if (!campaign) {
      return NextResponse.json(
        { error: '캠페인을 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('[IMPD Campaign GET]', error);
    return NextResponse.json(
      { error: '캠페인 조회에 실패했습니다.' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/campaigns/[id]
 * SocialDoctors에서 캠페인 실행 (프록시 → /api/campaigns/{id}/execute)
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await executeCampaign(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? '캠페인 실행에 실패했습니다.' },
        { status: 502 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[IMPD Campaign Execute]', error);
    return NextResponse.json(
      { error: '캠페인 실행에 실패했습니다.' },
      { status: 500 },
    );
  }
}
