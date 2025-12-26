/**
 * Hook para micro-feedbacks do "coach" durante o quiz.
 * Retorna texto apenas em perguntas específicas (índices 1, 3, 5).
 * NÃO faz chamadas à IA - usa regras locais apenas.
 */

const COACH_MESSAGES = [
  // Grupo 1 - mensagens místicas genéricas
  [
    "Isso costuma aparecer em fases de virada.",
    "Anotei. Esse detalhe muda a leitura.",
    "Interessante… isso indica um padrão repetido.",
    "Percebo algo importante nessa escolha.",
  ],
  // Grupo 2 - mensagens de validação
  [
    "Sua energia está se revelando claramente.",
    "Esse ponto confirma algo que já sentia.",
    "Registrado. Há uma conexão aqui.",
    "Isso faz sentido com o que vi antes.",
  ],
  // Grupo 3 - mensagens de profundidade
  [
    "Estou captando uma camada mais profunda.",
    "Há um significado oculto nessa resposta.",
    "Isso revela um ciclo importante.",
    "Percebo uma energia forte aqui.",
  ],
];

interface UseMicroCoachResult {
  text: string | null;
}

export function useMicroCoach(
  questionIndex: number,
  selectedOptionLabel: string | null | undefined,
  userFirstName?: string
): UseMicroCoachResult {
  // Só retorna texto nos índices 1, 3, 5 (ou seja, após perguntas 2, 4, 6)
  const targetIndices = [1, 3, 5];
  
  if (!targetIndices.includes(questionIndex) || !selectedOptionLabel) {
    return { text: null };
  }
  
  // Seleciona grupo de mensagens baseado no índice
  const groupIndex = targetIndices.indexOf(questionIndex);
  const messages = COACH_MESSAGES[groupIndex] || COACH_MESSAGES[0];
  
  // Seleciona mensagem baseada no hash da resposta selecionada
  const hash = selectedOptionLabel.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const messageIndex = hash % messages.length;
  
  return { text: messages[messageIndex] };
}

export default useMicroCoach;
