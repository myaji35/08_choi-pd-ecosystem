import { SnsApiClient, SnsAccountInfo, SnsPostData, SnsPostResponse, SnsApiError } from './types';
import crypto from 'crypto';

export class TwitterApiClient implements SnsApiClient {
  platform = 'twitter' as const;
  private readonly baseUrl = 'https://api.twitter.com/2';

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string
  ) {}

  async getAccountInfo(accessToken: string): Promise<SnsAccountInfo> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/me?user.fields=profile_image_url,name,username`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new SnsApiError(
          'twitter',
          'API_ERROR',
          error.detail || 'Failed to fetch account info',
          error
        );
      }

      const data = await response.json();
      const user = data.data;

      return {
        id: user.id,
        name: user.name,
        platform: 'twitter',
        avatarUrl: user.profile_image_url,
        profileUrl: `https://twitter.com/${user.username}`,
      };
    } catch (error) {
      if (error instanceof SnsApiError) throw error;
      throw new SnsApiError('twitter', 'NETWORK_ERROR', 'Failed to connect to Twitter API', error);
    }
  }

  async publishPost(accessToken: string, data: SnsPostData): Promise<SnsPostResponse> {
    try {
      // Twitter API v2는 미디어 업로드를 위해 v1.1 API를 사용해야 함
      let mediaId: string | undefined;

      if (data.imageUrl) {
        // 이미지 URL에서 이미지 다운로드
        const imageResponse = await fetch(data.imageUrl);
        if (!imageResponse.ok) {
          throw new SnsApiError('twitter', 'IMAGE_DOWNLOAD_ERROR', 'Failed to download image');
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');

        // Twitter v1.1 API로 미디어 업로드
        const uploadResponse = await fetch(
          'https://upload.twitter.com/1.1/media/upload.json',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              media_data: base64Image,
            }),
          }
        );

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new SnsApiError(
            'twitter',
            'MEDIA_UPLOAD_ERROR',
            error.errors?.[0]?.message || 'Failed to upload media',
            error
          );
        }

        const uploadData = await uploadResponse.json();
        mediaId = uploadData.media_id_string;
      }

      // 트윗 작성
      const tweetData: any = {
        text: data.message,
      };

      if (mediaId) {
        tweetData.media = {
          media_ids: [mediaId],
        };
      }

      const response = await fetch(`${this.baseUrl}/tweets`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tweetData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new SnsApiError(
          'twitter',
          'POST_ERROR',
          error.detail || error.errors?.[0]?.message || 'Failed to publish tweet',
          error
        );
      }

      const responseData = await response.json();

      return {
        success: true,
        postId: responseData.data.id,
        metadata: { tweetId: responseData.data.id },
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
        error: 'Failed to publish Twitter post',
      };
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }> {
    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new SnsApiError(
          'twitter',
          'TOKEN_REFRESH_ERROR',
          error.error_description || 'Failed to refresh access token',
          error
        );
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : undefined,
      };
    } catch (error) {
      if (error instanceof SnsApiError) throw error;
      throw new SnsApiError('twitter', 'NETWORK_ERROR', 'Failed to refresh token', error);
    }
  }

  getAuthUrl(redirectUri: string, state: string): string {
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);

    // code_verifier를 세션이나 상태에 저장해야 함 (나중에 콜백에서 사용)
    // 여기서는 state에 포함시킴
    const stateWithVerifier = `${state}:${codeVerifier}`;

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope: 'tweet.read tweet.write users.read offline.access',
      state: stateWithVerifier,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  }

  async handleOAuthCallback(code: string, redirectUri: string, codeVerifier?: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }> {
    try {
      if (!codeVerifier) {
        throw new SnsApiError('twitter', 'AUTH_ERROR', 'Code verifier is required');
      }

      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new SnsApiError(
          'twitter',
          'AUTH_ERROR',
          error.error_description || 'Failed to exchange code for token',
          error
        );
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : undefined,
      };
    } catch (error) {
      if (error instanceof SnsApiError) throw error;
      throw new SnsApiError('twitter', 'AUTH_ERROR', 'Failed to handle OAuth callback', error);
    }
  }

  // PKCE 헬퍼 함수들
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Buffer.from(array).toString('base64url');
  }

  private generateCodeChallenge(verifier: string): string {
    const hash = crypto.createHash('sha256').update(verifier).digest();
    return Buffer.from(hash).toString('base64url');
  }
}
