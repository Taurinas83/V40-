/**
 * Program Generator — the core of the local brain.
 * Takes a user profile and generates a complete ProgramData without any API call.
 */

import type { ProgramData, ProgramDay, Exercise } from '../responses';
import {
  EXERCISE_DB_V2,
  ExerciseV2,
  filterExercises,
  toResponseExercise,
  getSafeSubstitute,
} from './exercise-db-v2';
import {
  ProgramTemplate,
  DaySlot,
  ExerciseSlot,
  findBestTemplate,
  Objetivo,
  Nivel,
} from './program-templates';
import {
  selectPeriodization,
  getWeekProfile,
  applyWeekProfile,
} from './periodization';

export interface UserProfile {
  objetivo: string;
  nivel: string;
  diasDisponiveis: number;
  equipamento: string[];
  lesoes: string[];
  idade: number;
  genero: string;
  nome?: string;
  semanaAtual?: number;
}

const EQUIPMENT_DEFAULTS = ['peso_corporal', 'halter', 'banco', 'maquina', 'cabo', 'barra_fixa', 'barra', 'rack'];

/**
 * Main entry: generate a complete program for a user profile.
 */
export function generateProgram(profile: UserProfile): ProgramData {
  const {
    objetivo,
    nivel = 'iniciante',
    diasDisponiveis = 3,
    equipamento = EQUIPMENT_DEFAULTS,
    lesoes = [],
    idade = 45,
    semanaAtual = 1,
  } = profile;

  // 1. Find the best matching template
  const template = findBestTemplate({
    objetivo,
    nivel,
    frequencia: diasDisponiveis,
    lesoes,
    idade,
  });

  // 2. Select periodization scheme
  const scheme = selectPeriodization({ objetivo, nivel, idade, duracaoSemanas: template.duracaoSemanas });
  const weekProfile = getWeekProfile(scheme, semanaAtual);

  // 3. Generate each training day
  const days: ProgramDay[] = template.dias.map((daySlot, idx) => {
    const exercises = generateExercisesForDay(daySlot, {
      equipamento,
      lesoes,
      nivel,
      weekProfile,
    });

    return {
      day: daySlot.label,
      focus: daySlot.focus,
      exercises,
    };
  });

  // 4. Build program notes
  const notes = buildNotes(template, scheme, weekProfile, lesoes, idade);

  return {
    name: buildProgramName(template, profile),
    days,
    notes,
  };
}

// ─────────────────────────────────────────────────────────
// Exercise selection per day slot
// ─────────────────────────────────────────────────────────

function generateExercisesForDay(
  daySlot: DaySlot,
  opts: {
    equipamento: string[];
    lesoes: string[];
    nivel: string;
    weekProfile: ReturnType<typeof getWeekProfile>;
  }
): Exercise[] {
  const { equipamento, lesoes, nivel, weekProfile } = opts;
  const exercises: Exercise[] = [];

  // Track which exercises we've already picked to avoid duplicates in same day
  const usedIds = new Set<string>();

  console.log(`[LocalBrain] Generating exercises for ${daySlot.label}, slots: ${daySlot.slots.length}`);

  for (const slot of daySlot.slots) {
    const ex = pickExerciseForSlot(slot, { equipamento, lesoes, nivel, usedIds });
    if (!ex) {
      console.log(`[LocalBrain] No exercise found for slot: ${slot.categoria} / ${slot.padrao_motor}`);
      continue;
    }

    usedIds.add(ex.id);

    const { sets, reps } = applyWeekProfile(slot.sets, slot.reps, weekProfile);

    exercises.push(toResponseExercise(ex, {
      sets,
      reps,
      t: slot.rest,
      bfr: slot.bfr ?? false,
    }));
  }

  return exercises;
}

