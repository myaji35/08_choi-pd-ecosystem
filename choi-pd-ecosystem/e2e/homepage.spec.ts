import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check that the page title or heading is visible
    await expect(page).toHaveTitle(/최범희 PD|Choi PD/i);
  });

  test('should display the hero section', async ({ page }) => {
    await page.goto('/');

    // Check for hero section elements
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
  });

  test('should display service cards', async ({ page }) => {
    await page.goto('/');

    // Check for the three service cards (Education, Media, Works)
    // The exact text depends on your implementation
    const educationCard = page.getByText(/교육|Education/i);
    const mediaCard = page.getByText(/미디어|Media|환경저널/i);
    const worksCard = page.getByText(/작품|Works/i);

    await expect(educationCard).toBeVisible();
    await expect(mediaCard).toBeVisible();
    await expect(worksCard).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that the hero section is still visible on mobile
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
  });
});
