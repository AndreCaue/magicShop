import { NewButton } from "@/components/new/NewButton";
import { InputForm } from "@/components/new/InputForm";
import { Form } from "@/components/ui/form";
import { createPresets } from "@/Repositories/shop/cadaster";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  name: z.string(),
  weight_grams: z.string(),
  height_cm: z.string().min(1),
  width_cm: z.string().min(1),
  length_cm: z.string().min(1),
  is_active: z.boolean().optional(),
  discount: z.string().optional(),
});

type TForm = z.infer<typeof formSchema>;

export const PresetsForm = () => {
  const form = useForm<TForm>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: TForm) => {
    const res = await createPresets({
      name: values.name,
      weight_grams: Number(values.weight_grams),
      height_cm: Number(values.height_cm),
      width_cm: Number(values.width_cm),
      length_cm: Number(values.length_cm),
      discount: Number(values.discount),
      is_active: true,
    });

    if (!res) return;
    toast.success("Pre-definição cadastrada.");
  };

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = form;

  return (
    <div className="">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-5 w-full px-10 place-self-center">
            <div className="my-20 text-center   ">
              <h1 className="text-4xl">Dimensões</h1>
              <p>Crie pre-definições de tamanho para calcular o frete</p>
            </div>
            <div className="grid grid-cols-3 gap-5">
              <InputForm
                control={control}
                label="Nome da Definição"
                name="name"
                background="dark"
                required
                className="w-full col-span-2"
                disabled={isSubmitting}
              />
              <InputForm
                control={control}
                label="Peso (gramas)"
                background="dark"
                name="weight_grams"
                required
                disabled={isSubmitting}
              />
              <InputForm
                control={control}
                label="Altura (cm)"
                background="dark"
                name="height_cm"
                disabled={isSubmitting}
              />
              <InputForm
                control={control}
                label="Largura (cm)"
                background="dark"
                name="width_cm"
                disabled={isSubmitting}
              />
              <InputForm
                control={control}
                label="Comprimento (cm)"
                background="dark"
                name="length_cm"
                disabled={isSubmitting}
              />
              <InputForm
                control={control}
                label="Deseja adicionar desconto?"
                background="dark"
                placeholder="Adicione valor em RS"
                name="discount"
                disabled={isSubmitting}
              />
              <InputForm
                control={control}
                label="Radio button para desativar o preset (cm)"
                className="hidden"
                name="is_active"
                disabled={isSubmitting}
              />
            </div>

            <NewButton label="Cadastrar Modelo" className="flex mt-20" />
          </div>
        </form>
      </Form>
    </div>
  );
};
