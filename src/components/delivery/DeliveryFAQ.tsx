import { motion } from "framer-motion";
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
    question: "Qual o prazo para receber minha leitura?",
    answer:
      "Sua leitura simbólica será preparada com todo o cuidado e enviada em até 48 horas úteis. Você receberá uma notificação assim que estiver pronta.",
  },
  {
    question: "Como vou receber minha leitura?",
    answer:
      "Sua leitura será enviada pelo canal que você informou no cadastro (e-mail ou WhatsApp). Fique atenta às suas mensagens!",
  },
  {
    question: "Preciso de suporte ou tenho dúvidas?",
    answer:
      "Entre em contato conosco através do e-mail suporte@madameaurora.com ou pelo WhatsApp disponível em nosso site. Estamos aqui para ajudar!",
  },
];

const DeliveryFAQ = ({
  items = defaultFAQItems,
  title = "Perguntas Frequentes",
}: DeliveryFAQProps) => {
  return (
    <motion.div
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
};

export default DeliveryFAQ;
