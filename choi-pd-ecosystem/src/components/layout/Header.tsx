'use client';

import Link from 'next/link';
import { Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { useUIStore } from '@/lib/stores/uiStore';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

const IS_DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

export function Header() {
  const { toggleMobileMenu } = useUIStore();
  const { user } = useUser();
  const [userName, setUserName] = useState('최범희');

  useEffect(() => {
    if (IS_DEV_MODE) {
      // 개발 모드에서는 쿠키 확인
      const devAuth = document.cookie.includes('dev-auth=true');
      if (devAuth) {
        setUserName('관리자');
      } else {
        setUserName('최범희');
      }
    } else if (user) {
      // 프로덕션 모드에서는 Clerk 사용자 정보 사용
      const displayName = user.firstName || user.username || user.primaryEmailAddress?.emailAddress || '사용자';
      setUserName(displayName);
    } else {
      setUserName('최범희');
    }
  }, [user]);

  const menuItems = [
    { href: '/', label: '홈' },
    { href: '/education', label: '교육' },
    { href: '/media', label: '미디어' },
    { href: '/works', label: '저작 및 활동' },
    { href: '/community', label: '커뮤니티' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-xl font-bold">imPD</span>
          <span className="text-sm text-muted-foreground">({userName})</span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {menuItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink asChild>
                  <Link href={item.href} className={navigationMenuTriggerStyle()}>
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMobileMenu}
          aria-label="메뉴 열기"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
}
