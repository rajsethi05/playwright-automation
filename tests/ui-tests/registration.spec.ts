import { buildUser } from "@data/userFactory";
import { expect, test } from "@fixtures";

test.describe("Registration Tests", () => {
  test("TC1: Verify User Registration works successfully", async ({
    page,
    loginPage,
    registrationPage,
  }) => {
    const user = buildUser();
    await loginPage.goto();
    await loginPage.goToRegistration();
    await expect(registrationPage.emailInput).toBeVisible();
    await expect(registrationPage.registerButton).toBeDisabled();

    await registrationPage.fillForm(user);
    await expect(registrationPage.securityQuestionDropdown).toContainText(
      user.securityQuestion.question,
    );
    await expect(registrationPage.registerButton).toBeEnabled();

    await registrationPage.submit();
    await expect(registrationPage.confirmationMessage).toBeVisible();
    await expect(page).toHaveURL("/#/login");
  });

  test("TC2: Verify Registration fields validation", async ({
    page,
    loginPage,
    registrationPage,
  }) => {
    await registrationPage.goto();
  });
});
