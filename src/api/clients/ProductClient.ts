import type { APIResponse } from "@playwright/test";
import { endpoints } from "../endpoints";
import type { ApiSuccess, Product } from "../types";
import { BaseApiClient } from "./BaseApiClient";

export class ProductClient extends BaseApiClient {
  /** Matches `query` against product names and descriptions; an empty query returns every product. */
  search(query = ""): Promise<APIResponse> {
    return this.request.get(endpoints.productSearch, { params: { q: query } });
  }

  async list(query = ""): Promise<Product[]> {
    return (await this.parse<ApiSuccess<Product[]>>(await this.search(query)))
      .data;
  }

  async findByName(name: string): Promise<Product> {
    const product = (await this.list(name)).find(
      (candidate) => candidate.name === name,
    );
    if (!product) {
      throw new Error(`Product "${name}" is not in the catalog`);
    }
    return product;
  }
}
