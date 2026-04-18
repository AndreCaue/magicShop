import { motion } from "framer-motion";
import {
  Truck,
  Clock,
  Package,
  Tag,
  MapPin,
  Search,
  ShieldCheck,
  Mail,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const sections = [
  { id: "processamento", title: "Processamento do pedido", icon: Package },
  { id: "envio", title: "Formas de envio", icon: Truck },
  { id: "prazo", title: "Prazos de entrega", icon: Clock },
  { id: "frete", title: "Cálculo de frete", icon: Truck },
  { id: "descontos", title: "Descontos no frete", icon: Tag },
  { id: "entrega", title: "Entrega e tentativas", icon: MapPin },
  { id: "rastreamento", title: "Rastreamento", icon: Search },
  { id: "responsabilidade", title: "Responsabilidades", icon: ShieldCheck },
  { id: "contato", title: "Contato", icon: Mail },
];

export const LogisticsPolicy = () => {
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
          onClick={() => navigate("/politica-de-pagamento")}
        >
          Política de Pagamento
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
            Política de Transporte
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Esta política descreve como funcionam os envios dos produtos
            vendidos em nossa loja.
          </p>
          <p className="text-sm text-muted-foreground mt-6 italic">
            Última atualização: 13 de Abril de 2026
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
            <section id="processamento" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">
                Processamento do pedido
              </h2>
              <p className="text-muted-foreground">
                Os pedidos são processados em até <strong>2 dias úteis</strong>{" "}
                após a confirmação do pagamento. Após esse período, o envio é
                realizado por meio da plataforma Melhor Envio, utilizando os
                serviços dos Correios.
              </p>
            </section>

            <section id="envio" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Formas de envio</h2>
              <p className="text-muted-foreground mb-4">
                Todos os envios são realizados exclusivamente pelos{" "}
                <strong>Correios</strong>, via integração com a plataforma
                Melhor Envio.
              </p>
              <ul className="list-disc pl-5 text-muted-foreground">
                <li>SEDEX (mais rápido)</li>
                <li>PAC (mais econômico)</li>
              </ul>
            </section>

            <section id="prazo" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Prazos de entrega</h2>
              <p className="text-muted-foreground">
                O prazo de entrega é estimado no momento da compra e começa a
                contar após o envio do pedido.
              </p>
              <p className="text-muted-foreground mt-2">
                Esse prazo pode variar conforme a região e modalidade escolhida.
                Não temos controle direto sobre eventuais atrasos por parte dos
                Correios.
              </p>
            </section>

            <section id="frete" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Cálculo de frete</h2>
              <p className="text-muted-foreground">
                O valor do frete é calculado automaticamente no checkout com
                base em:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground mt-2">
                <li>CEP de destino</li>
                <li>Peso e dimensões do pacote</li>
                <li>Modalidade de envio escolhida</li>
              </ul>
            </section>

            <section id="descontos" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Descontos no frete</h2>
              <p className="text-muted-foreground">
                Alguns produtos podem oferecer descontos aplicáveis ao frete,
                que são calculados automaticamente no momento da compra.
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>Importante:</strong> o valor do desconto nunca
                ultrapassará o valor total do frete, garantindo que o frete
                nunca tenha valor negativo.
              </p>
            </section>

            <section id="entrega" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Entrega e tentativas</h2>
              <p className="text-muted-foreground">
                As entregas são realizadas no endereço informado no momento da
                compra.
              </p>
              <ul className="list-disc pl-5 text-muted-foreground mt-2">
                <li>Os Correios realizam até 3 tentativas de entrega</li>
                <li>
                  Após isso, o produto pode ser encaminhado para retirada ou
                  devolvido ao remetente
                </li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Caso o endereço esteja incorreto ou incompleto, o reenvio será
                de responsabilidade do cliente.
              </p>
            </section>

            <section id="rastreamento" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Rastreamento</h2>
              <p className="text-muted-foreground">
                Após o envio, você receberá um código de rastreamento por e-mail
                para acompanhar a entrega diretamente no site dos Correios.
              </p>
            </section>

            <section id="responsabilidade" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Responsabilidades</h2>
              <p className="text-muted-foreground">
                Após a postagem, a responsabilidade pela entrega passa a ser dos
                Correios.
              </p>
              <p className="text-muted-foreground mt-2">
                Em casos de extravio ou problemas, abriremos uma solicitação
                junto à transportadora para resolução.
              </p>
            </section>

            <section id="contato" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Contato</h2>
              <div className="bg-muted/30 p-6 rounded-xl">
                <p className="text-muted-foreground mb-4">
                  Para dúvidas sobre envios ou pedidos:
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
