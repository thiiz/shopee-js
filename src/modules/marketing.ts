/**
 * Marketing (Ads) Module
 * 
 * Provides access to Shopee Marketing/Ads APIs.
 */

import type { HttpClient } from '../http/client.js';
import { API_PATHS } from '../http/endpoints.js';
import type {
    GetAdListParams,
    GetAdListResponse,
    GetShopAdsDailyReportParams,
    GetShopAdsDailyReportResponse,
    MutateAdsParams,
    MutateAdsResponse
} from '../types/index.js';

/**
 * Marketing module for managing Shopee Ads and marketing activities.
 */
export class MarketingModule {
  private httpClient: HttpClient;
  
  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Gets a list of ads.
   * 
   * @example
   * ```typescript
   * const ads = await client.marketing.getAdList(123456, 'ACCESS_TOKEN', {
   *   type: 'product_search_ad',
   *   status: 'ongoing'
   * });
   * ```
   */
  async getAdList(
    shopId: number, 
    accessToken: string, 
    params: GetAdListParams
  ): Promise<GetAdListResponse> {
    return this.httpClient.get<GetAdListResponse>(
      API_PATHS.GET_AD_LIST,
      params as unknown as Record<string, unknown>,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }

  /**
   * Gets daily performance report for shop ads.
   * 
   * @example
   * ```typescript
   * const report = await client.marketing.getShopAdsDailyReport(123456, 'ACCESS_TOKEN', {
   *   date: '2023-10-01'
   * });
   * ```
   */
  async getShopAdsDailyReport(
    shopId: number,
    accessToken: string,
    params: GetShopAdsDailyReportParams
  ): Promise<GetShopAdsDailyReportResponse> {
    return this.httpClient.get<GetShopAdsDailyReportResponse>(
      API_PATHS.GET_SHOP_ADS_DAILY_REPORT,
      params as unknown as Record<string, unknown>,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }

  /**
   * Creates, updates, or deletes ads.
   * 
   * @example
   * ```typescript
   * const result = await client.marketing.mutateAds(123456, 'ACCESS_TOKEN', {
   *   operation: 'update',
   *   ads: [{ ad_id: 123, ad_status: 'paused' }]
   * });
   * ```
   */
  async mutateAds(
    shopId: number,
    accessToken: string,
    params: MutateAdsParams
  ): Promise<MutateAdsResponse> {
    return this.httpClient.post<MutateAdsResponse>(
      API_PATHS.MUTATE_ADS,
      params as unknown as Record<string, unknown>,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }
}
