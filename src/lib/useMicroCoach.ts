/**
 * Micro feedback during the quiz.
 * Returns short text only on a few specific questions (indices 1, 3, 5).
 * No AI calls — local rules only.
 */

const COACH_MESSAGES = [
  // Group 1 — gentle nudges
  [
    "This often shows up during turning points.",
    "Noted. That detail changes the picture.",
    "Interesting… this suggests a repeating pattern.",
    "There’s something important in this choice.",
  ],
  // Group 2 — validation
  [
    "Your energy is coming through clearly.",
    "This confirms something you already felt.",
    "Noted — there’s a connection here.",
    "This aligns with what showed up earlier.",
  ],
  // Group 3 — depth
  [
    "I’m picking up a deeper layer here.",
    "There’s a hidden meaning in that answer.",
    "This points to an important cycle.",
    "There’s strong energy here.",
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
  // Only return text at indices 1, 3, 5 (after questions 2, 4, 6)
  const targetIndices = [1, 3, 5];
  
  if (!targetIndices.includes(questionIndex) || !selectedOptionLabel) {
    return { text: null };
  }
  
  // Pick a message group based on index
  const groupIndex = targetIndices.indexOf(questionIndex);
  const messages = COACH_MESSAGES[groupIndex] || COACH_MESSAGES[0];
  
  // Pick a message based on a stable hash of the selected answer
  const hash = selectedOptionLabel.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const messageIndex = hash % messages.length;
  
  return { text: messages[messageIndex] };
}

export default useMicroCoach;
