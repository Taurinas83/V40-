/**
 * Program templates for the local brain.
 * Each template defines the structure of a training week for a given
 * objective × split × level × frequency combination.
 */

export type Objetivo =
  | 'hipertrofia'
  | 'emagrecimento'
  | 'forca'
  | 'resistencia'
  | 'reabilitacao'
  | 'definicao'
  | 'manutencao';

export type Split =
  | 'fullbody'
  | 'upper_lower'
  | 'ppl'
  | 'hiit'
  | 'especializado'
  | 'reabilitacao';

export type Nivel = 'iniciante' | 'intermediario' | 'avancado';

export interface DaySlot {
  label: string;      // e.g. "Dia 1 – Peito e Tríceps"
  focus: string;      // displayed focus for the UI
  // Exercise patterns: [categoria:padrao_motor, ...]
  // Each string maps to a filter query in the exercise DB
  slots: ExerciseSlot[];
  cardioMinutes?: number;
  cardioType?: 'leve' | 'moderado' | 'hiit';
}

export interface ExerciseSlot {
  categoria: string;
  padrao_motor: string;
  sets: number;
  reps: string;
  rest: number;  // seconds
  bfr?: boolean;
  optional?: boolean;
}

export interface ProgramTemplate {
  id: string;
  objetivo: Objetivo;
  nome: string;
  split: Split;
  nivel: Nivel;
  frequencia: number;   // days per week
  duracaoSemanas: number;
  volume: 'baixo' | 'moderado' | 'alto';
  intensidade: 'baixa' | 'moderada' | 'alta';
  periodizacao: 'linear' | 'ondulante' | 'block' | 'adaptavel';
  // Days in order (length = frequencia)
  dias: DaySlot[];
  notas?: string[];
  // Score bonuses for matching criteria
  scoreBonus?: {
    idadeAcima?: number;   // bonus if user age >= this
    genero?: 'M' | 'F';
    lesoes?: string[];     // bonus if user has these injuries (for rehab)
  };
}

// ─────────────────────────────────────────────────────────
// HIPERTROFIA TEMPLATES
// ─────────────────────────────────────────────────────────

const hipertrofiaFullbody3: ProgramTemplate = {
  id: 'hiper_fullbody_3_ini',
  objetivo: 'hipertrofia', split: 'fullbody', nivel: 'iniciante',
  frequencia: 3, duracaoSemanas: 8,
  volume: 'moderado', intensidade: 'moderada', periodizacao: 'linear',
  nome: 'Hipertrofia – Fullbody 3 dias (Iniciante)',
  dias: [
    {
      label: 'Dia A – Fullbody (Força)',
      focus: 'Força geral + base técnica',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 3, reps: '10-12', rest: 90 },
        { categoria: 'upper_body', padrao_motor: 'push',  sets: 3, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'pull',  sets: 3, reps: '10-12', rest: 75 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 3, reps: '10-12', rest: 90 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 3, reps: '30-45s', rest: 45 },
      ],
    },
    {
      label: 'Dia B – Fullbody (Volume)',
      focus: 'Volume e hipertrofia',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 4, reps: '12-15', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'push',  sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'pull',  sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 3, reps: '12-15', rest: 75 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 3, reps: '15-20', rest: 45 },
      ],
    },
    {
      label: 'Dia C – Fullbody (Intensidade)',
      focus: 'Intensidade e progressão',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 4, reps: '8-10', rest: 90 },
        { categoria: 'upper_body', padrao_motor: 'push',  sets: 4, reps: '8-10', rest: 90 },
        { categoria: 'upper_body', padrao_motor: 'pull',  sets: 4, reps: '8-10', rest: 90 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 2, reps: '30-45s', rest: 45 },
      ],
    },
  ],
  notas: ['Progrida ~2,5 kg a cada 2 semanas.', 'Descanse pelo menos 1 dia entre cada treino.'],
};

