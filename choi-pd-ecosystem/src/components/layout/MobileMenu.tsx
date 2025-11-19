'use client';

import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useUIStore } from '@/lib/stores/uiStore';

export function MobileMenu() {
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();

  const menuItems = [
    { href: '/', label: '홈' },
    { href: '/education', label: '교육' },
    { href: '/media', label: '미디어' },
    { href: '/works', label: '저작 및 활동' },
    { href: '/community', label: '커뮤니티' },
  ];

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={toggleMobileMenu}>
      <SheetContent side="left" className="w-[280px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="text-left">메뉴</SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={toggleMobileMenu}
              className="text-lg font-medium hover:text-primary transition-colors py-2"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
