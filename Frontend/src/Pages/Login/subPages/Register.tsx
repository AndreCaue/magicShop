import { NewButton } from "@/components/new/NewButton";
import { InputForm } from "@/components/new/InputForm";
import { PassInput } from "@/components/new/PassInput";
import { Form } from "@/components/ui/form";
import { useAuth } from "@/Hooks/useAuth";
import { createCadastro } from "@/Repositories/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Club } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  email: z.email(),
  email2: z.email(),
  password: z.string(),
  password2: z.string(),
});

type TForm = Required<z.infer<typeof formSchema>>;

export const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const form = useForm<TForm>({
    resolver: zodResolver(formSchema),
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: TForm) => {
    const { password, password2, email, email2 } = values;

    if (password !== password2) return toast.warning("Senhas não coincidem");
    if (email !== email2) return toast.warning("Emails não coincidem");
    setIsLoading(true);
    const res = await createCadastro({ email, password });
    setIsLoading(false);
    if (res?.error) return toast.error(res.error);

    toast.success("Cadastro realizado. Verique seu email!");
    navigate("/login");
  };
  useEffect(() => {
    if (!isLoggedIn) return;
    navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  return (
    <div>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-10 w-[400px] h-[250px] -mt-10">
            <div className="mx-auto -mt-50">
              <Club className="h-32 w-32 fill-white hover:scale-150" />
            </div>
            <InputForm
              label="Email"
              name="email"
              disabled={isLoading || isSubmitting}
              control={control}
            />
            <InputForm
              label="Confirme o email"
              name="email2"
              disabled={isLoading || isSubmitting}
              control={control}
            />
            <PassInput
              label="Senha"
              name="password"
              type="password"
              disabled={isLoading || isSubmitting}
              control={control}
            />
            <PassInput
              label="Confirme a senha"
              name="password2"
              type="password"
              disabled={isLoading || isSubmitting}
              control={control}
            />

            <NewButton label="Cadastrar" disabled={isSubmitting || isLoading} />
            <Link
              className="text-3xl text-center hover:text-white hover:scale-105"
              to={"/login"}
            >
              Login
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
};
