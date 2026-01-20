/**
 * API Endpoint URLs for Shopee Open Platform
 */

import type { Environment, Region } from "../types/index.js";

/**
 * Production API hosts by region
 */
const PRODUCTION_HOSTS: Record<Region, string> = {
	sg: "https://partner.shopeemobile.com",
	cn: "https://openplatform.shopee.cn",
	br: "https://partner.shopeemobile.com",
};

/**
 * Sandbox API hosts by region
 */
const SANDBOX_HOSTS: Record<"global" | "cn", string> = {
	global: "https://openplatform.sandbox.test-stable.shopee.sg",
	cn: "https://openplatform.sandbox.test-stable.shopee.cn",
};

/**
 * Gets the API host URL based on environment and region.
 */
export function getApiHost(environment: Environment, region: Region): string {
	if (environment === "sandbox") {
		return region === "cn" ? SANDBOX_HOSTS.cn : SANDBOX_HOSTS.global;
	}
	return PRODUCTION_HOSTS[region];
}

/**
 * API Paths
 */
export const API_PATHS = {
	// Auth
	AUTH_PARTNER: "/api/v2/shop/auth_partner",
	GET_ACCESS_TOKEN: "/api/v2/auth/token/get",
	REFRESH_ACCESS_TOKEN: "/api/v2/auth/access_token/get",

	// Shop
	GET_SHOP_INFO: "/api/v2/shop/get_shop_info",
	UPDATE_SHOP_PROFILE: "/api/v2/shop/update_profile",

	// Product
	GET_CATEGORY: "/api/v2/product/get_category",
	GET_ATTRIBUTES: "/api/v2/product/get_attributes",
	GET_ITEM_LIST: "/api/v2/product/get_item_list",
	GET_ITEM_BASE_INFO: "/api/v2/product/get_item_base_info",
	ADD_ITEM: "/api/v2/product/add_item",
	UPDATE_ITEM: "/api/v2/product/update_item",
	DELETE_ITEM: "/api/v2/product/delete_item",

	// Order
	GET_ORDER_LIST: "/api/v2/order/get_order_list",
	GET_ORDER_DETAIL: "/api/v2/order/get_order_detail",
	GET_SHIPMENT_LIST: "/api/v2/order/get_shipment_list",
	SPLIT_ORDER: "/api/v2/order/split_order",
	UNSPLIT_ORDER: "/api/v2/order/unsplit_order",
	CANCEL_ORDER: "/api/v2/order/cancel_order",
	HANDLE_BUYER_CANCELLATION: "/api/v2/order/handle_buyer_cancellation",
	SEARCH_PACKAGE_LIST: "/api/v2/order/search_package_list",
	GET_PACKAGE_DETAIL: "/api/v2/order/get_package_detail",

	// Logistics
	GET_SHIPPING_PARAMETER: "/api/v2/logistics/get_shipping_parameter",
	GET_TRACKING_NUMBER: "/api/v2/logistics/get_tracking_number",
	GET_MASS_TRACKING_NUMBER: "/api/v2/logistics/get_mass_tracking_number",
	SHIP_ORDER: "/api/v2/logistics/ship_order",
	UPDATE_SHIPPING_ORDER: "/api/v2/logistics/update_shipping_order",
	GET_CHANNEL_LIST: "/api/v2/logistics/get_channel_list",
	GET_TRACKING_INFO: "/api/v2/logistics/get_tracking_info",
	GET_SHIPPING_DOCUMENT_PARAMETER:
		"/api/v2/logistics/get_shipping_document_parameter",
	CREATE_SHIPPING_DOCUMENT: "/api/v2/logistics/create_shipping_document",
	GET_SHIPPING_DOCUMENT_RESULT:
		"/api/v2/logistics/get_shipping_document_result",
	DOWNLOAD_SHIPPING_DOCUMENT: "/api/v2/logistics/download_shipping_document",
	GET_SHIPPING_DOCUMENT_DATA_INFO:
		"/api/v2/logistics/get_shipping_document_data_info",

	// Public
	GET_SHOPS_BY_PARTNER: "/api/v2/public/get_shops_by_partner",
	GET_MERCHANTS_BY_PARTNER: "/api/v2/public/get_merchant_by_partner",
	GET_TOKEN_BY_RESEND_CODE: "/api/v2/public/get_token_by_resend_code",

	// Payment
	GET_ESCROW_DETAIL: "/api/v2/payment/get_escrow_detail",
	GET_PAYOUT_DETAIL: "/api/v2/payment/get_payout_detail",
	GET_WALLET_TRANSACTIONS: "/api/v2/payment/get_wallet_transactions",

	// Media
	UPLOAD_IMAGE: "/api/v2/media_space/upload_image",
	UPLOAD_VIDEO: "/api/v2/media_space/upload_video",

	// Marketing (Ads)
	GET_AD_LIST: "/api/v2/ads/get_ad_list",
	GET_SHOP_ADS_DAILY_REPORT: "/api/v2/ads/get_shop_ads_daily_report",
	MUTATE_ADS: "/api/v2/ads/mutate_ads",
} as const;
