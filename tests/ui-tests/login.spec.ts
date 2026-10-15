import { expect, test } from '@fixtures';

test.describe('Login', () => {
  test('TC1: registered user can log in through the login form', async ({ loginPage, productsPage, newUser }) => {
    await loginPage.goto();

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    // The test plan's 'Email*' / 'Password*' placeholders are floating labels plus a CSS
    // required marker, so check the label text and the required state.
    await expect(loginPage.emailLabel).toHaveText('Email');
    await expect(loginPage.passwordLabel).toHaveText('Password');
    await expect(loginPage.emailInput).toHaveAttribute('aria-required', 'true');
    await expect(loginPage.passwordInput).toHaveAttribute('aria-required', 'true');
    await expect(loginPage.loginButton).toBeDisabled();

    await loginPage.fillEmail(newUser.email);
    await expect(loginPage.loginButton).toBeDisabled();

    await loginPage.fillPassword(newUser.password);
    await expect(loginPage.loginButton).toBeEnabled();

    await loginPage.submit();
    await expect(productsPage.heading).toBeVisible();
    await productsPage.navBar.openAccountMenu();
    await expect(productsPage.navBar.userProfileMenuItem).toContainText(newUser.email);
  });
});
