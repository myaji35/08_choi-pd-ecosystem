'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Image as ImageIcon, Upload, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HeroImagesManagerProps {
  initialImages: string[];
}

export function HeroImagesManager({ initialImages }: HeroImagesManagerProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAddImage = () => {
    if (!newImageUrl) {
      toast({
        title: '오류',
        description: '이미지 URL을 입력해주세요',
        variant: 'destructive',
      });
      return;
    }

    if (images.length >= 5) {
      toast({
        title: '오류',
        description: '최대 5개의 이미지만 등록할 수 있습니다',
        variant: 'destructive',
      });
      return;
    }

    try {
      new URL(newImageUrl); // URL 유효성 검증
      setImages([...images, newImageUrl]);
      setNewImageUrl('');
      toast({
        title: '추가됨',
        description: '이미지가 추가되었습니다. 저장 버튼을 눌러주세요.',
      });
    } catch {
      toast({
        title: '오류',
        description: '유효한 URL을 입력해주세요',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 5) {
      toast({
        title: '오류',
        description: '최대 5개의 이미지만 등록할 수 있습니다',
        variant: 'destructive',
      });
      return;
    }

    // 파일 타입 검증
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: '오류',
        description: 'JPG, PNG, GIF, WebP 파일만 업로드 가능합니다.',
        variant: 'destructive',
      });
      return;
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: '오류',
        description: '파일 크기는 10MB를 초과할 수 없습니다',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      setImages([...images, result.url]);
      toast({
        title: '업로드 완료',
        description: '이미지가 업로드되었습니다. 저장 버튼을 눌러주세요.',
      });

      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: '업로드 오류',
        description: error instanceof Error ? error.message : '이미지 업로드에 실패했습니다',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
    setImages(newImages);
  };

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    setImages(newImages);
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/hero-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: '저장 완료',
        description: 'Hero 이미지가 성공적으로 업데이트되었습니다',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : 'Hero 이미지 업데이트에 실패했습니다',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const defaultImages = [
    'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1920&h=1080&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1080&fit=crop&q=80',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&h=1080&fit=crop&q=80',
  ];

  const handleUseDefaults = () => {
    setImages(defaultImages);
    toast({
      title: '기본 이미지 설정',
      description: '기본 이미지가 추가되었습니다. 저장 버튼을 눌러주세요.',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>이미지 추가</CardTitle>
          <CardDescription>
            URL 입력 또는 파일 업로드로 이미지를 추가하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="url" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">
                <LinkIcon className="h-4 w-4 mr-2" />
                URL 입력
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                파일 업로드
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4 mt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://images.unsplash.com/... 또는 /uploads/image.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddImage()}
                />
                <Button onClick={handleAddImage} disabled={images.length >= 5}>
                  <Plus className="h-4 w-4 mr-2" />
                  추가
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="flex flex-col gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= 5 || isUploading}
                  variant="outline"
                  className="w-full h-24 border-2 border-dashed"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8" />
                    <span>
                      {isUploading ? '업로드 중...' : '클릭하여 이미지 파일 선택'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      JPG, PNG, GIF, WebP (최대 10MB)
                    </span>
                  </div>
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleUseDefaults} variant="outline" size="sm">
              <ImageIcon className="h-4 w-4 mr-2" />
              기본 이미지 사용
            </Button>
            <Button
              onClick={() => setImages([])}
              variant="outline"
              size="sm"
              disabled={images.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              모두 제거
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            {images.length}/5 개의 이미지 등록됨
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>등록된 이미지</CardTitle>
          <CardDescription>
            순서를 조정하거나 삭제할 수 있습니다 (순서대로 페이드 효과 적용)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              등록된 이미지가 없습니다
            </div>
          ) : (
            <div className="space-y-4">
              {images.map((imageUrl, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30"
                >
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === images.length - 1}
                    >
                      ↓
                    </Button>
                  </div>

                  <div className="relative w-32 h-20 rounded overflow-hidden border">
                    <Image
                      src={imageUrl}
                      alt={`Hero image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{imageUrl}</p>
                    <p className="text-xs text-muted-foreground">이미지 #{index + 1}</p>
                  </div>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isLoading} className="w-full" size="lg">
        {isLoading ? '저장 중...' : '저장하기'}
      </Button>
    </div>
  );
}
