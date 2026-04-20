import type { Plugin, Connect } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

// ──────────────────────────────────────────────────────────
// EXERCISE DATABASE - Completo para o plugin de desenvolvimento
// ──────────────────────────────────────────────────────────

interface ExerciseV2 {
  id: string;
  n: string;
  muscles: string;
  categoria: string;
  padrao_motor: string;
  equipamento: string[];
  nivel: string;
  desc: string[];
  mistakes: string[];
  sets_default: number;
  reps_default: string;
  rest_seconds: number;
  bfr: boolean;
  contraindicado_para: string[];
}

const EXERCISE_DB: Record<string, ExerciseV2> = {
  supino_reto_halteres: {
    id: 'supino_reto_halteres', n: 'Supino Reto com Halteres', muscles: 'Peitoral, Tríceps, Deltoide Anterior',
    categoria: 'upper_body', padrao_motor: 'push', equipamento: ['halter', 'banco'], nivel: 'intermediario',
    desc: ['Escápulas esmagadas contra o banco.', 'Ângulo de ~75° entre cotovelo e tronco.'],
    mistakes: ['Ombros protraídos (redondos)'], sets_default: 4, reps_default: '8-12', rest_seconds: 90, bfr: false,
    contraindicado_para: ['ombro'],
  },
  supino_inclinado_halteres: {
    id: 'supino_inclinado_halteres', n: 'Supino Inclinado 30°', muscles: 'Porção Clavicular do Peitoral',
    categoria: 'upper_body', padrao_motor: 'push', equipamento: ['halter', 'banco'], nivel: 'intermediario',
    desc: ['Banco a 30°, não 45°.'], mistakes: ['Banco muito inclinado (>45°)'],
    sets_default: 3, reps_default: '10-12', rest_seconds: 75, bfr: false, contraindicado_para: ['ombro'],
  },
  desenvolvimento_halteres: {
    id: 'desenvolvimento_halteres', n: 'Desenvolvimento de Ombros', muscles: 'Deltoide Anterior e Lateral',
    categoria: 'upper_body', padrao_motor: 'push', equipamento: ['halter', 'banco'], nivel: 'intermediario',
    desc: ['Banco a 75-80°.'], mistakes: ['Cotovelos alinhados com as costas'],
    sets_default: 3, reps_default: '10-12', rest_seconds: 75, bfr: false, contraindicado_para: ['ombro'],
  },
  elevacao_lateral: {
    id: 'elevacao_lateral', n: 'Elevação Lateral com Halteres', muscles: 'Deltoide Lateral',
    categoria: 'upper_body', padrao_motor: 'push', equipamento: ['halter'], nivel: 'iniciante',
    desc: ['Movimento no plano escapular.'], mistakes: ['Subir os ombros junto'],
    sets_default: 3, reps_default: '12-15', rest_seconds: 60, bfr: false, contraindicado_para: ['ombro'],
  },
  triceps_corda: {
    id: 'triceps_corda', n: 'Tríceps Pulley com Corda', muscles: 'Tríceps',
    categoria: 'upper_body', padrao_motor: 'push', equipamento: ['cabo'], nivel: 'iniciante',
    desc: ['Abra a corda na parte mais baixa.'], mistakes: ['Mover o cotovelo para frente'],
    sets_default: 3, reps_default: '12-15', rest_seconds: 60, bfr: false, contraindicado_para: ['cotovelo'],
  },
  flexao_diamante: {
    id: 'flexao_diamante', n: 'Flexão Diamante', muscles: 'Tríceps, Peitoral Interno',
    categoria: 'upper_body', padrao_motor: 'push', equipamento: ['peso_corporal'], nivel: 'iniciante',
    desc: ['Mãos formando diamante.'], mistakes: ['Quadril afundando'],
    sets_default: 3, reps_default: '10-15', rest_seconds: 60, bfr: false, contraindicado_para: ['punho'],
  },
  puxada_frente: {
    id: 'puxada_frente', n: 'Puxada Frontal Aberta', muscles: 'Dorsal (Lats), Bíceps',
    categoria: 'upper_body', padrao_motor: 'pull', equipamento: ['barra_fixa', 'polia'], nivel: 'intermediario',
    desc: ['Pense em puxar com os cotovelos.'], mistakes: ['Balanço excessivo de tronco'],
    sets_default: 4, reps_default: '8-12', rest_seconds: 90, bfr: false, contraindicado_para: ['ombro'],
  },
  remada_curvada: {
    id: 'remada_curvada', n: 'Remada Curvada com Halter', muscles: 'Dorsal, Rombóides, Core',
    categoria: 'upper_body', padrao_motor: 'pull', equipamento: ['halter'], nivel: 'intermediario',
    desc: ['Coluna neutra e core ativo.'], mistakes: ['Lombar arredondada'],
    sets_default: 4, reps_default: '8-12', rest_seconds: 90, bfr: false, contraindicado_para: ['lombar'],
  },
  remada_maquina: {
    id: 'remada_maquina', n: 'Remada na Máquina', muscles: 'Dorsal, Rombóides, Bíceps',
    categoria: 'upper_body', padrao_motor: 'pull', equipamento: ['maquina'], nivel: 'iniciante',
    desc: ['Peito apoiado no suporte.'], mistakes: ['Inclinar o tronco para trás'],
    sets_default: 3, reps_default: '12-15', rest_seconds: 60, bfr: false, contraindicado_para: [],
  },
  rosca_direta: {
    id: 'rosca_direta', n: 'Rosca Direta', muscles: 'Bíceps',
    categoria: 'upper_body', padrao_motor: 'pull', equipamento: ['halter', 'barra'], nivel: 'iniciante',
    desc: ['Cotovelos fixos nas laterais.'], mistakes: ['Momentum com a lombar'],
    sets_default: 3, reps_default: '10-12', rest_seconds: 60, bfr: false, contraindicado_para: ['cotovelo'],
  },
  rosca_martelo: {
    id: 'rosca_martelo', n: 'Rosca Martelo', muscles: 'Bíceps, Antebraço',
    categoria: 'upper_body', padrao_motor: 'pull', equipamento: ['halter'], nivel: 'iniciante',
    desc: ['Pegada neutra.'], mistakes: ['Inclinar o tronco'],
    sets_default: 3, reps_default: '10-12', rest_seconds: 60, bfr: false, contraindicado_para: [],
  },
  agachamento_livre: {
    id: 'agachamento_livre', n: 'Agachamento Livre', muscles: 'Quadríceps, Glúteos, Core',
    categoria: 'lower_body', padrao_motor: 'squat', equipamento: ['peso_corporal', 'halter'], nivel: 'iniciante',
    desc: ['Pressão nos calcanhares.'], mistakes: ['Valgo dinâmico (joelho pra dentro)'],
    sets_default: 3, reps_default: '12-15', rest_seconds: 75, bfr: false, contraindicado_para: [],
  },
  agachamento_bulgaro: {
    id: 'agachamento_bulgaro', n: 'Agachamento Búlgaro', muscles: 'Glúteos, Quadríceps',
    categoria: 'lower_body', padrao_motor: 'squat', equipamento: ['halter', 'banco'], nivel: 'intermediario',
    desc: ['Peito levemente à frente.'], mistakes: ['Passo curto demais'],
    sets_default: 3, reps_default: '10-12', rest_seconds: 75, bfr: false, contraindicado_para: ['joelho'],
  },
  leg_press: {
    id: 'leg_press', n: 'Leg Press 45°', muscles: 'Quadríceps, Glúteos',
    categoria: 'lower_body', padrao_motor: 'squat', equipamento: ['maquina'], nivel: 'iniciante',
    desc: ['Nunca estenda totalmente os joelhos.'], mistakes: ['Lombar descolar'],
    sets_default: 4, reps_default: '10-15', rest_seconds: 90, bfr: false, contraindicado_para: [],
  },
  cadeira_extensora: {
    id: 'cadeira_extensora', n: 'Cadeira Extensora', muscles: 'Quadríceps',
    categoria: 'lower_body', padrao_motor: 'squat', equipamento: ['maquina'], nivel: 'iniciante',
    desc: ['Agarre o banco firmemente.'], mistakes: ['Deixar o peso cair'],
    sets_default: 3, reps_default: '12-15', rest_seconds: 60, bfr: false, contraindicado_para: ['joelho'],
  },
  terra_romeno: {
    id: 'terra_romeno', n: 'Terra Romeno (RDL)', muscles: 'Posterior de Coxa, Glúteos',
    categoria: 'lower_body', padrao_motor: 'hinge', equipamento: ['halter', 'barra'], nivel: 'intermediario',
    desc: ['Movimento de quadril.'], mistakes: ['Dobrar os joelhos demais'],
    sets_default: 4, reps_default: '8-12', rest_seconds: 90, bfr: false, contraindicado_para: ['lombar'],
  },
  hip_thrust: {
    id: 'hip_thrust', n: 'Hip Thrust', muscles: 'Glúteo Máximo, Isquiotibiais',
    categoria: 'lower_body', padrao_motor: 'hinge', equipamento: ['halter', 'barra', 'banco'], nivel: 'iniciante',
    desc: ['Contraia o glúteo no topo.'], mistakes: ['Hiperlordose lombar'],
    sets_default: 4, reps_default: '10-15', rest_seconds: 75, bfr: false, contraindicado_para: [],
  },
  mesa_flexora: {
    id: 'mesa_flexora', n: 'Mesa Flexora', muscles: 'Isquiotibiais',
    categoria: 'lower_body', padrao_motor: 'hinge', equipamento: ['maquina'], nivel: 'iniciante',
    desc: ['Aperte os glúteos antes.'], mistakes: ['Subir a pelve'],
    sets_default: 3, reps_default: '10-15', rest_seconds: 60, bfr: false, contraindicado_para: [],
  },
  prancha_abdominal: {
    id: 'prancha_abdominal', n: 'Prancha Abdominal', muscles: 'Core Sistêmico',
    categoria: 'core', padrao_motor: 'core', equipamento: ['peso_corporal'], nivel: 'iniciante',
    desc: ['Contraia ativamente os glúteos.'], mistakes: ['Quadril afundando'],
    sets_default: 3, reps_default: '30-60s', rest_seconds: 45, bfr: false, contraindicado_para: [],
  },
  abdominal_bicicleta: {
    id: 'abdominal_bicicleta', n: 'Abdominal Bicicleta', muscles: 'Reto Abdominal, Oblíquos',
    categoria: 'core', padrao_motor: 'core', equipamento: ['peso_corporal'], nivel: 'iniciante',
    desc: ['Rotação verdadeira do tronco.'], mistakes: ['Puxar o pescoço'],
    sets_default: 3, reps_default: '15-20', rest_seconds: 45, bfr: false, contraindicado_para: ['lombar'],
  },
  panturrilha_em_pe: {
    id: 'panturrilha_em_pe', n: 'Elevação de Panturrilha', muscles: 'Gastrocnêmio',
    categoria: 'lower_body', padrao_motor: 'carry', equipamento: ['peso_corporal', 'maquina'], nivel: 'iniciante',
    desc: ['Segure a contração por 1-2s.'], mistakes: ['Ritmo saltitante'],
    sets_default: 4, reps_default: '15-20', rest_seconds: 45, bfr: false, contraindicado_para: [],
  },
  burpees: {
    id: 'burpees', n: 'Burpees', muscles: 'Corpo inteiro',
    categoria: 'cardio', padrao_motor: 'cardio', equipamento: ['peso_corporal'], nivel: 'intermediario',
    desc: ['Postura firme.'], mistakes: ['Lombar afundando'],
    sets_default: 3, reps_default: '10-15', rest_seconds: 60, bfr: false, contraindicado_para: ['joelho', 'ombro', 'lombar'],
  },
  mountain_climber: {
    id: 'mountain_climber', n: 'Mountain Climber', muscles: 'Core, Ombros',
    categoria: 'cardio', padrao_motor: 'cardio', equipamento: ['peso_corporal'], nivel: 'iniciante',
    desc: ['Posição de prancha alta.'], mistakes: ['Quadril alto demais'],
    sets_default: 3, reps_default: '30-45s', rest_seconds: 45, bfr: false, contraindicado_para: ['ombro'],
  },
};

