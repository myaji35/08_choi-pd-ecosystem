'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Briefcase, FileText } from 'lucide-react';

interface ProfileFormProps {
  initialData: {
    name: string;
    title: string;
    email: string;
    phone: string;
    bio: string;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: '저장 완료',
        description: '프로필이 성공적으로 업데이트되었습니다',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '프로필 업데이트에 실패했습니다',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>개인 정보</CardTitle>
        <CardDescription>
          웹사이트에 표시될 개인 프로필 정보를 입력하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              이름
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="최범희"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              직함/소개
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="스마트폰 창업 전략가"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@choipd.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              전화번호
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="010-XXXX-XXXX"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              소개글
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="자기소개 및 경력을 입력하세요"
              rows={5}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? '저장 중...' : '저장하기'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