const hipertrofiaUpperLower4: ProgramTemplate = {
  id: 'hiper_upper_lower_4_int',
  objetivo: 'hipertrofia', split: 'upper_lower', nivel: 'intermediario',
  frequencia: 4, duracaoSemanas: 10,
  volume: 'alto', intensidade: 'moderada', periodizacao: 'linear',
  nome: 'Hipertrofia – Upper/Lower 4 dias (Intermediário)',
  dias: [
    {
      label: 'Dia 1 – Upper (Força)',
      focus: 'Peitoral, Costas – Força',
      slots: [
        { categoria: 'upper_body', padrao_motor: 'push', sets: 4, reps: '6-8',  rest: 120 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 4, reps: '6-8',  rest: 120 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 3, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 3, reps: '10-12', rest: 75 },
      ],
    },
    {
      label: 'Dia 2 – Lower (Força)',
      focus: 'Quadríceps, Posterior – Força',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 4, reps: '6-8',  rest: 120 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 4, reps: '6-8',  rest: 120 },
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 3, reps: '10-12', rest: 75 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 3, reps: '30-45s', rest: 45 },
      ],
    },
    {
      label: 'Dia 3 – Upper (Volume)',
      focus: 'Ombros, Bíceps, Tríceps – Volume',
      slots: [
        { categoria: 'upper_body', padrao_motor: 'push', sets: 4, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 4, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 3, reps: '12-15', rest: 60 },
      ],
    },
    {
      label: 'Dia 4 – Lower (Volume)',
      focus: 'Glúteos, Panturrilha – Volume',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 4, reps: '10-12', rest: 75 },
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 4, reps: '12-15', rest: 75 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 3, reps: '15-20', rest: 45 },
      ],
    },
  ],
  notas: ['Semanas 1-4: foco em técnica. Semanas 5-10: progrida na carga.'],
};

const hipertrofiaPPL5: ProgramTemplate = {
  id: 'hiper_ppl_5_int',
  objetivo: 'hipertrofia', split: 'ppl', nivel: 'intermediario',
  frequencia: 5, duracaoSemanas: 12,
  volume: 'alto', intensidade: 'alta', periodizacao: 'ondulante',
  nome: 'Hipertrofia – PPL 5 dias (Intermediário/Avançado)',
  dias: [
    {
      label: 'Dia 1 – Push (Peito + Ombros)',
      focus: 'Peitoral, Ombros, Tríceps',
      slots: [
        { categoria: 'upper_body', padrao_motor: 'push', sets: 4, reps: '8-10',  rest: 90 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 3, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 3, reps: '12-15', rest: 60 },
      ],
    },
    {
      label: 'Dia 2 – Pull (Costas + Bíceps)',
      focus: 'Costas, Bíceps',
      slots: [
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 4, reps: '6-8',  rest: 90 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 4, reps: '8-10', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 3, reps: '10-12', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 3, reps: '12-15', rest: 60 },
      ],
    },
    {
      label: 'Dia 3 – Legs (Quad + Posterior)',
      focus: 'Quadríceps, Glúteos, Posterior',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 4, reps: '8-10',  rest: 90 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 4, reps: '8-10',  rest: 90 },
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 3, reps: '12-15', rest: 75 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 3, reps: '30-45s', rest: 45 },
      ],
    },
    {
      label: 'Dia 4 – Push (Ombros + Tríceps)',
      focus: 'Ombros, Tríceps (Foco em volume)',
      slots: [
        { categoria: 'upper_body', padrao_motor: 'push', sets: 4, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 3, reps: '15-20', rest: 45 },
      ],
    },
    {
      label: 'Dia 5 – Pull (Costas + Bíceps Volume)',
      focus: 'Costas, Bíceps (Foco em volume)',
      slots: [
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 4, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'core',       padrao_motor: 'core', sets: 3, reps: '15-20', rest: 45 },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────
// EMAGRECIMENTO TEMPLATES
// ─────────────────────────────────────────────────────────

const emagFullbody3: ProgramTemplate = {
  id: 'emag_fullbody_3_ini',
  objetivo: 'emagrecimento', split: 'fullbody', nivel: 'iniciante',
  frequencia: 3, duracaoSemanas: 8,
  volume: 'moderado', intensidade: 'moderada', periodizacao: 'linear',
  nome: 'Emagrecimento – Fullbody 3 dias (Iniciante)',
  dias: [
    {
      label: 'Dia 1 – Fullbody + Cardio',
      focus: 'Força + Queima calórica',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'push',  sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'pull',  sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 2, reps: '30s', rest: 30 },
      ],
      cardioMinutes: 20, cardioType: 'moderado',
    },
    {
      label: 'Dia 2 – Circuito + Cardio',
      focus: 'Circuito de alta densidade calórica',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'push',  sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'cardio',     padrao_motor: 'cardio', sets: 3, reps: '30s', rest: 30 },
        { categoria: 'core',       padrao_motor: 'core',   sets: 2, reps: '20', rest: 30 },
      ],
      cardioMinutes: 25, cardioType: 'moderado',
    },
    {
      label: 'Dia 3 – Fullbody + Finalizador HIIT',
      focus: 'Força + HIIT finalizador',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 3, reps: '15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'pull',  sets: 3, reps: '12', rest: 60 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 3, reps: '12', rest: 60 },
        { categoria: 'cardio',     padrao_motor: 'cardio', sets: 4, reps: '30s', rest: 90 },
      ],
      cardioMinutes: 15, cardioType: 'hiit',
    },
  ],
  notas: ['Déficit calórico de 300-400 kcal/dia recomendado.', 'Proteína: 1,8-2g por kg de peso corporal.'],
};

