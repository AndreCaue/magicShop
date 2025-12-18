interface IBrand {
  name: string;
  description: string;
  website: string;
  logo_url: string;
  id: number;
}

interface IProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  image_urls: string[];
  brand_id: number;
  id: number;
  brand: Brand;
}

interface IResMessage {
  message: string;
}
