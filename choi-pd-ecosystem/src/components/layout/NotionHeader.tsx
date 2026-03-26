'use client';

import Link from 'next/link';
import { Menu, ChevronRight, User } from 'lucide-react';
import { useUIStore } from '@/lib/stores/uiStore';
import { useSession } from '@/hooks/use-session';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

export function NotionHeader() {
  const { toggleMobileMenu } = useUIStore();
  const { user } = useSession();
  const pathname = usePathname();
  const userName = user?.name || '최범희';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 현재 영역 판단
  const isAdminArea = pathname.startsWith('/admin') || pathname.startsWith('/chopd/admin');
  const isPdArea = pathname.startsWith('/pd') || pathname.startsWith('/chopd/pd');

  // 브레드크럼 생성
  const breadcrumb = useMemo(() => {
    if (isAdminArea) return '관리자';
    if (isPdArea) return 'PD 대시보드';
    return '';
  }, [isAdminArea, isPdArea]);

  // 현재 페이지명 추출
  const pageName = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    const nameMap: Record<string, string> = {
      dashboard: '대시보드',
      members: '회원 관리',
      distributors: '유통사 관리',
      pending: '승인 대기',
      payments: '결제 내역',
      'subscription-plans': '구독 플랜',
      resources: '리소스 관리',
      'hero-images': '히어로 이미지',
      newsletter: '뉴스레터',
      analytics: '분석',
      'activity-log': '활동 로그',
      notifications: '알림',
      profile: '프로필',
      'sns-accounts': 'SNS 계정',
      social: '소셜 미디어',
      'scheduled-posts': '예약 발행',
      inquiries: '문의 관리',
      kanban: '칸반 보드',
    };
    return nameMap[lastSegment] || lastSegment;
  }, [pathname]);

  return (
    <header
      className={`
        notion-header fixed top-0 left-0 right-0 z-50
        bg-white/80 backdrop-blur-sm
        border-b transition-all duration-200
        ${scrolled ? 'border-gray-200 shadow-sm' : 'border-transparent'}
      `}
      style={{
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)',
      }}
    >
      <div className="flex items-center justify-between px-4 h-12">
        {/* Left Section: Breadcrumb */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMobileMenu}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors md:hidden"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link
            href="/chopd"
            className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded-md transition-colors"
          >
            <span className="text-lg font-semibold tracking-tight">imPD</span>
          </Link>

          {breadcrumb && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">{breadcrumb}</span>
            </>
          )}
          {pageName && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700 font-medium">{pageName}</span>
            </>
          )}
        </div>

        {/* Right Section: User */}
        <div className="flex items-center">
          <button
            className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {userName.charAt(0)}
              </span>
            </div>
            <span className="text-sm text-gray-700 hidden sm:inline">
              {userName}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