// ──────────────────────────────────────────────────────────
// PROGRAM TEMPLATES
// ──────────────────────────────────────────────────────────

interface DaySlot {
  label: string;
  focus: string;
  slots: Array<{ categoria: string; padrao_motor: string; sets: number; reps: string; rest: number; bfr?: boolean }>;
}

interface ProgramTemplate {
  id: string;
  objetivo: string;
  nome: string;
  split: string;
  nivel: string;
  frequencia: number;
  duracaoSemanas: number;
  dias: DaySlot[];
  notas: string[];
}

const TEMPLATES: ProgramTemplate[] = [
  {
    id: 'hiper_fullbody_3', objetivo: 'hipertrofia', split: 'fullbody', nivel: 'iniciante',
    frequencia: 3, duracaoSemanas: 8, nome: 'Hipertrofia – Fullbody 3 dias',
    dias: [
      { label: 'Dia A – Fullbody (Força)', focus: 'Força geral', slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 3, reps: '10-12', rest: 90 },
        { categoria: 'upper_body', padrao_motor: 'push',  sets: 3, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'pull',  sets: 3, reps: '10-12', rest: 75 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 3, reps: '10-12', rest: 90 },
        { categoria: 'core', padrao_motor: 'core', sets: 3, reps: '30-45s', rest: 45 },
      ]},
      { label: 'Dia B – Fullbody (Volume)', focus: 'Volume', slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 4, reps: '12-15', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'push',  sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'pull',  sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 3, reps: '12-15', rest: 75 },
        { categoria: 'core', padrao_motor: 'core', sets: 3, reps: '15-20', rest: 45 },
      ]},
      { label: 'Dia C – Fullbody (Intensidade)', focus: 'Intensidade', slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 4, reps: '8-10', rest: 90 },
        { categoria: 'upper_body', padrao_motor: 'push',  sets: 4, reps: '8-10', rest: 90 },
        { categoria: 'upper_body', padrao_motor: 'pull',  sets: 4, reps: '8-10', rest: 90 },
        { categoria: 'core', padrao_motor: 'core', sets: 2, reps: '30-45s', rest: 45 },
      ]},
    ],
    notas: ['Progrida ~2,5 kg a cada 2 semanas.', 'Descanse pelo menos 1 dia entre cada treino.'],
  },
  {
    id: 'hiper_upper_lower_4', objetivo: 'hipertrofia', split: 'upper_lower', nivel: 'intermediario',
    frequencia: 4, duracaoSemanas: 10, nome: 'Hipertrofia – Upper/Lower 4 dias',
    dias: [
      { label: 'Dia 1 – Upper (Força)', focus: 'Peitoral, Costas', slots: [
        { categoria: 'upper_body', padrao_motor: 'push', sets: 4, reps: '6-8', rest: 120 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 4, reps: '6-8', rest: 120 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 3, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 3, reps: '10-12', rest: 75 },
      ]},
      { label: 'Dia 2 – Lower (Força)', focus: 'Quadríceps, Posterior', slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 4, reps: '6-8', rest: 120 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 4, reps: '6-8', rest: 120 },
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 3, reps: '10-12', rest: 75 },
        { categoria: 'core', padrao_motor: 'core', sets: 3, reps: '30-45s', rest: 45 },
      ]},
      { label: 'Dia 3 – Upper (Volume)', focus: 'Ombros, Bíceps, Tríceps', slots: [
        { categoria: 'upper_body', padrao_motor: 'push', sets: 4, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 4, reps: '10-12', rest: 75 },
        { categoria: 'upper_body', padrao_motor: 'push', sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'pull', sets: 3, reps: '12-15', rest: 60 },
      ]},
      { label: 'Dia 4 – Lower (Volume)', focus: 'Glúteos, Panturrilha', slots: [
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 4, reps: '10-12', rest: 75 },
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 4, reps: '12-15', rest: 75 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'core', padrao_motor: 'core', sets: 3, reps: '15-20', rest: 45 },
      ]},
    ],
    notas: ['Semanas 1-4: foco em técnica. Semanas 5-10: progrida na carga.'],
  },
  {
    id: 'emag_fullbody_3', objetivo: 'emagrecimento', split: 'fullbody', nivel: 'iniciante',
    frequencia: 3, duracaoSemanas: 8, nome: 'Emagrecimento – Fullbody 3 dias',
    dias: [
      { label: 'Dia 1 – Fullbody + Cardio', focus: 'Força + Queima', slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'push',  sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'pull',  sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'core', padrao_motor: 'core', sets: 2, reps: '30s', rest: 30 },
      ]},
      { label: 'Dia 2 – Circuito', focus: 'Alta densidade', slots: [
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'push',  sets: 3, reps: '12-15', rest: 60 },
        { categoria: 'cardio', padrao_motor: 'cardio', sets: 3, reps: '30s', rest: 30 },
        { categoria: 'core', padrao_motor: 'core', sets: 2, reps: '20', rest: 30 },
      ]},
      { label: 'Dia 3 – HIIT Finalizador', focus: 'Força + HIIT', slots: [
        { categoria: 'lower_body', padrao_motor: 'squat', sets: 3, reps: '15', rest: 60 },
        { categoria: 'upper_body', padrao_motor: 'pull',  sets: 3, reps: '12', rest: 60 },
        { categoria: 'lower_body', padrao_motor: 'hinge', sets: 3, reps: '12', rest: 60 },
        { categoria: 'cardio', padrao_motor: 'cardio', sets: 4, reps: '30s', rest: 90 },
      ]},
    ],
    notas: ['Déficit calórico de 300-400 kcal/dia recomendado.', 'Proteína: 1,8-2g por kg.'],
  },
];

