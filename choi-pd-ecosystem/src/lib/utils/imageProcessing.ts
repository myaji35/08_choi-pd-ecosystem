import sharp from 'sharp';

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * 이미지 파일에서 메타데이터 추출
 */
export async function extractImageMetadata(
  fileBuffer: Buffer
): Promise<ImageMetadata> {
  const metadata = await sharp(fileBuffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('이미지 크기를 확인할 수 없습니다.');
  }

  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format || 'unknown',
    size: fileBuffer.length,
  };
}

/**
 * 이미지 리사이즈 (16:9 비율 유지)
 */
export async function resizeImage(
  fileBuffer: Buffer,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<Buffer> {
  return await sharp(fileBuffer)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer();
}

/**
 * 이미지 최적화 (WebP 변환)
 */
export async function optimizeImage(
  fileBuffer: Buffer,
  quality: number = 85
): Promise<Buffer> {
  return await sharp(fileBuffer)
    .webp({ quality })
    .toBuffer();
}

/**
 * 이미지 크롭 (중앙 기준 16:9 비율로)
 */
export async function cropToAspectRatio(
  fileBuffer: Buffer,
  targetWidth: number = 1920,
  targetHeight: number = 1080
): Promise<Buffer> {
  const metadata = await sharp(fileBuffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('이미지 크기를 확인할 수 없습니다.');
  }

  const targetRatio = targetWidth / targetHeight;
  const currentRatio = metadata.width / metadata.height;

  let cropWidth = metadata.width;
  let cropHeight = metadata.height;

  if (currentRatio > targetRatio) {
    // 이미지가 더 넓음 - 좌우 크롭
    cropWidth = Math.round(metadata.height * targetRatio);
  } else if (currentRatio < targetRatio) {
    // 이미지가 더 높음 - 상하 크롭
    cropHeight = Math.round(metadata.width / targetRatio);
  }

  const left = Math.round((metadata.width - cropWidth) / 2);
  const top = Math.round((metadata.height - cropHeight) / 2);

  return await sharp(fileBuffer)
    .extract({
      left,
      top,
      width: cropWidth,
      height: cropHeight,
    })
    .resize(targetWidth, targetHeight)
    .toBuffer();
}
