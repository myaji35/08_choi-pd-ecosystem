'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, Trash2, Link2, Globe, EyeOff, Eye } from 'lucide-react';

interface Project {
  id: number;
  key: string;
  name: string;
  baseUrl: string;
  brandColor: string | null;
  logoUrl: string | null;
  isEnabled: boolean;
}

interface IntegrationLink {
  id: number;
  distributorId: number;
  projectId: number;
  externalId: string;
  externalUrl: string | null;
  role: string | null;
  isPublic: boolean;
  syncStatus: 'pending' | 'ok' | 'error';
  syncError: string | null;
  lastSyncedAt: string | null;
  lastSnapshotJson: string | null;
  project: Project;
}

interface Props {
  distributorId: number;
}

export function DistributorIntegrationsPanel({ distributorId }: Props) {
  const [links, setLinks] = useState<IntegrationLink[]>([]);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ projectId: '', externalId: '', externalUrl: '', role: '' });
  const [testingId, setTestingId] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<Record<number, string>>({});

  useEffect(() => {
    void loadAll();
  }, [distributorId]);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [linksRes, projRes] = await Promise.all([
        fetch(`/api/admin/distributors/${distributorId}/integrations`),
        fetch('/api/admin/integration-projects?isEnabled=true'),
      ]);
      const linksJson = await linksRes.json();
      const projJson = await projRes.json();
      if (!linksJson.success) throw new Error(linksJson.error || 'links fetch failed');
      if (!projJson.success) throw new Error(projJson.error || 'projects fetch failed');
      setLinks(linksJson.integrations || []);
      setAvailableProjects(projJson.projects || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown');
    } finally {
      setLoading(false);
    }
  }

  async function onAdd() {
    setError(null);
    if (!addForm.projectId || !addForm.externalId) {
      setError('프로젝트와 external_id를 입력하세요.');
      return;
    }
    try {
      const res = await fetch(`/api/admin/distributors/${distributorId}/integrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: Number(addForm.projectId),
          externalId: addForm.externalId.trim(),
          externalUrl: addForm.externalUrl || null,
          role: addForm.role || null,
          isPublic: false,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || '추가 실패');
      setShowAddForm(false);
      setAddForm({ projectId: '', externalId: '', externalUrl: '', role: '' });
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown');
    }
  }

  async function onToggle(link: IntegrationLink) {
    try {
      await fetch(
        `/api/admin/distributors/${distributorId}/integrations/${link.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPublic: !link.isPublic }),
        },
      );
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown');
    }
  }

  async function onDelete(link: IntegrationLink) {
    if (!confirm(`"${link.project.name}" 연결을 해제하시겠습니까?`)) return;
    try {
      await fetch(
        `/api/admin/distributors/${distributorId}/integrations/${link.id}`,
        { method: 'DELETE' },
      );
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown');
    }
  }

  async function onTest(link: IntegrationLink) {
    setTestingId(link.id);
    setTestResult((prev) => ({ ...prev, [link.id]: '호출 중...' }));
    try {
      const res = await fetch(
        `/api/admin/distributors/${distributorId}/integrations/${link.id}/test`,
        { method: 'POST' },
      );
      const json = await res.json();
      if (json.success && json.snapshot) {
        const kpiCount = json.snapshot.kpis?.length ?? 0;
        const itemCount = json.snapshot.recentItems?.length ?? 0;
        setTestResult((prev) => ({
          ...prev,
          [link.id]: `✓ ${json.durationMs}ms · KPI ${kpiCount}개 · 최근 ${itemCount}개 · ${json.snapshot.displayName}`,
        }));
      } else {
        setTestResult((prev) => ({
          ...prev,
          [link.id]: `✗ HTTP ${json.httpStatus} · ${json.error || '알 수 없는 오류'}`,
        }));
      }
      await loadAll();
    } catch (e) {
      setTestResult((prev) => ({
        ...prev,
        [link.id]: `✗ ${e instanceof Error ? e.message : 'unknown'}`,
      }));
    } finally {
      setTestingId(null);
    }
  }

  const usedProjectIds = new Set(links.map((l) => l.projectId));
  const selectableProjects = availableProjects.filter((p) => !usedProjectIds.has(p.id));

  return (
    <Card className="border-gray-200">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-[#00A1E0]" />
          <CardTitle className="text-[#16325C] text-base">외부 프로젝트 연동</CardTitle>
        </div>
        {!showAddForm && (
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            disabled={selectableProjects.length === 0}
            className="bg-[#00A1E0] hover:bg-[#0288C7] text-white"
          >
            <Plus className="w-4 h-4 mr-1" /> 연결 추가
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="rounded-lg border border-[#00A1E0]/30 bg-blue-50/40 p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">프로젝트</label>
                <select
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-[#00A1E0]"
                  value={addForm.projectId}
                  onChange={(e) => setAddForm({ ...addForm, projectId: e.target.value })}
                >
                  <option value="">선택하세요</option>
                  {selectableProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  External ID
                </label>
                <Input
                  value={addForm.externalId}
                  onChange={(e) => setAddForm({ ...addForm, externalId: e.target.value })}
                  placeholder="byjreporter"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Profile URL (선택)
                </label>
                <Input
                  value={addForm.externalUrl}
                  onChange={(e) => setAddForm({ ...addForm, externalUrl: e.target.value })}
                  placeholder="https://townin.kr/byjreporter"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  역할 (선택)
                </label>
                <Input
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  placeholder="파트너 · 기자 · 전문가"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setError(null);
                }}
              >
                취소
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onAdd}
                className="bg-[#00A1E0] hover:bg-[#0288C7] text-white"
              >
                추가
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-500">불러오는 중...</p>
        ) : links.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg">
            연결된 프로젝트가 없습니다. "연결 추가" 버튼으로 시작하세요.
          </div>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <div
                key={link.id}
                className="rounded-lg border border-gray-200 bg-white p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {link.project.brandColor && (
                      <span
                        aria-hidden
                        className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: link.project.brandColor }}
                      />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-[#16325C] truncate">
                        {link.project.name}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                          {link.externalId}
                        </code>
                        {link.role && (
                          <Badge
                            style={{
                              background: link.project.brandColor || '#6B7280',
                              color: 'white',
                            }}
                            className="text-[10px]"
                          >
                            {link.role}
                          </Badge>
                        )}
                        {link.syncStatus === 'ok' && (
                          <Badge style={{ background: '#10B981', color: 'white' }}>동기화 OK</Badge>
                        )}
                        {link.syncStatus === 'error' && (
                          <Badge style={{ background: '#EF4444', color: 'white' }}>오류</Badge>
                        )}
                        {link.syncStatus === 'pending' && (
                          <Badge style={{ background: '#6B7280', color: 'white' }}>대기</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onTest(link)}
                      disabled={testingId === link.id}
                      className="text-[#00A1E0]"
                      title="실시간 테스트 호출"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${testingId === link.id ? 'animate-spin' : ''}`}
                      />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggle(link)}
                      className={link.isPublic ? 'text-[#10B981]' : 'text-gray-400'}
                      title={link.isPublic ? '공개됨 (클릭으로 비공개)' : '비공개 (클릭으로 공개)'}
                    >
                      {link.isPublic ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(link)}
                      className="text-red-500 hover:bg-red-50"
                      title="연결 해제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {testResult[link.id] && (
                  <div
                    className={`text-xs px-2 py-1.5 rounded ${
                      testResult[link.id].startsWith('✓')
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : testResult[link.id].startsWith('✗')
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {testResult[link.id]}
                  </div>
                )}

                {link.syncError && !testResult[link.id] && (
                  <div className="text-xs px-2 py-1.5 rounded bg-red-50 text-red-700 border border-red-200">
                    마지막 동기화 오류: {link.syncError}
                  </div>
                )}

                {link.externalUrl && (
                  <a
                    href={link.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#00A1E0] hover:underline inline-flex items-center gap-1"
                  >
                    <Globe className="w-3 h-3" />
                    {link.externalUrl.replace(/^https?:\/\//, '')}
                  </a>
                )}

                {link.lastSyncedAt && (
                  <p className="text-[10px] text-gray-400">
                    마지막 동기화: {new Date(link.lastSyncedAt).toLocaleString('ko-KR')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
