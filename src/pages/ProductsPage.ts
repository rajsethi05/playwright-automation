import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/** Product listing; the app lands here after login. */
export class ProductsPage extends BasePage {
  protected readonly path = "/#/search";

  readonly heading: Locator;
  readonly productCards: Locator;
  readonly itemsPerPageSelect: Locator;
  readonly nextPageButton: Locator;
  readonly detailsDialog: ProductDetailsDialog;

  constructor(page: Page) {
    super(page);
    const main = page.getByRole("main");
    this.heading = main.getByText("All Products", { exact: true });
    this.productCards = main.getByRole("article");
    this.itemsPerPageSelect = page.getByRole("combobox", {
      name: "Items per page:",
    });
    this.nextPageButton = page.getByRole("button", { name: "Next page" });
    this.detailsDialog = new ProductDetailsDialog(page);
  }

  /** Cards are matched on the image's exact alt text: "Apple Juice" text would also match "Pineapple Juice". */
  productCard(name: string): ProductCard {
    return new ProductCard(
      this.productCards.filter({
        has: this.page.getByRole("img", { name, exact: true }),
      }),
      name,
    );
  }

  /**
   * The select's touch target overlay intercepts clicks, so it is opened with the keyboard.
   * The available sizes depend on the window width (15/30/45/60 at 1280px).
   */
  async setItemsPerPage(count: number): Promise<void> {
    await this.itemsPerPageSelect.press("Enter");
    await this.page
      .getByRole("option", { name: String(count), exact: true })
      .click();
  }

  async goToNextPage(): Promise<void> {
    await this.nextPageButton.click();
  }
}

/** One product tile on the products page. */
export class ProductCard {
  readonly image: Locator;
  readonly title: Locator;
  /** The image and title area; clicking it opens the details dialog. */
  readonly detailsButton: Locator;
  readonly addToBasketButton: Locator;

  constructor(
    readonly root: Locator,
    name: string,
  ) {
    this.image = root.getByRole("img", { name, exact: true });
    this.title = root.getByText(name, { exact: true });
    this.detailsButton = root.getByRole("button", {
      name: "Click for more information about the product",
    });
    this.addToBasketButton = root.getByRole("button", {
      name: "Add to Basket",
    });
  }

  async openDetails(): Promise<void> {
    await this.detailsButton.click();
  }

  async addToBasket(): Promise<void> {
    await this.addToBasketButton.click();
  }
}

/** Opened by clicking a product card. It has no "Add to Basket" button. */
export class ProductDetailsDialog {
  readonly root: Locator;
  readonly heading: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.root = page.getByRole("dialog");
    this.heading = this.root.getByRole("heading", { level: 1 });
    this.closeButton = this.root.getByRole("button", { name: "Close Dialog" });
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }
}
