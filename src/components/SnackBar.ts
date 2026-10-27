import type { Locator, Page } from "@playwright/test";

/**
 * The message bar Juice Shop shows at the bottom of any page (e.g. after adding to the basket).
 * It has no role, and it closes itself after a few seconds.
 */
export class SnackBar {
  readonly message: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.message = page.locator("mat-snack-bar-container");
    this.closeButton = this.message.getByRole("button", { name: "X" });
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }
}
