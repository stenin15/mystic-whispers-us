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
    question: "Is my reading unique and personalized?",
    answer:
      "Yes. Madame Aurora reads the lines of your palm, your energy profile, and your quiz answers to create a deeply personalized experience. Every insight is unique to you.",
  },
  {
    question: "Can I access my reading again later?",
    answer:
      "Absolutely. Your reading stays available on this page whenever you want to revisit it. We recommend bookmarking it for easy access.",
  },
  {
    question: "What’s included in my reading?",
    answer:
      "Your reading includes: an overview of your dominant energy, your natural strengths, the blocks currently holding you back, and clear guidance you can use right away.",
  },
  {
    question: "Need support or have a question?",
    answer:
      "Email us at suporte@madameaurora.com. We’re here to help.",
  },
];

const DeliveryFAQ = forwardRef<HTMLDivElement, DeliveryFAQProps>(({
  items = defaultFAQItems,
  title = "Frequently Asked Questions",
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