// ──────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ──────────────────────────────────────────────────────────

function filterExercises(categoria: string, padrao_motor: string, nivel: string, lesoes: string[]): ExerciseV2[] {
  return Object.values(EXERCISE_DB).filter(ex => {
    if (ex.categoria !== categoria) return false;
    if (ex.padrao_motor !== padrao_motor) return false;
    const levels = ['iniciante', 'intermediario', 'avancado'];
    if (levels.indexOf(ex.nivel) > levels.indexOf(nivel)) return false;
    if (ex.contraindicado_para.some(region => lesoes.includes(region))) return false;
    return true;
  });
}

function pickExercise(categoria: string, padrao_motor: string, usedIds: Set<string>, nivel: string, lesoes: string[]): ExerciseV2 | null {
  let candidates = filterExercises(categoria, padrao_motor, nivel, lesoes).filter(ex => !usedIds.has(ex.id));
  if (candidates.length === 0) {
    candidates = Object.values(EXERCISE_DB).filter(ex => 
      ex.categoria === categoria && ex.padrao_motor === padrao_motor && !usedIds.has(ex.id)
    );
  }
  return candidates[0] || null;
}

function findBestTemplate(objetivo: string, nivel: string, frequencia: number): ProgramTemplate {
  let best = TEMPLATES[0];
  let bestScore = -1;
  for (const t of TEMPLATES) {
    let score = 0;
    if (t.objetivo === objetivo) score += 100;
    if (t.nivel === nivel) score += 50;
    if (t.frequencia === frequencia) score += 40;
    else if (Math.abs(t.frequencia - frequencia) === 1) score += 20;
    if (score > bestScore) { bestScore = score; best = t; }
  }
  return best;
}

