'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { useUIStore } from '@/lib/stores/uiStore';
import { useSession } from '@/hooks/use-session';
import { useTenant } from '@/lib/tenant/useTenant';
import { useTranslation } from '@/lib/i18n';

export function Header() {
  const { toggleMobileMenu } = useUIStore();
  const { user } = useSession();
  const { tenant } = useTenant();
  const { t } = useTranslation();
  const userName = user?.name || tenant?.name || '최범희';

  const menuItems = [
    { href: '/', label: t('nav.home') },
    { href: '/education', label: t('nav.education') },
    { href: '/media', label: t('nav.media') },
    { href: '/works', label: t('nav.works') },
    { href: '/community', label: t('nav.community') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo — 테넌트 로고가 있으면 표시 */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {tenant?.branding?.logoUrl ? (
            <Image
              src={tenant.branding.logoUrl}
              alt={tenant.name}
              width={32}
              height={32}
              className="h-8 w-8 rounded object-contain"
            />
          ) : (
            <span className="text-xl font-bold" style={{ color: tenant?.branding?.primaryColor || undefined }}>
              imPD
            </span>
          )}
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
