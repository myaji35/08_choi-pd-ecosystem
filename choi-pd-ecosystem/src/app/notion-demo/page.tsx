'use client';

import { NotionHeader } from '@/components/layout/NotionHeader';
import { NotionSidebar } from '@/components/layout/NotionSidebar';
import {
  FileText,
  Clock,
  Tag,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Hash,
  Calendar,
  User,
  CheckSquare,
  Link as LinkIcon,
} from 'lucide-react';
import { useState } from 'react';

export default function NotionDemoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const recentPages = [
    { title: '프로젝트 계획서', icon: '📋', updated: '5분 전', type: 'document' },
    { title: '미팅 노트', icon: '📝', updated: '1시간 전', type: 'note' },
    { title: '디자인 시스템', icon: '🎨', updated: '3시간 전', type: 'design' },
    { title: '개발 로드맵', icon: '🗺️', updated: '어제', type: 'roadmap' },
    { title: '팀 위키', icon: '📚', updated: '2일 전', type: 'wiki' },
  ];

  const databases = [
    { name: '작업 관리', icon: <CheckSquare className="w-4 h-4" />, count: 24 },
    { name: '프로젝트', icon: <Folder className="w-4 h-4" />, count: 8 },
    { name: '팀원', icon: <User className="w-4 h-4" />, count: 12 },
    { name: '문서', icon: <FileText className="w-4 h-4" />, count: 156 },
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      {sidebarOpen && <NotionSidebar />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <NotionHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto mt-12">
          <div className="notion-page">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <span>워크스페이스</span>
                <ChevronRight className="w-3 h-3" />
                <span>홈</span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🏠</span>
                <h1 className="text-4xl font-bold">홈</h1>
              </div>

              <p className="text-gray-600">
                imPD Ecosystem의 Notion 스타일 데모 페이지입니다.
                깔끔하고 미니멀한 디자인으로 콘텐츠에 집중할 수 있습니다.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="notion-card mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">빠른 시작</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button className="notion-btn justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  새 페이지
                </button>
                <button className="notion-btn justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  템플릿
                </button>
                <button className="notion-btn justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  캘린더
                </button>
                <button className="notion-btn justify-start">
                  <Hash className="w-4 h-4 mr-2" />
                  데이터베이스
                </button>
              </div>
            </div>

            {/* Recent Pages */}
            <div className="notion-card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">최근 페이지</h3>
                <button className="notion-btn">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                {recentPages.map((page, index) => (
                  <div
                    key={index}
                    className="
                      flex items-center gap-3 p-2 -mx-2
                      hover:bg-gray-50 rounded-md
                      cursor-pointer transition-colors
                    "
                  >
                    <span className="text-xl">{page.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{page.title}</div>
                      <div className="text-xs text-gray-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {page.updated}
                      </div>
                    </div>
                    <Tag className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Databases Grid */}
            <div className="notion-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">데이터베이스</h3>
                <div className="flex gap-2">
                  <button className="notion-btn">
                    <Search className="w-4 h-4" />
                  </button>
                  <button className="notion-btn">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {databases.map((db, index) => (
                  <div
                    key={index}
                    className="
                      p-4 border border-gray-200 rounded-lg
                      hover:shadow-sm hover:border-gray-300
                      cursor-pointer transition-all
                    "
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {db.icon}
                      <span className="font-medium">{db.name}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {db.count} 항목
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Blocks Example */}
            <div className="mt-8 space-y-2">
              <div className="notion-block">
                <h2 className="text-2xl font-semibold">📌 중요 공지</h2>
              </div>

              <div className="notion-block">
                <p>
                  이것은 Notion 스타일의 블록 시스템 예시입니다.
                  각 블록은 독립적으로 편집하고 이동할 수 있습니다.
                </p>
              </div>

              <div className="notion-callout">
                <div className="notion-callout-icon">💡</div>
                <div>
                  <strong>팁:</strong> Notion 스타일 UI는 깔끔한 타이포그래피와
                  적절한 여백, 그리고 미묘한 호버 효과가 특징입니다.
                </div>
              </div>

              <div className="notion-toggle">
                <div className="flex items-center gap-2">
                  <ChevronRight className="notion-toggle-arrow w-4 h-4" />
                  <span className="font-medium">더 많은 기능 보기</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Missing import fix
const Folder = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    height="24"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);