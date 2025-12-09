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
} from 'lucide-react';
import { useState } from 'react';

interface SidebarItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: SidebarItem[];
  expanded?: boolean;
}

export function NotionSidebar() {
  const pathname = usePathname();
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

  return (
    <aside className="notion-sidebar">
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
        <button className="notion-sidebar-item w-full text-red-600 hover:text-red-700">
          <LogOut className="w-4 h-4" />
          <span className="flex-1 text-left">로그아웃</span>
        </button>
      </div>
    </aside>
  );
}