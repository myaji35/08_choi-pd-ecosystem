import { SnsApiClient, SnsAccountInfo, SnsPostData, SnsPostResponse, SnsApiError } from './types';

export class FacebookApiClient implements SnsApiClient {
  platform = 'facebook' as const;
  private readonly apiVersion = 'v21.0';
  private readonly baseUrl = `https://graph.facebook.com/${this.apiVersion}`;

  constructor(
    private readonly appId: string,
    private readonly appSecret: string
  ) {}

  async getAccountInfo(accessToken: string): Promise<SnsAccountInfo> {
    try {
      const response = await fetch(
        `${this.baseUrl}/me?fields=id,name,picture&access_token=${accessToken}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new SnsApiError(
          'facebook',
          'API_ERROR',
          error.error?.message || 'Failed to fetch account info',
          error
        );
      }

      const data = await response.json();

      return {
        id: data.id,
        name: data.name,
        platform: 'facebook',
        avatarUrl: data.picture?.data?.url,
        profileUrl: `https://facebook.com/${data.id}`,
      };
    } catch (error) {
      if (error instanceof SnsApiError) throw error;
      throw new SnsApiError('facebook', 'NETWORK_ERROR', 'Failed to connect to Facebook API', error);
    }
  }

  async publishPost(accessToken: string, data: SnsPostData): Promise<SnsPostResponse> {
    try {
      // Facebook Page ID를 먼저 가져와야 함
      const accountsResponse = await fetch(
        `${this.baseUrl}/me/accounts?access_token=${accessToken}`
      );

      if (!accountsResponse.ok) {
        throw new SnsApiError('facebook', 'API_ERROR', 'Failed to fetch Facebook pages');
      }

      const accountsData = await accountsResponse.json();
      const pages = accountsData.data || [];

      if (pages.length === 0) {
        throw new SnsApiError('facebook', 'NO_PAGES', 'No Facebook pages found for this account');
      }

      // 첫 번째 페이지 사용 (나중에 다중 페이지 지원 가능)
      const page = pages[0];
      const pageAccessToken = page.access_token;
      const pageId = page.id;

      // 포스트 데이터 준비
      const postData: any = {
        message: data.message,
        access_token: pageAccessToken,
      };

      if (data.link) {
        postData.link = data.link;
      }

      // 이미지가 있는 경우
      if (data.imageUrl) {
        const photoResponse = await fetch(`${this.baseUrl}/${pageId}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: data.imageUrl,
            caption: data.message,
            access_token: pageAccessToken,
          }),
        });

        if (!photoResponse.ok) {
          const error = await photoResponse.json();
          throw new SnsApiError(
            'facebook',
            'POST_ERROR',
            error.error?.message || 'Failed to post photo',
            error
          );
        }

        const photoData = await photoResponse.json();
        return {
          success: true,
          postId: photoData.id,
          metadata: { pageId, pageName: page.name },
        };
      }

      // 일반 포스트
      const response = await fetch(`${this.baseUrl}/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new SnsApiError(
          'facebook',
          'POST_ERROR',
          error.error?.message || 'Failed to publish post',
          error
        );
      }

      const responseData = await response.json();

      return {
        success: true,
        postId: responseData.id,
        metadata: { pageId, pageName: page.name },
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
        error: 'Failed to publish Facebook post',
      };
    }
  }

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
        throw new SnsApiError('facebook', 'TOKEN_REFRESH_ERROR', 'Failed to refresh access token');
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
      throw new SnsApiError('facebook', 'NETWORK_ERROR', 'Failed to refresh token', error);
    }
  }

  getAuthUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: redirectUri,
      state,
      scope: 'pages_manage_posts,pages_read_engagement,public_profile',
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
          'facebook',
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
      throw new SnsApiError('facebook', 'AUTH_ERROR', 'Failed to handle OAuth callback', error);
    }
  }
}
