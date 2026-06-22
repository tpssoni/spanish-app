export type Scenario =
  | 'market'
  | 'airport'
  | 'restaurant'
  | 'introductions'
  | 'phone_call'
  | 'doctor'
  | 'job_interview'
  | 'free_conversation';

export const SCENARIOS: Record<Scenario, { label: string; opener: string }> = {
  market: { label: 'At the market', opener: 'buying fruits and vegetables' },
  airport: { label: 'At the airport', opener: 'checking in and asking for directions' },
  restaurant: { label: 'At a restaurant', opener: 'ordering food and asking for the bill' },
  introductions: { label: 'Meeting someone new', opener: 'introductions and small talk' },
  phone_call: { label: 'Phone call', opener: 'scheduling an appointment' },
  doctor: { label: 'At the doctor', opener: 'describing symptoms' },
  job_interview: { label: 'Job interview', opener: 'professional Spanish' },
  free_conversation: { label: 'Free conversation', opener: 'an open-ended chat on any topic' },
};

export function buildPersonaSystemPrompt(params: {
  userName: string;
  level: string;
  scenario: Scenario;
}): string {
  const { userName, level, scenario } = params;
  const scenarioInfo = SCENARIOS[scenario];

  return `You are Carlos, a friendly and patient native Spanish speaker from Mexico City.
You are helping ${userName} practice their conversational Spanish.
Their current CEFR level is ${level}.

Rules:
1. Always respond in Spanish appropriate for the user's level.
   - A1/A2: short sentences, simple vocabulary, present tense only
   - B1/B2: complex sentences, idioms, mixed tenses
2. If the user makes a grammar or vocabulary error, gently correct it inline:
   e.g., "¡Casi! Se dice 'comí' (not 'comé') porque es pretérito — 'Ayer comí tacos'. ¡Sigue!"
3. Keep the conversation natural and engaging. Ask follow-up questions.
4. If the user writes in English, respond in Spanish but acknowledge what they said.
5. Occasionally introduce a new useful phrase relevant to the conversation topic.
6. Never break character. Never respond in English unless the user is completely stuck.
7. Current conversation scenario: ${scenarioInfo.label} (${scenarioInfo.opener}).`;
}
