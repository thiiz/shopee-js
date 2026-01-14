/**
 * Shopee API Signature Generator
 *
 * Implements HMAC-SHA256 signature calculation as specified by Shopee Open Platform v2.
 *
 * @see https://open.shopee.com/documents/v2/v2.api_call.overview
 */

import type { ApiType } from "../types/index.js";

/**
 * Creates the base string for signature calculation based on API type.
 *
 * Base string formats:
 * - Shop API: partner_id + api_path + timestamp + access_token + shop_id
 * - Merchant API: partner_id + api_path + timestamp + access_token + merchant_id
 * - Public API: partner_id + api_path + timestamp
 */
export function createBaseString(params: {
	partnerId: number;
	path: string;
	timestamp: number;
	apiType: ApiType;
	accessToken?: string;
	shopId?: number;
	merchantId?: number;
}): string {
	const {
		partnerId,
		path,
		timestamp,
		apiType,
		accessToken,
		shopId,
		merchantId,
	} = params;

	switch (apiType) {
		case "shop":
			if (!accessToken || !shopId) {
				throw new Error("Shop API requires accessToken and shopId");
			}
			return `${partnerId}${path}${timestamp}${accessToken}${shopId}`;

		case "merchant":
			if (!accessToken || !merchantId) {
				throw new Error("Merchant API requires accessToken and merchantId");
			}
			return `${partnerId}${path}${timestamp}${accessToken}${merchantId}`;

		case "public":
			return `${partnerId}${path}${timestamp}`;

		default:
			throw new Error(`Unknown API type: ${apiType}`);
	}
}

/**
 * Calculates HMAC-SHA256 signature using Web Crypto API (available in Bun/Node.js).
 * Returns lowercase hex-encoded string.
 */
export async function calculateSignature(
	baseString: string,
	partnerKey: string,
): Promise<string> {
	const encoder = new TextEncoder();
	const keyData = encoder.encode(partnerKey);
	const messageData = encoder.encode(baseString);

	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		keyData,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);

	// Convert to hex string
	return Array.from(new Uint8Array(signature))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

/**
 * Generates signature for an API call.
 * Combines base string creation and HMAC-SHA256 calculation.
 */
export async function generateSignature(params: {
	partnerId: number;
	partnerKey: string;
	path: string;
	timestamp: number;
	apiType: ApiType;
	accessToken?: string;
	shopId?: number;
	merchantId?: number;
}): Promise<string> {
	const baseString = createBaseString({
		partnerId: params.partnerId,
		path: params.path,
		timestamp: params.timestamp,
		apiType: params.apiType,
		accessToken: params.accessToken,
		shopId: params.shopId,
		merchantId: params.merchantId,
	});

	return calculateSignature(baseString, params.partnerKey);
}

/**
 * Gets current Unix timestamp in seconds.
 */
export function getTimestamp(): number {
	return Math.floor(Date.now() / 1000);
}
