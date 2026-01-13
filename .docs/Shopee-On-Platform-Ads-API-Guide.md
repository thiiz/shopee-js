Shopee On-Platform Ads API Guide
Last Updated: 2026-01-08
Language Supported: English / 简体中文 / ไทย
What is Shopee Ads
Shopee Ads allow you to create ads within Shopee’s platform to increase exposure for your products and shop.



Learn Shopee Ads：https://ads.shopee.sg/learn/faq/96/195

Ads Open API Usage Rules


When using the advertising  API, you need to abide by the following rules we have listed so that Shopee can create a fair and safe market for all sellers:

When processing advertising data, you need to comply with the platform's data protection policy.
The advertising API is limited to Shopee's official cooperative ISVs and is used with platform sellers. It can be used for shop advertising operations and official cooperation agency operation projects. The advertising API cannot be used for other purposes.
shop data may not be used for any purpose other than shop operations and official Shopee cooperation projects.
To retrieve seller shop data through the ISV API, you need to obtain the consent of the platform seller through the authorization process.


Tips: If you fail to comply with our norms and rules, you will receive a warning email from Shopee; if you fail to modify it in time, you may face our penalties.



Ads Open API Instruction


1. Retrieve Ad Balance and Shop Settings

v2.ads.get_total_balance: Use this API to retrieve the seller's real-time total ad credit balance, including both paid and free credits. Sellers can monitor their balance status through this API to ensure that the balance is sufficient for normal ad operations.
v2.ads.get_shop_toggle_info: Use this API to retrieve the shop’s ad settings, such as whether auto top-up and ad price optimization features are enabled.


Top_Up Toggle: Enable/disable auto top-up






Campaign_Surge: Turn on/off ads price optimization in the campaign period

Campaign_Surge: Enable/disable ad price optimization


2.Obtain real-time performance overview data of product ads (shop dimension)



v2.ads.get_all_cpc_ads_hourly_performance: Use this API to obtain the hourly performance data of store-level CPC advertisements for a single day. Sellers can access information such as daily Conversions, Conversion Rate, items sold, GMV, Ad GMV/Ad Expenditure, etc.
v2.ads.get_all_cpc_ads_daily_performance: Using this API, you can obtain the multi-day performance of store-level CPC ads (with the time dimension unit being days). Sellers can get information such as daily conversions, conversion rate, items sold, GMV, Ad GMV/Ad Expenditure, etc., over multiple days.

3. Retrieve Recommended Keywords and Product Data

v2.ads.get_recommended_keyword_list: Use this API to retrieve a list of recommended keywords per item, along with optional search keywords. Sellers can also view keyword quality scores, search volume, and suggested bids.
v2.ads.get_recommended_item_list: Use this API to retrieve a list of recommended SKUs (shop-level) with specific tags such as Hot Search, Best Seller, or Best ROI.





4. Retrieve Campaign-Level Data

v2.ads.get_product_level_campaign_id_list: Use this API to get the list of ad campaigns associated with a specific product.
v2.ads.get_product_level_campaign_setting_info: Use this API to retrieve detailed settings for a specific ad campaign.
v2.ads.get_product_campaign_daily_performance and v2.ads.get_product_campaign_hourly_performance: Use these APIs to obtain daily/hourly performance data for product-level ad campaigns.




5. Create Auto Product Ads

v2.ads.create_auto_product_ads (Whitelist shop required)




6. Create GMV Max and Manual Product Ads

v2.ads.create_manual_product_ads

To create GMV Max ads, pass bidding_method=auto
To create Manual ads, pass bidding_method=manual

When creating manual ads (bidding_method=manual), you can use v2.ads.get_recommended_item_list and v2.ads.get_recommended_keyword_list to get suggested products and keywords for advertising. Then, input the budget, placement, and other necessary parameters to launch the ads.





7. Retrieve Ad Budget and ROAS

v2.ads.get_product_recommended_roi_target: Get the ROAS (Return on Ad Spend) value when creating GMV Max ads.
v2.ads.get_create_product_ad_budget_suggestion: Retrieve budget suggestions for creating product ads.






If you encounter problems, it is recommended to check the Developer Guide and search for FAQ.

If you encounter problems, please log in to the Open Platform Console to Raise a ticket.







Ads service API Permission ：https://open.shopee.cn/faq/281