import type { Exercise } from '../responses';

export interface ExerciseV2 {
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
  // Which injury regions make this exercise unsafe
  contraindicado_para: string[];
  // Substitute exercise IDs when injured
  substitutos: Partial<Record<string, string>>;
  // Optional YouTube video ID for tutorial modal
  video_url?: string;
}

export const EXERCISE_DB_V2: Record<string, ExerciseV2> = {
  // ──────────────── UPPER BODY - PUSH ────────────────
  supino_reto_halteres: {
    id: 'supino_reto_halteres',
    n: 'Supino Reto com Halteres',
    muscles: 'Peitoral, Tríceps, Deltoide Anterior',
    categoria: 'upper_body', padrao_motor: 'push',
    equipamento: ['halter', 'banco'], nivel: 'intermediario',
    unilateral: false,
    desc: ['Escápulas esmagadas contra o banco.', 'Ângulo de ~75° entre cotovelo e tronco.', 'Controle a descida por 3 segundos.'],
    mistakes: ['Ombros protraídos (redondos)', 'Halteres muito abertos (>90°)'],
    sets_default: 4, reps_default: '8-12', rest_seconds: 90, bfr: false,
    contraindicado_para: ['ombro'],
    substitutos: { ombro: 'flexao_diamante', punho: 'supino_maquina' },
  },
  supino_inclinado_halteres: {
    id: 'supino_inclinado_halteres',
    n: 'Supino Inclinado 30°',
    muscles: 'Porção Clavicular do Peitoral',
    categoria: 'upper_body', padrao_motor: 'push',
    equipamento: ['halter', 'banco'], nivel: 'intermediario',
    unilateral: false,
    desc: ['Banco a 30°, não 45°.', 'Cotovelos a ~75° do tronco.', 'Controle a descida por 3s.'],
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
    desc: ['Banco a 75-80°.', 'Cotovelos levemente à frente (~30°).', 'Pressão máxima no topo, controle na descida.'],
    mistakes: ['Cotovelos alinhados com as costas (90°)', 'Banco vertical sobrecarrega manguito rotador'],
    sets_default: 3, reps_default: '10-12', rest_seconds: 75, bfr: false,
    contraindicado_para: ['ombro'],
    substitutos: { ombro: 'elevacao_lateral_maquina' },
  },
  elevacao_lateral: {
    id: 'elevacao_lateral',
    n: 'Elevação Lateral com Halteres',
    muscles: 'Deltoide Lateral',
    categoria: 'upper_body', padrao_motor: 'push',
    equipamento: ['halter'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Movimento no plano escapular (~30° à frente do corpo).', 'Pense em \'jogar água\' na parede.', 'Controle a descida por 2-3 segundos.'],
    mistakes: ['Subir os ombros junto', 'Cotovelos muito flexionados'],
    sets_default: 3, reps_default: '12-15', rest_seconds: 60, bfr: false,
    contraindicado_para: ['ombro'],
    substitutos: { ombro: 'elevacao_lateral_cabo_baixo' },
  },
  triceps_corda: {
    id: 'triceps_corda',
    n: 'Tríceps Pulley com Corda',
    muscles: 'Tríceps (3 cabeças)',
    categoria: 'upper_body', padrao_motor: 'push',
    equipamento: ['cabo', 'corda'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Abra a corda na parte mais baixa.', 'Cotovelos fixos nas laterais.', 'Apenas o antebraço se move.'],
    mistakes: ['Mover o cotovelo para frente', 'Usar momentum deslocando para peitoral'],
    sets_default: 3, reps_default: '12-15', rest_seconds: 60, bfr: false,
    contraindicado_para: ['cotovelo'],
    substitutos: { cotovelo: 'triceps_testa_halter' },
  },
  flexao_diamante: {
    id: 'flexao_diamante',
    n: 'Flexão Diamante',
    muscles: 'Tríceps, Peitoral Interno',
    categoria: 'upper_body', padrao_motor: 'push',
    equipamento: ['peso_corporal'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Mãos formando diamante abaixo do peito.', 'Cotovelos próximos ao corpo.', 'Corpo rígido como prancha.'],
    mistakes: ['Quadril afundando', 'Cotovelos muito abertos'],
    sets_default: 3, reps_default: '10-15', rest_seconds: 60, bfr: false,
    contraindicado_para: ['punho'],
    substitutos: { punho: 'triceps_corda' },
  },
  flexao_inclinada: {
    id: 'flexao_inclinada',
    n: 'Flexão Inclinada (mãos elevadas)',
    muscles: 'Peitoral Inferior, Tríceps',
    categoria: 'upper_body', padrao_motor: 'push',
    equipamento: ['peso_corporal'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Mãos sobre superfície elevada (banco, step).', 'Corpo em linha reta.', 'Desça controlado até o peito tocar.'],
    mistakes: ['Quadril alto demais (anula peitoral)', 'Cotovelos a 90°'],
    sets_default: 3, reps_default: '12-20', rest_seconds: 60, bfr: false,
    contraindicado_para: [],
    substitutos: {},
  },

  // ──────────────── UPPER BODY - PULL ────────────────
  puxada_frente: {
    id: 'puxada_frente',
    n: 'Puxada Frontal Aberta',
    muscles: 'Dorsal (Lats), Bíceps',
    categoria: 'upper_body', padrao_motor: 'pull',
    equipamento: ['barra_fixa', 'polia'], nivel: 'intermediario',
    unilateral: false,
    desc: ['Pense em puxar com os cotovelos, não com o punho.', 'Estufe o peito ao final.', 'Largura de mãos ~1,5x a largura dos ombros.'],
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
    desc: ['Coluna neutra e core ativo.', 'Puxe em direção ao umbigo, não ao peito.', 'Joelhos levemente flexionados.'],
    mistakes: ['Lombar arredondada = risco de hérnia', 'Puxar para o peito', 'Cotovelos muito abertos'],
    sets_default: 4, reps_default: '8-12', rest_seconds: 90, bfr: false,
    contraindicado_para: ['lombar'],
    substitutos: { lombar: 'remada_maquina' },
  },
  remada_unilateral: {
    id: 'remada_unilateral',
    n: 'Remada Unilateral com Halter (One Arm)',
    muscles: 'Dorsal, Bíceps, Core',
    categoria: 'upper_body', padrao_motor: 'pull',
    equipamento: ['halter', 'banco'], nivel: 'intermediario',
    unilateral: true,
    desc: ['Apoie joelho e mão no banco.', 'Coluna paralela ao chão.', 'Puxe o cotovelo para trás e para cima.'],
    mistakes: ['Rotação excessiva do tronco', 'Joelho de apoio muito dobrado'],
    sets_default: 3, reps_default: '10-12', rest_seconds: 75, bfr: false,
    contraindicado_para: ['lombar'],
    substitutos: { lombar: 'remada_maquina', ombro: 'remada_maquina' },
  },
  remada_maquina: {
    id: 'remada_maquina',
    n: 'Remada na Máquina (Seated Row)',
    muscles: 'Dorsal, Rombóides, Bíceps',
    categoria: 'upper_body', padrao_motor: 'pull',
    equipamento: ['maquina'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Peito apoiado no suporte.', 'Puxe para o umbigo.', 'Controle na volta, não deixe bater.'],
    mistakes: ['Inclinar o tronco para trás ao puxar', 'Encolher ombros'],
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
    desc: ['Cotovelos fixos nas laterais do corpo.', 'Subida forte, descida 3-4 segundos.', 'Range completo até extensão total.'],
    mistakes: ['Momentum com a lombar', 'Cotovelos saindo para frente na subida'],
    sets_default: 3, reps_default: '10-12', rest_seconds: 60, bfr: false,
    contraindicado_para: ['cotovelo', 'punho'],
    substitutos: { cotovelo: 'rosca_cabo', punho: 'rosca_martelo' },
  },
  rosca_martelo: {
    id: 'rosca_martelo',
    n: 'Rosca Martelo',
    muscles: 'Bíceps (braquiorradial), Antebraço',
    categoria: 'upper_body', padrao_motor: 'pull',
    equipamento: ['halter'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Pegada neutra (polegar para cima).', 'Cotovelos fixos.', 'Suba até paralelo ao ombro.'],
    mistakes: ['Inclinar o tronco para compensar o peso'],
    sets_default: 3, reps_default: '10-12', rest_seconds: 60, bfr: false,
    contraindicado_para: [],
    substitutos: {},
  },

  // ──────────────── LOWER BODY - SQUAT ────────────────
  agachamento_livre: {
    id: 'agachamento_livre',
    n: 'Agachamento Livre (Goblet/Peso corporal)',
    muscles: 'Quadríceps, Glúteos, Core',
    categoria: 'lower_body', padrao_motor: 'squat',
    equipamento: ['peso_corporal', 'halter'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Pressão nos calcanhares durante todo o movimento.', 'Quebre o quadril (sente) antes de dobrar os joelhos.', 'Peito inclinado ~15-20° à frente.'],
    mistakes: ['Valgo dinâmico (joelho pra dentro)', 'Calcanhar saindo do chão', 'Descida insuficiente (<90°)'],
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
    desc: ['Peito levemente à frente para focar no glúteo.', 'Controle a descida fortemente (3-4s).', 'Perna dianteira faz 70% do trabalho.'],
    mistakes: ['Passo curto demais esmagando o joelho', 'Tronco muito inclinado à frente'],
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
    desc: ['Nunca estenda totalmente (não dê lock) nos joelhos.', 'Glúteos e lombar grudados no banco.', 'Pés na linha dos ombros.'],
    mistakes: ['Lombar descolar no final da descida', 'Lock completo dos joelhos'],
    sets_default: 4, reps_default: '10-15', rest_seconds: 90, bfr: false,
    contraindicado_para: [],
    substitutos: {},
  },
  afundo_caminhando: {
    id: 'afundo_caminhando',
    n: 'Afundo Caminhando (Walking Lunge)',
    muscles: 'Quadríceps, Glúteos, Isquiotibiais',
    categoria: 'lower_body', padrao_motor: 'squat',
    equipamento: ['peso_corporal', 'halter'], nivel: 'iniciante',
    unilateral: true,
    desc: ['Passo largo para frente, joelho traseiro quase no chão.', 'Tronco ereto.', 'Empurre pelo calcanhar da perna dianteira.'],
    mistakes: ['Passo curto afetando joelho', 'Tronco muito à frente'],
    sets_default: 3, reps_default: '12-16', rest_seconds: 75, bfr: false,
    contraindicado_para: ['joelho'],
    substitutos: { joelho: 'leg_press' },
  },
  cadeira_extensora: {
    id: 'cadeira_extensora',
    n: 'Cadeira Extensora (Leg Extension)',
    muscles: 'Quadríceps (isolado, Vasto Medial)',
    categoria: 'lower_body', padrao_motor: 'squat',
    equipamento: ['maquina'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Agarre o banco firmemente.', 'Ponta do pé levemente para você (intra-rotação).', 'Não trave a articulação totalmente.'],
    mistakes: ['Deixar o peso cair sem controle', 'Muita carga (risco com 40+)'],
    sets_default: 3, reps_default: '12-15', rest_seconds: 60, bfr: false,
    contraindicado_para: ['joelho'],
    substitutos: { joelho: 'agachamento_livre' },
  },

  // ──────────────── LOWER BODY - HINGE ────────────────
  terra_romeno: {
    id: 'terra_romeno',
    n: 'Terra Romeno (RDL)',
    muscles: 'Posterior de Coxa, Glúteos, Eretores da Coluna',
    categoria: 'lower_body', padrao_motor: 'hinge',
    equipamento: ['halter', 'barra'], nivel: 'intermediario',
    unilateral: false,
    desc: ['Movimento de quadril: empurre a pelve para trás.', 'Barra/halteres colados nas pernas.', 'Joelhos levemente flexionados (~15°).'],
    mistakes: ['Dobrar os joelhos transformando em agachamento', 'Barra afastada das pernas aumentando shear'],
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
    desc: ['Ombros apoiados no banco, quadris no ar.', 'Contraia o glúteo no topo por 2 segundos.', 'Coluna neutra, não hiperextenda.'],
    mistakes: ['Hiperlordose lombar no topo do movimento', 'Não contrair o glúteo completamente'],
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
    desc: ['Aperte os glúteos antes de contrair a perna.', 'Controle a fase excêntrica (3-4s).', 'Range completo desde extensão até ~90°.'],
    mistakes: ['Subir a pelve no momento da força'],
    sets_default: 3, reps_default: '10-15', rest_seconds: 60, bfr: false,
    contraindicado_para: [],
    substitutos: {},
  },
  kettlebell_swing: {
    id: 'kettlebell_swing',
    n: 'Kettlebell Swing',
    muscles: 'Glúteos, Isquiotibiais, Core, Lombar',
    categoria: 'lower_body', padrao_motor: 'hinge',
    equipamento: ['kettlebell', 'halter'], nivel: 'intermediario',
    unilateral: false,
    desc: ['É um movimento de quadril, não de agachamento.', 'Gere potência com o impulso do quadril.', 'Core firme e coluna neutra em todo momento.'],
    mistakes: ['Agachar em vez de dobrar o quadril', 'Puxar com os braços em vez do quadril'],
    sets_default: 3, reps_default: '15-20', rest_seconds: 60, bfr: false,
    contraindicado_para: ['lombar'],
    substitutos: { lombar: 'hip_thrust' },
  },

  // ──────────────── CORE ────────────────
  prancha_abdominal: {
    id: 'prancha_abdominal',
    n: 'Prancha Abdominal (Plank)',
    muscles: 'Core Sistêmico (Reto abdominal, Transverso, Oblíquos)',
    categoria: 'core', padrao_motor: 'core',
    equipamento: ['peso_corporal'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Contraia ativamente os glúteos.', 'Puxe os cotovelos em direção aos pés.', 'Evite quadril afundando ou subindo.'],
    mistakes: ['Quadril afundando (hiperextensão lombar)', 'Cabeça olhando para frente', 'Apenas ficar imóvel sem contrair'],
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
    desc: ['Mãos atrás da cabeça sem puxar o pescoço.', 'Rotação verdadeira do tronco, não dos cotovelos.', 'Movimento lento e controlado.'],
    mistakes: ['Puxar o pescoço com as mãos', 'Mover apenas os cotovelos sem rotação de tronco'],
    sets_default: 3, reps_default: '15-20', rest_seconds: 45, bfr: false,
    contraindicado_para: ['lombar'],
    substitutos: { lombar: 'prancha_abdominal' },
  },
  prancha_lateral: {
    id: 'prancha_lateral',
    n: 'Prancha Lateral',
    muscles: 'Oblíquos, Quadrado Lombar, Glúteo Médio',
    categoria: 'core', padrao_motor: 'core',
    equipamento: ['peso_corporal'], nivel: 'iniciante',
    unilateral: true,
    desc: ['Corpo em linha reta lateral.', 'Quadril empurrado para cima.', 'Contraia o oblíquo ativamente.'],
    mistakes: ['Quadril afundando', 'Ombro de suporte colapsar'],
    sets_default: 3, reps_default: '20-40s', rest_seconds: 45, bfr: false,
    contraindicado_para: [],
    substitutos: {},
  },
  elevacao_pernas_deitado: {
    id: 'elevacao_pernas_deitado',
    n: 'Elevação de Pernas Deitado',
    muscles: 'Iliopsoas, Reto Abdominal (inferior)',
    categoria: 'core', padrao_motor: 'core',
    equipamento: ['peso_corporal'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Lombar pressionada contra o solo.', 'Desça as pernas sem deixar a lombar descolar.', 'Pés juntos ou levemente afastados.'],
    mistakes: ['Lombar descolar do chão na descida', 'Usar momentum para subir'],
    sets_default: 3, reps_default: '10-15', rest_seconds: 45, bfr: false,
    contraindicado_para: ['lombar'],
    substitutos: { lombar: 'prancha_abdominal' },
  },

  // ──────────────── LOWER BODY - CALF ────────────────
  panturrilha_em_pe: {
    id: 'panturrilha_em_pe',
    n: 'Elevação de Panturrilha em Pé',
    muscles: 'Gastrocnêmio (Batata da Perna)',
    categoria: 'lower_body', padrao_motor: 'carry',
    equipamento: ['peso_corporal', 'maquina'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Segure a contração máxima por 1-2 segundos no topo.', 'Desça bem fundo para alongar totalmente.', 'Movimento controlado, sem saltos.'],
    mistakes: ['Execução em ritmo \'mola\' saltitante', 'Não chegar ao fundo da amplitude'],
    sets_default: 4, reps_default: '15-20', rest_seconds: 45, bfr: false,
    contraindicado_para: [],
    substitutos: {},
  },

  // ──────────────── MOBILITY / WARM-UP ────────────────
  mobilidade_quadril: {
    id: 'mobilidade_quadril',
    n: 'Mobilidade de Quadril (90/90 ou World Greatest)',
    muscles: 'Cápsula do Quadril, Abdutores, Rotadores',
    categoria: 'mobility', padrao_motor: 'core',
    equipamento: ['peso_corporal'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Sente em 90/90 e gire suavemente.', 'Sem dor — se doer, recue a amplitude.', 'Respire fundo em cada posição.'],
    mistakes: ['Forçar a amplitude com dor', 'Segurar a respiração'],
    sets_default: 2, reps_default: '10-12', rest_seconds: 30, bfr: false,
    contraindicado_para: [],
    substitutos: {},
  },
  mobilidade_toraxica: {
    id: 'mobilidade_toraxica',
    n: 'Mobilidade Torácica (Foam Roll ou Cat-Cow)',
    muscles: 'Coluna Torácica, Músculos Paravertebrais',
    categoria: 'mobility', padrao_motor: 'core',
    equipamento: ['foam_roller', 'peso_corporal'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Role devagar 30-60 segundos na região torácica.', 'Em cat-cow: expire no cat (flexão), inspire no cow (extensão).', '10 repetições lentas.'],
    mistakes: ['Rolar na lombar (risco de lesão)', 'Movimento rápido'],
    sets_default: 2, reps_default: '30-60s', rest_seconds: 30, bfr: false,
    contraindicado_para: [],
    substitutos: {},
  },

  // ──────────────── CARDIO ────────────────
  caminhada_inclinada: {
    id: 'caminhada_inclinada',
    n: 'Caminhada na Esteira Inclinada',
    muscles: 'Glúteos, Posterior de Coxa, Cardiorrespiratório',
    categoria: 'cardio', padrao_motor: 'cardio',
    equipamento: ['esteira'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Inclinação de 8-12%.', 'Velocidade de 4-6 km/h.', 'Não segure nos apoios para não anular o efeito glúteo.'],
    mistakes: ['Segurar no corrimão o tempo todo', 'Inclinação zero anula o benefício'],
    sets_default: 1, reps_default: '20-40min', rest_seconds: 0, bfr: false,
    contraindicado_para: [],
    substitutos: {},
  },
  hiit_bike: {
    id: 'hiit_bike',
    n: 'HIIT na Bike (Tiros de Alta Intensidade)',
    muscles: 'Cardiorrespiratório, Quadríceps, Glúteos',
    categoria: 'cardio', padrao_motor: 'cardio',
    equipamento: ['bike', 'bicicleta_ergometrica'], nivel: 'intermediario',
    unilateral: false,
    desc: ['30s máximo esforço + 90s recuperação ativa.', '6-8 rodadas.', 'FC de 80-90% FCmáx nos sprints.'],
    mistakes: ['Não recuperar o suficiente entre os tiros', 'Intensidade muito baixa nos sprints'],
    sets_default: 1, reps_default: '6-8 tiros', rest_seconds: 0, bfr: false,
    contraindicado_para: ['joelho'],
    substitutos: { joelho: 'caminhada_inclinada' },
  },
  burpees: {
    id: 'burpees',
    n: 'Burpees',
    muscles: 'Corpo inteiro, Cardiorrespiratório',
    categoria: 'cardio', padrao_motor: 'cardio',
    equipamento: ['peso_corporal'], nivel: 'intermediario',
    unilateral: false,
    desc: ['Postura firme em todo o movimento.', 'Pule com força, braços acima da cabeça.', 'Faça o movimento fluir sem parar.'],
    mistakes: ['Lombar afundando na fase de flexão', 'Aterrissar sem absorver com as pernas'],
    sets_default: 3, reps_default: '10-15', rest_seconds: 60, bfr: false,
    contraindicado_para: ['joelho', 'ombro', 'lombar'],
    substitutos: { joelho: 'caminhada_inclinada', ombro: 'mountain_climber', lombar: 'caminhada_inclinada' },
  },
  mountain_climber: {
    id: 'mountain_climber',
    n: 'Mountain Climber',
    muscles: 'Core, Ombros, Cardiorrespiratório',
    categoria: 'cardio', padrao_motor: 'cardio',
    equipamento: ['peso_corporal'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Posição de prancha alta.', 'Alterne joelhos em direção ao peito rapidamente.', 'Quadril nivelado o tempo todo.'],
    mistakes: ['Quadril alto demais', 'Mãos muito à frente do ombro'],
    sets_default: 3, reps_default: '30-45s', rest_seconds: 45, bfr: false,
    contraindicado_para: ['ombro'],
    substitutos: { ombro: 'bicicleta_deitada' },
  },

  // ──────────────── ADDITIONAL UPPER BODY ────────────────
  supino_maquina: {
    id: 'supino_maquina',
    n: 'Supino na Máquina (Chest Press)',
    muscles: 'Peitoral, Tríceps',
    categoria: 'upper_body', padrao_motor: 'push',
    equipamento: ['maquina'], nivel: 'iniciante',
    unilateral: false,
    desc: ['Peito apoiado, ombros para baixo e atrás.', 'Empurre até os braços quase estendidos.', 'Controle o retorno.'],
    mistakes: ['Encolher os ombros no movimento', 'Bloquear os cotovelos no topo'],
    sets_default: 3, reps_default: '12-15', rest_seconds: 60, bfr: false,
    contraindicado_para: [],
    substitutos: {},
  },
  crucifixo_halteres: {
    id: 'crucifixo_halteres',
    n: 'Crucifixo com Halteres',
    muscles: 'Peitoral (isolado), Deltoide Anterior',
    categoria: 'upper_body', padrao_motor: 'push',
    equipamento: ['halter', 'banco'], nivel: 'intermediario',
    unilateral: false,
    desc: ['Cotovelos levemente flexionados em toda a amplitude.', 'Desça até sentir o alongamento no peitoral.', 'Feche como se abraçasse uma árvore.'],
    mistakes: ['Cotovelos totalmente estendidos (stress articular)', 'Descer demais causando impacto acromial'],
    sets_default: 3, reps_default: '12-15', rest_seconds: 60, bfr: false,
    contraindicado_para: ['ombro'],
    substitutos: { ombro: 'supino_maquina' },
  },
  pullover_halter: {
    id: 'pullover_halter',
    n: 'Pullover com Halter',
    muscles: 'Dorsal, Peitoral, Serrátil',
    categoria: 'upper_body', padrao_motor: 'pull',
    equipamento: ['halter', 'banco'], nivel: 'intermediario',
    unilateral: false,
    desc: ['Deitado transversalmente no banco.', 'Cotovelos levemente dobrados.', 'Passe o halter por trás da cabeça com controle.'],
    mistakes: ['Cotovelos muito dobrados (vira tríceps)', 'Descida muito rápida'],
    sets_default: 3, reps_default: '10-12', rest_seconds: 60, bfr: false,
    contraindicado_para: ['ombro', 'lombar'],
    substitutos: { ombro: 'puxada_frente', lombar: 'remada_maquina' },
  },
};

/**
 * Get an exercise by ID, with safe fallback
 */
export function getExerciseV2(id: string): ExerciseV2 | null {
  return EXERCISE_DB_V2[id] || null;
}

/**
 * Convert ExerciseV2 to the Exercise shape used in ChatResponse
 */
export function toResponseExercise(ex: ExerciseV2, overrides?: Partial<Exercise>): Exercise {
  return {
    id: ex.id,
    n: ex.n,
    sets: overrides?.sets ?? ex.sets_default,
    reps: overrides?.reps ?? ex.reps_default,
    t: overrides?.t ?? ex.rest_seconds,
    bfr: overrides?.bfr ?? ex.bfr,
    muscles: ex.muscles,
    desc: ex.desc,
    mistakes: ex.mistakes,
  };
}

/**
 * Filter exercises by category/pattern, excluding those unsafe for injuries
 */
export function filterExercises(opts: {
  categoria?: string;
  padrao_motor?: string;
  nivel?: string;
  equipamento?: string[];
  lesoes?: string[];
}): ExerciseV2[] {
  const { categoria, padrao_motor, nivel, equipamento, lesoes = [] } = opts;

  return Object.values(EXERCISE_DB_V2).filter(ex => {
    if (categoria && ex.categoria !== categoria) return false;
    if (padrao_motor && ex.padrao_motor !== padrao_motor) return false;
    if (nivel) {
      const levels = ['iniciante', 'intermediario', 'avancado'];
      if (levels.indexOf(ex.nivel) > levels.indexOf(nivel)) return false;
    }
    if (equipamento && equipamento.length > 0) {
      const hasEquip = equipamento.some(e => ex.equipamento.includes(e));
      if (!hasEquip) return false;
    }
    // Exclude exercises contraindicated for user injuries
    const blocked = ex.contraindicado_para.some(region => lesoes.includes(region));
    if (blocked) return false;
    return true;
  });
}

/**
 * Get a safe substitute for an exercise given an injury
 */
export function getSafeSubstitute(exerciseId: string, injuryRegion: string): ExerciseV2 | null {
  const ex = EXERCISE_DB_V2[exerciseId];
  if (!ex) return null;
  const subId = ex.substitutos[injuryRegion];
  if (!subId) return null;
  return EXERCISE_DB_V2[subId] || null;
}
