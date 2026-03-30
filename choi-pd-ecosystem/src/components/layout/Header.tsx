'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/stores/uiStore';
import { useSession } from '@/hooks/use-session';
import { useTenant } from '@/lib/tenant/useTenant';
import { useTranslation } from '@/lib/i18n';

export function Header() {
  const { toggleMobileMenu } = useUIStore();
  const { user } = useSession();
  const { tenant } = useTenant();
  const { t } = useTranslation();
  const pathname = usePathname();
  const userName = user?.name || tenant?.name || '최범희';

  const menuItems = [
    { href: '/', label: t('nav.home') },
    { href: '/education', label: t('nav.education') },
    { href: '/media', label: t('nav.media') },
    { href: '/works', label: t('nav.works') },
    { href: '/community', label: t('nav.community') },
    { href: '/chopd/ai', label: 'AI 어시스턴트' },
    { href: '/chopd/schedule', label: '예약 발행' },
  ];

  // Normalize pathname for matching (strip /chopd prefix)
  const normalizedPath = pathname?.replace(/^\/chopd/, '') || '/';
  const isActive = (href: string) => {
    if (href === '/') return normalizedPath === '/' || pathname === '/chopd';
    return normalizedPath.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          {tenant?.branding?.logoUrl ? (
            <Image
              src={tenant.branding.logoUrl}
              alt={tenant.name}
              width={32}
              height={32}
              className="h-8 w-8 rounded object-contain"
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#16325C' }}>
                <span className="text-white text-xs font-bold">im</span>
              </div>
              <span className="text-lg font-bold" style={{ color: tenant?.branding?.primaryColor || '#16325C' }}>
                PD
              </span>
            </div>
          )}
          <span className="text-sm text-gray-400 hidden sm:inline">({userName})</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-3.5 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive(item.href)
                  ? 'text-[#16325C]'
                  : 'text-gray-500 hover:text-[#16325C] hover:bg-gray-50'
              }`}
            >
              {item.label}
              {/* Active indicator */}
              {isActive(item.href) && (
                <span
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                  style={{ background: '#00A1E0' }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Right side: CTA + Mobile menu */}
        <div className="flex items-center gap-3">
          <Link
            href="/chopd/community"
            className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            style={{ background: '#00A1E0' }}
          >
            시작하기
          </Link>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="메뉴 열기"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </Button>
        </div>
      </div>
    </header>
  );
}
