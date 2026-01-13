/**
 * Auth Module
 * 
 * Handles authorization flow including generating auth links and token management.
 */

import { generateSignature, getTimestamp } from '../auth/signature.js';
import type { TokenManager } from '../auth/token-manager.js';
import type { HttpClient } from '../http/client.js';
import { API_PATHS } from '../http/endpoints.js';
import type { GetAccessTokenResponse } from '../types/index.js';

export interface GenerateAuthLinkOptions {
  /** URL to redirect after authorization */
  redirectUrl: string;
}

/**
 * Auth module for handling Shopee OAuth flow.
 */
export class AuthModule {
  private httpClient: HttpClient;
  private tokenManager: TokenManager;

  constructor(httpClient: HttpClient, tokenManager: TokenManager) {
    this.httpClient = httpClient;
    this.tokenManager = tokenManager;
  }

  /**
   * Generates an authorization link for shop owners to authorize your app.
   * 
   * @example
   * ```typescript
   * const authUrl = await client.auth.generateAuthLink({
   *   redirectUrl: 'https://your-site.com/callback'
   * });
   * // Redirect user to this URL
   * ```
   */
  async generateAuthLink(options: GenerateAuthLinkOptions): Promise<string> {
    const timestamp = getTimestamp();
    const path = API_PATHS.AUTH_PARTNER;

    const sign = await generateSignature({
      partnerId: this.httpClient.getPartnerId(),
      partnerKey: this.httpClient.getPartnerKey(),
      path,
      timestamp,
      apiType: 'public',
    });

    const params = new URLSearchParams({
      partner_id: String(this.httpClient.getPartnerId()),
      timestamp: String(timestamp),
      sign,
      redirect: options.redirectUrl,
    });

    return `${this.httpClient.getBaseUrl()}${path}?${params.toString()}`;
  }

  /**
   * Gets access token after user completes authorization.
   * Call this with the code from the OAuth callback.
   * 
   * @example
   * ```typescript
   * // After OAuth callback with ?code=xxx&shop_id=123
   * const tokens = await client.auth.getAccessToken({
   *   code: 'authorization-code',
   *   shopId: 123456
   * });
   * ```
   */
  async getAccessToken(params: {
    code: string;
    shopId?: number;
    mainAccountId?: number;
  }): Promise<GetAccessTokenResponse> {
    return this.tokenManager.getAccessToken(params);
  }

  /**
   * Refreshes the access token for a shop.
   * Normally you don't need to call this manually - it's done automatically.
   */
  async refreshShopToken(shopId: number) {
    return this.tokenManager.refreshShopToken(shopId);
  }

  /**
   * Refreshes the access token for a merchant.
   * Normally you don't need to call this manually - it's done automatically.
   */
  async refreshMerchantToken(merchantId: number) {
    return this.tokenManager.refreshMerchantToken(merchantId);
  }

  /**
   * Sets token data for a shop.
   * Use this to restore tokens from your database/storage.
   */
  setShopToken(shopId: number, accessToken: string, refreshToken: string, expiresAt: number) {
    this.tokenManager.setShopToken({
      shopId,
      accessToken,
      refreshToken,
      expireIn: Math.floor((expiresAt - Date.now()) / 1000),
      expiresAt,
    });
  }

  /**
   * Gets stored token data for persistence.
   */
  getShopTokenData(shopId: number) {
    return this.tokenManager.getShopTokenData(shopId);
  }

  /**
   * Gets all authorized shop IDs.
   */
  getAuthorizedShopIds(): number[] {
    return this.tokenManager.getAuthorizedShopIds();
  }

  /**
   * Checks if a shop is authorized.
   */
  isShopAuthorized(shopId: number): boolean {
    return this.tokenManager.hasShopToken(shopId);
  }
}
