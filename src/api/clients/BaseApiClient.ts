import type { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Base for all API clients. A client wraps one APIRequestContext; authentication, if any,
 * comes from that context's headers, so the same client class serves every user.
 *
 * Methods that return `APIResponse` let tests assert status codes, including failures.
 * Methods that return parsed data are for setup and throw on any non-2xx response.
 */
export abstract class BaseApiClient {
  constructor(protected readonly request: APIRequestContext) {}

  protected async parse<T>(response: APIResponse): Promise<T> {
    if (!response.ok()) {
      throw new Error(`Expected 2xx from ${response.url()}, got ${response.status()}: ${await response.text()}`);
    }
    return (await response.json()) as T;
  }
}
