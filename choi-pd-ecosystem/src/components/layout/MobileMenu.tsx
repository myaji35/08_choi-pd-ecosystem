'use client';

import Link from 'next/link';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useUIStore } from '@/lib/stores/uiStore';

export function MobileMenu() {
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();

  const menuItems = [
    { href: '/', label: '홈' },
    { href: '/education', label: '교육' },
    { href: '/media', label: '미디어' },
    { href: '/works', label: '저작 및 활동' },
    { href: '/community', label: '커뮤니티' },
    { href: '/chopd/ai', label: 'AI 어시스턴트' },
    { href: '/chopd/schedule', label: '예약 발행' },
  ];

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={toggleMobileMenu}>
      <SheetContent side="left" className="w-[280px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="text-left">메뉴</SheetTitle>
          <SheetDescription className="sr-only">사이트 내비게이션 메뉴</SheetDescription>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-4" aria-label="모바일 내비게이션">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={toggleMobileMenu}
              className="text-lg font-medium hover:text-primary transition-colors py-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A1E0] focus-visible:ring-offset-2"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
