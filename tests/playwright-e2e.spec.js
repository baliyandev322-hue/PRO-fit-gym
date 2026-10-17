// @ts-check
import { test, expect } from '@playwright/test';

test.describe('PROFIT Training Club — Critical User Journeys (Phases 2, 5, 8)', () => {

  test('Journey 1: Landing Page loads cleanly with brand header and key CTAs', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('404')) {
          consoleErrors.push(text);
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Title verification
    await expect(page).toHaveTitle(/PROFIT/i);

    // Hero headline verification
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();

    // Key CTA buttons
    const trialBtn = page.getByRole('button', { name: /Book Free Trial Pass/i });
    await expect(trialBtn).toBeVisible();

    const membershipLink = page.getByRole('link', { name: /Apply For Membership/i }).first();
    await expect(membershipLink).toBeVisible();

    // Check images loaded properly
    const images = await page.locator('img').all();
    expect(images.length).toBeGreaterThan(0);

    // Verify zero fatal console errors
    expect(consoleErrors.length).toBe(0);
  });

  test('Journey 2: Free Trial Pass Modal opens, validates inputs, and completes application', async ({ page }) => {
    await page.goto('/');

    // Click trial CTA button
    const openModalBtn = page.getByRole('button', { name: /Book Free Trial Pass/i });
    await openModalBtn.click();

    // Modal dialog should be visible
    const modalHeading = page.getByText(/EXPERIENCE PROFIT ATHLETIC CLUB/i);
    await expect(modalHeading).toBeVisible();

    // Input fields
    const nameInput = page.locator('input[placeholder*="Jordan Vance"]');
    const emailInput = page.locator('input[placeholder*="jordan@athlete.com"]');
    const phoneInput = page.locator('input[placeholder*="555-0199"]');

    // Fill valid trial information
    await nameInput.fill('Playwright Test Athlete');
    await emailInput.fill('playwright.athlete@gymtest.com');
    await phoneInput.fill('+1 (212) 555-7788');

    // Submit form
    const submitBtn = page.getByRole('button', { name: /Reserve Complimentary Pass/i });
    await submitBtn.click();

    // Expect success toast confirmation badge
    await expect(
      page.getByText(/TRIAL PASS CONFIRMED/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('Journey 3: Contact Concierge Form handles inquiry submissions', async ({ page }) => {
    await page.goto('/');

    const nameField = page.locator('input[placeholder*="David Sterling"]');
    if (await nameField.isVisible()) {
      const emailField = page.locator('input[placeholder*="david@capital.com"]');
      const messageField = page.locator('textarea[placeholder*="Inquiring about executive lockers"]');
      const submitBtn = page.getByRole('button', { name: /Transmit Concierge Inquiry/i });

      // Fill valid inquiry
      await nameField.fill('Jordan Bell Concierge Test');
      await emailField.fill('jordan.bell@testmail.com');
      await messageField.fill('Inquiring about personal training slot availability for peak hours.');

      await submitBtn.click();

      // Verify success notification toast
      await expect(
        page.getByText(/INQUIRY TRANSMITTED|THANK YOU|MESSAGE/i).first()
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('Journey 4: Admin Authentication Flow & Dashboard Access', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/.*login/);

    await page.locator('input[type="email"]').fill('admin@profitgym.com');
    await page.locator('input[type="password"]').fill('password123');

    // Submit Login
    const loginSubmitBtn = page.getByRole('button', { name: /Sign In To Portal/i });
    await loginSubmitBtn.click();

    // Should redirect to Admin Dashboard
    await expect(page).toHaveURL(/.*admin\/dashboard/, { timeout: 10000 });

    // Verify Admin Dashboard key elements are visible
    await expect(page.getByText(/EXECUTIVE OPERATIONS & TELEMETRY|Admin Terminal/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('Journey 5: Member Authentication & Access Pass display', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input[type="email"]').fill('alex.vance@athlete.com');
    await page.locator('input[type="password"]').fill('password123');

    const loginSubmitBtn = page.getByRole('button', { name: /Sign In To Portal/i });
    await loginSubmitBtn.click();

    // Redirect to member dashboard
    await expect(page).toHaveURL(/.*member\/dashboard/, { timeout: 10000 });

    // Verify member portal greeting in main view
    await expect(page.getByRole('heading', { level: 2, name: /Alex Vance/i })).toBeVisible({ timeout: 10000 });
  });

});
