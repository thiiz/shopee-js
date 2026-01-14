/**
 * Shopee-JS SDK
 *
 * TypeScript SDK for Shopee Open Platform API v2
 *
 * @packageDocumentation
 */

// Main client
export { ShopeeClient } from "./client.js";

// Types (includes ShopeeApiError)
export * from "./types/index.js";

// Utilities (for advanced usage)
export { generateSignature, getTimestamp } from "./auth/signature.js";
export { API_PATHS, getApiHost } from "./http/endpoints.js";

// HTTP Client (for custom requests)
export { HttpClient } from "./http/client.js";

// Token Manager (for advanced token management)
export { TokenManager } from "./auth/token-manager.js";

// Modules (for advanced usage)
export { AuthModule } from "./modules/auth.js";
export { LogisticsModule } from "./modules/logistics.js";
export { MarketingModule } from "./modules/marketing.js";
export { OrderModule } from "./modules/order.js";
export { ProductModule } from "./modules/product.js";
export { ShopModule } from "./modules/shop.js";
