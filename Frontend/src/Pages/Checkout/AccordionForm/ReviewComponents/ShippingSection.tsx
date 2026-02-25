import type { ShippingOption } from "@/stores/useShippingStore";
import { MapPin, Truck } from "lucide-react";

type TShippingSection = {
  customer: Customer;
  address: Address;
  shipping: ShippingOption | null;
};

type Customer = {
  nome_cliente: string;
  email: string;
  celular: string;
};

type Address = {
  endereco: string;
  complemento: string | undefined;
  cidade: string;
  bairro: string;
  uf: string;
  cep: string;
  numero_casa: string;
};

export const ShippingSection = ({
  address,
  customer,
  shipping,
}: TShippingSection) => {
  return (
    <section className="px-6 py-6 grid md:grid-cols-2 gap-8">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-600" />
            Entrega
          </h3>
        </div>
        <p className="text-sm text-gray-700">{customer.nome_cliente}</p>
        <p className="text-sm text-gray-600 mt-1">{customer.email}</p>
        {customer.celular && (
          <p className="text-sm text-gray-600">{customer.celular}</p>
        )}

        <div className="mt-3 text-sm text-gray-700 leading-relaxed">
          {address.endereco} – {address?.numero_casa}, {address.bairro}
          {address.complemento && `, ${address.complemento}`}
          <br />
          {address.cidade} – {address.uf}, {address.cep}{" "}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
            <Truck className="h-4 w-4 text-gray-600" />
            Método de entrega
          </h3>
        </div>

        <div className="grid grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {shipping?.nome}
            </p>

            <p className="text-sm text-gray-600 mt-1">
              Prazo estimado: {shipping?.prazo_dias} dia(s)
            </p>
            <p>Preço: R$ {shipping?.preco}</p>
          </div>
          <img
            src={shipping?.empresa_picture}
            alt="Logo Transportadora"
            className="max-w-[140px] justify-self-end"
          />
        </div>
      </div>
    </section>
  );
};
