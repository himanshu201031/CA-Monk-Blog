// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E tests for the blog list and detail navigation.
 */
test.describe('Blog App - List & Detail', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to get a stable, predictable starting state
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');
  });

  test('loads the homepage with hero and latest articles', async ({ page }) => {
    // Hero heading renders
    await expect(page.getByRole('heading', { name: 'CA Monk Blog' })).toBeVisible();

    // "Latest Articles" sidebar heading renders
    await expect(page.getByText('Latest Articles')).toBeVisible();

    // The default blog (from localStorage fallback seed) appears
    await expect(page.getByText('Future of Fintech', { exact: true })).toBeVisible();
    await expect(page.getByText('The Rise of Remote Work', { exact: true })).toBeVisible();
  });

  test('displays the first article details by default', async ({ page }) => {
    // The detail view should show the first (selected by default) blog content
    await expect(page.getByText('Exploring how AI and blockchain are reshaping financial services')).toBeVisible();
    await expect(page.getByText('Share Article')).toBeVisible();
  });

  test('navigates to a blog detail when a card is clicked', async ({ page }) => {
    // Click the second blog card
    await page.getByText('The Rise of Remote Work', { exact: true }).first().click();

    // The detail view updates to show the second blog content
    await expect(page.getByText('How the pandemic accelerated the shift to distributed teams')).toBeVisible();
  });

  test('create post modal opens', async ({ page }) => {
    // Click "Create Post" button in the nav
    await page.getByRole('button', { name: 'Create Post' }).click();

    // Modal appears with "Publish Story" heading
    await expect(page.getByRole('heading', { name: 'Publish Story' })).toBeVisible();
    // The create form fields are present
    await expect(page.getByPlaceholder("What's the title?")).toBeVisible();
  });
});

