// SNS 플랫폼 타입
export type SnsPlatform = 'facebook' | 'instagram' | 'twitter' | 'linkedin';

// SNS 포스트 데이터
export interface SnsPostData {
  message: string;
  imageUrl?: string;
  link?: string;
  scheduledAt?: Date;
}

// SNS 포스트 응답
export interface SnsPostResponse {
  success: boolean;
  postId?: string;
  error?: string;
  metadata?: Record<string, any>;
}

// SNS 계정 정보
export interface SnsAccountInfo {
  id: string;
  name: string;
  platform: SnsPlatform;
  profileUrl?: string;
  avatarUrl?: string;
}

// SNS API 클라이언트 인터페이스
export interface SnsApiClient {
  platform: SnsPlatform;

  // 계정 정보 조회
  getAccountInfo(accessToken: string): Promise<SnsAccountInfo>;

  // 포스트 게시
  publishPost(accessToken: string, data: SnsPostData): Promise<SnsPostResponse>;

  // 액세스 토큰 갱신 (지원하는 플랫폼만)
  refreshAccessToken?(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }>;

  // OAuth 인증 URL 생성
  getAuthUrl(redirectUri: string, state: string): string;

  // OAuth 콜백 처리
  handleOAuthCallback(code: string, redirectUri: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }>;
}

// API 에러
export class SnsApiError extends Error {
  constructor(
    public platform: SnsPlatform,
    public code: string,
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'SnsApiError';
  }
}
