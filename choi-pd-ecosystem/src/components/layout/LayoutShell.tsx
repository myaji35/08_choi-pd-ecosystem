'use client';

import { usePathname } from 'next/navigation';
import { NotionHeader } from './NotionHeader';
import { NotionSidebar } from './NotionSidebar';

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

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (needsSidebarLayout(pathname)) {
    return (
      <div className="flex h-screen bg-white">
        <NotionSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
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
