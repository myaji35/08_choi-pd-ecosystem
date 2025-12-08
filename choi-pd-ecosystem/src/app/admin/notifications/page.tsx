'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Bell, CheckCheck, Eye } from 'lucide-react';

interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'distributor' | 'payment' | 'inquiry' | 'resource' | 'system';
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

const categoryLabels = {
  distributor: '분양자',
  payment: '결제',
  inquiry: '문의',
  resource: '리소스',
  system: '시스템',
};

const typeColors = {
  info: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-orange-100 text-orange-800',
  error: 'bg-red-100 text-red-800',
};

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications?userType=admin');
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      const data = await response.json();

      if (data.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true, userType: 'admin' }),
      });

      const data = await response.json();

      if (data.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filterCategory !== 'all' && notification.category !== filterCategory) {
      return false;
    }
    if (filterStatus === 'unread' && notification.isRead) {
      return false;
    }
    if (filterStatus === 'read' && !notification.isRead) {
      return false;
    }
    return true;
  });

  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.isRead).length,
    read: notifications.filter((n) => n.isRead).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              대시보드
            </Button>
            <h1 className="text-xl font-bold">알림 센터</h1>
          </div>
          <Button onClick={handleMarkAllAsRead} disabled={stats.unread === 0}>
            <CheckCheck className="mr-2 h-4 w-4" />
            모두 읽음 처리
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 알림</CardTitle>
              <Bell className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">읽지 않음</CardTitle>
              <Bell className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">읽음</CardTitle>
              <CheckCheck className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.read}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>필터</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="distributor">분양자</SelectItem>
                  <SelectItem value="payment">결제</SelectItem>
                  <SelectItem value="inquiry">문의</SelectItem>
                  <SelectItem value="resource">리소스</SelectItem>
                  <SelectItem value="system">시스템</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="unread">읽지 않음</SelectItem>
                  <SelectItem value="read">읽음</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Table */}
        <Card>
          <CardHeader>
            <CardTitle>알림 목록</CardTitle>
            <CardDescription>총 {filteredNotifications.length}개 알림</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">로딩 중...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">알림이 없습니다</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">상태</TableHead>
                    <TableHead className="w-[120px]">카테고리</TableHead>
                    <TableHead className="w-[100px]">유형</TableHead>
                    <TableHead>제목</TableHead>
                    <TableHead>메시지</TableHead>
                    <TableHead>생성일</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map((notification) => (
                    <TableRow
                      key={notification.id}
                      className={!notification.isRead ? 'bg-blue-50/50' : ''}
                    >
                      <TableCell>
                        {notification.isRead ? (
                          <Badge variant="secondary">읽음</Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800">안읽음</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categoryLabels[notification.category]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={typeColors[notification.type]}>
                          {notification.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {notification.title}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {notification.message}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(notification.createdAt).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
