import { useState, type Dispatch, type SetStateAction } from "react";
import { motion, AnimatePresence, cubicBezier } from "framer-motion";
import { X, ChevronDown, ChevronUp, Package, Truck, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { IOrderResponse } from "../types";
import { NewTooltip } from "@/components/new/Tooltip";

interface OrderSummaryModalProps {
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  data: IOrderResponse | undefined;
  paymentMethod?: "pix" | "credit_card" | string;
}

export function OrderSummaryModal({
  isOpen,
  setOpen,
  data,
}: OrderSummaryModalProps) {
  const [expanded, setExpanded] = useState(true);

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: cubicBezier(0.16, 1, 0.3, 1),
      },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      y: 10,
      transition: {
        duration: 0.2,
        ease: cubicBezier(0.16, 1, 0.3, 1),
      },
    },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06, duration: 0.3 },
    }),
  };

  if (!data) return;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setOpen}>
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center overflow-auto p-4"
          >
            <motion.div
              variants={modalVariants}
              className="
            relative 
            w-full max-w-md sm:max-w-lg 
            bg-gradient-to-b from-slate-900 to-slate-950 
            border border-slate-800 
            text-slate-200 
            overflow-hidden 
            shadow-2xl 
            rounded-lg            
            mx-auto                  
          "
              style={{ padding: 0 }}
            >
              <div className="p-6 pb-4">
                <DialogHeader className="relative">
                  <DialogTitle className="text-lg font-medium text-slate-100 flex items-center gap-2">
                    Resumo do Pedido #{data.id}
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </DialogHeader>

                <div className="mt-5 space-y-5">
                  {/* Cabeçalho expansível dos itens */}
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-between text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>Itens ({data.items.length})</span>
                      <div className="ml-10">
                        {data.items.length > 5 && (
                          <div className="flex">
                            <NewTooltip
                              icon={
                                <div className="flex">
                                  Mostrar Todos
                                  <List className="ml-2 p-1" />
                                </div>
                              }
                              textContent="Itens:"
                              contentStyle="text-center"
                              contentJSX={
                                <div className="flex flex-col">
                                  {data.items.map((item, idx) => (
                                    <p key={item.product_id}>
                                      {idx + 1} - {item.product_name}
                                    </p>
                                  ))}
                                </div>
                              }
                              side="right"
                            />
                          </div>
                        )}{" "}
                      </div>
                    </div>
                    {expanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expanded && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="space-y-4 overflow-hidden max-h-[275px]"
                      >
                        {data.items.map((item, index) => (
                          <motion.li
                            key={item.product_id}
                            custom={index}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            className="flex justify-between items-center text-sm"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={item.img_product}
                                alt="Imagem do item"
                                className="h-10 w-10 rounded bg-slate-800 flex-shrink-0"
                              />
                              <div>
                                <p className="font-medium text-slate-200">
                                  {item.product_name}
                                </p>
                                <p className="text-slate-500">
                                  Qtd: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="font-medium text-slate-300">
                              R${" "}
                              {(item.quantity * item.unit_price)
                                .toFixed(2)
                                .replace(".", ",")}
                            </span>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>

                  <Separator className="bg-slate-800" />

                  {/* Valores */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-slate-300">
                      <span>Subtotal</span>
                      <span>
                        R$ {data.subtotal.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span>Frete Bruto</span>
                      </div>
                      <span>
                        R$
                        {data.shipping_original.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    {data.shipping_discount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Desconto no frete</span>
                        {data.shipping_cost === 0 ? (
                          <span>
                            -R${" "}
                            {data.shipping_original
                              .toFixed(2)
                              .replace(".", ",")}
                          </span>
                        ) : (
                          <span>
                            -R${" "}
                            {data.shipping_discount
                              .toFixed(2)
                              .replace(".", ",")}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between text-emerald-400">
                      <span>Frete Total</span>
                      <span>
                        R${" "}
                        {data.shipping_cost === 0
                          ? "Grátis"
                          : data.shipping_cost.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    <Separator className="bg-slate-700 my-2" />
                    <div className="flex justify-between items-center text-base font-medium text-slate-100">
                      <span>Total</span>
                      <span className="text-lg">
                        R$ {data.total.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/70 px-6 py-4 border-t border-slate-800">
                <Button
                  onClick={() => setOpen(false)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                >
                  Continuar Pagamento
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
