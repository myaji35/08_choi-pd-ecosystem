'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Search,
  Plus,
  FileText,
  Video,
  Image as ImageIcon,
  File,
  Download,
  Edit,
  Trash2,
} from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: 'pdf' | 'video' | 'image' | 'document' | 'template';
  fileSize: number | null;
  category: 'marketing' | 'training' | 'contract' | 'promotional' | 'technical';
  requiredPlan: 'basic' | 'premium' | 'enterprise' | 'all';
  downloadCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categoryLabels = {
  marketing: '마케팅',
  training: '교육',
  contract: '계약서',
  promotional: '홍보',
  technical: '기술',
};

const planLabels = {
  basic: 'Basic',
  premium: 'Premium',
  enterprise: 'Enterprise',
  all: '전체',
};

const fileTypeIcons = {
  pdf: FileText,
  video: Video,
  image: ImageIcon,
  document: File,
  template: File,
};

export default function ResourcesPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchResources();
  }, [categoryFilter]);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }

      const response = await fetch(`/api/admin/resources?${params}`);
      const data = await response.json();

      if (data.success) {
        setResources(data.resources);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말로 이 리소스를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/resources/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchResources();
      }
    } catch (error) {
      console.error('Failed to delete resource:', error);
    }
  };

  const filteredResources = resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">리소스 관리</h1>
            <p className="text-sm text-gray-600">분양자용 자료 및 템플릿을 관리합니다</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Actions Bar */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="제목이나 설명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm"
            >
              <option value="all">전체 카테고리</option>
              <option value="marketing">마케팅</option>
              <option value="training">교육</option>
              <option value="contract">계약서</option>
              <option value="promotional">홍보</option>
              <option value="technical">기술</option>
            </select>
          </div>
          <Button onClick={() => router.push('/admin/resources/new')}>
            <Plus className="mr-2 h-4 w-4" />
            새 리소스 추가
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{resources.length}</div>
              <p className="text-xs text-gray-600">전체 리소스</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {resources.filter((r) => r.category === 'marketing').length}
              </div>
              <p className="text-xs text-gray-600">마케팅</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {resources.filter((r) => r.category === 'training').length}
              </div>
              <p className="text-xs text-gray-600">교육</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">
                {resources.filter((r) => r.category === 'contract').length}
              </div>
              <p className="text-xs text-gray-600">계약서</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">
                {resources.reduce((sum, r) => sum + r.downloadCount, 0)}
              </div>
              <p className="text-xs text-gray-600">총 다운로드</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>리소스 목록</CardTitle>
            <CardDescription>
              {filteredResources.length}개의 리소스
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">로딩 중...</div>
            ) : filteredResources.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                등록된 리소스가 없습니다
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>제목</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead>파일 타입</TableHead>
                      <TableHead>크기</TableHead>
                      <TableHead>필요 플랜</TableHead>
                      <TableHead>다운로드</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>등록일</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResources.map((resource) => {
                      const Icon = fileTypeIcons[resource.fileType];
                      return (
                        <TableRow key={resource.id}>
                          <TableCell className="font-mono text-xs">
                            #{resource.id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium">{resource.title}</div>
                                {resource.description && (
                                  <div className="text-xs text-gray-500 truncate max-w-xs">
                                    {resource.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {categoryLabels[resource.category]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {resource.fileType.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatFileSize(resource.fileSize)}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-800">
                              {planLabels[resource.requiredPlan]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center gap-1">
                              <Download className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{resource.downloadCount}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {resource.isActive ? (
                              <Badge className="bg-green-100 text-green-800">활성</Badge>
                            ) : (
                              <Badge variant="secondary">비활성</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(resource.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  router.push(`/admin/resources/${resource.id}`)
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(resource.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
