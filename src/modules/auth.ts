/**
 * Auth Module
 *
 * Handles authorization flow including generating auth links and token management.
 */

import { generateSignature, getTimestamp } from "../auth/signature.js";
import type { TokenManager } from "../auth/token-manager.js";
import type { HttpClient } from "../http/client.js";
import { API_PATHS, getApiHost } from "../http/endpoints.js";
import type { GetAccessTokenResponse } from "../types/index.js";

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
			apiType: "public",
		});

		const params = new URLSearchParams({
			partner_id: String(this.httpClient.getPartnerId()),
			timestamp: String(timestamp),
			sign,
			redirect: options.redirectUrl,
		});

		const baseUrl = getApiHost(
			this.httpClient.getEnvironment(),
			this.httpClient.getRegion(),
		);
		return `${baseUrl}${path}?${params.toString()}`;
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
	 *
	 * @param shopId - The shop ID
	 * @param refreshToken - The current refresh token from your database
	 */
	async refreshShopToken(
		shopId: number,
		refreshToken: string,
	): Promise<GetAccessTokenResponse> {
		return this.tokenManager.refreshShopToken(shopId, refreshToken);
	}

	/**
	 * Refreshes the access token for a merchant.
	 *
	 * @param merchantId - The merchant ID
	 * @param refreshToken - The current refresh token from your database
	 */
	async refreshMerchantToken(
		merchantId: number,
		refreshToken: string,
	): Promise<GetAccessTokenResponse> {
		return this.tokenManager.refreshMerchantToken(merchantId, refreshToken);
	}
}
