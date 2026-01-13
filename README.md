# Shopee-JS SDK

O SDK TypeScript/JavaScript mais completo e robusto para a [Shopee Open Platform API v2](https://open.shopee.com/).

[![npm version](https://img.shields.io/npm/v/shopee-js.svg)](https://www.npmjs.com/package/shopee-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Destaques

- 🔐 **Fluxo OAuth Completo**: Geração de links de autorização, troca de código por tokens e renovação automática de tokens (refresh token).
- 📦 **Tipagem Forte (TypeScript)**: Todas as requisições e respostas são tipadas, garantindo autocompletar e segurança em tempo de compilação.
- 🌍 **Suporte Multi-Região**: Configurado para trabalhar com Singapura (`sg`), China (`cn`) e Brasil (`br`).
- 🔄 **Paginação Automática**: Iteradores assíncronos (`for await`) para percorrer grandes listas de pedidos ou produtos sem lidar com cursores manualmente.
- 🛡️ **Tratamento de Erros**: Classes de erro dedicadas com códigos e mensagens claras da API.
- 🚀 **Zero Dependências de Runtime**: Construído sobre `fetch` e `Web Crypto API`, tornando-o leve e compatível com Edge Runtimes (Cloudflare Workers, Vercel Edge, Bun, Deno).

---

## 📦 Instalação

```bash
# Usando Bun (Recomendado)
bun add shopee-js

# Usando npm
npm install shopee-js

# Usando pnpm
pnpm add shopee-js

# Usando yarn
yarn add shopee-js
```

---

## 🚀 Começando Rápido

### 1. Inicialize o Cliente

```typescript
import { ShopeeClient } from "shopee-js";

const client = new ShopeeClient({
  partnerId: 123456, // Seu Partner ID (do Portal Shopee Open Platform)
  partnerKey: "your-key", // Sua Partner Key (Secret)
  environment: "sandbox", // 'sandbox' para testes ou 'production' para produção
  region: "br", // 'sg', 'cn' ou 'br' (Brasil)
  debug: true, // Opcional: Loga as requisições no console
});
```

### 2. Autenticação (OAuth 2.0)

Para acessar os dados de uma loja, você precisa que o vendedor autorize seu aplicativo.

#### Passo A: Gerar Link de Autorização

```typescript
const authLink = await client.auth.generateAuthLink({
  redirectUrl: "https://seu-site.com/callback", // URL configurada no seu App no portal da Shopee
});

console.log("Envie o vendedor para este link:", authLink);
```

#### Passo B: Trocar Código por Tokens

Quando o vendedor autoriza, ele é redirecionado para sua `redirectUrl` com um `code` e `shop_id`.

```typescript
// Exemplo em um handler de rota (Next.js/Express)
const code = req.query.code;
const shopId = Number(req.query.shop_id);

const tokenResponse = await client.auth.getAccessToken({
  code,
  shopId,
});

console.log("Access Token:", tokenResponse.access_token);
console.log("Refresh Token:", tokenResponse.refresh_token);

// IMPORTANTE: Salve esses tokens no seu banco de dados associados ao shopId!
await db.shops.update(shopId, {
  accessToken: tokenResponse.access_token,
  refreshToken: tokenResponse.refresh_token,
  expiresAt: Date.now() + tokenResponse.expire_in * 1000,
});
```

### 3. Persistência de Tokens (Importante!)

O SDK gerencia tokens em memória, mas para produção você deve restaurá-los do seu banco de dados ao iniciar o cliente.

```typescript
// Ao carregar sua aplicação ou processar uma requisição para uma loja específica
const shopData = await db.shops.find(123456);

if (shopData) {
  client.auth.setShopToken(
    shopData.shopId,
    shopData.accessToken,
    shopData.refreshToken,
    shopData.expiresAt // Timestamp em milissegundos
  );
}

// O SDK atualizará o token automaticamente se ele estiver expirado,
// mas você deve ouvir eventos ou verificar periodicamente para salvar o novo token no DB.
```

---

## 📚 Módulos da API

### 🛒 Shop (Loja)

Gerencie informações básicas da loja e configurações.

```typescript
// Obter informações da loja
const shopInfo = await client.shop.getShopInfo(123456);
console.log(`Loja: ${shopInfo.shop_name} (Região: ${shopInfo.region})`);

// Atualizar perfil
await client.shop.updateProfile(123456, {
  shopName: "Minha Loja Inccrível",
  description: "A melhor loja do Brasil!",
});
```

### 📦 Product (Produtos)

Liste, busque e gerencie produtos.

```typescript
// Listar produtos (paginação manual)
const result = await client.product.listItems(123456, {
  pageSize: 50,
  itemStatus: "NORMAL", // 'NORMAL', 'BANNED', 'DELETED', 'UNLIST'
});

// Iterar sobre TODOS os produtos (Paginação Automática!)
for await (const item of client.product.iterateItems(123456, {
  itemStatus: "NORMAL",
})) {
  console.log(`Produto ID: ${item.itemId} - Status: ${item.itemStatus}`);
}

// Obter detalhes de produtos específicos
const details = await client.product.getItemBaseInfo(123456, {
  itemIdList: [10001, 10002],
});

// Listar categorias
const categories = await client.product.getCategories(123456, {
  language: "pt",
});
```

### 📝 Order (Pedidos)

Gerencie pedidos, cancelamentos e devoluções.

```typescript
// Listar pedidos recentes (últimas 24h)
const now = Math.floor(Date.now() / 1000);
const orders = await client.order.listOrders(123456, {
  timeRangeField: "create_time",
  timeFrom: now - 86400,
  timeTo: now,
  pageSize: 20,
});

// Iterar sobre TODOS os pedidos de um período
for await (const order of client.order.iterateOrders(123456, {
  timeRangeField: "create_time",
  timeFrom: now - 86400 * 7, // Últimos 7 dias
  timeTo: now,
})) {
  console.log(`Pedido ${order.orderSn} - Status: ${order.orderStatus}`);
}

// Detalhes do pedido
const orderDetails = await client.order.getOrderDetails(123456, {
  orderSnList: ["230101ABCDE123"],
  responseOptionalFields: ["buyer_user_id", "item_list", "recipient_address"],
});

// Cancelar pedido
await client.order.cancelOrder(123456, {
  orderSn: "230101ABCDE123",
  cancelReason: "OUT_OF_STOCK",
  itemList: [{ item_id: 123, model_id: 456 }], // Opcional: especificar itens
});
```

### 🚚 Logistics (Logística)

Gerencie envios, etiquetas e rastreamento.

```typescript
// 1. Obter parâmetros de envio (para saber se é Pickup ou Dropoff)
const shippingParams = await client.logistics.getShippingParameter(
  123456,
  "230101ABCDE123"
);

// 2. Agendar envio (Ship Order)
// Exemplo para Pickup (Coleta)
await client.logistics.shipOrder(123456, {
  orderSn: "230101ABCDE123",
  pickup: {
    addressId: shippingParams.pickup.address_list[0].address_id,
    pickupTimeId: shippingParams.pickup.time_slot_list[0].pickup_time_id,
  },
});

// Ou Exemplo para Dropoff (Postagem)
await client.logistics.shipOrder(123456, {
  orderSn: "230101ABCDE123",
  dropoff: {
    branchId: shippingParams.dropoff.branch_list[0].branch_id,
  },
});

// 3. Gerar Etiqueta de Envio (AWB)
// Primeiro crie a tarefa de geração
await client.logistics.createShippingDocument(123456, [
  {
    orderSn: "230101ABCDE123",
    documentType: "NORMAL_AIR_WAYBILL",
  },
]);

// Depois consulte o resultado (pode levar alguns segundos)
// Em produção, use um mecanismo de polling ou retry
const docResult = await client.logistics.getShippingDocumentResult(123456, [
  {
    orderSn: "230101ABCDE123",
  },
]);

// 4. Baixar PDF da etiqueta
if (docResult.result_list[0].status === "READY") {
  const pdfBuffer = await client.logistics.downloadShippingDocument(123456, {
    orderList: [{ orderSn: "230101ABCDE123" }],
  });
  // Salvar pdfBuffer em arquivo ou enviar para o client
}

// Rastreamento
const tracking = await client.logistics.getTrackingNumber(
  123456,
  "230101ABCDE123"
);
console.log(`Rastreio: ${tracking.tracking_number}`);
```

---

## ⚠️ Tratamento de Erros

O SDK lança `ShopeeApiError` quando a API retorna um erro.

```typescript
import { ShopeeApiError } from "shopee-js";

try {
  await client.shop.getShopInfo(123456);
} catch (error) {
  if (error instanceof ShopeeApiError) {
    console.error("Erro da API Shopee:");
    console.error(`Código: ${error.errorCode}`); // Ex: "error_param"
    console.error(`Mensagem: ${error.message}`); // Ex: "Invalid shop id"
    console.error(`Request ID: ${error.requestId}`);
  } else {
    console.error("Erro desconhecido:", error);
  }
}
```

---

## 🛠️ Desenvolvimento e Testes

Para contribuir com o SDK ou rodar os testes localmente:

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/shopee-js.git

# Instale as dependências
bun install

# Rode os testes
bun test

# Rode o servidor de exemplo (para testar OAuth)
bun run examples/server.ts
```

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
