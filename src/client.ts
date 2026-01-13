/**
 * Shopee SDK Client
 * 
 * Main entry point for interacting with the Shopee Open Platform API.
 */

import { TokenManager } from './auth/token-manager.js';
import { HttpClient } from './http/client.js';
import { AuthModule } from './modules/auth.js';
import { LogisticsModule } from './modules/logistics.js';
import { OrderModule } from './modules/order.js';
import { ProductModule } from './modules/product.js';
import { ShopModule } from './modules/shop.js';
import type { ShopeeConfig } from './types/index.js';

/**
 * Shopee SDK Client
 * 
 * The main class for interacting with Shopee Open Platform API v2.
 * 
 * @example
 * ```typescript
 * import { ShopeeClient } from 'shopee-js';
 * 
 * const client = new ShopeeClient({
 *   partnerId: 123456,
 *   partnerKey: 'your-partner-key',
 *   environment: 'sandbox', // or 'production'
 *   region: 'sg' // 'sg', 'cn', or 'br'
 * });
 * 
 * // Generate authorization link
 * const authUrl = await client.auth.generateAuthLink({
 *   redirectUrl: 'https://your-site.com/callback'
 * });
 * 
  * // After OAuth callback
 * const tokens = await client.auth.getAccessToken({ code: 'auth-code', shopId: 123 });
 * const accessToken = tokens.access_token;
 * 
 * // Make API calls
 * const shopInfo = await client.shop.getShopInfo(123, accessToken);
 * const orders = await client.order.listOrders(123, accessToken, {
 *   timeRangeField: 'create_time',
 *   timeFrom: 1609459200,
 *   timeTo: 1609545600
 * });
 * ```
 */
export class ShopeeClient {
  private httpClient: HttpClient;
  private tokenManager: TokenManager;

  /** Authentication and authorization module */
  public readonly auth: AuthModule;

  /** Shop information module */
  public readonly shop: ShopModule;

  /** Order management module */
  public readonly order: OrderModule;

  /** Product management module */
  public readonly product: ProductModule;

  /** Logistics and shipping module */
  public readonly logistics: LogisticsModule;

  /**
   * Creates a new Shopee client instance.
   * 
   * @param config - Configuration options
   */
  constructor(config: ShopeeConfig) {
    this.validateConfig(config);

    this.httpClient = new HttpClient(config);
    this.tokenManager = new TokenManager(this.httpClient);

    // Initialize modules
    this.auth = new AuthModule(this.httpClient, this.tokenManager);
    this.shop = new ShopModule(this.httpClient);
    this.order = new OrderModule(this.httpClient);
    this.product = new ProductModule(this.httpClient);
    this.logistics = new LogisticsModule(this.httpClient);
  }

  /**
   * Validates the configuration.
   */
  private validateConfig(config: ShopeeConfig): void {
    if (!config.partnerId) {
      throw new Error('partnerId is required');
    }
    if (!config.partnerKey) {
      throw new Error('partnerKey is required');
    }
    if (typeof config.partnerId !== 'number') {
      throw new Error('partnerId must be a number');
    }
    if (typeof config.partnerKey !== 'string') {
      throw new Error('partnerKey must be a string');
    }
  }

  /**
   * Gets the underlying HTTP client.
   * Useful for making custom API calls.
   */
  getHttpClient(): HttpClient {
    return this.httpClient;
  }

  /**
   * Gets the token manager.
   * Useful for advanced token management.
   */
  getTokenManager(): TokenManager {
    return this.tokenManager;
  }
}
