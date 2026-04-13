import { InputOTPForm } from "@/components/new/InputOTPForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import {
  resendVerificationCode,
  verifyValidationEmail,
} from "@/Repositories/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  verifyCode: z.string(),
});

type TForm = Required<z.infer<typeof formSchema>>;

type TVerifyDialog = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export const VerifyDialog = ({ isOpen, setIsOpen }: TVerifyDialog) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TForm>({
    resolver: zodResolver(formSchema),
  });

  const { handleSubmit, control, watch } = form;
  const valueInput = watch("verifyCode");

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await verifyValidationEmail(valueInput);
      if (!res) return;
      setIsLoading(false);
      setIsOpen(false);
      localStorage.setItem("is_verify", "true");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!valueInput || valueInput?.length <= 5) return;
    onSubmit();
  }, [valueInput]);

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const res = await resendVerificationCode();
      if (!res?.message) {
        toast.warning(
          res?.detail ||
            "Algo deu errado tente novamente ou entre em contato com o suporte.",
        );
      }
      toast.success(res?.message);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-black">
        <DialogHeader>
          <DialogTitle className="text-white">
            Verifique sua caixa de entrada. Te enviamos um email!
          </DialogTitle>
          <DialogDescription>
            Após a verificação do email, funções serão liberadas!
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex justify-center"
          >
            <InputOTPForm
              label="Código de Verificação"
              name="verifyCode"
              maxLength={6}
              control={control}
              disabled={isLoading}
            />
          </form>
        </Form>

        <DialogFooter>
          {isLoading ? (
            <div className="text-white flex items-center gap-2 justify-center">
              <Loader2 className="w-8 h-8 animate-spin" />

              <span>Carregando</span>
            </div>
          ) : (
            <button
              className="text-white hover:cursor-pointer hover:scale-105"
              onClick={handleResendCode}
            >
              Codigo expirou? Re-enviar
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
