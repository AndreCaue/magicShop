import { NewButton } from "@/components/new/NewButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PassInput } from "@/components/new/PassInput";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { recoveryPassword } from "@/Repositories/auth";
import { toast } from "sonner";

const formSchema = z
  .object({
    validationToken: z.string(),
    new_password: z.string(),
    confirm_password: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.new_password !== data.confirm_password) {
      ctx.addIssue({
        code: "custom",
        message: "As senhas não coincidem",
        path: ["confirm_password"],
      });
    }
  });

type TForm = z.infer<typeof formSchema>;

export const RecoveryForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const {
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;
    setValue("validationToken", token);
    window.history.replaceState({}, "", window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const onSubmit = async (params: TForm) => {
    const { confirm_password, new_password, validationToken } = params;
    if (new_password !== confirm_password) return;

    const res = await recoveryPassword({
      new_password,
      token: validationToken,
    });

    if (!res) return;

    toast.success(res.message);
    navigate("/login");
  };

  return (
    <Form {...form}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="py-4 lg:px-0"
      >
        <Card className="max-w-sm min-w-sm text-white  bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 md:-rotate-45">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Digite uma nova senha
            </CardTitle>
            <CardDescription className="text-center"></CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <PassInput
                control={control}
                name="new_password"
                type="password"
                placeholder="Senha"
                disabled={isSubmitting}
              />

              <PassInput
                control={control}
                name="confirm_password"
                placeholder="Confirme a senha"
                type="password"
                disabled={isSubmitting}
              />

              <NewButton label="Enviar" disabled={isSubmitting} />
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </Form>
  );
};
