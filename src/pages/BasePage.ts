import type { Page } from "@playwright/test";
import { NavBar } from "@components/NavBar";
import { SnackBar } from "@components/SnackBar";

export abstract class BasePage {
  /** Route relative to config.baseUrl. Juice Shop uses hash routing, e.g. '/#/login'. */
  protected abstract readonly path: string;
  readonly navBar: NavBar;
  readonly snackBar: SnackBar;

  constructor(protected readonly page: Page) {
    this.navBar = new NavBar(page);
    this.snackBar = new SnackBar(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }
}
