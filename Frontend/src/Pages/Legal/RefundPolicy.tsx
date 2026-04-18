import { motion } from "framer-motion";
import {
  RefreshCcw,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Package,
  Clock,
  Mail,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const sections = [
  { id: "arrependimento", title: "Direito de arrependimento", icon: RotateCcw },
  { id: "devolucao", title: "Condições de devolução", icon: Package },
  { id: "defeito", title: "Produto com defeito", icon: AlertTriangle },
  { id: "reembolso", title: "Reembolsos", icon: RefreshCcw },
  { id: "prazos", title: "Prazos", icon: Clock },
  { id: "aprovacao", title: "Análise e aprovação", icon: CheckCircle },
  { id: "contato", title: "Contato", icon: Mail },
];

export const RefundPolicy = () => {
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
          onClick={() => navigate("/politica-de-pagamento")}
        >
          Política de Pagamento
        </button>
      </div>
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-primary">
            Política de Troca e Devolução
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Esta política segue as diretrizes do Código de Defesa do Consumidor
            e descreve como funcionam trocas, devoluções e reembolsos.
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
            <section id="arrependimento" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">
                Direito de arrependimento
              </h2>
              <p className="text-muted-foreground">
                Conforme o Código de Defesa do Consumidor, você pode desistir da
                compra em até <strong>7 dias corridos</strong> após o
                recebimento do produto.
              </p>
              <p className="text-muted-foreground mt-2">
                Nesse caso, você terá direito ao reembolso integral, incluindo o
                valor do frete.
              </p>
            </section>

            <section id="devolucao" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">
                Condições de devolução
              </h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li>Produto sem sinais de uso</li>
                <li>Na embalagem original</li>
                <li>Com todos os itens e acessórios</li>
              </ul>
            </section>

            <section id="defeito" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Produto com defeito</h2>
              <p className="text-muted-foreground">
                Caso o produto apresente defeito, você poderá solicitar troca ou
                reparo dentro do prazo de garantia legal.
              </p>
              <p className="text-muted-foreground mt-2">
                O prazo para resolução é de até <strong>30 dias</strong>.
              </p>
              <p className="text-muted-foreground mt-2">
                Caso não seja resolvido nesse período, você poderá escolher
                entre:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground mt-2">
                <li>Substituição do produto</li>
                <li>Reembolso do valor pago</li>
                <li>Abatimento proporcional do valor</li>
              </ul>
            </section>

            <section id="reembolso" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Reembolsos</h2>
              <p className="text-muted-foreground">
                O reembolso será realizado conforme o método de pagamento:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground mt-2">
                <li>Cartão: estorno na fatura</li>
                <li>PIX: devolução para a conta de origem</li>
              </ul>
            </section>

            <section id="prazos" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Prazos</h2>
              <ul className="list-disc pl-5 text-muted-foreground">
                <li>7 dias para arrependimento</li>
                <li>Até 30 dias para análise de defeito</li>
                <li>Prazo do banco para estorno pode variar</li>
              </ul>
            </section>

            <section id="aprovacao" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Análise e aprovação</h2>
              <p className="text-muted-foreground">
                Após o recebimento do produto devolvido, será realizada uma
                análise para verificar se as condições de devolução foram
                atendidas.
              </p>
            </section>

            <section id="contato" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Contato</h2>
              <div className="bg-muted/30 p-6 rounded-xl">
                <p className="text-muted-foreground mb-4">
                  Para solicitar troca ou devolução:
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
