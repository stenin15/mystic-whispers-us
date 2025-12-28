import { motion } from "framer-motion";
import { forwardRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface DeliveryFAQProps {
  items?: FAQItem[];
  title?: string;
}

const defaultFAQItems: FAQItem[] = [
  {
    question: "Minha leitura é única e personalizada?",
    answer:
      "Sim! Madame Aurora analisa profundamente as linhas da sua mão, seu perfil energético e suas respostas do quiz para criar uma leitura 100% personalizada para você. Cada revelação é única.",
  },
  {
    question: "Posso acessar minha leitura novamente?",
    answer:
      "Sim! Sua leitura fica disponível nesta página sempre que precisar revisitar. Recomendamos salvar nos favoritos para consultas futuras.",
  },
  {
    question: "O que está incluído na minha leitura?",
    answer:
      "Sua leitura inclui: análise do seu tipo energético, revelação dos seus dons e pontos fortes, identificação de bloqueios a serem superados, mensagem espiritual canalizada especialmente para você, e orientações práticas para sua transformação.",
  },
  {
    question: "Preciso de suporte ou tenho dúvidas?",
    answer:
      "Entre em contato conosco através do e-mail suporte@madameaurora.com ou pelo WhatsApp disponível em nosso site. Estamos aqui para ajudar!",
  },
];

const DeliveryFAQ = forwardRef<HTMLDivElement, DeliveryFAQProps>(({
  items = defaultFAQItems,
  title = "Perguntas Frequentes",
}, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass rounded-2xl p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="w-6 h-6 text-mystic-gold" />
        <h3 className="text-xl font-serif font-semibold text-foreground">
          {title}
        </h3>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {items.map((item, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border-b border-border/50 last:border-0"
          >
            <AccordionTrigger className="text-left text-foreground hover:text-mystic-gold transition-colors py-4">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
});

DeliveryFAQ.displayName = "DeliveryFAQ";

export default DeliveryFAQ;
