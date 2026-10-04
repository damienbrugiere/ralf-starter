import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('une partie {string} existe via l\'API', async ({ request }, name: string) => {
  const response = await request.post('/api/games', { data: { name } });
  expect(response.status()).toBe(201);
});

When('j\'ouvre la liste des parties', async ({ page }) => {
  await page.goto('/games');
});

Then('je vois la partie {string} dans la liste', async ({ page }, name: string) => {
  await expect(page.getByTestId('game-item').filter({ hasText: name }).first()).toBeVisible();
});

let listResponse: { status: number; body: unknown } = { status: 0, body: null };

When('je demande la liste des parties via l\'API', async ({ request }) => {
  const response = await request.get('/api/games');
  listResponse = { status: response.status(), body: await response.json() };
});

Then('l\'API renvoie une liste', async ({}) => {
  expect(listResponse.status).toBe(200);
  expect(Array.isArray(listResponse.body)).toBe(true);
});