const emagHIIT4: ProgramTemplate = {
  id: 'emag_hiit_4_int',
  objetivo: 'emagrecimento', split: 'hiit', nivel: 'intermediario',
  frequencia: 4, duracaoSemanas: 10,
  volume: 'moderado', intensidade: 'alta', periodizacao: 'ondulante',
  nome: 'Emagrecimento – Força + HIIT 4 dias (Intermediário)',
  dias: [
    {
      label: 'Dia 1 – Lower Força + Cardio',
      focus: 'Glúteos, Posterior – Força',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 4, reps: '10-12', rest: 75 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 4, reps: '10-12', rest: 75 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 3, reps: '30s', rest: 45 },
      ],
      cardioMinutes: 20, cardioType: 'moderado',
    },
    {
      label: 'Dia 2 – Upper Força + Cardio',
      focus: 'Peitoral, Costas – Força',
      slots: [
        { categoria: 'upper_body', padrao_motor: 'push', sets: 4, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 4, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 2, reps: '12-15', rest: 60 },
      ],
      cardioMinutes: 20, cardioType: 'moderado',
    },
    {
      label: 'Dia 3 – HIIT Puro',
      focus: 'Alta densidade calórica – HIIT',
      slots: [
        { categoria: 'cardio', padrao_motor: 'cardio', sets: 6, reps: '30s/90s', rest: 90 },
        { categoria: 'core',   padrao_motor: 'core',   sets: 3, reps: '20-30', rest: 45 },
      ],
      cardioMinutes: 30, cardioType: 'hiit',
    },
    {
      label: 'Dia 4 – Fullbody Circuito',
      focus: 'Circuito metabólico completo',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 3, reps: '15', rest: 45 },
        { categoria: 'upper_body', padrao_motor: 'push',  sets: 3, reps: '15', rest: 45 },
        { categoria: 'upper_body', padrao_motor: 'pull',  sets: 3, reps: '15', rest: 45 },
        { categoria: 'cardio',     padrao_motor: 'cardio', sets: 3, reps: '30s', rest: 30 },
      ],
      cardioMinutes: 15, cardioType: 'moderado',
    },
  ],
  notas: ['Priorize o sono 7-9h. Hidratação mínima 2,5L/dia.'],
};

const emagUpperLower5: ProgramTemplate = {
  id: 'emag_upper_lower_5_int',
  objetivo: 'emagrecimento', split: 'upper_lower', nivel: 'intermediario',
  frequencia: 5, duracaoSemanas: 12,
  volume: 'alto', intensidade: 'alta', periodizacao: 'ondulante',
  nome: 'Emagrecimento – Força + Cardio 5 dias (Intermediário)',
  dias: [
    {
      label: 'Dia 1 – Upper',
      focus: 'Peitoral, Costas, Ombros',
      slots: [
        { categoria: 'upper_body', padrao_motor: 'push', sets: 4, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 4, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 3, reps: '12-15', rest: 60 },
      ], cardioMinutes: 15, cardioType: 'moderado',
    },
    {
      label: 'Dia 2 – Lower',
      focus: 'Quadríceps, Glúteos, Posterior',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 4, reps: '10-12', rest: 75 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 4, reps: '10-12', rest: 75 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 3, reps: '30s', rest: 45 },
      ], cardioMinutes: 15, cardioType: 'moderado',
    },
    {
      label: 'Dia 3 – HIIT',
      focus: 'Cardio HIIT + Core',
      slots: [
        { categoria: 'cardio', padrao_motor: 'cardio', sets: 8, reps: '20s/40s', rest: 40 },
        { categoria: 'core',   padrao_motor: 'core',   sets: 4, reps: '20-25', rest: 30 },
      ], cardioMinutes: 20, cardioType: 'hiit',
    },
    {
      label: 'Dia 4 – Upper',
      focus: 'Bíceps, Tríceps, Ombros (volume)',
      slots: [
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 3, reps: '12-15', rest: 60 },
      ], cardioMinutes: 15, cardioType: 'leve',
    },
    {
      label: 'Dia 5 – Lower + Finalizador',
      focus: 'Glúteos, Posterior + Finalizador',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 4, reps: '12-15', rest: 75 },
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 3, reps: '15', rest: 60 },
        { categoria: 'cardio',     padrao_motor: 'cardio', sets: 4, reps: '30s', rest: 60 },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────
