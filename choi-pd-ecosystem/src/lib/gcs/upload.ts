import { getHeroImageBucket } from './client';
import { HERO_IMAGE_CONSTANTS, HERO_IMAGE_ERRORS } from '../constants';

export interface UploadResult {
  success: boolean;
  url?: string;
  publicUrl?: string;
  error?: string;
}

/**
 * 파일명 생성 (타임스탬프 기반)
 */
export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  return `hero-${timestamp}.${extension}`;
}

/**
 * GCS에 파일 업로드
 */
export async function uploadToGCS(
  file: File | Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  try {
    const bucket = getHeroImageBucket();
    const blob = bucket.file(`hero/${filename}`);

    // 파일 데이터 준비
    let fileBuffer: Buffer;
    if (file instanceof Buffer) {
      fileBuffer = file;
    } else {
      const arrayBuffer = await (file as File).arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    }

    // 업로드 옵션
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType,
        cacheControl: 'public, max-age=31536000', // 1년
      },
      timeout: HERO_IMAGE_CONSTANTS.GCS_UPLOAD_TIMEOUT,
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        reject({
          success: false,
          error: `${HERO_IMAGE_ERRORS.GCS_UPLOAD_FAILED}: ${error.message}`,
        });
      });

      blobStream.on('finish', async () => {
        try {
          // 공개 URL 생성
          await blob.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

          resolve({
            success: true,
            url: blob.name,
            publicUrl,
          });
        } catch (error) {
          reject({
            success: false,
            error: `공개 URL 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
          });
        }
      });

      blobStream.end(fileBuffer);
    });
  } catch (error) {
    return {
      success: false,
      error: `${HERO_IMAGE_ERRORS.GCS_UPLOAD_FAILED}: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    };
  }
}

/**
 * 재시도 로직이 포함된 업로드
 */
export async function uploadWithRetry(
  file: File | Buffer,
  filename: string,
  contentType: string,
  retries: number = HERO_IMAGE_CONSTANTS.UPLOAD_MAX_RETRIES
): Promise<UploadResult> {
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await uploadToGCS(file, filename, contentType);

      if (result.success) {
        return result;
      }

      lastError = result.error;

      // 마지막 시도가 아니면 대기 후 재시도
      if (attempt < retries) {
        await new Promise(resolve =>
          setTimeout(resolve, HERO_IMAGE_CONSTANTS.UPLOAD_RETRY_DELAY * attempt)
        );
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : '알 수 없는 오류';

      if (attempt < retries) {
        await new Promise(resolve =>
          setTimeout(resolve, HERO_IMAGE_CONSTANTS.UPLOAD_RETRY_DELAY * attempt)
        );
      }
    }
  }

  return {
    success: false,
    error: `${retries}번 시도 후 업로드 실패: ${lastError}`,
  };
}

/**
 * GCS에서 파일 삭제
 */
export async function deleteFromGCS(filename: string): Promise<{ success: boolean; error?: string }> {
  try {
    const bucket = getHeroImageBucket();
    const file = bucket.file(`hero/${filename}`);

    await file.delete();

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `파일 삭제 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    };
  }
}

/**
 * 서명된 URL 생성 (임시 접근용)
 */
export async function generateSignedUrl(
  filename: string,
  expiresInMinutes: number = 60
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const bucket = getHeroImageBucket();
    const file = bucket.file(`hero/${filename}`);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });

    return { success: true, url };
  } catch (error) {
    return {
      success: false,
      error: `서명된 URL 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    };
  }
}
