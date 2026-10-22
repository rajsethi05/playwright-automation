/**
 * Texts the app shows, for assertions. Playwright trims and collapses whitespace when
 * matching text, so these don't need the app's surrounding spaces.
 */
export const registrationMessages = {
  emptyEmail: "Please provide an email address.",
  invalidEmail: "Email address is not valid.",
  invalidPassword: "Password must be 5-40 characters long.",
  passwordsDoNotMatch: "Passwords do not match",
} as const;
