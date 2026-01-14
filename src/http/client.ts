/**
 * HTTP Request Client for Shopee API
 *
 * Handles all HTTP communication with automatic signing and error handling.
 */

import { generateSignature, getTimestamp } from "../auth/signature.js";
import type {
	ApiResponse,
	Environment,
	Region,
	RequestOptions,
	ShopeeConfig,
} from "../types/index.js";
import { ShopeeApiError } from "../types/index.js";
import { getApiHost } from "./endpoints.js";

/**
 * HTTP Client for making requests to Shopee API
 */
export class HttpClient {
	private partnerId: number;
	private partnerKey: string;
	private environment: Environment;
	private region: Region;
	private timeout: number;
	private debug: boolean;
	private baseUrl: string;

	constructor(config: ShopeeConfig) {
		this.partnerId = config.partnerId;
		this.partnerKey = config.partnerKey;
		this.environment = config.environment ?? "sandbox";
		this.region = config.region ?? "sg";
		this.timeout = config.timeout ?? 30000;
		this.debug = config.debug ?? false;
		this.baseUrl = config.baseUrl ?? getApiHost(this.environment, this.region);
	}

	/**
	 * Makes a request to the Shopee API with automatic signing.
	 */
	async request<T>(options: RequestOptions): Promise<T> {
		const {
			method,
			path,
			params,
			body,
			apiType,
			shopId,
			merchantId,
			accessToken,
		} = options;
		const timestamp = getTimestamp();

		// Generate signature
		const sign = await generateSignature({
			partnerId: this.partnerId,
			partnerKey: this.partnerKey,
			path,
			timestamp,
			apiType,
			accessToken,
			shopId,
			merchantId,
		});

		// Build query parameters
		const queryParams = new URLSearchParams();
		queryParams.set("partner_id", String(this.partnerId));
		queryParams.set("timestamp", String(timestamp));
		queryParams.set("sign", sign);

		if (accessToken) {
			queryParams.set("access_token", accessToken);
		}
		if (shopId) {
			queryParams.set("shop_id", String(shopId));
		}
		if (merchantId) {
			queryParams.set("merchant_id", String(merchantId));
		}

		// Add additional query params for GET requests
		if (method === "GET" && params) {
			for (const [key, value] of Object.entries(params)) {
				if (value !== undefined && value !== null) {
					if (Array.isArray(value)) {
						queryParams.set(key, value.join(","));
					} else {
						queryParams.set(key, String(value));
					}
				}
			}
		}

		const url = `${this.baseUrl}${path}?${queryParams.toString()}`;

		if (this.debug) {
			console.log(`[Shopee SDK] ${method} ${url}`);
			if (body) {
				console.log("[Shopee SDK] Body:", JSON.stringify(body, null, 2));
			}
		}

		// Build request options
		const fetchOptions: RequestInit = {
			method,
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			signal: AbortSignal.timeout(this.timeout),
		};

		if (method === "POST" && body) {
			fetchOptions.body = JSON.stringify(body);
		}

		// Make request
		let response: Response;
		try {
			response = await fetch(url, fetchOptions);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			throw new Error(`[Shopee SDK] Network error: ${message}`);
		}

		let data: ApiResponse<T>;
		try {
			const text = await response.text();
			data = JSON.parse(text) as ApiResponse<T>;
		} catch (error) {
			throw new Error(
				`[Shopee SDK] Failed to parse response as JSON: ${response.status} ${response.statusText}`,
			);
		}

		if (this.debug) {
			console.log("[Shopee SDK] Response:", JSON.stringify(data, null, 2));
		}

		// Check for API errors (Shopee v2 returns error details in the body)
		if (data.error && data.error !== "") {
			throw new ShopeeApiError(
				data.message || data.error,
				data.request_id,
				data.error,
				data.message,
				data,
			);
		}

		// If HTTP status is not OK and no Shopee error was found in body
		if (!response.ok) {
			throw new Error(
				`[Shopee SDK] HTTP Error: ${response.status} ${response.statusText}`,
			);
		}

		// Business APIs return data inside 'response' field.
		// Auth and some Public APIs return data at root level.
		if (data.response !== undefined && data.response !== null) {
			return data.response as T;
		}

		// Return the whole object if 'response' field is missing (common for Auth APIs)
		return data as unknown as T;
	}

	/**
	 * Makes a GET request.
	 */
	async get<T>(
		path: string,
		params: Record<string, unknown> | undefined,
		options: Omit<RequestOptions, "method" | "path" | "params" | "body">,
	): Promise<T> {
		return this.request<T>({
			method: "GET",
			path,
			params,
			...options,
		});
	}

	/**
	 * Makes a POST request.
	 */
	async post<T>(
		path: string,
		body: Record<string, unknown> | undefined,
		options: Omit<RequestOptions, "method" | "path" | "params" | "body">,
	): Promise<T> {
		return this.request<T>({
			method: "POST",
			path,
			body,
			...options,
		});
	}

	/**
	 * Gets the base URL for the current configuration.
	 */
	getBaseUrl(): string {
		return this.baseUrl;
	}

	/**
	 * Gets the partner ID.
	 */
	getPartnerId(): number {
		return this.partnerId;
	}

	/**
	 * Gets the partner key.
	 */
	getPartnerKey(): string {
		return this.partnerKey;
	}

	getEnvironment(): Environment {
		return this.environment;
	}

	getRegion(): Region {
		return this.region;
	}
}
