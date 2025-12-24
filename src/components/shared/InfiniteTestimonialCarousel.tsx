import { TestimonialCard } from './TestimonialCard';
import avatarCarla from '@/assets/avatar-carla.jpg';
import avatarRafael from '@/assets/avatar-rafael.jpg';
import avatarPatricia from '@/assets/avatar-patricia.jpg';
import avatarFernanda from '@/assets/avatar-fernanda.jpg';
import avatarEduardo from '@/assets/avatar-eduardo.jpg';
import avatarMariana from '@/assets/avatar-mariana.jpg';

const avatars = [avatarCarla, avatarRafael, avatarPatricia, avatarFernanda, avatarEduardo, avatarMariana];

const testimonials = [
  { name: "Carla Medeiros, 32", text: "Fiz por curiosidade, mas me surpreendi. A análise identificou um padrão de autossabotagem que eu venho repetindo há anos. Foi um despertar." },
  { name: "Rafael Souza, 29", text: "Achei que seria algo genérico, mas não. Descreveu situações específicas da minha vida com uma precisão que me deixou sem palavras." },
  { name: "Patricia Lopes, 45", text: "Recebi orientações sobre minha carreira que eu precisava ouvir. Tomei decisões que estavam travadas há meses. Valeu cada centavo." },
  { name: "Fernanda Costa, 38", text: "A leitura trouxe clareza sobre meu relacionamento. Entendi dinâmicas que eu não conseguia enxergar sozinha. Recomendo muito." },
  { name: "Eduardo Silva, 42", text: "Empresário cético, mas precisava de uma nova perspectiva. A análise me ajudou a entender bloqueios que afetavam meus negócios." },
  { name: "Mariana Oliveira, 27", text: "Estava perdida na vida, sem saber que caminho seguir. A leitura me deu direção e confiança para tomar decisões importantes." },
  { name: "Lucas Ferreira, 35", text: "A precisão foi impressionante. Identificou traumas de infância que ainda me afetavam. Comecei minha jornada de cura." },
  { name: "Beatriz Santos, 41", text: "Sempre fui cética, mas a análise me convenceu. Revelou padrões que eu não percebia em meus relacionamentos." },
  { name: "Gustavo Lima, 33", text: "Recebi insights sobre minha vocação profissional que me fizeram repensar toda minha carreira. Gratidão eterna." },
  { name: "Amanda Rocha, 26", text: "A mensagem espiritual que recebi era exatamente o que eu precisava ouvir naquele momento da minha vida." },
  { name: "Thiago Mendes, 39", text: "Minha esposa me convenceu a fazer. Hoje agradeço, pois entendi comportamentos que prejudicavam nosso casamento." },
  { name: "Juliana Alves, 44", text: "Terceira vez que faço e sempre me surpreendo. As orientações são cada vez mais profundas e certeiras." },
  { name: "Diego Martins, 31", text: "A leitura identificou um bloqueio financeiro que eu carregava há anos. Depois disso, minha vida mudou." },
  { name: "Camila Ribeiro, 28", text: "Chorei lendo minha análise. Parecia que alguém finalmente me entendia de verdade. Experiência transformadora." },
  { name: "Roberto Nunes, 47", text: "Com quase 50 anos, achei que já me conhecia. A leitura revelou camadas que eu desconhecia em mim mesmo." },
  { name: "Larissa Moura, 24", text: "Jovem e indecisa sobre o futuro. A análise me deu clareza sobre meus talentos e o caminho a seguir." },
  { name: "Felipe Cardoso, 36", text: "Empresário que buscava entender por que alguns negócios não prosperavam. A resposta estava na energia." },
  { name: "Renata Vieira, 40", text: "Perdi minha mãe recentemente. A mensagem espiritual trouxe conforto e paz que eu não encontrava em lugar nenhum." },
  { name: "Bruno Teixeira, 30", text: "Fiz com minha namorada. Ambos ficamos impressionados com a precisão. Fortaleceu nossa conexão." },
  { name: "Isabela Franco, 34", text: "A leitura revelou um dom artístico que eu reprimia há anos. Hoje sou pintora nas horas vagas." },
  { name: "André Machado, 43", text: "Executivo estressado buscando propósito. A análise me reconectou com o que realmente importa na vida." },
  { name: "Priscila Duarte, 29", text: "Terceira leitura no site. Cada uma mais profunda que a anterior. Virou parte do meu autoconhecimento." },
  { name: "Marcelo Freitas, 38", text: "Cético convicto que virou fã. A precisão sobre minha personalidade foi assustadoramente exata." },
  { name: "Tatiana Gomes, 46", text: "Mãe de três filhos, esqueci de cuidar de mim. A leitura me lembrou de quem eu sou além da maternidade." },
  { name: "Victor Hugo, 25", text: "Ansioso sobre o futuro profissional. A análise me acalmou e mostrou que estou no caminho certo." },
  { name: "Daniela Barros, 37", text: "Divorciada recentemente, precisava de direção. A leitura me deu forças para recomeçar com confiança." },
  { name: "Ricardo Pinto, 49", text: "Meio século de vida e ainda aprendendo sobre mim. A análise trouxe revelações surpreendentes." },
  { name: "Natália Cruz, 23", text: "Mais nova da família a fazer. Hoje todos já fizeram. A experiência une e transforma famílias." },
  { name: "Fábio Correia, 34", text: "Atleta profissional buscando entender bloqueios mentais. A leitura desbloqueou minha performance." },
  { name: "Vanessa Lima, 42", text: "Professora que buscava propósito renovado. A análise me reconectou com minha missão de vida." },
];

export const InfiniteTestimonialCarousel = () => {
  // Duplicate testimonials for seamless infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <div className="relative overflow-hidden py-4">
      {/* Gradient overlays for smooth edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <div className="flex animate-scroll-slow hover:pause-animation">
        {duplicatedTestimonials.map((testimonial, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-[350px] px-3"
          >
            <TestimonialCard
              name={testimonial.name}
              text={testimonial.text}
              avatar={avatars[index % avatars.length]}
              delay={0}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
