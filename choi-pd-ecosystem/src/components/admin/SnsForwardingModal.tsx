'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Facebook, Instagram, Twitter, Linkedin, Calendar, Send, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface SnsAccount {
  id: number;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  accountName: string;
  isActive: boolean;
}

interface SnsForwardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'posts' | 'courses' | 'works';
  contentId: number;
  defaultMessage: string;
  defaultImageUrl?: string;
  defaultLink?: string;
  onSuccess?: () => void;
}

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
};

const platformColors = {
  facebook: 'text-blue-500',
  instagram: 'text-pink-500',
  twitter: 'text-sky-500',
  linkedin: 'text-blue-700',
};

const platformNames = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'Twitter/X',
  linkedin: 'LinkedIn',
};

export function SnsForwardingModal({
  isOpen,
  onClose,
  contentType,
  contentId,
  defaultMessage,
  defaultImageUrl,
  defaultLink,
  onSuccess,
}: SnsForwardingModalProps) {
  const [accounts, setAccounts] = useState<SnsAccount[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [message, setMessage] = useState(defaultMessage);
  const [imageUrl, setImageUrl] = useState(defaultImageUrl || '');
  const [link, setLink] = useState(defaultLink || '');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
      setMessage(defaultMessage);
      setImageUrl(defaultImageUrl || '');
      setLink(defaultLink || '');
      // 기본 예약 시간: 현재 시간 + 1시간
      const defaultTime = new Date();
      defaultTime.setHours(defaultTime.getHours() + 1);
      setScheduledAt(defaultTime.toISOString().slice(0, 16));
      setSelectedAccounts([]);
      setError('');
    }
  }, [isOpen, defaultMessage, defaultImageUrl, defaultLink]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/sns/accounts');
      const data = await response.json();

      if (data.success) {
        // 활성화된 계정만 표시
        const activeAccounts = data.data.filter((acc: SnsAccount) => acc.isActive);
        setAccounts(activeAccounts);
      }
    } catch (error) {
      console.error('Fetch accounts error:', error);
      setError('SNS 계정을 불러오는데 실패했습니다.');
    }
  };

  const toggleAccount = (accountId: number) => {
    if (selectedAccounts.includes(accountId)) {
      setSelectedAccounts(selectedAccounts.filter((id) => id !== accountId));
    } else {
      setSelectedAccounts([...selectedAccounts, accountId]);
    }
  };

  const handleSubmit = async () => {
    if (selectedAccounts.length === 0) {
      setError('최소 하나의 SNS 계정을 선택해주세요.');
      return;
    }

    if (!message.trim()) {
      setError('메시지를 입력해주세요.');
      return;
    }

    if (!scheduledAt) {
      setError('예약 시간을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 선택된 각 계정에 대해 예약 포스팅 생성
      const promises = selectedAccounts.map(async (accountId) => {
        const account = accounts.find((acc) => acc.id === accountId);
        if (!account) return null;

        const response = await fetch('/api/sns/schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contentType,
            contentId,
            platform: account.platform,
            accountId,
            message,
            imageUrl: imageUrl || null,
            link: link || null,
            scheduledAt,
          }),
        });

        return response.json();
      });

      const results = await Promise.all(promises);
      const failures = results.filter((r) => r && !r.success);

      if (failures.length === 0) {
        onSuccess?.();
        onClose();
      } else {
        setError(`${failures.length}개의 예약 포스팅 생성에 실패했습니다.`);
      }
    } catch (error) {
      console.error('Schedule posts error:', error);
      setError('예약 포스팅 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            SNS 포워딩 예약
          </DialogTitle>
          <DialogDescription>
            선택한 SNS 계정에 콘텐츠를 예약 포스팅합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-800 border border-red-200 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {/* SNS Account Selection */}
          <div className="space-y-3">
            <Label>SNS 계정 선택</Label>
            {accounts.length === 0 ? (
              <div className="text-sm text-gray-500 border rounded-lg p-4 text-center">
                <p>연결된 SNS 계정이 없습니다.</p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => window.open('/admin/sns-accounts', '_blank')}
                >
                  SNS 계정 연결하러 가기
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {accounts.map((account) => {
                  const Icon = platformIcons[account.platform];
                  const isSelected = selectedAccounts.includes(account.id);

                  return (
                    <div
                      key={account.id}
                      className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => toggleAccount(account.id)}
                    >
                      <Checkbox checked={isSelected} />
                      <Icon className={`h-5 w-5 ${platformColors[account.platform]}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{account.accountName}</p>
                        <p className="text-xs text-gray-500">
                          {platformNames[account.platform]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">메시지</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="SNS에 게시할 메시지를 입력하세요..."
              rows={4}
              maxLength={280}
            />
            <p className="text-xs text-gray-500 text-right">
              {message.length}/280 자
            </p>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">이미지 URL (선택사항)</Label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500">
              Instagram은 이미지가 필수입니다.
            </p>
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label htmlFor="link">링크 (선택사항)</Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          {/* Scheduled Time */}
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">예약 시간</Label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            <X className="mr-2 h-4 w-4" />
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? '예약 중...' : `${selectedAccounts.length}개 계정에 예약`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
