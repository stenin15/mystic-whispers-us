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
    question: "How would you describe your energy right now?",
    voiceIntro: "{name}, tell me... how are you feeling right now? How would you describe your energy in this moment?",
    options: [
      { id: "a", text: "Intense and alive — ideas flowing" },
      { id: "b", text: "Calm and reflective — more inward" },
      { id: "c", text: "Up and down — emotionally unpredictable" },
      { id: "d", text: "Blocked — it's hard to connect with myself" },
    ],
  },
  {
    id: 2,
    question: "What's calling you most in this season of your life?",
    voiceIntro: "{name}, I need to know... what's moving you most right now? What makes your heart feel awake?",
    options: [
      { id: "a", text: "Love and relationships" },
      { id: "b", text: "Career and purpose" },
      { id: "c", text: "Self-discovery and personal growth" },
      { id: "d", text: "Health and well-being" },
    ],
  },
  {
    id: 8,
    question: "Look at the top line crossing your palm — your heart line. How does it appear?",
    voiceIntro: "{name}, let's look at your palm together for a moment. Find the top horizontal line — your heart line. What does it look like?",
    options: [
      { id: "a", text: "It curves up clearly toward my index or middle finger" },
      { id: "b", text: "It stays mostly horizontal across my palm" },
      { id: "c", text: "It's broken or has forks at the end" },
      { id: "d", text: "I can't tell clearly — the line is faint or unclear" },
    ],
  },
  {
    id: 9,
    question: "Look at the pinky side of your palm — do you see small horizontal lines near the base of your little finger?",
    voiceIntro: "{name}, now look at the edge of your palm, just below your little finger. These are often called marriage or affection lines.",
    options: [
      { id: "a", text: "Yes — I can see one clear line" },
      { id: "b", text: "Yes — I can see two or more lines" },
      { id: "c", text: "There's something faint but it's not clear" },
      { id: "d", text: "I don't see any lines there" },
    ],
  },
  {
    id: 3,
    question: "How do you move through emotional challenges?",
    voiceIntro: "{name}, we all go through heavy moments... tell me, how do you usually handle emotional challenges?",
    options: [
      { id: "a", text: "I face them head-on" },
      { id: "b", text: "I need time to process" },
      { id: "c", text: "I lean on people I trust" },
      { id: "d", text: "I tend to avoid or hold it in" },
    ],
  },
  {
    id: 4,
    question: "Which element of nature resonates most with you?",
    voiceIntro: "{name}, here's a special one... which element of nature feels most aligned with your essence?",
    options: [
      { id: "a", text: "Fire — passion and transformation" },
      { id: "b", text: "Water — emotion and intuition" },
      { id: "c", text: "Earth — stability and grounding" },
      { id: "d", text: "Air — freedom and communication" },
    ],
  },
  {
    id: 5,
    question: "How do you feel about your future?",
    voiceIntro: "{name}, looking ahead... how do you feel when you think about your future?",
    options: [
      { id: "a", text: "Optimistic — it feels full of possibilities" },
      { id: "b", text: "Anxious — there's a lot of uncertainty" },
      { id: "c", text: "Neutral — I'm letting life unfold" },
      { id: "d", text: "Worried — I need clearer direction" },
    ],
  },
  {
    id: 6,
    question: "What are you hoping to receive from this reading?",
    voiceIntro: "{name}, we're almost there... tell me, what are you hoping to receive from this reading? What are you truly looking for?",
    options: [
      { id: "a", text: "Clarity about my path" },
      { id: "b", text: "Emotional healing and releasing blocks" },
      { id: "c", text: "Confirmation of what I already sense" },
      { id: "d", text: "Guidance for an important decision" },
    ],
  },
  {
    id: 7,
    question: "What do you feel is your greatest inner strength?",
    voiceIntro: "{name}, last question... and it matters. What do you feel is your greatest inner strength?",
    options: [
      { id: "a", text: "My strong intuition" },
      { id: "b", text: "My capacity to love" },
      { id: "c", text: "My resilience" },
      { id: "d", text: "My creativity" },
    ],
  },
];
