// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E test for creating a new blog post.
 */
test.describe('Create Blog Post', () => {
  test.beforeEach(async ({ page }) => {
    // Reset state so we start from a clean localStorage
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');
  });

  test('creates a new blog post and shows it in the list', async ({ page }) => {
    // Open the create modal
    await page.getByRole('button', { name: 'Create Post' }).click();
    await expect(page.getByRole('heading', { name: 'Publish Story' })).toBeVisible();

    // Fill in the form
    const uniqueTitle = `My New E2E Post ${Date.now()}`;
    await page.getByPlaceholder("What's the title?").fill(uniqueTitle);
    await page.getByPlaceholder('Short description...').fill('A blog post created during Playwright E2E tests.');
    await page.getByPlaceholder('Write your story...').fill('This is the full narrative content of the E2E blog post.');

    // Submit
    await page.getByRole('button', { name: 'Publish Insight' }).click();

    // The modal should close after a successful create
    await expect(page.getByRole('heading', { name: 'Publish Story' })).toBeHidden();

    // The newly created blog should appear in the Latest Articles list
    await expect(page.getByText(uniqueTitle, { exact: true })).toBeVisible();
  });

  test('does not submit when title and content are empty', async ({ page }) => {
    // Open the create modal
    await page.getByRole('button', { name: 'Create Post' }).click();
    await expect(page.getByRole('heading', { name: 'Publish Story' })).toBeVisible();

    // Try to submit with empty fields
    await page.getByRole('button', { name: 'Publish Insight' }).click();

    // The modal should still be open (validation prevented submit)
    await expect(page.getByRole('heading', { name: 'Publish Story' })).toBeVisible();
  });
});

