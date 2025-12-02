import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { distributors, distributorResources, distributorActivityLog } from '@/lib/db/schema';
import { eq, sql, gte, and } from 'drizzle-orm';

// GET /api/admin/analytics - 통계 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30'; // days

    // 기간 계산
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // 1. 수요자 통계
    const allDistributors = await db.select().from(distributors).all();

    const distributorStats = {
      total: allDistributors.length,
      active: allDistributors.filter(d => d.status === 'active').length,
      pending: allDistributors.filter(d => d.status === 'pending').length,
      approved: allDistributors.filter(d => d.status === 'approved').length,
      suspended: allDistributors.filter(d => d.status === 'suspended').length,
      rejected: allDistributors.filter(d => d.status === 'rejected').length,
    };

    // 2. 구독 플랜별 분포
    const planDistribution = {
      basic: allDistributors.filter(d => d.subscriptionPlan === 'basic').length,
      premium: allDistributors.filter(d => d.subscriptionPlan === 'premium').length,
      enterprise: allDistributors.filter(d => d.subscriptionPlan === 'enterprise').length,
      none: allDistributors.filter(d => !d.subscriptionPlan).length,
    };

    // 3. 지역별 분포
    const regionDistribution: Record<string, number> = {};
    allDistributors.forEach(d => {
      if (d.region) {
        regionDistribution[d.region] = (regionDistribution[d.region] || 0) + 1;
      }
    });

    // 4. 사업 유형별 분포
    const businessTypeDistribution = {
      individual: allDistributors.filter(d => d.businessType === 'individual').length,
      company: allDistributors.filter(d => d.businessType === 'company').length,
      organization: allDistributors.filter(d => d.businessType === 'organization').length,
    };

    // 5. 총 매출
    const totalRevenue = allDistributors.reduce((sum, d) => sum + (d.totalRevenue || 0), 0);

    // 6. 리소스 통계
    const allResources = await db.select().from(distributorResources).all();

    const resourceStats = {
      total: allResources.length,
      active: allResources.filter(r => r.isActive).length,
      totalDownloads: allResources.reduce((sum, r) => sum + (r.downloadCount || 0), 0),
      byCategory: {
        marketing: allResources.filter(r => r.category === 'marketing').length,
        training: allResources.filter(r => r.category === 'training').length,
        contract: allResources.filter(r => r.category === 'contract').length,
        promotional: allResources.filter(r => r.category === 'promotional').length,
        technical: allResources.filter(r => r.category === 'technical').length,
      },
    };

    // 7. 인기 리소스 TOP 10
    const topResources = allResources
      .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
      .slice(0, 10)
      .map(r => ({
        id: r.id,
        title: r.title,
        category: r.category,
        downloads: r.downloadCount,
      }));

    // 8. 최근 활동 로그 (기간 내)
    const recentActivities = await db
      .select()
      .from(distributorActivityLog)
      .orderBy(sql`${distributorActivityLog.createdAt} DESC`)
      .limit(50)
      .all();

    const activityStats = {
      total: recentActivities.length,
      byType: {
        login: recentActivities.filter(a => a.activityType === 'login').length,
        content_access: recentActivities.filter(a => a.activityType === 'content_access').length,
        download: recentActivities.filter(a => a.activityType === 'download').length,
        payment: recentActivities.filter(a => a.activityType === 'payment').length,
        support_request: recentActivities.filter(a => a.activityType === 'support_request').length,
      },
    };

    // 9. 월별 신규 가입 추이 (최근 6개월)
    const monthlySignups: Record<string, number> = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const count = allDistributors.filter(d => {
        const createdDate = new Date(d.createdAt);
        return (
          createdDate.getFullYear() === date.getFullYear() &&
          createdDate.getMonth() === date.getMonth()
        );
      }).length;

      monthlySignups[monthKey] = count;
    }

    // 10. 평균 활동 빈도
    const activeDistributors = allDistributors.filter(d => d.lastActivityAt);
    const avgActivityFrequency = activeDistributors.length > 0
      ? recentActivities.length / activeDistributors.length
      : 0;

    return NextResponse.json({
      success: true,
      analytics: {
        distributorStats,
        planDistribution,
        regionDistribution,
        businessTypeDistribution,
        totalRevenue,
        resourceStats,
        topResources,
        activityStats,
        monthlySignups,
        avgActivityFrequency: Math.round(avgActivityFrequency * 10) / 10,
        period: parseInt(period),
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
