import type { APIRequestContext } from '@playwright/test';
import { AuthClient } from './clients/AuthClient';
import { UserClient } from './clients/UserClient';

/** Entry point to the API layer: one client per resource, all sharing one request context. */
export class JuiceShopApi {
  readonly auth: AuthClient;
  readonly users: UserClient;

  constructor(request: APIRequestContext) {
    this.auth = new AuthClient(request);
    this.users = new UserClient(request);
  }
}
