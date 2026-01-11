import { NewButton } from "@/components/new/NewButton";
import { InputForm } from "@/components/new/InputForm";
import { PassInput } from "@/components/new/PassInput";
import { Form } from "@/components/ui/form";
import { useAuth } from "@/Hooks/useAuth";
import { createCadastro } from "@/Repositories/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";
import { SmokeLink } from "@/components/new/SmokeLink";
import MatrixDeckRain from "@/Pages/Animations/MatrixDeckRain";
import { Mail, MailCheckIcon } from "lucide-react";

const formSchema = z
  .object({
    email: z.email(),
    confirm_email: z.email(),
    password: z.string(),
    confirm_password: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.email !== data.confirm_email) {
      ctx.addIssue({
        code: "custom",
        message: "Emails não coincidem",
        path: ["confirm_email"],
      });
    }
    if (data.password !== data.confirm_password) {
      ctx.addIssue({
        code: "custom",
        message: "Senhas não coincidem",
        path: ["confirm_password"],
      });
    }
  });

type TForm = Required<z.infer<typeof formSchema>>;

export const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const form = useForm<TForm>({
    resolver: zodResolver(formSchema),
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: TForm) => {
    const { password, email } = values;

    setIsLoading(true);
    const res = await createCadastro({ email, password });
    setIsLoading(false);
    if (res?.error) return toast.error(res.error);

    toast.success("Cadastro realizado. Verique seu email!");
    navigate("/login");
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <div>
      <MatrixDeckRain>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <h1 className="text-5xl text-center text-white">Registrar-se</h1>

            <div className="grid grid-col-4 gap-5 my-10 min-w-fit  md:min-w-sm">
              <InputForm
                label="Email"
                name="email"
                background="dark"
                disabled={isLoading || isSubmitting}
                iconPlaceholder={<Mail />}
                control={control}
              />
              <InputForm
                label="Confirme o email"
                name="confirm_email"
                background="dark"
                disabled={isLoading || isSubmitting}
                iconPlaceholder={<MailCheckIcon />}
                control={control}
              />
              <PassInput
                label="Senha"
                name="password"
                type="password"
                background="dark"
                disabled={isLoading || isSubmitting}
                control={control}
              />
              <PassInput
                label="Confirme a senha"
                name="confirm_password"
                background="dark"
                type="password"
                disabled={isLoading || isSubmitting}
                control={control}
              />
            </div>

            <div className="flex flex-col justify-center gap-10">
              <NewButton
                label="Cadastrar"
                className="bg-transparent text-white hover:bg-transparent"
                disabled={isSubmitting || isLoading}
              />
              <SmokeLink textLabel="Ir para Login" goTo={"/login"} />
            </div>
          </form>
        </Form>
      </MatrixDeckRain>
    </div>
  );
};
