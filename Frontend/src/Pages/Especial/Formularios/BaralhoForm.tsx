import { NewButton } from "@/components/new/NewButton";
import { DropdownForm } from "@/components/new/DropdownForm";
import { UploadImage } from "@/components/new/Dropzone";
import { InputForm } from "@/components/new/InputForm";
import { Form } from "@/components/ui/form";
import { createProductCards } from "@/Repositories/shop/cadaster";
import {
  getCategoryDropdown,
  getShippingPresets,
} from "@/Repositories/shop/dropdown";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { getShippingPresetsById } from "@/Repositories/shop/getters";
import { formatedToDrop, type IDropdownOption } from "@/helpers/generics";

const formSchema = z.object({
  name: z.string(),
  description: z.string(),
  stock: z.string(),
  price: z.string(),
  weight_grams: z.number(),
  height_cm: z.number(),
  width_cm: z.number(),
  length_cm: z.number(),
  models: z.number(),
  category_id: z.number(),
  discount: z.number(),
  images_urls: z.array(
    z.object({
      name: z.string().min(1, "Nome do arquivo é obrigatório"),
      url: z.url("URL inválida"),
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
});

type TForm = z.infer<typeof formSchema>;

export const BaralhoForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [branchs, setBranchs] = useState<IDropdownOption[]>([]);
  const [deckModels, setDeckModels] = useState<IDropdownOption[]>([]);

  const form = useForm<TForm>({
    resolver: zodResolver(formSchema),
  });

  const {
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting },
  } = form;

  const getDropdownCategory = async () => {
    const branchs = await getCategoryDropdown();
    if (!branchs) return;

    setBranchs(formatedToDrop(branchs));
  };

  const getDropdownShip = async () => {
    const deckM = await getShippingPresets();
    if (!deckM) return;

    setDeckModels(formatedToDrop(deckM));
  };

  useEffect(() => {
    setIsLoading(true);
    getDropdownCategory();
    getDropdownShip();
    setIsLoading(false);
  }, []);

  const handleChangePresets = async (v: number) => {
    if (!v) {
      form.reset({
        ...form.getValues(),
        height_cm: undefined,
        length_cm: undefined,
        weight_grams: undefined,
        width_cm: undefined,
        discount: undefined,
      });
      return;
    }
    const res = await getShippingPresetsById(v);
    if (!res) return;
    setValue("height_cm", res.height_cm);
    setValue("length_cm", res.length_cm);
    setValue("weight_grams", res.weight_grams);
    setValue("width_cm", res.width_cm);
    setValue("discount", res?.discount ?? 0);
  };

  const onSubmit = async (values: TForm) => {
    const res = await createProductCards({
      ...values,
      price: Number(values.price),
      stock: Number(values.stock),
      preset_id: Number(values.models),
    });

    if (!res) return;
    toast.success("Item cadastrado.");
    form.reset();
  };

  return (
    <div className="">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4 ">
            <UploadImage
              name="images_urls"
              control={control}
              maxFiles={5}
              className="mb-5"
              isSkeletonLoading={isLoading}
              disabled={isSubmitting}
            />
            <InputForm
              control={control}
              label="Nome do Produto"
              name="name"
              required
              background="dark"
              disabled={isSubmitting}
              className="w-full placeholder:text-white"
              isSkeletonLoading={isLoading}
            />
            <InputForm
              control={control}
              label="Descrição do Produto"
              name="description"
              className="mt-1"
              background="dark"
              disabled={isSubmitting}
              required
              isSkeletonLoading={isLoading}
            />
            <div className="grid lg:flex gap-4 mt-1">
              <InputForm
                control={control}
                label="Quantidade"
                name="stock"
                background="dark"
                className="lg:w-1/2"
                disabled={isSubmitting}
                required
                isSkeletonLoading={isLoading}
              />
              <InputForm
                control={control}
                label="Preço"
                name="price"
                className="lg:w-1/2"
                background="dark"
                disabled={isSubmitting}
                required
                isSkeletonLoading={isLoading}
              />
            </div>

            <div className="lg:flex w-full gap-4 mt-1">
              <DropdownForm
                control={control}
                label="Categoria"
                required
                disabled={isSubmitting}
                className="w-full placeholder-white"
                name="category_id"
                options={branchs}
                isSkeletonLoading={isLoading}
              />
              <DropdownForm
                control={control}
                label="Selecionar Modelo"
                required
                disabled={isSubmitting}
                className="w-full"
                name="models"
                onChangeValue={handleChangePresets}
                options={deckModels}
                isSkeletonLoading={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
              <InputForm
                control={control}
                label="Peso em Gramas"
                name="weight_grams"
                background="dark"
                disabled
                required
                isSkeletonLoading={isLoading}
              />

              <InputForm
                control={control}
                label="Altura (cm)"
                name="height_cm"
                background="dark"
                required
                disabled
                isSkeletonLoading={isLoading}
              />

              <InputForm
                control={control}
                label="Largura (cm)"
                background="dark"
                name="width_cm"
                required
                disabled
                isSkeletonLoading={isLoading}
              />

              <InputForm
                control={control}
                label="Comprimento"
                background="dark"
                name="length_cm"
                required
                disabled
                isSkeletonLoading={isLoading}
              />

              <InputForm
                control={control}
                label="Deseja aplicar desconto?"
                background="dark"
                name="discount"
                required
                disabled
                isSkeletonLoading={isLoading}
              />
            </div>
          </div>

          <NewButton
            label="Cadastrar item"
            className="flex"
            isSkeletonLoading={isLoading}
            disabled={isSubmitting}
          />
        </form>
      </Form>
    </div>
  );
};
