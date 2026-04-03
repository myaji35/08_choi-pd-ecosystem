import { NextRequest, NextResponse } from 'next/server';
import { getCampaignReport } from '@/lib/sns/campaign-client';

/**
 * GET /api/campaigns/[id]/report
 * SocialDoctors에서 캠페인 리포트 조회 (프록시)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const report = await getCampaignReport(id);

    if (!report) {
      return NextResponse.json(
        { error: '리포트를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('[IMPD Campaign Report]', error);
    return NextResponse.json(
      { error: '리포트 조회에 실패했습니다.' },
      { status: 500 },
    );
  }
}
