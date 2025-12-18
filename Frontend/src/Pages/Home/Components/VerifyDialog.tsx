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
import { verifyValidationEmail } from "@/Repositories/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
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
  //066 534
  const onSubmit = async () => {
    setIsLoading(true);
    const res = await verifyValidationEmail(valueInput);

    setIsLoading(false);
    if (!res) return;

    localStorage.setItem("is_verify", "true");
    setIsOpen(false);
  };

  useEffect(() => {
    if (!valueInput || valueInput?.length <= 5) return;
    onSubmit();
  }, [valueInput]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-black">
        <DialogHeader>
          <DialogTitle className="text-white">Verificar Email</DialogTitle>
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
          <button className="text-white hover:cursor-pointer hover:scale-105">
            Codigo expirou? Re-enviar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
