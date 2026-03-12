export enum PaymentStatus {
  SUCCESFUL = 'Successful',
  FAILED = 'Failed',
  PENDING = 'Pending',
}

export enum BidStatus {
  BID_SENT = 'Bid_sent',
  COUNTERED = 'Countered',
  BID_ACCEPTED = 'Bid_accepted',
  BID_DECLINED = 'Bid_declined',
}

export enum BidTypeAccepted {
  INITIAL = 'Initial',
  COUNTER = 'Counter',
 
}

export enum OrderStatus {
  COMPLETED = 'completed',
  ONGOING = 'ongoing',
  PENDING = 'pending',
}

export enum BidAction {
  ACCEPT = 'ACCEPT',
  DECLINE = 'DECLINE'
}

export interface BidActionResult {
  success: boolean;
  message: string;
}

export enum RideStatus{
  ONGOING='Ongoing',
  CONCLUDED='Concluded',
  CANCELLED ='Cancelled',
  PENDING ='Pending'
}

export enum RiderMileStones{
  ENROUTE_TO_PICKUP_LOCATION= "enroute_to_pickup_location",
  AT_PICKUP_LOCATION ="at_pickup_location",
  PICKED_UP_PARCEL ="picked_up_parcel",
  ENROUTE_TO_DROPOFF_LOCATION= "enroute_to_dropoff_location",
  AT_DROPOFF_LOCATION ="at_dropoff_location",
  DROPPED_OFF_PARCEL ="dropped_off-parcel",
}
