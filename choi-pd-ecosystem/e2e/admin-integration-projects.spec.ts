import { test, expect } from '@playwright/test';

/**
 * 캐릭터 저니: 어드민(운영자)이 외부 프로젝트 연동을 설정한다.
 * ISS-072 HUB-P0 검증.
 */
test.describe('[HUB-P0] Integration Projects — 어드민 저니', () => {
  test('목록 페이지 로드 + 신규 등록 버튼 노출', async ({ page }) => {
    await page.goto('/admin/integration-projects');
    await expect(page.getByRole('heading', { name: /통합 연동 프로젝트/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /새 프로젝트/ }).first()).toBeVisible();
  });

  test('신규 등록 → 목록 → 편집 → 삭제 전체 플로우', async ({ page }) => {
    const uniqueKey = `e2e-test-${Date.now().toString(36)}`;

    // 1. 신규 등록 페이지 진입
    await page.goto('/admin/integration-projects/new');
    await expect(page.getByRole('heading', { name: /새 통합 프로젝트/ })).toBeVisible();

    // 2. 필수 필드 입력
    await page.getByPlaceholder('townin', { exact: true }).fill(uniqueKey);
    await page.getByPlaceholder('Townin — 지역 커뮤니티 플랫폼').fill(`E2E Test Project ${uniqueKey}`);
    await page.getByPlaceholder('https://townin.kr', { exact: true }).fill('https://example.com');

    // 3. 저장
    await page.getByRole('button', { name: /저장/ }).click();

    // 4. 목록 페이지로 redirect, 등록된 항목 보여야 함
    await page.waitForURL('**/admin/integration-projects');
    await expect(page.getByText(uniqueKey, { exact: true })).toBeVisible({ timeout: 5000 });

    // 5. 편집 페이지 진입
    await page.getByRole('row', { name: new RegExp(uniqueKey) }).getByRole('link', { name: /편집/ }).click();
    await expect(page.getByRole('heading', { name: /프로젝트 편집/ })).toBeVisible();

    // 6. 설명 변경 후 저장
    const descInput = page.getByPlaceholder('회원이 참여하는 프로젝트의 짧은 설명');
    await descInput.fill('E2E 검증용 설명 변경');
    await page.getByRole('button', { name: /저장/ }).click();
    await page.waitForURL('**/admin/integration-projects');

    // 7. 삭제
    await page.getByRole('row', { name: new RegExp(uniqueKey) }).getByRole('link', { name: /편집/ }).click();
    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: /삭제/ }).click();

    // 8. 목록에서 사라져야 함
    await page.waitForURL('**/admin/integration-projects');
    await expect(page.getByText(uniqueKey, { exact: true })).not.toBeVisible();
  });

  test('중복 key 등록 시 에러 메시지 노출', async ({ page }) => {
    // 사전에 townin은 이미 등록되어 있음 (API 스모크 테스트에서)
    await page.goto('/admin/integration-projects/new');
    await page.getByPlaceholder('townin', { exact: true }).fill('townin');
    await page.getByPlaceholder('Townin — 지역 커뮤니티 플랫폼').fill('Duplicate');
    await page.getByPlaceholder('https://townin.kr', { exact: true }).fill('https://dup.com');
    await page.getByRole('button', { name: /저장/ }).click();

    // 에러 배너 확인
    await expect(page.locator('text=/이미 같은 key/')).toBeVisible({ timeout: 5000 });
  });
});
