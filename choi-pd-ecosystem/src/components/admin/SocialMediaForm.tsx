'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Facebook, Instagram, Youtube, Linkedin, Twitter, Globe, Eye, EyeOff, Lock, Link as LinkIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SocialMediaFormProps {
  initialData: {
    facebook: string;
    instagram: string;
    youtube: string;
    linkedin: string;
    twitter: string;
    blog: string;
    facebook_password?: string;
    instagram_password?: string;
    youtube_password?: string;
    linkedin_password?: string;
    twitter_password?: string;
    blog_password?: string;
  };
}

export function SocialMediaForm({ initialData }: SocialMediaFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/social', {
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
        description: '소셜 미디어 계정 정보가 성공적으로 업데이트되었습니다',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '소셜 미디어 업데이트에 실패했습니다',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const socialPlatforms = [
    {
      key: 'facebook',
      label: 'Facebook',
      icon: Facebook,
      placeholder: 'https://facebook.com/your-page',
      description: '페이스북 페이지 또는 개인 프로필 주소',
      color: 'text-blue-600'
    },
    {
      key: 'instagram',
      label: 'Instagram',
      icon: Instagram,
      placeholder: 'https://instagram.com/your-account',
      description: '인스타그램 프로필 주소',
      color: 'text-pink-600'
    },
    {
      key: 'youtube',
      label: 'YouTube',
      icon: Youtube,
      placeholder: 'https://youtube.com/@your-channel',
      description: '유튜브 채널 주소',
      color: 'text-red-600'
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      placeholder: 'https://linkedin.com/in/your-profile',
      description: '링크드인 프로필 주소',
      color: 'text-blue-700'
    },
    {
      key: 'twitter',
      label: 'Twitter / X',
      icon: Twitter,
      placeholder: 'https://twitter.com/your-account',
      description: '트위터(X) 프로필 주소',
      color: 'text-sky-500'
    },
    {
      key: 'blog',
      label: '블로그',
      icon: Globe,
      placeholder: 'https://your-blog.com',
      description: '개인 블로그 또는 웹사이트 주소',
      color: 'text-emerald-600'
    },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-3 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <LinkIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">소셜 미디어 계정 관리</CardTitle>
            <CardDescription className="mt-1.5">
              각 플랫폼의 계정 정보를 안전하게 관리합니다
            </CardDescription>
          </div>
        </div>
        <Separator />
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {socialPlatforms.map((platform) => {
            const Icon = platform.icon;
            const passwordKey = `${platform.key}_password` as keyof typeof formData;
            const showPassword = showPasswords[platform.key];

            return (
              <Card key={platform.key} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-muted rounded-lg ${platform.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{platform.label}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {platform.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* URL Input */}
                    <div className="space-y-2">
                      <Label htmlFor={platform.key} className="text-sm font-medium flex items-center gap-2">
                        <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        프로필 URL
                      </Label>
                      <Input
                        id={platform.key}
                        type="url"
                        value={formData[platform.key as keyof typeof formData] || ''}
                        onChange={(e) => setFormData({ ...formData, [platform.key]: e.target.value })}
                        placeholder={platform.placeholder}
                        className="h-11"
                      />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <Label htmlFor={passwordKey} className="text-sm font-medium flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                        계정 비밀번호
                        <span className="text-xs text-muted-foreground font-normal ml-1">(선택사항)</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id={passwordKey}
                          type={showPassword ? "text" : "password"}
                          value={formData[passwordKey] || ''}
                          onChange={(e) => setFormData({ ...formData, [passwordKey]: e.target.value })}
                          placeholder="비밀번호를 입력하세요"
                          autoComplete="new-password"
                          className="h-11 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(platform.key)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-3">
                    <Lock className="h-3 w-3" />
                    AES-256-GCM 알고리즘으로 암호화하여 안전하게 저장됩니다
                  </p>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 text-base font-semibold"
            >
              {isLoading ? '저장 중...' : '모든 변경사항 저장하기'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
