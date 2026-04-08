import { NewButton } from "@/components/new/NewButton";
import {
  DropdownForm,
  type TOptionsSelectForm,
} from "@/components/new/DropdownForm";
import { UploadImage } from "@/components/new/Dropzone";
import { InputForm } from "@/components/new/InputForm";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  getCategoryDropdown,
  getShippingPresets,
  getListOfProducts,
} from "@/Repositories/shop/dropdown";
import {
  getProductById,
  getShippingPresetsById,
} from "@/Repositories/shop/getters";
import { formatedToDropdown, type IDropdownOption } from "@/helpers/generics";
import { SimpleSelect } from "@/components/new/SimpleSelect";
import { updateProductCards } from "@/Repositories/admin";

const editFormSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  stock: z.string().optional(),
  price: z.string().optional(),
  weight_grams: z.number().optional(),
  height_cm: z.number().optional(),
  width_cm: z.number().optional(),
  length_cm: z.number().optional(),
  models: z.number().optional(),
  category_id: z.number().optional(),
  discount: z.number().optional(),
  images_urls: z.array(
    z.object({
      name: z.string().min(1, "Nome do arquivo é obrigatório"),
      url: z.string().url("URL inválida"),
      file: z
        .instanceof(File, { error: "Deve ser um arquivo válido" })
        .refine(
          (file) => file.size <= 5 * 1024 * 1024,
          "Arquivo muito grande (máx. 5MB)",
        )
        .refine(
          (file) => file.type.startsWith("image/"),
          "Apenas arquivos de imagem são permitidos",
        ),
    }),
  ),
  replace_images: z.boolean(),
  delete_image_indices: z.array(z.number()),
});

type TEditForm = z.infer<typeof editFormSchema>;

