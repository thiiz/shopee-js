/**
 * Shopee SDK Types
 * 
 * Complete type definitions based on Shopee Open Platform API v2 documentation.
 */

// ============================================
// Core Types
// ============================================

/**
 * Shopee API environment
 */
export type Environment = 'production' | 'sandbox';

/**
 * Available regions for Shopee API
 */
export type Region = 'sg' | 'cn' | 'br';

/**
 * API type determines the signature base string format
 */
export type ApiType = 'shop' | 'merchant' | 'public';

/**
 * SDK configuration options
 */
export interface ShopeeConfig {
  /** Partner ID from Shopee Open Platform */
  partnerId: number;
  /** Partner Key (secret) from Shopee Open Platform */
  partnerKey: string;
  /** API environment - 'production' or 'sandbox' */
  environment?: Environment;
  /** Region for production API calls - 'sg', 'cn', or 'br' */
  region?: Region;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Custom base URL (useful for proxying requests) */
  baseUrl?: string;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Token storage interface
 */
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expireIn: number;
  expiresAt: number;
}

/**
 * Shop-level token storage
 */
export interface ShopTokenData extends TokenData {
  shopId: number;
}

/**
 * Merchant-level token storage
 */
export interface MerchantTokenData extends TokenData {
  merchantId: number;
}

/**
 * Base API response
 */
export interface ApiResponse<T = unknown> {
  request_id: string;
  error: string;
  message: string;
  warning?: string;
  response?: T;
}

/**
 * Shopee API Error
 */
export class ShopeeApiError extends Error {
  public readonly requestId: string;
  public readonly errorCode: string;
  public readonly details: string;
  public readonly response?: unknown;

  constructor(
    message: string,
    requestId: string,
    errorCode: string,
    details: string,
    response?: unknown
  ) {
    super(message);
    this.name = 'ShopeeApiError';
    this.requestId = requestId;
    this.errorCode = errorCode;
    this.details = details;
    this.response = response;
  }
}

/**
 * HTTP request options
 */
export interface RequestOptions {
  method: 'GET' | 'POST';
  path: string;
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
  apiType: ApiType;
  shopId?: number;
  merchantId?: number;
  accessToken?: string;
}

/**
 * Common parameters for all API calls
 */
export interface CommonParams {
  partner_id: number;
  timestamp: number;
  sign: string;
  access_token?: string;
  shop_id?: number;
  merchant_id?: number;
}

// ============================================
// Auth Types
// ============================================

export interface AuthLinkOptions {
  redirectUrl: string;
}

export interface GetAccessTokenParams {
  code: string;
  shopId?: number;
  mainAccountId?: number;
}

export interface GetAccessTokenResponse {
  access_token: string;
  refresh_token: string;
  expire_in: number;
  shop_id_list?: number[];
  merchant_id_list?: number[];
}

export interface RefreshAccessTokenParams {
  shopId?: number;
  merchantId?: number;
}

export interface RefreshAccessTokenResponse {
  access_token: string;
  refresh_token: string;
  expire_in: number;
  shop_id?: number;
  merchant_id?: number;
  partner_id: number;
}

// ============================================
// Shop Types
// ============================================

export interface ShopInfo {
  shop_id: number;
  shop_name: string;
  region: string;
  status: string;
  is_cb: boolean;
  is_cnsc: boolean;
}

export interface GetShopInfoResponse {
  shop_name: string;
  region: string;
  status: string;
  is_cb: boolean;
  is_cnsc: boolean;
  shop_id: number;
  auth_time: number;
  expire_time: number;
}

// ============================================
// Product Types
// ============================================

export interface CategoryInfo {
  category_id: number;
  parent_category_id: number;
  original_category_name: string;
  display_category_name: string;
  has_children: boolean;
}

export interface GetCategoryResponse {
  category_list: CategoryInfo[];
}

/**
 * Item/Product status
 */
export type ItemStatus = 
  | 'NORMAL'
  | 'BANNED'
  | 'UNLIST'
  | 'REVIEWING'
  | 'SELLER_DELETE'
  | 'SHOPEE_DELETE';

/**
 * Item attribute information
 */
export interface ItemAttribute {
  attribute_id: number;
  original_attribute_name: string;
  is_mandatory: boolean;
  attribute_value_list: Array<{
    value_id: number;
    original_value_name: string;
    value_unit: string;
  }>;
}

/**
 * Item price information
 */
export interface ItemPriceInfo {
  currency: string;
  original_price: number;
  current_price: number;
  init_price?: number;
}

