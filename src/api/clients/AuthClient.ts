import type { APIResponse } from '@playwright/test';
import { endpoints } from '../endpoints';
import type { Credentials, LoginResponse, Session } from '../types';
import { BaseApiClient } from './BaseApiClient';

export class AuthClient extends BaseApiClient {
  login({ email, password }: Credentials): Promise<APIResponse> {
    return this.request.post(endpoints.login, { data: { email, password } });
  }

  async createSession(credentials: Credentials): Promise<Session> {
    const { authentication } = await this.parse<LoginResponse>(await this.login(credentials));
    return { token: authentication.token, basketId: authentication.bid, email: authentication.umail };
  }
}
