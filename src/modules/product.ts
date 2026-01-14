/**
 * Product Module
 *
 * Provides access to product-related APIs.
 */

import type { HttpClient } from "../http/client.js";
import { API_PATHS } from "../http/endpoints.js";
import type {
	CategoryInfo,
	GetCategoryResponse,
	GetItemBaseInfoResponse,
	Item,
	ItemBaseInfoRaw,
	ItemStatusFilter,
} from "../types/index.js";

export interface GetCategoryOptions {
	/** Language for category names */
	language?: string;
}

export interface ItemListOptions {
	/** Filter by item status. Multiple statuses can be passed as an array. */
	itemStatus: ItemStatusFilter[];
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
 * Normalizes a raw item from Shopee API (snake_case) to camelCase.
 */
function normalizeItem(raw: ItemBaseInfoRaw): Item {
	return {
		itemId: raw.item_id,
		categoryId: raw.category_id,
		itemName: raw.item_name,
		description: raw.description,
		itemSku: raw.item_sku,
		createTime: raw.create_time,
		updateTime: raw.update_time,
		attributeList: raw.attribute_list,
		priceInfo: raw.price_info,
		stockInfo: raw.stock_info,
		image: raw.image,
		weight: raw.weight,
		dimension: {
			packageLength: raw.dimension.package_length,
			packageWidth: raw.dimension.package_width,
			packageHeight: raw.dimension.package_height,
		},
		logisticInfo: raw.logistic_info,
		preOrder: {
			isPreOrder: raw.pre_order.is_pre_order,
			daysToShip: raw.pre_order.days_to_ship,
		},
		condition: raw.condition,
		itemStatus: raw.item_status,
		hasModel: raw.has_model,
		promotionId: raw.promotion_id,
		brand: raw.brand
			? {
					brandId: raw.brand.brand_id,
					originalBrandName: raw.brand.original_brand_name,
				}
			: undefined,
		taxInfo: raw.tax_info
			? {
					ncm: raw.tax_info.ncm,
					sameStateCfop: raw.tax_info.same_state_cfop,
					outStateCfop: raw.tax_info.out_state_cfop,
					origin: raw.tax_info.origin,
					cest: raw.tax_info.cest,
					taxCode: raw.tax_info.tax_code,
					hsCode: raw.tax_info.hs_code,
				}
			: undefined,
		complaintPolicy: raw.complaint_policy
			? {
					warrantyTime: raw.complaint_policy.warranty_time,
					excludeEntrepreneurWarranty:
						raw.complaint_policy.exclude_entrepreneur_warranty,
					complaintAddressId: raw.complaint_policy.complaint_address_id,
					additionalInformation: raw.complaint_policy.additional_information,
				}
			: undefined,
	};
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
		options?: GetCategoryOptions,
	): Promise<CategoryInfo[]> {
		const params: Record<string, unknown> = {};
		if (options?.language) {
			params.language = options.language;
		}

		const response = await this.httpClient.get<GetCategoryResponse>(
			API_PATHS.GET_CATEGORY,
			Object.keys(params).length > 0 ? params : undefined,
			{
				apiType: "shop",
				shopId,
				accessToken,
			},
		);

		return response.category_list;
	}

	/**
	 * Gets a list of items/products for a shop (IDs and status only).
	 *
	 * **Note:** This returns only basic info (IDs, status, update time).
	 * Use `getItems()` or `getItemBaseInfo()` to fetch full details.
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
	async listItems(
		shopId: number,
		accessToken: string,
		options: ItemListOptions,
	): Promise<ItemListResult> {
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
		}>(API_PATHS.GET_ITEM_LIST, params, {
			apiType: "shop",
			shopId,
			accessToken,
		});

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
	 * Gets basic information for specific items (raw API response).
	 *
	 * **Note:** Returns snake_case fields as-is from Shopee API.
	 * Use `getItems()` for normalized camelCase output.
	 *
	 * @deprecated Use `getItems()` for normalized camelCase output.
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
		},
	): Promise<ItemBaseInfoRaw[]> {
		const params: Record<string, unknown> = {
			item_id_list: options.itemIdList.join(","),
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
				apiType: "shop",
				shopId,
				accessToken,
			},
		);

		return response.item_list;
	}

	/**
	 * Gets detailed information for specific items (normalized camelCase).
	 *
	 * This is the recommended method for fetching item details.
	 *
	 * @example
	 * ```typescript
	 * const items = await client.product.getItems(123456, 'ACCESS_TOKEN', {
	 *   itemIdList: [100001, 100002]
	 * });
	 * console.log(items[0].itemName, items[0].itemId);
	 * ```
	 */
	async getItems(
		shopId: number,
		accessToken: string,
		options: {
			itemIdList: number[];
			needTaxInfo?: boolean;
			needComplaintPolicy?: boolean;
		},
	): Promise<Item[]> {
		const rawItems = await this.getItemBaseInfo(shopId, accessToken, options);
		return rawItems.map(normalizeItem);
	}

	/**
	 * Iterates through all items in a shop (IDs only).
	 * Handles pagination automatically.
	 *
	 * **Note:** This yields only basic info (IDs, status, update time).
	 * Use `iterateItemsWithDetails()` to get full item details.
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
		options: Omit<ItemListOptions, "offset">,
	): AsyncGenerator<{
		itemId: number;
		itemStatus: string;
		updateTime: number;
	}> {
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

	/**
	 * Iterates through all items with full details (all-in-one).
	 * Handles pagination and fetching details automatically.
	 *
	 * This method combines `listItems()` + `getItems()` into a single flow,
	 * fetching details in batches for efficiency.
	 *
	 * @param batchSize - Number of items to fetch details for at once (max 50, default 50)
	 *
	 * @example
	 * ```typescript
	 * for await (const item of client.product.iterateItemsWithDetails(123456, 'ACCESS_TOKEN', {
	 *   itemStatus: ['NORMAL']
	 * })) {
	 *   console.log(item.itemId, item.itemName, item.image);
	 * }
	 * ```
	 */
	async *iterateItemsWithDetails(
		shopId: number,
		accessToken: string,
		options: Omit<ItemListOptions, "offset"> & {
			batchSize?: number;
			needTaxInfo?: boolean;
			needComplaintPolicy?: boolean;
		},
	): AsyncGenerator<Item> {
		const batchSize = Math.min(options.batchSize ?? 50, 50);
		let itemIdBatch: number[] = [];

		for await (const item of this.iterateItems(shopId, accessToken, options)) {
			itemIdBatch.push(item.itemId);

			if (itemIdBatch.length >= batchSize) {
				const detailedItems = await this.getItems(shopId, accessToken, {
					itemIdList: itemIdBatch,
					needTaxInfo: options.needTaxInfo,
					needComplaintPolicy: options.needComplaintPolicy,
				});
				for (const detailedItem of detailedItems) {
					yield detailedItem;
				}
				itemIdBatch = [];
			}
		}

		// Yield remaining items
		if (itemIdBatch.length > 0) {
			const detailedItems = await this.getItems(shopId, accessToken, {
				itemIdList: itemIdBatch,
				needTaxInfo: options.needTaxInfo,
				needComplaintPolicy: options.needComplaintPolicy,
			});
			for (const detailedItem of detailedItems) {
				yield detailedItem;
			}
		}
	}
}
