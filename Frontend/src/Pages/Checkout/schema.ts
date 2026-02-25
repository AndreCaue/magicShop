import z from "zod";

export const formSchema = z.object({
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
  email: z.string().email("Email inválido"), // validação melhor, melhoria
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

  revisao: z.string().nullish(),

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
});
