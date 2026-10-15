import dotenv from 'dotenv';
import type { ScreenshotMode, TraceMode, VideoMode } from '@playwright/test';

/**
 * Single source of truth for everything that may change between runs or machines.
 *
 * Every value has a default here and can be overridden by an environment variable,
 * either inline (`BROWSERS=firefox npm test`) or in a `.env` file (see `.env.example`).
 */
dotenv.config({ quiet: true });

export const SUPPORTED_BROWSERS = ['chromium', 'firefox', 'webkit'] as const;
export type BrowserName = (typeof SUPPORTED_BROWSERS)[number];

const TRACE_MODES: readonly TraceMode[] = ['off', 'on', 'retain-on-failure', 'on-first-retry', 'on-all-retries', 'retain-on-first-failure', 'retain-on-failure-and-retries'];
const SCREENSHOT_MODES: readonly ScreenshotMode[] = ['off', 'on', 'only-on-failure', 'on-first-failure'];
const VIDEO_MODES: readonly VideoMode[] = ['off', 'on', 'retain-on-failure', 'on-first-retry', 'on-all-retries', 'retain-on-first-failure', 'retain-on-failure-and-retries'];

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function readString(name: string, fallback: string): string {
  return readEnv(name) ?? fallback;
}

function readNumber(name: string, fallback: number): number {
  const raw = readEnv(name);
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer, got "${raw}"`);
  }
  return value;
}

function readBoolean(name: string, fallback: boolean): boolean {
  const raw = readEnv(name)?.toLowerCase();
  if (raw === undefined) return fallback;
  if (raw === 'true' || raw === '1') return true;
  if (raw === 'false' || raw === '0') return false;
  throw new Error(`${name} must be true/false, got "${raw}"`);
}

function readOneOf<T extends string>(name: string, allowed: readonly T[], fallback: T): T {
  const raw = readEnv(name);
  if (raw === undefined) return fallback;
  if (!allowed.includes(raw as T)) {
    throw new Error(`${name} must be one of ${allowed.join(', ')}; got "${raw}"`);
  }
  return raw as T;
}

function readBrowsers(name: string, fallback: BrowserName[]): BrowserName[] {
  const raw = readEnv(name);
  if (raw === undefined) return fallback;
  const browsers = raw.split(',').map(browser => browser.trim().toLowerCase()).filter(Boolean);
  const unknown = browsers.filter(browser => !SUPPORTED_BROWSERS.includes(browser as BrowserName));
  if (browsers.length === 0 || unknown.length > 0) {
    throw new Error(`${name} must be a comma-separated list of ${SUPPORTED_BROWSERS.join(', ')}; got "${raw}"`);
  }
  return browsers as BrowserName[];
}

const isCI = !!process.env.CI;
const baseUrl = readString('BASE_URL', 'http://127.0.0.1:3000');

export const config = {
  isCI,

  /** Juice Shop front end. */
  baseUrl,
  /** Juice Shop REST API. Served by the same app as the front end unless overridden. */
  apiUrl: readString('API_URL', baseUrl),

  /** Browsers that run tests/ui-tests and tests/e2e-tests. API tests never start a browser. */
  browsers: readBrowsers('BROWSERS', ['chromium']),
  headless: readBoolean('HEADLESS', true),

  /** All values in milliseconds. */
  timeouts: {
    test: readNumber('TEST_TIMEOUT', 30_000),
    expect: readNumber('EXPECT_TIMEOUT', 5_000),
    action: readNumber('ACTION_TIMEOUT', 10_000),
    navigation: readNumber('NAVIGATION_TIMEOUT', 15_000),
  },

  retries: readNumber('RETRIES', isCI ? 2 : 0),
  /** `undefined` lets Playwright choose (half the CPU cores). */
  workers: readEnv('WORKERS') ? readNumber('WORKERS', 1) : isCI ? 1 : undefined,

  artifacts: {
    trace: readOneOf('TRACE', TRACE_MODES, 'on-first-retry'),
    screenshot: readOneOf('SCREENSHOT', SCREENSHOT_MODES, 'only-on-failure'),
    video: readOneOf('VIDEO', VIDEO_MODES, 'off'),
  },

  /** Defaults for users the framework registers. Each user gets a unique email at this domain. */
  testUser: {
    emailDomain: readString('TEST_USER_EMAIL_DOMAIN', 'juice-sh.op'),
    /** Juice Shop requires 5-40 characters. */
    password: readString('TEST_USER_PASSWORD', 'Passw0rd!'),
    /** `id` must match the question text in Juice Shop's /api/SecurityQuestions. */
    securityQuestion: { id: 14, question: "What's your favorite place to go hiking?" },
    securityAnswer: readString('TEST_USER_SECURITY_ANSWER', 'Mountains'),
  },
} as const;
