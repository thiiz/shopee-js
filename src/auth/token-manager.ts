/**
 * Token Manager for Shopee API
 * 
 * Handles storage and automatic refresh of access tokens.
 */

import type { HttpClient } from '../http/client.js';
import { API_PATHS } from '../http/endpoints.js';
import type {
  GetAccessTokenResponse,
  MerchantTokenData,
  RefreshAccessTokenResponse,
  ShopTokenData,
} from '../types/index.js';

/**
 * Manages access and refresh tokens for shops and merchants.
 */
export class TokenManager {
  private httpClient: HttpClient;
  private shopTokens: Map<number, ShopTokenData> = new Map();
  private merchantTokens: Map<number, MerchantTokenData> = new Map();
  
  /** Buffer time before token expiration to trigger refresh (5 minutes) */
  private refreshBuffer = 5 * 60 * 1000;

  /** Callback for token refresh events */
  private onTokenRefresh?: (data: ShopTokenData | MerchantTokenData) => void | Promise<void>;

  constructor(
    httpClient: HttpClient,
    onTokenRefresh?: (data: ShopTokenData | MerchantTokenData) => void | Promise<void>
  ) {
    this.httpClient = httpClient;
    this.onTokenRefresh = onTokenRefresh;
  }

  /**
   * Gets initial access token using authorization code.
   * Call this after user completes OAuth flow.
   */
  async getAccessToken(params: {
    code: string;
    shopId?: number;
    mainAccountId?: number;
  }): Promise<GetAccessTokenResponse> {
    const body: Record<string, unknown> = {
      code: params.code,
      partner_id: this.httpClient.getPartnerId(),
    };

    if (params.shopId) {
      body.shop_id = params.shopId;
    }
    if (params.mainAccountId) {
      body.main_account_id = params.mainAccountId;
    }

    const response = await this.httpClient.post<GetAccessTokenResponse>(
      API_PATHS.GET_ACCESS_TOKEN,
      body,
      { apiType: 'public' }
    );

    // Store tokens
    const expiresAt = Date.now() + (response.expire_in * 1000);

    if (params.shopId) {
      this.shopTokens.set(params.shopId, {
        shopId: params.shopId,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expireIn: response.expire_in,
        expiresAt,
      });
    }

    // If main account, store tokens for all returned shops
    if (params.mainAccountId && response.shop_id_list) {
      for (const shopId of response.shop_id_list) {
        this.shopTokens.set(shopId, {
          shopId,
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          expireIn: response.expire_in,
          expiresAt,
        });
      }
    }

    // Store merchant tokens
    if (params.mainAccountId && response.merchant_id_list) {
      for (const merchantId of response.merchant_id_list) {
        this.merchantTokens.set(merchantId, {
          merchantId,
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          expireIn: response.expire_in,
          expiresAt,
        });
      }
    }

    return response;
  }

  /**
   * Refreshes access token for a shop.
   */
  async refreshShopToken(shopId: number): Promise<RefreshAccessTokenResponse> {
    const tokenData = this.shopTokens.get(shopId);
    if (!tokenData) {
      throw new Error(`No token found for shop ${shopId}`);
    }

    const body = {
      shop_id: shopId,
      refresh_token: tokenData.refreshToken,
      partner_id: this.httpClient.getPartnerId(),
    };

    const response = await this.httpClient.post<RefreshAccessTokenResponse>(
      API_PATHS.REFRESH_ACCESS_TOKEN,
      body,
      { apiType: 'public' }
    );

    // Update stored token
    const expiresAt = Date.now() + (response.expire_in * 1000);
    const newTokenData: ShopTokenData = {
      shopId,
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expireIn: response.expire_in,
      expiresAt,
    };

    this.shopTokens.set(shopId, newTokenData);

    // Notify callback
    if (this.onTokenRefresh) {
      await this.onTokenRefresh(newTokenData);
    }

    return response;
  }