interface Exercise {
  id: string;
  n: string;
  sets: number;
  reps: string;
  t: number;
  bfr: boolean;
  muscles: string;
  desc: string[];
  mistakes: string[];
}

interface ProgramDay {
  day: string;
  focus: string;
  exercises: Exercise[];
}

interface ProgramData {
  name: string;
  days: ProgramDay[];
  notes: string[];
}

function generateProgram(objetivo: string, nivel: string, diasDisponiveis: number, lesoes: string[], nome?: string): ProgramData {
  const template = findBestTemplate(objetivo, nivel, diasDisponiveis);
  
  const days: ProgramDay[] = template.dias.map((daySlot) => {
    const usedIds = new Set<string>();
    const exercises: Exercise[] = [];

    for (const slot of daySlot.slots) {
      const ex = pickExercise(slot.categoria, slot.padrao_motor, usedIds, nivel, lesoes);
      if (ex) {
        usedIds.add(ex.id);
        exercises.push({
          id: ex.id, n: ex.n, sets: slot.sets, reps: slot.reps, t: slot.rest,
          bfr: slot.bfr || false, muscles: ex.muscles, desc: ex.desc, mistakes: ex.mistakes,
        });
      }
    }
    return { day: daySlot.label, focus: daySlot.focus, exercises };
  });

  const objectiveLabel: Record<string, string> = {
    hipertrofia: 'Hipertrofia', emagrecimento: 'Emagrecimento', forca: 'Força',
    resistencia: 'Resistência', definicao: 'Definição',
  };

  const notes = [
    `📅 Duração: ${template.duracaoSemanas} semanas`,
    '🔥 40+ Dica: Faça 10-15min de aquecimento. Mobilidade é fundamental.',
    '💤 Sono: 7-9h por noite é tão importante quanto o treino.',
    '🥩 Proteína: mínimo 1,8g por kg/dia.',
    ...template.notas,
  ];

  if (lesoes.length > 0) {
    notes.push(`⚠️ Lesões consideradas: ${lesoes.join(', ')}.`);
  }

  return {
    name: nome ? `Programa de ${objectiveLabel[objetivo] || objetivo} para ${nome}` : `Programa de ${objectiveLabel[objetivo] || objetivo} – ${diasDisponiveis}x/semana`,
    days,
    notes,
  };
}

