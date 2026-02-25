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
