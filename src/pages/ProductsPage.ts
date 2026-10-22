import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/** Product listing; the app lands here after login. */
export class ProductsPage extends BasePage {
  protected readonly path = "/#/search";

  readonly heading: Locator;
  readonly productCards: Locator;

  constructor(page: Page) {
    super(page);
    const main = page.getByRole("main");
    this.heading = main.getByText("All Products", { exact: true });
    this.productCards = main.getByRole("article");
  }
}
