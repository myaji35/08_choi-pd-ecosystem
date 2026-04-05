import type { EnrichmentCollector, EnrichmentResult } from './types';

/**
 * 소셜 프로필 자동 검색 수집기
 *
 * 이메일 + 이름으로 공개 SNS 프로필을 탐색합니다.
 * - GitHub API (이메일 → 프로필, 아바타)
 * - 소셜 URL 존재 확인 (Instagram, Facebook, LinkedIn, YouTube)
 *
 * source: "uploaded", uploaded_by: "System Auto-Collection" (법적 안전장치)
 */
export const socialLookupCollector: EnrichmentCollector = {
  name: 'social_lookup',

  async collect(email: string, name?: string): Promise<EnrichmentResult[]> {
    const results: EnrichmentResult[] = [];

    // 1. GitHub — 이메일로 사용자 검색 (무료, rate limit 60/h)
    try {
      const ghRes = await fetch(
        `https://api.github.com/search/users?q=${encodeURIComponent(email)}+in:email`,
        {
          headers: { 'Accept': 'application/vnd.github.v3+json' },
          signal: AbortSignal.timeout(5000),
        }
      );
      if (ghRes.ok) {
        const ghData = await ghRes.json();
        if (ghData.total_count > 0) {
          const user = ghData.items[0];

          // GitHub 프로필 URL
          results.push({
            source: 'github',
            dataType: 'sns_url',
            value: user.html_url,
            confidence: 0.9,
          });

          // GitHub 아바타 (고해상도)
          if (user.avatar_url) {
            results.push({
              source: 'github',
              dataType: 'photo_url',
              value: `${user.avatar_url}&s=400`,
              confidence: 0.85,
            });
          }

          // GitHub 상세 프로필 조회
          const detailRes = await fetch(user.url, {
            headers: { 'Accept': 'application/vnd.github.v3+json' },
            signal: AbortSignal.timeout(5000),
          });
          if (detailRes.ok) {
            const detail = await detailRes.json();
            if (detail.bio) {
              results.push({
                source: 'github',
                dataType: 'bio',
                value: detail.bio,
                confidence: 0.7,
              });
            }
            if (detail.company) {
              results.push({
                source: 'github',
                dataType: 'company',
                value: detail.company.replace(/^@/, ''),
                confidence: 0.7,
              });
            }
            if (detail.location) {
              results.push({
                source: 'github',
                dataType: 'location',
                value: detail.location,
                confidence: 0.65,
              });
            }
            if (detail.blog) {
              results.push({
                source: 'github',
                dataType: 'sns_url',
                value: detail.blog.startsWith('http') ? detail.blog : `https://${detail.blog}`,
                confidence: 0.8,
              });
            }
            if (detail.twitter_username) {
              results.push({
                source: 'github',
                dataType: 'sns_url',
                value: `https://x.com/${detail.twitter_username}`,
                confidence: 0.8,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('[Enrichment:social_lookup:github] Error:', error);
    }

    // 2. 이름 기반 소셜 URL 존재 확인 (HEAD 요청으로 200 체크)
    if (name) {
      // 이름에서 영문 username 후보 생성
      const candidates = generateUsernameCandidates(name, email);

      const socialChecks: Array<{ platform: string; urlFn: (u: string) => string }> = [
        { platform: 'instagram', urlFn: (u) => `https://www.instagram.com/${u}/` },
        { platform: 'facebook', urlFn: (u) => `https://www.facebook.com/${u}` },
        { platform: 'linkedin', urlFn: (u) => `https://www.linkedin.com/in/${u}` },
      ];

      for (const check of socialChecks) {
        for (const candidate of candidates) {
          try {
            const url = check.urlFn(candidate);
            const res = await fetch(url, {
              method: 'HEAD',
              redirect: 'follow',
              signal: AbortSignal.timeout(3000),
            });

            // 200이면 프로필 존재 가능
            if (res.ok) {
              results.push({
                source: 'social_lookup',
                dataType: 'sns_url',
                value: url,
                confidence: 0.4, // 낮은 신뢰도 — 동명이인 가능
              });
              break; // 해당 플랫폼에서 첫 매치만
            }
          } catch {
            // timeout 또는 네트워크 에러 — 무시
          }
        }
      }
    }

    return results;
  },
};

/**
 * 이름과 이메일에서 username 후보 생성
 * 예: "김소셜", "social@doctors.kr" → ["social", "socialdoctors", "social.doctors"]
 */
function generateUsernameCandidates(name: string, email: string): string[] {
  const candidates: string[] = [];

  // 이메일 local part
  const localPart = email.split('@')[0];
  if (localPart) {
    candidates.push(localPart);
    // 점을 제거한 버전
    candidates.push(localPart.replace(/\./g, ''));
  }

  // 이메일 도메인 (gmail 등 제외) + local
  const domain = email.split('@')[1]?.split('.')[0];
  if (domain && !['gmail', 'naver', 'daum', 'hanmail', 'yahoo', 'hotmail', 'outlook', 'kakao'].includes(domain)) {
    candidates.push(domain);
    candidates.push(`${localPart}${domain}`);
  }

  // 영문 이름이면 그대로 사용
  const englishName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  if (englishName.length >= 3) {
    candidates.push(englishName);
  }

  // 중복 제거 + 빈 문자열 제거
  return [...new Set(candidates)].filter(c => c.length >= 2);
}
