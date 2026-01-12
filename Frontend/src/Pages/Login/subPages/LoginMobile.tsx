import { InputForm } from "@/components/new/InputForm";
import { Form } from "@/components/ui/form";
import { useAuth } from "@/Hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";
import { SmokeLink } from "@/components/new/SmokeLink";
import { LogoTitle } from "./Components/LogoTitle";
import { getValidationLogin } from "@/Repositories/auth";
import type { TUser } from "@/Pages/Provider/AuthProvider";
import ScatterBtn from "@/Pages/Animations/Scatter/ScatterBtn";

const formSchema = z.object({
  email: z.string(),
  senha: z.string(),
});

type TForm = Required<z.infer<typeof formSchema>>;

export const LoginMobile = () => {
  const form = useForm<TForm>({ resolver: zodResolver(formSchema) });
  const {
    formState: { isSubmitting },
  } = form;
  const { login } = useAuth();

  const { state } = useLocation();
  const navigate = useNavigate();

  const { control, handleSubmit } = form;
  const onSubmit = async (values: TForm) => {
    const res = await getValidationLogin({
      username: values.email,
      password: values.senha,
    });

    if (res.error) return toast.error(res.message);

    const { access_token, is_verified } = res;

    const userData: TUser = {
      email: values.email,
      scopes: res.scopes || [],
      isMaster: res.is_master || false,
      isBasic: (res.scopes || []).includes("basic"),
      isPremium: (res.scopes || []).includes("premium"),
      isVerified: res.is_verified || false,
    };

    login(access_token, userData);

    localStorage.setItem("is_verify", is_verified);

    toast.success("Login efetuado com sucesso");
    const redirectTo = state?.from?.pathname || "/";
    navigate(redirectTo, { replace: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <LogoTitle isMobile />

          <InputForm
            name="email"
            control={control}
            iconPlaceholder={<User />}
            type="email"
            background="dark"
            disabled={isSubmitting}
          />
          <InputForm
            name="senha"
            control={control}
            iconPlaceholder={<Lock />}
            type="password"
            background="dark"
            disabled={isSubmitting}
          />

          <ScatterBtn
            text="Acessar"
            className="cursor-pointer hover:bg-black"
            isSubmitting={isSubmitting}
          />

          <div className="flex flex-col mt-2 -mb-20 gap-8 text-center">
            <SmokeLink
              goTo="/forgot_password"
              textLabel="Esqueceu a senha ? "
              isMobile
            />
            <SmokeLink goTo="/register" textLabel="Registrar-se" isMobile />
          </div>
        </div>
      </form>
    </Form>
  );
};
