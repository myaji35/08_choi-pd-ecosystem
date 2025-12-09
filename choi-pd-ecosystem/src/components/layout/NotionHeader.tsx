'use client';

import Link from 'next/link';
import { Menu, Search, Settings, ChevronRight, User } from 'lucide-react';
import { useUIStore } from '@/lib/stores/uiStore';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

const IS_DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

export function NotionHeader() {
  const { toggleMobileMenu } = useUIStore();
  const { user } = useUser();
  const [userName, setUserName] = useState('최범희');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (IS_DEV_MODE) {
      const devAuth = document.cookie.includes('dev-auth=true');
      if (devAuth) {
        setUserName('관리자');
      } else {
        setUserName('최범희');
      }
    } else if (user) {
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
        {/* Left Section */}
        <div className="flex items-center gap-1">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="notion-btn p-1.5 hover:bg-gray-100 rounded-md transition-colors md:hidden"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo / Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded-md transition-colors"
          >
            <span className="text-lg font-semibold tracking-tight">imPD</span>
            <span className="text-sm text-gray-500 hidden sm:inline">Ecosystem</span>
          </Link>

          {/* Breadcrumb separator */}
          <ChevronRight className="w-4 h-4 text-gray-400 hidden md:block" />

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="
                  px-3 py-1.5 text-sm text-gray-700
                  hover:bg-gray-100 rounded-md
                  transition-all duration-150
                  font-medium
                "
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <button
            className="
              notion-btn p-1.5
              hover:bg-gray-100 rounded-md
              transition-colors
              hidden sm:block
            "
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-gray-600" />
          </button>

          {/* Settings */}
          <button
            className="
              notion-btn p-1.5
              hover:bg-gray-100 rounded-md
              transition-colors
            "
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <button
              className="
                flex items-center gap-2 px-2 py-1
                hover:bg-gray-100 rounded-md
                transition-colors
              "
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
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-t border-gray-100 bg-white">
        <div className="flex items-center gap-1 px-2 py-1 overflow-x-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="
                px-3 py-1.5 text-sm text-gray-700
                hover:bg-gray-100 rounded-md
                transition-all duration-150
                font-medium whitespace-nowrap
              "
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}