// FORÇA TEMPLATES
// ─────────────────────────────────────────────────────────

const forcaUpperLower4: ProgramTemplate = {
  id: 'forca_upper_lower_4_int',
  objetivo: 'forca', split: 'upper_lower', nivel: 'intermediario',
  frequencia: 4, duracaoSemanas: 12,
  volume: 'moderado', intensidade: 'alta', periodizacao: 'block',
  nome: 'Força – Upper/Lower 4 dias (Intermediário)',
  dias: [
    {
      label: 'Dia 1 – Upper Força Máxima',
      focus: 'Peitoral, Costas – Força Máxima',
      slots: [
        { categoria: 'upper_body', padrao_motor: 'push', sets: 5, reps: '4-6',  rest: 180 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 5, reps: '4-6',  rest: 180 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 3, reps: '8-10', rest: 90 },
      ],
    },
    {
      label: 'Dia 2 – Lower Força Máxima',
      focus: 'Quadríceps, Posterior – Força',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 5, reps: '4-6',  rest: 180 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 5, reps: '4-6',  rest: 180 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 3, reps: '30-45s', rest: 60 },
      ],
    },
    {
      label: 'Dia 3 – Upper Técnica e Acessórios',
      focus: 'Ombros, Bíceps, Tríceps',
      slots: [
        { categoria: 'upper_body', padrao_motor: 'push', sets: 4, reps: '8-10', rest: 90 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 4, reps: '8-10', rest: 90 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 3, reps: '10-12', rest: 75 },
      ],
    },
    {
      label: 'Dia 4 – Lower Acessórios',
      focus: 'Glúteos, Panturrilha, Core',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 4, reps: '8-10', rest: 90 },
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 3, reps: '10-12', rest: 75 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 3, reps: '15-20', rest: 45 },
      ],
    },
  ],
  notas: ['Semana 4 e 8: deload obrigatório (50% volume).', 'Progrida 2,5kg quando completar todas as reps.'],
};

// ─────────────────────────────────────────────────────────
// RESISTÊNCIA TEMPLATES
// ─────────────────────────────────────────────────────────

const resistenciaHIIT4: ProgramTemplate = {
  id: 'resist_hiit_4_int',
  objetivo: 'resistencia', split: 'hiit', nivel: 'intermediario',
  frequencia: 4, duracaoSemanas: 8,
  volume: 'alto', intensidade: 'alta', periodizacao: 'ondulante',
  nome: 'Resistência – HIIT + Força 4 dias (Intermediário)',
  dias: [
    {
      label: 'Dia 1 – HIIT Lower',
      focus: 'Alta intensidade – Pernas',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 4, reps: '15-20', rest: 45 },
        { categoria: 'cardio',     padrao_motor: 'cardio', sets: 5, reps: '30s', rest: 60 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 3, reps: '30s', rest: 30 },
      ],
      cardioMinutes: 10, cardioType: 'hiit',
    },
    {
      label: 'Dia 2 – HIIT Upper',
      focus: 'Alta intensidade – Superior',
      slots: [
        { categoria: 'upper_body', padrao_motor: 'push', sets: 4, reps: '15-20', rest: 45 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 4, reps: '15-20', rest: 45 },
        { categoria: 'cardio',     padrao_motor: 'cardio', sets: 4, reps: '30s', rest: 60 },
      ],
      cardioMinutes: 15, cardioType: 'hiit',
    },
    {
      label: 'Dia 3 – Cardio Longo',
      focus: 'Resistência cardiovascular',
      slots: [
        { categoria: 'cardio', padrao_motor: 'cardio', sets: 1, reps: '30-40min', rest: 0 },
        { categoria: 'core',   padrao_motor: 'core',   sets: 3, reps: '20', rest: 30 },
      ],
      cardioMinutes: 40, cardioType: 'moderado',
    },
    {
      label: 'Dia 4 – Fullbody Circuito',
      focus: 'Circuito completo',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 3, reps: '15', rest: 30 },
        { categoria: 'upper_body', padrao_motor: 'push',  sets: 3, reps: '15', rest: 30 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 3, reps: '15', rest: 30 },
        { categoria: 'upper_body', padrao_motor: 'pull',  sets: 3, reps: '15', rest: 30 },
        { categoria: 'cardio',     padrao_motor: 'cardio', sets: 3, reps: '30s', rest: 30 },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────
