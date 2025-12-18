import { z } from "zod";

z.config({
  customError: (iss) => {
    if (iss.code === "invalid_type") {
      if (iss.received === undefined) {
        return "Campo Obrigatório";
      }
      // Opcional: tratar string vazia (comum em forms HTML)
      if (iss.expected === "string" && iss.received === "") {
        return "Campo Obrigatório";
      }
    }

    // Para outros casos, retorna undefined (usa a mensagem padrão do Zod)
    return undefined;
  },
});
