import { endpoints } from "@api/endpoints";
import type { ApiSuccess, Product } from "@api/types";
import { basketMessages, formatPrice } from "@data/messages";
import { productNames } from "@data/products";
import { expect, test } from "@fixtures";
import { BasketPage } from "@pages/BasketPage";
import { ProductsPage } from "@pages/ProductsPage";

test.describe("Products page", () => {
  test("TC-UI-PROD-1: product cards, details dialog, add to basket, pagination and search", async ({
    api,
    loggedInPage,
  }) => {
    const products = await api.products.list();
    const greenSmoothie = await api.products.findByName(
      productNames.greenSmoothie,
    );
    const productsPage = new ProductsPage(loggedInPage);
    await productsPage.goto();
    const card = productsPage.productCard(greenSmoothie.name);

    await test.step("card shows image, title, price and Add to Basket", async () => {
      await expect(card.image).toBeVisible();
      await expect(card.title).toBeVisible();
      await expect(card.root).toContainText(formatPrice(greenSmoothie.price));
      await expect(card.addToBasketButton).toBeVisible();
    });

    await test.step("clicking the card opens its details dialog", async () => {
      await card.openDetails();
      await expect(productsPage.detailsDialog.heading).toHaveText(
        greenSmoothie.name,
      );
      await productsPage.detailsDialog.close();
      await expect(productsPage.detailsDialog.root).toBeHidden();
    });

    await test.step("Add to Basket confirms in the message bar", async () => {
      await card.addToBasket();
      await expect(productsPage.snackBar.message).toContainText(
        basketMessages.placed(greenSmoothie.name),
      );
      // Closed so it can't cover the paginator below.
      await productsPage.snackBar.close();
    });

    await test.step("pagination shows 15, then 30, then the rest", async () => {
      await expect(productsPage.itemsPerPageSelect).toHaveText("15");
      await expect(productsPage.productCards).toHaveCount(15);

      await productsPage.setItemsPerPage(30);
      await expect(productsPage.productCards).toHaveCount(30);

      await productsPage.goToNextPage();
      await expect(productsPage.productCards).toHaveCount(products.length - 30);
    });

    await test.step("search shows only matching products", async () => {
      const term = "Apple";
      const matching = products.filter(({ name }) =>
        name.toLowerCase().includes(term.toLowerCase()),
      );
      expect(matching).not.toHaveLength(0);

      await productsPage.navBar.search(term);
      await expect(productsPage.productCards).toHaveCount(matching.length);
      for (const { name } of matching) {
        await expect(productsPage.productCard(name).root).toBeVisible();
      }
    });
  });

  test("TC-UI-PROD-2: basket badge counts items and the basket page manages them", async ({
    loggedInPage,
  }) => {
    const { appleJuice, bananaJuice } = productNames;
    const productsPage = new ProductsPage(loggedInPage);
    const basketPage = new BasketPage(loggedInPage);
    const { basketCount } = productsPage.navBar;
    await productsPage.goto();

    await test.step("badge counts every item added", async () => {
      await expect(basketCount).toHaveText("0");

      await productsPage.productCard(appleJuice).addToBasket();
      await expect(basketCount).toHaveText("1");

      await productsPage.productCard(bananaJuice).addToBasket();
      await expect(basketCount).toHaveText("2");

      await productsPage.productCard(appleJuice).addToBasket();
      await expect(basketCount).toHaveText("3");
      await expect(productsPage.snackBar.message).toContainText(
        basketMessages.addedAnother(appleJuice),
      );
    });

    const apple = basketPage.item(appleJuice);
    const banana = basketPage.item(bananaJuice);

    await test.step("basket lists both products with their quantities", async () => {
      await productsPage.navBar.openBasket();
      await expect(basketPage.heading).toContainText("Your Basket");
      await expect(basketPage.items).toHaveCount(2);
      await expect(apple.quantity).toHaveText("2");
      await expect(banana.quantity).toHaveText("1");
    });

    await test.step("+ and - change the quantity by one", async () => {
      await apple.increase();
      await expect(apple.quantity).toHaveText("3");
      await apple.decrease();
      await expect(apple.quantity).toHaveText("2");
    });

    await test.step("delete removes a product", async () => {
      await expect(apple.removeButton).toBeVisible();
      await expect(banana.removeButton).toBeVisible();

      await banana.remove();
      await expect(banana.root).toBeHidden();
      await expect(basketPage.items).toHaveCount(1);
    });

    await test.step("checkout and total price are available", async () => {
      await expect(basketPage.checkoutButton).toBeVisible();
      await expect(basketPage.checkoutButton).toBeEnabled();
      await expect(basketPage.totalPrice).toBeVisible();
    });
  });

  test("TC-UI-PROD-3: users logged in at the same time have separate baskets", async ({
    loginAsNewUser,
  }) => {
    const user1 = await loginAsNewUser();
    const user2 = await loginAsNewUser();
    const user1Products = new ProductsPage(user1.page);
    const user2Products = new ProductsPage(user2.page);
    await user1Products.goto();
    await user2Products.goto();

    await user1Products.productCard(productNames.appleJuice).addToBasket();
    await expect(user1Products.navBar.basketCount).toHaveText("1");

    // The badge starts at 0 and only loads with the page, so reload user 2 and wait for their
    // basket; otherwise "0" would pass without proving anything.
    const user2BasketLoaded = user2.page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname ===
        endpoints.basket(user2.session.basketId),
    );
    await user2.page.reload();
    await user2BasketLoaded;
    await expect(user2Products.navBar.basketCount).toHaveText("0");
  });

  test("TC-UI-PROD-4: shows no products when the product API returns an empty list", async ({
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
