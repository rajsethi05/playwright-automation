# Playwright Automation – OWASP Juice Shop

[![Playwright Tests](https://github.com/rajsethi05/playwright-automation/actions/workflows/playwright.yml/badge.svg)](https://github.com/rajsethi05/playwright-automation/actions/workflows/playwright.yml)

> 🚧 **Work in progress.** The framework is in place and test cases are being added incrementally. Expect changes to structure and coverage.

A [Playwright Test](https://playwright.dev) (TypeScript) framework for [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/) v20.2.0. It covers UI, API and end-to-end tests based on the test cases in `TestCases - JuiceShop.pdf`. Test titles are prefixed with the PDF id, e.g. `TC-UI-REG-2: …`.

## Prerequisites

- Node.js (LTS)
- Juice Shop v20.2.0 running at `http://127.0.0.1:3000` (it is not started by the tests):

```bash
docker run -p 3000:3000 bkimminich/juice-shop:v20.2.0
```

## Getting started

```bash
npm ci
npx playwright install --with-deps
```

## Running tests

```bash
npm test                                  # everything
npm run test:ui                           # UI tests
npm run test:api                          # API tests
npm run test:e2e-ui                       # end-to-end UI tests
npm run test:e2e-api                      # end-to-end API tests
npx playwright test -g "TC-UI-PROD-4:"    # one test by id
npx playwright test --headed              # or --ui / --debug
BROWSERS=chromium,firefox,webkit npm test # multiple browsers
npm run report                            # open the HTML report
```

When running a single test by id, keep the trailing colon: `"TC-UI-REG-1"` would also match `TC-UI-REG-10`.

## Configuration

All tunable values (URLs, browsers, timeouts, retries, workers, trace/screenshot/video, test user defaults) live in `config/config.ts`. Each has a default and can be overridden by an environment variable or a `.env` file. Copy `.env.example` to `.env` and uncomment what you need.

## Project structure

```
config/              Central configuration (defaults + env overrides)
src/
  api/               API clients (one per resource) and endpoint paths
  components/        UI components shared between pages (e.g. NavBar)
  data/              Test data factories and expected UI messages
  fixtures/          Custom Playwright fixtures; specs import test/expect from here
  pages/             Page objects
  utils/             Helpers (e.g. browser session injection)
tests/
  ui-tests/          UI tests (setup may use the API)
  api-tests/         API and API schema tests
  e2e-ui-tests/      End-to-end UI flows
  e2e-api-tests/     End-to-end API flows
```

## Design at a glance

- **Page Object Model:** pages extend `BasePage`. Locators are readonly fields; methods are user actions; assertions stay in the specs.
- **Locators:** `getByTestId` maps to the element `id` attribute, used whenever a stable id exists, with role-based locators otherwise.
- **Fixtures:** ready-made state such as `newUser` (registered via API), `session`, `authedApi` and `loggedInPage` (logged in without the UI form), plus one fixture per page object.
- **API layer:** `JuiceShopApi` groups the resource clients. Raw methods return the response for status assertions; helper methods are used for test setup.
- **Test data:** unique users are generated per test via `userFactory`, so tests don't depend on fixed accounts.
- **Projects:** API tests run once without a browser; UI tests run once per configured browser (Chromium by default).

## Code quality

```bash
npm run typecheck     # TypeScript
npm run lint          # ESLint (lint:fix to autofix)
npm run format        # Prettier (format:check to verify only)
```

## CI

GitHub Actions (`.github/workflows/playwright.yml`) runs on every push and pull request to `main`, and can be started manually:

1. **quality:** typecheck, lint and formatting check.
2. **test:** starts Juice Shop v20.2.0 as a service container and runs the full suite on Chromium.

The HTML report and test results (traces, screenshots) are attached to each run as artifacts. To view the report, download the `playwright-report` artifact, unzip it and run `npx playwright show-report <folder>`.

## Progress

- ✅ Framework foundation: config, fixtures, page objects, API layer, test data, linting and formatting
- ✅ First UI and API test cases (login, registration, products)
- ✅ CI pipeline (GitHub Actions)
- ⏳ Remaining test cases from the PDF
- ⏳ End-to-end UI and API suites
