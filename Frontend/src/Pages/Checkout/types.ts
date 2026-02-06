import { z } from "zod";
import { formSchema } from "./schema";

export type TForm = z.infer<typeof formSchema>;

export type TStep = "cliente" | "endereco" | "entrega" | "pagamento";

export const STEP_FIELDS: Record<TStep, (keyof TForm)[]> = {
  cliente: ["nome_cliente", "email", "celular"],
  endereco: ["cep", "endereco", "numero_casa", "bairro", "cidade", "estado"],
  entrega: ["frete_opcao"],
  pagamento: [
    "pagamento",
    "numero_cartao",
    "nome_titular",
    "validade",
    "cvv",
    "parcelas",
  ],
};
