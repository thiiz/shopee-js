Return Refund Management
Last Updated: 2025-12-19
Language Supported: English / 简体中文 / 繁體中文 / Português (Brasil) / ไทย
1.Return Status Flow

2.Return API Call Flow
2.1 Getting the list of return orders and details
v2.returns.get_return_list API: You can get the list of returns and refund applications for a shop. Each application will return a return_sn as a unique ID. Buyers may submit multiple return_sn for the same order. The return parameter contains order_sn, which is the order number associated with this return refund application. In addition, the API supports filtering different types of returns and refund applications, including return status, negotiation status, evidence upload status, and seller compensation status.

v2.returns.get_return_detail API: Use return_sn to get order return details.

v2.returns.get_available_solutions API: Get the available solutions offered to buyers.

2.2 Refund Only

v2.returns.confirm API：Agree to the buyer's return application, only for the Full Refund type, the buyer does not need to return the product. Once agreed, the status will be updated to Accepted.

2.3 Return & Refund (No Dispute)

v2.returns.offer : The seller provides a return plan for the buyer to choose.

v2.returns.accept_offer：The seller accepts the return plan provided by the buyer.

2.4 Return & Refund (Dispute)

The seller can call v2.returns.get_available_solution API first, to determine the options or the return order, and then call v2.returns.offer API for the buyer to choose.

Buyers will also provide solutions to sellers. If the seller accepts, they can call v2.returns.accept_offer to accept the offer. If you cannot accept it, then you can call v2.returns.dispute to file a dispute with the Dispute Center.

At present, Open API only supports two statuses of REQUESTED and PROCESSING to dispute.

2.4.1 Dispute
If the seller has a dispute with the buyer’s return request, he can go to the Dispute Center to handle the request.

v2.returns.dispute: Used by sellers to escalate return orders to the dispute center.

After a dispute is raised, the seller can upload evidence images through API, but uploading videos is not currently supported.

v2.returns.convert_image：Convert image.

v2.returns.upload_proof: Upload pictures.

v2.returns.query_proof: Query uploaded images.

3.Data Definition
ReturnStatus
REQUESTED
ACCEPTED
CANCELLED
JUDGING
CLOSED
PROCESSING
SELLER_DISPUTE
ReturnReason and Reassessed Request Reason
NONE
NOT_RECEIPT
WRONG_ITEM
ITEM_DAMAGED
DIFFERENT_DESCRIPTION
MUTUAL_AGREE
OTHER
ITEM_WRONGDAMAGED(only for Vietnam)
CHANGE_MIND
ITEM_MISSING
EXPECTATION_FAILED
ITEM_FAKE
PHYSICAL_DMG
FUNCTIONAL_DMG
ReturnDisputeReason
Reason

NON_RECEIPT: I would like to reject the non-receipt claim

OTHER: I would like to reject the request

NOT_RECEIVED:I agree with the return request, but I did not receive product(s)

UNKNOWN

ReturnSolution
RETURN_REFUND
REFUND
NegotiationStatus
PENDING_RESPOND
PENDING_BUYER_RESPOND
TERMINATED
SellerProofStatus
PENDING
UPLOADED
OVERDUE
SellerCompensationStatus
COMPENSATION_NOT_APPLICABLE
COMPENSATION_INITIAL_STAGE
COMPENSATION_PENDING_REQUEST
COMPENSATION_NOT_REQUIRED
COMPENSATION_REQUESTED
COMPENSATION_APPROVED
COMPENSATION_REJECTED
COMPENSATION_CANCELLED
COMPENSATION_NOT_ELIGIBLE
Return Refund Request Type
0: Normal RR（RR is raised by the buyer after they have received the parcel, based on estimated delivery date /delivery done ）
1: In-Transit RR (RR is raised by the buyer while item is still in-transit to buyer)
2: Return-on-the-Spot (RR is raised by the driver after buyer rejected parcel at delivery)
Validation Type
seller_validation: For Return & Refund requests with return parcel that will be delivered to the seller for validation and decision whether to refund buyer or to raise dispute
warehouse_validation: For Return & Refund requests with return parcel that will be delivered to warehouse for validation and decision whether to refund buyer or to raise dispute
Reverse Logistics Status
[Normal Return]
LOGISTICS_PENDING_ARRANGE: Return is now pending user to select shipping option. Same for both integrated logistics and non-integrated logistics.
LOGISTICS_READY: User has selected shipping option, and pending system to create logistics request. Tracking number is not yet available. Same for both integrated logistics and non-integrated logistics.
LOGISTICS_REQUEST_CREATED: Means that the logistics request has been created successfully. Tracking number should be available
LOGISTICS_PICKUP_RETRY: Third party logistics provider will make another attempt to pick up parcel from buyer. Only available for integrated logistics since this is updated by third party logistics provider back to Shopee.
LOGISTICS_PICKUP_FAILED: Third party logistics provider has failed to pickup parcel from buyer. Only available for integrated logistics since this is updated by third party logistics provider back to Shopee.
LOGISTICS_PICKUP_DONE: For integrated logistics, this means the parcel has been picked up by a third party logistics provider. For non-integrated logistics, this means the user has entered shipping proof.
LOGISTICS_DELIVERY_FAILED: Parcel delivery to seller has failed. Only available for integrated logistics since this is updated by third party logistics provider back to Shopee.
LOGISTICS_LOST: Parcel has been marked as lost. Only available for integrated logistics since this is updated by third party logistics provider back to Shopee.
LOGISTICS_DELIVERY_DONE: Parcel has been successfully delivered to seller. Only available for integrated logistics since this is updated by third party logistics provider back to Shopee.
[In-transit RR]
Preparing
Delivered
Delivery Failed
Lost
[Return-on-the-Spot]
Preparing
Delivered
Delivery Failed
Lost
Post Return Logistics Status
Note this is only applicable to return parcels sent from warehouse back to seller

POST_RETURN_LOGISTICS_REQUEST_CREATED: Logistics request generated successfully with tracking number.
POST_RETURN_LOGISTICS_REQUEST_CANCELED: ​​Logistics request cancelled by warehouse team
POST_RETURN_LOGISTICS_PICKUP_FAILED: Failed to pickup parcel
POST_RETURN_LOGISTICS_PICKUP_RETRY: Subsequent attempt to pickup parcel.
POST_RETURN_LOGISTICS_PICKUP_DONE: Successful pickup; on the way to destination.
POST_RETURN_LOGISTICS_DELIVERY_FAILED: Failed delivery of parcel. Driver will return parcel back to warehouse.
POST_RETURN_LOGISTICS_DELIVERY_DONE: Successful delivery of parcel
POST_RETURN_LOGISTICS_LOST: Parcel marked as Lost
