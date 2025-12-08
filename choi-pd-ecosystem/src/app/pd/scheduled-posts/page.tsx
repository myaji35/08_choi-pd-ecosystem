'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Calendar, Plus, CheckCircle, Clock, AlertCircle, Send } from 'lucide-react';

interface ScheduledPost {
  id: number;
  contentType: 'posts' | 'courses' | 'works';
  contentId: number;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  accountId: number;
  message: string;
  imageUrl: string | null;
  link: string | null;
  scheduledAt: Date;
  status: 'pending' | 'publishing' | 'published' | 'failed' | 'cancelled';
  publishedAt: Date | null;
  externalPostId: string | null;
  error: string | null;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
  account?: any;
}

interface SnsAccount {
  id: number;
  platform: string;
  accountName: string;
  isActive: boolean;
}

const statusConfig = {
  pending: { label: '대기중', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  publishing: { label: '발행중', color: 'bg-blue-100 text-blue-800', icon: Send },
  published: { label: '발행됨', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  failed: { label: '실패', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  cancelled: { label: '취소됨', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
};

export default function ScheduledPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [accounts, setAccounts] = useState<SnsAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    contentType: 'posts' as 'posts' | 'courses' | 'works',
    contentId: '',
    platform: 'facebook' as 'facebook' | 'instagram' | 'twitter' | 'linkedin',
    accountId: '',
    message: '',
    imageUrl: '',
    link: '',
    scheduledAt: '',
  });

  useEffect(() => {
    fetchPosts();
    fetchAccounts();
  }, [statusFilter]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const url = statusFilter !== 'all'
        ? `/api/pd/scheduled-posts?status=${statusFilter}`
        : '/api/pd/scheduled-posts';
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch scheduled posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/pd/sns-accounts?activeOnly=true');
      const data = await response.json();

      if (data.success) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Failed to fetch SNS accounts:', error);
    }
  };

  const handleAddPost = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/pd/scheduled-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          contentId: parseInt(formData.contentId),
          accountId: parseInt(formData.accountId),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAddDialogOpen(false);
        setFormData({
          contentType: 'posts',
          contentId: '',
          platform: 'facebook',
          accountId: '',
          message: '',
          imageUrl: '',
          link: '',
          scheduledAt: '',
        });
        fetchPosts();
      } else {
        alert('예약 포스트 생성 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to add scheduled post:', error);
      alert('예약 포스트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Statistics
  const stats = {
    total: posts.length,
    pending: posts.filter(p => p.status === 'pending').length,
    published: posts.filter(p => p.status === 'published').length,
    failed: posts.filter(p => p.status === 'failed').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/pd/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">예약 포스트 관리</h1>
              <p className="text-sm text-gray-600">SNS 자동 포스팅 예약</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="pending">대기중</SelectItem>
                <SelectItem value="published">발행됨</SelectItem>
                <SelectItem value="failed">실패</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  예약 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>예약 포스트 추가</DialogTitle>
                  <DialogDescription>
                    SNS 자동 포스팅을 예약하세요
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contentType">콘텐츠 타입</Label>
                      <Select
                        value={formData.contentType}
                        onValueChange={(value: any) => setFormData({ ...formData, contentType: value })}
                      >
                        <SelectTrigger id="contentType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="posts">게시글</SelectItem>
                          <SelectItem value="courses">강좌</SelectItem>
                          <SelectItem value="works">작품</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contentId">콘텐츠 ID</Label>
                      <Input
                        id="contentId"
                        type="number"
                        value={formData.contentId}
                        onChange={(e) => setFormData({ ...formData, contentId: e.target.value })}
                        placeholder="1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform">플랫폼</Label>
                      <Select
                        value={formData.platform}
                        onValueChange={(value: any) => setFormData({ ...formData, platform: value })}
                      >
                        <SelectTrigger id="platform">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountId">계정</Label>
                      <Select
                        value={formData.accountId}
                        onValueChange={(value) => setFormData({ ...formData, accountId: value })}
                      >
                        <SelectTrigger id="accountId">
                          <SelectValue placeholder="계정 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts
                            .filter(a => a.platform === formData.platform)
                            .map(account => (
                              <SelectItem key={account.id} value={account.id.toString()}>
                                {account.accountName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">메시지</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="포스트 내용을 입력하세요"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">이미지 URL (선택)</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="link">링크 URL (선택)</Label>
                    <Input
                      id="link"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledAt">예약 시간</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleAddPost} disabled={isSubmitting}>
                    {isSubmitting ? '추가 중...' : '예약 추가'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 px-4 md:px-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 예약</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">예약된 포스트</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">대기중</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">발행 대기</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">발행됨</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
              <p className="text-xs text-muted-foreground mt-1">성공적으로 발행</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">실패</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <p className="text-xs text-muted-foreground mt-1">발행 실패</p>
            </CardContent>
          </Card>
        </div>

        {/* Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle>예약 포스트 목록</CardTitle>
            <CardDescription>모든 예약된 SNS 포스트를 관리하세요</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">예약 포스트 로딩 중...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">예약된 포스트가 없습니다</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>플랫폼</TableHead>
                      <TableHead>계정</TableHead>
                      <TableHead>메시지</TableHead>
                      <TableHead>예약 시간</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>발행일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => {
                      const statusInfo = statusConfig[post.status];
                      const StatusIcon = statusInfo.icon;

                      return (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">{post.id}</TableCell>
                          <TableCell className="capitalize">{post.platform}</TableCell>
                          <TableCell>
                            {post.account ? post.account.accountName : `ID: ${post.accountId}`}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {post.message}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(post.scheduledAt)}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {post.publishedAt ? formatDate(post.publishedAt) : '-'}
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