function pickExerciseForSlot(
  slot: ExerciseSlot,
  opts: { equipamento: string[]; lesoes: string[]; nivel: string; usedIds: Set<string> }
): ExerciseV2 | null {
  const { equipamento, lesoes, nivel, usedIds } = opts;

  // Get candidates matching the slot criteria
  let candidates = filterExercises({
    categoria: slot.categoria,
    padrao_motor: slot.padrao_motor,
    nivel,
    equipamento,
    lesoes,
  }).filter(ex => !usedIds.has(ex.id));

  if (candidates.length === 0) {
    // Relax nivel constraint
    candidates = filterExercises({
      categoria: slot.categoria,
      padrao_motor: slot.padrao_motor,
      equipamento,
      lesoes,
    }).filter(ex => !usedIds.has(ex.id));
  }

  if (candidates.length === 0) {
    // Relax equipamento constraint
    candidates = filterExercises({
      categoria: slot.categoria,
      padrao_motor: slot.padrao_motor,
      lesoes,
    }).filter(ex => !usedIds.has(ex.id));
  }

  if (candidates.length === 0) return null;

  // Prefer compound (non-unilateral) exercises for the first slot
  const compound = candidates.filter(e => !e.unilateral);
  const pool = compound.length > 0 ? compound : candidates;

  // Deterministic selection — pick based on stable order (no random) for reproducibility
  return pool[0];
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function buildProgramName(template: ProgramTemplate, profile: UserProfile): string {
  const objectiveLabel: Record<string, string> = {
    hipertrofia: 'Hipertrofia',
    emagrecimento: 'Emagrecimento',
    forca: 'Força',
    resistencia: 'Resistência',
    reabilitacao: 'Reabilitação',
    definicao: 'Definição',
    manutencao: 'Manutenção',
  };

  const splitLabel: Record<string, string> = {
    fullbody: 'Fullbody',
    upper_lower: 'Upper/Lower',
    ppl: 'Push/Pull/Legs',
    hiit: 'HIIT',
    especializado: 'Especializado',
    reabilitacao: 'Reabilitação',
  };

  const obj = objectiveLabel[template.objetivo] || template.objetivo;
  const split = splitLabel[template.split] || template.split;
  const freq = template.frequencia;
  const nome = profile.nome ? ` para ${profile.nome}` : '';

  return `Programa de ${obj} – ${split} ${freq}x/semana${nome}`;
}

function buildNotes(
  template: ProgramTemplate,
  scheme: ReturnType<typeof selectPeriodization>,
  weekProfile: ReturnType<typeof getWeekProfile>,
  lesoes: string[],
  idade: number
): string[] {
  const notes: string[] = [];

  // Week info
  notes.push(`📅 ${weekProfile.label} (${scheme.nome})`);

  // Program duration
  notes.push(`⏱️ Duração total: ${template.duracaoSemanas} semanas`);

  // Deload info
  if (weekProfile.isDeload) {
    notes.push('⚡ Esta é uma semana de deload — treinos mais leves para recuperação máxima.');
  }

  // 40+ specific advice
  if (idade >= 40) {
    notes.push('🔥 40+ Dica: Faça 10-15min de aquecimento antes de cada treino. Mobilidade é fundamental.');
    notes.push('💤 Sono: 7-9h por noite é tão importante quanto o treino em si.');
    notes.push('🥩 Proteína: mínimo 1,8g por kg de peso corporal/dia para manter massa muscular.');
  }

  // Injury advice
  if (lesoes.length > 0) {
    notes.push(`⚠️ Lesões consideradas: ${lesoes.join(', ')}. Exercícios adaptados. Se aumentar a dor, pare e consulte um especialista.`);
  }

  // Template notes
  if (template.notas) {
    notes.push(...template.notas);
  }

  return notes;
}

// ─────────────────────────────────────────────────────────
// Conversation text generator
// ─────────────────────────────────────────────────────────

/**
 * Generate a human-like response text to accompany the program.
 */
export function generateProgramText(profile: UserProfile, program: ProgramData): string {
  const { objetivo, nivel, diasDisponiveis, lesoes, idade, nome } = profile;

  const greeting = nome ? `Perfeito, ${nome}!` : 'Perfeito!';

  const objectiveText: Record<string, string> = {
    hipertrofia: 'ganho de massa muscular',
    emagrecimento: 'emagrecimento e queima de gordura',
    forca: 'desenvolvimento de força máxima',
    resistencia: 'melhora da resistência',
    reabilitacao: 'reabilitação e fortalecimento',
    definicao: 'definição muscular',
    manutencao: 'manutenção da forma física',
  };

  const objText = objectiveText[objetivo] || objetivo;
  const injuryNote = lesoes.length > 0
    ? ` Adaptei os exercícios considerando as suas limitações nas regiões: ${lesoes.join(', ')}.`
    : '';

  const age40Note = idade >= 40
    ? ' Inclui recomendações específicas para 40+, com foco em recuperação e preservação articular.' : '';

  return `${greeting} Aqui está o seu programa personalizado de **${objText}** — ${diasDisponiveis}x por semana, nível ${nivel}.${injuryNote}${age40Note}

O programa tem ${program.days.length} dias de treino, com ${program.notes?.length || 0} dicas personalizadas. Execute os exercícios na ordem indicada e respeite os tempos de descanso para maximizar os resultados.

Qualquer dúvida sobre técnica ou se sentir dor em algum exercício, me avise e ajusto imediatamente! 💪`;
}
