import { SnsApiClient, SnsAccountInfo, SnsPostData, SnsPostResponse, SnsApiError } from './types';

export class InstagramApiClient implements SnsApiClient {
  platform = 'instagram' as const;
  private readonly apiVersion = 'v21.0';
  private readonly baseUrl = `https://graph.facebook.com/${this.apiVersion}`;

  constructor(
    private readonly appId: string,
    private readonly appSecret: string
  ) {}

  async getAccountInfo(accessToken: string): Promise<SnsAccountInfo> {
    try {
      // Instagram Business Account ID 가져오기
      const accountsResponse = await fetch(
        `${this.baseUrl}/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
      );

      if (!accountsResponse.ok) {
        throw new SnsApiError('instagram', 'API_ERROR', 'Failed to fetch Instagram accounts');
      }

      const accountsData = await accountsResponse.json();
      const pages = accountsData.data || [];

      // Instagram 비즈니스 계정이 연결된 페이지 찾기
      const pageWithInstagram = pages.find((page: any) => page.instagram_business_account);

      if (!pageWithInstagram) {
        throw new SnsApiError(
          'instagram',
          'NO_ACCOUNT',
          'No Instagram Business Account found'
        );
      }

      const igAccountId = pageWithInstagram.instagram_business_account.id;

      // Instagram 계정 정보 가져오기
      const response = await fetch(
        `${this.baseUrl}/${igAccountId}?fields=id,username,profile_picture_url&access_token=${accessToken}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new SnsApiError(
          'instagram',
          'API_ERROR',
          error.error?.message || 'Failed to fetch account info',
          error
        );
      }

      const data = await response.json();

      return {
        id: data.id,
        name: data.username,
        platform: 'instagram',
        avatarUrl: data.profile_picture_url,
        profileUrl: `https://instagram.com/${data.username}`,
      };
    } catch (error) {
      if (error instanceof SnsApiError) throw error;
      throw new SnsApiError('instagram', 'NETWORK_ERROR', 'Failed to connect to Instagram API', error);
    }
  }

  async publishPost(accessToken: string, data: SnsPostData): Promise<SnsPostResponse> {
    try {
      // Instagram Business Account ID 가져오기
      const accountsResponse = await fetch(
        `${this.baseUrl}/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
      );

      if (!accountsResponse.ok) {
        throw new SnsApiError('instagram', 'API_ERROR', 'Failed to fetch Instagram accounts');
      }

      const accountsData = await accountsResponse.json();
      const pages = accountsData.data || [];
      const pageWithInstagram = pages.find((page: any) => page.instagram_business_account);

      if (!pageWithInstagram) {
        throw new SnsApiError(
          'instagram',
          'NO_ACCOUNT',
          'No Instagram Business Account found'
        );
      }

      const igAccountId = pageWithInstagram.instagram_business_account.id;

      // 이미지가 필수인 Instagram
      if (!data.imageUrl) {
        throw new SnsApiError('instagram', 'MISSING_IMAGE', 'Image is required for Instagram posts');
      }

      // 1단계: 미디어 컨테이너 생성
      const containerParams: any = {
        image_url: data.imageUrl,
        caption: data.message,
        access_token: accessToken,
      };

      const containerResponse = await fetch(
        `${this.baseUrl}/${igAccountId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(containerParams),
        }
      );

      if (!containerResponse.ok) {
        const error = await containerResponse.json();
        throw new SnsApiError(
          'instagram',
          'CONTAINER_ERROR',
          error.error?.message || 'Failed to create media container',
          error
        );
      }

      const containerData = await containerResponse.json();
      const creationId = containerData.id;

      // 2단계: 미디어 게시
      const publishResponse = await fetch(
        `${this.baseUrl}/${igAccountId}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: creationId,
            access_token: accessToken,
          }),
        }
      );

      if (!publishResponse.ok) {
        const error = await publishResponse.json();
        throw new SnsApiError(
          'instagram',
          'PUBLISH_ERROR',
          error.error?.message || 'Failed to publish post',
          error
        );
      }

      const publishData = await publishResponse.json();

      return {
        success: true,
        postId: publishData.id,
        metadata: { igAccountId },
      };
    } catch (error) {
      if (error instanceof SnsApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Failed to publish Instagram post',
      };
    }
  }

  // Instagram은 Facebook과 동일한 토큰 갱신 메커니즘 사용
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.appId}&client_secret=${this.appSecret}&fb_exchange_token=${refreshToken}`
      );

      if (!response.ok) {
        throw new SnsApiError('instagram', 'TOKEN_REFRESH_ERROR', 'Failed to refresh access token');
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        expiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : undefined,
      };
    } catch (error) {
      if (error instanceof SnsApiError) throw error;
      throw new SnsApiError('instagram', 'NETWORK_ERROR', 'Failed to refresh token', error);
    }
  }

  getAuthUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: redirectUri,
      state,
      scope: 'instagram_basic,instagram_content_publish,pages_read_engagement',
      response_type: 'code',
    });

    return `https://www.facebook.com/${this.apiVersion}/dialog/oauth?${params.toString()}`;
  }

  async handleOAuthCallback(code: string, redirectUri: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/oauth/access_token?client_id=${this.appId}&client_secret=${this.appSecret}&redirect_uri=${redirectUri}&code=${code}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new SnsApiError(
          'instagram',
          'AUTH_ERROR',
          error.error?.message || 'Failed to exchange code for token',
          error
        );
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        expiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : undefined,
      };
    } catch (error) {
      if (error instanceof SnsApiError) throw error;
      throw new SnsApiError('instagram', 'AUTH_ERROR', 'Failed to handle OAuth callback', error);
    }
  }
}
