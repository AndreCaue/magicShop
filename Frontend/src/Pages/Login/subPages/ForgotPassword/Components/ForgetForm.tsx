import { InputForm } from "@/components/new/InputForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { forgotPasswordEmail } from "@/Repositories/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { SmokeLink } from "@/components/new/SmokeLink";
import { CounterButton } from "@/components/new/CounterButton";
import { useCountdown } from "@/Hooks/useCountdown";

const formSchema = z.object({
  email: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export const ForgetForm = () => {
  const [sendedEmail, setSendedEmail] = useState(false);
  const { count, isCounting, start } = useCountdown(90);

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async ({ email }: FormData) => {
    const res = await forgotPasswordEmail(email);
    if (!res) return;
    toast.success(res.message);
    setSendedEmail(true);
    start();
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
              Esqueceu sua senha?
            </CardTitle>
            <CardDescription className="text-center">
              Informe seu e-mail que enviaremos um link para redefinir sua senha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <InputForm
                control={control}
                label="Email"
                name="email"
                background="dark"
                disabled={isSubmitting}
              />

              <CounterButton
                label="Enviar"
                disabled={isSubmitting || isCounting}
                counting={count}
              />

              <SmokeLink
                goTo="/login"
                textLabel="Voltar para login"
                className="w-full justify-center"
              />
            </form>
          </CardContent>
          {sendedEmail && (
            <span className="border border-red-500 text-red-500 flex w-fit place-self-center  my-2">
              Verifique seu email! Email enviado!
            </span>
          )}
        </Card>
      </motion.div>
    </Form>
  );
};
