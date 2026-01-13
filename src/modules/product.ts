/**
 * Product Module
 * 
 * Provides access to product-related APIs.
 */

import type { HttpClient } from '../http/client.js';
import { API_PATHS } from '../http/endpoints.js';
import type {
  CategoryInfo,
  GetCategoryResponse,
  GetItemBaseInfoResponse,
  ItemBaseInfo
} from '../types/index.js';

export interface GetCategoryOptions {
  /** Language for category names */
  language?: string;
}

export interface ItemListOptions {
  /** Filter by item status. Multiple statuses can be passed as an array. */
  itemStatus: Array<'NORMAL' | 'BANNED' | 'DELETED' | 'UNLIST'>;
  /** Offset for pagination */
  offset?: number;
  /** Number of items per page (max 100) */
  pageSize?: number;
  /** Update time range start */
  updateTimeFrom?: number;
  /** Update time range end */
  updateTimeTo?: number;
}

export interface ItemListResult {
  items: Array<{
    itemId: number;
    itemStatus: string;
    updateTime: number;
  }>;
  hasNextPage: boolean;
  offset: number;
  totalCount: number;
}

/**
 * Product module for managing shop products.
 */
export class ProductModule {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Gets the category tree for a shop.
   * 
   * @example
   * ```typescript
   * const categories = await client.product.getCategories(123456, 'ACCESS_TOKEN', {
   *   language: 'en'
   * });
   * ```
   */
  async getCategories(
    shopId: number,
    accessToken: string,
    options?: GetCategoryOptions
  ): Promise<CategoryInfo[]> {
    const params: Record<string, unknown> = {};
    if (options?.language) {
      params.language = options.language;
    }

    const response = await this.httpClient.get<GetCategoryResponse>(
      API_PATHS.GET_CATEGORY,
      Object.keys(params).length > 0 ? params : undefined,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );

    return response.category_list;
  }

  /**
   * Gets a list of items/products for a shop.
   * 
   * @example
   * ```typescript
   * const result = await client.product.listItems(123456, 'ACCESS_TOKEN', {
   *   itemStatus: ['NORMAL'],
   *   offset: 0,
   *   pageSize: 50
   * });
   * ```
   */
  async listItems(shopId: number, accessToken: string, options: ItemListOptions): Promise<ItemListResult> {
    const params: Record<string, unknown> = {
      item_status: options.itemStatus,
      offset: options.offset ?? 0,
      page_size: options.pageSize ?? 50,
    };

    if (options.updateTimeFrom) {
      params.update_time_from = options.updateTimeFrom;
    }
    if (options.updateTimeTo) {
      params.update_time_to = options.updateTimeTo;
    }

    const response = await this.httpClient.get<{
      item: Array<{
        item_id: number;
        item_status: string;
        update_time: number;
      }>;
      has_next_page: boolean;
      next_offset: number;
      total_count: number;
    }>(
      API_PATHS.GET_ITEM_LIST,
      params,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );

    return {
      items: response.item.map((item) => ({
        itemId: item.item_id,
        itemStatus: item.item_status,
        updateTime: item.update_time,
      })),
      hasNextPage: response.has_next_page,
      offset: response.next_offset,
      totalCount: response.total_count,
    };
  }

  /**
   * Gets basic information for specific items.
   * 
   * @example
   * ```typescript
   * const items = await client.product.getItemBaseInfo(123456, 'ACCESS_TOKEN', {
   *   itemIdList: [100001, 100002]
   * });
   * ```
   */
  async getItemBaseInfo(
    shopId: number,
    accessToken: string,
    options: {
      itemIdList: number[];
      needTaxInfo?: boolean;
      needComplaintPolicy?: boolean;
    }
  ): Promise<ItemBaseInfo[]> {
    const params: Record<string, unknown> = {
      item_id_list: options.itemIdList.join(','),
    };

    if (options.needTaxInfo) {
      params.need_tax_info = options.needTaxInfo;
    }
    if (options.needComplaintPolicy) {
      params.need_complaint_policy = options.needComplaintPolicy;
    }

    const response = await this.httpClient.get<GetItemBaseInfoResponse>(
      API_PATHS.GET_ITEM_BASE_INFO,
      params,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );

    return response.item_list;
  }

  /**
   * Iterates through all items in a shop.
   * Handles pagination automatically.
   * 
   * @example
   * ```typescript
   * for await (const item of client.product.iterateItems(123456, 'ACCESS_TOKEN', {
   *   itemStatus: ['NORMAL']
   * })) {
   *   console.log(item.itemId);
   * }
   * ```
   */
  async *iterateItems(
    shopId: number,
    accessToken: string,
    options: Omit<ItemListOptions, 'offset'>
  ): AsyncGenerator<{ itemId: number; itemStatus: string; updateTime: number }> {
    let offset = 0;
    let hasNextPage = true;

    while (hasNextPage) {
      const result = await this.listItems(shopId, accessToken, {
        ...options,
        offset,
      });

      for (const item of result.items) {
        yield item;
      }

      hasNextPage = result.hasNextPage;
      offset = result.offset;
    }
  }
}
