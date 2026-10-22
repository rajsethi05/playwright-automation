import { endpoints } from "@api/endpoints";
import type { ApiSuccess, Product } from "@api/types";
import { expect, test } from "@fixtures";

test.describe("Products page", () => {
  test("TC8: shows no products when the product API returns an empty list", async ({
    page,
    loginPage,
    productsPage,
    newUser,
  }) => {
    const isProductSearch = (url: URL) =>
      url.pathname === endpoints.productSearch;
    const noProducts: ApiSuccess<Product[]> = { status: "success", data: [] };
    await page.route(isProductSearch, (route) =>
      route.fulfill({ json: noProducts }),
    );

    await loginPage.goto();
    const productsResponse = page.waitForResponse((response) =>
      isProductSearch(new URL(response.url())),
    );
    await loginPage.login(newUser);
    // While loading, the page looks exactly like an empty list, so the card count alone
    // would also pass against real data. Confirm the app really received the mock.
    expect(await (await productsResponse).json()).toEqual(noProducts);

    await expect(productsPage.heading).toBeVisible();
    await expect(productsPage.productCards).toHaveCount(0);
  });
});
