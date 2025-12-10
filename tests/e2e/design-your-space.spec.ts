import { test, expect } from '@playwright/test';

test('planner loads hero scene', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await expect(page.getByText('Design Your Space')).toBeVisible();
});
