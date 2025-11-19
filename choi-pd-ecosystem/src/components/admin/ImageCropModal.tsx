'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
}

interface Point {
  x: number;
  y: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (location: Point) => {
    setCrop(location);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteHandler = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    // 800x800 크기로 리사이징
    const targetSize = 800;
    canvas.width = targetSize;
    canvas.height = targetSize;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      targetSize,
      targetSize
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);

    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImageBlob);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('이미지 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>프로필 사진 편집</DialogTitle>
          <DialogDescription>
            이미지를 드래그하거나 확대/축소하여 원하는 영역을 선택하세요.
            800x800 픽셀로 자동 리사이징됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-96 w-full bg-gray-100 rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteHandler}
            cropShape="round"
            showGrid={false}
          />
        </div>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">확대/축소</label>
            <Slider
              value={[zoom]}
              onValueChange={([value]) => setZoom(value)}
              min={1}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isProcessing}>
            {isProcessing ? '처리 중...' : '확정'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