function detectFromPrompt(prompt: string) {
  const lower = prompt.toLowerCase();
  let objetivo = 'hipertrofia';
  if (/emagrec|perder.*peso|queimar.*gordura/.test(lower)) objetivo = 'emagrecimento';
  if (/força|forca|power/.test(lower)) objetivo = 'forca';

  let dias = 3;
  const daysMatch = lower.match(/(\d)\s*(dias|vezes|x)/);
  if (daysMatch) dias = Math.min(6, Math.max(2, parseInt(daysMatch[1])));

  let nivel = 'intermediario';
  if (/iniciante|começando|novo/.test(lower)) nivel = 'iniciante';
  if (/avançado|avancado|expert/.test(lower)) nivel = 'avancado';

  const lesoes: string[] = [];
  if (/ombro|manguito/.test(lower)) lesoes.push('ombro');
  if (/joelho|patela/.test(lower)) lesoes.push('joelho');
  if (/lombar|coluna|costas/.test(lower)) lesoes.push('lombar');

  return { objetivo, dias, nivel, lesoes };
}

function isProgramRequest(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  const keywords = ['programa', 'treino', 'treinamento', 'plano', 'montar', 'criar', 'gerar', 'quero um',
    'hipertrofia', 'emagrecer', 'emagrecimento', 'forca', 'força', '2 dias', '3 dias', '4 dias', '5 dias', '6 dias'];
  return keywords.some(kw => lower.includes(kw));
}

