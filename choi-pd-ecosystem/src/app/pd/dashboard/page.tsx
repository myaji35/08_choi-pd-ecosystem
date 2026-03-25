'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Image as ImageIcon, LogOut, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import { ImageCropModal } from '@/components/admin/ImageCropModal';

export default function PDDashboard() {
  const router = useRouter();
  const { user, logout } = useSession();
  const [profileImage, setProfileImage] = useState('/images/profile.jpg');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 이미지 크롭 상태
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState('');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* 헤더 */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">PD 관리자 대시보드</h1>
            {user ? (
              <div className="flex items-center gap-2 text-sm text-purple-600">
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
                <a href="/pd/sns-accounts">SNS 계정 관리</a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/pd/scheduled-posts">예약 포스트</a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/pd/dashboard/hero-images">Hero 이미지</a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/pd/dashboard/kanban">칸반 보드</a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/pd/newsletter">뉴스레터 구독자</a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/pd/inquiries">문의 관리</a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/pd/notifications">알림 테스트</a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin/dashboard">분양 관리 대시보드</a>
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
                계정 정보
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {user ? (
                <>
                  <div>
                    <p className="text-sm font-medium text-purple-900">이름</p>
                    <p className="text-sm text-purple-600">{user.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-900">이메일</p>
                    <p className="text-sm text-purple-600">{user.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-900">역할</p>
                    <p className="text-sm text-purple-600">{user.role === 'admin' ? '관리자' : '회원'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-900">로그인 방식</p>
                    <p className="text-sm text-purple-600">{user.provider === 'google' ? 'Google' : 'TowninGraph'}</p>
                  </div>
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
