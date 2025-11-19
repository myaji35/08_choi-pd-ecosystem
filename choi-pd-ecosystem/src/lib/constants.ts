// Hero Image Constants
export const HERO_IMAGE_CONSTANTS = {
  // 파일 크기 제한 (bytes)
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB

  // 허용 파일 타입
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_FILE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],

  // 권장 이미지 비율 및 크기
  RECOMMENDED_ASPECT_RATIO: 16 / 9,
  RECOMMENDED_WIDTH: 1920,
  RECOMMENDED_HEIGHT: 1080,
  MIN_WIDTH: 1280,
  MIN_HEIGHT: 720,

  // Alt 텍스트 길이 제한
  ALT_TEXT_MIN_LENGTH: 10,
  ALT_TEXT_MAX_LENGTH: 200,

  // GCS 업로드 설정
  GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME || 'choi-pd-hero-images',
  GCS_UPLOAD_TIMEOUT: 30000, // 30초

  // 재시도 설정
  UPLOAD_MAX_RETRIES: 3,
  UPLOAD_RETRY_DELAY: 2000, // 2초
} as const;

// 에러 메시지
export const HERO_IMAGE_ERRORS = {
  FILE_TOO_LARGE: `파일 크기가 ${HERO_IMAGE_CONSTANTS.MAX_FILE_SIZE / 1024 / 1024}MB를 초과합니다.`,
  INVALID_FILE_TYPE: `지원되지 않는 파일 형식입니다. ${HERO_IMAGE_CONSTANTS.ALLOWED_FILE_EXTENSIONS.join(', ')}만 가능합니다.`,
  INVALID_DIMENSIONS: `이미지 크기가 너무 작습니다. 최소 ${HERO_IMAGE_CONSTANTS.MIN_WIDTH}x${HERO_IMAGE_CONSTANTS.MIN_HEIGHT}px 이상이어야 합니다.`,
  INVALID_ALT_TEXT: `대체 텍스트는 ${HERO_IMAGE_CONSTANTS.ALT_TEXT_MIN_LENGTH}자 이상 ${HERO_IMAGE_CONSTANTS.ALT_TEXT_MAX_LENGTH}자 이하여야 합니다.`,
  UPLOAD_FAILED: '이미지 업로드에 실패했습니다. 다시 시도해주세요.',
  DELETE_ACTIVE_IMAGE: '활성 이미지는 삭제할 수 없습니다.',
  IMAGE_NOT_FOUND: '이미지를 찾을 수 없습니다.',
  GCS_UPLOAD_FAILED: 'Google Cloud Storage 업로드에 실패했습니다.',
} as const;

// 성공 메시지
export const HERO_IMAGE_SUCCESS = {
  UPLOAD_SUCCESS: '이미지가 성공적으로 업로드되었습니다.',
  DELETE_SUCCESS: '이미지가 성공적으로 삭제되었습니다.',
  ACTIVATE_SUCCESS: '이미지가 활성화되었습니다.',
} as const;
