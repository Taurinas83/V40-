/**
 * Base de dados de exercícios - Cérebro especialista em biomecânica 40+
 */

export interface ExerciseDefinition {
  n: string; // Nome
  muscles: string; // Grupos musculares
  desc: string[]; // Descrições técnicas
  mistakes: string[]; // Erros comuns
}

export const EXERCISE_DATABASE: Record<string, ExerciseDefinition> = {
  supino_reto_halteres: {
    n: 'Supino Reto com Halteres',
    muscles: 'Peitoral, Tríceps, Deltoide Anterior',
    desc: [
      'Mantenha as escápulas esmagadas contra o banco.',
      'Dessa forma a articulação do ombro fica protegida.',
      'Mantenha um ângulo de ~75° entre o cotovelo e o tronco.',
    ],
    mistakes: [
      'Esticar totalmente travando os cotovelos',
      'Ombros protraídos (redondos)',
      'Halteres desapontados (rotação de pulso inadequada)',
    ],
  },

  supino_inclinado_halteres: {
    n: 'Supino Inclinado (30/45°)',
    muscles: 'Porção Clavicular do Peitoral',
    desc: [
      'Traga os halteres um pouco abaixo da linha dos ombros.',
      'Mantenha o arco natural da lombar sem hiperextensão.',
      'Foque em controlar a descida por 3 segundos.',
    ],
    mistakes: [
      'Cotovelos na linha exata dos ombros (90°)',
      'Banco muito inclinado (>60°) transferindo para deltoides',
    ],
  },

  puxada_frente: {
    n: 'Puxada Frontal Aberta',
    muscles: 'Dorsal (Lats), Bíceps',
    desc: [
      'Pense em puxar com os cotovelos, não com o punho.',
      'Estufe o peito ao final do movimento.',
      'Largura de mãos ~1,5x a largura dos ombros.',
    ],
    mistakes: [
      'Balanço excessivo de tronco (momentum)',
      'Puxar a barra muito abaixo do queixo',
    ],
  },

  remada_curvada: {
    n: 'Remada Curvada (Halter ou Barra)',
    muscles: 'Dorsal, Rombóides, Core',
    desc: [
      'Coluna perfeitamente neutra e core ativo (bracing).',
      'Puxe em direção ao umbigo, não ao peito.',
      'Manter os joelhos ligeiramente flexionados.',
    ],
    mistakes: [
      'Lombar arredondada (cat-back) = risco de hérnia',
      'Puxar para o peito ao invés do umbigo',
      'Cotovelos muito abertos (>90°)',
    ],
  },

  agachamento_livre: {
    n: 'Agachamento Livre (Back Squat)',
    muscles: 'Quadríceps, Glúteos, Core',
    desc: [
      'Pressão nos calcanhares durante todo o movimento.',
      'Quebre o quadril (sente) antes de dobrar os joelhos.',
      'Peito inclinado ~15-20° à frente.',
    ],
    mistakes: [
      'Valgo dinâmico (joelho pra dentro) = lesão futura',
      'Calcanhar saindo do chão',
      'Descida insuficiente (<90° de flexão)',
    ],
  },

  agachamento_bulgaro: {
    n: 'Agachamento Búlgaro (Unilateral)',
    muscles: 'Glúteos, Quadríceps',
    desc: [
      'Mantenha o peito inclinado levemente à frente para maior foco no glúteo.',
      'Controle a descida fortemente (3-4 segundos).',
      'Perna dianteira deve fazer 70% do trabalho.',
    ],
    mistakes: [
      'Passo curto demais esmagando o joelho dianteiro',
      'Tronco muito inclinado à frente (deslocando para costas)',
    ],
  },

  leg_press: {
    n: 'Leg Press 45°',
    muscles: 'Quadríceps, Glúteos',
    desc: [
      'Nunca estenda totalmente (não dê lock) nos joelhos.',
      'Mantenha os glúteos e lombar grudados no banco durante toda a série.',
      'Pés na linha dos ombros.',
    ],
    mistakes: [
      'Lombar descolar do estofamento no final da descida',
      'Lock completo dos joelhos (risco de lesão crônica)',
    ],
  },

  terra_romeno: {
    n: 'Levantamento Terra Romeno (RDL)',
    muscles: 'Posterior de Coxa, Glúteos, Erecções da Coluna',
    desc: [
      'Movimento puramente de quadril: empurre a pelve para trás.',
      'Mantenha a barra colada nas pernas durante todo o movimento.',
      'Joelhos levemente flexionados (~15°).',
    ],
    mistakes: [
      'Dobrar demais os joelhos transformando em agachamento',
      'Descer além da flexibilidade da lombar',
      'Barra afastada das pernas aumentando shear de coluna',
    ],
  },

  mesa_flexora: {
    n: 'Mesa Flexora (Leg Curl)',
    muscles: 'Isquiotibiais',
    desc: [
      'Aperte os glúteos contra o estofado antes de contrair a perna.',
      'Controle firme a fase excêntrica (3-4 segundos).',
      'Range completo desde extensão até ~90° de flexão.',
    ],
    mistakes: [
      'Subir a pelve no momento da força (deslocando trabalho)',
    ],
  },

  cadeira_extensora: {
    n: 'Cadeira Extensora (Leg Extension)',
    muscles: 'Quadríceps isolado, Vasto Medial',
    desc: [
      'Abrace o banco firmemente para gerar torque.',
      'Traga a ponta do pé sutilmente para você (intra-rotação).',
      'Não estique totalmente travando a articulação.',
    ],
    mistakes: [
      'Deixar o peso cair sem controle na volta (destruição articular)',
      'Executar com muita carga (alto risco com 40+)',
    ],
  },

  desenvolvimento_halteres: {
    n: 'Desenvolvimento de Ombros',
    muscles: 'Deltoide Anterior e Lateral, Tríceps',
    desc: [
      'Ajuste o banco em cerca de 75° a 80°, não 90° retos.',
      'Cotovelos levemente apontados para a frente (~30°).',
      'Pressão máxima em cima, controle na descida.',
    ],
    mistakes: [
      'Cotovelos alinhados demais com as costas (90°)',
      'Banco vertical excessivamente (sobrecarregando o manguito rotador)',
      'Trazer os halteres até a linha da cabeça (impacto acromial)',
    ],
  },

  elevacao_lateral: {
    n: 'Elevação Lateral com Halteres',
    muscles: 'Deltoide Lateral',
    desc: [
      'Faça o movimento no plano escapular (levemente à frente do corpo ~30°).',
      'Pense em \'jogar água\' na parede com os halteres.',
      'Controle a descida por 2-3 segundos.',
    ],
    mistakes: [
      'Subir os ombros (encolhimento) junto com os braços',
      'Cotovelos muito flexionados (parecendo rosca com halteres)',
      'Inclinar muito o tronco para frente para vencer o peso',
    ],
  },

  rosca_direta: {
    n: 'Rosca Direta (Barra ou Halter)',
    muscles: 'Bíceps',
    desc: [
      'Prenda os cotovelos nas laterais do corpo.',
      'Faça a subida forte mas controlada, e desça por 3-4 segundos.',
      'Range completo: extensão até flexão ~140°.',
    ],
    mistakes: [
      'Dançar (momentum) com a lombar trazendo o tronco à frente',
      'Cotovelos saindo para frente durante a subida',
      'Muito peso impedindo range completo',
    ],
  },

  triceps_corda: {
    n: 'Tríceps Pulley com Corda',
    muscles: 'Tríceps (3 cabeças)',
    desc: [
      'Abra a corda exatamente na parte mais baixa do movimento.',
      'Estabilize as escápulas para isolar o tríceps.',
      'Cotovelos fixos; apenas antebraço se move.',
    ],
    mistakes: [
      'Mover o cotovelo para frente e para trás durante a execução',
      'Abrir a corda parcialmente durante o movimento',
      'Usar momentum deslocando para pectorais',
    ],
  },

  panturrilha_em_pe: {
    n: 'Elevação de Panturrilha em Pé',
    muscles: 'Gastrocnêmio (músculos da batata da perna)',
    desc: [
      'Segure a contração máxima por 1 a 2 segundos no topo.',
      'Desça bem fundo para alongar totalmente a panturrilha.',
      'Movimento controlado, sem saltos.',
    ],
    mistakes: [
      'Execução em ritmo \'mola\' saltitante (zero controle)',
      'Não chegar ao fundo da amplitude',
      'Velocidade muito rápida',
    ],
  },

  prancha_abdominal: {
    n: 'Prancha Abdominal (Plank)',
    muscles: 'Core Sistêmico (Reto abdominal, Transverso, Oblíquos)',
    desc: [
      'Contraia ativamente os glúteos.',
      'Puxe os cotovelos em direção aos pés para esmagar o abdômen.',
      'Evite deixar a pelve cair ou subir excessivamente.',
    ],
    mistakes: [
      'Quadril afundando causando hiperextensão de lombar = dor',
      'Cabeça olhando para frente (pescoço estendido)',
      'Apenas ficar imóvel sem contrair o core ativamente',
    ],
  },
};

/**
 * Obtém definição de exercício por ID
 */
export function getExerciseDefinition(id: string): ExerciseDefinition | null {
  return EXERCISE_DATABASE[id] || null;
}

/**
 * Lista todos os IDs de exercício disponíveis
 */
export function getAvailableExerciseIds(): string[] {
  return Object.keys(EXERCISE_DATABASE);
}

/**
 * Valida e enriquece exercício com dados do banco
 */
export function enrichExerciseWithDefinition(
  exercise: Record<string, any>
): Record<string, any> {
  if (!exercise.id) return exercise;

  const definition = getExerciseDefinition(exercise.id);
  if (!definition) return exercise;

  return {
    ...definition,
    ...exercise,
    n: definition.n,
    muscles: definition.muscles,
    desc: definition.desc,
    mistakes: definition.mistakes,
  };
}
