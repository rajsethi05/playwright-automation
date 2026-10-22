import type { Page } from "@playwright/test";
import { NavBar } from "@components/NavBar";

export abstract class BasePage {
  /** Route relative to config.baseUrl. Juice Shop uses hash routing, e.g. '/#/login'. */
  protected abstract readonly path: string;
  readonly navBar: NavBar;

  constructor(protected readonly page: Page) {
    this.navBar = new NavBar(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }
}
