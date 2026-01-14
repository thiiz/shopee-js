/**
 * Token Manager for Shopee API
 *
 * Provides methods for token exchange and refresh.
 * This class is stateless; persist tokens in your own database.
 */

import type { HttpClient } from "../http/client.js";
import { API_PATHS } from "../http/endpoints.js";
import type {
	GetAccessTokenResponse,
	RefreshAccessTokenResponse,
} from "../types/index.js";

export class TokenManager {
	private httpClient: HttpClient;

	constructor(httpClient: HttpClient) {
		this.httpClient = httpClient;
	}

	/**
	 * Gets initial access token using authorization code.
	 * Call this after user completes OAuth flow.
	 *
	 * @returns The raw response from Shopee API. Persist these tokens in your database.
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

		return this.httpClient.post<GetAccessTokenResponse>(
			API_PATHS.GET_ACCESS_TOKEN,
			body,
			{ apiType: "public" },
		);
	}

	/**
	 * Refreshes access token for a shop.
	 *
	 * @returns The raw response from Shopee API. Update your database with the new tokens.
	 */
	async refreshShopToken(
		shopId: number,
		refreshToken: string,
	): Promise<RefreshAccessTokenResponse> {
		const body = {
			shop_id: shopId,
			refresh_token: refreshToken,
			partner_id: this.httpClient.getPartnerId(),
		};

		return this.httpClient.post<RefreshAccessTokenResponse>(
			API_PATHS.REFRESH_ACCESS_TOKEN,
			body,
			{ apiType: "public" },
		);
	}

	/**
	 * Refreshes access token for a merchant.
	 *
	 * @returns The raw response from Shopee API. Update your database with the new tokens.
	 */
	async refreshMerchantToken(
		merchantId: number,
		refreshToken: string,
	): Promise<RefreshAccessTokenResponse> {
		const body = {
			merchant_id: merchantId,
			refresh_token: refreshToken,
			partner_id: this.httpClient.getPartnerId(),
		};

		return this.httpClient.post<RefreshAccessTokenResponse>(
			API_PATHS.REFRESH_ACCESS_TOKEN,
			body,
			{ apiType: "public" },
		);
	}
}
