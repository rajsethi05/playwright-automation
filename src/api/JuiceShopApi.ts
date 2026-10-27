import type { APIRequestContext } from "@playwright/test";
import { AuthClient } from "./clients/AuthClient";
import { ProductClient } from "./clients/ProductClient";
import { UserClient } from "./clients/UserClient";

/** Entry point to the API layer: one client per resource, all sharing one request context. */
export class JuiceShopApi {
  readonly auth: AuthClient;
  readonly products: ProductClient;
  readonly users: UserClient;

  constructor(request: APIRequestContext) {
    this.auth = new AuthClient(request);
    this.products = new ProductClient(request);
    this.users = new UserClient(request);
  }
}