/**
 * Item stock information
 */
export interface ItemStockInfo {
  stock_type: number;
  current_stock: number;
  normal_stock: number;
  reserved_stock?: number;
}

/**
 * Item logistic information
 */
export interface ItemLogisticInfo {
  logistic_id: number;
  logistic_name: string;
  enabled: boolean;
  shipping_fee?: number;
  is_free_shipping?: boolean;
}

/**
 * Item image information
 */
export interface ItemImage {
  image_id_list?: string[];
  image_url_list?: string[];
}

/**
 * Item video information
 */
export interface ItemVideoInfo {
  video_url: string;
  thumbnail_url: string;
  duration: number;
}

/**
 * Basic information for an item
 */
export interface ItemBaseInfo {
  item_id: number;
  category_id: number;
  item_name: string;
  description: string;
  item_sku: string;
  create_time: number;
  update_time: number;
  attribute_list?: ItemAttribute[];
  price_info?: ItemPriceInfo[];
  stock_info?: ItemStockInfo[];
  image: ItemImage;
  weight: string;
  dimension: {
    package_length: number;
    package_width: number;
    package_height: number;
  };
  logistic_info: ItemLogisticInfo[];
  pre_order: {
    is_pre_order: boolean;
    days_to_ship: number;
  };
  condition: string;
  item_status: ItemStatus;
  has_model: boolean;
  promotion_id: number;
  brand?: {
    brand_id: number;
    original_brand_name: string;
  };
  tax_info?: any;
  complaint_policy?: any;
}

/**
 * Response for get_item_base_info
 */
export interface GetItemBaseInfoResponse {
  item_list: ItemBaseInfo[];
}

// ============================================
// Order Types
// ============================================

/**
 * Order status - Full list from API documentation
 */
export type OrderStatus = 
  | 'UNPAID'           // Order is created, buyer has not paid yet
  | 'READY_TO_SHIP'    // Seller can arrange shipment
  | 'PROCESSED'        // Seller has arranged shipment online and got tracking number from 3PL
  | 'RETRY_SHIP'       // 3PL pickup parcel fail. Need to re arrange shipment
  | 'SHIPPED'          // The parcel has been drop to 3PL or picked up by 3PL
  | 'TO_CONFIRM_RECEIVE' // The order has been received by buyer
  | 'IN_CANCEL'        // The order's cancellation is under processing
  | 'CANCELLED'        // The order has been canceled
  | 'TO_RETURN'        // The buyer requested to return the order
  | 'COMPLETED'        // The order has been completed
  | 'INVOICE_PENDING'; // Invoice pending (for specific regions)

export type TimeRangeField = 'create_time' | 'update_time';

/**
 * Package status for shipment
 */
export type PackageStatus = 0 | 1 | 2 | 3; // All, Pending, ToProcess, Processed

/**
 * Package fulfillment/logistics status
 */
export type LogisticsStatus =
  | 'LOGISTICS_NOT_START'       // Initial status, package not ready for fulfillment
  | 'LOGISTICS_PENDING_ARRANGE' // Order logistics pending arrangement (legacy)
  | 'LOGISTICS_COD_REJECTED'    // Integrated logistics COD: Order rejected for COD (legacy)
  | 'LOGISTICS_READY'           // Package ready for fulfillment
  | 'LOGISTICS_REQUEST_CREATED' // Package arranged shipment
  | 'LOGISTICS_PICKUP_DONE'     // Package handed over to 3PL
  | 'LOGISTICS_DELIVERY_DONE'   // Package successfully delivered
  | 'LOGISTICS_INVALID'         // Order cancelled when package at LOGISTICS_READY
  | 'LOGISTICS_REQUEST_CANCELED'// Order cancelled when package at LOGISTICS_REQUEST_CREATED
  | 'LOGISTICS_PICKUP_FAILED'   // Order cancelled by 3PL due to failed pickup
  | 'LOGISTICS_PICKUP_RETRY'    // Package pending 3PL retry pickup
  | 'LOGISTICS_DELIVERY_FAILED' // Order cancelled due to 3PL delivery failed
  | 'LOGISTICS_LOST';           // Order cancelled due to 3PL lost the Package

/**
 * Order cancellation reasons (seller)
 */
export type OrderCancelReason = 'OUT_OF_STOCK' | 'UNDELIVERABLE_AREA';

export interface GetOrderListParams {
  time_range_field: TimeRangeField;
  time_from: number;
  time_to: number;
  page_size: number;
  cursor?: string;
  order_status?: OrderStatus;
  response_optional_fields?: string;
}

