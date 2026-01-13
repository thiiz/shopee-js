/**
 * Logistics Module
 * 
 * Provides complete access to logistics/shipping APIs based on Shopee documentation.
 */

import type { TokenManager } from '../auth/token-manager.js';
import type { HttpClient } from '../http/client.js';
import { API_PATHS } from '../http/endpoints.js';
import type {
    GetChannelListResponse,
    GetShippingDocumentResultResponse,
    GetShippingParameterResponse,
    GetTrackingNumberResponse,
    ShippingDocumentType
} from '../types/index.js';

export interface ShipOrderOptions {
  orderSn: string;
  packageNumber?: string;
  pickup?: {
    addressId: number;
    pickupTimeId: string;
  };
  dropoff?: {
    branchId?: number;
    senderRealName?: string;
    trackingNumber?: string;
    slug?: string;
  };
  nonIntegrated?: {
    trackingNumber: string;
  };
}

export interface CreateShippingDocumentOptions {
  orderSn: string;
  packageNumber?: string;
  documentType?: ShippingDocumentType;
}

/**
 * Logistics module for managing shipments.
 */
export class LogisticsModule {
  private httpClient: HttpClient;
  private tokenManager: TokenManager;

  constructor(httpClient: HttpClient, tokenManager: TokenManager) {
    this.httpClient = httpClient;
    this.tokenManager = tokenManager;
  }

