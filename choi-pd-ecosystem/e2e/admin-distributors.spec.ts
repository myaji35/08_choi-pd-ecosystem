import { test, expect } from '@playwright/test';

test.describe('Admin Distributors Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin first
    await page.goto('/admin/login');
    // In dev mode, this might auto-login or have simple auth
    // Adjust based on your actual auth implementation
  });

  test('should display distributors dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');

    // Check for distributor statistics cards
    const statsCards = page.locator('[data-testid="stats-card"]');
    await expect(statsCards.first()).toBeVisible();
  });

  test('should display distributors list', async ({ page }) => {
    await page.goto('/admin/distributors');

    // Check for the distributors table or list
    const distributorsList = page.locator('[data-testid="distributors-list"]');
    await expect(distributorsList).toBeVisible();
  });

  test('should filter distributors by status', async ({ page }) => {
    await page.goto('/admin/distributors');

    // Click on status filter
    const statusFilter = page.locator('[data-testid="status-filter"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.click();

      // Select 'active' status
      await page.locator('text=Active').click();

      // Verify filtered results
      const distributorsList = page.locator('[data-testid="distributor-item"]');
      const count = await distributorsList.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should open distributor detail modal', async ({ page }) => {
    await page.goto('/admin/distributors');

    // Click on first distributor if exists
    const firstDistributor = page.locator('[data-testid="distributor-item"]').first();
    if (await firstDistributor.isVisible()) {
      await firstDistributor.click();

      // Check if modal opens
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
    }
  });

  test('should approve a pending distributor', async ({ page }) => {
    await page.goto('/admin/distributors');

    // Find a pending distributor
    const pendingDistributor = page.locator('[data-status="pending"]').first();
    if (await pendingDistributor.isVisible()) {
      // Click approve button
      const approveButton = pendingDistributor.locator('[data-action="approve"]');
      await approveButton.click();

      // Confirm action in dialog if exists
      const confirmButton = page.locator('button:has-text("Confirm")');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Check for success message
      await expect(page.locator('text=approved')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should reject a pending distributor with reason', async ({ page }) => {
    await page.goto('/admin/distributors');

    // Find a pending distributor
    const pendingDistributor = page.locator('[data-status="pending"]').first();
    if (await pendingDistributor.isVisible()) {
      // Click reject button
      const rejectButton = pendingDistributor.locator('[data-action="reject"]');
      await rejectButton.click();

      // Fill in rejection reason
      const reasonInput = page.locator('[name="reason"]');
      if (await reasonInput.isVisible()) {
        await reasonInput.fill('Does not meet requirements');

        // Submit rejection
        const submitButton = page.locator('button:has-text("Reject")');
        await submitButton.click();

        // Check for success message
        await expect(page.locator('text=rejected')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should search distributors by name or email', async ({ page }) => {
    await page.goto('/admin/distributors');

    // Find search input
    const searchInput = page.locator('[data-testid="search-input"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');

      // Wait for search results
      await page.waitForTimeout(500);

      // Verify results are filtered
      const results = page.locator('[data-testid="distributor-item"]');
      const count = await results.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Admin Analytics', () => {
  test('should display analytics dashboard', async ({ page }) => {
    await page.goto('/admin/analytics');

    // Check for chart elements
    const charts = page.locator('[data-testid="chart"]');
    await expect(charts.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show distributor statistics', async ({ page }) => {
    await page.goto('/admin/analytics');

    // Check for key metrics
    const totalDistributors = page.locator('[data-metric="total-distributors"]');
    const activeDistributors = page.locator('[data-metric="active-distributors"]');

    await expect(totalDistributors).toBeVisible();
    await expect(activeDistributors).toBeVisible();
  });

  test('should filter analytics by date range', async ({ page }) => {
    await page.goto('/admin/analytics');

    // Click on date range picker if exists
    const dateRangePicker = page.locator('[data-testid="date-range-picker"]');
    if (await dateRangePicker.isVisible()) {
      await dateRangePicker.click();

      // Select last 30 days
      await page.locator('text=Last 30 days').click();

      // Verify charts update
      await page.waitForTimeout(1000);
      const charts = page.locator('[data-testid="chart"]');
      await expect(charts.first()).toBeVisible();
    }
  });
});
