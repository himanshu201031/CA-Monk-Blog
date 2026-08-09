// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Seed data helper that injects a known blog into localStorage
 * so the delete flow has a stable article to remove.
 */
const seedBlogLocalStorage = `(() => {
  const blogs = [
    {
      id: 1,
      title: 'Blog To Delete',
      category: ['GENERAL'],
      description: 'This article will be deleted in the test.',
      date: new Date().toISOString(),
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
      content: 'Content that will be removed.'
    }
  ];
  localStorage.setItem('camonk_blogs', JSON.stringify(blogs));
})()`;

/**
 * E2E test for deleting an existing blog post.
 */
test.describe('Delete Blog Post', () => {
  test.beforeEach(async ({ page }) => {
    // Reset and seed localStorage with the blog we want to delete
    await page.addInitScript(() => localStorage.clear());
    await page.addInitScript(seedBlogLocalStorage);
    await page.goto('/');
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('heading', { name: 'Blog To Delete' })).toBeVisible();
  });

  test('deletes a blog after confirmation', async ({ page }) => {
// Hover over the blog card to reveal the action buttons and click delete.
    // Locate the card container (div) that contains the title in the sidebar,
    // then find the second icon button (the delete button).
    const heading = page.getByRole('complementary').getByRole('heading', { name: 'Blog To Delete' });
    const card = heading.locator('xpath=ancestor::div[contains(@class,"group")][1]');
    await card.hover();

    // The BlogCard renders two icon buttons (edit & delete). Click the second (delete).
    await card.getByRole('button').nth(1).click();

    // Delete confirmation modal appears
    await expect(page.getByRole('heading', { name: 'Delete article?' })).toBeVisible();

    // Confirm deletion
    await page.getByRole('button', { name: 'Delete', exact: true }).click();

    // Modal closes
    await expect(page.getByRole('heading', { name: 'Delete article?' })).toBeHidden();

    // The blog should no longer appear in the list; "No articles found" shows
    await expect(page.getByText('Blog To Delete', { exact: true })).toBeHidden();
    await expect(page.getByText('No articles found')).toBeVisible();
  });
});

