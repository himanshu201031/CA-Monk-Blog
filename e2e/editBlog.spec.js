// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Seed data helper that injects a known blog into localStorage
 * so the edit/update flow has a stable article to modify.
 */
const seedBlogLocalStorage = `(() => {
  const blogs = [
    {
      id: 1,
      title: 'Original Title To Edit',
      category: ['GENERAL'],
      description: 'Original description before editing.',
      date: new Date().toISOString(),
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
      content: 'Original narrative content.'
    }
  ];
  localStorage.setItem('camonk_blogs', JSON.stringify(blogs));
})()`;

/**
 * E2E test for editing an existing blog post.
 */
test.describe('Edit Blog Post', () => {
  test.beforeEach(async ({ page }) => {
    // Reset and seed localStorage with the blog we want to edit
    await page.addInitScript(() => localStorage.clear());
    await page.addInitScript(seedBlogLocalStorage);
    await page.goto('/');
    await expect(page.getByText('Original Title To Edit', { exact: true })).toBeVisible();
  });

  test('edits the blog title and saves the change', async ({ page }) => {
    // Hover over the blog card to reveal the action buttons and click edit.
    // Locate the card container (div) that contains the title, then find the
    // first icon button (the pencil/edit button).
    const card = page.getByText('Original Title To Edit', { exact: true }).locator('xpath=ancestor::div[contains(@class,"group")][1]');
    await card.hover();

    // The BlogCard renders two icon buttons (edit & delete). Click the first (edit).
    await card.getByRole('button').nth(0).click();

    // Edit modal appears
    await expect(page.getByRole('heading', { name: 'Edit Article' })).toBeVisible();

// Change the title field (Headline input) - it's the first text input in the edit form
    const newTitle = `Edited E2E Title ${Date.now()}`;
    await page.locator('.fixed form input').first().fill(newTitle);

    // Save the changes
    await page.getByRole('button', { name: 'Update Post' }).click();

    // Modal should close
    await expect(page.getByRole('heading', { name: 'Edit Article' })).toBeHidden();

    // Updated title should appear in the list
    await expect(page.getByText(newTitle, { exact: true })).toBeVisible();
  });
});

