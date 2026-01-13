/**
 * Tests for signature generation
 */

import { describe, expect, test } from 'bun:test';
import {
    calculateSignature,
    createBaseString,
    generateSignature,
    getTimestamp
} from '../src/auth/signature.js';

describe('Signature', () => {
  const partnerId = 2001887;
  const partnerKey = 'test-partner-key';
  const timestamp = 1655714431;

  describe('createBaseString', () => {
    test('creates correct base string for Shop API', () => {
      const result = createBaseString({
        partnerId,
        path: '/api/v2/shop/get_shop_info',
        timestamp,
        apiType: 'shop',
        accessToken: '59777174636562737266615546704c6d',
        shopId: 14701711,
      });

      expect(result).toBe(
        '2001887/api/v2/shop/get_shop_info165571443159777174636562737266615546704c6d14701711'
      );
    });

    test('creates correct base string for Merchant API', () => {
      const result = createBaseString({
        partnerId,
        path: '/api/v2/global_product/get_category',
        timestamp,
        apiType: 'merchant',
        accessToken: '09777174636962737266615546704c6d',
        merchantId: 1000000,
      });

      expect(result).toBe(
        '2001887/api/v2/global_product/get_category165571443109777174636962737266615546704c6d1000000'
      );
    });

    test('creates correct base string for Public API', () => {
      const result = createBaseString({
        partnerId,
        path: '/api/v2/public/get_shops_by_partner',
        timestamp,
        apiType: 'public',
      });

      expect(result).toBe('2001887/api/v2/public/get_shops_by_partner1655714431');
    });

    test('throws error for Shop API without accessToken', () => {
      expect(() => createBaseString({
        partnerId,
        path: '/api/v2/shop/get_shop_info',
        timestamp,
        apiType: 'shop',
        shopId: 14701711,
      })).toThrow('Shop API requires accessToken and shopId');
    });

    test('throws error for Shop API without shopId', () => {
      expect(() => createBaseString({
        partnerId,
        path: '/api/v2/shop/get_shop_info',
        timestamp,
        apiType: 'shop',
        accessToken: 'test-token',
      })).toThrow('Shop API requires accessToken and shopId');
    });
  });

  describe('calculateSignature', () => {
    test('generates correct HMAC-SHA256 signature', async () => {
      const baseString = '2001887/api/v2/shop/auth_partner1655714431';
      const signature = await calculateSignature(baseString, partnerKey);

      // Verify it's a valid hex string
      expect(signature).toMatch(/^[0-9a-f]{64}$/);
    });

    test('produces consistent results', async () => {
      const baseString = 'test-base-string';
      const sig1 = await calculateSignature(baseString, partnerKey);
      const sig2 = await calculateSignature(baseString, partnerKey);

      expect(sig1).toBe(sig2);
    });

    test('different inputs produce different signatures', async () => {
      const sig1 = await calculateSignature('input1', partnerKey);
      const sig2 = await calculateSignature('input2', partnerKey);

      expect(sig1).not.toBe(sig2);
    });
  });

  describe('generateSignature', () => {
    test('generates signature for Public API', async () => {
      const signature = await generateSignature({
        partnerId,
        partnerKey,
        path: '/api/v2/shop/auth_partner',
        timestamp,
        apiType: 'public',
      });

      expect(signature).toMatch(/^[0-9a-f]{64}$/);
    });

    test('generates signature for Shop API', async () => {
      const signature = await generateSignature({
        partnerId,
        partnerKey,
        path: '/api/v2/shop/get_shop_info',
        timestamp,
        apiType: 'shop',
        accessToken: 'test-token',
        shopId: 123456,
      });

      expect(signature).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('getTimestamp', () => {
    test('returns current Unix timestamp in seconds', () => {
      const before = Math.floor(Date.now() / 1000);
      const timestamp = getTimestamp();
      const after = Math.floor(Date.now() / 1000);

      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });
});
