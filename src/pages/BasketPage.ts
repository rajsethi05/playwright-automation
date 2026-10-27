import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class BasketPage extends BasePage {
  protected readonly path = "/#/basket";

  /** "Your Basket (<user email>)". */
  readonly heading: Locator;
  /** One row per product; the header row has no cells. */
  readonly items: Locator;
  readonly totalPrice: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: /^Your Basket/ });
    this.items = page.getByRole("row").filter({ has: page.getByRole("cell") });
    this.totalPrice = page.getByTestId("price");
    this.checkoutButton = page.getByTestId("checkoutButton");
  }

  /** Rows are matched on the image's exact alt text, so similar names don't collide. */
  item(name: string): BasketItem {
    return new BasketItem(
      this.items.filter({
        has: this.page.getByRole("img", { name, exact: true }),
      }),
    );
  }
}

/**
 * One product row in the basket. Its buttons are icon-only, with no id or accessible name,
 * so they are located by their Font Awesome icon.
 */
export class BasketItem {
  readonly decreaseButton: Locator;
  readonly increaseButton: Locator;
  readonly removeButton: Locator;
  /** The cell between the - and + buttons; its text is the quantity. */
  readonly quantity: Locator;

  constructor(readonly root: Locator) {
    this.decreaseButton = root.locator("button:has([data-icon=minus-square])");
    this.increaseButton = root.locator("button:has([data-icon=plus-square])");
    this.removeButton = root.locator("button:has([data-icon=trash-alt])");
    this.quantity = root.getByRole("cell").filter({ has: this.increaseButton });
  }

  async increase(): Promise<void> {
    await this.increaseButton.click();
  }

  async decrease(): Promise<void> {
    await this.decreaseButton.click();
  }

  async remove(): Promise<void> {
    await this.removeButton.click();
  }
}
