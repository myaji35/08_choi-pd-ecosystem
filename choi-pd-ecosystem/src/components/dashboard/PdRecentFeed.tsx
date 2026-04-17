'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Send, Mail, MessageSquare, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface FeedItem {
  id: string;
  kind: 'scheduled' | 'inquiry' | 'subscriber';
  title: string;
  subtitle: string;
  href: string;
  status?: string;
  createdAt: string;
}

function formatRelative(dateStr: string) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return date.toLocaleDateString('ko-KR');
}

function statusBadge(status?: string) {
  if (!status) return null;
  const map: Record<string, { label: string; color: string; Icon: typeof CheckCircle }> = {
    published: { label: '발행됨', color: 'text-green-600', Icon: CheckCircle },
    failed: { label: '실패', color: 'text-red-600', Icon: AlertCircle },
    pending: { label: '대기', color: 'text-yellow-600', Icon: Clock },
    contacted: { label: '처리중', color: 'text-blue-600', Icon: MessageSquare },
    closed: { label: '완료', color: 'text-gray-600', Icon: CheckCircle },
  };
  const info = map[status];
  if (!info) return null;
  const { Icon } = info;
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${info.color}`}>
      <Icon className="h-3 w-3" />
      {info.label}
    </span>
  );
}

function iconFor(kind: FeedItem['kind']) {
  if (kind === 'scheduled') return Send;
  if (kind === 'inquiry') return MessageSquare;
  return Mail;
}

export default function PdRecentFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const [postsRes, inqRes, subRes] = await Promise.allSettled([
          fetch('/api/pd/scheduled-posts').then((r) => r.json()),
          fetch('/api/pd/inquiries').then((r) => r.json()),
          fetch('/api/pd/newsletter').then((r) => r.json()),
        ]);

        const merged: FeedItem[] = [];

        if (postsRes.status === 'fulfilled' && postsRes.value?.success) {
          const posts = (postsRes.value.posts || []).slice(0, 5);
          for (const p of posts) {
            merged.push({
              id: `post-${p.id}`,
              kind: 'scheduled',
              title: `${p.platform} 예약 포스트`,
              subtitle: (p.message || '').slice(0, 80) || '메시지 없음',
              href: '/pd/scheduled-posts',
              status: p.status,
              createdAt: p.updatedAt || p.createdAt || p.scheduledAt,
            });
          }
        }

        if (inqRes.status === 'fulfilled' && inqRes.value?.success) {
          const inqs = (inqRes.value.inquiries || []).slice(0, 5);
          for (const i of inqs) {
            merged.push({
              id: `inq-${i.id}`,
              kind: 'inquiry',
              title: `${i.type === 'b2b' ? 'B2B' : '일반'} 문의 · ${i.name}`,
              subtitle: (i.message || '').slice(0, 80),
              href: '/pd/inquiries',
              status: i.status,
              createdAt: i.createdAt,
            });
          }
        }

        if (subRes.status === 'fulfilled' && subRes.value?.success) {
          const subs = (subRes.value.subscribers || []).slice(0, 3);
          for (const s of subs) {
            merged.push({
              id: `sub-${s.id}`,
              kind: 'subscriber',
              title: '뉴스레터 신규 구독',
              subtitle: s.email,
              href: '/pd/newsletter',
              createdAt: s.subscribedAt,
            });
          }
        }

        merged.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        if (!cancelled) setItems(merged.slice(0, 10));
      } catch (err) {
        console.error('PD feed load failed:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card className="border-gray-200">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-600" />
            최근 활동
          </CardTitle>
          <CardDescription>예약 포스트, 문의, 신규 구독자</CardDescription>
        </div>
        <div className="flex gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href="/pd/scheduled-posts">포스트</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/pd/inquiries">문의</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 text-center text-sm text-gray-500">불러오는 중...</div>
        ) : items.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-500">
            아직 활동이 없습니다. 포스트를 예약하거나 구독 폼을 배포하세요.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((item) => {
              const Icon = iconFor(item.kind);
              return (
                <li key={item.id} className="py-2.5">
                  <Link
                    href={item.href}
                    className="flex items-start gap-3 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                  >
                    <Icon className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </span>
                        {statusBadge(item.status)}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{item.subtitle}</div>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {formatRelative(item.createdAt)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
