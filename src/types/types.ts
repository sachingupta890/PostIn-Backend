export interface NewUserRequestBody {
  name: string;
  email: string;
  _id: string;
  gender: string;
  dob: Date;
  photo: string;
}

export interface NewProductRequestBody {
  name: string;
  category: string;
  price: number;
  stock: number;
}

export type SearchRequestQuery = {
  search?: string;
  price?: string;
  category?: string;
  sort?: string;
  page?: string;
};

export interface BaseQueryType {
  name?: { $regex: string; $options: String };

  price?: { $lte: number };
  category?: string;
}

export type InvalidateCacheProp = {
  product?: boolean;
  order?: boolean;
  admin?: boolean;
  productId?: string | string[];
  orderId?: string;
  userId?: string; 
};

export type OrderItemType = {
  name: string;
  photo: string;
  price: number;
  quantity: number;
  productId: string;
}

export type ShippingInfoType = {
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: number;
}

export interface NewOrderRequestBody {
  shippingInfo: ShippingInfoType;
  user: string;
  subtotal: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  total: number;
  orderItems: OrderItemType[];
}

export interface NewCouponBody{
  coupon: string,
  amount:string
}