'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  content: string;
  category: 'notice' | 'review' | 'media';
  published: boolean;
  createdAt: Date;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'notice' as 'notice' | 'review' | 'media',
    published: true,
  });

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/posts/${postId}`);
      const data = await response.json();

      if (data.success) {
        setFormData({
          title: data.post.title,
          content: data.post.content,
          category: data.post.category,
          published: data.post.published,
        });
      } else {
        alert('게시글을 불러올 수 없습니다.');
        router.push('/admin/posts');
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
      alert('게시글을 불러오는 중 오류가 발생했습니다.');
      router.push('/admin/posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('게시글이 수정되었습니다.');
        router.push('/admin/posts');
      } else {
        alert('게시글 수정 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('게시글 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('게시글이 삭제되었습니다.');
        router.push('/admin/posts');
      } else {
        alert('삭제 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('게시글 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Simple Markdown preview renderer
  const renderMarkdown = (text: string) => {
    let html = text;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" class="text-blue-600 underline">$1</a>');

    // Line breaks
    html = html.replace(/\n/gim, '<br/>');

    return html;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/posts')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              목록으로
            </Button>
            <h1 className="text-xl font-bold">게시글 수정</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsPreview(!isPreview)}>
              <Eye className="mr-2 h-4 w-4" />
              {isPreview ? '편집' : '미리보기'}
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>게시글 정보</CardTitle>
            <CardDescription>
              마크다운 문법을 사용할 수 있습니다 (# 제목, ** 굵게 **, * 기울임 *, [링크](URL))
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isPreview ? (
              <>
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">제목 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="게시글 제목을 입력하세요"
                    className="text-lg"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리 *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notice">공지사항</SelectItem>
                      <SelectItem value="review">수강 후기</SelectItem>
                      <SelectItem value="media">언론 보도</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">내용 *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="게시글 내용을 입력하세요&#10;&#10;마크다운 문법:&#10;# 큰 제목&#10;## 중간 제목&#10;### 작은 제목&#10;**굵은 텍스트**&#10;*기울임 텍스트*&#10;[링크 텍스트](https://example.com)"
                    rows={20}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-600">
                    현재 {formData.content.length}자
                  </p>
                </div>

                {/* Published */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="published" className="cursor-pointer">
                    즉시 공개 (체크 해제 시 임시저장)
                  </Label>
                </div>
              </>
            ) : (
              <>
                {/* Preview Mode */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{formData.title || '제목 없음'}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {formData.category === 'notice'
                          ? '공지사항'
                          : formData.category === 'review'
                          ? '수강 후기'
                          : '언론 보도'}
                      </span>
                      <span>•</span>
                      <span>{new Date().toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                  <hr />
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(formData.content || '내용 없음'),
                    }}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
