import { NewButton } from "@/components/new/NewButton";
import { InputForm } from "@/components/new/InputForm";
import { Form } from "@/components/ui/form";
import { createCategory } from "@/Repositories/shop/cadaster";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  website: z.string().optional(),
  logo_url: z.string().optional(),
});

type TForm = z.infer<typeof formSchema>;

export const CategoriaForm = () => {
  const form = useForm<TForm>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: TForm) => {
    const res = await createCategory(values);

    if (!res) return;
    toast.success("Categoria cadastrada.");
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
            <h1 className="text-4xl my-20 text-center">Cadastrar Categorias</h1>
            <InputForm
              control={control}
              label="Nome da Caterogia"
              name="name"
              required
              background="dark"
              className="w-full"
              disabled={isSubmitting}
            />
            <InputForm
              control={control}
              label="Descrição"
              name="description"
              background="dark"
              disabled={isSubmitting}
            />
            <InputForm
              control={control}
              label="URL"
              background="dark"
              name="website"
              disabled={isSubmitting}
            />

            <NewButton
              label="Cadastrar Categoria"
              className="flex"
              disabled={isSubmitting}
            />
          </div>
        </form>
      </Form>
    </div>
  );
};
