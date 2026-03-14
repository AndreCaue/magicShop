{
  /* Feature -> melhoria para futuro. */
}

// import { CheckboxForm } from "@/components/new/Checkbox";
// import { DropdownForm } from "@/components/new/DropdownForm";
// import { NewButton } from "@/components/new/NewButton";
// import QuantitySelector from "@/components/new/QuantitySelector";
// import { TextAreaForm } from "@/components/new/TextAreaForm";
// import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
// import { Form } from "@/components/ui/form";
// import { formatDate, RefundReasonById } from "@/helpers/generics";
// import type { TGetUserOrderList } from "@/Repositories/payment/orders";
// import { createRefundRequest } from "@/Repositories/payment/refund";
// import { getRefundReasons } from "@/Repositories/shop/dropdown";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useQuery } from "@tanstack/react-query";
// import { LoaderCircle } from "lucide-react";
// import { useMemo, type Dispatch, type SetStateAction } from "react";
// import { useFieldArray, useForm } from "react-hook-form";
// import { toast } from "sonner";
// import z from "zod";

// type TDialogRefund = {
//   isOpen: boolean;
//   setOpen: Dispatch<SetStateAction<boolean>>;
//   order?: TGetUserOrderList;
// };

// export const DialogRefund = ({ isOpen, setOpen, order }: TDialogRefund) => {
//   const formSchema = useMemo(() => {
//     return z
//       .object({
//         isPartial: z.number().optional(),
//         items: z
//           .array(
//             z.object({
//               order_item_id: z.number(),
//               qty: z.number(),
//               price: z.string(),
//             }),
//           )
//           .optional(),
//         reason_code: z.number(),
//         description: z.string().optional(),
//       })
//       .superRefine((data, ctx) => {
//         if (data.isPartial === 1) {
//           // const totalItems = order?.items?.length ?? 0;

//           if (!data.items || data.items.length === 0) {
//             ctx.addIssue({
//               code: z.ZodIssueCode.custom,
//               message: "Selecione pelo menos um item.",
//               path: ["items"],
//             });
//           }

//           // const qtyOfItens = data.items.map(item => item.qty === data)

//           // if (data.items?.length === totalItems && data.items.map) {
//           //   ctx.addIssue({
//           //     code: z.ZodIssueCode.custom,
//           //     message:
//           //       "Se todos os itens forem selecionados, o reembolso deixa de ser parcial.",
//           //     path: ["items"],
//           //   });
//           // }
//         }
//       });
//   }, []);

//   type TForm = z.infer<typeof formSchema>;

//   const form = useForm<TForm>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       isPartial: 0,
//       items: [] as {
//         order_item_id: number;
//         quantity: number;
//       }[],
//     },
//   });

//   const {
//     handleSubmit,
//     formState: { isSubmitting },
//     control,
//     watch,
//   } = form;

//   const { isPartial, reason_code } = watch();

//   const onSubmit = async () => {
//     if (!order) return;
//     const { reason_code, description, items } = form.getValues();
//     const code = RefundReasonById[reason_code];

//     console.log(code, "codigo que to enviando");
//     const res = await createRefundRequest({
//       order_uuid: order.id,
//       reason_code: code,
//       description: description,
//       items: items,
//     });

//     console.log(res, "criar solicitação");
//   };

//   const { data: refundReasons, isLoading: reasonsLoading } = useQuery({
//     queryKey: ["refundReasons"],
//     queryFn: getRefundReasons,
//   });

//   const { fields, append, remove, update } = useFieldArray({
//     control,
//     name: "items",
//   });

//   const itemsWithControl = useMemo(() => {
//     if (!isPartial) return [];

//     return (
//       order?.items?.map((item) => ({
//         id: item.order_item_id,
//         name: item.name ?? "Produto",
//         maxQuantity: item.qty,
//         price: item.price,
//       })) ?? []
//     );
//   }, [order?.items, isPartial]);

//   const watchedItems = watch("items");

//   const spanStyle = "text-slate-300 flex gap-4";

//   const getItemTotal = (itemId: number, itemPrice: number) => {
//     const found = watchedItems?.find((f) => f.order_item_id === itemId);
//     return found ? found.qty * itemPrice : 0;
//   };

//   const partialTotal = useMemo(() => {
//     return (
//       watchedItems?.reduce((acc, field) => {
//         const item = itemsWithControl.find((i) => i.id === field.order_item_id);
//         return acc + (item ? field.qty * item.price : 0);
//       }, 0) ?? 0
//     );
//   }, [watchedItems, itemsWithControl]);

//   if (form.formState.errors.items?.message) {
//     toast.error(form.formState.errors.items?.message);
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={setOpen}>
//       <DialogContent
//         aria-describedby={undefined}
//         className="flex flex-col bg-transparent text-white min-w-fit text-sm"
//       >
//         <DialogTitle>Solicitar Devolução / Reembolso</DialogTitle>

