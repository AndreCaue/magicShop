import { motion } from "framer-motion";
import {
  CreditCard,
  QrCode,
  Receipt,
  Percent,
  ShieldCheck,
  AlertCircle,
  Mail,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const sections = [
  { id: "metodos", title: "Métodos de pagamento", icon: CreditCard },
  { id: "cartao", title: "Pagamento com cartão", icon: CreditCard },
  { id: "parcelamento", title: "Parcelamento", icon: Percent },
  { id: "pix", title: "Pagamento via PIX", icon: QrCode },
  { id: "aprovacao", title: "Confirmação de pagamento", icon: Receipt },
  { id: "seguranca", title: "Segurança", icon: ShieldCheck },
  { id: "erros", title: "Problemas e recusas", icon: AlertCircle },
  { id: "contato", title: "Contato", icon: Mail },
];

export const PaymentPolicy = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="flex justify-between p-4">
        <button
          onClick={() => navigate("/politica-de-privacidade")}
          className="border border-black rounded-full p-1 cursor-pointer hover:bg-black hover:text-white"
        >
          Política de Privacidade
        </button>
        <button
          className="border border-black rounded-full p-1 cursor-pointer hover:bg-black hover:text-white"
          onClick={() => navigate("/politica-de-transporte")}
        >
          Política de Transporte
        </button>
        <button
          className="border border-black rounded-full p-1 cursor-pointer hover:bg-black hover:text-white"
          onClick={() => navigate("/politica-de-troca")}
        >
          Política de Troca / Devolução.
        </button>
      </div>
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-primary">
            Política de Pagamento
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Esta política descreve como funcionam os pagamentos realizados em
            nossa loja.
          </p>
          <p className="text-sm text-muted-foreground mt-6 italic">
            Última atualização: 14 de Abril de 2026
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="sticky top-24 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-3">
                Nesta página
              </p>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors group text-left"
                >
                  <span className="flex items-center gap-3">
                    <section.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    {section.title}
                  </span>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex-1 space-y-20">
            <section id="metodos" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Métodos de pagamento</h2>
              <p className="text-muted-foreground">
                Os pagamentos são processados por meio da plataforma EfiPay,
                garantindo segurança e confiabilidade nas transações.
              </p>
              <ul className="list-disc pl-5 text-muted-foreground mt-2">
                <li>Cartão de crédito</li>
                <li>PIX</li>
              </ul>
            </section>

            <section id="cartao" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Pagamento com cartão</h2>
              <p className="text-muted-foreground">
                Aceitamos pagamentos via cartão de crédito das principais
                bandeiras. O processamento é realizado pela EfiPay e pode passar
                por análise antifraude.
              </p>
            </section>

            <section id="parcelamento" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Parcelamento</h2>

              <p className="text-muted-foreground">
                O parcelamento no cartão segue regras automáticas baseadas no
                valor da compra.
              </p>

              <ul className="list-disc pl-5 text-muted-foreground mt-2 space-y-2">
                <li>
                  O valor mínimo de cada parcela é de <strong>R$ 10,00</strong>
                </li>
                <li>
                  O número máximo de parcelas é definido com base no valor total
                  do pedido
                </li>
                <li>
                  Exemplo:
                  <ul className="list-disc pl-5 mt-1">
                    <li>R$ 30 → até 3x</li>
                    <li>R$ 120 → até 12x</li>
                  </ul>
                </li>
                <li>
                  Até <strong>3x sem juros</strong>
                </li>
                <li>
                  Parcelas acima de 3x podem ter juros aplicados pela operadora
                  de pagamento
                </li>
              </ul>
            </section>

            <section id="pix" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Pagamento via PIX</h2>
              <p className="text-muted-foreground">
                O pagamento via PIX é gerado automaticamente após a finalização
                do pedido.
              </p>
              <ul className="list-disc pl-5 text-muted-foreground mt-2">
                <li>Confirmação geralmente imediata</li>
                <li>
                  O pedido só é processado após a confirmação do pagamento
                </li>
              </ul>
            </section>

            <section id="aprovacao" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">
                Confirmação de pagamento
              </h2>
              <p className="text-muted-foreground">
                Após a confirmação do pagamento, o pedido será liberado para
                processamento e envio.
              </p>
              <p className="text-muted-foreground mt-2">
                Pagamentos por cartão podem passar por análise, podendo levar
                mais tempo para aprovação.
              </p>
            </section>

            <section id="seguranca" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Segurança</h2>
              <p className="text-muted-foreground">
                Não armazenamos dados sensíveis de pagamento. Todas as
                transações são processadas diretamente pela EfiPay em ambiente
                seguro e criptografado.
              </p>
            </section>

            <section id="erros" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Problemas e recusas</h2>
              <p className="text-muted-foreground">
                Pagamentos podem ser recusados por diversos motivos, como dados
                incorretos, limite insuficiente ou análise antifraude.
              </p>
              <p className="text-muted-foreground mt-2">
                Caso isso ocorra, recomendamos tentar novamente ou utilizar
                outro método de pagamento.
              </p>
            </section>

            <section id="contato" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Contato</h2>
              <div className="bg-muted/30 p-6 rounded-xl">
                <p className="text-muted-foreground mb-4">
                  Em caso de dúvidas sobre pagamentos:
                </p>
                <p className="text-primary font-medium">
                  lojamagica@doceilusao.store
                </p>
              </div>
            </section>

            <div className="pt-10 border-t border-border/50 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                © 2026 Doce Ilusão - Todos os direitos reservados.
              </p>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para a loja
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
