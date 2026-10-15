import type { Locator, Page } from '@playwright/test';
import type { Credentials } from '@api/types';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  protected readonly path = '/#/login';

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  /** Floating labels. The trailing '*' is a CSS required marker, so it isn't part of the text. */
  readonly emailLabel: Locator;
  readonly passwordLabel: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByRole('textbox', { name: 'Text field for the login email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Text field for the login password' });
    this.emailLabel = page.locator('label[for="email"]');
    this.passwordLabel = page.locator('label[for="password"]');
    // exact: 'Login with Google' would also match.
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
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
}
