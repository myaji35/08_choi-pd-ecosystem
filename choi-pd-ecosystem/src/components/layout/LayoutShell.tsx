'use client';

import { usePathname } from 'next/navigation';
import { NotionHeader } from './NotionHeader';
import { NotionSidebar } from './NotionSidebar';

// 사이드바/헤더 없이 독립 레이아웃을 사용하는 경로
const STANDALONE_ROUTES = ['/', '/login', '/member'];

function isStandalonePath(pathname: string): boolean {
  if (pathname === '/') return true;
  return STANDALONE_ROUTES.some(
    (route) => route !== '/' && pathname.startsWith(route)
  );
}

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = isStandalonePath(pathname);

  if (isStandalone) {
    return (
      <main className="min-h-screen bg-white">
        {children}
      </main>
    );
  }

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
