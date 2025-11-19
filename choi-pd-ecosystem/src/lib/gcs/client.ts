import { Storage } from '@google-cloud/storage';
import { HERO_IMAGE_CONSTANTS } from '../constants';

/**
 * Google Cloud Storage 클라이언트 초기화
 */
export function getGCSClient(): Storage {
  // 환경 변수로부터 인증 정보 로드
  const credentials = process.env.GCS_KEY_JSON
    ? JSON.parse(process.env.GCS_KEY_JSON)
    : undefined;

  const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    credentials,
  });

  return storage;
}

/**
 * GCS 버킷 가져오기
 */
export function getHeroImageBucket() {
  const storage = getGCSClient();
  const bucketName = HERO_IMAGE_CONSTANTS.GCS_BUCKET_NAME;

  return storage.bucket(bucketName);
}

/**
 * GCS 버킷 연결 테스트
 */
export async function testGCSConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const bucket = getHeroImageBucket();
    const [exists] = await bucket.exists();

    if (!exists) {
      return {
        success: false,
        error: `GCS 버킷 "${HERO_IMAGE_CONSTANTS.GCS_BUCKET_NAME}"을 찾을 수 없습니다.`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `GCS 연결 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    };
  }
}
