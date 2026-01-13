/**
 * Tests for ShopeeClient
 */

import { describe, expect, test } from 'bun:test';
import { ShopeeApiError, ShopeeClient } from '../src/index.js';

describe('ShopeeClient', () => {
  const validConfig = {
    partnerId: 123456,
    partnerKey: 'test-partner-key',
    environment: 'sandbox' as const,
    region: 'sg' as const,
  };

  describe('constructor', () => {
    test('creates client with valid config', () => {
      const client = new ShopeeClient(validConfig);
      expect(client).toBeInstanceOf(ShopeeClient);
    });

    test('throws error without partnerId', () => {
      expect(() => new ShopeeClient({
        partnerId: undefined as unknown as number,
        partnerKey: 'test-key',
      })).toThrow('partnerId is required');
    });

    test('throws error without partnerKey', () => {
      expect(() => new ShopeeClient({
        partnerId: 123456,
        partnerKey: undefined as unknown as string,
      })).toThrow('partnerKey is required');
    });

    test('throws error with non-number partnerId', () => {
      expect(() => new ShopeeClient({
        partnerId: '123456' as unknown as number,
        partnerKey: 'test-key',
      })).toThrow('partnerId must be a number');
    });
  });

  describe('modules', () => {
    test('has auth module', () => {
      const client = new ShopeeClient(validConfig);
      expect(client.auth).toBeDefined();
      expect(typeof client.auth.generateAuthLink).toBe('function');
    });

    test('has shop module', () => {
      const client = new ShopeeClient(validConfig);
      expect(client.shop).toBeDefined();
      expect(typeof client.shop.getShopInfo).toBe('function');
    });

    test('has order module', () => {
      const client = new ShopeeClient(validConfig);
      expect(client.order).toBeDefined();
      expect(typeof client.order.listOrders).toBe('function');
    });

    test('has product module', () => {
      const client = new ShopeeClient(validConfig);
      expect(client.product).toBeDefined();
      expect(typeof client.product.getCategories).toBe('function');
    });
  });

  describe('auth.generateAuthLink', () => {
    test('generates valid authorization URL', async () => {
      const client = new ShopeeClient(validConfig);
      const authUrl = await client.auth.generateAuthLink({
        redirectUrl: 'https://example.com/callback',
      });

      expect(authUrl).toContain('https://openplatform.sandbox.test-stable.shopee.sg');
      expect(authUrl).toContain('/api/v2/shop/auth_partner');
      expect(authUrl).toContain('partner_id=123456');
      expect(authUrl).toContain('timestamp=');
      expect(authUrl).toContain('sign=');
      expect(authUrl).toContain('redirect=https%3A%2F%2Fexample.com%2Fcallback');
    });

    test('uses production URL for production environment', async () => {
      const client = new ShopeeClient({
        ...validConfig,
        environment: 'production',
        region: 'sg',
      });
      const authUrl = await client.auth.generateAuthLink({
        redirectUrl: 'https://example.com/callback',
      });

      expect(authUrl).toContain('https://partner.shopeemobile.com');
    });

    test('uses CN URL for CN region', async () => {
      const client = new ShopeeClient({
        ...validConfig,
        environment: 'production',
        region: 'cn',
      });
      const authUrl = await client.auth.generateAuthLink({
        redirectUrl: 'https://example.com/callback',
      });

      expect(authUrl).toContain('https://openplatform.shopee.cn');
    });
  });
});

describe('ShopeeApiError', () => {
  test('creates error with all properties', () => {
    const error = new ShopeeApiError(
      'Test error message',
      'req-123',
      'error.test',
      'Detailed error info'
    );

    expect(error.name).toBe('ShopeeApiError');
    expect(error.message).toBe('Test error message');
    expect(error.requestId).toBe('req-123');
    expect(error.errorCode).toBe('error.test');
    expect(error.details).toBe('Detailed error info');
  });

  test('is instance of Error', () => {
    const error = new ShopeeApiError('Test', 'id', 'code', 'details');
    expect(error).toBeInstanceOf(Error);
  });
});
