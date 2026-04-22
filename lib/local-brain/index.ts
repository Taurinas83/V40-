/**
 * Local Brain — public API
 *
 * Handles 90%+ of requests locally with zero API cost.
 * Falls through to the AI cascade only for genuinely complex/conversational requests.
 */

import type { ChatResponse } from '../responses';
import { createChatResponse } from '../responses';
import { UserProfile, generateProgram, generateProgramText } from './program-generator';
import { detectFeedback, applyFeedbackRules } from './feedback-rules';
import { detectIntent, LocalIntent } from './intent-detector';

export type { UserProfile };

// ─────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────

/**
 * Determine whether the local brain can fully handle this request.
 * Returns true when intent is clear and the user profile has enough data.
 */
export function canHandleLocally(
  prompt: string,
  userProfile: Partial<UserProfile>
): boolean {
  const intent = detectIntent(prompt, userProfile);
  return intent.canHandle;
}

/**
 * Generate a full ChatResponse locally — no API calls.
 */
export function generateLocalResponse(
  prompt: string,
  userProfile: Partial<UserProfile>,
  startTime: number = Date.now()
): ChatResponse {
  const intent = detectIntent(prompt, userProfile);

  switch (intent.type) {
    case 'generate_program':
      return handleGenerateProgram(prompt, userProfile as UserProfile, startTime);
    case 'feedback_adjustment':
      return handleFeedbackAdjustment(prompt, userProfile as UserProfile, intent.existingProgram, startTime);
    default:
      return createChatResponse(
        { text: 'Entendido! Me conta um pouco mais sobre seu objetivo para eu montar o programa ideal para você.', isProgram: false, isWorkout: false },
        'local',
        Date.now() - startTime
      );
  }
}

// ─────────────────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────────────────

function handleGenerateProgram(
  prompt: string,
  userProfile: UserProfile,
  startTime: number
): ChatResponse {
  try {
    console.log('[LocalBrain] Normalizando perfil...', { objetivo: userProfile.objetivo, dias: userProfile.diasDisponiveis });
    const normalizedProfile = normalizeProfile(userProfile, prompt);

    console.log('[LocalBrain] Gerando programa para:', normalizedProfile.objetivo);
    const program = generateProgram(normalizedProfile);

    console.log('[LocalBrain] Programa gerado com sucesso! Dias:', program.days.length);
    const text = generateProgramText(normalizedProfile, program);

    return createChatResponse(
      { text, isProgram: true, program, isWorkout: false },
      'local',
      Date.now() - startTime
    );
  } catch (error) {
    console.error('[LocalBrain] ERRO ao gerar programa:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return createChatResponse(
      {
        text: `Erro ao gerar treino local: ${errorMsg}. Tentando via IA...`,
        isProgram: false,
        isWorkout: false
      },
      'local',
      Date.now() - startTime
    );
  }
}

function handleFeedbackAdjustment(
  prompt: string,
  userProfile: UserProfile,
  existingProgram: any,
  startTime: number
): ChatResponse {
  const feedbackTypes = detectFeedback(prompt);

  if (!existingProgram || feedbackTypes.length === 0) {
    return handleGenerateProgram(prompt, userProfile, startTime);
  }

  const { program: adjusted, messages } = applyFeedbackRules(existingProgram, feedbackTypes);

  const feedbackText = messages.length > 0
    ? messages.join('\n\n')
    : 'Ajustei o programa com base no seu feedback.';

  return createChatResponse(
    { text: feedbackText, isProgram: true, program: adjusted, isWorkout: false },
    'local',
    Date.now() - startTime
  );
}

// ─────────────────────────────────────────────────────────
// Profile normalization
// ─────────────────────────────────────────────────────────

function normalizeProfile(
  userProfile: Partial<UserProfile>,
  prompt: string
): UserProfile {
  const lower = prompt.toLowerCase();

  // Detect objetivo from prompt if not set
  let objetivo = userProfile.objetivo || detectObjetivoFromPrompt(lower);

  // Detect dias from prompt if not set
  let dias = userProfile.diasDisponiveis || detectDiasFromPrompt(lower);

  // Detect nivel from prompt
  let nivel = userProfile.nivel || detectNivelFromPrompt(lower);

  // Detect lesoes from prompt
  const lesoesFromPrompt = detectLesoesFromPrompt(lower);
  const lesoes = [...new Set([...(userProfile.lesoes || []), ...lesoesFromPrompt])];

  return {
    objetivo,
    nivel,
    diasDisponiveis: dias,
    equipamento: userProfile.equipamento || ['halter', 'maquina', 'peso_corporal', 'banco', 'cabo', 'barra', 'barra_fixa'],
    lesoes,
    idade: userProfile.idade || 45,
    genero: userProfile.genero || 'M',
    nome: userProfile.nome,
    semanaAtual: userProfile.semanaAtual || 1,
  };
}

function detectObjetivoFromPrompt(lower: string): string {
  if (/emagrec|perder.*(peso|gordura|barriga)|queimar.*(gordura|caloria)/.test(lower)) return 'emagrecimento';
  if (/hipertrofia|ganhar.*(massa|músculo|musculo)|musculaç/.test(lower)) return 'hipertrofia';
  if (/força|forca|power|powerlifting|levantar/.test(lower)) return 'forca';
  if (/resistência|resistencia|cardio|condicionamento|anaeróbico/.test(lower)) return 'resistencia';
  if (/reabilit|lesão|lesao|lesionado|recuperaç/.test(lower)) return 'reabilitacao';
  if (/definiç|definicao|secar|cortar|cutting/.test(lower)) return 'definicao';
  return 'hipertrofia'; // default
}

function detectDiasFromPrompt(lower: string): number {
  const match = lower.match(/(\d)\s*(dias|vezes|x)\s*(por\s*semana|\/semana|semana)/);
  if (match) return Math.min(6, Math.max(2, parseInt(match[1])));
  if (/\b2\s*dias|\bsegunda.*sexta/.test(lower)) return 2;
  if (/\b3\s*dias/.test(lower)) return 3;
  if (/\b4\s*dias/.test(lower)) return 4;
  if (/\b5\s*dias/.test(lower)) return 5;
  if (/\b6\s*dias/.test(lower)) return 6;
  return 3; // default
}

function detectNivelFromPrompt(lower: string): string {
  if (/iniciante|começando|começo|nunca treinei|novo na academia/.test(lower)) return 'iniciante';
  if (/avançado|avancado|expert|veterano/.test(lower)) return 'avancado';
  return 'intermediario';
}

function detectLesoesFromPrompt(lower: string): string[] {
  const lesoes: string[] = [];
  if (/ombro|manguito|deltóide|deltoid/.test(lower)) lesoes.push('ombro');
  if (/joelho|patela|menisco/.test(lower)) lesoes.push('joelho');
  if (/lombar|coluna|hérnia|hernia|costas/.test(lower)) lesoes.push('lombar');
  if (/punho|pulso|carpo/.test(lower)) lesoes.push('punho');
  if (/pescoço|cervical/.test(lower)) lesoes.push('pescoco');
  return lesoes;
}

export { detectObjetivoFromPrompt, detectDiasFromPrompt, detectNivelFromPrompt };