// ──────────────────────────────────────────────────────────
// VITE PLUGIN
// ──────────────────────────────────────────────────────────

export function apiPlugin(): Plugin {
  return {
    name: 'vite-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req: Connect.IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const { prompt, userProfile } = data;

            if (!prompt) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Prompt é obrigatório' }));
              return;
            }

            const detected = detectFromPrompt(prompt);
            const objetivo = userProfile?.objetivo || detected.objetivo;
            const nivel = userProfile?.nivel || detected.nivel;
            const diasDisponiveis = userProfile?.diasDisponiveis || detected.dias;
            const lesoes = userProfile?.lesoes || detected.lesoes;
            const nome = userProfile?.name;

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');

            if (isProgramRequest(prompt)) {
              const program = generateProgram(objetivo, nivel, diasDisponiveis, lesoes, nome);
              const totalEx = program.days.reduce((sum, d) => sum + d.exercises.length, 0);

              res.statusCode = 200;
              res.end(JSON.stringify({
                text: `Perfeito! Aqui está o seu programa personalizado de **${objetivo}** — ${diasDisponiveis}x por semana, nível ${nivel}.\n\nO programa tem ${program.days.length} dias de treino com ${totalEx} exercícios. 💪`,
                isProgram: true,
                program,
                isWorkout: false,
                _metadata: { aiProvider: 'local', timestamp: new Date().toISOString(), responseTime: 50 },
              }));
            } else {
              res.statusCode = 200;
              res.end(JSON.stringify({
                text: `Entendido! Me conta um pouco mais sobre seu objetivo para eu montar o programa ideal para você.\n\nPosso criar programas para:\n- **Hipertrofia** (ganho de massa muscular)\n- **Emagrecimento** (queima de gordura)\n- **Força** (aumento de força)\n\nBasta me dizer seu objetivo e quantos dias por semana você pode treinar!`,
                isProgram: false,
                program: null,
                isWorkout: false,
                _metadata: { aiProvider: 'local', timestamp: new Date().toISOString(), responseTime: 10 },
              }));
            }
          } catch (error) {
            console.error('[API] Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Erro interno', text: 'Ocorreu um erro. Tente novamente.' }));
          }
        });
      });

      server.middlewares.use('/api/health', (req: Connect.IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.statusCode = 200;
        res.end(JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          services: { localBrain: true },
          version: '1.0.0',
        }));
      });
    },
  };
}

export default apiPlugin;
