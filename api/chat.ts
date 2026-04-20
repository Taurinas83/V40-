import type { VercelRequest, VercelResponse } from '@vercel/node';

// ──────────────────────────────────────────────────────────
// EXERCISE DATABASE V2 - Inline para garantir funcionamento
// ──────────────────────────────────────────────────────────

interface ExerciseV2 {
  id: string;
  n: string;
  muscles: string;
  categoria: 'upper_body' | 'lower_body' | 'core' | 'cardio' | 'mobility';
  padrao_motor: 'push' | 'pull' | 'squat' | 'hinge' | 'carry' | 'core' | 'cardio';
  equipamento: string[];
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  unilateral: boolean;
  desc: string[];
  mistakes: string[];
  sets_default: number;
  reps_default: string;
  rest_seconds: number;
  bfr: boolean;
  contraindicado_para: string[];
  substitutos: Record<string, string>;
}

const EXERCISE_DB: Record<string, ExerciseV2> = {
  supino_reto_halteres: {
    id: 'supino_reto_halteres',
    n: 'Supino Reto com Halteres',
    muscles: 'Peitoral, Tríceps, Deltoide Anterior',
    categoria: 'upper_body', padrao_motor: 'push',
    equipamento: ['halter', 'banco'], nivel: 'intermediario',
    unilateral: false,
    desc: ['Escápulas esmagadas contra o banco.', 'Ângulo de ~75° entre cotovelo e tronco.'],
    mistakes: ['Ombros protraídos (redondos)', 'Halteres muito abertos (>90°)'],
    sets_default: 4, reps_default: '8-12', rest_seconds: 90, bfr: false,
    contraindicado_para: ['ombro'],
    substitutos: { ombro: 'flexao_diamante' },
  },
  supino_inclinado_halteres: {
    id: 'supino_inclinado_halteres',
    n: 'Supino Inclinado 30°',
    muscles: 'Porção Clavicular do Peitoral',
    categoria: 'upper_body', padrao_motor: 'push',
    equipamento: ['halter', 'banco'], nivel: 'intermediario',
    unilateral: false,
    desc: ['Banco a 30°, não 45°.', 'Cotovelos a ~75° do tronco.'],
    mistakes: ['Banco muito inclinado (>45°) ativa mais deltoides'],
    sets_default: 3, reps_default: '10-12', rest_seconds: 75, bfr: false,
    contraindicado_para: ['ombro'],
    substitutos: { ombro: 'flexao_inclinada' },
  },
  desenvolvimento_halteres: {
    id: 'desenvolvimento_halteres',
    n: 'Desenvolvimento de Ombros com Halteres',
    muscles: 'Deltoide Anterior e Lateral, Tríceps',
    categoria: 'upper_body', padrao_motor: 'push',
    equipamento: ['halter', 'banco'], nivel: 'intermediario',
    unilateral: false,
    desc: ['Banco a 75-80°.', 'Cotovelos levemente à frente (~30°).'],
    mistakes: ['Cotovelos alinhados com as costas (90°)'],
    sets_default: 3, reps_default: '10-12', rest_seconds: 75, bfr: false,
    contraindicado_para: ['ombro'],
    substitutos: {},
  },
  elevacao_lateral: {
    id: 'elevacao_lateral',
    n: 'Elevação Lateral com Halteres',
    muscles: 'Deltoide Lateral',
    categoria: 'upper_body', padrao_motor: 'push',
    equipamento: ['halter'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Movimento no plano escapular (~30° à frente do corpo).'],
    mistakes: ['Subir os ombros junto', 'Cotovelos muito flexionados'],
    sets_default: 3, reps_default: '12-15', rest_seconds: 60, bfr: false,
    contraindicado_para: ['ombro'],
    substitutos: {},
  },
  triceps_corda: {
    id: 'triceps_corda',
    n: 'Tríceps Pulley com Corda',
    muscles: 'Tríceps (3 cabeças)',
    categoria: 'upper_body', padrao_motor: 'push',
    equipamento: ['cabo'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Abra a corda na parte mais baixa.', 'Cotovelos fixos nas laterais.'],
    mistakes: ['Mover o cotovelo para frente'],
    sets_default: 3, reps_default: '12-15', rest_seconds: 60, bfr: false,
    contraindicado_para: ['cotovelo'],
    substitutos: {},
  },
  flexao_diamante: {
    id: 'flexao_diamante',
    n: 'Flexão Diamante',
    muscles: 'Tríceps, Peitoral Interno',
    categoria: 'upper_body', padrao_motor: 'push',
    equipamento: ['peso_corporal'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Mãos formando diamante abaixo do peito.', 'Corpo rígido como prancha.'],
    mistakes: ['Quadril afundando', 'Cotovelos muito abertos'],
    sets_default: 3, reps_default: '10-15', rest_seconds: 60, bfr: false,
    contraindicado_para: ['punho'],
    substitutos: {},
  },
  puxada_frente: {
    id: 'puxada_frente',
    n: 'Puxada Frontal Aberta',
    muscles: 'Dorsal (Lats), Bíceps',
    categoria: 'upper_body', padrao_motor: 'pull',
    equipamento: ['barra_fixa', 'polia'], nivel: 'intermediario',
    unilateral: false,
    desc: ['Pense em puxar com os cotovelos, não com o punho.', 'Estufe o peito ao final.'],
    mistakes: ['Balanço excessivo de tronco', 'Puxar muito abaixo do queixo'],
    sets_default: 4, reps_default: '8-12', rest_seconds: 90, bfr: false,
    contraindicado_para: ['ombro'],
    substitutos: { ombro: 'remada_maquina' },
  },
  remada_curvada: {
    id: 'remada_curvada',
    n: 'Remada Curvada com Halter',
    muscles: 'Dorsal, Rombóides, Core',
    categoria: 'upper_body', padrao_motor: 'pull',
    equipamento: ['halter'], nivel: 'intermediario',
    unilateral: false,
    desc: ['Coluna neutra e core ativo.', 'Puxe em direção ao umbigo.'],
    mistakes: ['Lombar arredondada', 'Puxar para o peito'],
    sets_default: 4, reps_default: '8-12', rest_seconds: 90, bfr: false,
    contraindicado_para: ['lombar'],
    substitutos: { lombar: 'remada_maquina' },
  },
  remada_maquina: {
    id: 'remada_maquina',
    n: 'Remada na Máquina (Seated Row)',
    muscles: 'Dorsal, Rombóides, Bíceps',
    categoria: 'upper_body', padrao_motor: 'pull',
    equipamento: ['maquina'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Peito apoiado no suporte.', 'Puxe para o umbigo.'],
    mistakes: ['Inclinar o tronco para trás ao puxar'],
    sets_default: 3, reps_default: '12-15', rest_seconds: 60, bfr: false,
    contraindicado_para: [],
    substitutos: {},
  },
  rosca_direta: {
    id: 'rosca_direta',
    n: 'Rosca Direta (Barra ou Halter)',
    muscles: 'Bíceps',
    categoria: 'upper_body', padrao_motor: 'pull',
    equipamento: ['halter', 'barra'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Cotovelos fixos nas laterais do corpo.', 'Subida forte, descida 3-4 segundos.'],
    mistakes: ['Momentum com a lombar'],
    sets_default: 3, reps_default: '10-12', rest_seconds: 60, bfr: false,
    contraindicado_para: ['cotovelo', 'punho'],
    substitutos: {},
  },
  rosca_martelo: {
    id: 'rosca_martelo',
    n: 'Rosca Martelo',
    muscles: 'Bíceps (braquiorradial), Antebraço',
    categoria: 'upper_body', padrao_motor: 'pull',
    equipamento: ['halter'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Pegada neutra (polegar para cima).', 'Cotovelos fixos.'],
    mistakes: ['Inclinar o tronco para compensar o peso'],
    sets_default: 3, reps_default: '10-12', rest_seconds: 60, bfr: false,
    contraindicado_para: [],
    substitutos: {},
  },
  agachamento_livre: {
    id: 'agachamento_livre',
    n: 'Agachamento Livre (Goblet/Peso corporal)',
    muscles: 'Quadríceps, Glúteos, Core',
    categoria: 'lower_body', padrao_motor: 'squat',
    equipamento: ['peso_corporal', 'halter'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Pressão nos calcanhares durante todo o movimento.', 'Quebre o quadril antes de dobrar os joelhos.'],
    mistakes: ['Valgo dinâmico (joelho pra dentro)', 'Calcanhar saindo do chão'],
    sets_default: 3, reps_default: '12-15', rest_seconds: 75, bfr: false,
    contraindicado_para: [],
    substitutos: {},
  },
  agachamento_bulgaro: {
    id: 'agachamento_bulgaro',
    n: 'Agachamento Búlgaro (Unilateral)',
    muscles: 'Glúteos, Quadríceps',
    categoria: 'lower_body', padrao_motor: 'squat',
    equipamento: ['halter', 'banco'], nivel: 'intermediario',
    unilateral: true,
    desc: ['Peito levemente à frente para focar no glúteo.', 'Controle a descida fortemente.'],
    mistakes: ['Passo curto demais esmagando o joelho'],
    sets_default: 3, reps_default: '10-12', rest_seconds: 75, bfr: false,
    contraindicado_para: ['joelho'],
    substitutos: { joelho: 'leg_press' },
  },
  leg_press: {
    id: 'leg_press',
    n: 'Leg Press 45°',
    muscles: 'Quadríceps, Glúteos',
    categoria: 'lower_body', padrao_motor: 'squat',
    equipamento: ['maquina'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Nunca estenda totalmente (não dê lock) nos joelhos.', 'Glúteos e lombar grudados no banco.'],
    mistakes: ['Lombar descolar no final da descida', 'Lock completo dos joelhos'],
    sets_default: 4, reps_default: '10-15', rest_seconds: 90, bfr: false,
    contraindicado_para: [],
    substitutos: {},
  },
  cadeira_extensora: {
    id: 'cadeira_extensora',
    n: 'Cadeira Extensora (Leg Extension)',
    muscles: 'Quadríceps (isolado)',
    categoria: 'lower_body', padrao_motor: 'squat',
    equipamento: ['maquina'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Agarre o banco firmemente.', 'Não trave a articulação totalmente.'],
    mistakes: ['Deixar o peso cair sem controle'],
    sets_default: 3, reps_default: '12-15', rest_seconds: 60, bfr: false,
    contraindicado_para: ['joelho'],
    substitutos: { joelho: 'agachamento_livre' },
  },
  terra_romeno: {
    id: 'terra_romeno',
    n: 'Terra Romeno (RDL)',
    muscles: 'Posterior de Coxa, Glúteos, Eretores',
    categoria: 'lower_body', padrao_motor: 'hinge',
    equipamento: ['halter', 'barra'], nivel: 'intermediario',
    unilateral: false,
    desc: ['Movimento de quadril: empurre a pelve para trás.', 'Joelhos levemente flexionados (~15°).'],
    mistakes: ['Dobrar os joelhos transformando em agachamento'],
    sets_default: 4, reps_default: '8-12', rest_seconds: 90, bfr: false,
    contraindicado_para: ['lombar'],
    substitutos: { lombar: 'hip_thrust' },
  },
  hip_thrust: {
    id: 'hip_thrust',
    n: 'Hip Thrust (Halter ou Barra)',
    muscles: 'Glúteo Máximo, Isquiotibiais',
    categoria: 'lower_body', padrao_motor: 'hinge',
    equipamento: ['halter', 'barra', 'banco'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Ombros apoiados no banco, quadris no ar.', 'Contraia o glúteo no topo por 2 segundos.'],
    mistakes: ['Hiperlordose lombar no topo do movimento'],
    sets_default: 4, reps_default: '10-15', rest_seconds: 75, bfr: false,
    contraindicado_para: [],
    substitutos: {},
  },
  mesa_flexora: {
    id: 'mesa_flexora',
    n: 'Mesa Flexora (Leg Curl)',
    muscles: 'Isquiotibiais',
    categoria: 'lower_body', padrao_motor: 'hinge',
    equipamento: ['maquina'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Aperte os glúteos antes de contrair a perna.', 'Controle a fase excêntrica (3-4s).'],
    mistakes: ['Subir a pelve no momento da força'],
    sets_default: 3, reps_default: '10-15', rest_seconds: 60, bfr: false,
    contraindicado_para: [],
    substitutos: {},
  },
  prancha_abdominal: {
    id: 'prancha_abdominal',
    n: 'Prancha Abdominal (Plank)',
    muscles: 'Core Sistêmico',
    categoria: 'core', padrao_motor: 'core',
    equipamento: ['peso_corporal'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Contraia ativamente os glúteos.', 'Puxe os cotovelos em direção aos pés.'],
    mistakes: ['Quadril afundando', 'Cabeça olhando para frente'],
    sets_default: 3, reps_default: '30-60s', rest_seconds: 45, bfr: false,
    contraindicado_para: [],
    substitutos: {},
  },
  abdominal_bicicleta: {
    id: 'abdominal_bicicleta',
    n: 'Abdominal Bicicleta',
    muscles: 'Reto Abdominal, Oblíquos',
    categoria: 'core', padrao_motor: 'core',
    equipamento: ['peso_corporal'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Mãos atrás da cabeça sem puxar o pescoço.', 'Rotação verdadeira do tronco.'],
    mistakes: ['Puxar o pescoço com as mãos'],
    sets_default: 3, reps_default: '15-20', rest_seconds: 45, bfr: false,
    contraindicado_para: ['lombar'],
    substitutos: { lombar: 'prancha_abdominal' },
  },
  panturrilha_em_pe: {
    id: 'panturrilha_em_pe',
    n: 'Elevação de Panturrilha em Pé',
    muscles: 'Gastrocnêmio',
    categoria: 'lower_body', padrao_motor: 'carry',
    equipamento: ['peso_corporal', 'maquina'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Segure a contração máxima por 1-2 segundos no topo.', 'Desça bem fundo para alongar.'],
    mistakes: ['Execução em ritmo saltitante'],
    sets_default: 4, reps_default: '15-20', rest_seconds: 45, bfr: false,
    contraindicado_para: [],
    substitutos: {},
  },
  burpees: {
    id: 'burpees',
    n: 'Burpees',
    muscles: 'Corpo inteiro, Cardiorrespiratório',
    categoria: 'cardio', padrao_motor: 'cardio',
    equipamento: ['peso_corporal'], nivel: 'intermediario',
    unilateral: false,
    desc: ['Postura firme em todo o movimento.', 'Pule com força, braços acima da cabeça.'],
    mistakes: ['Lombar afundando na fase de flexão'],
    sets_default: 3, reps_default: '10-15', rest_seconds: 60, bfr: false,
    contraindicado_para: ['joelho', 'ombro', 'lombar'],
    substitutos: {},
  },
  mountain_climber: {
    id: 'mountain_climber',
    n: 'Mountain Climber',
    muscles: 'Core, Ombros, Cardiorrespiratório',
    categoria: 'cardio', padrao_motor: 'cardio',
    equipamento: ['peso_corporal'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Posição de prancha alta.', 'Alterne joelhos em direção ao peito.'],
    mistakes: ['Quadril alto demais'],
    sets_default: 3, reps_default: '30-45s', rest_seconds: 45, bfr: false,
    contraindicado_para: ['ombro'],
    substitutos: {},
  },
};

// ──────────────────────────────────────────────────────────
// PROGRAM TEMPLATES
// ──────────────────────────────────────────────────────────

interface DaySlot {
  label: string;
  focus: string;
  slots: Array<{
    categoria: string;
    padrao_motor: string;
    sets: number;
    reps: string;
    rest: number;
    bfr?: boolean;
  }>;
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
    id: 'hiper_fullbody_3_ini',
    objetivo: 'hipertrofia', split: 'fullbody', nivel: 'iniciante',
    frequencia: 3, duracaoSemanas: 8,
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
  },
  {
    id: 'hiper_upper_lower_4_int',
    objetivo: 'hipertrofia', split: 'upper_lower', nivel: 'intermediario',
    frequencia: 4, duracaoSemanas: 10,
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
  },
  {
    id: 'emag_fullbody_3_ini',
    objetivo: 'emagrecimento', split: 'fullbody', nivel: 'iniciante',
    frequencia: 3, duracaoSemanas: 8,
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
      },
    ],
    notas: ['Déficit calórico de 300-400 kcal/dia recomendado.', 'Proteína: 1,8-2g por kg de peso corporal.'],
  },
];

// ──────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ──────────────────────────────────────────────────────────

function filterExercises(opts: {
  categoria?: string;
  padrao_motor?: string;
  nivel?: string;
  equipamento?: string[];
  lesoes?: string[];
}): ExerciseV2[] {
  const { categoria, padrao_motor, nivel, equipamento = [], lesoes = [] } = opts;

  return Object.values(EXERCISE_DB).filter(ex => {
    if (categoria && ex.categoria !== categoria) return false;
    if (padrao_motor && ex.padrao_motor !== padrao_motor) return false;
    if (nivel) {
      const levels = ['iniciante', 'intermediario', 'avancado'];
      if (levels.indexOf(ex.nivel) > levels.indexOf(nivel)) return false;
    }
    if (equipamento.length > 0) {
      const hasEquip = equipamento.some(e => ex.equipamento.includes(e));
      if (!hasEquip) return false;
    }
    const blocked = ex.contraindicado_para.some(region => lesoes.includes(region));
    if (blocked) return false;
    return true;
  });
}

function pickExercise(
  categoria: string,
  padrao_motor: string,
  usedIds: Set<string>,
  nivel: string,
  equipamento: string[],
  lesoes: string[]
): ExerciseV2 | null {
  let candidates = filterExercises({ categoria, padrao_motor, nivel, equipamento, lesoes })
    .filter(ex => !usedIds.has(ex.id));

  if (candidates.length === 0) {
    candidates = filterExercises({ categoria, padrao_motor, lesoes })
      .filter(ex => !usedIds.has(ex.id));
  }

  if (candidates.length === 0) return null;
  return candidates[0];
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

    if (score > bestScore) {
      bestScore = score;
      best = t;
    }
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

function generateProgram(
  objetivo: string,
  nivel: string,
  diasDisponiveis: number,
  equipamento: string[],
  lesoes: string[],
  nome?: string
): ProgramData {
  const template = findBestTemplate(objetivo, nivel, diasDisponiveis);
  
  const days: ProgramDay[] = template.dias.map((daySlot) => {
    const usedIds = new Set<string>();
    const exercises: Exercise[] = [];

    for (const slot of daySlot.slots) {
      const ex = pickExercise(
        slot.categoria,
        slot.padrao_motor,
        usedIds,
        nivel,
        equipamento,
        lesoes
      );

      if (ex) {
        usedIds.add(ex.id);
        exercises.push({
          id: ex.id,
          n: ex.n,
          sets: slot.sets,
          reps: slot.reps,
          t: slot.rest,
          bfr: slot.bfr || false,
          muscles: ex.muscles,
          desc: ex.desc,
          mistakes: ex.mistakes,
        });
      }
    }

    return {
      day: daySlot.label,
      focus: daySlot.focus,
      exercises,
    };
  });

  const objectiveLabel: Record<string, string> = {
    hipertrofia: 'Hipertrofia',
    emagrecimento: 'Emagrecimento',
    forca: 'Força',
    resistencia: 'Resistência',
    reabilitacao: 'Reabilitação',
    definicao: 'Definição',
    manutencao: 'Manutenção',
  };

  const notes = [
    `📅 Duração: ${template.duracaoSemanas} semanas`,
    '🔥 40+ Dica: Faça 10-15min de aquecimento antes de cada treino. Mobilidade é fundamental.',
    '💤 Sono: 7-9h por noite é tão importante quanto o treino em si.',
    '🥩 Proteína: mínimo 1,8g por kg de peso corporal/dia.',
    ...template.notas,
  ];

  if (lesoes.length > 0) {
    notes.push(`⚠️ Lesões consideradas: ${lesoes.join(', ')}. Exercícios adaptados.`);
  }

  const programName = nome
    ? `Programa de ${objectiveLabel[objetivo] || objetivo} para ${nome}`
    : `Programa de ${objectiveLabel[objetivo] || objetivo} – ${template.split} ${diasDisponiveis}x/semana`;

  return {
    name: programName,
    days,
    notes,
  };
}

function generateProgramText(
  objetivo: string,
  nivel: string,
  diasDisponiveis: number,
  lesoes: string[],
  nome?: string,
  program?: ProgramData
): string {
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

  const totalExercises = program?.days.reduce((sum, d) => sum + d.exercises.length, 0) || 0;

  return `${greeting} Aqui está o seu programa personalizado de **${objText}** — ${diasDisponiveis}x por semana, nível ${nivel}.${injuryNote}

O programa tem ${program?.days.length || diasDisponiveis} dias de treino com ${totalExercises} exercícios no total, além de dicas personalizadas para 40+. Execute os exercícios na ordem indicada e respeite os tempos de descanso para maximizar os resultados.

Qualquer dúvida sobre técnica ou se sentir dor em algum exercício, me avise e ajusto imediatamente! 💪`;
}

function detectIntent(prompt: string): 'generate_program' | 'question' | 'unknown' {
  const lower = prompt.toLowerCase();
  const programKeywords = [
    'programa', 'treino', 'treinamento', 'plano',
    'montar', 'criar', 'gerar', 'fazer', 'quero um',
    'hipertrofia', 'emagrecer', 'emagrecimento', 'forca', 'força',
    '2 dias', '3 dias', '4 dias', '5 dias', '6 dias',
    '2x', '3x', '4x', '5x', '6x',
  ];

  if (programKeywords.some(kw => lower.includes(kw))) {
    return 'generate_program';
  }

  return 'unknown';
}

function detectFromPrompt(prompt: string): {
  objetivo: string;
  dias: number;
  nivel: string;
  lesoes: string[];
} {
  const lower = prompt.toLowerCase();

  let objetivo = 'hipertrofia';
  if (/emagrec|perder.*peso|queimar.*gordura/.test(lower)) objetivo = 'emagrecimento';
  if (/força|forca|power/.test(lower)) objetivo = 'forca';
  if (/resistência|resistencia|cardio/.test(lower)) objetivo = 'resistencia';

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

// ──────────────────────────────────────────────────────────
// API HANDLER
// ──────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, userProfile } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt é obrigatório' });
    }

    const intent = detectIntent(prompt);
    const detected = detectFromPrompt(prompt);

    const objetivo = userProfile?.objetivo || detected.objetivo;
    const nivel = userProfile?.nivel || detected.nivel;
    const diasDisponiveis = userProfile?.diasDisponiveis || detected.dias;
    const lesoes = userProfile?.lesoes || detected.lesoes;
    const equipamento = userProfile?.equipamento || ['halter', 'maquina', 'peso_corporal', 'banco', 'cabo', 'barra'];
    const nome = userProfile?.name;

    if (intent === 'generate_program') {
      const program = generateProgram(objetivo, nivel, diasDisponiveis, equipamento, lesoes, nome);
      const text = generateProgramText(objetivo, nivel, diasDisponiveis, lesoes, nome, program);

      return res.status(200).json({
        text,
        isProgram: true,
        program,
        isWorkout: false,
        _metadata: {
          aiProvider: 'local',
          timestamp: new Date().toISOString(),
          responseTime: 50,
        },
      });
    }

    // For questions or unknown intents, return a helpful response
    return res.status(200).json({
      text: `Entendido! Me conta um pouco mais sobre seu objetivo para eu montar o programa ideal para você. 

Posso criar programas personalizados para:
- **Hipertrofia** (ganho de massa muscular)
- **Emagrecimento** (queima de gordura)
- **Força** (aumento de força máxima)
- **Resistência** (condicionamento físico)

Basta me dizer:
- Seu objetivo principal
- Quantos dias por semana você pode treinar (2-6 dias)
- Se tem alguma lesão ou limitação

Por exemplo: *"Quero um treino de hipertrofia para 4 dias por semana"*`,
      isProgram: false,
      program: null,
      isWorkout: false,
      _metadata: {
        aiProvider: 'local',
        timestamp: new Date().toISOString(),
        responseTime: 10,
      },
    });
  } catch (error) {
    console.error('[API/chat] Error:', error);
    return res.status(500).json({ 
      error: 'Erro interno no servidor',
      text: 'Desculpe, ocorreu um erro. Por favor, tente novamente.',
      isProgram: false,
      isWorkout: false,
    });
  }
}