export interface OrderListItem {
  order_sn: string;
  order_status: OrderStatus;
}

export interface GetOrderListResponse {
  more: boolean;
  next_cursor: string;
  order_list: OrderListItem[];
}

export interface GetOrderDetailParams {
  order_sn_list: string[];
  response_optional_fields?: string[];
}

export interface OrderItem {
  item_id: number;
  item_name: string;
  item_sku: string;
  model_id: number;
  model_name: string;
  model_sku: string;
  model_quantity_purchased: number;
  model_original_price: number;
  model_discounted_price: number;
  wholesale: boolean;
  weight: number;
  add_on_deal: boolean;
  main_item: boolean;
  add_on_deal_id: number;
  promotion_type: string;
  promotion_id: number;
  order_item_id: number;
  promotion_group_id: number;
  image_info: {
    image_url: string;
  };
}

export interface RecipientAddress {
  name: string;
  phone: string;
  town: string;
  district: string;
  city: string;
  state: string;
  region: string;
  zipcode: string;
  full_address: string;
}

export interface OrderDetail {
  order_sn: string;
  order_status: OrderStatus;
  region: string;
  currency: string;
  cod: boolean;
  total_amount: number;
  shipping_carrier: string;
  payment_method: string;
  estimated_shipping_fee: number;
  message_to_seller: string;
  create_time: number;
  update_time: number;
  days_to_ship: number;
  ship_by_date: number;
  buyer_user_id: number;
  buyer_username: string;
  recipient_address: RecipientAddress;
  actual_shipping_fee: number;
  goods_to_declare: boolean;
  note: string;
  note_update_time: number;
  item_list: OrderItem[];
  pay_time: number;
  dropshipper: string;
  dropshipper_phone: string;
  split_up: boolean;
  buyer_cancel_reason: string;
  cancel_by: string;
  cancel_reason: string;
  actual_shipping_fee_confirmed: boolean;
  buyer_cpf_id: string;
  fulfillment_flag: string;
  pickup_done_time: number;
  package_list: PackageInfo[];
  invoice_data: InvoiceData;
  checkout_shipping_carrier: string;
  reverse_shipping_fee: number;
  order_chargeable_weight_gram: number;
}

export interface PackageInfo {
  package_number: string;
  logistics_status: LogisticsStatus;
  shipping_carrier: string;
  item_list: PackageItem[];
}

export interface PackageItem {
  item_id: number;
  model_id: number;
  order_item_id: number;
  promotion_group_id: number;
}

export interface InvoiceData {
  number: string;
  series_number: string;
  access_key: string;
  issue_date: number;
  total_value: number;
  products_total_value: number;
  tax_code: string;
}

export interface GetOrderDetailResponse {
  order_list: OrderDetail[];
}

// ============================================
// Package Types
// ============================================

export interface SearchPackageListParams {
  package_status: PackageStatus;
  page_size: number;
  cursor?: string;
  sort_by?: 'create_time';
  sort_direction?: 'ASC' | 'DESC';
  create_time_from?: number;
  create_time_to?: number;
}

export interface PackageListItem {
  order_sn: string;
  package_number: string;
  logistics_status: LogisticsStatus;
  shipping_carrier: string;
  channel_id: number;
}

export interface SearchPackageListResponse {
  more: boolean;
  next_cursor: string;
  package_list: PackageListItem[];
}

export interface SplitOrderParams {
  order_sn: string;
  package_list: Array<{
    item_list: Array<{
      item_id: number;
      model_id: number;
      order_item_id: number;
      promotion_group_id: number;
    }>;
  }>;
}

export interface HandleBuyerCancellationParams {
  order_sn: string;
  operation: 'ACCEPT' | 'REJECT';
}

// ============================================
// Logistics Types
// ============================================

export type ShippingMethod = 'pickup' | 'dropoff' | 'non_integrated';

export interface ShippingParameter {
  info_needed: {
    pickup?: string[];
    dropoff?: string[];
    non_integrated?: string[];
  };
  pickup?: {
    address_list: PickupAddress[];
  };
  dropoff?: {
    branch_list: DropoffBranch[] | null;
  };
}

export interface PickupAddress {
  address_id: number;
  region: string;
  state: string;
  city: string;
  district: string;
  town: string;
  address: string;
  zipcode: string;
  address_flag: string[];
  time_slot_list: TimeSlot[];
}

