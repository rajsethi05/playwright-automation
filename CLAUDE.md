# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Instructions

- When asked to implement anything, first make a plan and provide the details to the user. Proceed with code change only after user approval.
- Use the best practices for all the implementations.
- If anything is unclear or contradictory, ask first, do not take decisions.
- Feel free to raise concerns or disagree if required.
- Feel free to recommend me best plan possible.
- Use double quote in the entire project instead of single quote.
- do not run the test after implementation. I will as you explicitely to run it when required.

## Project

A Playwright Test (TypeScript) page object framework for OWASP Juice Shop (v20.2.0) running at `http://127.0.0.1:3000`. Juice Shop must be started separately; there is no `webServer` block. The test cases are in `TestCases - JuiceShop.pdf` at the repo root. Their ids encode type and module: `TC-UI-<MODULE>-n` (e.g. `TC-UI-REG-2`), `TC-UI-E2E-n`, `TC-API-n`, `TC-API-SCH-n` and `TC-API-E2E-n`.

## Commands

```bash
npm ci && npx playwright install --with-deps
npm test                                  # everything
npm run test:ui                           # or test:api / test:e2e-ui / test:e2e-api
npx playwright test -g "TC-UI-PROD-4:"    # one test by id; keep the colon ("TC-UI-REG-1" would also match TC-UI-REG-10)
npx playwright test --headed              # or --ui / --debug
BROWSERS=chromium,firefox,webkit npm test
npm run report                            # HTML report (never auto-opens)
npm run typecheck
npm run lint                              # lint:fix to autofix
npm run format                            # Prettier; format:check to verify only
```

## Architecture

- **Config:** `config/config.ts` is the only place for tunable values. Each value has a default and an env var override, and a `.env` file is also read (see `.env.example`). `playwright.config.ts` only wires the config in, so don't hard-code values there.
- **Projects:**
  - `api` runs `tests/api-tests` and `tests/e2e-api-tests` once, with no browser.
  - Each browser in `config.browsers` (default: chromium only) gets its own project that runs `tests/ui-tests` and `tests/e2e-ui-tests`.
  - Projects select files with `testMatch` on `*.spec.ts`, so other file names aren't picked up.
- **Where tests go:**
  - `TC-UI-E2E-*` → `tests/e2e-ui-tests`; `TC-API-E2E-*` → `tests/e2e-api-tests`.
  - Any other test that touches the UI goes in `tests/ui-tests`, even if its setup or some of its steps use the API.
  - Other pure API tests (`TC-API-*`, `TC-API-SCH-*`) go in `tests/api-tests`.
  - Prefix test titles with the PDF id and a colon, e.g. `"TC-UI-PROD-4: …"`.
- **Fixtures:** specs import `test`/`expect` from `@fixtures` (`src/fixtures/index.ts`), never from `@playwright/test`.
  - `api`: unauthenticated API clients.
  - `newUser`: a unique user registered via the API.
  - `session`: `newUser` logged in via the API (token and basket id).
  - `authedApi`: API clients authenticated as `newUser`.
  - `loggedInPage`: the browser logged in as `newUser` without using the login form. Build page objects on it (`new ProductsPage(loggedInPage)`), so the login is visible in the test and ESLint doesn't flag an unused fixture.
  - `loginAsNewUser()`: a factory for tests that need several users at once. Each call registers a user and returns `{ page, session }` in a browser context of its own. Contexts made with `browser.newContext()` inside tests inherit the project's `use` options.
  - Each page object also has a fixture. Register new page objects there.
- **Page objects (`src/pages`):** they extend `BasePage`, which provides the hash-route `path`, `goto()`, `navBar` and `snackBar`.
  - Parts that belong to one page live in its file as plain classes wrapping a `root` locator, e.g. `ProductCard` and `ProductDetailsDialog` in `ProductsPage.ts`, `BasketItem` in `BasketPage.ts`.
  - Locators are public readonly fields assigned in the constructor.
  - Locator rule: `testIdAttribute` is set to `id` in `playwright.config.ts`, so `getByTestId("x")` matches `id="x"`. Use `getByTestId` whenever the element has a stable id. Otherwise use role-based locators. Angular Material generates ids like `mat-select-0` or `mat-mdc-slide-toggle-0`; those aren't stable.
  - CSS is the last resort, only for elements with neither an id nor a role/name, and with a comment saying so. Examples: the basket's icon-only buttons (by Font Awesome `data-icon`), the basket badge (`.fa-layers-counter`) and the snack bar (`mat-snack-bar-container`).
  - Match products by the image's exact alt text, not by text: "Apple Juice" text also matches "Pineapple Juice".
  - Methods are user actions; assertions stay in the specs.
  - If a page isn't usable until data loads, every way onto it waits for that data (see `RegistrationPage.waitForSecurityQuestions`, used by its `goto()` and by `LoginPage.goToRegistration()`).
  - UI shared between pages goes in `src/components`.
