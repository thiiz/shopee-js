# Shopee-JS SDK 🚀

[![npm version](https://img.shields.io/npm/v/shopee-js.svg)](https://www.npmjs.com/package/shopee-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The most complete and robust TypeScript/JavaScript SDK for the **Shopee Open Platform API v2**. Designed to be lightweight, fully typed, and extremely easy to integrate into any environment (Node.js, Bun, Cloudflare Workers, etc.).

---

## 🌟 Key Features

- 🔐 **Complete OAuth 2.0**: Simplified authorization flow, token exchange, and automatic renewal.
- 🏗️ **Stateless Architecture**: Full control over token persistence in your own database.
- 📦 **Strong Typing**: Comprehensive autocomplete for all requests and responses.
- 🔄 **Auto-Pagination**: Stop worrying about cursors. Use `for await` to traverse thousands of products or orders effortlessly.
- 🚚 **Advanced Logistics**: Full support for shipping parameters, labels (PDF/Thermal), and real-time tracking.
- 📢 **Marketing & Ads**: Exclusive module for managing Shopee Ads and performance reports.
- ⚡ **Zero Dependencies**: Built on top of native `fetch` and `Web Crypto API` for maximum performance and edge compatibility.

---

## 📦 Installation

```bash
# Using Bun (Recommended)
bun add shopee-js

# Using npm
npm install shopee-js
```

---

## 🚀 Quick Start

```typescript
import { ShopeeClient } from "shopee-js";

const client = new ShopeeClient({
  partnerId: 123456,        // Your Partner ID
  partnerKey: "your-key",   // Your Partner Key (Secret)
  environment: "sandbox",   // 'sandbox' or 'production'
  region: "br",             // 'br', 'sg', or 'cn'
});
```

---

## 🔐 Authentication Flow (OAuth 2.0)

Shopee requires sellers to authorize your app before you can access their data.

### Step 1: Generate Authorization Link
Redirect the seller to this URL to click "Authorize".

```typescript
const authUrl = await client.auth.generateAuthLink({
  redirectUrl: "https://your-site.com/callback",
});
// Send the user to authUrl
```

### Step 2: Handle Callback and Obtain Tokens
After authorization, Shopee redirects back to your URL with `code` and `shop_id` parameters.

```typescript
// Inside your route handler (e.g., Next.js, Express)
const { code, shop_id } = req.query;

const tokens = await client.auth.getAccessToken({
  code: String(code),
  shopId: Number(shop_id), // or mainAccountId for merchant accounts
});

/* 
IMPORTANT: Save access_token and refresh_token to your database!
tokens = {
  access_token: "...",
  refresh_token: "...",
  expire_in: 14400,
  ...
}
*/
```

### Step 3: Token Renewal (Refresh)
Access tokens expire in 4 hours. Use the `refresh_token` (valid for 30 days) to renew:

```typescript
const newTokens = await client.auth.refreshShopToken(shopId, refreshTokenFromDb);
// Update your database with the new tokens!
```

---

## 📚 Modules in Detail

### 🛒 Products (`client.product`)
The SDK normalizes top-level properties to **camelCase** for a better developer experience.

```typescript
// Smart Listing with Async Iterators
// Automatically traverses ALL 'NORMAL' products, handling internal pagination
for await (const item of client.product.iterateItems(shopId, accessToken, {
  itemStatus: ["NORMAL"]
})) {
  console.log(`Product ID: ${item.itemId}`);
}

// 🔥 ALL-IN-ONE: List IDs and fetch full details in batches of 50
for await (const fullItem of client.product.iterateItemsWithDetails(shopId, accessToken, {
  itemStatus: ["NORMAL"],
  batchSize: 50
})) {
  console.log(fullItem.itemName, fullItem.priceInfo[0].current_price);
}
```

### 📝 Orders (`client.order`)
```typescript
// Fetch details for specific orders
const orders = await client.order.getOrderDetails(shopId, accessToken, {
  orderSnList: ["240101ABCD123"],
  responseOptionalFields: ["item_list", "buyer_user_id"]
});

// Cancel an order
await client.order.cancelOrder(shopId, accessToken, {
  orderSn: "240101ABCD123",
  cancelReason: "OUT_OF_STOCK"
});
```

### 🚚 Logistics (`client.logistics`)
Complete fulfillment workflow:

```typescript
// 1. Check shipping parameters (Pickup or Dropoff)
const shippingParams = await client.logistics.getShippingParameter(shopId, accessToken, orderSn);

// 2. Schedule shipment
await client.logistics.shipOrder(shopId, accessToken, {
  orderSn: orderSn,
  pickup: {
    addressId: 123,
    pickupTimeId: "..."
  }
});

// 3. Download shipping label (Base64 PDF/Thermal)
const label = await client.logistics.downloadShippingDocument(shopId, accessToken, [
  { orderSn, documentType: "THERMAL_AIR_WAYBILL" }
]);
```

### 📢 Marketing & Ads (`client.marketing`)
Monitor and manage Shopee Ads performance.

```typescript
// Daily performance report
const report = await client.marketing.getShopAdsDailyReport(shopId, accessToken, {
  date: "2023-11-20"
});

// List ongoing ads
const ads = await client.marketing.getAdList(shopId, accessToken, {
  type: "product_search_ad",
  status: "ongoing"
});
```

---

## ⚠️ Error Handling

The SDK throws `ShopeeApiError` when the Shopee API returns a business error.

```typescript
import { ShopeeApiError } from "shopee-js";

try {
  await client.shop.getShopInfo(shopId, "invalid-token");
} catch (error) {
  if (error instanceof ShopeeApiError) {
    console.error(`Error Code: ${error.errorCode}`); // e.g., "error_auth"
    console.error(`Message: ${error.message}`);
    console.error(`Request ID: ${error.requestId}`);
  }
}
```

---

## 🛠️ Implementation Notes

- **Stateless**: The SDK does not store tokens in memory. You must always pass the `accessToken` to methods that require it. This allows you to use a single `client` instance for multiple sellers concurrently.
- **Normalization**: Top-level item properties are converted to `camelCase`. Nested objects (like `tax_info` or `image`) retain their original `snake_case` keys as defined by Shopee to avoid unnecessary overhead and maintain documentation fidelity.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

