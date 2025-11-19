import { FacebookApiClient } from './facebook';
import { InstagramApiClient } from './instagram';
import { TwitterApiClient } from './twitter';
import { LinkedInApiClient } from './linkedin';
import { SnsApiClient, SnsPlatform, SnsApiError } from './types';

// 환경 변수에서 API 키 가져오기
const getSnsCredentials = (
  platform: SnsPlatform
): { appId: string; appSecret: string } | { clientId: string; clientSecret: string } => {
  switch (platform) {
    case 'facebook':
      if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
        throw new Error('Facebook API credentials not configured');
      }
      return {
        appId: process.env.FACEBOOK_APP_ID as string,
        appSecret: process.env.FACEBOOK_APP_SECRET as string,
      };
    case 'instagram':
      if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
        throw new Error('Instagram/Facebook API credentials not configured');
      }
      return {
        appId: process.env.FACEBOOK_APP_ID as string, // Instagram은 Facebook App 사용
        appSecret: process.env.FACEBOOK_APP_SECRET as string,
      };
    case 'twitter':
      if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET) {
        throw new Error('Twitter API credentials not configured');
      }
      return {
        clientId: process.env.TWITTER_CLIENT_ID as string,
        clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
      };
    case 'linkedin':
      if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
        throw new Error('LinkedIn API credentials not configured');
      }
      return {
        clientId: process.env.LINKEDIN_CLIENT_ID as string,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
      };
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};

// SNS API 클라이언트 팩토리
export const createSnsClient = (platform: SnsPlatform): SnsApiClient => {
  switch (platform) {
    case 'facebook': {
      const credentials = getSnsCredentials('facebook') as { appId: string; appSecret: string };
      return new FacebookApiClient(credentials.appId, credentials.appSecret);
    }
    case 'instagram': {
      const credentials = getSnsCredentials('instagram') as { appId: string; appSecret: string };
      return new InstagramApiClient(credentials.appId, credentials.appSecret);
    }
    case 'twitter': {
      const credentials = getSnsCredentials('twitter') as { clientId: string; clientSecret: string };
      return new TwitterApiClient(credentials.clientId, credentials.clientSecret);
    }
    case 'linkedin': {
      const credentials = getSnsCredentials('linkedin') as { clientId: string; clientSecret: string };
      return new LinkedInApiClient(credentials.clientId, credentials.clientSecret);
    }
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};

// 헬퍼 함수: 여러 플랫폼에 동시에 포스팅
export const publishToMultiplePlatforms = async (
  platforms: SnsPlatform[],
  accessTokens: Record<SnsPlatform, string>,
  postData: Parameters<SnsApiClient['publishPost']>[1]
) => {
  const results = await Promise.allSettled(
    platforms.map(async (platform) => {
      const client = createSnsClient(platform);
      const accessToken = accessTokens[platform];

      if (!accessToken) {
        throw new SnsApiError(platform, 'NO_TOKEN', 'No access token provided');
      }

      return {
        platform,
        result: await client.publishPost(accessToken, postData),
      };
    })
  );

  return results.map((result, index) => {
    const platform = platforms[index];
    if (result.status === 'fulfilled') {
      return {
        platform,
        ...result.value.result,
      };
    } else {
      return {
        platform,
        success: false,
        error: result.reason?.message || 'Unknown error',
      };
    }
  });
};

// 헬퍼 함수: 토큰 만료 확인
export const isTokenExpired = (expiresAt?: Date): boolean => {
  if (!expiresAt) return false;
  return new Date() >= expiresAt;
};

// 헬퍼 함수: 토큰 갱신이 필요한지 확인 (만료 1시간 전)
export const needsTokenRefresh = (expiresAt?: Date): boolean => {
  if (!expiresAt) return false;
  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
  return expiresAt <= oneHourFromNow;
};

// Export all
export * from './types';
export { FacebookApiClient } from './facebook';
export { InstagramApiClient } from './instagram';
export { TwitterApiClient } from './twitter';
export { LinkedInApiClient } from './linkedin';
