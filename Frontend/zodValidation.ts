import { z } from "zod";

z.config({
  customError: (iss) => {
    if (iss.code === "invalid_type") {
      if (iss.received === undefined) {
        return "Campo Obrigatório";
      }
      if (iss.expected === "string" && iss.received === "") {
        return "Campo Obrigatório";
      }
    }

    return undefined;
  },
});
