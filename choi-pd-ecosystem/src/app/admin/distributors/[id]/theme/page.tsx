'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Eye, Palette } from 'lucide-react';

interface Distributor {
  id: number;
  name: string;
  email: string;
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
}

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  fontFamily: string;
  heroTitle: string;
  heroSubtitle: string;
}

const fontOptions = [
  { value: 'inter', label: 'Inter (기본)' },
  { value: 'pretendard', label: 'Pretendard' },
  { value: 'noto-sans-kr', label: 'Noto Sans KR' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'open-sans', label: 'Open Sans' },
];

const presetColors: Record<string, {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}> = {
  basic: {
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    accentColor: '#34d399',
  },
  premium: {
    primaryColor: '#3b82f6',
    secondaryColor: '#2563eb',
    accentColor: '#60a5fa',
  },
  enterprise: {
    primaryColor: '#8b5cf6',
    secondaryColor: '#7c3aed',
    accentColor: '#a78bfa',
  },
};;

export default function ThemeSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const distributorId = params.id as string;

  const [distributor, setDistributor] = useState<Distributor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    primaryColor: '#3b82f6',
    secondaryColor: '#2563eb',
    accentColor: '#60a5fa',
    logoUrl: '',
    fontFamily: 'inter',
    heroTitle: '',
    heroSubtitle: '',
  });

  useEffect(() => {
    fetchDistributor();
  }, [distributorId]);

  const fetchDistributor = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/distributors/${distributorId}`);
      const data = await response.json();

      if (data.success) {
        setDistributor(data.distributor);

        // Load existing theme settings or use preset based on plan
        const preset = presetColors[data.distributor.subscriptionPlan];
        setThemeSettings({
          ...themeSettings,
          ...preset,
          heroTitle: data.distributor.name,
          heroSubtitle: `${data.distributor.name}과 함께하는 스마트폰 창업 교육`,
        });
      }
    } catch (error) {
      console.error('Failed to fetch distributor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // In a real implementation, this would save to database
      // For now, we'll just show a success message
      alert('테마 설정이 저장되었습니다!\n\n실제 구현에서는 데이터베이스에 저장됩니다.');

    } catch (error) {
      console.error('Failed to save theme:', error);
      alert('테마 설정 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyPreset = () => {
    if (!distributor) return;
    const preset = presetColors[distributor.subscriptionPlan];
    setThemeSettings({ ...themeSettings, ...preset });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!distributor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">분양자를 찾을 수 없습니다.</p>
          <Button onClick={() => router.push('/admin/distributors')} className="mt-4">
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/admin/distributors/${distributorId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              분양자 상세
            </Button>
            <h1 className="text-xl font-bold">테마 설정</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsPreview(!isPreview)}>
              <Eye className="mr-2 h-4 w-4" />
              {isPreview ? '편집' : '미리보기'}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Settings */}
          <div className="space-y-6">
            {/* Distributor Info */}
            <Card>
              <CardHeader>
                <CardTitle>분양자 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">이름:</span>
                  <p className="font-medium">{distributor.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">이메일:</span>
                  <p className="font-medium">{distributor.email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">구독 플랜:</span>
                  <p className="font-medium capitalize">{distributor.subscriptionPlan}</p>
                </div>
              </CardContent>
            </Card>

            {/* Color Settings */}
            <Card>
              <CardHeader>
                <CardTitle>색상 설정</CardTitle>
                <CardDescription>
                  브랜드 색상을 커스터마이징하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleApplyPreset} variant="outline" className="w-full">
                  <Palette className="mr-2 h-4 w-4" />
                  플랜 기본 색상 적용
                </Button>

                <div className="space-y-2">
                  <Label htmlFor="primaryColor">주 색상 (Primary)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={themeSettings.primaryColor}
                      onChange={(e) =>
                        setThemeSettings({ ...themeSettings, primaryColor: e.target.value })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={themeSettings.primaryColor}
                      onChange={(e) =>
                        setThemeSettings({ ...themeSettings, primaryColor: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">보조 색상 (Secondary)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={themeSettings.secondaryColor}
                      onChange={(e) =>
                        setThemeSettings({ ...themeSettings, secondaryColor: e.target.value })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={themeSettings.secondaryColor}
                      onChange={(e) =>
                        setThemeSettings({ ...themeSettings, secondaryColor: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">강조 색상 (Accent)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={themeSettings.accentColor}
                      onChange={(e) =>
                        setThemeSettings({ ...themeSettings, accentColor: e.target.value })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={themeSettings.accentColor}
                      onChange={(e) =>
                        setThemeSettings({ ...themeSettings, accentColor: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Typography Settings */}
            <Card>
              <CardHeader>
                <CardTitle>타이포그래피</CardTitle>
                <CardDescription>
                  폰트를 선택하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="fontFamily">폰트</Label>
                  <Select
                    value={themeSettings.fontFamily}
                    onValueChange={(value) =>
                      setThemeSettings({ ...themeSettings, fontFamily: value })
                    }
                  >
                    <SelectTrigger id="fontFamily">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Hero Section Settings */}
            <Card>
              <CardHeader>
                <CardTitle>히어로 섹션</CardTitle>
                <CardDescription>
                  메인 페이지 상단 문구를 설정하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">제목</Label>
                  <Input
                    id="heroTitle"
                    value={themeSettings.heroTitle}
                    onChange={(e) =>
                      setThemeSettings({ ...themeSettings, heroTitle: e.target.value })
                    }
                    placeholder="예: 최PD의 스마트폰 연구소"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroSubtitle">부제목</Label>
                  <Input
                    id="heroSubtitle"
                    value={themeSettings.heroSubtitle}
                    onChange={(e) =>
                      setThemeSettings({ ...themeSettings, heroSubtitle: e.target.value })
                    }
                    placeholder="예: 50대 시니어를 위한 스마트폰 창업 교육"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>미리보기</CardTitle>
                <CardDescription>
                  실제 사이트에 적용될 모습입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="rounded-lg overflow-hidden border"
                  style={{
                    fontFamily: themeSettings.fontFamily,
                  }}
                >
                  {/* Preview Header */}
                  <div
                    className="p-4 text-white"
                    style={{ backgroundColor: themeSettings.primaryColor }}
                  >
                    <h3 className="text-xl font-bold">{distributor.name}</h3>
                    <p className="text-sm opacity-90">스마트폰 창업 교육 플랫폼</p>
                  </div>

                  {/* Preview Hero */}
                  <div
                    className="p-8 text-center"
                    style={{
                      background: `linear-gradient(to bottom right, ${themeSettings.primaryColor}15, ${themeSettings.accentColor}10)`,
                    }}
                  >
                    <h1 className="text-3xl font-bold mb-2">
                      {themeSettings.heroTitle || '제목을 입력하세요'}
                    </h1>
                    <p className="text-gray-600">
                      {themeSettings.heroSubtitle || '부제목을 입력하세요'}
                    </p>
                  </div>

                  {/* Preview Content */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      {['교육', '미디어', '작품'].map((item, index) => (
                        <div
                          key={item}
                          className="p-4 rounded-lg text-center"
                          style={{
                            backgroundColor: `${themeSettings.accentColor}20`,
                            borderColor: themeSettings.primaryColor,
                            borderWidth: '2px',
                          }}
                        >
                          <p className="font-semibold">{item}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      className="w-full py-3 px-4 rounded-lg text-white font-semibold"
                      style={{ backgroundColor: themeSettings.secondaryColor }}
                    >
                      문의하기
                    </button>

                    <div className="text-sm text-gray-600 text-center">
                      © 2025 {distributor.name}. All rights reserved.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Color Palette Preview */}
            <Card>
              <CardHeader>
                <CardTitle>색상 팔레트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-lg border-2"
                      style={{ backgroundColor: themeSettings.primaryColor }}
                    />
                    <div className="flex-1">
                      <p className="font-medium">Primary</p>
                      <p className="text-sm text-gray-600">{themeSettings.primaryColor}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-lg border-2"
                      style={{ backgroundColor: themeSettings.secondaryColor }}
                    />
                    <div className="flex-1">
                      <p className="font-medium">Secondary</p>
                      <p className="text-sm text-gray-600">{themeSettings.secondaryColor}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-lg border-2"
                      style={{ backgroundColor: themeSettings.accentColor }}
                    />
                    <div className="flex-1">
                      <p className="font-medium">Accent</p>
                      <p className="text-sm text-gray-600">{themeSettings.accentColor}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