export interface TimeSlot {
  date: number;
  pickup_time_id: string;
}

export interface DropoffBranch {
  branch_id: number;
  region: string;
  state: string;
  city: string;
  address: string;
  zipcode: string;
  geo_location: string;
}

export interface GetShippingParameterResponse {
  info_needed: {
    pickup?: string[];
    dropoff?: string[];
    non_integrated?: string[];
  };
  pickup?: {
    address_list: PickupAddress[];
  };
  dropoff?: {
    branch_list: DropoffBranch[] | null;
  };
}

export interface ShipOrderParams {
  order_sn: string;
  package_number?: string;
  pickup?: {
    address_id: number;
    pickup_time_id: string;
  };
  dropoff?: {
    branch_id?: number;
    sender_real_name?: string;
    tracking_number?: string;
    slug?: string;
  };
  non_integrated?: {
    tracking_number: string;
  };
}

export interface GetTrackingNumberResponse {
  tracking_number: string;
  plp_number?: string;
  first_mile_tracking_number?: string;
  last_mile_tracking_number?: string;
  hint?: string;
}

export interface LogisticsChannel {
  logistics_channel_id: number;
  logistics_channel_name: string;
  cod_enabled: boolean;
  enabled: boolean;
  fee_type: string;
  size_list: SizeInfo[];
  weight_limit: WeightLimit;
  item_max_dimension: ItemDimension;
  volume_limit: VolumeLimit;
  logistics_description: string;
  force_enable: boolean;
  mask_channel_id: number;
  preferred: boolean;
}

export interface SizeInfo {
  size_id: string;
  name: string;
  default_price: number;
}

export interface WeightLimit {
  item_max_weight: number;
  item_min_weight: number;
}

export interface ItemDimension {
  item_max_height: number;
  item_max_width: number;
  item_max_length: number;
}

export interface VolumeLimit {
  item_max_volume: number;
  item_min_volume: number;
}

export interface GetChannelListResponse {
  logistics_channel_list: LogisticsChannel[];
}

/**
 * Shipping document types
 */
export type ShippingDocumentType =
  | 'NORMAL_AIR_WAYBILL'
  | 'THERMAL_AIR_WAYBILL'
  | 'NORMAL_JOB_AIR_WAYBILL'
  | 'THERMAL_JOB_AIR_WAYBILL';

export interface ShippingDocumentInfo {
  order_sn: string;
  package_number?: string;
  document_type: ShippingDocumentType;
}

export interface CreateShippingDocumentParams {
  order_list: ShippingDocumentInfo[];
}

export interface ShippingDocumentResult {
  order_sn: string;
  package_number?: string;
  status: 'READY' | 'PROCESSING' | 'FAILED';
  fail_error?: string;
  fail_message?: string;
}

export interface GetShippingDocumentResultResponse {
  result_list: ShippingDocumentResult[];
  warning: string[];
}

/**
 * Tracking logistics status (for get_tracking_info API)
 */
export type TrackingLogisticsStatus =
  | 'INITIAL'
  | 'ORDER_INIT'
  | 'ORDER_SUBMITTED'
  | 'ORDER_FINALIZED'
  | 'ORDER_CREATED'
  | 'PICKUP_REQUESTED'
  | 'PICKUP_PENDING'
  | 'PICKED_UP'
  | 'DELIVERY_PENDING'
  | 'DELIVERED'
  | 'PICKUP_RETRY'
  | 'TIMEOUT'
  | 'LOST'
  | 'UPDATE'
  | 'UPDATE_SUBMITTED'
  | 'UPDATE_CREATED'
  | 'RETURN_STARTED'
  | 'RETURNED'
  | 'RETURN_PENDING'
  | 'RETURN_INITIATED'
  | 'EXPIRED'
  | 'CANCEL'
  | 'CANCEL_CREATED'
  | 'CANCELED'
  | 'FAILED_ORDER_INIT'
  | 'FAILED_ORDER_SUBMITTED'
  | 'FAILED_ORDER_CREATED'
  | 'FAILED_PICKUP_REQUESTED'
  | 'FAILED_PICKED_UP'
  | 'FAILED_DELIVERED'
  | 'FAILED_UPDATE_SUBMITTED'
  | 'FAILED_UPDATE_CREATED'
  | 'FAILED_RETURN_STARTED'
  | 'FAILED_RETURNED'
  | 'FAILED_CANCEL_CREATED'
  | 'FAILED_CANCELED';

// ============================================
// Return & Refund Types
// ============================================

