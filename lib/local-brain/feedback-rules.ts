/**
 * Feedback rules engine — maps user feedback signals to program adjustments.
 */

import type { ProgramData, ProgramDay, Exercise } from '../responses';

export type FeedbackType =
  | 'muito_cansado'
  | 'muito_facil'
  | 'dor_ombro'
  | 'dor_joelho'
  | 'dor_lombar'
  | 'dor_punho'
  | 'dor_pescoco'
  | 'progresso_lento'
  | 'falta_tempo'
  | 'muito_pesado'
  | 'nao_consigo_dormir'
  | 'dor_geral'
  | 'entediado'
  | 'animado'
  | 'sem_equipamento';

export interface FeedbackRule {
  id: string;
  condicao: FeedbackType;
  descricao: string;
  // Adjustments to apply
  reducaoVolume?: number;     // percentage (0.2 = 20% fewer sets)
  aumentoVolume?: number;
  reducaoIntensidade?: number;
  aumentoIntensidade?: number;
  substituirRegiao?: string;  // injury region to substitute exercises for
  removerCardio?: boolean;
  adicionarDeload?: boolean;
  reducaoDias?: number;       // remove N days from program
  nota: string;               // human-readable tip shown to user
}

export const FEEDBACK_RULES: FeedbackRule[] = [
  // ─────────────────────────────────────────────────────────
  // FADIGA E RECUPERAÇÃO
  // ─────────────────────────────────────────────────────────
  {
    id: 'rule_cansado_001',
    condicao: 'muito_cansado',
    descricao: 'Usuário relata fadiga elevada',
    reducaoVolume: 0.20,
    nota: 'Reduzi o volume em 20%. Priorize o sono (7-9h) e a hidratação. Isso é normal após algumas semanas de treino intenso.',
  },
  {
    id: 'rule_cansado_002',
    condicao: 'nao_consigo_dormir',
    descricao: 'Usuário relata dificuldade de sono (possível over-training)',
    reducaoVolume: 0.30,
    adicionarDeload: true,
    nota: 'Sinal de supertreinamento. Reduzi o volume 30% e incluí deload. Durma cedo, evite telas 1h antes de dormir.',
  },
  {
    id: 'rule_cansado_003',
    condicao: 'dor_geral',
    descricao: 'Usuário relata dores generalizadas',
    reducaoVolume: 0.30,
    reducaoIntensidade: 0.20,
    adicionarDeload: true,
    nota: 'Dores generalizadas indicam necessidade de recuperação. Volume e intensidade reduzidos. Considere massagem ou crioterapia.',
  },

  // ─────────────────────────────────────────────────────────
  // MUITO FÁCIL / PROGRESSÃO
  // ─────────────────────────────────────────────────────────
  {
    id: 'rule_facil_001',
    condicao: 'muito_facil',
    descricao: 'Usuário relata treino muito fácil',
    aumentoIntensidade: 0.10,
    nota: 'Ótimo sinal de adaptação! Aumentei a intensidade em 10%. Tente adicionar 2,5-5kg nos exercícios principais.',
  },
  {
    id: 'rule_animado_001',
    condicao: 'animado',
    descricao: 'Usuário está se sentindo bem e com energia',
    aumentoVolume: 0.10,
    nota: 'Excelente! Adicionei um pouco mais de volume. Aproveite essa fase, mas sem exagerar.',
  },
  {
    id: 'rule_progresso_001',
    condicao: 'progresso_lento',
    descricao: 'Usuário relata progresso lento por 2+ semanas',
    aumentoVolume: 0.15,
    aumentoIntensidade: 0.05,
    nota: 'Mudei o estímulo aumentando volume e intensidade. Garanta proteína adequada (1,8-2g/kg) e considere variar os exercícios.',
  },
  {
    id: 'rule_entediado_001',
    condicao: 'entediado',
    descricao: 'Usuário está entediado com o programa',
    nota: 'Troquei alguns exercícios acessórios para renovar o estímulo. A variedade ajuda na adesão a longo prazo!',
  },

  // ─────────────────────────────────────────────────────────
  // LESÕES / DORES ESPECÍFICAS
  // ─────────────────────────────────────────────────────────
  {
    id: 'rule_ombro_001',
    condicao: 'dor_ombro',
    descricao: 'Usuário relata dor no ombro',
    substituirRegiao: 'ombro',
    nota: 'Substituí exercícios de ombro por variações seguras. Evite movimentos acima da cabeça até a dor cessar. Consulte um fisio se persistir.',
  },
  {
    id: 'rule_joelho_001',
    condicao: 'dor_joelho',
    descricao: 'Usuário relata dor no joelho',
    substituirRegiao: 'joelho',
    nota: 'Substituí agachamentos profundos por alternativas com menor impacto articular. Fortaleça o VMO e glúteo médio.',
  },
  {
    id: 'rule_lombar_001',
    condicao: 'dor_lombar',
    descricao: 'Usuário relata dor lombar',
    substituirRegiao: 'lombar',
    reducaoIntensidade: 0.20,
    nota: 'Substituí exercícios de alto shear lombar. Foque no core e hip thrust. Dor lombar persistente requer avaliação médica.',
  },
  {
    id: 'rule_punho_001',
    condicao: 'dor_punho',
    descricao: 'Usuário relata dor no punho',
    substituirRegiao: 'punho',
    nota: 'Adaptei os exercícios para menor stress no punho. Use munhequeiras se necessário.',
  },
  {
    id: 'rule_pescoco_001',
    condicao: 'dor_pescoco',
    descricao: 'Usuário relata dor no pescoço',
    substituirRegiao: 'ombro',
    reducaoIntensidade: 0.15,
    nota: 'Removi exercícios que sobrecarregam o pescoço. Trabalhe mobilidade cervical e foque em postura.',
  },

  // ─────────────────────────────────────────────────────────
  // LOGÍSTICA
  // ─────────────────────────────────────────────────────────
  {
    id: 'rule_tempo_001',
    condicao: 'falta_tempo',
    descricao: 'Usuário relata falta de tempo',
    reducaoDias: 1,
    reducaoVolume: 0.20,
    nota: 'Reduzi um dia de treino e o volume. Treinos mais curtos são melhores do que nenhum treino!',
  },
  {
    id: 'rule_equipamento_001',
    condicao: 'sem_equipamento',
    descricao: 'Usuário sem acesso a academia/equipamentos',
    nota: 'Adaptei o programa para peso corporal. Halteres leves fazem muita diferença — considere investir em um par.',
  },

  // ─────────────────────────────────────────────────────────
  // INTENSIDADE
  // ─────────────────────────────────────────────────────────
  {
    id: 'rule_pesado_001',
    condicao: 'muito_pesado',
    descricao: 'Usuário relata que a carga está muito pesada',
    reducaoIntensidade: 0.15,
    nota: 'Reduzi a intensidade em 15%. Técnica perfeita é mais importante do que o peso. Priorize a qualidade do movimento.',
  },
];

