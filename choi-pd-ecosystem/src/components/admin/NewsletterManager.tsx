'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Trash2, Download, Users } from 'lucide-react';
import type { Lead } from '@/lib/db/schema';

interface NewsletterManagerProps {
  initialSubscribers: Lead[];
}

export function NewsletterManager({ initialSubscribers }: NewsletterManagerProps) {
  const [subscribers, setSubscribers] = useState<Lead[]>(initialSubscribers);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const { toast } = useToast();

  const handleDelete = async (id: number, email: string) => {
    if (!confirm("구독을 취소하시겠습니까?")) {
      return;
    }

    setIsDeleting(id);

    try {
      const response = await fetch(`/api/admin/newsletter/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      setSubscribers(subscribers.filter((sub) => sub.id !== id));
      toast({
        title: '삭제 완료',
        description: '구독자가 삭제되었습니다',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '삭제에 실패했습니다',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleExportCSV = () => {
    const rows = subscribers.map((sub) => {
      const timestamp = typeof sub.subscribedAt === 'number'
        ? sub.subscribedAt * 1000
        : sub.subscribedAt;
      const date = timestamp ? new Date(timestamp).toISOString() : '';
      return `${sub.email},${date}`;
    });
    const csv = '이메일,구독일시\n' + rows.join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const today = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `newsletter-${today}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: '내보내기 완료',
      description: 'CSV 파일이 다운로드되었습니다',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                뉴스레터 구독자
              </CardTitle>
              <CardDescription>
                총 {subscribers.length}명의 구독자가 있습니다
              </CardDescription>
            </div>
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              CSV 내보내기
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {subscribers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>아직 구독자가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              {subscribers.map((subscriber) => (
                <div
                  key={subscriber.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{subscriber.email}</p>
                      <p className="text-sm text-muted-foreground">
                        구독일: {subscriber.subscribedAt
                          ? new Date(
                              typeof subscriber.subscribedAt === 'number'
                                ? subscriber.subscribedAt * 1000
                                : subscriber.subscribedAt
                            ).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : '날짜 없음'}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(subscriber.id, subscriber.email)}
                    disabled={isDeleting === subscriber.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
