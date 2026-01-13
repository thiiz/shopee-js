import { ShopeeClient } from '../dist/index.js';

// State
let client = null;
let currentShopId = null;

// UI Elements
const els = {
  partnerId: document.getElementById('partnerId'),
  partnerKey: document.getElementById('partnerKey'),
  env: document.getElementById('environment'),
  initBtn: document.getElementById('initBtn'),
  redirectUrl: document.getElementById('redirectUrl'),
  genLinkBtn: document.getElementById('genLinkBtn'),
  authLinkContainer: document.getElementById('authLinkContainer'),
  authLinkResult: document.getElementById('authLinkResult'),
  openAuthLink: document.getElementById('openAuthLink'),
  authCode: document.getElementById('authCode'),
  shopId: document.getElementById('shopId'),
  getTokenBtn: document.getElementById('getTokenBtn'),
  getShopInfoBtn: document.getElementById('getShopInfoBtn'),
  getOrdersBtn: document.getElementById('getOrdersBtn'),
  output: document.getElementById('output'), // Assuming you have an output element
  clearLogsBtn: document.getElementById('clearLogsBtn')
};

// Logger
function log(msg, type = 'info', data = null) {
  const el = document.createElement('div');
  el.className = 'log-entry';

  const time = new Date().toLocaleTimeString();
  let content = `<span class="log-time">[${time}]</span> <span class="badge ${type}">${type.toUpperCase()}</span> ${msg}`;

  if (data) {
    content += `\n<pre style="color: #cbd5e1; margin-top: 0.5rem;">${JSON.stringify(data, null, 2)}</pre>`;
  }

  el.innerHTML = content;
  els.output.prepend(el);
}

// Initialize
els.initBtn.addEventListener('click', () => {
  const partnerId = Number(els.partnerId.value);
  const partnerKey = els.partnerKey.value;
  const environment = els.env.value;

  if (!partnerId || !partnerKey) {
    log('Please provide Partner ID and Key', 'error');
    return;
  }

  try {
    client = new ShopeeClient({
      partnerId,
      partnerKey,
      environment,
      baseUrl: '', // Proxy through local server
      debug: true
    });

    // Enable buttons
    els.genLinkBtn.disabled = false;
    els.getTokenBtn.disabled = false;

    log(`Client initialized for ${environment} environment`, 'success');
  } catch (err) {
    log(err.message, 'error');
  }
});

// Generate Auth Link
els.genLinkBtn.addEventListener('click', async () => {
  if (!client) return;

  const redirectUrl = els.redirectUrl.value;
  try {
    const url = await client.auth.generateAuthLink({
      redirectUrl
    });

    els.authLinkResult.value = url;
    els.openAuthLink.href = url;
    els.authLinkContainer.classList.remove('hidden');
    log('Auth link generated', 'success');
  } catch (err) {
    log(err.message, 'error');
  }
});

// Get Token
els.getTokenBtn.addEventListener('click', async () => {
  if (!client) return;

  const code = els.authCode.value;
  const shopId = Number(els.shopId.value);

  if (!code || !shopId) {
    log('Please provide Auth Code and Shop ID', 'error');
    return;
  }

  try {
    log('Exchanging code for token...', 'info');
    const tokens = await client.auth.getAccessToken({
      code,
      shopId
    });

    currentShopId = shopId;
    els.getShopInfoBtn.disabled = false;
    els.getOrdersBtn.disabled = false;

    log('Token obtained successfully!', 'success', tokens);
  } catch (err) {
    log(err.message, 'error');
  }
});

// Get Shop Info
els.getShopInfoBtn.addEventListener('click', async () => {
  if (!client || !currentShopId) return;

  try {
    log(`Fetching info for shop ${currentShopId}...`, 'info');
    const info = await client.shop.getShopInfo(currentShopId);
    log('Shop Info retrieved', 'success', info);
  } catch (err) {
    log(err.message, 'error');
  }
});

// Get Orders
els.getOrdersBtn.addEventListener('click', async () => {
  if (!client || !currentShopId) return;

  try {
    const now = Math.floor(Date.now() / 1000);
    const dayAgo = now - 86400;

    log('Fetching recent orders...', 'info');
    const result = await client.order.listOrders(currentShopId, {
      timeRangeField: 'create_time',
      timeFrom: dayAgo,
      timeTo: now,
      pageSize: 20
    });

    log(`Found ${result.orders ? result.orders.length : 0} orders`, 'success', result);
  } catch (err) {
    log(err.message, 'error');
  }
});

els.clearLogsBtn.addEventListener('click', () => {
  els.output.innerHTML = '';
});
