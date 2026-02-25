import { z } from "zod";
import { formSchema } from "./schema";

export type TForm = z.infer<typeof formSchema>;

export type TStep = "cliente" | "endereco" | "entrega" | "revisao";

export const STEP_FIELDS: Record<TStep, (keyof TForm)[]> = {
  cliente: ["nome_cliente", "email", "celular"],
  endereco: ["cep", "endereco", "numero_casa", "bairro", "cidade", "estado"],
  entrega: ["frete_opcao"],
  revisao: [],
};

type OrderStatus = "pending" | "paid" | "cancelled" | "completed";
type PaymentStatus = "aguardando_pagamento" | "pago" | "falhou" | "reembolsado";

interface ShippingAddress {
  recipient_name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
}

interface OrderItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  img_product: string;
  product_name: string;
}

interface OrderUser {
  recipient_document: string;
  recipient_name: string;
}

export interface IOrderResponse {
  id: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  shipping_cost: number;
  shipping_discount: number;
  shipping_original: number;
  shipping_method: string;
  shipping_carrier: string;
  total: number;
  created_at: string; // ISO date string
  reservation_expires_at: string; // ISO date string
  shipping: ShippingAddress;
  items: OrderItem[];
  user: OrderUser;
}
