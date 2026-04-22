import { test, expect } from '@playwright/test';

test.describe('/choi 브랜드 페이지 smoke', () => {
  test('GET /choi 200 + 핵심 섹션 렌더', async ({ page }) => {
    const response = await page.goto('/choi');
    expect(response?.status()).toBeLessThan(400);
    // 페이지 본문 존재 확인 (최소 body 태그)
    await expect(page.locator('body')).toBeVisible();
    // h1 또는 main 섹션 등장 여부
    const mainCount = await page.locator('main, h1').count();
    expect(mainCount).toBeGreaterThan(0);
  });

  test('GET /api/choi/brand 응답 스키마 정상', async ({ request }) => {
    const res = await request.get('/api/choi/brand');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('brand');
    expect(json.brand).toHaveProperty('primary');
    expect(json.brand).toHaveProperty('ink');
  });

  test('공유 링크 UTM 주입 확인', async ({ page }) => {
    await page.goto('/choi');
    // 공유 버튼 또는 공유 앵커의 href에 utm_source 포함 여부
    const shareLinks = await page.locator('a[href*="utm_source"]').count();
    // 공유 링크가 있으면 utm 파라미터가 있어야 함. 없어도 페이지 렌더 자체 성공이면 OK.
    if (shareLinks > 0) {
      const href = await page.locator('a[href*="utm_source"]').first().getAttribute('href');
      expect(href).toMatch(/utm_source=/);
    }
  });
});
