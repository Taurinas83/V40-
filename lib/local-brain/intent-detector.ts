/**
 * Intent detection — determines whether a request is a program generation,
 * a feedback adjustment, or something the AI cascade needs to handle.
 */

import type { UserProfile } from './program-generator';
import type { ProgramData } from '../responses';

export type LocalIntentType =
  | 'generate_program'
  | 'feedback_adjustment'
  | 'question_only'         // conversational, not a program request
  | 'unknown';

export interface LocalIntent {
  type: LocalIntentType;
  canHandle: boolean;
  existingProgram?: ProgramData;
}

// Keywords that signal a program generation request
const PROGRAM_INTENT_KEYWORDS = [
  'programa', 'treino', 'treinamento', 'plano de treino', 'plano',
  'montar', 'criar', 'gerar', 'fazer', 'me dê', 'quero um',
  'semana', 'dias por semana', 'dias de treino',
  'hipertrofia', 'emagrecer', 'emagrecimento', 'forca', 'força',
  'resistencia', 'resistência', 'definicao', 'definição',
  'reabilitacao', 'reabilitação',
  '2 dias', '3 dias', '4 dias', '5 dias', '6 dias',
  '2x', '3x', '4x', '5x', '6x',
];

// Keywords that signal feedback on an existing program
const FEEDBACK_INTENT_KEYWORDS = [
  'cansado', 'exausto', 'esgotado', 'fadiga',
  'muito fácil', 'muito facil', 'leve demais',
  'dor no ombro', 'dor no joelho', 'dor na lombar', 'dor nas costas',
  'progresso lento', 'não evoluí', 'nao evolui', 'estagnado',
  'falta tempo', 'sem tempo', 'pouco tempo',
  'muito pesado', 'não consigo', 'nao consigo',
  'ajusta', 'ajuste', 'modifica', 'modifique', 'muda', 'mude',
  'sem academia', 'em casa', 'sem equipamento',
  'entediado', 'chato', 'monótono',
];

// Keywords that suggest purely informational questions (best handled by AI)
const QUESTION_ONLY_KEYWORDS = [
  'o que é', 'como funciona', 'por que', 'porque',
  'diferença entre', 'qual a diferença',
  'me explica', 'explique',
  'nutrição', 'dieta', 'suplemento', 'suplementação',
  'proteína em pó', 'creatina',
];

/**
 * Detect the intent of a prompt given an optional user profile.
 */
export function detectIntent(
  prompt: string,
  userProfile: Partial<UserProfile>,
  existingProgram?: ProgramData
): LocalIntent {
  const lower = prompt.toLowerCase();

  // Feedback adjustment — only if there's an existing program
  if (existingProgram && FEEDBACK_INTENT_KEYWORDS.some(kw => lower.includes(kw))) {
    return { type: 'feedback_adjustment', canHandle: true, existingProgram };
  }

  // Program generation — most explicit signal
  const hasProgramKeyword = PROGRAM_INTENT_KEYWORDS.some(kw => lower.includes(kw));
  const hasObjective = hasAnyObjective(userProfile);

  if (hasProgramKeyword || hasObjective) {
    return { type: 'generate_program', canHandle: true };
  }

  // Pure question — let AI handle
  const isQuestion = QUESTION_ONLY_KEYWORDS.some(kw => lower.includes(kw));
  if (isQuestion) {
    return { type: 'question_only', canHandle: false };
  }

  // Default: if user has objetivo set, try to generate a program
  if (userProfile.objetivo) {
    return { type: 'generate_program', canHandle: true };
  }

  return { type: 'unknown', canHandle: false };
}

function hasAnyObjective(profile: Partial<UserProfile>): boolean {
  return !!(
    profile.objetivo ||
    profile.diasDisponiveis
  );
}
