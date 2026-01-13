/**
 * Order Module
 * 
 * Provides complete access to order-related APIs based on Shopee documentation.
 */

import type { HttpClient } from '../http/client.js';
import { API_PATHS } from '../http/endpoints.js';
import type {
  GetOrderDetailResponse,
  GetOrderListResponse,
  LogisticsStatus,
  OrderCancelReason,
  OrderDetail,
  OrderStatus,
  PackageStatus,
  SearchPackageListResponse,
  TimeRangeField
} from '../types/index.js';

export interface ListOrdersOptions {
  /** Field to filter by time range */
  timeRangeField: TimeRangeField;
  /** Start time (Unix timestamp in seconds) */
  timeFrom: number;
  /** End time (Unix timestamp in seconds) */
  timeTo: number;
  /** Number of orders per page (max 100) */
  pageSize?: number;
  /** Cursor for pagination */
  cursor?: string;
  /** Filter by order status */
  orderStatus?: OrderStatus;
  /** Optional fields to include in response */
  responseOptionalFields?: string;
}

export interface OrderListResult {
  hasMore: boolean;
  nextCursor: string;
  orders: Array<{
    orderSn: string;
    orderStatus: OrderStatus;
  }>;
}

export interface SearchPackageOptions {
  /** Package status filter */
  packageStatus: PackageStatus;
  /** Number of packages per page (max 50) */
  pageSize?: number;
  /** Cursor for pagination */
  cursor?: string;
  /** Sort by field */
  sortBy?: 'create_time';
  /** Sort direction */
  sortDirection?: 'ASC' | 'DESC';
  /** Create time range start */
  createTimeFrom?: number;
  /** Create time range end */
  createTimeTo?: number;
}

export interface PackageListResult {
  hasMore: boolean;
  nextCursor: string;
  packages: Array<{
    orderSn: string;
    packageNumber: string;
    logisticsStatus: LogisticsStatus;
    shippingCarrier: string;
    channelId: number;
  }>;
}

export interface SplitOrderItem {
  itemId: number;
  modelId: number;
  orderItemId: number;
  promotionGroupId: number;
}

/**
 * Order module for managing shop orders.
 */
export class OrderModule {
  private httpClient: HttpClient;
  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Gets a list of orders for a shop.
   * 
   * @example
   * ```typescript
   * const result = await client.order.listOrders(123456, 'ACCESS_TOKEN', {
   *   timeRangeField: 'create_time',
   *   timeFrom: 1609459200,
   *   timeTo: 1609545600,
   *   pageSize: 50
   * });
   * ```
   */
  async listOrders(shopId: number, accessToken: string, options: ListOrdersOptions): Promise<OrderListResult> {
    const params: Record<string, unknown> = {
      time_range_field: options.timeRangeField,
      time_from: options.timeFrom,
      time_to: options.timeTo,
      page_size: options.pageSize ?? 50,
    };

    if (options.cursor) {
      params.cursor = options.cursor;
    }
    if (options.orderStatus) {
      params.order_status = options.orderStatus;
    }
    if (options.responseOptionalFields) {
      params.response_optional_fields = options.responseOptionalFields;
    }

    const response = await this.httpClient.get<GetOrderListResponse>(
      API_PATHS.GET_ORDER_LIST,
      params,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );

    return {
      hasMore: response.more,
      nextCursor: response.next_cursor,
      orders: response.order_list.map((order) => ({
        orderSn: order.order_sn,
        orderStatus: order.order_status,
      })),
    };
  }

  /**
   * Gets detailed information for specific orders.
   * 
   * @example
   * ```typescript
   * const details = await client.order.getOrderDetails(123456, 'ACCESS_TOKEN', {
   *   orderSnList: ['2401010001', '2401010002'],
   *   responseOptionalFields: ['buyer_user_id', 'buyer_username', 'item_list']
   * });
   * ```
   */
  async getOrderDetails(
    shopId: number,
    accessToken: string,
    options: {
      orderSnList: string[];
      responseOptionalFields?: string[];
    }
  ): Promise<OrderDetail[]> {

    const params: Record<string, unknown> = {
      order_sn_list: options.orderSnList.join(','),
    };

    if (options.responseOptionalFields && options.responseOptionalFields.length > 0) {
      params.response_optional_fields = options.responseOptionalFields.join(',');
    }

    const response = await this.httpClient.get<GetOrderDetailResponse>(
      API_PATHS.GET_ORDER_DETAIL,
      params,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );

    return response.order_list;
  }

