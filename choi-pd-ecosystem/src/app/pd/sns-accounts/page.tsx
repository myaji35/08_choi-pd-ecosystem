'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { ArrowLeft, Facebook, Instagram, Twitter, Linkedin, Plus, Trash2, RefreshCw } from 'lucide-react';

interface SnsAccount {
  id: number;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  accountName: string;
  accountId: string | null;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
  isActive: boolean;
  lastSyncedAt: Date | null;
  metadata: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const platformConfig = {
  facebook: { label: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
  instagram: { label: 'Instagram', icon: Instagram, color: 'bg-pink-600' },
  twitter: { label: 'Twitter', icon: Twitter, color: 'bg-sky-500' },
  linkedin: { label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
};

export default function SnsAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<SnsAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    platform: 'facebook' as 'facebook' | 'instagram' | 'twitter' | 'linkedin',
    accountName: '',
    accountId: '',
    accessToken: '',
    refreshToken: '',
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pd/sns-accounts');
      const data = await response.json();

      if (data.success) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Failed to fetch SNS accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccount = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/pd/sns-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setIsAddDialogOpen(false);
        setFormData({
          platform: 'facebook',
          accountName: '',
          accountId: '',
          accessToken: '',
          refreshToken: '',
        });
        fetchAccounts();
      } else {
        alert('계정 추가 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to add SNS account:', error);
      alert('계정 추가 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (!confirm('정말 이 계정을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/pd/sns-accounts/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchAccounts();
      } else {
        alert('계정 삭제 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to delete SNS account:', error);
      alert('계정 삭제 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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
              <h1 className="text-xl font-bold">SNS 계정 관리</h1>
              <p className="text-sm text-gray-600">소셜 미디어 계정 연동</p>
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                계정 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>SNS 계정 추가</DialogTitle>
                <DialogDescription>
                  새로운 소셜 미디어 계정을 연동하세요
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">플랫폼</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value: any) => setFormData({ ...formData, platform: value })}
                  >
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="플랫폼 선택" />
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
                  <Label htmlFor="accountName">계정 이름</Label>
                  <Input
                    id="accountName"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="예: 최PD 공식 계정"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountId">계정 ID (선택)</Label>
                  <Input
                    id="accountId"
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    placeholder="플랫폼의 계정 ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    value={formData.accessToken}
                    onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                    placeholder="API Access Token"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refreshToken">Refresh Token (선택)</Label>
                  <Input
                    id="refreshToken"
                    type="password"
                    value={formData.refreshToken}
                    onChange={(e) => setFormData({ ...formData, refreshToken: e.target.value })}
                    placeholder="API Refresh Token"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleAddAccount} disabled={isSubmitting}>
                  {isSubmitting ? '추가 중...' : '계정 추가'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 px-4 md:px-6">
        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {Object.entries(platformConfig).map(([key, config]) => {
            const Icon = config.icon;
            const count = accounts.filter(a => a.platform === key && a.isActive).length;

            return (
              <Card key={key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                  <p className="text-xs text-muted-foreground mt-1">연동된 계정</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Accounts Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">계정 로딩 중...</p>
          </div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>연동된 계정이 없습니다</CardTitle>
              <CardDescription>SNS 계정을 추가하여 자동 포스팅을 시작하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                첫 번째 계정 추가하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => {
              const config = platformConfig[account.platform];
              const Icon = config.icon;

              return (
                <Card key={account.id} className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-2 ${config.color}`} />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${config.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{account.accountName}</CardTitle>
                          <CardDescription>{config.label}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={account.isActive ? 'default' : 'secondary'}>
                        {account.isActive ? '활성' : '비활성'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {account.accountId && (
                        <div>
                          <span className="text-gray-500">계정 ID:</span>{' '}
                          <span className="font-medium">{account.accountId}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">마지막 동기화:</span>{' '}
                        <span className="font-medium">{formatDate(account.lastSyncedAt)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">등록일:</span>{' '}
                        <span className="font-medium">{formatDate(account.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        동기화
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAccount(account.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
