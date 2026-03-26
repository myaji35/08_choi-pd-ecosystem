'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  GraduationCap,
  Newspaper,
  BookOpen,
  Users,
  ChevronDown,
  ChevronRight,
  Settings,
  LogOut,
  User,
  FileText,
  Calendar,
  Mail,
  BarChart,
  Image,
  Kanban,
  Share2,
  Bell,
  Shield,
  CreditCard,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useSession } from '@/hooks/use-session';
import { useUIStore } from '@/lib/stores/uiStore';

interface SidebarItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: SidebarItem[];
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

export function NotionSidebar() {
  const pathname = usePathname();
  const { logout } = useSession();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpanded = (key: string) => {
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // pathname 기반으로 어드민/PD 모드 판단 (/chopd/admin, /admin 모두 지원)
  const isAdminArea = pathname.startsWith('/admin') || pathname.startsWith('/chopd/admin');
  const isPdArea = pathname.startsWith('/pd') || pathname.startsWith('/chopd/pd');

  // URL prefix 결정 (/chopd 하위인지 판단)
  const isChopd = pathname.startsWith('/chopd/');
  const adminPrefix = isChopd ? '/chopd/admin' : '/admin';
  const pdPrefix = isChopd ? '/chopd/pd' : '/pd';

  // 어드민 사이드바 구성
  const adminSections: SidebarSection[] = useMemo(() => [
    {
      items: [
        { label: '대시보드', icon: <BarChart className="w-4 h-4" />, href: `${adminPrefix}/dashboard` },
      ],
    },
    {
      title: '회원 관리',
      items: [
        { label: '회원 목록', icon: <Users className="w-4 h-4" />, href: `${adminPrefix}/members` },
        { label: '유통사 목록', icon: <Users className="w-4 h-4" />, href: `${adminPrefix}/distributors` },
        { label: '승인 대기', icon: <Shield className="w-4 h-4" />, href: `${adminPrefix}/distributors/pending` },
      ],
    },
    {
      title: '결제·구독',
      items: [
        { label: '결제 내역', icon: <CreditCard className="w-4 h-4" />, href: `${adminPrefix}/payments` },
        { label: '구독 플랜', icon: <FileText className="w-4 h-4" />, href: `${adminPrefix}/subscription-plans` },
      ],
    },
    {
      title: '콘텐츠',
      items: [
        { label: '리소스 관리', icon: <FileText className="w-4 h-4" />, href: `${adminPrefix}/resources` },
        { label: '히어로 이미지', icon: <Image className="w-4 h-4" />, href: `${adminPrefix}/hero-images` },
        { label: '뉴스레터', icon: <Mail className="w-4 h-4" />, href: `${adminPrefix}/newsletter` },
      ],
    },
    {
      title: '모니터링',
      items: [
        { label: '분석', icon: <BarChart className="w-4 h-4" />, href: `${adminPrefix}/analytics` },
        { label: '활동 로그', icon: <Calendar className="w-4 h-4" />, href: `${adminPrefix}/activity-log` },
        { label: '알림', icon: <Bell className="w-4 h-4" />, href: `${adminPrefix}/notifications` },
      ],
    },
  ], [adminPrefix]);

  // PD 대시보드 사이드바 구성
  const pdSections: SidebarSection[] = useMemo(() => [
    {
      items: [
        { label: '대시보드', icon: <BarChart className="w-4 h-4" />, href: `${pdPrefix}/dashboard` },
      ],
    },
    {
      title: '브랜드 관리',
      items: [
        { label: '프로필', icon: <User className="w-4 h-4" />, href: `${pdPrefix}/dashboard/profile` },
        { label: '히어로 이미지', icon: <Image className="w-4 h-4" />, href: `${pdPrefix}/dashboard/hero-images` },
        { label: 'SNS 계정', icon: <Share2 className="w-4 h-4" />, href: `${pdPrefix}/sns-accounts` },
        { label: '소셜 미디어', icon: <Share2 className="w-4 h-4" />, href: `${pdPrefix}/dashboard/social` },
      ],
    },
    {
      title: '콘텐츠',
      items: [
        { label: '뉴스레터', icon: <Mail className="w-4 h-4" />, href: `${pdPrefix}/dashboard/newsletter` },
        { label: '예약 발행', icon: <Calendar className="w-4 h-4" />, href: `${pdPrefix}/scheduled-posts` },
        { label: '문의 관리', icon: <FileText className="w-4 h-4" />, href: `${pdPrefix}/inquiries` },
      ],
    },
    {
      title: '업무',
      items: [
        { label: '칸반 보드', icon: <Kanban className="w-4 h-4" />, href: `${pdPrefix}/dashboard/kanban` },
        { label: '알림', icon: <Bell className="w-4 h-4" />, href: `${pdPrefix}/notifications` },
      ],
    },
  ], [pdPrefix]);

  const sections = isAdminArea ? adminSections : pdSections;
  const areaLabel = isAdminArea ? '관리자' : 'PD 대시보드';
  const areaColor = isAdminArea
    ? 'from-blue-600 to-indigo-600'
    : 'from-purple-500 to-pink-500';

  // 접힌 상태
  if (!isSidebarOpen) {
    return (
      <aside className="w-10 flex-shrink-0 border-r border-gray-200 bg-gray-50/80 flex flex-col items-center py-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition"
          title="사이드바 펼치기"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="notion-sidebar relative group flex flex-col">
      {/* 접기 버튼 */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-4 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition-opacity"
        title="사이드바 접기"
      >
        <PanelLeftClose className="w-3 h-3 text-gray-500" />
      </button>

      {/* Header: 영역 표시 */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 bg-gradient-to-br ${areaColor} rounded-md flex items-center justify-center flex-shrink-0`}>
            {isAdminArea
              ? <Shield className="w-3.5 h-3.5 text-white" />
              : <User className="w-3.5 h-3.5 text-white" />
            }
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">{areaLabel}</div>
            <div className="text-[11px] text-gray-400 truncate">imPD Ecosystem</div>
          </div>
        </div>
      </div>

      {/* 공개 사이트 바로가기 */}
      <div className="px-2 pb-1">
        <Link
          href="/chopd"
          className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>공개 사이트 보기</span>
        </Link>
      </div>

      <div className="h-px bg-gray-200 mx-3" />

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            {section.title && (
              <div className="px-2 pt-2 pb-1">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  {section.title}
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                if (item.children) {
                  const key = item.label;
                  const isExpanded = expandedItems[key] ?? false;
                  return (
                    <div key={key}>
                      <button
                        onClick={() => toggleExpanded(key)}
                        className="notion-sidebar-item w-full text-left"
                      >
                        <span className="flex items-center gap-2 flex-1">
                          {item.icon}
                          <span className="flex-1">{item.label}</span>
                          {isExpanded
                            ? <ChevronDown className="w-3 h-3 text-gray-400" />
                            : <ChevronRight className="w-3 h-3 text-gray-400" />
                          }
                        </span>
                      </button>
                      {isExpanded && item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href || '#'}
                          className={`notion-sidebar-item pl-8 ${pathname === child.href ? 'active' : ''}`}
                        >
                          <span className="flex items-center gap-2">
                            {child.icon}
                            <span>{child.label}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  );
                }

                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href || '#'}
                    className={`notion-sidebar-item ${isActive ? 'active' : ''}`}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 영역 전환 + 로그아웃 */}
      <div className="border-t border-gray-200 px-2 py-2 space-y-0.5">
        {isAdminArea ? (
          <Link
            href={`${pdPrefix}/dashboard`}
            className="notion-sidebar-item"
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>PD 대시보드</span>
            </span>
          </Link>
        ) : (
          <Link
            href={`${adminPrefix}/dashboard`}
            className="notion-sidebar-item"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>관리자</span>
            </span>
          </Link>
        )}
        <button
          onClick={logout}
          className="notion-sidebar-item w-full text-left text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </span>
        </button>
      </div>
    </aside>
  );
}
