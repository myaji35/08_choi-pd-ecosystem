'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/hooks/use-session';
import { useTenant } from '@/lib/tenant/useTenant';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Image as ImageIcon, LogOut, User as UserIcon, Settings, Globe, Copy, ExternalLink, Check as CheckIcon, AlertTriangle, RefreshCw } from 'lucide-react';
import PdRecentFeed from '@/components/dashboard/PdRecentFeed';
import Image from 'next/image';
import dynamic from 'next/dynamic';

interface DashboardStats {
  activeSnsAccounts: number;
  scheduledPosts: number;
  subscribers: number;
}

interface OnboardingItem {
  key: string;
  label: string;
  done: boolean;
}

interface OnboardingData {
  checklist: OnboardingItem[];
  completedCount: number;
  totalCount: number;
  allComplete: boolean;
}

const ImageCropModal = dynamic(
  () => import('@/components/admin/ImageCropModal').then(mod => ({ default: mod.ImageCropModal })),
  { ssr: false }
);

export default function PDDashboard() {
  const router = useRouter();
  const { user, logout } = useSession();
  const { tenant } = useTenant();
  const { t } = useTranslation();
  const [profileImage, setProfileImage] = useState('/images/profile.jpg');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 이미지 크롭 상태
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState('');

  // 대시보드 지표 상태
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pd/dashboard/stats')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
          setOnboarding(data.onboarding);
        }
      })
      .catch(err => console.error('Failed to load dashboard stats:', err))
      .finally(() => setStatsLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadMessage('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadMessage('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setTempImageSrc(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setIsUploading(true);
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('file', croppedImageBlob, 'profile.jpg');

      const response = await fetch('/api/upload/profile', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setProfileImage(data.url + '?t=' + Date.now());
        setUploadMessage('프로필 사진이 업데이트되었습니다! 홈 화면에 자동 반영됩니다.');
        setTimeout(() => {
          router.refresh();
        }, 500);
      } else {
        setUploadMessage(data.error || '업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadMessage('업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const [copied, setCopied] = useState(false);
  const brandPageUrl = tenant?.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${tenant.slug}`
    : '';

  const handleCopyUrl = async () => {
    if (!brandPageUrl) return;
    try {
      await navigator.clipboard.writeText(brandPageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2F2]">
      {/* 헤더 */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">{tenant?.name || 'PD'} {t('dashboard.title')}</h1>
            {user ? (
              <div className="flex items-center gap-2 text-sm text-[#00A1E0]">
                <UserIcon className="h-4 w-4" />
                <span>{user.email || user.name}</span>
              </div>
            ) : null}
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container py-8">

        {/* ── 상단 지표 카드 3개 ── */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-6">
          {/* SNS 연결 계정 */}
          <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex items-center gap-4">
            <div className="flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00A1E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </div>
            <div>
              {statsLoading ? (
                <div className="h-7 w-10 bg-gray-200 animate-pulse rounded mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[#16325C]">{stats?.activeSnsAccounts ?? 0}</p>
              )}
              <p className="text-xs text-gray-500">SNS 연결 계정</p>
            </div>
          </div>

          {/* 예약 포스트 */}
          <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex items-center gap-4">
            <div className="flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00A1E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              {statsLoading ? (
                <div className="h-7 w-10 bg-gray-200 animate-pulse rounded mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[#16325C]">{stats?.scheduledPosts ?? 0}</p>
              )}
              <p className="text-xs text-gray-500">예약 포스트</p>
            </div>
          </div>

          {/* 구독자 수 */}
          <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex items-center gap-4">
            <div className="flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00A1E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              {statsLoading ? (
                <div className="h-7 w-10 bg-gray-200 animate-pulse rounded mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[#16325C]">{stats?.subscribers ?? 0}</p>
              )}
              <p className="text-xs text-gray-500">뉴스레터 구독자</p>
            </div>
          </div>
        </div>

        {/* ── 온보딩 진행률 체크리스트 ── */}
        {!statsLoading && onboarding && !onboarding.allComplete && (
          <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#16325C]">브랜드 세팅 진행률</p>
              <span className="text-xs text-gray-500">{onboarding.completedCount}/{onboarding.totalCount} 완료</span>
            </div>
            {/* 진행률 바 */}
            <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
              <div
                className="h-2 bg-[#00A1E0] rounded-full transition-all duration-500"
                style={{ width: `${(onboarding.completedCount / onboarding.totalCount) * 100}%` }}
              />
            </div>
            {/* 체크리스트 항목 */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {onboarding.checklist.map(item => (
                <div key={item.key} className={`flex items-center gap-2 text-sm ${item.done ? 'text-gray-400 line-through' : 'text-[#16325C]'}`}>
                  {item.done ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00A1E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                  )}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 온보딩 완료 배너 ── */}
        {!statsLoading && onboarding?.allComplete && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-5 py-3 mb-6 flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p className="text-sm font-semibold text-green-700">브랜드 세팅 완료! 모든 항목을 완성했습니다.</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 내 브랜드 페이지 / 빈 상태 CTA */}
          {!tenant?.slug && (
            <Link href="/onboarding" className="block">
              <div className="h-full min-h-[180px] flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-lg bg-white px-6 py-8 text-center hover:border-[#00A1E0] hover:bg-blue-50/30 transition-colors">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00A1E0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                <p className="text-sm font-semibold text-[#16325C]">아직 브랜드 페이지가 없습니다</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#00A1E0]">
                  지금 만들기
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </div>
            </Link>
          )}
          {tenant?.slug && (
            <Card className="border-2 border-[#00A1E0]/30 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[#00A1E0]" />
                  내 브랜드 페이지
                </CardTitle>
                <CardDescription>
                  공개 브랜드 페이지 URL을 공유하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5">
                  <span className="text-sm text-gray-700 truncate flex-1 font-mono">
                    /p/{tenant.slug}
                  </span>
                  <button
                    onClick={handleCopyUrl}
                    className="flex-shrink-0 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                    title="URL 복사"
                  >
                    {copied ? (
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 font-medium">URL이 클립보드에 복사되었습니다.</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-300"
                    asChild
                  >
                    <a href={`/p/${tenant.slug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      페이지 보기
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-300"
                    asChild
                  >
                    <Link href="/pd/settings">
                      <Settings className="mr-1.5 h-3.5 w-3.5" />
                      편집
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 프로필 사진 관리 */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                프로필 사진 관리
              </CardTitle>
              <CardDescription>
                홈페이지 Hero 섹션에 표시되는 프로필 사진을 변경할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-gray-200 shadow-lg">
                  <Image
                    src={profileImage}
                    alt="현재 프로필 사진"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                  size="lg"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  {isUploading ? '업로드 중...' : '새 사진 업로드'}
                </Button>
              </div>

              {uploadMessage && (
                <p
                  className={`text-center text-sm ${
                    uploadMessage.includes('업데이트') || uploadMessage.includes('성공')
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {uploadMessage}
                </p>
              )}

              <div className="rounded-lg bg-blue-50 p-3 text-xs text-[#16325C]">
                <p className="font-semibold">업로드 안내:</p>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>JPG, PNG, GIF 형식 지원</li>
                  <li>크롭 후 800x800으로 리사이징</li>
                  <li>홈 화면에 자동 반영</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 최근 활동 피드 */}
          <PdRecentFeed />

          {/* 빠른 링크 — 콘텐츠 관리 */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>빠른 링크</CardTitle>
              <CardDescription>주요 관리 페이지로 이동</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 콘텐츠 관리 */}
              <div>
                <p className="text-xs font-semibold text-[#16325C] mb-2">콘텐츠 관리</p>
                <div className="space-y-1.5">
                  <Button variant="outline" className="w-full justify-start border-gray-300" asChild>
                    <Link href="/pd/dashboard/profile">{t('dashboard.profile')}</Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-300" asChild>
                    <Link href="/pd/dashboard/hero-images">Hero 이미지</Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-300" asChild>
                    <Link href="/pd/dashboard/kanban">칸반 보드</Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-300" asChild>
                    <Link href="/pd/inquiries">문의 관리</Link>
                  </Button>
                </div>
              </div>

              {/* SNS / 마케팅 */}
              <div>
                <p className="text-xs font-semibold text-[#16325C] mb-2">SNS / 마케팅</p>
                <div className="space-y-1.5">
                  <Button variant="outline" className="w-full justify-start border-gray-300" asChild>
                    <Link href="/pd/sns-accounts">SNS 계정 관리</Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-300" asChild>
                    <Link href="/pd/scheduled-posts">예약 포스트</Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-300" asChild>
                    <Link href="/pd/newsletter">뉴스레터 구독자</Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-300" asChild>
                    <Link href="/pd/notifications">알림 테스트</Link>
                  </Button>
                </div>
              </div>

              {/* 사이트 관리 */}
              <div>
                <p className="text-xs font-semibold text-[#16325C] mb-2">사이트 관리</p>
                <div className="space-y-1.5">
                  <Button variant="outline" className="w-full justify-start border-gray-300" asChild>
                    <Link href="/pd/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('nav.settings')} (브랜딩/도메인)
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-300" asChild>
                    <Link href="/admin/dashboard">분양 관리 대시보드</Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-300" asChild>
                    <Link href="/">홈페이지 보기</Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-300" asChild>
                    <Link href="/education">교육 페이지</Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-300" asChild>
                    <Link href="/media">미디어 페이지</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 계정 정보 */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                계정 정보
              </CardTitle>
              <CardDescription>
                계정 정보
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {user ? (
                <>
                  <div>
                    <p className="text-sm font-medium text-[#16325C]">이름</p>
                    <p className="text-sm text-[#00A1E0]">{user.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#16325C]">이메일</p>
                    <p className="text-sm text-[#00A1E0]">{user.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#16325C]">역할</p>
                    <p className="text-sm text-[#00A1E0]">{user.role === 'admin' ? '관리자' : '회원'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#16325C]">로그인 방식</p>
                    <p className="text-sm text-[#00A1E0]">{user.provider === 'google' ? 'Google' : 'TowninGraph'}</p>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i}>
                      <div className="h-3.5 w-12 animate-pulse bg-gray-200 rounded mb-1.5" />
                      <div className="h-3.5 w-32 animate-pulse bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 이미지 크롭 모달 */}
      <ImageCropModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        imageSrc={tempImageSrc}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