//         <div className="grid lg:grid-cols-2 gap-4 border rounded p-2">
//           <span className={spanStyle}>
//             Pedido: <span className="text-white font-bold">{order?.id}</span>
//           </span>
//           <span className={spanStyle}>
//             Data da Compra:{" "}
//             <span className="text-white font-bold">
//               {formatDate(order?.created_at ?? "")}
//             </span>
//           </span>

//           <span className={spanStyle}>
//             Método de Pagamento:{" "}
//             <span className="text-white font-bold">
//               {order?.payment_method?.replace("_", " ")}
//             </span>
//           </span>
//           <span className={spanStyle}>
//             Valor Total da Compra:{" "}
//             <span className="text-white font-bold">
//               R$ {order?.total.toFixed(2)}
//             </span>
//           </span>

//           {Boolean(isPartial) && (
//             <span className={spanStyle}>
//               Valor Parcial da Solicitação:
//               <span className="text-white font-bold">
//                 R$ {partialTotal.toFixed(2)}
//               </span>
//             </span>
//           )}

//           <div className="lg:col-span-2">
//             <Form {...form}>
//               <form
//                 onSubmit={handleSubmit(onSubmit)}
//                 className="grid lg:grid-cols-2 gap-5 "
//               >
//                 <div className="flex flex-col gap-5 lg:gap-0 col-span-2 ">
//                   <CheckboxForm
//                     options={[
//                       { text: "Sim", value: 1 },
//                       { text: "Não", value: 0 },
//                     ]}
//                     name="isPartial"
//                     required
//                     label="Reembolso parcial ?"
//                     className="text-white lg:mb-5"
//                     control={control}
//                   />

//                   <div className="flex flex-wrap lg:flex-nowrap gap-3 ">
//                     {itemsWithControl.map((item) => {
//                       const isSelected = fields.some(
//                         (field) => field?.order_item_id === item?.id,
//                       );

//                       return (
//                         <div
//                           key={item.id}
//                           className="flex lg:w-1/2  w-full lg:flex-wrap justify-between border p-2 rounded text-white"
//                         >
//                           <label className="flex items-center gap-2 text-white truncate">
//                             <input
//                               type="checkbox"
//                               checked={isSelected}
//                               className="text-white"
//                               onChange={(e) => {
//                                 if (e.target.checked) {
//                                   append({
//                                     order_item_id: item.id,
//                                     qty: 1,
//                                     price: item.price.toFixed(2),
//                                   });
//                                 } else {
//                                   const index = fields.findIndex(
//                                     (field) => field.order_item_id === item.id,
//                                   );
//                                   remove(index);
//                                 }
//                               }}
//                             />
//                             {item.name}
//                           </label>

//                           {isSelected && (
//                             <div className="mt-2 flex justify-between text-white lg:w-full">
//                               <span
//                                 className={
//                                   "text-xs gap-1 mr-5 lg:mr-0 text-slate-300 flex"
//                                 }
//                               >
//                                 <p className="">Total:</p>
//                                 <p className="text-white">
//                                   R$
//                                   {getItemTotal(item.id, item.price).toFixed(2)}
//                                 </p>
//                               </span>

//                               <QuantitySelector
//                                 initialValue={1}
//                                 maxQuantity={item.maxQuantity}
//                                 className="h-5"
//                                 onChange={(newQty: number) => {
//                                   const fieldIndex = fields.findIndex(
//                                     (field) => field.order_item_id === item.id,
//                                   );
//                                   if (fieldIndex !== -1) {
//                                     update(fieldIndex, {
//                                       ...fields[fieldIndex],
//                                       qty: newQty,
//                                     });
//                                   }
//                                 }}
//                               />
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 <div className="lg:col-span-1 col-span-2">
//                   {reasonsLoading ? (
//                     <LoaderCircle className="animate-spin place-self-center text-white" />
//                   ) : (
//                     <DropdownForm
//                       control={control}
//                       name="reason_code"
//                       className="text-white"
//                       required
//                       label="Selecione o motivo da devolução:"
//                       hideCommand
//                       bgTransparent
//                       options={
//                         refundReasons?.map((reason) => ({
//                           text: reason.text,
//                           value: reason.id,
//                         })) ?? []
//                       }
//                     />
//                   )}
//                 </div>

//                 <div className="col-span-2">
//                   {RefundReasonById[reason_code] === "other" && (
//                     <TextAreaForm
//                       name="description"
//                       label="Descreva o motivo"
//                       background="dark"
//                     />
//                   )}
//                 </div>
//                 <div className="col-span-2 flex justify-center items-center">
//                   <NewButton
//                     label="Criar Solicitação"
//                     className="w-1/2"
//                     variant="ghost"
//                   />
//                 </div>
//               </form>
//             </Form>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };
