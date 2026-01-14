/**
 * Shop Module
 *
 * Provides access to shop-related APIs.
 */

import type { HttpClient } from "../http/client.js";
import { API_PATHS } from "../http/endpoints.js";
import type { GetShopInfoResponse } from "../types/index.js";

/**
 * Shop module for accessing shop information and settings.
 */
export class ShopModule {
	private httpClient: HttpClient;
	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

	/**
	 * Gets shop information.
	 *
	 * @example
	 * ```typescript
	 * const shopInfo = await client.shop.getShopInfo(123456, 'ACCESS_TOKEN');
	 * console.log(shopInfo.shop_name, shopInfo.region);
	 * ```
	 */
	async getShopInfo(
		shopId: number,
		accessToken: string,
	): Promise<GetShopInfoResponse> {
		return this.httpClient.get<GetShopInfoResponse>(
			API_PATHS.GET_SHOP_INFO,
			undefined,
			{
				apiType: "shop",
				shopId,
				accessToken,
			},
		);
	}

	/**
	 * Updates shop profile information.
	 *
	 * @example
	 * ```typescript
	 * await client.shop.updateProfile(123456, 'ACCESS_TOKEN', {
	 *   shopName: 'My Awesome Shop',
	 *   description: 'Welcome to my shop!'
	 * });
	 * ```
	 */
	async updateProfile(
		shopId: number,
		accessToken: string,
		params: {
			shopName?: string;
			shopLogo?: string;
			description?: string;
		},
	): Promise<void> {
		const body: Record<string, unknown> = {};
		if (params.shopName) body.shop_name = params.shopName;
		if (params.shopLogo) body.shop_logo = params.shopLogo;
		if (params.description) body.description = params.description;

		await this.httpClient.post(API_PATHS.UPDATE_SHOP_PROFILE, body, {
			apiType: "shop",
			shopId,
			accessToken,
		});
	}
}
