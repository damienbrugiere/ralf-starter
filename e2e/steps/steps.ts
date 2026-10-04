import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

let apiBody: { status?: string } = {};

Given('je suis sur la page d\'accueil', async ({ page }) => {
  await page.goto('/');
});

Then('je vois le titre {string}', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
});

Then('le statut du serveur est {string}', async ({ page }, text: string) => {
  await expect(page.getByTestId('backend-status')).toHaveText(text);
});

When('j\'appelle l\'endpoint de santé de l\'API', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.ok()).toBeTruthy();
  apiBody = await response.json();
});

Then('la réponse a le statut {string}', async ({}, status: string) => {
  expect(apiBody.status).toBe(status);
});
