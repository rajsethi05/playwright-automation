/** Request and response shapes of the Juice Shop API (only the fields the tests use). */

export interface Credentials {
  email: string;
  password: string;
}

export interface SecurityQuestion {
  id: number;
  question: string;
}

/** Envelope used by most `/api/*` and `/rest/*` responses. */
export interface ApiSuccess<T> {
  status: "success";
  data: T;
}

/** Everything needed to register a user; the test data factory builds these. */
export interface UserDetails extends Credentials {
  securityQuestion: SecurityQuestion;
  securityAnswer: string;
}

export interface RegisterUserRequest extends Credentials {
  passwordRepeat: string;
  securityQuestion?: SecurityQuestion;
  securityAnswer?: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
}

export interface LoginResponse {
  authentication: {
    token: string;
    /** Basket id; the basket endpoints need it. */
    bid: number;
    umail: string;
  };
}

/** A logged-in user, as returned by POST /rest/user/login. */
export interface Session {
  token: string;
  basketId: number;
  email: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  deluxePrice: number;
  image: string;
}

export interface Card {
  fullName: string;
  cardNum: number;
  expMonth: string;
  expYear: string;
}

export interface Address {
  country: string;
  fullName: string;
  mobileNum: number;
  zipCode: string;
  streetAddress: string;
  city: string;
  state: string;
}
