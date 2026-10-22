# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Instructions

- When asked to implement anything, first make a plan and provide the details to the user. Proceed with code change only after user approval.
- Use the best practices for all the implementations.
- If anything is unclear or contradictory, ask first, do not take decisions.
- Feel free to raise concerns or disagree if required.
- Feel free to recommend me best plan possible.
- Use double quote in the entire project instead of single quote.

## Project

A Playwright Test (TypeScript) page object framework for OWASP Juice Shop (v20.2.0) running at `http://127.0.0.1:3000`. Juice Shop must be started separately; there is no `webServer` block. The test cases to implement (TC1–TC19) are in `TestCases - JuiceShop.pdf` at the repo root.

## Commands

```bash
npm ci && npx playwright install --with-deps
npm test                                  # everything
npm run test:ui                           # or test:api / test:e2e
npx playwright test -g "TC8:"             # one test by id; keep the colon ("TC1" also matches TC10–TC19)
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
  - `api` runs `tests/api-tests` once, with no browser.
  - Each browser in `config.browsers` (default: chromium only) gets its own project that runs `tests/ui-tests` and `tests/e2e-tests`.
- **Where tests go:**
  - Any test that touches the UI goes in `tests/ui-tests`, even if its setup or some of its steps use the API.
  - Pure API tests go in `tests/api-tests`.
  - Which tests belong in `tests/e2e-tests` hasn't been decided yet, so ask.
  - Prefix test titles with the PDF id, e.g. `'TC8: …'`.
- **Fixtures:** specs import `test`/`expect` from `@fixtures` (`src/fixtures/index.ts`), never from `@playwright/test`.
  - `api`: unauthenticated API clients.
  - `newUser`: a unique user registered via the API.
  - `session`: `newUser` logged in via the API (token and basket id).
  - `authedApi`: API clients authenticated as `newUser`.
  - `loggedInPage`: the browser logged in as `newUser` without using the login form.
  - Each page object also has a fixture. Register new page objects there.
- **Page objects (`src/pages`):** they extend `BasePage`, which provides the hash-route `path`, `goto()` and `navBar`.
  - Locators are public readonly fields assigned in the constructor.
  - Locator rule: `testIdAttribute` is set to `id` in `playwright.config.ts`, so `getByTestId("x")` matches `id="x"`. Use `getByTestId` whenever the element has a stable id. Otherwise use role-based locators. Angular Material generates ids like `mat-select-0` or `mat-mdc-slide-toggle-0`; those aren't stable.
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
- **CI:** the working tree comments out `.github/workflows/playwright.yml` (uncommitted), so CI doesn't run.

## Juice Shop notes

- **Cookies set by the `context` fixture** (`src/utils/browserSession.ts`): `welcomebanner_status` and `cookieconsent_status` pre-dismiss the two overlays, and `language=en` keeps UI texts in English.
- **Checking login:** open the account menu. The "Go to user profile" item shows the user's email. The "Your Basket" button also shows when logged out, so it proves nothing.
- **Browser session:** it consists of `localStorage.token`, a `token` cookie and `sessionStorage.bid`. `injectSession` sets all three and then reloads, because changing only the hash route doesn't make the app re-read them.
- **Login form:**
  - The inputs have no placeholder attribute. "Email" and "Password" are floating labels, and the `*` is added by CSS.
  - The PDF's TC1 says the button is "not active" after the password is entered. That's a typo: the button becomes enabled.
- **Registration form:**
  - The security-question dropdown won't open until `/api/SecurityQuestions/` has responded. Clicking earlier just focuses it.
  - Its floating label sits on top of it and intercepts clicks, so it's opened by clicking the label.
  - The password-advice toggle is a `switch`, not a `button`.
  - `abc@abc` counts as a valid email. `abc`, `abc@` and `@abc.com` show "Email address is not valid."; an empty field shows "Please provide an email address."
- **Products page:** while loading, it looks exactly like an empty list. Assert on the network response, not only on the absence of cards (see TC8).
- **API auth:** `POST /rest/user/login` returns `token` and `bid` (basket id). The basket endpoints need the `bid`.
- **Endpoint names:** Juice Shop pluralizes resource names naively. `/api/Addresss` and `/api/Deliverys` are correct, not typos.
- **Hardcoded values in the PDF:** basket `8` and payment/address `7` in TC19, and TC11 posts `aaa@aa.com` but expects `raj@aa.com`. Read IDs and emails from API responses.
- **Data persists:** registered users stay until Juice Shop restarts. A duplicate email returns 400 "email must be unique".
