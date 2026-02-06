import z from "zod";

export const formSchema = z
  .object({
    nome_cliente: z
      .string()
      .min(1, "Nome é obrigatório")
      .refine(
        (value) => {
          const partes = value.trim().split(/\s+/);
          return partes.length >= 2;
        },
        {
          message: "Informe nome e sobrenome",
        },
      ),
    email: z.string().email("Email inválido"),
    celular: z
      .string()
      .min(1, "Celular é obrigatório")
      .transform((v) => v.replace(/\D/g, ""))
      .refine(
        (v) => {
          if (v.length < 10 || v.length > 11) return false;

          const ddd = Number(v.slice(0, 2));
          if (ddd < 11 || ddd > 99) return false;

          if (v.length === 11 && v[2] !== "9") return false;

          return true;
        },
        {
          message: "Informe um celular válido com DDD",
        },
      ),

    cep: z.string().min(9, "CEP inválido").max(9, "CEP inválido"),
    endereco: z.string().min(1, "Endereço é obrigatório"),
    numero_casa: z.string().min(1, "Número é obrigatório"),
    complemento: z.string().optional(),
    bairro: z.string().min(1, "Bairro é obrigatório"),
    cidade: z.string().min(1, "Cidade é obrigatória"),
    estado: z.string().min(1, "Estado é obrigatório"),
    uf: z.string().min(1),

    frete_opcao: z.number().min(1, "Selecione uma opção de entrega"),

    pagamento: z
      .enum(["pix", "cartao"]) //  "boleto"
      .optional()
      .refine((val) => val !== undefined, {
        message: "Selecione uma forma de pagamento",
      }),

    cpf: z
      .string()
      .min(1, "CPF é obrigatório")
      .refine(
        (value) => {
          const cleanCpf = value.replace(/\D/g, "");
          return cleanCpf.length === 11;
        },
        { message: "CPF deve conter 11 dígitos" },
      )
      .refine(
        (value) => {
          const cleanCpf = value.replace(/\D/g, "");

          if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

          let sum = 0;
          for (let i = 0; i < 9; i++) {
            sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
          }
          let firstDigit = 11 - (sum % 11);
          if (firstDigit >= 10) firstDigit = 0;

          if (parseInt(cleanCpf.charAt(9)) !== firstDigit) return false;

          sum = 0;
          for (let i = 0; i < 10; i++) {
            sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
          }
          let secondDigit = 11 - (sum % 11);
          if (secondDigit >= 10) secondDigit = 0;

          return parseInt(cleanCpf.charAt(10)) === secondDigit;
        },
        { message: "CPF inválido" },
      ),
    numero_cartao: z.string().optional(),
    nome_titular: z.string().optional(),
    validade: z.string().optional(),
    cvv: z.string().optional(),
    parcelas: z.string().optional(),
    payment_token: z.string(),
  })
  .refine(
    (data) =>
      data.pagamento !== "cartao" ||
      !!data.numero_cartao?.replace(/\D/g, "").length,
    { message: "Número do cartão inválido", path: ["numero_cartao"] },
  )
  .refine(
    (data) => {
      if (data.pagamento !== "cartao") return true;

      const name = data.nome_titular?.trim() ?? "";

      if (name.length < 5) return false;

      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(name)) return false;

      const parts = name.split(/\s+/);
      if (parts.length < 2) return false;

      const allSameLetters = parts.every(
        (p) => new Set(p.toLowerCase()).size === 1,
      );
      if (allSameLetters) return false;

      return true;
    },
    {
      message: "Informe o nome completo como está no cartão",
      path: ["nome_titular"],
    },
  )
  .refine(
    (data) => {
      if (data.pagamento !== "cartao") return true;

      const value = data.validade ?? "";
      if (!/^\d{2}\/\d{2}$/.test(value)) return false;

      const [monthStr, yearStr] = value.split("/");
      const month = Number(monthStr);
      const year = Number(yearStr);

      if (month < 1 || month > 12) return false;

      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;

      if (year < currentYear) return false;
      if (year === currentYear && month < currentMonth) return false;

      if (year > currentYear + 20) return false;

      return true;
    },
    {
      message: "Data de validade do cartão inválida",
      path: ["validade"],
    },
  )
  .refine(
    (data) => data.pagamento !== "cartao" || (data.cvv?.length ?? 0) >= 3,
    { message: "CVV inválido", path: ["cvv"] },
  )
  .refine((data) => data.pagamento !== "cartao" || Number(data.parcelas) >= 1, {
    message: "Selecione o número de parcelas",
    path: ["parcelas"],
  });
