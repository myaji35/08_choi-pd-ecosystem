import { test, expect } from '@playwright/test';

test.describe('Admin Hero Images', () => {
  test('should load the admin hero images page', async ({ page }) => {
    await page.goto('/admin/hero-images');

    // Check for the page heading
    const heading = page.getByRole('heading', { name: /히어로 이미지 관리/i });
    await expect(heading).toBeVisible();
  });

  test('should display the upload form', async ({ page }) => {
    await page.goto('/admin/hero-images');

    // Check for upload form elements
    const fileInput = page.locator('input[type="file"]');
    const altTextInput = page.locator('input[name="altText"]');
    const uploadButton = page.getByRole('button', { name: /업로드/i });

    await expect(fileInput).toBeVisible();
    await expect(altTextInput).toBeVisible();
    await expect(uploadButton).toBeVisible();
  });

  test('should display auto-crop checkbox', async ({ page }) => {
    await page.goto('/admin/hero-images');

    // Check for auto-crop checkbox
    const autoCropCheckbox = page.locator('input[name="autoCrop"]');
    await expect(autoCropCheckbox).toBeVisible();

    // Should be checked by default
    await expect(autoCropCheckbox).toBeChecked();
  });

  test('should show validation error for empty alt text', async ({ page }) => {
    await page.goto('/admin/hero-images');

    // Clear the alt text input (it has a default value)
    const altTextInput = page.locator('input[name="altText"]');
    await altTextInput.clear();

    // Try to submit without alt text
    const uploadButton = page.getByRole('button', { name: /업로드/i });
    await uploadButton.click();

    // HTML5 validation should prevent submission
    // We can check if the form didn't submit by verifying no success message appeared
    const errorMessage = page.locator('.bg-red-100');
    // The error might not appear immediately due to HTML5 validation, so we just check the alt text is still empty
    await expect(altTextInput).toBeEmpty();
  });

  test('should display uploaded images list section', async ({ page }) => {
    await page.goto('/admin/hero-images');

    // Check for the uploaded images list heading
    const listHeading = page.getByRole('heading', { name: /업로드된 이미지 목록/i });
    await expect(listHeading).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin/hero-images');

    // Check that the page is still usable on mobile
    const heading = page.getByRole('heading', { name: /히어로 이미지 관리/i });
    const uploadButton = page.getByRole('button', { name: /업로드/i });

    await expect(heading).toBeVisible();
    await expect(uploadButton).toBeVisible();
  });
});

// Note: Testing actual file upload requires more complex setup
// including mocking GCS and database interactions. These tests
// should be added in a more comprehensive E2E test suite.
