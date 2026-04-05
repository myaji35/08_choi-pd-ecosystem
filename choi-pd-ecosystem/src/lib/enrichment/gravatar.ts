import crypto from 'crypto';
import type { EnrichmentCollector, EnrichmentResult } from './types';

/**
 * Gravatar 프로필 수집기
 * - 이메일 MD5 해시로 공개 프로필 JSON 조회
 * - source: "uploaded", uploaded_by: "System Auto-Collection" (법적 안전장치)
 */
export const gravatarCollector: EnrichmentCollector = {
  name: 'gravatar',

  async collect(email: string): Promise<EnrichmentResult[]> {
    const results: EnrichmentResult[] = [];

    try {
      const hash = crypto
        .createHash('md5')
        .update(email.trim().toLowerCase())
        .digest('hex');

      const response = await fetch(`https://gravatar.com/${hash}.json`, {
        signal: AbortSignal.timeout(5000), // 5초 타임아웃
      });

      // 404 = Gravatar 프로필 없음
      if (!response.ok) {
        return results;
      }

      const data = await response.json();
      const entry = data?.entry?.[0];
      if (!entry) return results;

      // 프로필 사진
      if (entry.thumbnailUrl || entry.photos?.[0]?.value) {
        const photoUrl = entry.photos?.[0]?.value || entry.thumbnailUrl;
        // s=400 으로 고해상도 요청
        const hdUrl = photoUrl.replace(/s=\d+/, 's=400');
        results.push({
          source: 'gravatar',
          dataType: 'photo_url',
          value: hdUrl,
          confidence: 0.95,
        });
      }

      // 이름
      if (entry.displayName || entry.name?.formatted) {
        results.push({
          source: 'gravatar',
          dataType: 'name',
          value: entry.name?.formatted || entry.displayName,
          confidence: 0.85,
        });
      }

      // 위치
      if (entry.currentLocation) {
        results.push({
          source: 'gravatar',
          dataType: 'location',
          value: entry.currentLocation,
          confidence: 0.7,
        });
      }

      // 소개글 (aboutMe)
      if (entry.aboutMe) {
        results.push({
          source: 'gravatar',
          dataType: 'bio',
          value: entry.aboutMe,
          confidence: 0.75,
        });
      }
    } catch (error) {
      console.error('[Enrichment:gravatar] 수집 실패:', error);
    }

    return results;
  },
};
