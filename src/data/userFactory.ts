import { randomUUID } from 'node:crypto';
import type { UserDetails } from '@api/types';
import { config } from '@config';

/**
 * Builds a user with a unique email. Juice Shop keeps registered users until it restarts,
 * so fixed emails would collide on the second run.
 */
export function buildUser(overrides: Partial<UserDetails> = {}): UserDetails {
  const { emailDomain, password, securityQuestion, securityAnswer } = config.testUser;
  return {
    email: `user_${randomUUID().slice(0, 8)}@${emailDomain}`,
    password,
    securityQuestion,
    securityAnswer,
    ...overrides,
  };
}
