const { test, expect } = require("@playwright/test");

test("gallery modal", async ({ page }) => {
  await page.goto("/");

  await page.fill("#datePassword", "01112025");
  await page.click("#unlockBtn");

  await expect(page.locator("#mainContent")).toBeVisible();

  const firstCard = page.locator("#galleryGrid button").first();
  await expect(firstCard).toBeVisible();
  await firstCard.click();

  await expect(page.locator("#galleryModal")).toBeVisible();
  await expect(page).toHaveURL(/#photo-\d+$/);

  await page.keyboard.press("Escape");
  await expect(page.locator("#galleryModal")).toBeHidden();
});
