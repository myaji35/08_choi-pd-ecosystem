/**
 * ISS-067: 리뷰 JSON 싱크 파일 관리
 *
 * DB 저장과 별도로 JSON 파일에도 리뷰를 append/update한다.
 * 0000_master 프로젝트 또는 외부 시스템의 폴링 소스가 될 수 있음.
 *
 * 경로 우선순위:
 *   1. REVIEW_SYNC_PATH 환경변수
 *   2. ../../../.claude/review-db/reviews.json (프로젝트 루트 기준 .claude)
 *   3. ./data/review-db/reviews.json (ecosystem 내부 — 기본 fallback)
 *
 * JSON 쓰기 실패는 DB 저장 성공을 블록하지 않는다 (호출 측에서 try/catch 분리).
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface ReviewJsonEntry {
  id: number;
  member_slug: string;
  reviewer_name: string;
  rating: number;
  content: string | null;
  email_hash?: string | null;
  status: 'new' | 'triaged' | 'responded' | 'archived';
  source: 'public_form' | 'admin_submitted';
  created_at: string;
}

export interface ReviewJsonFile {
  version: string;
  generated_at: string;
  reviews: ReviewJsonEntry[];
}

function candidatePaths(): string[] {
  const fromEnv = process.env.REVIEW_SYNC_PATH;
  const cwd = process.cwd();
  const paths: string[] = [];
  if (fromEnv) paths.push(fromEnv);
  // 프로젝트 루트가 choi-pd-ecosystem 또는 그 부모일 수 있으므로 둘 다 시도
  paths.push(path.resolve(cwd, '..', '.claude', 'review-db', 'reviews.json'));
  paths.push(path.resolve(cwd, '.claude', 'review-db', 'reviews.json'));
  paths.push(path.resolve(cwd, 'data', 'review-db', 'reviews.json'));
  return paths;
}

/**
 * 쓰기 가능한 JSON 파일 경로를 찾는다.
 * 실패 시 null 반환 (호출 측에서 JSON 싱크 스킵).
 */
async function resolveWritablePath(): Promise<string | null> {
  for (const p of candidatePaths()) {
    try {
      await fs.access(path.dirname(p));
      return p;
    } catch {
      // try next
    }
  }
  // 마지막 후보 디렉터리 생성 시도
  const last = candidatePaths()[candidatePaths().length - 1];
  try {
    await fs.mkdir(path.dirname(last), { recursive: true });
    return last;
  } catch {
    return null;
  }
}

export async function readReviewJson(): Promise<ReviewJsonFile> {
  const p = await resolveWritablePath();
  if (!p) {
    return { version: '1.0.0', generated_at: new Date().toISOString(), reviews: [] };
  }
  try {
    const raw = await fs.readFile(p, 'utf-8');
    const parsed = JSON.parse(raw) as ReviewJsonFile;
    if (!Array.isArray(parsed.reviews)) {
      return { version: '1.0.0', generated_at: new Date().toISOString(), reviews: [] };
    }
    return parsed;
  } catch {
    return { version: '1.0.0', generated_at: new Date().toISOString(), reviews: [] };
  }
}

async function writeReviewJson(data: ReviewJsonFile): Promise<void> {
  const p = await resolveWritablePath();
  if (!p) throw new Error('review-db path not writable');
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/**
 * 리뷰 1건 추가.
 */
export async function appendReviewToJson(entry: ReviewJsonEntry): Promise<void> {
  const data = await readReviewJson();
  data.reviews.push(entry);
  data.generated_at = new Date().toISOString();
  await writeReviewJson(data);
}

/**
 * 리뷰 상태 업데이트.
 */
export async function updateReviewStatusInJson(
  id: number,
  status: ReviewJsonEntry['status']
): Promise<void> {
  const data = await readReviewJson();
  const idx = data.reviews.findIndex((r) => r.id === id);
  if (idx === -1) return; // 못 찾으면 조용히 패스 (DB가 소스 오브 트루스)
  data.reviews[idx].status = status;
  data.generated_at = new Date().toISOString();
  await writeReviewJson(data);
}
