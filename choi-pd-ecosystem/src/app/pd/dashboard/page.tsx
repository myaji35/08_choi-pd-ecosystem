'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Image as ImageIcon, LogOut, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import { ImageCropModal } from '@/components/admin/ImageCropModal';

const IS_DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

export default function PDDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [profileImage, setProfileImage] = useState('/images/profile.jpg');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 이미지 크롭 상태
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState('');

  const handleLogout = async () => {
    if (IS_DEV_MODE) {
      document.cookie = 'dev-auth=; path=/; max-age=0';
      router.push('/pd/login');
      router.refresh();
    } else {
      await signOut();
      router.push('/');
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* 헤더 */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">PD 관리자 대시보드</h1>
            {IS_DEV_MODE ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                  개발 모드
                </span>
                <span className="text-purple-600">admin</span>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2 text-sm text-purple-600">
                <UserIcon className="h-4 w-4" />
                <span>{user.primaryEmailAddress?.emailAddress || user.username}</span>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 프로필 사진 관리 */}
          <Card>
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
                <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-purple-200 shadow-lg">
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

              <div className="rounded-lg bg-purple-50 p-3 text-xs text-purple-900">
                <p className="font-semibold">업로드 안내:</p>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>JPG, PNG, GIF 형식 지원</li>
                  <li>크롭 후 800x800으로 리사이징</li>
                  <li>홈 화면에 자동 반영</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 빠른 링크 */}
          <Card>
            <CardHeader>
              <CardTitle>빠른 링크</CardTitle>
              <CardDescription>주요 관리 페이지로 이동</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/pd/dashboard/profile">프로필 설정</a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/pd/dashboard/social">소셜 미디어</a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/pd/dashboard/hero-images">Hero 이미지</a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/pd/dashboard/kanban">칸반 보드</a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/pd/dashboard/newsletter">뉴스레터 구독자</a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/">홈페이지 보기</a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/education">교육 페이지</a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/media">미디어 페이지</a>
              </Button>
            </CardContent>
          </Card>

          {/* 계정 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                계정 정보
              </CardTitle>
              <CardDescription>
                {IS_DEV_MODE ? '개발 모드' : 'Clerk 계정 정보'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {IS_DEV_MODE ? (
                <>
                  <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                    <p className="font-semibold text-yellow-900 mb-2">🔧 개발 모드</p>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• 빠른 로그인: admin / admin</li>
                      <li>• 비밀번호 제약 없음</li>
                      <li>• 프로덕션은 Clerk 사용</li>
                    </ul>
                  </div>
                  <p className="text-xs text-purple-600">
                    개발 모드를 비활성화하려면 .env.local에서 NEXT_PUBLIC_DEV_MODE=false로 설정하세요
                  </p>
                </>
              ) : user ? (
                <>
                  <div>
                    <p className="text-sm font-medium text-purple-900">이메일</p>
                    <p className="text-sm text-purple-600">
                      {user.primaryEmailAddress?.emailAddress || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-900">사용자명</p>
                    <p className="text-sm text-purple-600">{user.username || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-900">계정 ID</p>
                    <p className="text-xs text-purple-500 font-mono break-all">{user.id}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('https://dashboard.clerk.com', '_blank')}
                  >
                    Clerk 대시보드에서 관리
                  </Button>
                </>
              ) : (
                <p className="text-sm text-gray-500">사용자 정보 불러오는 중...</p>
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
