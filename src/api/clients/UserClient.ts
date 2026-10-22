import type { APIResponse } from "@playwright/test";
import { endpoints } from "../endpoints";
import type {
  ApiSuccess,
  RegisterUserRequest,
  User,
  UserDetails,
} from "../types";
import { BaseApiClient } from "./BaseApiClient";

export class UserClient extends BaseApiClient {
  register(body: RegisterUserRequest): Promise<APIResponse> {
    return this.request.post(endpoints.users, { data: body });
  }

  async create({
    email,
    password,
    securityQuestion,
    securityAnswer,
  }: UserDetails): Promise<User> {
    const response = await this.register({
      email,
      password,
      passwordRepeat: password,
      securityQuestion,
      securityAnswer,
    });
    return (await this.parse<ApiSuccess<User>>(response)).data;
  }
}
