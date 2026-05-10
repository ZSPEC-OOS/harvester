import { test, expect } from '@playwright/test';

test('dashboard panels and nav', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByText('Dashboard')).toBeVisible();
  await expect(page.getByRole('button', { name: /run/i })).toBeDisabled();
  await page.getByLabel(/topic/i).fill('AI safety');
  await expect(page.getByRole('button', { name: /run/i })).toBeEnabled();
  await page.goto('/projects');
  await expect(page).toHaveURL(/projects/);
  await page.goto('/settings');
  await expect(page).toHaveURL(/settings/);
});
