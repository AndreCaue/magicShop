import { InputForm } from "@/components/new/InputForm";
import { NewButton } from "@/components/new/NewButton";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import z from "zod";

const formSchema = z.object({
  validationToken: z.string(),
  new_password: z.string(),
  confirm_password: z.string(),
});

export const RecoveryPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  console.log(token); // parei aqui

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = () => {};

  return (
    <div className="border border-red-500">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputForm
            control={control}
            name="new_password"
            background="dark"
            disabled={isSubmitting}
            iconPlaceholder={<Lock />}
          />

          <InputForm
            control={control}
            name="confirm_password"
            background="dark"
            disabled={isSubmitting}
            iconPlaceholder={<Lock />}
          />

          <NewButton label="Confirmar" disabled={isSubmitting} />
        </form>
      </Form>
    </div>
  );
};