// ─────────────────────────────────────────────────────────
// Keyword detection
// ─────────────────────────────────────────────────────────

const FEEDBACK_KEYWORDS: Record<FeedbackType, string[]> = {
  muito_cansado:       ['cansado', 'exausto', 'esgotado', 'cansaço', 'fadiga', 'fatigado'],
  muito_facil:         ['fácil', 'facil', 'leve', 'tranquilo', 'suave'],
  dor_ombro:           ['ombro', 'ombros', 'manguito', 'rotador', 'deltóide'],
  dor_joelho:          ['joelho', 'joelhos', 'patela', 'menisco', 'ligamento'],
  dor_lombar:          ['lombar', 'coluna', 'costas', 'hérnia', 'hernia', 'dor nas costas'],
  dor_punho:           ['punho', 'punhos', 'pulso', 'carpo'],
  dor_pescoco:         ['pescoço', 'cervical', 'neck', 'pescoco'],
  progresso_lento:     ['parado', 'não evolui', 'nao evolui', 'estagnado', 'progresso', 'platô', 'plato'],
  falta_tempo:         ['tempo', 'corrido', 'ocupado', 'sem tempo', 'pouco tempo'],
  muito_pesado:        ['pesado', 'não consigo', 'nao consigo', 'difícil', 'dificil', 'não aguentei'],
  nao_consigo_dormir:  ['insônia', 'insonia', 'dormir', 'sono', 'não durmo'],
  dor_geral:           ['dor geral', 'doendo tudo', 'tudo dói', 'musculatura toda'],
  entediado:           ['entediado', 'chato', 'monótono', 'monotono', 'enjoado', 'cansei'],
  animado:             ['animado', 'empolgado', 'motivado', 'excelente', 'ótimo', 'incrível'],
  sem_equipamento:     ['sem academia', 'em casa', 'sem equipamento', 'viagem', 'hotel'],
};

