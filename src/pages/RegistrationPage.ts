import type { Locator, Page, Response } from "@playwright/test";
import { endpoints } from "@api/endpoints";
import type { UserDetails } from "@api/types";
import { BasePage } from "./BasePage";

export class RegistrationPage extends BasePage {
  protected readonly path = "/#/register";

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly repeatPasswordInput: Locator;
  /** Shows the selected question once one is chosen. */
  readonly securityQuestionDropdown: Locator;
  readonly securityAnswerInput: Locator;
  readonly registerButton: Locator;
  readonly confirmationMessage: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly repeatPasswordError: Locator;
  readonly passwordAdviceToggle: Locator;
  readonly passwordAdvice: Locator;
  /** The dropdown's floating label sits on top of it and intercepts clicks, so open it via the label. */
  private readonly securityQuestionLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByTestId("emailControl");
    this.passwordInput = page.getByTestId("passwordControl");
    this.repeatPasswordInput = page.getByTestId("repeatPasswordControl");
    this.securityQuestionDropdown = page.getByRole("combobox", {
      name: "Selection list for the security question",
    });
    this.securityQuestionLabel = page.getByText("Security Question", {
      exact: true,
    });
    this.securityAnswerInput = page.getByTestId("securityAnswerControl");
    this.registerButton = page.getByTestId("registerButton");
    this.confirmationMessage = page.getByText("Registration Completed");
    this.emailError = this.errorFor(this.emailInput);
    this.passwordError = this.errorFor(this.passwordInput);
    this.repeatPasswordError = this.errorFor(this.repeatPasswordInput);
    this.passwordAdviceToggle = page.getByRole("switch", {
      name: "Show password advice",
    });
    this.passwordAdvice = page.locator("app-password-strength-info");
  }

  /**
   * Resolves once the security questions have loaded. The dropdown refuses to open until
   * then, so every way onto this page waits for it. Call before the navigation starts.
   */
  waitForSecurityQuestions(): Promise<Response> {
    return this.page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === endpoints.securityQuestions,
    );
  }

  async goto(): Promise<void> {
    const questionsLoaded = this.waitForSecurityQuestions();
    await super.goto();
    await questionsLoaded;
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async fillRepeatPassword(password: string): Promise<void> {
    await this.repeatPasswordInput.fill(password);
  }

  async selectSecurityQuestion(question: string): Promise<void> {
    await this.securityQuestionLabel.click();
    await this.page
      .getByRole("option", { name: question, exact: true })
      .click();
  }

  async fillSecurityAnswer(answer: string): Promise<void> {
    await this.securityAnswerInput.fill(answer);
  }

  /** Fills every field without submitting. */
  async fillForm(user: UserDetails): Promise<void> {
    await this.fillEmail(user.email);
    await this.fillPassword(user.password);
    await this.fillRepeatPassword(user.password);
    await this.selectSecurityQuestion(user.securityQuestion.question);
    await this.fillSecurityAnswer(user.securityAnswer);
  }

  async submit(): Promise<void> {
    await this.registerButton.click();
  }

  async register(user: UserDetails): Promise<void> {
    await this.fillForm(user);
    await this.submit();
  }

  async togglePasswordAdvice(): Promise<void> {
    await this.passwordAdviceToggle.click();
  }

  private errorFor(input: Locator): Locator {
    return this.page
      .locator("mat-form-field")
      .filter({ has: input })
      .locator("mat-error");
  }
}
