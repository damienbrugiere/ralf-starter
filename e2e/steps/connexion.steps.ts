import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { loginWithDiscord, MOCK_OAUTH } from '../support/auth';

const { Given, When, Then } = createBdd();

Given('je suis connecté avec Discord', async ({ page }) => {
  await loginWithDiscord(page);
});

Given('le fournisseur refusera la prochaine connexion', async ({ page }) => {
  await page.request.get(`${MOCK_OAUTH}/__deny`);
});

When('j\'ouvre la page {string}', async ({ page }, path: string) => {
  await page.goto(path);
});

When('je clique sur {string}', async ({ page }, label: string) => {
  await page.getByRole('link', { name: label }).or(page.getByRole('button', { name: label })).click();
});

Then('je suis sur la page de connexion', async ({ page }) => {
  await expect(page).toHaveURL(/\/login(\?.*)?$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Connexion' })).toBeVisible();
});

Then('je vois les boutons de connexion Discord et Google', async ({ page }) => {
  await expect(page.getByRole('link', { name: 'Se connecter avec Discord' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Se connecter avec Google' })).toBeVisible();
});

Then('je vois mon nom {string} dans l\'en-tête', async ({ page }, name: string) => {
  await expect(page.getByTestId('user-name')).toHaveText(name);
});

Then('je vois le message de connexion {string}', async ({ page }, text: string) => {
  await expect(page.getByTestId('login-message')).toContainText(text);
});

Then('je ne vois pas de nom d\'utilisateur dans l\'en-tête', async ({ page }) => {
  await expect(page.getByTestId('user-name')).toHaveCount(0);
});

let anonymousStatus: Record<string, number> = {};

When('un visiteur non connecté appelle {string} via l\'API', async ({ playwright }, path: string) => {
  const anonymous = await playwright.request.newContext({ baseURL: 'http://localhost:4200' });
  anonymousStatus[path] = (await anonymous.get(path)).status();
  await anonymous.dispose();
});

Then('l\'appel à {string} est refusé avec le statut {int}', async ({}, path: string, status: number) => {
  expect(anonymousStatus[path]).toBe(status);
});
