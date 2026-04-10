/**
 * schema.ts — 하위 호환성 유지용 re-export 파일
 *
 * 모든 테이블 정의는 src/lib/db/schema/ 디렉터리로 분리됨.
 * 기존 import { xxx } from '@/lib/db/schema' 는 그대로 동작한다.
 *
 * ISS-055: 대형 파일 분할 리팩토링 (2009줄 → 도메인별 분리)
 */

export * from './schema/index';
