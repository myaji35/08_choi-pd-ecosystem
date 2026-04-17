'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Ban,
  Search,
  Loader2,
  X,
  Sparkles,
  FileText,
} from 'lucide-react';

interface Member {
  id: number;
  slug: string;
  name: string;
  email: string;
  businessType: string | null;
  region: string | null;
  status: string;
  bio: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  documentCount?: number;
  skillCount?: number;
  completeness?: number | null;
}

type StatusFilter = 'all' | 'pending_approval' | 'approved' | 'rejected' | 'suspended';

const statusTabs: { key: StatusFilter; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'all', label: '전체', icon: Users, color: 'text-gray-600' },
  { key: 'pending_approval', label: '승인 대기', icon: Clock, color: 'text-orange-500' },
  { key: 'approved', label: '승인됨', icon: CheckCircle, color: 'text-green-500' },
  { key: 'rejected', label: '거부됨', icon: XCircle, color: 'text-red-500' },
  { key: 'suspended', label: '정지됨', icon: Ban, color: 'text-gray-500' },
];

const statusBadge: Record<string, { label: string; bg: string }> = {
  pending_approval: { label: '승인 대기', bg: '#F59E0B' },
  approved: { label: '승인됨', bg: '#10B981' },
  rejected: { label: '거부됨', bg: '#EF4444' },
  suspended: { label: '정지', bg: '#6B7280' },
};

const businessTypeLabels: Record<string, string> = {
  individual: '개인',
  company: '기업',
  organization: '기관/단체',
};

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // 거부 사유 모달
  const [rejectModal, setRejectModal] = useState<{ memberId: number; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const url = activeTab === 'all'
        ? '/api/admin/members'
        : `/api/admin/members?status=${activeTab}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setMembers(data.members);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const updateMemberStatus = async (memberId: number, status: string, rejectionReason?: string) => {
    setActionLoading(memberId);
    try {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason }),
      });
      const data = await res.json();
      if (data.success) {
        fetchMembers();
        setRejectModal(null);
        setRejectReason('');
      }
    } catch (err) {
      console.error('Failed to update member:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredMembers = members.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.slug.toLowerCase().includes(q)
    );
  });

  const pageCount = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedMembers = filteredMembers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const tabCounts = members.reduce<Record<string, number>>((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={2} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#16325C]">회원 관리</h1>
            <p className="text-sm text-gray-500">
              총 {members.length}명의 회원
            </p>
          </div>
        </div>
      </div>

      {/* Tab filters */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-4">
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {statusTabs.map((tab) => {
              const Icon = tab.icon;
              const count = tab.key === 'all' ? members.length : (tabCounts[tab.key] || 0);
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-[#00A1E0] text-[#00A1E0]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00A1E0]' : tab.color}`} strokeWidth={2} />
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-[#00A1E0]/10 text-[#00A1E0]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="이름, 이메일, slug로 검색"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#00A1E0] animate-spin" strokeWidth={2} />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            회원이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">이름</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">이메일</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Slug</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">사업 유형</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">상태</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">신청일</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">액션</th>
                </tr>
              </thead>
              <tbody>
                {pagedMembers.map((member) => {
                  const badge = statusBadge[member.status] || { label: member.status, bg: '#6B7280' };
                  return (
                    <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/members/${member.slug}`}
                          className="text-sm font-medium text-[#16325C] hover:text-[#00A1E0] hover:underline"
                        >
                          {member.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400 font-mono">impd.me/{member.slug}</span>
                          {typeof member.completeness === 'number' && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                              member.completeness >= 70 ? 'bg-[#10B981]' :
                              member.completeness >= 40 ? 'bg-[#F59E0B]' :
                              'bg-[#EF4444]'
                            }`}>
                              완성도 {member.completeness}%
                            </span>
                          )}
                          {!!member.skillCount && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#7C3AED] font-semibold">
                              <Sparkles className="w-3 h-3" />
                              {member.skillCount}
                            </span>
                          )}
                          {!!member.documentCount && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#00A1E0] font-semibold">
                              <FileText className="w-3 h-3" />
                              {member.documentCount}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{member.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-gray-600">{member.slug}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {member.businessType ? businessTypeLabels[member.businessType] || member.businessType : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex px-2 py-0.5 rounded text-xs font-medium text-white"
                          style={{ background: badge.bg }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500">
                          {member.createdAt
                            ? new Date(member.createdAt).toLocaleDateString('ko-KR')
                            : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {member.status === 'pending_approval' && (
                            <>
                              <button
                                onClick={() => updateMemberStatus(member.id, 'approved')}
                                disabled={actionLoading === member.id}
                                className="px-2.5 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                              >
                                {actionLoading === member.id ? '...' : '승인'}
                              </button>
                              <button
                                onClick={() => setRejectModal({ memberId: member.id, name: member.name })}
                                disabled={actionLoading === member.id}
                                className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                              >
                                거부
                              </button>
                            </>
                          )}
                          {member.status === 'approved' && (
                            <button
                              onClick={() => updateMemberStatus(member.id, 'suspended')}
                              disabled={actionLoading === member.id}
                              className="px-2.5 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                              정지
                            </button>
                          )}
                          {member.status === 'suspended' && (
                            <button
                              onClick={() => updateMemberStatus(member.id, 'approved')}
                              disabled={actionLoading === member.id}
                              className="px-2.5 py-1.5 bg-[#00A1E0] text-white text-xs font-medium rounded hover:bg-[#0090C7] disabled:opacity-50 transition-colors"
                            >
                              복구
                            </button>
                          )}
                          {member.status === 'rejected' && (
                            <button
                              onClick={() => updateMemberStatus(member.id, 'approved')}
                              disabled={actionLoading === member.id}
                              className="px-2.5 py-1.5 bg-[#00A1E0] text-white text-xs font-medium rounded hover:bg-[#0090C7] disabled:opacity-50 transition-colors"
                            >
                              재승인
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {pageCount > 1 && (
              <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 text-sm">
                <span className="text-gray-600">
                  {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filteredMembers.length)} /{' '}
                  {filteredMembers.length}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-semibold rounded hover:bg-gray-50 disabled:opacity-40"
                  >
                    이전
                  </button>
                  <span className="flex items-center px-3 text-gray-700">
                    {currentPage} / {pageCount}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    disabled={currentPage >= pageCount}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-semibold rounded hover:bg-gray-50 disabled:opacity-40"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg border border-gray-200 w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-bold text-[#16325C]">
                회원 거부 - {rejectModal.name}
              </h2>
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" strokeWidth={2} />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                거부 사유 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="거부 사유를 입력해 주세요"
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0] resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => updateMemberStatus(rejectModal.memberId, 'rejected', rejectReason)}
                disabled={!rejectReason.trim() || actionLoading === rejectModal.memberId}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading === rejectModal.memberId ? '처리 중...' : '거부'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
