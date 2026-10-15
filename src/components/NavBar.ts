import type { Locator, Page } from '@playwright/test';

/** Top toolbar, present on every page. */
export class NavBar {
  readonly accountButton: Locator;
  /** Shows the logged-in user's email; only exists while logged in. */
  readonly userProfileMenuItem: Locator;

  constructor(page: Page) {
    this.accountButton = page.getByRole('button', { name: 'Show/hide account menu' });
    this.userProfileMenuItem = page.getByRole('menuitem', { name: 'Go to user profile' });
  }

  async openAccountMenu(): Promise<void> {
    await this.accountButton.click();
  }
}
