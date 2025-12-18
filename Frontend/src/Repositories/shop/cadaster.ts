import api from "../../axiosInstance";

type TProductCardParams = {
  name: string;
  description: string;
  price: number;
  stock: number;
  images_urls: UploadedFile[];
  brand_id: number;
  weight_grams: number;
  height_cm: number;
  width_cm: number;
  length_cm: number;
};
interface UploadedFile {
  name: string;
  url: string;
  file: File;
}

export const createProductCards = async (data: TProductCardParams) => {
  const formData = new FormData();

  // Adiciona campos normais
  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("price", String(data.price));
  formData.append("stock", String(data.stock));
  formData.append("brand_id", String(data.brand_id));
  formData.append("weight_grams", String(data.weight_grams));
  formData.append("height_cm", String(data.height_cm));
  formData.append("width_cm", String(data.width_cm));
  formData.append("length_cm", String(data.length_cm));

  // Adiciona imagens
  data.images_urls.forEach((imgObj) => {
    if (imgObj.file instanceof File) {
      formData.append("images", imgObj.file);
    }
  });

  const response = await api.post(`/products/register`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true, // redundante mas seguro
  });
  return response.data;
};

type TCreateBranch = {
  name: string;
  description?: string;
  website?: string;
  logo_url?: string;
};

export const createBranch = async (data: TCreateBranch) => {
  const response = api.post("/brands/register", { ...data });

  return response;
};

type TCreatePreset = {
  name: string;
  weight_grams: number;
  height_cm: number;
  width_cm: number;
  length_cm: number;
  is_active?: boolean;
};

export const createPresets = async (data: TCreatePreset) => {
  const response = api.post("/helpers/shipping-presets/create", { ...data });

  return response;
};
