/**
 * Example: OAuth Flow Demo
 * 
 * This example demonstrates the complete OAuth flow for Shopee Open Platform.
 * 
 * To run:
 *   bun run examples/oauth-demo.ts
 */

import { ShopeeClient } from '../src/index.js';

// Configuration - Replace with your actual credentials
const PARTNER_ID = 123456;
const PARTNER_KEY = 'your-partner-key-here';
const REDIRECT_URL = 'https://your-site.com/callback';

async function main() {
  // 1. Create client instance
  const client = new ShopeeClient({
    partnerId: PARTNER_ID,
    partnerKey: PARTNER_KEY,
    environment: 'sandbox', // Use 'production' for live
    region: 'sg',
    debug: true,
  });

  console.log('=== Shopee OAuth Flow Demo ===\n');

  // 2. Generate authorization link
  console.log('Step 1: Generate authorization link');
  const authUrl = await client.auth.generateAuthLink({
    redirectUrl: REDIRECT_URL,
  });
  console.log('Authorization URL:');
  console.log(authUrl);
  console.log('\nShare this URL with the shop owner to authorize your app.\n');

  // 3. Simulate callback (in real app, this comes from the redirect)
  console.log('Step 2: After authorization, you receive code and shop_id');
  console.log('Example callback URL:');
  console.log(`${REDIRECT_URL}?code=abc123&shop_id=789\n`);

  // 4. Exchange code for tokens
  console.log('Step 3: Exchange authorization code for tokens');
  console.log('await client.auth.getAccessToken({ code, shopId });\n');

  // 5. Make API calls
  console.log('Step 4: Make API calls');
  console.log(`
// Get shop info
const shopInfo = await client.shop.getShopInfo(shopId);

// List orders
const orders = await client.order.listOrders(shopId, {
  timeRangeField: 'create_time',
  timeFrom: Math.floor(Date.now() / 1000) - 86400,
  timeTo: Math.floor(Date.now() / 1000),
});

// Get products
const products = await client.product.listItems(shopId, {
  pageSize: 50,
  itemStatus: 'NORMAL',
});
`);

  console.log('=== Demo Complete ===');
}

main().catch(console.error);
