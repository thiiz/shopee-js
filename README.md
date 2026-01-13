# Shopee-JS SDK

The most complete and robust TypeScript/JavaScript SDK for the [Shopee Open Platform API v2](https://open.shopee.com/).

[![npm version](https://img.shields.io/npm/v/shopee-js.svg)](https://www.npmjs.com/package/shopee-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Highlights

- 🔐 **Complete OAuth Flow**: Authorization link generation, code-to-token exchange, and automatic token renewal (refresh token).
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
// Example in a route handler (Express/Next.js)
app.get("/callback", async (req, res) => {
  const code = req.query.code as string;
  const shopId = Number(req.query.shop_id);

  const tokenResponse = await client.auth.getAccessToken({
    code,
    shopId,
  });

  // IMPORTANT: Save these tokens to your database associated with the shopId!
  await db.shops.update(shopId, {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    expiresAt: Date.now() + tokenResponse.expire_in * 1000,
  });

  res.send("Authorization successful!");
});
```

### 3. Token Persistence (Important!)

The SDK manages tokens in memory, but for production, you must restore them from your database when the client starts.

```typescript
// When loading your application or processing a request for a specific shop
const shopData = await db.shops.find(123456);

if (shopData) {
  client.auth.setShopToken(
    shopData.shopId,
    shopData.accessToken,
    shopData.refreshToken,
    shopData.expiresAt // Timestamp in milliseconds
  );
}

/**
 * Note on Refreshing:
 * The SDK will automatically refresh the access_token in memory if it expires.
 * To persist the new tokens after an automatic refresh, you can periodically
 * check for changes or save the new token data after API calls if required.
 */
```

---

## 📚 API Modules

### 🛒 Shop (Store)

Manage basic shop information and configurations.

```typescript
const shopInfo = await client.shop.getShopInfo(123456);
console.log(`Shop: ${shopInfo.shop_name}`);
```

### 📦 Product

List, search, and manage products.

```typescript
// Iterate over ALL products (Automatic Pagination!)
for await (const item of client.product.iterateItems(123456, {
  itemStatus: "NORMAL",
})) {
  console.log(`Item ID: ${item.itemId}`);
}
```

### 📝 Order

Manage orders, cancellations, and returns.

```typescript
// List recent orders
const orders = await client.order.listOrders(123456, {
  timeRangeField: "create_time",
  timeFrom: Math.floor(Date.now() / 1000) - 86400,
  timeTo: Math.floor(Date.now() / 1000),
  pageSize: 20,
});
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
    console.error(`Status: ${error.errorCode} - ${error.message}`);
  }
}
```

---

## 🛠️ Development

```bash
git clone https://github.com/thiiz/shopee-js.git
bun install
bun test
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
