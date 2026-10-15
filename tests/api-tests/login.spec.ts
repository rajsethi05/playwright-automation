import type { LoginResponse } from '@api/types';
import { expect, test } from '@fixtures';

test.describe('Login API', () => {
  test('TC12: registered user can log in via the API', async ({ api, newUser }) => {
    const response = await api.auth.login(newUser);

    expect(response.status()).toBe(200);
    const { authentication } = (await response.json()) as LoginResponse;
    expect(authentication.umail).toBe(newUser.email);
    expect(authentication.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/); // JWT
    expect(authentication.bid).toEqual(expect.any(Number));
  });
});