// REABILITAÇÃO TEMPLATES
// ─────────────────────────────────────────────────────────

const reabilitacao3: ProgramTemplate = {
  id: 'reab_fullbody_3_ini',
  objetivo: 'reabilitacao', split: 'reabilitacao', nivel: 'iniciante',
  frequencia: 3, duracaoSemanas: 6,
  volume: 'baixo', intensidade: 'baixa', periodizacao: 'linear',
  nome: 'Reabilitação – 3 dias (Lesões leves)',
  dias: [
    {
      label: 'Dia 1 – Mobilidade + Ativação',
      focus: 'Mobilidade articular e ativação muscular',
      slots: [
        { categoria: 'mobility', padrao_motor: 'core', sets: 2, reps: '10-12', rest: 30 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 2, reps: '12-15', rest: 60 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 2, reps: '20-30s', rest: 30 },
      ],
      cardioMinutes: 15, cardioType: 'leve',
    },
    {
      label: 'Dia 2 – Fortalecimento Funcional',
      focus: 'Fortalecimento de padrões fundamentais',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 2, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'pull',  sets: 2, reps: '12-15', rest: 60 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 3, reps: '20-30s', rest: 45 },
      ],
      cardioMinutes: 15, cardioType: 'leve',
    },
    {
      label: 'Dia 3 – Recuperação Ativa',
      focus: 'Cardio leve e mobilidade',
      slots: [
        { categoria: 'mobility', padrao_motor: 'core', sets: 2, reps: '10', rest: 30 },
        { categoria: 'cardio',   padrao_motor: 'cardio', sets: 1, reps: '20-30min', rest: 0 },
        { categoria: 'core',     padrao_motor: 'core', sets: 2, reps: '20-30s', rest: 30 },
      ],
      cardioMinutes: 25, cardioType: 'leve',
    },
  ],
  notas: [
    'Não treine com dor. Se doer, pare imediatamente.',
    'Consulte um fisioterapeuta para lesões moderadas ou graves.',
    'Aumente a carga apenas quando 0 dor for relatada por 2 sessões consecutivas.',
  ],
  scoreBonus: { lesoes: ['ombro', 'joelho', 'lombar', 'punho'] },
};

// ─────────────────────────────────────────────────────────
// DEFINIÇÃO / MANUTENÇÃO
// ─────────────────────────────────────────────────────────

