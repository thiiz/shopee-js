import { beforeEach, describe, expect, it, jest } from 'bun:test';
import { HttpClient } from '../src/http/client';
import { LogisticsModule } from '../src/modules/logistics';

describe('LogisticsModule', () => {
  let logistics: LogisticsModule;
  let mockHttpClient: HttpClient;
  const testAccessToken = 'test-access-token';

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
    } as unknown as HttpClient;

    logistics = new LogisticsModule(mockHttpClient);
  });

  it('getShippingParameter > should call API with correct parameters', async () => {
    await logistics.getShippingParameter(123456, testAccessToken, 'order-sn-1', 'pkg-1');

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      expect.stringContaining('get_shipping_parameter'),
      {
        order_sn: 'order-sn-1',
        package_number: 'pkg-1',
      },
      expect.objectContaining({
        shopId: 123456,
        accessToken: testAccessToken,
      })
    );
  });

  it('shipOrder > should call API with pickup parameters', async () => {
    await logistics.shipOrder(123456, testAccessToken, {
      orderSn: 'order-sn-1',
      pickup: {
        addressId: 1001,
        pickupTimeId: 'time-1',
      },
    });

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      expect.stringContaining('ship_order'),
      {
        order_sn: 'order-sn-1',
        pickup: {
          address_id: 1001,
          pickup_time_id: 'time-1',
        },
      },
      expect.objectContaining({
        shopId: 123456,
        accessToken: testAccessToken,
      })
    );
  });

  it('getTrackingNumber > should call API with optional fields', async () => {
    await logistics.getTrackingNumber(123456, testAccessToken, 'order-sn-1', undefined, ['plp_number']);

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      expect.stringContaining('get_tracking_number'),
      expect.objectContaining({
        order_sn: 'order-sn-1',
        response_optional_fields: 'plp_number',
      }),
      expect.objectContaining({
        accessToken: testAccessToken,
      })
    );
  });

  it('createShippingDocument > should format request correctly', async () => {
    await logistics.createShippingDocument(123456, testAccessToken, [
      { orderSn: 'sn1', documentType: 'NORMAL_AIR_WAYBILL' },
    ]);

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      expect.stringContaining('create_shipping_document'),
      {
        order_list: [
          {
            order_sn: 'sn1',
            package_number: undefined,
            document_type: 'NORMAL_AIR_WAYBILL',
          },
        ],
      },
      expect.objectContaining({
        accessToken: testAccessToken,
      })
    );
  });
});

