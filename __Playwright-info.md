# Useful information for using playwright

## Usage

- When unsure of what Role to use for any element, open codegen and hover over element and check:
  `npx playwright codegen http://127.0.0.1:3000/#/register`

- Always use tobe<> assertions, because they retry or wait for the element. Otherwise the test will fail.
  for example:
  `await expect(registrationPage.email.isVisible()).toTruthy();` might fail if element is not visible on time. but
  `await expect(registrationPage.email).toBeVisible();` passes because it retries.
  doc: https://playwright.dev/docs/test-assertions#auto-retrying-assertions

## Commands

- Create report
  `npx playwright show-report`

- Debug specific test file
  `npx playwright test example.spec.ts --debug`

- Debug all tests
  `npx playwright test --debug`

- Debug tests in ui mode
  `npx playwright test --ui`

- Run last failed tests
  `npx playwright test --last-failed`

- Run tests in headed mode
  `npx playwright test --headed`

- start juice shop docker
  `docker run --rm -p 127.0.0.1:3000:3000 bkimminich/juice-shop`
