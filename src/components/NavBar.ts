import type { Locator, Page } from "@playwright/test";

/** Top toolbar, present on every page. */
export class NavBar {
  readonly accountButton: Locator;
  /** Shows the logged-in user's email; only exists while logged in. */
  readonly userProfileMenuItem: Locator;
  readonly basketButton: Locator;
  /** Total quantity of items in the basket. The badge has no role, hence the CSS. */
  readonly basketCount: Locator;
  /** Collapsed search icon; clicking it reveals the input. */
  readonly searchButton: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.accountButton = page.getByTestId("navbarAccount");
    this.userProfileMenuItem = page.getByRole("menuitem", {
      name: "Go to user profile",
    });
    this.basketButton = page.getByRole("button", {
      name: "Show the shopping cart",
    });
    this.basketCount = this.basketButton.locator(".fa-layers-counter");
    this.searchButton = page.getByTestId("searchQuery");
    this.searchInput = this.searchButton.getByRole("textbox");
  }

  async openAccountMenu(): Promise<void> {
    await this.accountButton.click();
  }

  async openBasket(): Promise<void> {
    await this.basketButton.click();
  }

  async search(term: string): Promise<void> {
    await this.searchButton.click();
    await this.searchInput.fill(term);
    await this.searchInput.press("Enter");
  }
}
