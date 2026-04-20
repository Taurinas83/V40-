/**
 * Periodization schemes — define how volume/intensity evolve week-by-week.
 * The generator uses these to adjust exercise sets/reps per week.
 */

export type PeriodizationType = 'linear' | 'ondulante' | 'block' | 'adaptavel';

export interface WeekProfile {
  week: number;
  volumeMultiplier: number;    // multiplier applied to sets (e.g. 1.0 = normal, 0.5 = deload)
  intensityMultiplier: number; // multiplier applied to load (e.g. 1.1 = heavier)
  repsAdjust: number;          // how much to add/subtract to the lower bound of reps range
  isDeload: boolean;
  label: string;               // description for the user
}

export interface PeriodizationScheme {
  id: string;
  tipo: PeriodizationType;
  nome: string;
  objetivo: string;
  duracaoSemanas: number;
  weeks: WeekProfile[];
  descricao: string;
}

// ─────────────────────────────────────────────────────────
// LINEAR – steady progressive overload with deload every 4 weeks
// ─────────────────────────────────────────────────────────
function buildLinear(durationWeeks: number): WeekProfile[] {
  const weeks: WeekProfile[] = [];
  for (let w = 1; w <= durationWeeks; w++) {
    const isDeload = w % 4 === 0;
    weeks.push({
      week: w,
      volumeMultiplier:    isDeload ? 0.6 : 1 + (w % 4) * 0.05,
      intensityMultiplier: isDeload ? 0.7 : 1 + (w % 4) * 0.03,
      repsAdjust:          isDeload ? 2   : -(w % 4 === 3 ? 2 : 0),
      isDeload,
      label: isDeload ? `Semana ${w} – Deload` : `Semana ${w} – Progressão`,
    });
  }
  return weeks;
}

// ─────────────────────────────────────────────────────────
// ONDULANTE – alternates high-volume / high-intensity each week
// ─────────────────────────────────────────────────────────
function buildOndulante(durationWeeks: number): WeekProfile[] {
  const weeks: WeekProfile[] = [];
  for (let w = 1; w <= durationWeeks; w++) {
    const isDeload = w % 5 === 0;
    const isHighVolume = w % 2 === 1;
    weeks.push({
      week: w,
      volumeMultiplier:    isDeload ? 0.6 : (isHighVolume ? 1.15 : 0.9),
      intensityMultiplier: isDeload ? 0.7 : (isHighVolume ? 0.9 : 1.1),
      repsAdjust:          isDeload ? 3 : (isHighVolume ? 2 : -2),
      isDeload,
      label: isDeload
        ? `Semana ${w} – Deload`
        : `Semana ${w} – ${isHighVolume ? 'Alto volume' : 'Alta intensidade'}`,
    });
  }
  return weeks;
}

// ─────────────────────────────────────────────────────────
// BLOCK – Accumulation → Intensification → Realization → Deload
// ─────────────────────────────────────────────────────────
function buildBlock(durationWeeks: number): WeekProfile[] {
  const weeks: WeekProfile[] = [];
  for (let w = 1; w <= durationWeeks; w++) {
    const blockPos = ((w - 1) % 4) + 1;
    const labels = ['Acumulação', 'Intensificação', 'Realização', 'Deload'];
    const isDeload = blockPos === 4;
    const volMap    = [1.1, 0.9, 0.7, 0.5];
    const intMap    = [0.85, 0.95, 1.05, 0.65];
    const repsMap   = [2, 0, -2, 3];
    weeks.push({
      week: w,
      volumeMultiplier:    volMap[blockPos - 1],
      intensityMultiplier: intMap[blockPos - 1],
      repsAdjust:          repsMap[blockPos - 1],
      isDeload,
      label: `Semana ${w} – ${labels[blockPos - 1]}`,
    });
  }
  return weeks;
}

