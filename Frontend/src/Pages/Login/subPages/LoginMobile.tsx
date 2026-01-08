import { NewButton } from "@/components/new/NewButton";
import { InputForm } from "@/components/new/InputForm";
import { Form } from "@/components/ui/form";
import { useAuth } from "@/Hooks/useAuth";
import { login } from "@/Services/authService";
import { useUser } from "@/Services/userService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";
import MobileForgotLink from "@/components/new/Teste";

const formSchema = z.object({
  email: z.string(),
  senha: z.string(),
});

type TForm = Required<z.infer<typeof formSchema>>;

export const LoginMobile = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TForm>({ resolver: zodResolver(formSchema) });
  const { handleLogin } = useAuth();
  const { setUser } = useUser();

  const navigate = useNavigate();

  const { control, handleSubmit } = form;
  const onSubmit = async (values: TForm) => {
    setIsLoading(true);
    const res = await login(values.email, values.senha);
    setIsLoading(false);
    if (res.error) return toast.error(res.message);

    const { access_token, is_verified } = res;

    setUser({
      email: values.email,
      scopes: res.scopes || [],
      isMaster: res.is_master || false,
      isBasic: (res.scopes || []).includes("basic"),
      isPremium: (res.scopes || []).includes("premium"),
      isVerified: res.is_verified || false,
    });

    localStorage.setItem("is_verify", is_verified);
    handleLogin(access_token);

    toast.success("Login efetuado com sucesso");
    navigate("/");
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <div
            style={{
              background:
                "linear-gradient(45deg, #f9f6ec, #88a1a8, #502940, #790614, #0d0c0c)",
            }}
            className="flex h-20 w-20 place-self-center my-20 rotate-45" // rotate-45
          >
            <span
              style={{
                fontFamily: "'Road Rage', sans-serif",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "100px",
              }}
              className=" text-slate-200 absolute -bottom-8 left-[25%] -rotate-45"
              // -rotate-45
            >
              D
            </span>
            <span
              style={{
                fontFamily: "'Road Rage', sans-serif",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "100px",
              }}
              className="text-white absolute left-[40%] -bottom-7 rotate-40 "
            >
              I
            </span>
          </div>

          <InputForm
            name="email"
            control={control}
            placeholder="Email"
            iconPlaceholder={<User />}
            type="email"
            background="dark"
            isSkeletonLoading={isLoading}
            disabled={isLoading}
          />
          <InputForm
            name="senha"
            control={control}
            iconPlaceholder={<Lock />}
            type="password"
            background="dark"
            isSkeletonLoading={isLoading}
            disabled={isLoading}
          />

          <NewButton disabled={isLoading} label="Acessar" />

          <div className="flex flex-col mt-2 -mb-20 gap-40 text-center">
            <MobileForgotLink /> {/* Teste em produção. */}
            {/* <Link
              className="text-3xl text-white hover:text-black hover:scale-110 transition-all duration-300"
              to={"/register"}
            >
              Registrar-se
            </Link> */}
            <MobileForgotLink />
          </div>
        </div>
      </form>
    </Form>
  );
};
