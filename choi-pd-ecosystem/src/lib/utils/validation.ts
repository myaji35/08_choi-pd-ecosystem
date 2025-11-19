import { HERO_IMAGE_CONSTANTS, HERO_IMAGE_ERRORS } from '../constants';

/**
 * 파일 타입 검증
 */
export function validateFileType(file: File): { valid: boolean; error?: string } {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  // MIME 타입 검증
  if (!HERO_IMAGE_CONSTANTS.ALLOWED_FILE_TYPES.includes(fileType as any)) {
    return { valid: false, error: HERO_IMAGE_ERRORS.INVALID_FILE_TYPE };
  }

  // 파일 확장자 검증
  const hasValidExtension = HERO_IMAGE_CONSTANTS.ALLOWED_FILE_EXTENSIONS.some(ext =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return { valid: false, error: HERO_IMAGE_ERRORS.INVALID_FILE_TYPE };
  }

  return { valid: true };
}

/**
 * 파일 크기 검증
 */
export function validateFileSize(file: File): { valid: boolean; error?: string } {
  if (file.size > HERO_IMAGE_CONSTANTS.MAX_FILE_SIZE) {
    return { valid: false, error: HERO_IMAGE_ERRORS.FILE_TOO_LARGE };
  }

  return { valid: true };
}

/**
 * 이미지 차원 검증
 */
export async function validateImageDimensions(
  file: File
): Promise<{ valid: boolean; error?: string; width?: number; height?: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { width, height } = img;

      // 최소 크기 검증
      if (width < HERO_IMAGE_CONSTANTS.MIN_WIDTH || height < HERO_IMAGE_CONSTANTS.MIN_HEIGHT) {
        resolve({ valid: false, error: HERO_IMAGE_ERRORS.INVALID_DIMENSIONS });
        return;
      }

      resolve({ valid: true, width, height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ valid: false, error: '이미지를 로드할 수 없습니다.' });
    };

    img.src = objectUrl;
  });
}

/**
 * Alt 텍스트 검증
 */
export function validateAltText(altText: string): { valid: boolean; error?: string } {
  const trimmedAltText = altText.trim();

  if (trimmedAltText.length < HERO_IMAGE_CONSTANTS.ALT_TEXT_MIN_LENGTH) {
    return { valid: false, error: HERO_IMAGE_ERRORS.INVALID_ALT_TEXT };
  }

  if (trimmedAltText.length > HERO_IMAGE_CONSTANTS.ALT_TEXT_MAX_LENGTH) {
    return { valid: false, error: HERO_IMAGE_ERRORS.INVALID_ALT_TEXT };
  }

  return { valid: true };
}

/**
 * 히어로 이미지 전체 검증 (클라이언트 사이드)
 */
export async function validateHeroImage(
  file: File,
  altText: string
): Promise<{ valid: boolean; errors: string[]; dimensions?: { width: number; height: number } }> {
  const errors: string[] = [];
  let dimensions: { width: number; height: number } | undefined;

  // 파일 타입 검증
  const typeValidation = validateFileType(file);
  if (!typeValidation.valid && typeValidation.error) {
    errors.push(typeValidation.error);
  }

  // 파일 크기 검증
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid && sizeValidation.error) {
    errors.push(sizeValidation.error);
  }

  // Alt 텍스트 검증
  const altTextValidation = validateAltText(altText);
  if (!altTextValidation.valid && altTextValidation.error) {
    errors.push(altTextValidation.error);
  }

  // 이미지 차원 검증 (파일 타입이 유효할 때만)
  if (typeValidation.valid) {
    const dimensionsValidation = await validateImageDimensions(file);
    if (!dimensionsValidation.valid && dimensionsValidation.error) {
      errors.push(dimensionsValidation.error);
    } else if (dimensionsValidation.width && dimensionsValidation.height) {
      dimensions = {
        width: dimensionsValidation.width,
        height: dimensionsValidation.height,
      };
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    dimensions,
  };
}

/**
 * 이미지 비율 계산
 */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

/**
 * 이미지 비율이 권장 비율과 유사한지 확인
 */
export function isRecommendedAspectRatio(width: number, height: number): boolean {
  const aspectRatio = calculateAspectRatio(width, height);
  const recommendedRatio = HERO_IMAGE_CONSTANTS.RECOMMENDED_ASPECT_RATIO;

  // 5% 허용 오차
  const tolerance = 0.05;
  return Math.abs(aspectRatio - recommendedRatio) <= recommendedRatio * tolerance;
}

/**
 * 서버 사이드 파일 검증
 */
export function validateHeroImageServer(
  file: { type: string; size: number; name: string },
  altText: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 파일 타입 검증
  if (!HERO_IMAGE_CONSTANTS.ALLOWED_FILE_TYPES.includes(file.type as any)) {
    errors.push(HERO_IMAGE_ERRORS.INVALID_FILE_TYPE);
  }

  // 파일 확장자 검증
  const fileName = file.name.toLowerCase();
  const hasValidExtension = HERO_IMAGE_CONSTANTS.ALLOWED_FILE_EXTENSIONS.some(ext =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    errors.push(HERO_IMAGE_ERRORS.INVALID_FILE_TYPE);
  }

  // 파일 크기 검증
  if (file.size > HERO_IMAGE_CONSTANTS.MAX_FILE_SIZE) {
    errors.push(HERO_IMAGE_ERRORS.FILE_TOO_LARGE);
  }

  // Alt 텍스트 검증
  const trimmedAltText = altText.trim();
  if (
    trimmedAltText.length < HERO_IMAGE_CONSTANTS.ALT_TEXT_MIN_LENGTH ||
    trimmedAltText.length > HERO_IMAGE_CONSTANTS.ALT_TEXT_MAX_LENGTH
  ) {
    errors.push(HERO_IMAGE_ERRORS.INVALID_ALT_TEXT);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