export const EditBaralhoForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState<IProduct | null>(null);
  const [branchs, setBranchs] = useState<IDropdownOption[]>([]);
  const [deckModels, setDeckModels] = useState<IDropdownOption[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [produtos, setProdutos] = useState<TOptionsSelectForm[]>([]);

  const form = useForm<TEditForm>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      images_urls: [],
      replace_images: false,
      delete_image_indices: [],
    },
  });

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { isSubmitting },
  } = form;

  const deleteImageIndices = watch("delete_image_indices");
  watch("replace_images");

  const fetchProducts = async () => {
    setIsLoading(true);
    setProductData(null);
    const res = await getListOfProducts();
    if (res) setProdutos(formatedToDropdown(res));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const loadAllData = async (productId: number) => {
    try {
      setIsLoading(true);

      const [product, categories, presets] = await Promise.all([
        getProductById(productId),
        getCategoryDropdown(),
        getShippingPresets(),
      ]);

      if (!product) {
        toast.error("Produto não encontrado");
        return;
      }

      setProductData(product);
      setCurrentImages(product.image_urls || []);

      setValue("delete_image_indices", []);
      setValue("replace_images", false);

      setValue("name", product.name);
      setValue("description", product.description || "");
      setValue("stock", product.stock.toString());
      setValue("price", product.price.toString());
      setValue("weight_grams", product.weight_grams);
      setValue("height_cm", product.height_cm);
      setValue("width_cm", product.width_cm);
      setValue("length_cm", product.length_cm);
      setValue("models", product.shipping_preset_id);
      setValue("category_id", product.category_id);
      setValue("discount", product.discount);

      if (categories) setBranchs(formatedToDropdown(categories));
      if (presets) setDeckModels(formatedToDropdown(presets));
    } catch (error) {
      toast.error("Erro ao carregar dados do produto");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePresets = async (presetId: number) => {
    if (!presetId) return;
    const res = await getShippingPresetsById(presetId);
    if (!res) return;

    setValue("height_cm", res.height_cm);
    setValue("length_cm", res.length_cm);
    setValue("weight_grams", res.weight_grams);
    setValue("width_cm", res.width_cm);
    setValue("discount", res.discount ?? 0);
  };

  const toggleDeleteImage = (index: number) => {
    const current = deleteImageIndices ?? [];
    const updated = current.includes(index)
      ? current.filter((i) => i !== index)
      : [...current, index];

    setValue("delete_image_indices", updated);
  };

  const onSubmit = async (values: TEditForm) => {
    if (!productData) return;

    try {
      const payload = {
        name: values.name,
        description: values.description,
        price: values.price ? Number(values.price) : undefined,
        stock: values.stock ? Number(values.stock) : undefined,

        weight_grams: values.weight_grams,
        height_cm: values.height_cm,
        width_cm: values.width_cm,
        length_cm: values.length_cm,

        category_id: values.category_id,
        preset_id: values.models,
        discount: values.discount,

        images: values.images_urls?.map((img) => img.file),

        replace_images: values.replace_images,
        delete_image_indices: values.delete_image_indices || [],
      };

      const success = await updateProductCards(productData.id, payload);

      if (success) {
        toast.success("Produto atualizado com sucesso!");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar o produto");
    }
  };

  const onSelectItem = (productId: number | null) => {
    if (!productId) return;
    loadAllData(productId);
  };

  if (!productData) {
    return (
      <div className="p-8 text-center text-white">
        <SimpleSelect
          options={produtos}
          label="Selecione o produto para editar."
          isLoading={isLoading}
          onSelect={onSelectItem}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">
        Editar Produto - #{productData.id}
      </h2>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <UploadImage
            name="images_urls"
            control={control}
            maxFiles={5}
            label="Adicionar novas imagens"
            isSkeletonLoading={isLoading}
            disabled={isSubmitting}
          />

          {currentImages.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-3">Imagens atuais:</p>
              <div className="flex flex-wrap gap-4">
                {currentImages.map((url, index) => {
                  const isMarkedForDelete =
                    deleteImageIndices?.includes(index) ?? false;

                  return (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`img-${index}`}
                        className={`w-24 h-24 object-cover rounded-lg border transition-all duration-200 ${
                          isMarkedForDelete
                            ? "opacity-30 border-red-500 grayscale"
                            : "border-gray-700"
                        }`}
                      />

                      {isMarkedForDelete && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg pointer-events-none">
                          <span className="text-red-400 text-xs font-bold tracking-wide">
                            Removida
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleDeleteImage(index)}
                        className={`absolute -top-2 -right-2 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full transition-colors duration-150 ${
                          isMarkedForDelete
                            ? "bg-gray-500 hover:bg-gray-400"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                        title={
                          isMarkedForDelete
                            ? "Cancelar remoção"
                            : "Marcar para remover"
                        }
                      >
                        {isMarkedForDelete ? "↩" : "✕"}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input type="checkbox" {...form.register("replace_images")} />
                  <span>Substituir todas as imagens atuais pelas novas</span>
                </label>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputForm
              control={control}
              label="Nome do Produto"
              name="name"
              background="dark"
              disabled={isSubmitting}
              isSkeletonLoading={isLoading}
            />
            <InputForm
              control={control}
              label="Descrição"
              name="description"
              background="dark"
              disabled={isSubmitting}
              isSkeletonLoading={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputForm
              control={control}
              label="Preço"
              name="price"
              background="dark"
              disabled={isSubmitting}
              isSkeletonLoading={isLoading}
            />
            <InputForm
              control={control}
              label="Estoque"
              name="stock"
              background="dark"
              disabled={isSubmitting}
              isSkeletonLoading={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DropdownForm
              control={control}
              label="Categoria"
              name="category_id"
              options={branchs}
              disabled={isSubmitting}
              isSkeletonLoading={isLoading}
            />
            <DropdownForm
              control={control}
              label="Modelo / Preset"
              name="models"
              options={deckModels}
              onChangeValue={handleChangePresets}
              disabled={isSubmitting}
              isSkeletonLoading={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <InputForm
              control={control}
              label="Peso (g)"
              name="weight_grams"
              background="dark"
              disabled={isSubmitting}
              isSkeletonLoading={isLoading}
            />
            <InputForm
              control={control}
              label="Altura (cm)"
              name="height_cm"
              background="dark"
              disabled={isSubmitting}
              isSkeletonLoading={isLoading}
            />
            <InputForm
              control={control}
              label="Largura (cm)"
              name="width_cm"
              background="dark"
              disabled={isSubmitting}
              isSkeletonLoading={isLoading}
            />
            <InputForm
              control={control}
              label="Comprimento (cm)"
              name="length_cm"
              background="dark"
              disabled={isSubmitting}
              isSkeletonLoading={isLoading}
            />
            <InputForm
              control={control}
              label="Desconto"
              name="discount"
              background="dark"
              disabled={isSubmitting}
              isSkeletonLoading={isLoading}
            />
          </div>

          <div className="flex gap-4 pt-6">
            <NewButton
              label="Salvar Alterações"
              disabled={isSubmitting}
              isSkeletonLoading={isSubmitting}
              className="flex-1"
            />
            <NewButton
              label="Cancelar"
              onClick={fetchProducts}
              disabled={isSubmitting}
              className="flex-1"
            />
          </div>
        </form>
      </Form>
    </div>
  );
};
