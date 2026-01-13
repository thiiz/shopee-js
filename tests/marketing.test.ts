import { beforeEach, describe, expect, it, jest } from 'bun:test';
import { HttpClient } from '../src/http/client';
import { MarketingModule } from '../src/modules/marketing';

describe('MarketingModule', () => {
  let marketing: MarketingModule;
  let mockHttpClient: HttpClient;
  const testAccessToken = 'test-access-token';
  const testShopId = 123456;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
    } as unknown as HttpClient;

    marketing = new MarketingModule(mockHttpClient);
  });

  it('getAdList > should call API with correct parameters', async () => {
    const params = {
      type: 'product_search_ad' as const,
      status: 'ongoing' as const,
      page_size: 10,
    };

    await marketing.getAdList(testShopId, testAccessToken, params);

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      expect.stringContaining('get_ad_list'),
      params,
      expect.objectContaining({
        shopId: testShopId,
        accessToken: testAccessToken,
      })
    );
  });

  it('getShopAdsDailyReport > should call API with correct parameters', async () => {
    const params = {
      date: '2023-10-01',
    };

    await marketing.getShopAdsDailyReport(testShopId, testAccessToken, params);

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      expect.stringContaining('get_shop_ads_daily_report'),
      params,
      expect.objectContaining({
        shopId: testShopId,
        accessToken: testAccessToken,
      })
    );
  });

  it('mutateAds > should call API with correct parameters', async () => {
    const params = {
      operation: 'update' as const,
      ads: [{ ad_id: 123, ad_status: 'paused' as const }],
    };

    await marketing.mutateAds(testShopId, testAccessToken, params);

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      expect.stringContaining('mutate_ads'),
      params,
      expect.objectContaining({
        shopId: testShopId,
        accessToken: testAccessToken,
      })
    );
  });
});
