import { registrationMessages } from "@data/messages";
import { buildUser } from "@data/userFactory";
import { expect, test } from "@fixtures";

test.describe("Registration Tests", () => {
  test("TC-UI-REG-1: Verify User Registration works successfully", async ({
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

  test("TC-UI-REG-2: Verify Registration fields validation", async ({
    registrationPage,
  }) => {
    await registrationPage.goto();

    await registrationPage.fillEmail("abc");
    await registrationPage.emailInput.blur();
    await expect(registrationPage.emailError).toHaveText(
      registrationMessages.invalidEmail,
    );
    await registrationPage.fillEmail("abc@abc.com");
    await expect(registrationPage.emailError).toBeHidden();

    await registrationPage.fillPassword("123");
    await registrationPage.passwordInput.blur();
    await expect(registrationPage.passwordError).toHaveText(
      registrationMessages.invalidPassword,
    );
    await registrationPage.fillPassword("qwerty");
    await expect(registrationPage.passwordError).toBeHidden();

    await registrationPage.fillRepeatPassword("qwe");
    await registrationPage.repeatPasswordInput.blur();
    await expect(registrationPage.repeatPasswordError).toHaveText(
      registrationMessages.passwordsDoNotMatch,
    );

    await expect(registrationPage.passwordAdvice).toBeHidden();
    await registrationPage.togglePasswordAdvice();
    await expect(registrationPage.passwordAdvice).toBeVisible();
  });
});
