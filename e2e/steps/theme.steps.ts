import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given("le système préfère le thème sombre", async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
});

When('je bascule le thème', async ({ page }) => {
  await page.getByTestId('theme-toggle').click();
});

Then('le thème actif est {string}', async ({ page }, theme: string) => {
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
});