- **API layer (`src/api`):** `JuiceShopApi` holds one client per resource, each extending `BaseApiClient`. Add new clients to it.
  - Raw methods return `APIResponse`, so tests can assert on status codes.
  - Parsed helpers like `create`/`createSession` are for setup and throw on any non-2xx response.
  - Auth comes from the request context's headers, not from the clients.
  - All API paths live in `endpoints.ts`.
- **Test data (`src/data`):** use `userFactory.ts` to make unique users rather than the PDF's fixed emails. Expected UI texts go in `messages.ts`, not in the config. Playwright trims and collapses whitespace when matching text, so don't copy the app's surrounding spaces.
- **Formatting:** Prettier (`.prettierrc.json`) enforces double quotes and the code style. `eslint-config-prettier` keeps ESLint out of formatting.
- **Path aliases** (`tsconfig.json`): `@config`, `@fixtures`, `@api/*`, `@pages/*`, `@components/*`, `@data/*`, `@utils/*`.
- **TypeScript version:** pinned to `~6.0` because typescript-eslint doesn't support TS 7 yet.
- **CI:** `.github/workflows/playwright.yml` runs on pushes and PRs to `main` and on manual dispatch.
  - Job `quality` runs typecheck, lint and `format:check`. Job `test` runs only if it passes.
  - `test` starts Juice Shop as a service container (`bkimminich/juice-shop:v20.2.0`) and polls it with curl, because the image has no tools for a Docker health check. It runs `npm test` on Chromium only.
  - The HTML report and `test-results/` are uploaded as artifacts. On CI the `github` reporter also annotates failures.
  - `main` is meant to be protected: changes go through PRs and need both checks to pass.

## Juice Shop notes

- **Cookies set by the `context` fixture** (`src/utils/browserSession.ts`): `welcomebanner_status` and `cookieconsent_status` pre-dismiss the two overlays, and `language=en` keeps UI texts in English.
- **Checking login:** open the account menu. The "Go to user profile" item shows the user's email. The "Your Basket" button also shows when logged out, so it proves nothing.
- **Browser session:** it consists of `localStorage.token`, a `token` cookie and `sessionStorage.bid`. `injectSession` sets all three and then reloads, because changing only the hash route doesn't make the app re-read them.
- **Login form:**
  - The inputs have no placeholder attribute. "Email" and "Password" are floating labels, and the `*` is added by CSS.
  - TC-UI-LOGIN-1 says the button is "not active" after the password is entered. That's a typo: the button becomes enabled.
- **Registration form:**
  - The security-question dropdown won't open until `/api/SecurityQuestions/` has responded. Clicking earlier just focuses it.
  - Its floating label sits on top of it and intercepts clicks, so it's opened by clicking the label.
  - The password-advice toggle is a `switch`, not a `button`.
  - `abc@abc` counts as a valid email. `abc`, `abc@` and `@abc.com` show "Email address is not valid."; an empty field shows "Please provide an email address."
- **Products page:**
  - While loading, it looks exactly like an empty list. Assert on the network response, not only on the absence of cards (see TC-UI-PROD-4).
  - 46 products are seeded. Search is case-insensitive, so "Apple" also finds "Pineapple Juice".
  - The page sizes depend on the window width: 15/30/45/60 at 1280px (`Desktop Chrome`), default 15. A touch-target overlay intercepts clicks on the items-per-page select, so it's opened with the keyboard.
  - The details dialog (opened by clicking a card) has only Reviews and Close; "Add to Basket" is on the card.
  - The message bar's "X" button only gets an accessible role about 150ms after the bar appears, and the bar closes itself after about 4s.
- **Basket:**
  - The badge shows the total quantity, not the number of rows. It starts at 0 and only loads with the page, so wait for `GET /rest/basket/<bid>` before asserting "0".
  - Adding a product that is already in the basket shows "Added another X to basket." instead of "Placed X into basket.".
- **API auth:** `POST /rest/user/login` returns `token` and `bid` (basket id). The basket endpoints need the `bid`.
- **Endpoint names:** Juice Shop pluralizes resource names naively. `/api/Addresss` and `/api/Deliverys` are correct, not typos.
- **Hardcoded values in the PDF:** basket `8` and payment/address `7` in TC-API-E2E-1, and TC-API-1 posts `aaa@aa.com` but expects `raj@aa.com`. Read IDs and emails from API responses.
- **TC-API-1** is API-only: skip its final "log in through the UI" steps.
- **Data persists:** registered users stay until Juice Shop restarts. A duplicate email returns 400 "email must be unique".
