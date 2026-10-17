import { buildUser } from "@data/userFactory";
import { expect, test } from "@fixtures";

test.describe("Login Tests", () => {
  test("TC1: Verify Registered User can Login through the login form", async ({
    loginPage,
    productsPage,
    newUser,
  }) => {
    await loginPage.goto();

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    // The test plan's 'Email*' / 'Password*' placeholders are floating labels plus a CSS
    // required marker, so check the label text and the required state.
    await expect(loginPage.emailLabel).toHaveText("Email");
    await expect(loginPage.passwordLabel).toHaveText("Password");
    await expect(loginPage.emailInput).toHaveAttribute("aria-required", "true");
    await expect(loginPage.passwordInput).toHaveAttribute(
      "aria-required",
      "true"
    );
    await expect(loginPage.loginButton).toBeDisabled();

    await loginPage.fillEmail(newUser.email);
    await expect(loginPage.loginButton).toBeDisabled();

    await loginPage.fillPassword(newUser.password);
    await expect(loginPage.loginButton).toBeEnabled();

    await loginPage.submit();
    await expect(productsPage.heading).toBeVisible();
    await productsPage.navBar.openAccountMenu();
    await expect(productsPage.navBar.userProfileMenuItem).toContainText(
      newUser.email
    );
  });

  test("TC2: Verify User Registration works successfully", async ({
    page,
    loginPage,
    registrationPage,
  }) => {
    const user = buildUser();
    await loginPage.goto();
    await loginPage.newUserLink.click();
    await expect(registrationPage.email).toBeVisible();
    await expect(registrationPage.registerButton).toBeDisabled();

    await registrationPage.email.fill(user.email);
    await registrationPage.pwd.fill(user.password);
    await registrationPage.repeatPwd.fill(user.password);
    const question = registrationPage.securityQuestion(user.securityQuestion.question);
    // The first click can land before the select is ready, so retry until the menu opens.
    await expect(async () => {
      await registrationPage.securityDropdown.click();
      await expect(question).toBeVisible({ timeout: 2000 });
    }).toPass();
    await question.click();
    await registrationPage.securityAnswer.fill(user.securityAnswer);
    await expect(registrationPage.registerButton.isEnabled()).toBeTruthy();
    await registrationPage.registerButton.click();
    await expect(registrationPage.registerationConfirmMsg).toBeVisible();
    await expect(page).toHaveURL('/#/login');
  });
});
