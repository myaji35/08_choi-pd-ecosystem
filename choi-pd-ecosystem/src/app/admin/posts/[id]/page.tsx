'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  content: string;
  category: 'notice' | 'review' | 'media';
  published: boolean;
  createdAt: Date;
}

const categoryLabels = {
  notice: '공지사항',
  review: '수강 후기',
  media: '언론 보도',
};

export default function ViewPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/posts/${postId}`);
      const data = await response.json();

      if (data.success) {
        setPost(data.post);
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

  // Simple Markdown renderer
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
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">$1</a>');

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

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">게시글을 찾을 수 없습니다.</p>
          <Button onClick={() => router.push('/admin/posts')} className="mt-4">
            목록으로 돌아가기
          </Button>
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
            <h1 className="text-xl font-bold">게시글 보기</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/admin/posts/${postId}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              수정
            </Button>
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                {categoryLabels[post.category]}
              </Badge>
              {post.published ? (
                <Badge className="bg-green-100 text-green-800">공개</Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-800">임시저장</Badge>
              )}
            </div>
            <CardTitle className="text-3xl">{post.title}</CardTitle>
            <CardDescription>
              작성일: {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(post.content),
              }}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
