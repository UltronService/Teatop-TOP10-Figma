const { test, expect } = require('@playwright/test');

test.describe('Backend (Admin CMS) Tests', () => {
  test('Should render the header correctly', async ({ page }) => {
    await page.goto('http://localhost:8085/admin-v0.html');
    await expect(page.locator('h1')).toContainText('TOP 10');
  });

  test('Should show product catalog when clicking catalog tab', async ({ page }) => {
    await page.goto('http://localhost:8085/admin-v0.html');
    
    // Switch to catalog
    await page.locator('button:has-text("商品總庫")').click();
    await page.waitForSelector('text=全域商品總庫');
    const header = await page.locator('h2').first();
    await expect(header).toContainText('全域商品總庫');
  });

  test('Should move item up when clicking up button', async ({ page }) => {
    await page.goto('http://localhost:8085/admin-v0.html');
    
    // Wait for drinks to load
    await page.waitForSelector('.w-10.h-10.rounded-full');
    
    // Find the second drink name before move
    const secondDrinkBefore = await page.locator('.font-bold.text-lg').nth(1).textContent();
    
    // The second row has index 1. Its up button is the 3rd button matching '.flex-col > button'
    await page.locator('.flex-col > button').nth(2).click();
    
    // Find the first drink name after move
    const firstDrinkAfter = await page.locator('.font-bold.text-lg').nth(0).textContent();
    
    expect(firstDrinkAfter.trim()).toContain(secondDrinkBefore.trim());
  });
});
