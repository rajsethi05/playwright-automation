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

export const basketMessages = {
  placed: (product: string) => `Placed ${product} into basket.`,
  addedAnother: (product: string) => `Added another ${product} to basket.`,
} as const;

/** Prices show the API's number as is, followed by Juice Shop's generic currency sign. */
export function formatPrice(price: number): string {
  return `${price}¤`;
}
