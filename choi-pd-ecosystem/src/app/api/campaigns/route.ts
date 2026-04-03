import { NextRequest, NextResponse } from 'next/server';
import { listCampaigns, requestCampaign } from '@/lib/sns/campaign-client';
import type { CampaignRequestOptions, CampaignStatus } from '@/lib/sns/campaign-client';

/**
 * GET /api/campaigns
 * SocialDoctors에서 캠페인 목록을 조회 (프록시)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status') as CampaignStatus | undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

    const result = await listCampaigns(status || undefined, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[IMPD Campaigns GET]', error);
    return NextResponse.json(
      { error: '캠페인 목록 조회에 실패했습니다.' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/campaigns
 * SocialDoctors에 캠페인 요청 생성 (프록시)
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CampaignRequestOptions;

    if (!body.title || !body.type || !body.platforms?.length) {
      return NextResponse.json(
        { error: 'title, type, platforms는 필수 항목입니다.' },
        { status: 400 },
      );
    }

    const campaign = await requestCampaign(body);

    if ('error' in campaign && campaign.error) {
      return NextResponse.json({ error: campaign.error }, { status: 502 });
    }

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('[IMPD Campaigns POST]', error);
    return NextResponse.json(
      { error: '캠페인 생성에 실패했습니다.' },
      { status: 500 },
    );
  }
}
