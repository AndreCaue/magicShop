import { motion } from "framer-motion";
import {
  ShieldCheck,
  Database,
  Share2,
  Cookie,
  Scale,
  Lock,
  RefreshCcw,
  Mail,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const sections = [
  { id: "info", title: "Informações que coletamos", icon: Database },
  { id: "uso", title: "Como usamos suas informações", icon: Database },
  { id: "compartilhamento", title: "Compartilhamento de dados", icon: Share2 },
  { id: "cookies", title: "Cookies e tecnologias semelhantes", icon: Cookie },
  { id: "direitos", title: "Seus direitos (LGPD)", icon: Scale },
  { id: "seguranca", title: "Segurança dos dados", icon: Lock },
  {
    id: "atualizacoes",
    title: "Atualizações desta política",
    icon: RefreshCcw,
  },
  { id: "contato", title: "Contato", icon: Mail },
];

export const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="flex justify-between p-4">
        <button
          onClick={() => navigate("/politica-de-transporte")}
          className="border border-black rounded-full p-1 cursor-pointer hover:bg-black hover:text-white"
        >
          Política de Transporte
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <ShieldCheck className="w-4 h-4" />
            Sua privacidade é nossa prioridade
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-primary">
            Política de Privacidade
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Esta política descreve como eu, André Cauê G. C., responsável pela
            Doce Ilusão, coleto, uso e protejo suas informações pessoais ao
            utilizar nossos serviços de e-commerce e conteúdo em vídeo sobre
            mágica.
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
            <section id="info" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/5">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">
                  Informações que coletamos
                </h2>
              </div>
              <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed space-y-4">
                <p>
                  Para oferecer a melhor experiência em nossa plataforma de
                  mágica, coletamos os seguintes tipos de informações:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Dados Cadastrais:</strong> Nome completo, endereço
                    de e-mail e telefone para identificação, comunicação e
                    processamento de pedidos.
                  </li>
                  <li>
                    <strong>Dados de Entrega:</strong> Endereço completo para o
                    envio de produtos físicos (baralhos, acessórios).
                  </li>
                  <li>
                    <strong>Dados de Pagamento:</strong> Informações processadas
                    de forma segura pelo EfiPay. Não armazenamos dados sensíveis
                    de cartão de crédito.
                  </li>
                  <li>
                    <strong>Dados de Acesso:</strong> Endereço IP, tipo de
                    navegador, páginas visitadas e tempo de permanência, visando
                    melhorar a performance do site.
                  </li>
                </ul>
                <p className="text-sm italic">
                  Observação: CPF pode ser solicitado no futuro para emissão de
                  documentos fiscais, mas atualmente não é obrigatório.
                </p>
              </div>
            </section>

            <section id="uso" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/5">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">
                  Como usamos suas informações
                </h2>
              </div>
              <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed space-y-4">
                <p>
                  O uso dos seus dados tem finalidades específicas e legítimas:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Processamento de Pedidos:</strong> Garantir que seus
                    baralhos e truques cheguem corretamente ao destino.
                  </li>
                  <li>
                    <strong>Acesso ao Conteúdo:</strong> Liberar vídeos e
                    tutoriais exclusivos adquiridos em sua conta.
                  </li>
                  <li>
                    <strong>Comunicação:</strong> Enviar atualizações sobre seu
                    pedido e responder a solicitações de suporte.
                  </li>
                  <li>
                    <strong>Melhorias no Site:</strong> Analisar o uso da
                    plataforma para aprimorar a experiência (incluindo Google
                    Analytics no futuro).
                  </li>
                  <li>
                    <strong>Marketing:</strong> Com seu consentimento, enviar
                    ofertas de novos lançamentos e eventos do mundo da mágica.
                  </li>
                </ul>
              </div>
            </section>

            <section id="compartilhamento" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/5">
                  <Share2 className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">
                  Compartilhamento de dados
                </h2>
              </div>
              <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed space-y-4">
                <p>
                  Não vendemos suas informações para terceiros. O
                  compartilhamento ocorre apenas quando estritamente necessário:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Logística:</strong> Compartilhamos seu endereço com
                    transportadoras via Melhor Envio.
                  </li>
                  <li>
                    <strong>Pagamentos:</strong> Envio de dados necessários ao
                    EfiPay para processar transações.
                  </li>
                  <li>
                    <strong>Hospedagem:</strong> Parte dos dados é armazenada em
                    servidores da Railway (localizados nos Estados Unidos), com
                    salvaguardas contratuais para proteção alinhada à LGPD.
                  </li>
                  <li>
                    <strong>Obrigações Legais:</strong> Quando exigido por
                    autoridades governamentais ou ordem judicial.
                  </li>
                </ul>
              </div>
            </section>

            <section id="cookies" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/5">
                  <Cookie className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">
                  Cookies e tecnologias semelhantes
                </h2>
              </div>
              <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed space-y-4">
                <p>
                  Utilizamos cookies essenciais para o funcionamento do site
                  (como carrinho de compras) e cookies analíticos para entender
                  como o site é utilizado. No futuro, poderemos utilizar o
                  Google Analytics para gerar estatísticas de navegação.
                </p>
                <p>
                  Você pode gerenciar ou desativar os cookies diretamente nas
                  configurações do seu navegador a qualquer momento. Lembramos
                  que desativar alguns cookies pode afetar a experiência de
                  navegação.
                </p>
              </div>
            </section>

            <section id="direitos" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/5">
                  <Scale className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Seus direitos (LGPD)</h2>
              </div>
              <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed space-y-4">
                <p>
                  Em conformidade com a Lei Geral de Proteção de Dados (LGPD),
                  você possui o direito de:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Confirmar a existência e acessar seus dados pessoais;</li>
                  <li>
                    Corrigir dados incompletos, inexatos ou desatualizados;
                  </li>
                  <li>
                    Solicitar a anonimização, bloqueio ou eliminação de dados
                    desnecessários ou excessivos;
                  </li>
                  <li>
                    Revogar o consentimento para o tratamento de dados (quando
                    aplicável);
                  </li>
                  <li>
                    Solicitar a portabilidade dos seus dados a outro fornecedor;
                  </li>
                  <li>Opor-se ao tratamento em determinados casos.</li>
                </ul>
                <p>
                  Para exercer qualquer um desses direitos, envie um e-mail para
                  o endereço de contato abaixo. Responderemos em até 15 dias
                  úteis.
                </p>
              </div>
            </section>

            <section id="seguranca" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/5">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Segurança dos dados</h2>
              </div>
              <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed space-y-4">
                <p>
                  Implementamos medidas técnicas e organizacionais para proteger
                  seus dados, incluindo criptografia em trânsito (HTTPS),
                  controle de acesso e boas práticas de segurança. No entanto,
                  nenhum sistema é completamente inviolável, e não podemos
                  garantir segurança absoluta.
                </p>
              </div>
            </section>

            <section id="atualizacoes" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/5">
                  <RefreshCcw className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">
                  Atualizações desta política
                </h2>
              </div>
              <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed space-y-4">
                <p>
                  Esta política pode ser atualizada para refletir mudanças em
                  nossas práticas ou por motivos legais. Sempre que houver uma
                  alteração significativa, informaremos por meio de destaque no
                  site ou via e-mail.
                </p>
              </div>
            </section>

            <section id="contato" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/5">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Contato</h2>
              </div>
              <div className="bg-muted/30 p-8 rounded-2xl border border-border/50 space-y-6">
                <p className="text-muted-foreground">
                  Como sou o único responsável pela Doce Ilusão (pessoa física),
                  todas as dúvidas ou solicitações relacionadas à privacidade
                  devem ser enviadas diretamente para mim.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      E-mail
                    </p>
                    <p className="text-primary font-medium">
                      lojamagica@doceilusao.store
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Endereço
                    </p>
                    <p className="text-foreground">
                      Rua Ribeirão Preto, *** - Cidade Nova II
                      <br />
                      Santa Bárbara D'Oeste, SP - CEP 13454-027
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-10 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-sm text-muted-foreground">
                © 2026 Doce Ilusão - André Cauê G. C. Todos os direitos
                reservados.
              </p>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="gap-2 group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Voltar para a loja
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-muted/20 border-t border-border/50 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold text-sm">Doce Ilusão</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button
                  onClick={() => navigate("/")}
                  className="hover:text-primary transition-colors"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/loja")}
                  className="hover:text-primary transition-colors"
                >
                  Loja
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/conteudo")}
                  className="hover:text-primary transition-colors"
                >
                  Conteúdo
                </button>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button className="text-primary font-medium">
                  Privacidade
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-colors">
                  Termos de Uso
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-colors">
                  Cookies
                </button>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-sm">Ajuda</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button className="hover:text-primary transition-colors">
                  FAQ
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-colors">
                  Suporte
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-colors">
                  Envios
                </button>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-sm">Redes</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button className="hover:text-primary transition-colors">
                  Instagram
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-colors">
                  YouTube
                </button>
              </li>
              <li>
                <button className="hover:text-primary transition-colors">
                  TikTok
                </button>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};
