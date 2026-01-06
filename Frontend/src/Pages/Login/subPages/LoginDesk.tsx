import AnimatedTitle from "@/components/new/AnimatedTitle";
import { InputForm } from "@/components/new/InputForm";
import { Form } from "@/components/ui/form";
import { useAuth } from "@/Hooks/useAuth";
import ScatterBtn from "@/Pages/Animations/Scatter/ScatterBtn";
import { login } from "@/Services/authService";
import { useUser } from "@/Services/userService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  email: z.string(),
  senha: z.string(),
});

type TForm = Required<z.infer<typeof formSchema>>;

export const LoginDesk = () => {
  const navigate = useNavigate();
  const { handleLogin } = useAuth();
  const { setUser } = useUser();

  const form = useForm<TForm>({
    resolver: zodResolver(formSchema),
  });

  const {
    formState: { isSubmitting },
    handleSubmit,
    control,
  } = form;

  const onSubmit = async (values: TForm) => {
    const res = await login(values.email, values.senha);
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
    <div className="text-white items-center flex h-screen w-full justify-center">
      <div className=" w-1/3 border border-slate-600 rounded grid grid-rows-4">
        <div className="col-span-2 justify-center flex items-center">
          <AnimatedTitle
            text="L O G I N"
            level="h1"
            size="medium"
            align="center"
          />
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
              background="dark"
              disabled={isSubmitting}
            />
            <InputForm
              label="Senha"
              name="senha"
              background="dark"
              type="password"
              control={control}
              disabled={isSubmitting}
            />

            <ScatterBtn
              text="Submit"
              className="cursor-pointer hover:bg-black"
              isSubmitting={isSubmitting}
              onClick={() => console.log("a")}
            />

            <div className="flex flex-col mt-2 gap-4 text-center">
              <Link
                to={"/forgot_password"}
                className="text-white hover:text-black text-center"
              >
                Esqueceu sua senha ?
              </Link>
              <Link
                className="text-3xl text-white text-center  hover:scale-110 transition-all duration-300"
                to={"/register"}
              >
                Registrar-se
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
