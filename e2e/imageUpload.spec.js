// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E test for the cover-image upload flow in the create-post modal.
 */
test.describe('Image Upload', () => {
  test.beforeEach(async ({ page }) => {
    // Reset localStorage for a clean, predictable start
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');
  });

  test('selecting an image file shows a preview in the create form', async ({ page }) => {
    // Open the create modal
    await page.getByRole('button', { name: 'Create Post' }).click();
    await expect(page.getByRole('heading', { name: 'Publish Story' })).toBeVisible();

    // The upload dropzone should show the "Upload Image" placeholder initially
    await expect(page.getByText('Upload Image')).toBeVisible();

    // Provide a tiny valid 1x1 PNG via an in-memory buffer
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );

    // setInputFiles on the file input inside the modal
    await page.locator('.fixed input[type="file"]').setInputFiles({
      name: 'cover.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    });

    // A preview image (alt="Preview") should appear and the placeholder disappear
    await expect(page.getByAltText('Preview')).toBeVisible();
    await expect(page.getByText('Upload Image')).toBeHidden();
  });
});

