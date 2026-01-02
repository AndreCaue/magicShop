import z from "zod";

export const formSchema = z
  .object({
    nome_cliente: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    celular: z.string().nullish(),

    cep: z.string().min(9, "CEP inválido").max(9, "CEP inválido"),
    endereco: z.string().min(1, "Endereço é obrigatório"),
    numero_casa: z.string().min(1, "Número é obrigatório"),
    complemento: z.string().optional(),
    bairro: z.string().min(1, "Bairro é obrigatório"),
    cidade: z.string().min(1, "Cidade é obrigatória"),
    estado: z.string().min(1, "Estado é obrigatório"),

    frete_opcao: z.string().min(1, "Selecione uma opção de entrega"),

    pagamento: z
      .enum(["pix", "cartao", "boleto"])
      .optional()
      .refine((val) => val !== undefined, {
        message: "Selecione uma forma de pagamento",
      }),

    numero_cartao: z.string().optional(),
    nome_titular: z.string().optional(),
    validade: z.string().optional(),
    cvv: z.string().optional(),
    parcelas: z.string().optional(),
  })
  .refine(
    (data) =>
      data.pagamento !== "cartao" ||
      !!data.numero_cartao?.replace(/\D/g, "").length,
    { message: "Número do cartão inválido", path: ["numero_cartao"] }
  )
  .refine(
    (data) =>
      data.pagamento !== "cartao" ||
      (data.nome_titular?.trim().length ?? 0) >= 3,
    { message: "Nome do titular é obrigatório", path: ["nome_titular"] }
  )
  .refine(
    (data) =>
      data.pagamento !== "cartao" || /^\d{2}\/\d{2}$/.test(data.validade ?? ""),
    { message: "Validade deve estar no formato MM/AA", path: ["validade"] }
  )
  .refine(
    (data) => data.pagamento !== "cartao" || (data.cvv?.length ?? 0) >= 3,
    { message: "CVV inválido", path: ["cvv"] }
  )
  .refine((data) => data.pagamento !== "cartao" || Number(data.parcelas) >= 1, {
    message: "Selecione o número de parcelas",
    path: ["parcelas"],
  });
