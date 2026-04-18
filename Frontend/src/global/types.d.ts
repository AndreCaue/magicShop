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
  reserved_stock: number;
  image_urls: string[];
  category_id: number;
  id: number;
  discount: number;
  category: ICategory;
  weight_grams?: number;
  height_cm?: number;
  width_cm?: number;
  length_cm?: number;
  shipping_preset_id?: number;
}

interface IResMessage {
  message: string;
}

interface ITickItem {
  value?: any;
  coordinate: number;
  index?: number;
}
interface IName {
  name: string;
  value: number;
}