/**
 * Detect feedback types from a free-text prompt.
 */
export function detectFeedback(prompt: string): FeedbackType[] {
  const lower = prompt.toLowerCase();
  const detected: FeedbackType[] = [];

  for (const [type, keywords] of Object.entries(FEEDBACK_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      detected.push(type as FeedbackType);
    }
  }

  return detected;
}

/**
 * Apply feedback rules to a program, returning adjusted program + messages.
 */
export function applyFeedbackRules(
  program: ProgramData,
  feedbackTypes: FeedbackType[]
): { program: ProgramData; messages: string[] } {
  if (feedbackTypes.length === 0) return { program, messages: [] };

  const messages: string[] = [];
  let adjustedProgram = structuredClone(program) as ProgramData;

  // Collect applicable rules
  const rules = FEEDBACK_RULES.filter(r => feedbackTypes.includes(r.condicao));
  if (rules.length === 0) return { program, messages: [] };

  for (const rule of rules) {
    messages.push(`💡 ${rule.nota}`);

    // Volume reduction
    if (rule.reducaoVolume) {
      adjustedProgram = reduceVolume(adjustedProgram, rule.reducaoVolume);
    }
    if (rule.aumentoVolume) {
      adjustedProgram = increaseVolume(adjustedProgram, rule.aumentoVolume);
    }

    // Intensity handled by reps range adjustments
    if (rule.reducaoIntensidade) {
      adjustedProgram = adjustReps(adjustedProgram, 2); // more reps = lighter weight
    }
    if (rule.aumentoIntensidade) {
      adjustedProgram = adjustReps(adjustedProgram, -2); // fewer reps = heavier weight
    }

    // Reduce days
    if (rule.reducaoDias && adjustedProgram.days.length > 2) {
      adjustedProgram = {
        ...adjustedProgram,
        days: adjustedProgram.days.slice(0, -rule.reducaoDias),
      };
    }
  }

  return { program: adjustedProgram, messages };
}

function reduceVolume(program: ProgramData, fraction: number): ProgramData {
  return {
    ...program,
    days: program.days.map(day => ({
      ...day,
      exercises: day.exercises.map(ex => ({
        ...ex,
        sets: Math.max(1, Math.round(ex.sets * (1 - fraction))),
      })),
    })),
  };
}

function increaseVolume(program: ProgramData, fraction: number): ProgramData {
  return {
    ...program,
    days: program.days.map(day => ({
      ...day,
      exercises: day.exercises.map(ex => ({
        ...ex,
        sets: Math.round(ex.sets * (1 + fraction)),
      })),
    })),
  };
}

function adjustReps(program: ProgramData, delta: number): ProgramData {
  return {
    ...program,
    days: program.days.map(day => ({
      ...day,
      exercises: day.exercises.map(ex => ({
        ...ex,
        reps: shiftRepsRange(ex.reps, delta),
      })),
    })),
  };
}

function shiftRepsRange(reps: string, delta: number): string {
  if (reps.includes('s') || reps.includes('min')) return reps;
  const parts = reps.split('-').map(Number);
  if (parts.length === 2) {
    const low  = Math.max(1, parts[0] + delta);
    const high = Math.max(low + 1, parts[1] + delta);
    return `${low}-${high}`;
  }
  const single = parseInt(reps);
  if (!isNaN(single)) return `${Math.max(1, single + delta)}`;
  return reps;
}
