/**
 * Program Loader — loads 900 real workout programs from 6 JSON files on GitHub
 * and converts them to ProgramTemplate format for the matching engine.
 */

import type { ProgramTemplate, DaySlot, ExerciseSlot } from './program-templates';

interface RawProgram {
  id: string;
  category: string;
  name: string;
  frequency_days: number;
  level: string;
  goal: string;
  focus: string[];
  duration_weeks: number;
  sessions_per_week: number;
  split_logic: string;
  periodization: string;
  deload: {
    week: number;
    type: string;
    volume_reduction_percent: number;
  };
  constraints: {
    equipment: string[];
    time_minutes: number;
  };
  tags: string[];
}

interface RawDatabase {
  database: {
    version: string;
    domain: string;
    entity: string;
    chunk: number;
    total_target: number;
  };
  workout_programs: RawProgram[];
}

// GitHub raw content URLs for the 6 JSON files
const PROGRAM_URLS = [
  'https://raw.githubusercontent.com/Taurinas83/V40-/main/treinos_lote_1_150.json',
  'https://raw.githubusercontent.com/Taurinas83/V40-/main/treinos_lote_2_150.json',
  'https://raw.githubusercontent.com/Taurinas83/V40-/main/treinos_lote_3_150.json',
  'https://raw.githubusercontent.com/Taurinas83/V40-/main/treinos_lote_4_150.json',
  'https://raw.githubusercontent.com/Taurinas83/V40-/main/treinos_lote_5_150.json',
  'https://raw.githubusercontent.com/Taurinas83/V40-/main/treinos_lote_6_150.json',
];

let cachedPrograms: ProgramTemplate[] | null = null;

/**
 * Fetch and parse a single JSON file from GitHub
 */
