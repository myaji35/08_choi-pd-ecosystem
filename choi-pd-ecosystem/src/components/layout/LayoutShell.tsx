'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { NotionHeader } from './NotionHeader';
import { NotionSidebar } from './NotionSidebar';
import { useUIStore } from '@/lib/stores/uiStore';

/**
 * 사이드바 + 헤더가 필요한 관리 영역인지 판단
 * /admin/*, /pd/*, /chopd/admin/*, /chopd/pd/* → 사이드바 레이아웃
 * 그 외 → 독립 레이아웃 (공개 사이트, 로그인 등)
 */
function needsSidebarLayout(pathname: string): boolean {
  // 온보딩은 독립 레이아웃 사용
  if (pathname.startsWith('/onboarding')) return false;

  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/pd') ||
    pathname.startsWith('/chopd/admin') ||
    pathname.startsWith('/chopd/pd') ||
    pathname.startsWith('/dashboard')
  );
}

const SIDEBAR_BREAKPOINT = 1024; // lg breakpoint


export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setSidebarOpen } = useUIStore();

  // 좁은 화면에서 사이드바 자동 접기
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < SIDEBAR_BREAKPOINT) {
        setSidebarOpen(false);
      }
    };

    // 초기 실행
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  if (needsSidebarLayout(pathname)) {
    return (
      <div className="flex h-screen bg-white">
        {/* 사이드바: 모든 화면에서 표시. 좁은 화면에서는 접힌 상태(아이콘만) + hover 확장 */}
        <NotionSidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <NotionHeader />
          <main className="flex-1 overflow-y-auto mt-12 bg-white">
            <div className="notion-page">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 공개 사이트, 로그인, 회원 프로필 등 — 독립 레이아웃
  return (
    <main className="min-h-screen bg-white">
      {children}
    </main>
  );
}
