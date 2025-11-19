import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('homepage should not have automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('admin hero images page should not have automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/admin/hero-images');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('homepage should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Filter for heading-related violations
    const headingViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === 'heading-order'
    );

    expect(headingViolations).toHaveLength(0);
  });

  test('all images should have alt text', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Check for image-alt violations
    const imageAltViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === 'image-alt'
    );

    expect(imageAltViolations).toHaveLength(0);
  });

  test('admin page forms should have proper labels', async ({ page }) => {
    await page.goto('/admin/hero-images');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Check for label violations
    const labelViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === 'label'
    );

    expect(labelViolations).toHaveLength(0);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    // Check for color contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === 'color-contrast'
    );

    expect(contrastViolations).toHaveLength(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Test keyboard navigation
    await page.keyboard.press('Tab');

    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? el.tagName : null;
    });

    // Ensure that we can tab to interactive elements
    expect(focusedElement).toBeTruthy();
  });

  test('buttons should have accessible names', async ({ page }) => {
    await page.goto('/admin/hero-images');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Check for button-name violations
    const buttonNameViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === 'button-name'
    );

    expect(buttonNameViolations).toHaveLength(0);
  });
});