const definicaoUpperLower4: ProgramTemplate = {
  id: 'defin_upper_lower_4_ava',
  objetivo: 'definicao', split: 'upper_lower', nivel: 'avancado',
  frequencia: 4, duracaoSemanas: 12,
  volume: 'moderado', intensidade: 'alta', periodizacao: 'ondulante',
  nome: 'Definição – Upper/Lower 4 dias (Avançado)',
  dias: [
    {
      label: 'Dia 1 – Upper Intensidade',
      focus: 'Peitoral, Costas – Intensidade',
      slots: [
        { categoria: 'upper_body', padrao_motor: 'push', sets: 4, reps: '8-10',  rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 4, reps: '8-10',  rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 3, reps: '12-15', rest: 60 },
      ], cardioMinutes: 20, cardioType: 'moderado',
    },
    {
      label: 'Dia 2 – Lower Intensidade',
      focus: 'Quadríceps, Glúteos – Intensidade',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 4, reps: '8-10',  rest: 75 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 4, reps: '8-10',  rest: 75 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 3, reps: '30s', rest: 45 },
      ], cardioMinutes: 20, cardioType: 'moderado',
    },
    {
      label: 'Dia 3 – Upper Volume',
      focus: 'Ombros, Bíceps, Tríceps – Volume',
      slots: [
        { categoria: 'upper_body', padrao_motor: 'push', sets: 4, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 4, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 3, reps: '15-20', rest: 45 },
      ], cardioMinutes: 25, cardioType: 'hiit',
    },
    {
      label: 'Dia 4 – Lower Volume',
      focus: 'Posterior, Glúteos – Volume',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 4, reps: '12-15', rest: 60 },
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 3, reps: '15-20', rest: 60 },
        { categoria: 'cardio',     padrao_motor: 'cardio', sets: 4, reps: '30s', rest: 60 },
      ],
    },
  ],
};

const manutencaoFullbody3: ProgramTemplate = {
  id: 'manut_fullbody_3_ini',
  objetivo: 'manutencao', split: 'fullbody', nivel: 'iniciante',
  frequencia: 3, duracaoSemanas: 8,
  volume: 'moderado', intensidade: 'moderada', periodizacao: 'adaptavel',
  nome: 'Manutenção – Fullbody 3 dias',
  dias: [
    {
      label: 'Dia 1 – Fullbody Geral',
      focus: 'Manutenção geral de massa e saúde',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 3, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'push',  sets: 3, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'pull',  sets: 3, reps: '10-12', rest: 75 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 2, reps: '30s', rest: 45 },
      ], cardioMinutes: 20, cardioType: 'leve',
    },
    {
      label: 'Dia 2 – Fullbody Geral',
      focus: 'Manutenção + ativação completa',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 3, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'push',  sets: 3, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'pull',  sets: 3, reps: '10-12', rest: 75 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 2, reps: '20', rest: 45 },
      ], cardioMinutes: 20, cardioType: 'leve',
    },
    {
      label: 'Dia 3 – Fullbody + Cardio',
      focus: 'Saúde cardiovascular',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 2, reps: '12-15', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'push',  sets: 2, reps: '12-15', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'pull',  sets: 2, reps: '12-15', rest: 75 },
        { categoria: 'cardio',     padrao_motor: 'cardio', sets: 1, reps: '20-30min', rest: 0 },
      ], cardioMinutes: 25, cardioType: 'leve',
    },
  ],
};

// Minimal 2-day template for very limited schedules
const hipertrofiaFullbody2: ProgramTemplate = {
  id: 'hiper_fullbody_2_ini',
  objetivo: 'hipertrofia', split: 'fullbody', nivel: 'iniciante',
  frequencia: 2, duracaoSemanas: 8,
  volume: 'baixo', intensidade: 'moderada', periodizacao: 'linear',
  nome: 'Hipertrofia – Fullbody 2 dias (Iniciante/Tempo limitado)',
  dias: [
    {
      label: 'Dia A – Fullbody Completo',
      focus: 'Corpo todo: padrões fundamentais',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 3, reps: '10-12', rest: 90 },
        { categoria: 'upper_body', padrao_motor: 'push',  sets: 3, reps: '10-12', rest: 90 },
        { categoria: 'upper_body', padrao_motor: 'pull',  sets: 3, reps: '10-12', rest: 90 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 3, reps: '10-12', rest: 90 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 2, reps: '30s', rest: 45 },
      ],
    },
    {
      label: 'Dia B – Fullbody Completo',
      focus: 'Corpo todo: volume e acessórios',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 3, reps: '12-15', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'push',  sets: 3, reps: '12-15', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'pull',  sets: 3, reps: '12-15', rest: 75 },
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 3, reps: '12-15', rest: 75 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 2, reps: '20', rest: 45 },
      ],
    },
  ],
};

