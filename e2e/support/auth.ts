import { expect, Page } from '@playwright/test';

export const MOCK_OAUTH = 'http://localhost:9100';

/** Connexion complète via le faux fournisseur Discord. */
export async function loginWithDiscord(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByTestId('login-discord').click();
  await expect(page.getByTestId('user-name')).toBeVisible();
}

/** En-têtes CSRF à joindre aux appels d'API modifiants (cookie XSRF-TOKEN -> X-XSRF-TOKEN). */
export async function csrfHeaders(page: Page): Promise<Record<string, string>> {
  const cookies = await page.context().cookies();
  const token = cookies.find((c) => c.name === 'XSRF-TOKEN')?.value;
  return token ? { 'X-XSRF-TOKEN': token } : {};
}

/** POST JSON sur l'API avec la session (cookies) et le jeton CSRF de la page. */
export async function apiPost(page: Page, url: string, data: unknown) {
  return page.request.post(url, { data, headers: await csrfHeaders(page) });
}
