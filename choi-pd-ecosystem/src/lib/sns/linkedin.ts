import { SnsApiClient, SnsAccountInfo, SnsPostData, SnsPostResponse, SnsApiError } from './types';

export class LinkedInApiClient implements SnsApiClient {
  platform = 'linkedin' as const;
  private readonly baseUrl = 'https://api.linkedin.com/v2';

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string
  ) {}

  async getAccountInfo(accessToken: string): Promise<SnsAccountInfo> {
    try {
      // 사용자 프로필 정보 가져오기
      const response = await fetch(`${this.baseUrl}/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new SnsApiError(
          'linkedin',
          'API_ERROR',
          error.message || 'Failed to fetch account info',
          error
        );
      }

      const data = await response.json();

      return {
        id: data.sub,
        name: data.name,
        platform: 'linkedin',
        avatarUrl: data.picture,
        profileUrl: `https://linkedin.com/in/${data.sub}`,
      };
    } catch (error) {
      if (error instanceof SnsApiError) throw error;
      throw new SnsApiError('linkedin', 'NETWORK_ERROR', 'Failed to connect to LinkedIn API', error);
    }
  }

  async publishPost(accessToken: string, data: SnsPostData): Promise<SnsPostResponse> {
    try {
      // LinkedIn UGC (User Generated Content) API 사용
      // 먼저 사용자 ID(URN) 가져오기
      const userResponse = await fetch(`${this.baseUrl}/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) {
        throw new SnsApiError('linkedin', 'API_ERROR', 'Failed to fetch user info');
      }

      const userData = await userResponse.json();
      const authorUrn = `urn:li:person:${userData.sub}`;

      // 포스트 데이터 준비
      const postData: any = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: data.message,
            },
            shareMediaCategory: data.imageUrl ? 'IMAGE' : 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      };

      // 이미지가 있는 경우
      if (data.imageUrl) {
        // LinkedIn은 먼저 이미지를 업로드해야 함
        // 1단계: 업로드 권한 요청
        const registerResponse = await fetch(
          `${this.baseUrl}/assets?action=registerUpload`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'X-Restli-Protocol-Version': '2.0.0',
            },
            body: JSON.stringify({
              registerUploadRequest: {
                recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                owner: authorUrn,
                serviceRelationships: [
                  {
                    relationshipType: 'OWNER',
                    identifier: 'urn:li:userGeneratedContent',
                  },
                ],
              },
            }),
          }
        );

        if (!registerResponse.ok) {
          const error = await registerResponse.json();
          throw new SnsApiError(
            'linkedin',
            'UPLOAD_REGISTER_ERROR',
            error.message || 'Failed to register image upload',
            error
          );
        }

        const registerData = await registerResponse.json();
        const uploadUrl = registerData.value.uploadMechanism[
          'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
        ].uploadUrl;
        const assetUrn = registerData.value.asset;

        // 2단계: 이미지 다운로드 및 업로드
        const imageResponse = await fetch(data.imageUrl);
        if (!imageResponse.ok) {
          throw new SnsApiError('linkedin', 'IMAGE_DOWNLOAD_ERROR', 'Failed to download image');
        }

        const imageBuffer = await imageResponse.arrayBuffer();

        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: imageBuffer,
        });

        if (!uploadResponse.ok) {
          throw new SnsApiError('linkedin', 'IMAGE_UPLOAD_ERROR', 'Failed to upload image');
        }

        // 포스트 데이터에 이미지 추가
        postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
          {
            status: 'READY',
            description: {
              text: data.message,
            },
            media: assetUrn,
            title: {
              text: 'Image',
            },
          },
        ];
      }

      // 링크가 있는 경우
      if (data.link && !data.imageUrl) {
        postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
        postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
          {
            status: 'READY',
            originalUrl: data.link,
          },
        ];
      }

      // 포스트 게시
      const response = await fetch(`${this.baseUrl}/ugcPosts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new SnsApiError(
          'linkedin',
          'POST_ERROR',
          error.message || 'Failed to publish post',
          error
        );
      }

      const responseData = await response.json();
      const postId = responseData.id;

      return {
        success: true,
        postId,
        metadata: { authorUrn },
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
        error: 'Failed to publish LinkedIn post',
      };
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }> {
    try {
      const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new SnsApiError(
          'linkedin',
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
      throw new SnsApiError('linkedin', 'NETWORK_ERROR', 'Failed to refresh token', error);
    }
  }

  getAuthUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: redirectUri,
      state,
      scope: 'openid profile w_member_social',
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  async handleOAuthCallback(code: string, redirectUri: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }> {
    try {
      const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new SnsApiError(
          'linkedin',
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
      throw new SnsApiError('linkedin', 'AUTH_ERROR', 'Failed to handle OAuth callback', error);
    }
  }
}
