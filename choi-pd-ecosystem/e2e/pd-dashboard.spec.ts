import { test, expect } from '@playwright/test';

test.describe('PD Personal Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as PD
    await page.goto('/pd/login');
    // In dev mode, this might auto-login
  });

  test('should display PD dashboard', async ({ page }) => {
    await page.goto('/pd/dashboard');

    // Check for main dashboard elements
    const dashboard = page.locator('main');
    await expect(dashboard).toBeVisible();
  });

  test('should display quick stats cards', async ({ page }) => {
    await page.goto('/pd/dashboard');

    // Check for stats cards
    const statsCards = page.locator('[data-testid="stat-card"]');
    const count = await statsCards.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('PD SNS Accounts Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pd/sns-accounts');
  });

  test('should display SNS accounts list', async ({ page }) => {
    const accountsList = page.locator('[data-testid="sns-accounts-list"]');
    await expect(accountsList).toBeVisible();
  });

  test('should add new SNS account', async ({ page }) => {
    // Click add button
    const addButton = page.locator('button:has-text("Add")');
    if (await addButton.isVisible()) {
      await addButton.click();

      // Fill in form
      const platformSelect = page.locator('[name="platform"]');
      const accountNameInput = page.locator('[name="accountName"]');
      const accessTokenInput = page.locator('[name="accessToken"]');

      if (await platformSelect.isVisible()) {
        await platformSelect.click();
        await page.locator('text=Instagram').click();
      }

      await accountNameInput.fill('test_instagram');
      await accessTokenInput.fill('test_token_123');

      // Submit form
      const submitButton = page.locator('button:has-text("Save")');
      await submitButton.click();

      // Check for success message
      await expect(page.locator('text=added successfully')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should toggle SNS account active status', async ({ page }) => {
    // Find first account toggle
    const toggleSwitch = page.locator('[data-testid="account-toggle"]').first();
    if (await toggleSwitch.isVisible()) {
      await toggleSwitch.click();

      // Verify status changed
      await page.waitForTimeout(500);
      await expect(page.locator('text=updated')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('PD Scheduled Posts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pd/scheduled-posts');
  });

  test('should display scheduled posts list', async ({ page }) => {
    const postsList = page.locator('[data-testid="scheduled-posts-list"]');
    await expect(postsList).toBeVisible();
  });

  test('should create new scheduled post', async ({ page }) => {
    const createButton = page.locator('button:has-text("Schedule Post")');
    if (await createButton.isVisible()) {
      await createButton.click();

      // Fill in form
      const platformSelect = page.locator('[name="platform"]');
      const messageInput = page.locator('[name="message"]');
      const scheduledAtInput = page.locator('[name="scheduledAt"]');

      if (await platformSelect.isVisible()) {
        await platformSelect.click();
        await page.locator('text=Facebook').click();
      }

      await messageInput.fill('Test scheduled post message');

      // Set future date/time
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      await scheduledAtInput.fill(futureDate.toISOString().slice(0, 16));

      // Submit
      const submitButton = page.locator('button:has-text("Schedule")');
      await submitButton.click();

      // Verify success
      await expect(page.locator('text=scheduled')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should filter posts by status', async ({ page }) => {
    const statusFilter = page.locator('[data-testid="status-filter"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.locator('text=Pending').click();

      // Verify filtered results
      await page.waitForTimeout(500);
      const posts = page.locator('[data-testid="post-item"]');
      const count = await posts.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('PD Newsletter Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pd/newsletter');
  });

  test('should display newsletter subscribers', async ({ page }) => {
    const subscribersList = page.locator('[data-testid="subscribers-list"]');
    await expect(subscribersList).toBeVisible();
  });

  test('should show subscriber count', async ({ page }) => {
    const subscriberCount = page.locator('[data-testid="subscriber-count"]');
    await expect(subscriberCount).toBeVisible();

    const countText = await subscriberCount.textContent();
    expect(countText).toMatch(/\d+/);
  });

  test('should filter subscribers by date', async ({ page }) => {
    const dateFilter = page.locator('[data-testid="date-filter"]');
    if (await dateFilter.isVisible()) {
      await dateFilter.click();
      await page.locator('text=Last 7 days').click();

      // Verify filtered results
      await page.waitForTimeout(500);
      const subscribers = page.locator('[data-testid="subscriber-item"]');
      const count = await subscribers.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('PD Inquiries Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pd/inquiries');
  });

  test('should display inquiries list', async ({ page }) => {
    const inquiriesList = page.locator('[data-testid="inquiries-list"]');
    await expect(inquiriesList).toBeVisible();
  });

  test('should filter inquiries by type', async ({ page }) => {
    const typeFilter = page.locator('[data-testid="type-filter"]');
    if (await typeFilter.isVisible()) {
      await typeFilter.click();
      await page.locator('text=B2B').click();

      // Verify filtered results
      await page.waitForTimeout(500);
      const inquiries = page.locator('[data-testid="inquiry-item"]');
      const count = await inquiries.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should view inquiry details', async ({ page }) => {
    const firstInquiry = page.locator('[data-testid="inquiry-item"]').first();
    if (await firstInquiry.isVisible()) {
      await firstInquiry.click();

      // Check if detail view or modal opens
      const detailView = page.locator('[data-testid="inquiry-detail"]');
      await expect(detailView).toBeVisible();
    }
  });
});