export type ReturnStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'CANCELLED'
  | 'JUDGING'
  | 'CLOSED'
  | 'PROCESSING'
  | 'SELLER_DISPUTE';

export type ReturnSolution = 'RETURN_REFUND' | 'REFUND';

export type ReturnReason =
  | 'NONRECEIPT'
  | 'WRONG_ITEM'
  | 'ITEM_DAMAGED'
  | 'DIFF_DESC'
  | 'MUITAL_AGREE'
  | 'OTHER'
  | 'USED'
  | 'NO_REASON'
  | 'ITEM_WRONGDAMAGED'
  | 'CHANGE_MIND'
  | 'ITEM_MISSING'
  | 'EXPECTATION_FAILED'
  | 'ITEM_FAKE'
  | 'PHYSICAL_DMG'
  | 'FUNCTIONAL_DMG'
  | 'ITEM_NOT_FIT'
  | 'SUSPICIOUS_PARCEL'
  | 'EXPIRED_PRODUCT'
  | 'WRONG_ORDER_INFO'
  | 'WRONG_ADDRESS'
  | 'CHANGE_OF_MIND'
  | 'SELLER_SENT_WRONG_ITEM'
  | 'SPILLED_CONTENTS'
  | 'BROKEN_PRODUCTS'
  | 'DAMAGED_PACKAGE'
  | 'SCRATCHED'
  | 'DAMAGED_OTHERS'
  | 'SIZE_DEVIATION'
  | 'LOOK_DEVIATION'
  | 'DATE_DEVIATION'
  | 'DIFFERENT_DESCRIPTION';

// ============================================
// Push/Webhook Types
// ============================================

export type PushCode = 
  | 1   // Shop Authorization Push
  | 2   // Shop Authorization Canceled Push
  | 3   // Order Status Update Push
  | 4   // Order TrackingNo Push
  | 5   // Shopee Updates
  | 6   // Banned Item Push
  | 7   // Item Promotion Push
  | 8   // Reserved Stock Change Push
  | 9   // Promotion Update Push
  | 10  // Webchat Push
  | 11  // Video Upload Push
  | 12  // Open API Authorization Expiry Push
  | 13  // Brand Register Result Push
  | 15; // Shipping Document Status Push

export interface PushMessage {
  shop_id: number;
  code: PushCode;
  success: number;
  extra: string;
  data: Record<string, unknown>;
  timestamp: number;
}

// ============================================
// Payment Types
// ============================================

export type TransactionType =
  | 'ESCROW_VERIFIED_ADD'
  | 'ESCROW_VERIFIED_MINUS'
  | 'WITHDRAWAL_CREATED'
  | 'WITHDRAWAL_COMPLETED'
  | 'WITHDRAWAL_CANCELLED'
  | 'REFUND_VERIFIED_ADD'
  | 'AUTO_REFUND_ADD'
  | 'ADJUSTMENT_ADD'
  | 'ADJUSTMENT_MINUS'
  | 'PAID_ADS_CHARGE'
  | 'PAID_ADS_REFUND';

// ============================================
// Promotion Types
// ============================================

export type PromotionType =
  | 'Campaign'
  | 'Discount Promotions'
  | 'Flash Sale'
  | 'Whole Sale'
  | 'Group Buy'
  | 'Bundle Deal'
  | 'Welcome Package'
  | 'Add-on Discount'
  | 'Brand Sale'
  | 'In ShopFlash Sale'
  | 'Gift with purchase'
  | 'Exclusive Price'
  | 'Platform Streaming'
  | 'Seller Streaming';

// ============================================
// Attribute Types
// ============================================

export type AttributeType =
  | 'INT_TYPE'
  | 'STRING_TYPE'
  | 'ENUM_TYPE'
  | 'FLOAT_TYPE'
  | 'DATE_TYPE'
  | 'TIMESTAMP_TYPE';

export type AttributeInputType =
  | 'DROP_DOWN'
  | 'TEXT_FILED'
  | 'COMBO_BOX'
  | 'MULTIPLE_SELECT'
  | 'MULTIPLE_SELECT_COMBO_BOX';

// ============================================
// Language Types
// ============================================

export type Language =
  | 'zh-hans'
  | 'zh-hant'
  | 'ms-my'
  | 'en-my'
  | 'en'
  | 'id'
  | 'vi'
  | 'th'
  | 'pt-br'
  | 'es-mx'
  | 'pl'
  | 'es-CO'
  | 'es-CL'
  | 'es-ES'
  | 'es-ar';
