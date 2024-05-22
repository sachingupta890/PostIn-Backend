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
