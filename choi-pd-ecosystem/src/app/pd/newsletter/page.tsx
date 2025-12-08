'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Mail, Download, Trash2, UserPlus } from 'lucide-react';

interface Subscriber {
  id: number;
  email: string;
  subscribedAt: Date;
}

export default function NewsletterPage() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pd/newsletter');
      const data = await response.json();

      if (data.success) {
        setSubscribers(data.subscribers);
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 이 구독자를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/pd/newsletter/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchSubscribers();
      } else {
        alert('삭제 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to delete subscriber:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['ID', 'Email', 'Subscribed At'].join(','),
      ...filteredSubscribers.map(sub =>
        [sub.id, sub.email, new Date(sub.subscribedAt).toISOString()].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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

  // 검색 필터
  const filteredSubscribers = subscribers.filter(sub =>
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="text-xl font-bold">뉴스레터 구독자 관리</h1>
              <p className="text-sm text-gray-600">이메일 구독자 목록</p>
            </div>
          </div>
          <Button onClick={exportToCSV} disabled={subscribers.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            CSV 내보내기
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 px-4 md:px-6">
        {/* Statistics Card */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 구독자</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscribers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">뉴스레터 구독자</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이번 달 신규</CardTitle>
              <UserPlus className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {subscribers.filter(sub => {
                  const subDate = new Date(sub.subscribedAt);
                  const now = new Date();
                  return subDate.getMonth() === now.getMonth() &&
                         subDate.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">30일 이내 가입</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">검색 결과</CardTitle>
              <Mail className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{filteredSubscribers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">현재 필터 적용</p>
            </CardContent>
          </Card>
        </div>

        {/* Subscribers Table */}
        <Card>
          <CardHeader>
            <CardTitle>구독자 목록</CardTitle>
            <CardDescription>
              <div className="flex items-center justify-between mt-4">
                <div className="flex-1 max-w-sm">
                  <Input
                    placeholder="이메일 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">구독자 로딩 중...</p>
              </div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchQuery ? '검색 결과가 없습니다' : '구독자가 없습니다'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>구독일</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium">{subscriber.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {subscriber.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(subscriber.subscribedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(subscriber.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>구독 폼 안내</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                • 뉴스레터 구독은 홈페이지의 구독 폼을 통해 자동으로 추가됩니다.
              </p>
              <p>
                • API: <code className="bg-gray-100 px-2 py-1 rounded">POST /api/pd/newsletter</code>
              </p>
              <p>
                • 구독자 데이터는 CSV 형식으로 내보낼 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
