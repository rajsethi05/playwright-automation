import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class RegistrationPage extends BasePage {
  protected readonly path = "/#/register";
  readonly email: Locator;
  readonly pwd: Locator;
  readonly repeatPwd: Locator;
  readonly securityDropdown: Locator;
  readonly securityQuestion: (name: string) => Locator;
  readonly securityAnswer: Locator;
  readonly registerButton: Locator;
  readonly registerationConfirmMsg: Locator;

  constructor(page: Page) {
    super(page);
    this.email = page.getByTestId("emailControl");
    this.pwd = page.getByTestId("passwordControl");
    this.repeatPwd = page.getByTestId("repeatPasswordControl");
    this.securityDropdown = page.getByText("Security Question");
    this.securityQuestion = (name: string) => page.getByRole("option", {name:name, exact: true });
    this.securityAnswer = page.getByTestId("securityAnswerControl");
    this.registerButton = page.getByTestId("registerButton");
    this.registerationConfirmMsg = page.getByText("Registration Completed");
  }
}