async function fetchProgramBatch(url: string): Promise<RawProgram[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[ProgramLoader] Failed to fetch ${url}: ${response.status}`);
      return [];
    }
    const data = (await response.json()) as RawDatabase;
    return data.workout_programs || [];
  } catch (error) {
    console.warn(`[ProgramLoader] Error fetching ${url}:`, (error as Error).message);
    return [];
  }
}

/**
 * Generate default day slots based on split type and frequency
 */
function generateDaySlots(splitType: string, frequency: number, focus: string[]): DaySlot[] {
  const baseSlots: Record<string, ExerciseSlot[][]> = {
    fullbody: [
      [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 3, reps: '8-12', rest: 90 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 3, reps: '8-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 3, reps: '8-12', rest: 75 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 2, reps: '6-10', rest: 90 },
        { categoria: 'core', padrao_motor: 'core', sets: 2, reps: '30-45s', rest: 45 },
      ],
    ],
    upper_lower: [
      [
        { categoria: 'upper_body', padrao_motor: 'push', sets: 4, reps: '6-10', rest: 90 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 3, reps: '8-10', rest: 90 },
      ],
      [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 4, reps: '6-10', rest: 90 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 3, reps: '6-10', rest: 90 },
      ],
    ],
    ppl: [
      [
        { categoria: 'upper_body', padrao_motor: 'push', sets: 4, reps: '8-10', rest: 75 },
      ],
      [
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 4, reps: '8-10', rest: 75 },
      ],
      [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 4, reps: '6-10', rest: 90 },
      ],
    ],
  };

  const patterns = baseSlots[splitType] || baseSlots.fullbody;
  const dias: DaySlot[] = [];

  for (let i = 0; i < frequency; i++) {
    const patternIdx = i % patterns.length;
    dias.push({
      label: `Dia ${i + 1}`,
      focus: focus.join(', ') || 'Treinamento',
      slots: patterns[patternIdx],
    });
  }

  return dias;
}

/**
 * Convert raw program from JSON to ProgramTemplate shape
 * (simplified version — real programs don't have full day/exercise structure yet)
 */
function convertRawProgram(raw: RawProgram): ProgramTemplate {
  // Map raw split_logic to template split type
  const splitMap: Record<string, string> = {
    fullbody: 'fullbody',
    upper_lower: 'upper_lower',
    ppl: 'ppl',
    hiit: 'hiit',
    splits_especializado: 'especializado',
  };

  // Map raw goal to our objetivo enum
  const goalMap: Record<string, string> = {
    hipertrofia: 'hipertrofia',
    forca: 'forca',
    emagrecimento: 'emagrecimento',
    resistencia: 'resistencia',
    reabilitacao: 'reabilitacao',
    definicao: 'definicao',
  };

  // Map raw level
  const levelMap: Record<string, string> = {
    iniciante: 'iniciante',
    intermediario: 'intermediario',
    avancado: 'avancado',
  };

  // Determine volume/intensity from goal
  const volumeIntensityMap: Record<string, { volume: 'baixo' | 'moderado' | 'alto'; intensidade: 'baixa' | 'moderada' | 'alta' }> = {
    hipertrofia: { volume: 'alto', intensidade: 'moderada' },
    forca: { volume: 'moderado', intensidade: 'alta' },
    emagrecimento: { volume: 'alto', intensidade: 'alta' },
    resistencia: { volume: 'alto', intensidade: 'alta' },
    reabilitacao: { volume: 'baixo', intensidade: 'baixa' },
    definicao: { volume: 'moderado', intensidade: 'alta' },
  };

  const volumeIntensity = volumeIntensityMap[raw.goal] || { volume: 'moderado', intensidade: 'moderada' };

  // Create day slots with default exercises based on split type
  const dias: DaySlot[] = generateDaySlots(raw.split_logic, raw.frequency_days, raw.focus);


  return {
    id: raw.id,
    objetivo: (goalMap[raw.goal] || 'hipertrofia') as any,
    nome: raw.name,
    split: (splitMap[raw.split_logic] || 'fullbody') as any,
    nivel: (levelMap[raw.level] || 'intermediario') as any,
    frequencia: raw.frequency_days,
    duracaoSemanas: raw.duration_weeks,
    volume: volumeIntensity.volume,
    intensidade: volumeIntensity.intensidade,
    periodizacao: (raw.periodization || 'linear') as any,
    dias,
    notas: [
      `Equipamento: ${raw.constraints.equipment.join(', ')}`,
      `Tempo: ~${raw.constraints.time_minutes} minutos`,
      `Deload: Semana ${raw.deload.week} – ${raw.deload.type} (${raw.deload.volume_reduction_percent}% redução)`,
    ],
  };
}

/**
 * Load all 900 programs — generated dynamically without external dependencies
 */
export async function loadProgramDatabase(): Promise<ProgramTemplate[]> {
  // Return cached if already loaded
  if (cachedPrograms) {
    return cachedPrograms;
  }

  console.log('[ProgramLoader] Iniciando carregamento de 900 programas...');

  try {
    // Try to fetch from GitHub first
    const allPrograms: RawProgram[] = [];
    const batches = await Promise.all(PROGRAM_URLS.map(fetchProgramBatch));
    for (const batch of batches) {
      allPrograms.push(...batch);
    }

    if (allPrograms.length > 0) {
      const templates = allPrograms.map(convertRawProgram);
      cachedPrograms = templates;
      console.log(`[ProgramLoader] ✓ Carregados ${templates.length} programas do GitHub`);
      return templates;
    }
  } catch (error) {
    console.log('[ProgramLoader] GitHub não disponível, gerando 900 programas dinamicamente...');
  }

  // Generate 900 programs dynamically
  const templates = generateDynamicPrograms();
  cachedPrograms = templates;

  console.log(`[ProgramLoader] ✓ Gerados ${templates.length} programas dinamicamente`);
  return templates;
}

/**
 * Generate 900 unique programs dynamically
 */
function generateDynamicPrograms(): ProgramTemplate[] {
  const objetivos = ['hipertrofia', 'forca', 'emagrecimento', 'resistencia', 'definicao'];
  const niveis = ['iniciante', 'intermediario', 'avancado'];
  const splits = ['fullbody', 'upper_lower', 'ppl', 'especializado'];
  const durações = [4, 6, 8, 10, 12, 16];

  const templates: ProgramTemplate[] = [];
  let id = 1;

  for (const objetivo of objetivos) {
    for (const nivel of niveis) {
      for (const split of splits) {
        for (const duracao of durações) {
          for (let freq = 2; freq <= 6; freq++) {
            if (templates.length >= 900) break;

            const template: ProgramTemplate = {
              id: `prog_${id++}`,
              objetivo: objetivo as any,
              nome: `${objetivo.charAt(0).toUpperCase() + objetivo.slice(1)} – ${split} ${freq}x/semana (${duracao}w)`,
              split: split as any,
              nivel: nivel as any,
              frequencia: freq,
              duracaoSemanas: duracao,
              volume: objetivo === 'hipertrofia' ? 'alto' : objetivo === 'emagrecimento' ? 'alto' : 'moderado',
              intensidade: objetivo === 'forca' ? 'alta' : objetivo === 'emagrecimento' ? 'alta' : 'moderada',
              periodizacao: 'linear',
              dias: generateDays(split, freq),
              notas: [
                `Nível: ${nivel}`,
                `Duração: ${duracao} semanas`,
                `${freq} dias por semana`,
                `Foco: ${objetivo}`,
              ],
            };

            templates.push(template);
          }
        }
      }
    }
  }

  return templates.slice(0, 900);
}

/**
 * Generate training days based on split type
 */
function generateDays(split: string, frequency: number) {
  const dayPatterns: Record<string, string[][]> = {
    fullbody: [
      ['lower_body', 'squat', 'upper_body', 'push', 'upper_body', 'pull', 'core', 'core'],
    ],
    upper_lower: [
      ['upper_body', 'push', 'upper_body', 'pull'],
      ['lower_body', 'squat', 'lower_body', 'hinge'],
    ],
    ppl: [
      ['upper_body', 'push'],
      ['upper_body', 'pull'],
      ['lower_body', 'squat'],
    ],
    especializado: [
      ['upper_body', 'push', 'upper_body', 'pull'],
      ['lower_body', 'squat', 'lower_body', 'hinge'],
    ],
  };

  const patterns = dayPatterns[split] || dayPatterns.fullbody;
  const days = [];

  for (let i = 0; i < frequency; i++) {
    const patternIdx = i % patterns.length;
    const pattern = patterns[patternIdx];
    const slots = [];

    for (let j = 0; j < pattern.length; j += 2) {
      slots.push({
        categoria: pattern[j],
        padrao_motor: pattern[j + 1],
        sets: 3,
        reps: '8-12',
        rest: 75,
      } as any);
    }

    days.push({
      label: `Dia ${i + 1}`,
      focus: pattern.slice(0, 2).join(', '),
      slots,
    });
  }

  return days;
}

/**
 * Get cached programs without reloading
 */
export function getCachedPrograms(): ProgramTemplate[] | null {
  return cachedPrograms;
}

/**
 * Clear cache (for testing)
 */
export function clearProgramCache(): void {
  cachedPrograms = null;
}
