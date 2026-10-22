import type { Locator, Page } from "@playwright/test";
import type { Credentials } from "@api/types";
import { BasePage } from "./BasePage";
import { RegistrationPage } from "./RegistrationPage";

export class LoginPage extends BasePage {
  protected readonly path = "/#/login";

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  /** Floating labels. The trailing "*" is a CSS required marker, so it isn't part of the text. */
  readonly emailLabel: Locator;
  readonly passwordLabel: Locator;
  readonly loginButton: Locator;
  readonly newUserLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByTestId("email");
    this.passwordInput = page.getByTestId("password");
    this.emailLabel = page.locator("label[for=email]");
    this.passwordLabel = page.locator("label[for=password]");
    this.loginButton = page.getByTestId("loginButton");
    this.newUserLink = page.getByTestId("newCustomerLink");
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }

  async login({ email, password }: Credentials): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  /** Follows "Not yet a customer?" and waits until the registration form is usable. */
  async goToRegistration(): Promise<void> {
    const questionsLoaded = new RegistrationPage(
      this.page,
    ).waitForSecurityQuestions();
    await this.newUserLink.click();
    await questionsLoaded;
  }
}
