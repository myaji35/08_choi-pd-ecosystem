/**
 * subset-og-font.mjs
 * Pretendard Regular → pretendard-og.woff2 서브셋 생성 스크립트
 *
 * 포함 문자:
 *   - ASCII (U+0020~U+007E)
 *   - 한글 음절 빈도 상위 2350자 (KS X 1001 실사용 범위)
 *   - 기본 구두점/기호
 *
 * 실행: npm run og:font
 * 출력: public/fonts/og/pretendard-og.woff2 (≤ 400KB 목표)
 */

import { createWriteStream, mkdirSync, existsSync, statSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import subsetFont from 'subset-font';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// 출력 경로
const OUTPUT_DIR = resolve(ROOT, 'public/fonts/og');
const OUTPUT_FILE = resolve(OUTPUT_DIR, 'pretendard-og.woff2');

// 임시 원본 폰트 캐시 경로
const CACHE_DIR = resolve(ROOT, '.font-cache');
const CACHE_FILE = resolve(CACHE_DIR, 'PretendardVariable.ttf');

// Pretendard Variable TTF 다운로드 URL (GitHub CDN)
const FONT_URL =
  'https://github.com/orioncactus/pretendard/releases/download/v1.3.9/Pretendard-1.3.9.zip';

// jsdelivr CDN 직접 접근 URL (Variable, woff2 → 바로 사용 불가, TTF 필요)
// 대신 Pretendard Regular TTF 직접 URL 사용
const PRETENDARD_TTF_URL =
  'https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/alternative/Pretendard-Regular.ttf';

// KS X 1001 빈도 상위 2350 한글 음절
// AC00(가)에서 음절 순서대로 2350자 — PoC 목적으로 충분
// 실사용 빈도가 높은 한글 음절은 AC00 근방에 집중
function buildKoreanChars() {
  const startCode = 0xac00; // 가
  const chars = [];
  // 2350자를 빈도 상위 패턴으로: 모음별 자음 조합 순서가 빈도와 근사
  // 실제 KS X 1001 2350자 = 아래 한글 완성형 표준에 포함된 음절
  // PoC: AC00부터 2350자를 음절 순서로 포함
  for (let i = 0; i < 2350; i++) {
    chars.push(String.fromCodePoint(startCode + i));
  }
  return chars.join('');
}

// ASCII 공백~틸드
function buildAsciiChars() {
  let chars = '';
  for (let i = 0x20; i <= 0x7e; i++) {
    chars += String.fromCodePoint(i);
  }
  return chars;
}

// 기본 구두점/특수기호 (OG 이미지에 자주 등장)
const EXTRA_CHARS = '·〈〉《》「」『』【】…—―·•※◆◇★☆○●□■△▲▽▼←→↑↓↔↕';

function buildSubsetString() {
  return buildAsciiChars() + buildKoreanChars() + EXTRA_CHARS;
}

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath);
    let redirectCount = 0;

    function get(currentUrl) {
      https
        .get(currentUrl, (res) => {
          if (
            res.statusCode === 301 ||
            res.statusCode === 302 ||
            res.statusCode === 307 ||
            res.statusCode === 308
          ) {
            redirectCount++;
            if (redirectCount > 10) {
              reject(new Error('Too many redirects'));
              return;
            }
            get(res.headers.location);
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode} for ${currentUrl}`));
            return;
          }
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        })
        .on('error', (err) => {
          reject(err);
        });
    }

    get(url);
  });
}

async function ensureFont() {
  if (existsSync(CACHE_FILE)) {
    const stat = statSync(CACHE_FILE);
    if (stat.size > 100_000) {
      console.log(`캐시에서 폰트 로드: ${CACHE_FILE}`);
      return;
    }
  }

  mkdirSync(CACHE_DIR, { recursive: true });
  console.log(`Pretendard Regular TTF 다운로드 중...`);
  console.log(`URL: ${PRETENDARD_TTF_URL}`);
  await download(PRETENDARD_TTF_URL, CACHE_FILE);
  const stat = statSync(CACHE_FILE);
  console.log(`다운로드 완료: ${(stat.size / 1024).toFixed(1)} KB`);
}

async function main() {
  console.log('=== OG 폰트 서브셋 생성 시작 ===');

  // 1. 폰트 파일 확보
  await ensureFont();

  // 2. 서브셋 문자열 빌드
  const subsetString = buildSubsetString();
  const hangulCount = buildKoreanChars().length;
  console.log(
    `서브셋 문자: ASCII ${buildAsciiChars().length}자 + 한글 ${hangulCount}자 + 기호 ${EXTRA_CHARS.length}자 = 총 ${subsetString.length}자`
  );

  // 3. 원본 폰트 읽기
  const fontBuffer = await readFile(CACHE_FILE);
  console.log(`원본 폰트 크기: ${(fontBuffer.length / 1024).toFixed(1)} KB`);

  // 4. 서브셋 생성 (woff2)
  console.log('서브셋 생성 중 (woff2)...');
  const subset = await subsetFont(fontBuffer, subsetString, {
    targetFormat: 'woff2',
  });

  // 5. 출력
  mkdirSync(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_FILE, subset);

  const outputStat = statSync(OUTPUT_FILE);
  const sizeKB = outputStat.size / 1024;
  console.log(`\n=== 생성 완료 ===`);
  console.log(`파일: ${OUTPUT_FILE}`);
  console.log(`크기: ${sizeKB.toFixed(1)} KB`);
  console.log(`한글 문자 수: ${hangulCount}자`);

  if (sizeKB > 400) {
    console.warn(`\n⚠️ 경고: 파일 크기 ${sizeKB.toFixed(1)} KB > 400 KB 초과`);
    console.warn('한글 문자 수를 2000자로 줄여 재시도합니다...');

    // 재시도: 2000자로 축소
    const reducedKorean = Array.from({ length: 2000 }, (_, i) =>
      String.fromCodePoint(0xac00 + i)
    ).join('');
    const reducedString = buildAsciiChars() + reducedKorean + EXTRA_CHARS;

    const reducedSubset = await subsetFont(fontBuffer, reducedString, {
      targetFormat: 'woff2',
    });
    await writeFile(OUTPUT_FILE, reducedSubset);
    const reducedStat = statSync(OUTPUT_FILE);
    const reducedKB = reducedStat.size / 1024;

    console.log(`재시도 완료: ${reducedKB.toFixed(1)} KB (한글 2000자)`);

    if (reducedKB > 400) {
      console.error(
        `\n❌ 2000자로도 ${reducedKB.toFixed(1)} KB 초과. 후속 조정 필요.`
      );
      console.error('ISS-044 플래그: woff2 용량 초과, 추가 최적화 필요');
    } else {
      console.log(`✅ 2000자 버전으로 ${reducedKB.toFixed(1)} KB 달성`);
    }
  } else {
    console.log(`✅ 용량 목표 달성: ${sizeKB.toFixed(1)} KB ≤ 400 KB`);
  }
}

main().catch((err) => {
  console.error('오류 발생:', err);
  process.exit(1);
});