  /**
   * Cancels an order (seller initiated).
   * 
   * @example
   * ```typescript
   * await client.order.cancelOrder(123456, 'ACCESS_TOKEN', {
   *   orderSn: '2401010001',
   *   cancelReason: 'OUT_OF_STOCK',
   *   itemList: [{ item_id: 100001, model_id: 0 }]
   * });
   * ```
   */
  async cancelOrder(
    shopId: number,
    accessToken: string,
    options: {
      orderSn: string;
      cancelReason: OrderCancelReason;
      itemList?: Array<{
        item_id: number;
        model_id: number;
      }>;
    }
  ): Promise<void> {

    const body: Record<string, unknown> = {
      order_sn: options.orderSn,
      cancel_reason: options.cancelReason,
    };

    if (options.itemList) {
      body.item_list = options.itemList;
    }

    await this.httpClient.post(
      API_PATHS.CANCEL_ORDER,
      body,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }

  /**
   * Handles buyer's cancellation request.
   * 
   * @example
   * ```typescript
   * await client.order.handleBuyerCancellation(123456, 'ACCESS_TOKEN', {
   *   orderSn: '2401010001',
   *   operation: 'ACCEPT' // or 'REJECT'
   * });
   * ```
   */
  async handleBuyerCancellation(
    shopId: number,
    accessToken: string,
    options: {
      orderSn: string;
      operation: 'ACCEPT' | 'REJECT';
    }
  ): Promise<void> {

    const body = {
      order_sn: options.orderSn,
      operation: options.operation,
    };

    await this.httpClient.post(
      '/api/v2/order/handle_buyer_cancellation',
      body,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }

  /**
   * Splits an order into multiple packages.
   * Orders can only be split when status is "READY_TO_SHIP".
   * 
   * @example
   * ```typescript
   * await client.order.splitOrder(123456, 'ACCESS_TOKEN', {
   *   orderSn: '2204215JYEEFW0',
   *   packageList: [
   *     {
   *       itemList: [
   *         { itemId: 1220089094, modelId: 0, orderItemId: 1220089094, promotionGroupId: 0 }
   *       ]
   *     },
   *     {
   *       itemList: [
   *         { itemId: 2436030646, modelId: 5074620257, orderItemId: 2436030646, promotionGroupId: 0 }
   *       ]
   *     }
   *   ]
   * });
   * ```
   */
  async splitOrder(
    shopId: number,
    accessToken: string,
    options: {
      orderSn: string;
      packageList: Array<{
        itemList: SplitOrderItem[];
      }>;
    }
  ): Promise<void> {

    const body = {
      order_sn: options.orderSn,
      package_list: options.packageList.map(pkg => ({
        item_list: pkg.itemList.map(item => ({
          item_id: item.itemId,
          model_id: item.modelId,
          order_item_id: item.orderItemId,
          promotion_group_id: item.promotionGroupId,
        })),
      })),
    };

    await this.httpClient.post(
      API_PATHS.SPLIT_ORDER,
      body,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }

  /**
   * Cancels a split order (unsplit).
   * Order status must be "READY_TO_SHIP" and no package must have been shipped.
   * 
   * @example
   * ```typescript
   * await client.order.unsplitOrder(123456, 'ACCESS_TOKEN', '2204215JYEEFW0');
   * ```
   */
  async unsplitOrder(shopId: number, accessToken: string, orderSn: string): Promise<void> {

    const body = {
      order_sn: orderSn,
    };

    await this.httpClient.post(
      '/api/v2/order/unsplit_order',
      body,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }

  /**
   * Searches for packages that need to be shipped.
   * Use this API to get packages ready for shipment arrangement.
   * 
   * @example
   * ```typescript
   * const result = await client.order.searchPackages(123456, 'ACCESS_TOKEN', {
   *   packageStatus: 2, // ToProcess
   *   pageSize: 50,
   *   sortBy: 'create_time',
   *   sortDirection: 'DESC'
   * });
   * ```
   */
  async searchPackages(
    shopId: number,
    accessToken: string,
    options: SearchPackageOptions
  ): Promise<PackageListResult> {

    const params: Record<string, unknown> = {
      package_status: options.packageStatus,
      page_size: options.pageSize ?? 50,
    };

    if (options.cursor) {
      params.cursor = options.cursor;
    }
    if (options.sortBy) {
      params.sort_by = options.sortBy;
    }
    if (options.sortDirection) {
      params.sort_direction = options.sortDirection;
    }
    if (options.createTimeFrom) {
      params.create_time_from = options.createTimeFrom;
    }
    if (options.createTimeTo) {
      params.create_time_to = options.createTimeTo;
    }

    const response = await this.httpClient.get<SearchPackageListResponse>(
      '/api/v2/order/search_package_list',
      params,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );

    return {
      hasMore: response.more,
      nextCursor: response.next_cursor,
      packages: response.package_list.map((pkg) => ({
        orderSn: pkg.order_sn,
        packageNumber: pkg.package_number,
        logisticsStatus: pkg.logistics_status,
        shippingCarrier: pkg.shipping_carrier,
        channelId: pkg.channel_id,
      })),
    };
  }

  /**
   * Gets package details.
   * 
   * @example
   * ```typescript
   * const packageDetail = await client.order.getPackageDetail(123456, 'ACCESS_TOKEN', {
   *   orderSn: '2204215JYEEFW0',
   *   packageNumber: 'PKG001'
   * });
   * ```
   */
  async getPackageDetail(
    shopId: number,
    accessToken: string,
    options: {
      orderSn: string;
      packageNumber?: string;
    }
  ): Promise<unknown> {

    const params: Record<string, unknown> = {
      order_sn: options.orderSn,
    };

    if (options.packageNumber) {
      params.package_number = options.packageNumber;
    }

    return this.httpClient.get(
      '/api/v2/order/get_package_detail',
      params,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }

  /**
   * Iterates through all orders matching the criteria.
   * Handles pagination automatically.
   * 
   * @example
   * ```typescript
   * for await (const order of client.order.iterateOrders(123456, 'ACCESS_TOKEN', {
   *   timeRangeField: 'create_time',
   *   timeFrom: 1609459200,
   *   timeTo: 1609545600
   * })) {
   *   console.log(order.orderSn);
   * }
   * ```
   */
  async *iterateOrders(
    shopId: number,
    accessToken: string,
    options: Omit<ListOrdersOptions, 'cursor'>
  ): AsyncGenerator<{ orderSn: string; orderStatus: OrderStatus }> {
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const result = await this.listOrders(shopId, accessToken, {
        ...options,
        cursor,
      });

      for (const order of result.orders) {
        yield order;
      }

      hasMore = result.hasMore;
      cursor = result.nextCursor;
    }
  }

  /**
   * Iterates through all packages matching the criteria.
   * Handles pagination automatically.
   * 
   * @example
   * ```typescript
   * for await (const pkg of client.order.iteratePackages(123456, 'ACCESS_TOKEN', {
   *   packageStatus: 2 // ToProcess
   * })) {
   *   console.log(pkg.orderSn, pkg.packageNumber);
   * }
   * ```
   */
  async *iteratePackages(
    shopId: number,
    accessToken: string,
    options: Omit<SearchPackageOptions, 'cursor'>
  ): AsyncGenerator<PackageListResult['packages'][number]> {
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const result = await this.searchPackages(shopId, accessToken, {
        ...options,
        cursor,
      });

      for (const pkg of result.packages) {
        yield pkg;
      }

      hasMore = result.hasMore;
      cursor = result.nextCursor;
    }
  }
}
