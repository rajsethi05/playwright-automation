import type { BrowserContext, Page } from '@playwright/test';
import type { Session } from '@api/types';
import { config } from '@config';

/** Pre-dismisses Juice Shop's welcome banner and cookie notice so they never cover the page. */
export async function dismissOverlays(context: BrowserContext): Promise<void> {
  await context.addCookies([
    { name: 'welcomebanner_status', value: 'dismiss', url: config.baseUrl },
    { name: 'cookieconsent_status', value: 'dismiss', url: config.baseUrl },
  ]);
}

/**
 * Logs the browser in with a session obtained from the API, skipping the login form.
 * Mirrors what Juice Shop's own login does: token in localStorage and a cookie, basket id
 * in sessionStorage. The reload makes the app pick the session up.
 */
export async function injectSession(page: Page, session: Session): Promise<void> {
  await page.goto('/');
  await page.evaluate(({ token, basketId }) => {
    localStorage.setItem('token', token);
    sessionStorage.setItem('bid', String(basketId));
  }, session);
  await page.context().addCookies([{ name: 'token', value: session.token, url: config.baseUrl }]);
  await page.reload();
}