  /**
   * Refreshes access token for a merchant.
   */
  async refreshMerchantToken(merchantId: number): Promise<RefreshAccessTokenResponse> {
    const tokenData = this.merchantTokens.get(merchantId);
    if (!tokenData) {
      throw new Error(`No token found for merchant ${merchantId}`);
    }

    const body = {
      merchant_id: merchantId,
      refresh_token: tokenData.refreshToken,
      partner_id: this.httpClient.getPartnerId(),
    };

    const response = await this.httpClient.post<RefreshAccessTokenResponse>(
      API_PATHS.REFRESH_ACCESS_TOKEN,
      body,
      { apiType: 'public' }
    );

    // Update stored token
    const expiresAt = Date.now() + (response.expire_in * 1000);
    const newTokenData: MerchantTokenData = {
      merchantId,
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expireIn: response.expire_in,
      expiresAt,
    };

    this.merchantTokens.set(merchantId, newTokenData);

    // Notify callback
    if (this.onTokenRefresh) {
      await this.onTokenRefresh(newTokenData);
    }

    return response;
  }

  /**
   * Gets the current access token for a shop.
   * Automatically refreshes if expired or about to expire.
   */
  async getShopAccessToken(shopId: number): Promise<string> {
    const tokenData = this.shopTokens.get(shopId);
    if (!tokenData) {
      throw new Error(`No token found for shop ${shopId}. Please authorize first.`);
    }

    // Check if token needs refresh
    if (Date.now() >= tokenData.expiresAt - this.refreshBuffer) {
      await this.refreshShopToken(shopId);
      return this.shopTokens.get(shopId)!.accessToken;
    }

    return tokenData.accessToken;
  }

  /**
   * Gets the current access token for a merchant.
   * Automatically refreshes if expired or about to expire.
   */
  async getMerchantAccessToken(merchantId: number): Promise<string> {
    const tokenData = this.merchantTokens.get(merchantId);
    if (!tokenData) {
      throw new Error(`No token found for merchant ${merchantId}. Please authorize first.`);
    }

    // Check if token needs refresh
    if (Date.now() >= tokenData.expiresAt - this.refreshBuffer) {
      await this.refreshMerchantToken(merchantId);
      return this.merchantTokens.get(merchantId)!.accessToken;
    }

    return tokenData.accessToken;
  }

  /**
   * Manually sets token data for a shop.
   * Useful for restoring tokens from persistent storage.
   */
  setShopToken(tokenData: ShopTokenData): void {
    this.shopTokens.set(tokenData.shopId, tokenData);
  }

  /**
   * Manually sets token data for a merchant.
   * Useful for restoring tokens from persistent storage.
   */
  setMerchantToken(tokenData: MerchantTokenData): void {
    this.merchantTokens.set(tokenData.merchantId, tokenData);
  }

  /**
   * Gets stored token data for a shop.
   * Useful for persisting tokens to storage.
   */
  getShopTokenData(shopId: number): ShopTokenData | undefined {
    return this.shopTokens.get(shopId);
  }

  /**
   * Gets stored token data for a merchant.
   * Useful for persisting tokens to storage.
   */
  getMerchantTokenData(merchantId: number): MerchantTokenData | undefined {
    return this.merchantTokens.get(merchantId);
  }

  /**
   * Checks if a shop has valid tokens.
   */
  hasShopToken(shopId: number): boolean {
    return this.shopTokens.has(shopId);
  }

  /**
   * Checks if a merchant has valid tokens.
   */
  hasMerchantToken(merchantId: number): boolean {
    return this.merchantTokens.has(merchantId);
  }

  /**
   * Removes tokens for a shop.
   */
  removeShopToken(shopId: number): void {
    this.shopTokens.delete(shopId);
  }

  /**
   * Removes tokens for a merchant.
   */
  removeMerchantToken(merchantId: number): void {
    this.merchantTokens.delete(merchantId);
  }

  /**
   * Gets all shop IDs with stored tokens.
   */
  getAuthorizedShopIds(): number[] {
    return Array.from(this.shopTokens.keys());
  }

  /**
   * Gets all merchant IDs with stored tokens.
   */
  getAuthorizedMerchantIds(): number[] {
    return Array.from(this.merchantTokens.keys());
  }
}
