'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Upload } from 'lucide-react';

export default function NewResourcePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    fileType: 'document' as 'pdf' | 'video' | 'image' | 'document' | 'template',
    fileSize: '',
    category: 'marketing' as 'marketing' | 'training' | 'contract' | 'promotional' | 'technical',
    requiredPlan: 'all' as 'basic' | 'premium' | 'enterprise' | 'all',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.fileUrl || !formData.fileType || !formData.category) {
      setError('필수 항목을 모두 입력해주세요');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fileSize: formData.fileSize ? parseInt(formData.fileSize) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/resources');
      } else {
        setError(data.error || '리소스 추가에 실패했습니다');
      }
    } catch (err) {
      setError('리소스 추가 중 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/resources')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">새 리소스 추가</h1>
            <p className="text-sm text-gray-600">분양자용 자료를 등록합니다</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>리소스 정보</CardTitle>
              <CardDescription>
                분양자들이 다운로드할 수 있는 자료를 등록하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">제목 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="예: 마케팅 브로셔 템플릿"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="리소스에 대한 간단한 설명을 입력하세요"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="fileUrl">파일 URL *</Label>
                  <Input
                    id="fileUrl"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder="https://example.com/file.pdf"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    파일이 호스팅된 URL을 입력하세요 (향후 업로드 기능 추가 예정)
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="fileType">파일 타입 *</Label>
                    <Select
                      value={formData.fileType}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, fileType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="파일 타입 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="video">비디오</SelectItem>
                        <SelectItem value="image">이미지</SelectItem>
                        <SelectItem value="document">문서</SelectItem>
                        <SelectItem value="template">템플릿</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fileSize">파일 크기 (bytes)</Label>
                    <Input
                      id="fileSize"
                      type="number"
                      value={formData.fileSize}
                      onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                      placeholder="예: 1048576 (1MB)"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="category">카테고리 *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketing">마케팅</SelectItem>
                        <SelectItem value="training">교육</SelectItem>
                        <SelectItem value="contract">계약서</SelectItem>
                        <SelectItem value="promotional">홍보</SelectItem>
                        <SelectItem value="technical">기술</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="requiredPlan">필요 플랜 *</Label>
                    <Select
                      value={formData.requiredPlan}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, requiredPlan: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="플랜 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체 (무료)</SelectItem>
                        <SelectItem value="basic">Basic 이상</SelectItem>
                        <SelectItem value="premium">Premium 이상</SelectItem>
                        <SelectItem value="enterprise">Enterprise 전용</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>안내:</strong> 현재는 외부 URL을 통해 파일을 제공합니다.
                    향후 업데이트에서 직접 파일 업로드 기능이 추가될 예정입니다.
                  </p>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/admin/resources')}
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? '등록 중...' : '리소스 추가'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
