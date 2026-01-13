/**
 * Shop Module
 * 
 * Provides access to shop-related APIs.
 */

import type { TokenManager } from '../auth/token-manager.js';
import type { HttpClient } from '../http/client.js';
import { API_PATHS } from '../http/endpoints.js';
import type { GetShopInfoResponse } from '../types/index.js';

/**
 * Shop module for accessing shop information and settings.
 */
export class ShopModule {
  private httpClient: HttpClient;
  private tokenManager: TokenManager;

  constructor(httpClient: HttpClient, tokenManager: TokenManager) {
    this.httpClient = httpClient;
    this.tokenManager = tokenManager;
  }

  /**
   * Gets shop information.
   * 
   * @example
   * ```typescript
   * const shopInfo = await client.shop.getShopInfo(123456);
   * console.log(shopInfo.shop_name, shopInfo.region);
   * ```
   */
  async getShopInfo(shopId: number): Promise<GetShopInfoResponse> {
    const accessToken = await this.tokenManager.getShopAccessToken(shopId);

    return this.httpClient.get<GetShopInfoResponse>(
      API_PATHS.GET_SHOP_INFO,
      undefined,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }

  /**
   * Updates shop profile information.
   * 
   * @example
   * ```typescript
   * await client.shop.updateProfile(123456, {
   *   shopName: 'My Awesome Shop',
   *   description: 'Welcome to my shop!'
   * });
   * ```
   */
  async updateProfile(
    shopId: number,
    params: {
      shopName?: string;
      shopLogo?: string;
      description?: string;
    }
  ): Promise<void> {
    const accessToken = await this.tokenManager.getShopAccessToken(shopId);

    const body: Record<string, unknown> = {};
    if (params.shopName) body.shop_name = params.shopName;
    if (params.shopLogo) body.shop_logo = params.shopLogo;
    if (params.description) body.description = params.description;

    await this.httpClient.post(
      API_PATHS.UPDATE_SHOP_PROFILE,
      body,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }
}
