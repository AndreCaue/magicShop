import { InputForm } from "@/components/new/InputForm";
import { Form } from "@/components/ui/form";
import { useAuth } from "@/Hooks/useAuth";
import ScatterBtn from "@/Pages/Animations/Scatter/ScatterBtn";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";
import "./index.css";
import { Lock, User } from "lucide-react";
import { SmokeLink } from "@/components/new/SmokeLink";
import { LogoTitle } from "./Components/LogoTitle";
import { getValidationLogin } from "@/Repositories/auth";
import type { TUser } from "@/Pages/Provider/AuthProvider";

const formSchema = z.object({
  email: z.string(),
  senha: z.string(),
});

type TForm = Required<z.infer<typeof formSchema>>;

export const LoginDesktop = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<TForm>({
    resolver: zodResolver(formSchema),
  });

  const {
    formState: { isSubmitting },
    handleSubmit,
    control,
  } = form;

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

    await login(access_token, userData);
    localStorage.setItem("is_verify", is_verified);

    toast.success("Login efetuado com sucesso");
    navigate("/");
  };

  return (
    <div className="items-center flex h-screen w-full justify-center">
      <div className=" w-1/3  rounded grid grid-rows-4">
        <div className="col-span-2 justify-center flex items-center">
          <LogoTitle />
        </div>
        <Form {...form}>
          <form
            className="row-span-4 col-span-2 gap-5 flex flex-col py-10 p-5"
            onSubmit={handleSubmit(onSubmit)}
          >
            <InputForm
              label="Email"
              name="email"
              control={control}
              iconPlaceholder={<User />}
              background="dark"
              disabled={isSubmitting}
            />
            <InputForm
              label="Senha"
              name="senha"
              background="dark"
              type="password"
              iconPlaceholder={<Lock />}
              control={control}
              disabled={isSubmitting}
            />

            <ScatterBtn
              text="Entre na Ilusão"
              className="cursor-pointer hover:scale-105"
              isSubmitting={isSubmitting}
            />

            <div className="flex flex-col mt-2 gap-8 text-center">
              <SmokeLink
                goTo={"/forgot_password"}
                className="text-white"
                textLabel="Esqueceu sua senha ?"
              />

              <SmokeLink
                goTo={"/register"}
                textLabel="Registrar-se"
                className="text-white"
              />
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
