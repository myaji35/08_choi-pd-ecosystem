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
  ChevronLeft,
  Plus,
  Search,
  Settings,
  LogOut,
  User,
  FileText,
  Calendar,
  Mail,
  BarChart,
  Folder,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { useUIStore } from '@/lib/stores/uiStore';

interface SidebarItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: SidebarItem[];
  expanded?: boolean;
}

export function NotionSidebar() {
  const pathname = usePathname();
  const { logout } = useSession();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({
    services: true,
    admin: false,
  });

  const toggleExpanded = (key: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const sidebarItems: SidebarItem[] = [
    {
      label: '빠른 액세스',
      icon: <Search className="w-4 h-4" />,
      href: '#',
    },
    {
      label: '홈',
      icon: <Home className="w-4 h-4" />,
      href: '/',
    },
    {
      label: '서비스',
      icon: <Folder className="w-4 h-4" />,
      expanded: expandedItems.services,
      children: [
        {
          label: '교육 과정',
          icon: <GraduationCap className="w-4 h-4" />,
          href: '/education',
        },
        {
          label: '한국환경저널',
          icon: <Newspaper className="w-4 h-4" />,
          href: '/media',
        },
        {
          label: '저작 및 활동',
          icon: <BookOpen className="w-4 h-4" />,
          href: '/works',
        },
        {
          label: '커뮤니티',
          icon: <Users className="w-4 h-4" />,
          href: '/community',
        },
      ],
    },
    {
      label: '관리자',
      icon: <Settings className="w-4 h-4" />,
      expanded: expandedItems.admin,
      children: [
        {
          label: '대시보드',
          icon: <BarChart className="w-4 h-4" />,
          href: '/admin/dashboard',
        },
        {
          label: '유통사 관리',
          icon: <Users className="w-4 h-4" />,
          href: '/admin/distributors',
        },
        {
          label: '리소스 관리',
          icon: <FileText className="w-4 h-4" />,
          href: '/admin/resources',
        },
        {
          label: '활동 로그',
          icon: <Calendar className="w-4 h-4" />,
          href: '/admin/activity-log',
        },
      ],
    },
    {
      label: 'PD 대시보드',
      icon: <User className="w-4 h-4" />,
      href: '/pd/dashboard',
    },
    {
      label: '뉴스레터',
      icon: <Mail className="w-4 h-4" />,
      href: '/pd/newsletter',
    },
  ];

  const renderSidebarItem = (item: SidebarItem, key: string, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = pathname === item.href;
    const isExpanded = item.expanded;

    if (hasChildren) {
      return (
        <div key={key} className="notion-sidebar-group">
          <button
            onClick={() => toggleExpanded(key)}
            className={`
              notion-sidebar-item w-full text-left
              ${depth > 0 ? 'pl-6' : ''}
            `}
          >
            <span className="flex items-center gap-2 flex-1">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-400" />
              )}
              {item.icon}
              <span>{item.label}</span>
            </span>
          </button>
          {isExpanded && (
            <div className="notion-sidebar-children">
              {item.children.map((child, index) =>
                renderSidebarItem(child, `${key}-${index}`, depth + 1)
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={key}
        href={item.href || '#'}
        className={`
          notion-sidebar-item
          ${isActive ? 'active' : ''}
          ${depth > 0 ? 'pl-8' : ''}
        `}
      >
        <span className="flex items-center gap-2">
          {item.icon}
          <span>{item.label}</span>
        </span>
      </Link>
    );
  };

  // 접힌 상태: 토글 버튼만 표시
  if (!isSidebarOpen) {
    return (
      <aside className="w-10 flex-shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col items-center py-3">
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
    <aside className="notion-sidebar relative group">
      {/* 접기 버튼 */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-4 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition-opacity"
        title="사이드바 접기"
      >
        <PanelLeftClose className="w-3 h-3 text-gray-500" />
      </button>

      {/* User Section */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
            <span className="text-white text-sm font-medium">최</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">최범희 PD</div>
            <div className="text-xs text-gray-500">imPD Ecosystem</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-b border-gray-200">
        <button className="notion-sidebar-item w-full">
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">검색</span>
          <kbd className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>
        <button className="notion-sidebar-item w-full">
          <Plus className="w-4 h-4" />
          <span className="flex-1 text-left">새 페이지</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {sidebarItems.map((item, index) => {
          const key = item.label.toLowerCase().replace(/\s+/g, '-');
          return renderSidebarItem(item, key, 0);
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-gray-200">
        <button className="notion-sidebar-item w-full">
          <Settings className="w-4 h-4" />
          <span className="flex-1 text-left">설정</span>
        </button>
        <button onClick={logout} className="notion-sidebar-item w-full text-red-600 hover:text-red-700">
          <LogOut className="w-4 h-4" />
          <span className="flex-1 text-left">로그아웃</span>
        </button>
      </div>
    </aside>
  );
}