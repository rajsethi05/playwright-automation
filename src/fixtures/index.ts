import {
  test as base,
  expect,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import { JuiceShopApi } from "@api/JuiceShopApi";
import type { Session, UserDetails } from "@api/types";
import { config } from "@config";
import { buildUser } from "@data/userFactory";
import { BasketPage } from "@pages/BasketPage";
import { LoginPage } from "@pages/LoginPage";
import { ProductsPage } from "@pages/ProductsPage";
import { dismissOverlays, injectSession } from "@utils/browserSession";
import { RegistrationPage } from "@pages/RegistrationPage";

type Fixtures = {
  /** API clients without authentication. */
  api: JuiceShopApi;
  /** A unique user, registered via the API before the test starts. */
  newUser: UserDetails;
  /** `newUser`, logged in via the API. */
  session: Session;
  /** API clients authenticated as `newUser`. */
  authedApi: JuiceShopApi;
  /** The default `page`, logged in as `newUser` without going through the login form. */
  loggedInPage: Page;
  /**
   * Registers another unique user and returns a page logged in as them, in a browser context
   * of its own, so several users can be active at once.
   */
  loginAsNewUser: () => Promise<{ page: Page; session: Session }>;

  basketPage: BasketPage;
  loginPage: LoginPage;
  productsPage: ProductsPage;
  registrationPage: RegistrationPage;
};

/**
 * Every spec imports `test` and `expect` from here, never from '@playwright/test'.
 * Fixtures are lazy: a test only pays for (e.g. a browser, a registered user) what it asks for.
 */
export const test = base.extend<Fixtures>({
  context: async ({ context }, use) => {
    await dismissOverlays(context);
    await use(context);
  },

  api: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({
      baseURL: config.apiUrl,
    });
    await use(new JuiceShopApi(request));
    await request.dispose();
  },

  newUser: async ({ api }, use) => {
    const user = buildUser();
    await api.users.create(user);
    await use(user);
  },

  session: async ({ api, newUser }, use) => {
    await use(await api.auth.createSession(newUser));
  },

  authedApi: async ({ playwright, session }, use) => {
    const request = await playwright.request.newContext({
      baseURL: config.apiUrl,
      extraHTTPHeaders: { Authorization: `Bearer ${session.token}` },
    });
    await use(new JuiceShopApi(request));
    await request.dispose();
  },

  loggedInPage: async ({ page, session }, use) => {
    await injectSession(page, session);
    await use(page);
  },

  // Contexts made here get the project's `use` options (baseURL, viewport, ...) like `context` does.
  loginAsNewUser: async ({ browser, api }, use) => {
    const contexts: BrowserContext[] = [];
    await use(async () => {
      const user = buildUser();
      await api.users.create(user);
      const session = await api.auth.createSession(user);
      const context = await browser.newContext();
      contexts.push(context);
      await dismissOverlays(context);
      const page = await context.newPage();
      await injectSession(page, session);
      return { page, session };
    });
    await Promise.all(contexts.map((context) => context.close()));
  },

  basketPage: async ({ page }, use) => {
    await use(new BasketPage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },

  registrationPage: async ({ page }, use) => {
    await use(new RegistrationPage(page));
  },
});

export { expect };