  /**
   * Gets shipping parameters for an order.
   * This determines available shipping methods (pickup, dropoff, non_integrated).
   * 
   * @example
   * ```typescript
   * const params = await client.logistics.getShippingParameter(123456, '2401010001');
   * 
   * if (params.info_needed.pickup) {
   *   // Pickup available - choose address and time slot
   *   const address = params.pickup.address_list[0];
   *   const timeSlot = address.time_slot_list[0];
   * }
   * ```
   */
  async getShippingParameter(
    shopId: number,
    orderSn: string,
    packageNumber?: string
  ): Promise<GetShippingParameterResponse> {
    const accessToken = await this.tokenManager.getShopAccessToken(shopId);

    const params: Record<string, unknown> = {
      order_sn: orderSn,
    };

    if (packageNumber) {
      params.package_number = packageNumber;
    }

    return this.httpClient.get<GetShippingParameterResponse>(
      API_PATHS.GET_SHIPPING_PARAMETER,
      params,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }

  /**
   * Arranges shipment for an order/package.
   * 
   * @example
   * ```typescript
   * // Pickup method
   * await client.logistics.shipOrder(123456, {
   *   orderSn: '2401010001',
   *   pickup: {
   *     addressId: 2826,
   *     pickupTimeId: '1639472400'
   *   }
   * });
   * 
   * // Dropoff method
   * await client.logistics.shipOrder(123456, {
   *   orderSn: '2401010001',
   *   dropoff: {}
   * });
   * 
   * // Non-integrated method (own tracking number)
   * await client.logistics.shipOrder(123456, {
   *   orderSn: '2401010001',
   *   nonIntegrated: {
   *     trackingNumber: 'AK224200239740W'
   *   }
   * });
   * ```
   */
  async shipOrder(shopId: number, options: ShipOrderOptions): Promise<void> {
    const accessToken = await this.tokenManager.getShopAccessToken(shopId);

    const body: Record<string, unknown> = {
      order_sn: options.orderSn,
    };

    if (options.packageNumber) {
      body.package_number = options.packageNumber;
    }

    if (options.pickup) {
      body.pickup = {
        address_id: options.pickup.addressId,
        pickup_time_id: options.pickup.pickupTimeId,
      };
    }

    if (options.dropoff) {
      body.dropoff = {};
      if (options.dropoff.branchId) {
        (body.dropoff as Record<string, unknown>).branch_id = options.dropoff.branchId;
      }
      if (options.dropoff.senderRealName) {
        (body.dropoff as Record<string, unknown>).sender_real_name = options.dropoff.senderRealName;
      }
      if (options.dropoff.trackingNumber) {
        (body.dropoff as Record<string, unknown>).tracking_number = options.dropoff.trackingNumber;
      }
      if (options.dropoff.slug) {
        (body.dropoff as Record<string, unknown>).slug = options.dropoff.slug;
      }
    }

    if (options.nonIntegrated) {
      body.non_integrated = {
        tracking_number: options.nonIntegrated.trackingNumber,
      };
    }

    await this.httpClient.post(
      API_PATHS.SHIP_ORDER,
      body,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }

  /**
   * Updates shipping info for pickup orders.
   * Applicable to orders in RETRY_SHIP status.
   * 
   * @example
   * ```typescript
   * await client.logistics.updateShippingOrder(123456, {
   *   orderSn: '2401010001',
   *   pickup: {
   *     addressId: 11178,
   *     pickupTimeId: '1658563200'
   *   }
   * });
   * ```
   */
  async updateShippingOrder(
    shopId: number,
    options: {
      orderSn: string;
      packageNumber?: string;
      pickup?: {
        addressId: number;
        pickupTimeId: string;
      };
    }
  ): Promise<void> {
    const accessToken = await this.tokenManager.getShopAccessToken(shopId);

    const body: Record<string, unknown> = {
      order_sn: options.orderSn,
    };

    if (options.packageNumber) {
      body.package_number = options.packageNumber;
    }

    if (options.pickup) {
      body.pickup = {
        address_id: options.pickup.addressId,
        pickup_time_id: options.pickup.pickupTimeId,
      };
    }

    await this.httpClient.post(
      '/api/v2/logistics/update_shipping_order',
      body,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }

  /**
   * Gets the tracking number for an order/package.
   * 
   * @example
   * ```typescript
   * const tracking = await client.logistics.getTrackingNumber(123456, '2401010001');
   * console.log('Tracking:', tracking.tracking_number);
   * ```
   */
  async getTrackingNumber(
    shopId: number,
    orderSn: string,
    packageNumber?: string,
    responseOptionalFields?: string[]
  ): Promise<GetTrackingNumberResponse> {
    const accessToken = await this.tokenManager.getShopAccessToken(shopId);

    const params: Record<string, unknown> = {
      order_sn: orderSn,
    };

    if (packageNumber) {
      params.package_number = packageNumber;
    }

    if (responseOptionalFields && responseOptionalFields.length > 0) {
      params.response_optional_fields = responseOptionalFields.join(',');
    }

    return this.httpClient.get<GetTrackingNumberResponse>(
      API_PATHS.GET_TRACKING_NUMBER,
      params,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }

  /**
   * Gets available logistics channels for a shop.
   * 
   * @example
   * ```typescript
   * const channels = await client.logistics.getChannelList(123456);
   * for (const channel of channels.logistics_channel_list) {
   *   console.log(channel.logistics_channel_name, channel.enabled);
   * }
   * ```
   */
  async getChannelList(shopId: number): Promise<GetChannelListResponse> {
    const accessToken = await this.tokenManager.getShopAccessToken(shopId);

    return this.httpClient.get<GetChannelListResponse>(
      API_PATHS.GET_CHANNEL_LIST,
      undefined,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }

  /**
   * Gets shipping document parameters (available document types).
   * 
   * @example
   * ```typescript
   * const docParams = await client.logistics.getShippingDocumentParameter(123456, [{
   *   orderSn: '2401010001'
   * }]);
   * ```
   */
  async getShippingDocumentParameter(
    shopId: number,
    orderList: Array<{ orderSn: string; packageNumber?: string }>
  ): Promise<unknown> {
    const accessToken = await this.tokenManager.getShopAccessToken(shopId);

    const body = {
      order_list: orderList.map(order => ({
        order_sn: order.orderSn,
        package_number: order.packageNumber,
      })),
    };

    return this.httpClient.post(
      '/api/v2/logistics/get_shipping_document_parameter',
      body,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }

  /**
   * Creates a shipping document (airway bill) task.
   * 
   * @example
   * ```typescript
   * await client.logistics.createShippingDocument(123456, [{
   *   orderSn: '2401010001',
   *   documentType: 'NORMAL_AIR_WAYBILL'
   * }]);
   * ```
   */
  async createShippingDocument(
    shopId: number,
    orderList: CreateShippingDocumentOptions[]
  ): Promise<void> {
    const accessToken = await this.tokenManager.getShopAccessToken(shopId);

    const body = {
      order_list: orderList.map(order => ({
        order_sn: order.orderSn,
        package_number: order.packageNumber,
        document_type: order.documentType,
      })),
    };

    await this.httpClient.post(
      '/api/v2/logistics/create_shipping_document',
      body,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }

  /**
   * Gets shipping document task result.
   * Call this after createShippingDocument to check if the document is ready.
   * 
   * @example
   * ```typescript
   * const result = await client.logistics.getShippingDocumentResult(123456, [{
   *   orderSn: '2401010001'
   * }]);
   * 
   * if (result.result_list[0].status === 'READY') {
   *   // Document is ready to download
   * }
   * ```
   */
  async getShippingDocumentResult(
    shopId: number,
    orderList: Array<{ orderSn: string; packageNumber?: string; documentType?: ShippingDocumentType }>
  ): Promise<GetShippingDocumentResultResponse> {
    const accessToken = await this.tokenManager.getShopAccessToken(shopId);

    const body = {
      order_list: orderList.map(order => ({
        order_sn: order.orderSn,
        package_number: order.packageNumber,
        document_type: order.documentType,
      })),
    };

    return this.httpClient.post<GetShippingDocumentResultResponse>(
      '/api/v2/logistics/get_shipping_document_result',
      body,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }

  /**
   * Downloads the shipping document (airway bill).
   * Returns the document as a Buffer.
   * 
   * @example
   * ```typescript
   * const document = await client.logistics.downloadShippingDocument(123456, [{
   *   orderSn: '2401010001',
   *   documentType: 'NORMAL_AIR_WAYBILL'
   * }]);
   * // document is a PDF, HTML, or ZIP file depending on settings
   * ```
   */
  async downloadShippingDocument(
    shopId: number,
    orderList: Array<{ orderSn: string; packageNumber?: string; documentType?: ShippingDocumentType }>
  ): Promise<unknown> {
    const accessToken = await this.tokenManager.getShopAccessToken(shopId);

    const body = {
      order_list: orderList.map(order => ({
        order_sn: order.orderSn,
        package_number: order.packageNumber,
        document_type: order.documentType,
      })),
    };

    return this.httpClient.post(
      '/api/v2/logistics/download_shipping_document',
      body,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }

  /**
   * Gets shipping document data for self-printing.
   * 
   * @example
   * ```typescript
   * const data = await client.logistics.getShippingDocumentDataInfo(123456, [{
   *   orderSn: '2401010001'
   * }]);
   * ```
   */
  async getShippingDocumentDataInfo(
    shopId: number,
    orderList: Array<{ orderSn: string; packageNumber?: string }>
  ): Promise<unknown> {
    const accessToken = await this.tokenManager.getShopAccessToken(shopId);

    const body = {
      order_list: orderList.map(order => ({
        order_sn: order.orderSn,
        package_number: order.packageNumber,
      })),
    };

    return this.httpClient.post(
      '/api/v2/logistics/get_shipping_document_data_info',
      body,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }

  /**
   * Gets tracking info for an order.
   * 
   * @example
   * ```typescript
   * const trackingInfo = await client.logistics.getTrackingInfo(123456, '2401010001');
   * ```
   */
  async getTrackingInfo(
    shopId: number,
    orderSn: string,
    packageNumber?: string
  ): Promise<unknown> {
    const accessToken = await this.tokenManager.getShopAccessToken(shopId);

    const params: Record<string, unknown> = {
      order_sn: orderSn,
    };

    if (packageNumber) {
      params.package_number = packageNumber;
    }

    return this.httpClient.get(
      '/api/v2/logistics/get_tracking_info',
      params,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }

  /**
   * Batch get tracking numbers for multiple orders.
   * 
   * @example
   * ```typescript
   * const tracking = await client.logistics.batchGetTrackingNumber(123456, [
   *   { orderSn: '2401010001' },
   *   { orderSn: '2401010002' }
   * ]);
   * ```
   */
  async batchGetTrackingNumber(
    shopId: number,
    orderList: Array<{ orderSn: string; packageNumber?: string }>
  ): Promise<unknown> {
    const accessToken = await this.tokenManager.getShopAccessToken(shopId);

    const body = {
      order_list: orderList.map(order => ({
        order_sn: order.orderSn,
        package_number: order.packageNumber,
      })),
    };

    return this.httpClient.post(
      '/api/v2/logistics/get_mass_tracking_number',
      body,
      {
        apiType: 'shop',
        shopId,
        accessToken,
      }
    );
  }
}
