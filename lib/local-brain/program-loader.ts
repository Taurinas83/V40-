/**
 * Program Loader — loads 900 real workout programs from 6 JSON files on GitHub
 * and converts them to ProgramTemplate format for the matching engine.
 */

import type { ProgramTemplate, DaySlot } from './program-templates';

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

  // Create stub day slots (will be populated by program-generator with real exercises)
  const dias: DaySlot[] = [];
  for (let i = 0; i < raw.frequency_days; i++) {
    dias.push({
      label: `Dia ${i + 1}`,
      focus: raw.focus.join(', ') || 'Treinamento',
      slots: [], // Will be filled by generator
    });
  }

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
 * Load all 900 programs from GitHub
 */
export async function loadProgramDatabase(): Promise<ProgramTemplate[]> {
  // Return cached if already loaded
  if (cachedPrograms) {
    return cachedPrograms;
  }

  console.log('[ProgramLoader] Iniciando carregamento de 900 programas...');
  const allPrograms: RawProgram[] = [];

  // Fetch all 6 batches in parallel
  const batches = await Promise.all(PROGRAM_URLS.map(fetchProgramBatch));
  for (const batch of batches) {
    allPrograms.push(...batch);
  }

  // Convert to template format
  const templates = allPrograms.map(convertRawProgram);

  // Cache the result
  cachedPrograms = templates;

  console.log(`[ProgramLoader] ✓ Carregados ${templates.length} programas com sucesso`);
  return templates;
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
