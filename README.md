# Shopee-JS SDK

TypeScript SDK for [Shopee Open Platform API v2](https://open.shopee.com/).

## Features

- 🔐 **Full OAuth Support** - Generate auth links, manage tokens with auto-refresh
- 📦 **Complete API Coverage** - Shop, Product, Order, Logistics, and more
- 🔄 **Auto Token Refresh** - Tokens are refreshed automatically before expiration
- 📝 **Full TypeScript Support** - Complete type definitions for all APIs
- 🌍 **Multi-Region** - Support for SG, CN, and BR regions
- 🧪 **Sandbox Support** - Easy switching between production and sandbox environments
- 🚀 **Zero Dependencies** - Uses native Web Crypto API and Fetch

## Installation

```bash
# Using Bun
bun add shopee-js

# Using npm
npm install shopee-js

# Using pnpm
pnpm add shopee-js
```

## Quick Start

### 1. Initialize the Client

```typescript
import { ShopeeClient } from "shopee-js";

const client = new ShopeeClient({
  partnerId: 123456, // Your Partner ID
  partnerKey: "your-key", // Your Partner Key
  environment: "sandbox", // 'sandbox' or 'production'
  region: "sg", // 'sg', 'cn', or 'br'
  debug: true, // Enable debug logging (optional)
});
```

### 2. Generate Authorization Link

```typescript
const authUrl = await client.auth.generateAuthLink({
  redirectUrl: "https://your-site.com/callback",
});

// Redirect the shop owner to authUrl
console.log("Authorize at:", authUrl);
```

### 3. Handle OAuth Callback

After the shop owner authorizes your app, they'll be redirected to your callback URL with a `code` and `shop_id`:

```typescript
// In your callback handler
const code = "authorization-code-from-callback";
const shopId = 123456; // shop_id from callback

// Exchange code for tokens
const tokens = await client.auth.getAccessToken({
  code,
  shopId,
});

console.log("Access token expires in:", tokens.expire_in, "seconds");
```

### 4. Make API Calls

```typescript
// Get shop info
const shopInfo = await client.shop.getShopInfo(shopId);
console.log("Shop name:", shopInfo.shop_name);

// List orders
const orders = await client.order.listOrders(shopId, {
  timeRangeField: "create_time",
  timeFrom: Math.floor(Date.now() / 1000) - 86400, // Last 24 hours
  timeTo: Math.floor(Date.now() / 1000),
  pageSize: 50,
});

console.log("Orders found:", orders.orders.length);

// Get order details
const details = await client.order.getOrderDetails(shopId, {
  orderSnList: orders.orders.map((o) => o.orderSn),
});
```

### 5. Iterate Through All Orders (Pagination Handled)

```typescript
// Automatically handles pagination
for await (const order of client.order.iterateOrders(shopId, {
  timeRangeField: "create_time",
  timeFrom: 1609459200,
  timeTo: 1609545600,
})) {
  console.log(order.orderSn, order.orderStatus);
}
```

## Token Persistence

The SDK stores tokens in memory. For production use, you should persist tokens to your database:

```typescript
// After getting tokens
const tokenData = client.auth.getShopTokenData(shopId);
await saveToDatabase(tokenData);

// When initializing (restore from database)
const savedData = await loadFromDatabase(shopId);
if (savedData) {
  client.auth.setShopToken(
    savedData.shopId,
    savedData.accessToken,
    savedData.refreshToken,
    savedData.expiresAt
  );
}
```

## API Modules

| Module             | Description                       |
| ------------------ | --------------------------------- |
| `client.auth`      | OAuth flow, token management      |
| `client.shop`      | Shop information and settings     |
| `client.product`   | Products, categories, inventory   |
| `client.order`     | Orders, shipments, cancellations  |
| `client.logistics` | Shipments, tracking, airway bills |

_More modules coming soon: Payment, Discount, Voucher, etc._

## Error Handling

```typescript
import { ShopeeApiError } from "shopee-js";

try {
  await client.order.cancelOrder(shopId, {
    orderSn: "invalid-order",
    cancelReason: "OUT_OF_STOCK",
  });
} catch (error) {
  if (error instanceof ShopeeApiError) {
    console.error("API Error:", error.errorCode);
    console.error("Message:", error.message);
    console.error("Request ID:", error.requestId);
  } else {
    throw error;
  }
}
```

## Configuration Options

```typescript
interface ShopeeConfig {
  // Required
  partnerId: number; // Partner ID from Shopee Open Platform
  partnerKey: string; // Partner Key (secret)

  // Optional
  environment?: "production" | "sandbox"; // Default: 'sandbox'
  region?: "sg" | "cn" | "br"; // Default: 'sg'
  timeout?: number; // Request timeout in ms (default: 30000)
  debug?: boolean; // Enable debug logging
}
```

## Region Selection

| Region | Description         | Host                       |
| ------ | ------------------- | -------------------------- |
| `sg`   | Singapore (default) | partner.shopeemobile.com   |
| `cn`   | Chinese Mainland    | openplatform.shopee.cn     |
| `br`   | Brazil (US servers) | openplatform.shopee.com.br |

## Environments

- **Production**: Real API calls, real data
- **Sandbox**: Test environment with test accounts

```typescript
// Production
const prodClient = new ShopeeClient({
  partnerId: 123456,
  partnerKey: "live-key",
  environment: "production",
  region: "sg",
});

// Sandbox
const sandboxClient = new ShopeeClient({
  partnerId: 123456,
  partnerKey: "test-key",
  environment: "sandbox",
});
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build
bun run build

# Type check
bunx tsc --noEmit
```

## License

MIT

## Links

- [Shopee Open Platform](https://open.shopee.com/)
- [API Documentation](https://open.shopee.com/documents/v2/v2.api_call.overview)
- [Support Center](https://open.shopee.com/support)
