export interface QuizQuestion {
  id: number;
  question: string;
  voiceIntro: string; // Personalized intro for voice narration (use {name} as placeholder)
  options: Array<{
    id: string;
    text: string;
  }>;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Como você descreveria sua energia atual neste momento?",
    voiceIntro: "{name}, me conta... como você está se sentindo agora? Como descreveria sua energia neste momento?",
    options: [
      { id: "a", text: "Intensa e vibrante, cheia de ideias" },
      { id: "b", text: "Calma e contemplativa, mais introspectiva" },
      { id: "c", text: "Instável, com altos e baixos constantes" },
      { id: "d", text: "Bloqueada, sinto dificuldade em me conectar" },
    ],
  },
  {
    id: 2,
    question: "O que mais te move neste momento da sua vida?",
    voiceIntro: "{name}, agora preciso saber... o que mais te move neste momento da sua vida? O que faz seu coração bater mais forte?",
    options: [
      { id: "a", text: "Amor e relacionamentos" },
      { id: "b", text: "Carreira e propósito profissional" },
      { id: "c", text: "Autoconhecimento e crescimento pessoal" },
      { id: "d", text: "Saúde e bem-estar" },
    ],
  },
  {
    id: 3,
    question: "Como você lida com desafios emocionais?",
    voiceIntro: "{name}, todos nós enfrentamos momentos difíceis... me diz, como você costuma lidar com os desafios emocionais?",
    options: [
      { id: "a", text: "Enfrento de frente, com coragem" },
      { id: "b", text: "Preciso de tempo para processar" },
      { id: "c", text: "Busco apoio em pessoas próximas" },
      { id: "d", text: "Tendo a evitar ou reprimir" },
    ],
  },
  {
    id: 4,
    question: "Qual elemento da natureza mais ressoa com você?",
    voiceIntro: "{name}, vou te fazer uma pergunta especial... qual elemento da natureza você sente que mais combina com sua essência?",
    options: [
      { id: "a", text: "Fogo - paixão e transformação" },
      { id: "b", text: "Água - emoção e intuição" },
      { id: "c", text: "Terra - estabilidade e praticidade" },
      { id: "d", text: "Ar - liberdade e comunicação" },
    ],
  },
  {
    id: 5,
    question: "Como você se sente em relação ao seu futuro?",
    voiceIntro: "{name}, olhando para frente... como você se sente quando pensa no seu futuro?",
    options: [
      { id: "a", text: "Otimista e cheio(a) de possibilidades" },
      { id: "b", text: "Ansioso(a), com muitas incertezas" },
      { id: "c", text: "Neutro(a), deixo a vida fluir" },
      { id: "d", text: "Preocupado(a), preciso de direção" },
    ],
  },
  {
    id: 6,
    question: "O que você busca encontrar nesta leitura?",
    voiceIntro: "{name}, estamos quase chegando... me diz, o que você espera encontrar nesta leitura? O que seu coração busca?",
    options: [
      { id: "a", text: "Clareza sobre meu caminho" },
      { id: "b", text: "Cura emocional e liberação de bloqueios" },
      { id: "c", text: "Confirmação das minhas intuições" },
      { id: "d", text: "Orientação para decisões importantes" },
    ],
  },
  {
    id: 7,
    question: "Qual é a sua maior força interior?",
    voiceIntro: "{name}, última pergunta... e essa é muito importante. Qual você sente que é a sua maior força interior?",
    options: [
      { id: "a", text: "Minha intuição aguçada" },
      { id: "b", text: "Minha capacidade de amar" },
      { id: "c", text: "Minha resiliência" },
      { id: "d", text: "Minha criatividade" },
    ],
  },
];
