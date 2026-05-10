import { test, expect } from '@playwright/test';

test('research session end to end flow shell', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel(/topic/i).fill('Quantum networking');
  await page.getByRole('button', { name: /run/i }).click();
  await expect(page.getByText(/activity|console|running/i)).toBeVisible();
});
