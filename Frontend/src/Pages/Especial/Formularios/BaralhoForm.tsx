import { NewButton } from "@/components/new/NewButton";
import { DropdownForm } from "@/components/new/DropdownForm";
import { UploadImage } from "@/components/new/Dropzone";
import { InputForm } from "@/components/new/InputForm";
import { Form } from "@/components/ui/form";
import { createProductCards } from "@/Repositories/shop/cadaster";
import {
  getBranchDropdown,
  getShippingPresets,
} from "@/Repositories/shop/dropdown";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { getShippingPresetsById } from "@/Repositories/shop/getters";

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
  brand_id: z.number(),
  images_urls: z.array(
    z.object({
      name: z.string().min(1, "Nome do arquivo é obrigatório"),
      url: z.url("URL inválida"), // Valida se é uma URL válida (data URL no caso)
      file: z
        .instanceof(File, { error: "Deve ser um arquivo válido" })
        .refine(
          (file) => file.size <= 5 * 1024 * 1024, // Ex: máx. 5MB
          "Arquivo muito grande (máx. 5MB)"
        )
        .refine(
          (file) => file.type.startsWith("image/"), // Só imagens
          "Apenas arquivos de imagem são permitidos"
        ),
    })
  ),
});

type TForm = z.infer<typeof formSchema>;

const formatedToDrop = (arr: any) => {
  return arr?.map((x) => ({ text: x.descricao || x.name, value: x.id })) || [];
};

export const BaralhoForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [branchs, setBranchs] = useState([]);
  const [deckModels, setDeckModels] = useState([]);

  const form = useForm<TForm>({
    resolver: zodResolver(formSchema),
  });

  const {
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting },
  } = form;

  const getDropdownBranch = async () => {
    const branchs = await getBranchDropdown();
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
    getDropdownBranch();
    getDropdownShip();
    setIsLoading(false);
  }, []);

  // const teste = async (id: number) => await getShippingPresetsById(id);

  const handleChangePresets = async (v: number) => {
    if (!v) {
      form.reset({
        ...form.getValues(),
        height_cm: undefined,
        length_cm: undefined,
        weight_grams: undefined,
        width_cm: undefined,
      });
      return;
    }
    const res = await getShippingPresetsById(v);
    if (!res) return;
    setValue("height_cm", res.height_cm);
    setValue("length_cm", res.length_cm);
    setValue("weight_grams", res.weight_grams);
    setValue("width_cm", res.width_cm);
    console.log(res, "teste de resultado");
  };

  const onSubmit = async (values: TForm) => {
    console.log(values, "teste");

    const res = await createProductCards({
      // dando 401 não autorizado
      ...values,
      price: Number(values.price),
      stock: Number(values.stock),
    });

    if (!res) return;
    toast.success("Item cadastrado.");
    form.reset();
  };

  return (
    <div className="">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1">
            <UploadImage
              name="images_urls"
              control={control}
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
            <div className="flex gap-4 mt-1">
              <InputForm
                control={control}
                label="Quantidade"
                name="stock"
                background="dark"
                className="w-1/2"
                disabled={isSubmitting}
                required
                isSkeletonLoading={isLoading}
              />
              <InputForm
                control={control}
                label="Preço"
                name="price"
                className="w-1/2"
                background="dark"
                disabled={isSubmitting}
                required
                isSkeletonLoading={isLoading}
              />
            </div>

            <div className="flex w-full gap-4 mt-1">
              <DropdownForm
                control={control}
                label="Marca"
                required
                disabled={isSubmitting}
                className="w-full placeholder-white"
                name="brand_id"
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
                options={deckModels} // chamar função de get e passar id
                isSkeletonLoading={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <InputForm
                control={control}
                label="Peso em Gramas"
                name="weight_grams"
                background="dark"
                // disabled
                required
                isSkeletonLoading={isLoading}
              />
              <InputForm
                control={control}
                label="Altura (cm)"
                name="height_cm"
                background="dark"
                required
                // disabled
                isSkeletonLoading={isLoading}
              />
              <InputForm
                control={control}
                label="Largura (cm)"
                background="dark"
                name="width_cm"
                required
                // disabled
                isSkeletonLoading={isLoading}
              />
              <InputForm
                control={control}
                label="Comprimento"
                background="dark"
                name="length_cm"
                required
                // disabled
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
