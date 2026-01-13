# Shopee-JS SDK

The most complete and robust TypeScript/JavaScript SDK for the [Shopee Open Platform API v2](https://open.shopee.com/).

[![npm version](https://img.shields.io/npm/v/shopee-js.svg)](https://www.npmjs.com/package/shopee-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Highlights

- 🔐 **Complete OAuth Flow**: Authorization link generation, code-to-token comparison, and automatic token renewal (refresh token) with persistence support.
- 📦 **Strong Typing (TypeScript)**: All requests and responses are fully typed, ensuring autocomplete and compile-time safety.
- 🌍 **Multi-Region Support**: Configured to work with Singapore (`sg`), China (`cn`), and Brazil (`br`).
- 🔄 **Automatic Pagination**: Async iterators (`for await`) to traverse large lists of orders or products without manually handling cursors.
- 🛡️ **Error Handling**: Dedicated error classes with clear API codes and messages.
- 🚀 **Zero Runtime Dependencies**: Built on top of `fetch` and `Web Crypto API`, making it lightweight and compatible with Edge Runtimes (Cloudflare Workers, Vercel Edge, Bun, Deno).

---

## 📦 Installation

```bash
# Using Bun (Recommended)
bun add shopee-js

# Using npm
npm install shopee-js

# Using pnpm
pnpm add shopee-js

# Using yarn
yarn add shopee-js
```

---

## 🚀 Quick Start

### 1. Initialize Client

```typescript
import { ShopeeClient } from "shopee-js";

const client = new ShopeeClient({
  partnerId: 123456, // Your Partner ID
  partnerKey: "your-key", // Your Partner Key (Secret)
  environment: "sandbox", // 'sandbox' or 'production'
  region: "br", // 'sg', 'cn' or 'br'

  // Optional: Automatic Token Persistence Callback
  onTokenRefresh: async (tokenData) => {
    console.log("Token Refreshed for Shop:", tokenData.shopId);
    // Save new token to your database
    await db.shops.update(tokenData.shopId, {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresAt: tokenData.expiresAt,
    });
  },
});
```

### 2. Authentication (OAuth 2.0)

To access a shop's data, the seller must authorize your application.

#### Step A: Generate Authorization Link

```typescript
const authLink = await client.auth.generateAuthLink({
  redirectUrl: "https://your-site.com/callback",
});

console.log("Send the seller to this link:", authLink);
```

#### Step B: Exchange Code for Tokens

When the seller authorizes, they are redirected to your `redirectUrl` with a `code` and `shop_id`.

```typescript
// Example in a route handler
const code = req.query.code;
const shopId = Number(req.query.shop_id);

const tokenResponse = await client.auth.getAccessToken({
  code,
  shopId,
});

console.log("Access Token:", tokenResponse.access_token);
console.log("Refresh Token:", tokenResponse.refresh_token);

// IMPORTANT: Save these initial tokens to your database!
await db.shops.update(shopId, {
  accessToken: tokenResponse.access_token,
  refreshToken: tokenResponse.refresh_token,
  expiresAt: Date.now() + tokenResponse.expire_in * 1000,
});
```

### 3. Token Persistence (New!)

The SDK manages tokens in memory for performance, but you simply need to load them once when your app starts.

Using the `onTokenRefresh` callback (configured in step 1), the SDK will **automatically** call your database update function whenever it refreshes a token internally. You no longer need to setup cron jobs or manual storage logic.

```typescript
// When loading your application or processing a request:
const shopData = await db.shops.find(123456);

if (shopData) {
  client.auth.setShopToken(
    shopData.shopId,
    shopData.accessToken,
    shopData.refreshToken,
    shopData.expiresAt // Timestamp in milliseconds
  );
}

// Result: The SDK will use these tokens, auto-refresh when needed,
// and call your 'onTokenRefresh' callback to keep DB in sync.
```

---

## 📚 API Modules

### 🛒 Shop

Manage basic shop information and profile.

```typescript
// Get Shop Info
const shopInfo = await client.shop.getShopInfo(123456);
console.log(`Shop: ${shopInfo.shop_name} (Region: ${shopInfo.region})`);

// Update Profile
await client.shop.updateProfile(123456, {
  shopName: "My Awesome Shop",
  description: "Best shop in town!",
});
```

### 📦 Product

List, search and manage products.

```typescript
// List items (Manual Pagination)
const result = await client.product.listItems(123456, {
  pageSize: 50,
  itemStatus: "NORMAL",
});

// Iterate all items (Auto Pagination!)
for await (const item of client.product.iterateItems(123456, {
  itemStatus: "NORMAL",
})) {
  console.log(`Product ID: ${item.itemId} - Status: ${item.itemStatus}`);
}

// Get Item Details
const details = await client.product.getItemBaseInfo(123456, {
  itemIdList: [10001, 10002],
});
```

### 📝 Order

Manage orders, cancellations and returns.

```typescript
// List recent orders
const now = Math.floor(Date.now() / 1000);
const orders = await client.order.listOrders(123456, {
  timeRangeField: "create_time",
  timeFrom: now - 86400, // Last 24h
  timeTo: now,
  pageSize: 20,
});

// Iterate all orders in a time range
for await (const order of client.order.iterateOrders(123456, {
  timeRangeField: "create_time",
  timeFrom: now - 86400 * 7,
  timeTo: now,
})) {
  console.log(`Order ${order.orderSn} - Status: ${order.orderStatus}`);
}

// Cancel Order
await client.order.cancelOrder(123456, {
  orderSn: "230101ABCDE123",
  cancelReason: "OUT_OF_STOCK",
  itemList: [{ item_id: 123, model_id: 456 }],
});
```

### 🚚 Logistics

Manage shipping, labels and tracking.

```typescript
// 1. Get Shipping Parameters
const shippingParams = await client.logistics.getShippingParameter(
  123456,
  "230101ABCDE123"
);

// 2. Ship Order (Pickup Example)
await client.logistics.shipOrder(123456, {
  orderSn: "230101ABCDE123",
  pickup: {
    addressId: shippingParams.pickup.address_list[0].address_id,
    pickupTimeId: shippingParams.pickup.time_slot_list[0].pickup_time_id,
  },
});

// 3. Generate Shipping Label (AWB)
await client.logistics.createShippingDocument(123456, [
  {
    orderSn: "230101ABCDE123",
    documentType: "NORMAL_AIR_WAYBILL",
  },
]);

// 4. Download PDF
// (Assuming status is READY after checking result)
const pdfBuffer = await client.logistics.downloadShippingDocument(123456, {
  orderList: [{ orderSn: "230101ABCDE123" }],
});

// 5. Tracking
const tracking = await client.logistics.getTrackingNumber(
  123456,
  "230101ABCDE123"
);
console.log(`Tracking: ${tracking.tracking_number}`);
```

---

## ⚠️ Error Handling

The SDK throws `ShopeeApiError` when the API returns an error.

```typescript
import { ShopeeApiError } from "shopee-js";

try {
  await client.shop.getShopInfo(123456);
} catch (error) {
  if (error instanceof ShopeeApiError) {
    console.error("Shopee API Error:");
    console.error(`Code: ${error.errorCode}`); // e.g. "error_param"
    console.error(`Message: ${error.message}`); // e.g. "Invalid shop id"
    console.error(`Request ID: ${error.requestId}`);
  } else {
    console.error("Unknown Error:", error);
  }
}
```

---

## 🛠️ Development

To contribute or run tests locally:

```bash
# Clone
git clone https://github.com/your-username/shopee-js.git

# Install
bun install

# Test
bun test

# Run example server
bun run examples/server.ts
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
