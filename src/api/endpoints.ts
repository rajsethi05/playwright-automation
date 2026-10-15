/**
 * Every Juice Shop API path, relative to config.apiUrl.
 *
 * Juice Shop pluralizes resource names naively: `Addresss` and `Deliverys` are the real
 * paths, not typos.
 */
export const endpoints = {
  login: '/rest/user/login',
  users: '/api/Users/',
  productSearch: '/rest/products/search',
  basket: (basketId: number) => `/rest/basket/${basketId}`,
  basketCheckout: (basketId: number) => `/rest/basket/${basketId}/checkout`,
  basketItems: '/api/BasketItems/',
  addresses: '/api/Addresss/',
  deliveries: '/api/Deliverys/',
  cards: '/api/Cards/',
  complaints: '/api/Complaints/',
} as const;
