import api from "../../axiosInstance";

type TProductCardParams = {
  name: string;
  description: string;
  price: number;
  stock: number;
  images_urls: UploadedFile[];
  category_id: number;
  preset_id: number;
  weight_grams: number;
  height_cm: number;
  width_cm: number;
  length_cm: number;
  discount: number;
};
interface UploadedFile {
  name: string;
  url: string;
  file: File;
}

export const createProductCards = async (data: TProductCardParams) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("price", String(data.price));
  formData.append("stock", String(data.stock));
  formData.append("category_id", String(data.category_id));
  formData.append("preset_id", String(data.preset_id));
  formData.append("weight_grams", String(data.weight_grams));
  formData.append("height_cm", String(data.height_cm));
  formData.append("width_cm", String(data.width_cm));
  formData.append("length_cm", String(data.length_cm));
  formData.append("discount", String(data.discount));

  data.images_urls.forEach((imgObj) => {
    if (imgObj.file instanceof File) {
      formData.append("images", imgObj.file);
    }
  });

  const response = await api.post(`/products/register`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
  return response.data;
};

type TCreateCategory = {
  name: string;
  description?: string;
  website?: string;
  logo_url?: string;
};

export const createCategory = async (data: TCreateCategory) => {
  const response = api.post("/category/register", { ...data });

  return response;
};

type TCreatePreset = {
  name: string;
  weight_grams: number;
  height_cm: number;
  width_cm: number;
  length_cm: number;
  is_active?: boolean;
  discount?: number;
};

export const createPresets = async (data: TCreatePreset) => {
  const response = api.post("/helpers/shipping-presets/create", { ...data });

  return response;
};
