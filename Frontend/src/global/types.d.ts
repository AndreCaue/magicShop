interface ICategory {
  name: string;
  description: string;
  website: string;
  logo_url: string; // usado como icon
  id: number;
}

interface IProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  image_urls: string[];
  category_id: number;
  id: number;
  discount: number;
  category: ICategory;
}

interface IResMessage {
  message: string;
}
