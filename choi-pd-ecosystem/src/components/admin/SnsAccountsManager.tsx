'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SnsAccount {
  id: number;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  accountName: string;
  accountId?: string;
  isActive: boolean;
  lastSyncedAt?: string;
  createdAt: string;
}

const platformConfig = {
  facebook: {
    icon: Facebook,
    color: 'bg-blue-500',
    label: 'Facebook',
  },
  instagram: {
    icon: Instagram,
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    label: 'Instagram',
  },
  twitter: {
    icon: Twitter,
    color: 'bg-black',
    label: 'Twitter/X',
  },
  linkedin: {
    icon: Linkedin,
    color: 'bg-blue-700',
    label: 'LinkedIn',
  },
};

export default function SnsAccountsManager() {
  const [accounts, setAccounts] = useState<SnsAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [accountName, setAccountName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/sns/accounts');
      const data = await response.json();
      if (data.success) {
        setAccounts(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthConnect = async () => {
    if (!selectedPlatform) return;

    setIsConnecting(true);
    try {
      const response = await fetch(`/api/sns/oauth/authorize?platform=${selectedPlatform}`);
      const data = await response.json();

      if (data.authUrl) {
        const authWindow = window.open(data.authUrl, '_blank', 'width=600,height=700');
        const checkInterval = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkInterval);
            setIsConnecting(false);
            setIsAddDialogOpen(false);
            fetchAccounts();
          }
        }, 1000);
      }
    } catch (error) {
      console.error('OAuth connection failed:', error);
      setIsConnecting(false);
    }
  };

  const toggleAccountStatus = async (accountId: number, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/sns/accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: accountId,
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        fetchAccounts();
      }
    } catch (error) {
      console.error('Failed to update account status:', error);
    }
  };

  const deleteAccount = async (accountId: number) => {
    if (!confirm('정말로 이 계정 연동을 해제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/sns/accounts?id=${accountId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAccounts();
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              SNS 계정 연결
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>SNS 계정 연결</DialogTitle>
              <DialogDescription>
                연결할 SNS 플랫폼을 선택하고 계정을 인증해주세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="platform">플랫폼 선택</Label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger id="platform">
                    <SelectValue placeholder="플랫폼을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="accountName">계정 이름 (표시용)</Label>
                <Input
                  id="accountName"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="예: 회사 공식 계정"
                />
              </div>
              <Button
                onClick={handleOAuthConnect}
                disabled={!selectedPlatform || isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    연결 중...
                  </>
                ) : (
                  '계정 연결하기'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Settings className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                연결된 SNS 계정이 없습니다
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                위 버튼을 클릭하여 SNS 계정을 연결해주세요.
              </p>
            </CardContent>
          </Card>
        ) : (
          accounts.map((account) => {
            const config = platformConfig[account.platform];
            const Icon = config.icon;

            return (
              <Card key={account.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`rounded-lg p-2 text-white ${config.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {account.accountName}
                        </CardTitle>
                        <CardDescription>
                          {config.label}
                        </CardDescription>
                      </div>
                    </div>
                    {account.isActive ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">
                      {account.accountId && (
                        <p>ID: {account.accountId}</p>
                      )}
                      <p>
                        연결일: {new Date(account.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                      {account.lastSyncedAt && (
                        <p>
                          마지막 동기화: {new Date(account.lastSyncedAt).toLocaleDateString('ko-KR')}
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant={account.isActive ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => toggleAccountStatus(account.id, account.isActive)}
                        className="flex-1"
                      >
                        {account.isActive ? '비활성화' : '활성화'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAccount(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        <h3 className="text-sm font-semibold text-blue-900">SNS 계정 연동 안내</h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-700">
          <li>• 각 플랫폼의 개발자 앱 설정이 필요합니다.</li>
          <li>• 연동된 계정으로 게시물이 자동 포워딩됩니다.</li>
          <li>• 비활성화된 계정은 포워딩에서 제외됩니다.</li>
        </ul>
      </div>
    </div>
  );
}