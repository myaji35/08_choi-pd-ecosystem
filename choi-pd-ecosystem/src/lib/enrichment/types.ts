// 프로필 자동 강화 — 공통 타입 정의

/** 수집기가 반환하는 단일 결과 */
export interface EnrichmentResult {
  source: string;       // 'gravatar' | 'github' | 'google' | 'linkedin' | 'sns_oauth'
  dataType: string;     // 'photo_url' | 'company' | 'title' | 'skills' | 'sns_url' | 'bio' | 'location'
  value: string;
  confidence: number;   // 0.0~1.0
}

/** 수집기 인터페이스 — 모든 collector가 구현 */
export interface EnrichmentCollector {
  name: string;
  collect(email: string, name?: string): Promise<EnrichmentResult[]>;
}
