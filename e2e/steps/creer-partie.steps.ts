import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

let apiStatus = 0;

Given('je suis sur la page de création de partie', async ({ page }) => {
  await page.goto('/games/new');
});

When('je saisis le nom de partie {string}', async ({ page }, name: string) => {
  await page.getByLabel('Nom').fill(name);
});

When('je valide la création', async ({ page }) => {
  await page.getByRole('button', { name: 'Créer la partie' }).click();
});

Then('je vois la confirmation de création pour {string}', async ({ page }, name: string) => {
  await expect(page.getByTestId('game-created')).toContainText(name);
});

Then('je vois l\'erreur de nom {string}', async ({ page }, message: string) => {
  await expect(page.getByTestId('name-error')).toContainText(message);
});

When('je crée une partie via l\'API avec le nom {string}', async ({ request }, name: string) => {
  const response = await request.post('/api/games', { data: { name } });
  apiStatus = response.status();
});

Then('l\'API répond avec le statut {int}', async ({}, status: number) => {
  expect(apiStatus).toBe(status);
});
