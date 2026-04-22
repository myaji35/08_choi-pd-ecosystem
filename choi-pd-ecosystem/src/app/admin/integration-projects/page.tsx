'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Plus, ExternalLink, Link2 } from 'lucide-react';

interface IntegrationProject {
  id: number;
  key: string;
  name: string;
  description: string | null;
  baseUrl: string;
  apiBaseUrl: string | null;
  endpointTemplate: string | null;
  authType: 'none' | 'api_key' | 'bearer' | 'oauth2';
  adapterKey: string | null;
  brandColor: string | null;
  logoUrl: string | null;
  isEnabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const authLabels = {
  none: '인증 없음',
  api_key: 'API Key',
  bearer: 'Bearer Token',
  oauth2: 'OAuth2',
};

export default function IntegrationProjectsListPage() {
  const [projects, setProjects] = useState<IntegrationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/integration-projects');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || '목록을 불러오지 못했습니다.');
      }
      setProjects(json.projects ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F2F2] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-[#16325C]">
                <ArrowLeft className="w-4 h-4 mr-1" /> 어드민
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#16325C] flex items-center gap-2">
                <Link2 className="w-6 h-6" /> 통합 연동 프로젝트
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                imPD 생태계에 연결할 외부 프로젝트를 등록하고 상태를 관리합니다.
                회원별 연결은{' '}
                <Link href="/admin/distributors" className="text-[#00A1E0] underline">
                  회원 상세
                </Link>{' '}
                페이지에서 설정합니다.
              </p>
            </div>
          </div>
          <Link href="/admin/integration-projects/new">
            <Button className="bg-[#00A1E0] hover:bg-[#0288C7] text-white">
              <Plus className="w-4 h-4 mr-1" /> 새 프로젝트
            </Button>
          </Link>
        </div>

        {/* Project Count Summary */}
        <Card className="border-gray-200">
          <CardContent className="py-4 text-sm text-gray-700">
            등록된 프로젝트: <span className="font-semibold text-[#16325C]">{projects.length}</span>
            {' · '}활성:{' '}
            <span className="font-semibold text-[#10B981]">
              {projects.filter((p) => p.isEnabled).length}
            </span>
            {' · '}비활성:{' '}
            <span className="font-semibold text-gray-500">
              {projects.filter((p) => !p.isEnabled).length}
            </span>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-[#16325C]">프로젝트 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {loading ? (
              <div className="py-12 text-center text-sm text-gray-500">불러오는 중…</div>
            ) : projects.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-sm text-gray-600">
                  아직 등록된 프로젝트가 없습니다. 첫 프로젝트를 추가하세요.
                </p>
                <Link href="/admin/integration-projects/new">
                  <Button className="bg-[#00A1E0] hover:bg-[#0288C7] text-white">
                    <Plus className="w-4 h-4 mr-1" /> 새 프로젝트 등록
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead>Base URL</TableHead>
                    <TableHead>인증</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <code className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {p.key}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {p.brandColor && (
                            <span
                              aria-hidden
                              className="inline-block w-2.5 h-2.5 rounded-full"
                              style={{ background: p.brandColor }}
                            />
                          )}
                          <span className="font-medium text-[#16325C]">{p.name}</span>
                        </div>
                        {p.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {p.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <a
                          href={p.baseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-[#00A1E0] hover:underline inline-flex items-center gap-1"
                        >
                          {p.baseUrl.replace(/^https?:\/\//, '')}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {authLabels[p.authType]}
                      </TableCell>
                      <TableCell>
                        {p.isEnabled ? (
                          <Badge style={{ background: '#10B981', color: 'white' }}>활성</Badge>
                        ) : (
                          <Badge style={{ background: '#6B7280', color: 'white' }}>비활성</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/integration-projects/${p.id}`}>
                          <Button variant="ghost" size="sm" className="text-[#00A1E0]">
                            편집
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