// ─────────────────────────────────────────────────────────
// ADAPTAVEL – conservative, designed for 40+ with joint preservation
// Starts easy, builds slowly, deloads every 3 weeks
// ─────────────────────────────────────────────────────────
function buildAdaptavel(durationWeeks: number): WeekProfile[] {
  const weeks: WeekProfile[] = [];
  for (let w = 1; w <= durationWeeks; w++) {
    const isDeload = w % 3 === 0;
    weeks.push({
      week: w,
      volumeMultiplier:    isDeload ? 0.6 : 1 + Math.floor((w - 1) / 3) * 0.07,
      intensityMultiplier: isDeload ? 0.75 : 1 + Math.floor((w - 1) / 3) * 0.03,
      repsAdjust:          isDeload ? 3 : 0,
      isDeload,
      label: isDeload ? `Semana ${w} – Recuperação Ativa` : `Semana ${w} – Progressão Gradual`,
    });
  }
  return weeks;
}

// ─────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────
export function buildScheme(
  tipo: PeriodizationType,
  objetivo: string,
  duracaoSemanas: number
): PeriodizationScheme {
  const descriptions: Record<PeriodizationType, string> = {
    linear: 'Progressão semanal constante com deload a cada 4 semanas.',
    ondulante: 'Alterna semanas de alto volume com semanas de alta intensidade.',
    block: 'Divide o programa em blocos: acumulação, intensificação, realização e deload.',
    adaptavel: 'Progressão gradual conservadora — ideal para 40+. Deload a cada 3 semanas.',
  };

  const builders: Record<PeriodizationType, (d: number) => WeekProfile[]> = {
    linear:    buildLinear,
    ondulante: buildOndulante,
    block:     buildBlock,
    adaptavel: buildAdaptavel,
  };

  return {
    id: `${tipo}_${objetivo}_${duracaoSemanas}w`,
    tipo,
    nome: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} – ${objetivo} – ${duracaoSemanas} semanas`,
    objetivo,
    duracaoSemanas,
    weeks: builders[tipo](duracaoSemanas),
    descricao: descriptions[tipo],
  };
}

/**
 * Select the best periodization type for a given profile.
 * Returns the scheme for week 1 by default (used during program generation).
 */
export function selectPeriodization(opts: {
  objetivo: string;
  nivel: string;
  idade?: number;
  duracaoSemanas?: number;
}): PeriodizationScheme {
  const { objetivo, nivel, idade = 45, duracaoSemanas = 8 } = opts;

  // 40+ users benefit from more conservative approach
  const isOlderUser = idade >= 45;

  let tipo: PeriodizationType;

  if (objetivo === 'reabilitacao') {
    tipo = 'adaptavel';
  } else if (nivel === 'iniciante' || isOlderUser) {
    tipo = 'linear';
  } else if (nivel === 'avancado' && (objetivo === 'forca' || objetivo === 'definicao')) {
    tipo = 'block';
  } else if (objetivo === 'hipertrofia' && nivel === 'intermediario') {
    tipo = 'ondulante';
  } else if (isOlderUser) {
    tipo = 'adaptavel';
  } else {
    tipo = 'linear';
  }

  return buildScheme(tipo, objetivo, duracaoSemanas);
}

/**
 * Get the week profile for a specific training week.
 * Returns week 1 if not found.
 */
export function getWeekProfile(scheme: PeriodizationScheme, weekNumber: number): WeekProfile {
  return scheme.weeks.find(w => w.week === weekNumber) || scheme.weeks[0];
}

/**
 * Apply a week profile to adjust sets/reps.
 */
export function applyWeekProfile(
  sets: number,
  reps: string,
  profile: WeekProfile
): { sets: number; reps: string } {
  const adjustedSets = Math.max(1, Math.round(sets * profile.volumeMultiplier));

  // Parse reps range like "8-12" or "10-15" or "30s"
  if (reps.includes('s') || reps.includes('min')) {
    // Time-based — don't adjust
    return { sets: adjustedSets, reps };
  }

  const parts = reps.split('-').map(Number);
  if (parts.length === 2) {
    const low = Math.max(1, parts[0] + profile.repsAdjust);
    const high = Math.max(low + 1, parts[1] + profile.repsAdjust);
    return { sets: adjustedSets, reps: `${low}-${high}` };
  }

  return { sets: adjustedSets, reps };
}