// 6-day PPL for advanced users
const hipertrofiaPPL6: ProgramTemplate = {
  id: 'hiper_ppl_6_ava',
  objetivo: 'hipertrofia', split: 'ppl', nivel: 'avancado',
  frequencia: 6, duracaoSemanas: 12,
  volume: 'alto', intensidade: 'alta', periodizacao: 'ondulante',
  nome: 'Hipertrofia – PPL 6 dias (Avançado)',
  dias: [
    {
      label: 'Dia 1 – Push A',
      focus: 'Peitoral + Ombros + Tríceps (Força)',
      slots: [
        { categoria: 'upper_body', padrao_motor: 'push', sets: 4, reps: '6-8',  rest: 120 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 4, reps: '8-10', rest: 90 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 3, reps: '10-12', rest: 75 },
      ],
    },
    {
      label: 'Dia 2 – Pull A',
      focus: 'Costas + Bíceps (Força)',
      slots: [
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 4, reps: '6-8',  rest: 120 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 4, reps: '8-10', rest: 90 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 3, reps: '10-12', rest: 75 },
      ],
    },
    {
      label: 'Dia 3 – Legs A',
      focus: 'Quadríceps, Glúteos, Core (Força)',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 5, reps: '6-8', rest: 120 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 4, reps: '6-8', rest: 120 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 3, reps: '30s', rest: 60 },
      ],
    },
    {
      label: 'Dia 4 – Push B',
      focus: 'Ombros + Tríceps (Volume)',
      slots: [
        { categoria: 'upper_body', padrao_motor: 'push', sets: 4, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 4, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 3, reps: '15-20', rest: 45 },
      ],
    },
    {
      label: 'Dia 5 – Pull B',
      focus: 'Costas + Bíceps (Volume)',
      slots: [
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 4, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 4, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 3, reps: '12-15', rest: 60 },
      ],
    },
    {
      label: 'Dia 6 – Legs B',
      focus: 'Posterior, Panturrilha (Volume)',
      slots: [
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 4, reps: '10-12', rest: 75 },
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'core',       padrao_motor: 'core',  sets: 3, reps: '20', rest: 45 },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────────────────────

export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  // Hipertrofia
  hipertrofiaFullbody2,
  hipertrofiaFullbody3,
  hipertrofiaUpperLower4,
  hipertrofiaPPL5,
  hipertrofiaPPL6,
  // Emagrecimento
  emagFullbody3,
  emagHIIT4,
  emagUpperLower5,
  // Força
  forcaUpperLower4,
  // Resistência
  resistenciaHIIT4,
  // Reabilitação
  reabilitacao3,
  // Definição
  definicaoUpperLower4,
  // Manutenção
  manutencaoFullbody3,
];

/**
 * Score a template against a user profile. Higher = better match.
 */
export function scoreTemplate(
  template: ProgramTemplate,
  opts: {
    objetivo: string;
    nivel: string;
    frequencia: number;
    lesoes?: string[];
    idade?: number;
  }
): number {
  let score = 0;

  // Objective match is most important
  if (template.objetivo === opts.objetivo) score += 100;
  else if (opts.objetivo === 'manutencao' && template.objetivo === 'hipertrofia') score += 30;

  // Level match
  const levelOrder = ['iniciante', 'intermediario', 'avancado'];
  const tLevel = levelOrder.indexOf(template.nivel);
  const uLevel = levelOrder.indexOf(opts.nivel);
  if (tLevel === uLevel) score += 50;
  else if (Math.abs(tLevel - uLevel) === 1) score += 25;

  // Frequency match – prefer exact, then nearest
  const freqDiff = Math.abs(template.frequencia - opts.frequencia);
  if (freqDiff === 0) score += 40;
  else if (freqDiff === 1) score += 20;
  else if (freqDiff === 2) score += 5;

  // Injury preference – rehab template gets bonus when user has injuries
  if (opts.lesoes && opts.lesoes.length > 0 && template.objetivo === 'reabilitacao') {
    score += 30;
  }
  if (template.scoreBonus?.lesoes) {
    const overlap = template.scoreBonus.lesoes.filter(l => (opts.lesoes || []).includes(l));
    score += overlap.length * 15;
  }

  return score;
}

/**
 * Find the best matching template for a user profile.
 */
export function findBestTemplate(opts: {
  objetivo: string;
  nivel: string;
  frequencia: number;
  lesoes?: string[];
  idade?: number;
}): ProgramTemplate {
  let best = PROGRAM_TEMPLATES[0];
  let bestScore = -1;

  for (const t of PROGRAM_TEMPLATES) {
    const s = scoreTemplate(t, opts);
    if (s > bestScore) {
      bestScore = s;
      best = t;
    }
  }

  return best;
}
