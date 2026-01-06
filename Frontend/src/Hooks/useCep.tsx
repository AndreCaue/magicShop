import { useState, useEffect } from "react";
import axios from "axios";

interface TAddress {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

// CUPOM: MELHOR10EM10

export function useViaCep(cep: string) {
  const [address, setAddress] = useState<TAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const clearCEP = cep.replace(/\D/g, "");

  useEffect(() => {
    if (clearCEP.length !== 8) {
      setAddress(null);
      setError(false);
      return;
    }

    const buscarCep = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await axios.get(
          `https://viacep.com.br/ws/${clearCEP}/json/`
        );

        if (response.data.erro) {
          setError(true);
          setAddress(null);
        } else {
          setAddress(response.data);
        }
      } catch (err) {
        setError(true);
        setAddress(null);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(buscarCep, 600);
    return () => clearTimeout(timeout);
  }, [clearCEP]);

  return { address, loading, error };
}
