# Useful information for using playwright

## Usage
- When unsure of what Role to use for any element, open codegen and hover over element and check:
`npx playwright codegen http://127.0.0.1:3000/#/register`

- Always use tobe<> assertions, because they retry or wait for the element. Otherwise the test will fail.
for example:
`await expect(registrationPage.email.isVisible()).toTruthy();` might fail if element is not visible on time. but
`await expect(registrationPage.email).toBeVisible();` passes because it retries.
doc: https://playwright.dev/docs/test-assertions#auto-retrying-assertions