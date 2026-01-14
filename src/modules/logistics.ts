/**
 * Logistics Module
 *
 * Provides complete access to logistics/shipping APIs based on Shopee documentation.
 */

import type { HttpClient } from "../http/client.js";
import { API_PATHS } from "../http/endpoints.js";
import type {
	DownloadShippingDocumentResponse,
	GetChannelListResponse,
	GetMassTrackingNumberResponse,
	GetShippingDocumentDataInfoResponse,
	GetShippingDocumentParameterResponse,
	GetShippingDocumentResultResponse,
	GetShippingParameterResponse,
	GetTrackingInfoResponse,
	GetTrackingNumberResponse,
	ShippingDocumentType,
} from "../types/index.js";
import { filterUndefined } from "../utils/index.js";

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

	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

	/**
	 * Gets shipping parameters for an order.
	 * This determines available shipping methods (pickup, dropoff, non_integrated).
	 *
	 * @example
	 * ```typescript
	 * const params = await client.logistics.getShippingParameter(123456, 'ACCESS_TOKEN', '2401010001');
	 * ```
	 */
	async getShippingParameter(
		shopId: number,
		accessToken: string,
		orderSn: string,
		packageNumber?: string,
	): Promise<GetShippingParameterResponse> {
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
				apiType: "shop",
				shopId,
				accessToken,
			},
		);
	}

	/**
	 * Arranges shipment for an order/package.
	 *
	 * @example
	 * ```typescript
	 * // Pickup method
	 * await client.logistics.shipOrder(123456, 'ACCESS_TOKEN', {
	 *   orderSn: '2401010001',
	 *   pickup: {
	 *     addressId: 2826,
	 *     pickupTimeId: '1639472400'
	 *   }
	 * });
	 * ```
	 */
	async shipOrder(
		shopId: number,
		accessToken: string,
		options: ShipOrderOptions,
	): Promise<void> {
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
				(body.dropoff as Record<string, unknown>).branch_id =
					options.dropoff.branchId;
			}
			if (options.dropoff.senderRealName) {
				(body.dropoff as Record<string, unknown>).sender_real_name =
					options.dropoff.senderRealName;
			}
			if (options.dropoff.trackingNumber) {
				(body.dropoff as Record<string, unknown>).tracking_number =
					options.dropoff.trackingNumber;
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

		await this.httpClient.post(API_PATHS.SHIP_ORDER, body, {
			apiType: "shop",
			shopId,
			accessToken,
		});
	}

	/**
	 * Updates shipping info for pickup orders.
	 *
	 * @example
	 * ```typescript
	 * await client.logistics.updateShippingOrder(123456, 'ACCESS_TOKEN', {
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
		accessToken: string,
		options: {
			orderSn: string;
			packageNumber?: string;
			pickup?: {
				addressId: number;
				pickupTimeId: string;
			};
		},
	): Promise<void> {
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

		await this.httpClient.post(API_PATHS.UPDATE_SHIPPING_ORDER, body, {
			apiType: "shop",
			shopId,
			accessToken,
		});
	}

	/**
	 * Gets the tracking number for an order/package.
	 *
	 * @example
	 * ```typescript
	 * const tracking = await client.logistics.getTrackingNumber(123456, 'ACCESS_TOKEN', '2401010001');
	 * ```
	 */
	async getTrackingNumber(
		shopId: number,
		accessToken: string,
		orderSn: string,
		packageNumber?: string,
		responseOptionalFields?: string[],
	): Promise<GetTrackingNumberResponse> {
		const params: Record<string, unknown> = {
			order_sn: orderSn,
		};

		if (packageNumber) {
			params.package_number = packageNumber;
		}

		if (responseOptionalFields && responseOptionalFields.length > 0) {
			params.response_optional_fields = responseOptionalFields.join(",");
		}

		return this.httpClient.get<GetTrackingNumberResponse>(
			API_PATHS.GET_TRACKING_NUMBER,
			params,
			{
				apiType: "shop",
				shopId,
				accessToken,
			},
		);
	}

	/**
	 * Gets available logistics channels for a shop.
	 */
	async getChannelList(
		shopId: number,
		accessToken: string,
	): Promise<GetChannelListResponse> {
		return this.httpClient.get<GetChannelListResponse>(
			API_PATHS.GET_CHANNEL_LIST,
			undefined,
			{
				apiType: "shop",
				shopId,
				accessToken,
			},
		);
	}

	/**
	 * Gets shipping document parameters.
	 */
	async getShippingDocumentParameter(
		shopId: number,
		accessToken: string,
		orderList: Array<{ orderSn: string; packageNumber?: string }>,
	): Promise<GetShippingDocumentParameterResponse> {
		const body = {
			order_list: orderList.map((order) =>
				filterUndefined({
					order_sn: order.orderSn,
					package_number: order.packageNumber,
				}),
			),
		};

		return this.httpClient.post(
			API_PATHS.GET_SHIPPING_DOCUMENT_PARAMETER,
			body,
			{
				apiType: "shop",
				shopId,
				accessToken,
			},
		);
	}

	/**
	 * Creates a shipping document task.
	 */
	async createShippingDocument(
		shopId: number,
		accessToken: string,
		orderList: CreateShippingDocumentOptions[],
	): Promise<void> {
		const body = {
			order_list: orderList.map((order) =>
				filterUndefined({
					order_sn: order.orderSn,
					package_number: order.packageNumber,
					document_type: order.documentType,
				}),
			),
		};

		await this.httpClient.post(API_PATHS.CREATE_SHIPPING_DOCUMENT, body, {
			apiType: "shop",
			shopId,
			accessToken,
		});
	}

	/**
	 * Gets shipping document task result.
	 */
	async getShippingDocumentResult(
		shopId: number,
		accessToken: string,
		orderList: Array<{
			orderSn: string;
			packageNumber?: string;
			documentType?: ShippingDocumentType;
		}>,
	): Promise<GetShippingDocumentResultResponse> {
		const body = {
			order_list: orderList.map((order) =>
				filterUndefined({
					order_sn: order.orderSn,
					package_number: order.packageNumber,
					document_type: order.documentType,
				}),
			),
		};

		return this.httpClient.post<GetShippingDocumentResultResponse>(
			API_PATHS.GET_SHIPPING_DOCUMENT_RESULT,
			body,
			{
				apiType: "shop",
				shopId,
				accessToken,
			},
		);
	}

	/**
	 * Downloads the shipping document.
	 */
	async downloadShippingDocument(
		shopId: number,
		accessToken: string,
		orderList: Array<{
			orderSn: string;
			packageNumber?: string;
			documentType?: ShippingDocumentType;
		}>,
	): Promise<DownloadShippingDocumentResponse> {
		const body = {
			order_list: orderList.map((order) =>
				filterUndefined({
					order_sn: order.orderSn,
					package_number: order.packageNumber,
					document_type: order.documentType,
				}),
			),
		};

		return this.httpClient.post(API_PATHS.DOWNLOAD_SHIPPING_DOCUMENT, body, {
			apiType: "shop",
			shopId,
			accessToken,
		});
	}

	/**
	 * Gets shipping document data for self-printing.
	 */
	async getShippingDocumentDataInfo(
		shopId: number,
		accessToken: string,
		orderList: Array<{ orderSn: string; packageNumber?: string }>,
	): Promise<GetShippingDocumentDataInfoResponse> {
		const body = {
			order_list: orderList.map((order) =>
				filterUndefined({
					order_sn: order.orderSn,
					package_number: order.packageNumber,
				}),
			),
		};

		return this.httpClient.post(
			API_PATHS.GET_SHIPPING_DOCUMENT_DATA_INFO,
			body,
			{
				apiType: "shop",
				shopId,
				accessToken,
			},
		);
	}

	/**
	 * Gets tracking info for an order.
	 */
	async getTrackingInfo(
		shopId: number,
		accessToken: string,
		orderSn: string,
		packageNumber?: string,
	): Promise<GetTrackingInfoResponse> {
		const params: Record<string, unknown> = {
			order_sn: orderSn,
		};

		if (packageNumber) {
			params.package_number = packageNumber;
		}

		return this.httpClient.get(API_PATHS.GET_TRACKING_INFO, params, {
			apiType: "shop",
			shopId,
			accessToken,
		});
	}

	/**
	 * Batch get tracking numbers for multiple orders.
	 */
	async batchGetTrackingNumber(
		shopId: number,
		accessToken: string,
		orderList: Array<{ orderSn: string; packageNumber?: string }>,
	): Promise<GetMassTrackingNumberResponse> {
		const body = {
			order_list: orderList.map((order) =>
				filterUndefined({
					order_sn: order.orderSn,
					package_number: order.packageNumber,
				}),
			),
		};

		return this.httpClient.post(API_PATHS.GET_MASS_TRACKING_NUMBER, body, {
			apiType: "shop",
			shopId,
			accessToken,
		});
	}
}
