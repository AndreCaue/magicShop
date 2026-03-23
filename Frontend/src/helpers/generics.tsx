import axios from "axios";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const isTruthyOrZero = (value: any) => value === 0 || Boolean(value);

interface ItemWithDescription {
  id: number;
  descricao?: string;
  name?: string;
}

export interface IDropdownOption {
  text: string;
  value: number;
}

export const formatedToDrop = (
  arr: ItemWithDescription[],
): IDropdownOption[] => {
  return (
    arr?.map((x) => ({
      text: x.descricao || x.name || "",
      value: x.id,
    })) || []
  );
};

const ERefundReasonCode = {
  DEFECTIVE_PRODUCT: "defective_product",
  WRONG_PRODUCT: "wrong_product",
  NOT_RECEIVED: "not_received",
  REGRET: "regret",
  DUPLICATE_ORDER: "duplicate_order",
  DAMAGED_IN_SHIPPING: "damaged_in_shipping",
  OTHER: "other",
} as const;

type ERefundReasonCode =
  (typeof ERefundReasonCode)[keyof typeof ERefundReasonCode];

export const RefundReasonById: Record<number, ERefundReasonCode> = {
  1: ERefundReasonCode.DEFECTIVE_PRODUCT,
  2: ERefundReasonCode.WRONG_PRODUCT,
  3: ERefundReasonCode.NOT_RECEIVED,
  4: ERefundReasonCode.REGRET,
  5: ERefundReasonCode.DUPLICATE_ORDER,
  6: ERefundReasonCode.DAMAGED_IN_SHIPPING,
  7: ERefundReasonCode.OTHER,
};

export const formatDate = (date: string) => {
  return format(date, "dd/MM/yyyy", { locale: ptBR });
};

export const handleErrorReq = (err: unknown) => {
  if (axios.isAxiosError(err)) {
    return null;
  }

  if (err instanceof Error) {
    toast.error(`Unexpected error :( ${err.message}`);
    return null;
  }

  return null;
};
