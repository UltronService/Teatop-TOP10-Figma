const { test, expect } = require('@playwright/test');

test.describe('Frontend (Signage) Tests', () => {
  test('Should render the 10 drinks correctly', async ({ page }) => {
    await page.goto('http://localhost:8085/index2.html');
    await page.waitForSelector('.menu-row');
    const rows = page.locator('.menu-row');
    await expect(rows).toHaveCount(10);
  });

  test('Should switch active item automatically', async ({ page }) => {
    await page.goto('http://localhost:8085/index2.html');
    await page.waitForSelector('.menu-row');
    
    const firstRow = page.locator('.menu-row').nth(0);
    await expect(firstRow).toHaveClass(/active/);

    await page.waitForTimeout(5100);
    
    const secondRow = page.locator('.menu-row').nth(1);
    await expect(secondRow).toHaveClass(/active/);
  });
});
