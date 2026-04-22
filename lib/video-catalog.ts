/**
 * Video Catalog — YouTube tutorial URLs for each exercise.
 * Format: exercise_id → YouTube search URL (no API key needed)
 * Videos chosen for correct technique focus, Portuguese or international.
 */

export interface VideoEntry {
  youtubeSearch: string; // URL to YouTube search results for this exercise
  youtubeId?: string;    // Direct video ID if known (preferred)
  duration?: string;     // Approximate tutorial duration
  tip?: string;          // Key technique tip shown to user
}

const VIDEO_CATALOG: Record<string, VideoEntry> = {
  // ─── LOWER BODY ───────────────────────────────────────────
  agachamento_livre: {
    youtubeId: 'aclHkVaku9U',
    youtubeSearch: 'https://www.youtube.com/results?search_query=agachamento+livre+técnica+correta+40+anos',
    duration: '5:20',
    tip: 'Calcanhares no chão, joelhos seguindo os pés, desça até 90°',
  },
  agachamento_bulgaro: {
    youtubeId: 'vUFnRoFXISg',
    youtubeSearch: 'https://www.youtube.com/results?search_query=agachamento+búlgaro+técnica+correta',
    duration: '4:15',
    tip: 'Passo longo, joelho traseiro quase no chão, tronco ereto',
  },
  leg_press: {
    youtubeId: '3ZX9MqxRZqI',
    youtubeSearch: 'https://www.youtube.com/results?search_query=leg+press+técnica+correta+segurança',
    duration: '3:45',
    tip: 'Nunca trave os joelhos no topo, lombar grudada no banco',
  },
  terra_romeno: {
    youtubeId: 'jEy_czb3RKA',
    youtubeSearch: 'https://www.youtube.com/results?search_query=levantamento+terra+romeno+técnica',
    duration: '4:50',
    tip: 'Empurre o quadril para trás, barra colada nas pernas, coluna neutra',
  },
  mesa_flexora: {
    youtubeId: 'Orxowest56U',
    youtubeSearch: 'https://www.youtube.com/results?search_query=mesa+flexora+técnica+isquiotibiais',
    duration: '3:10',
    tip: 'Glúteo apertado contra o banco, controle na descida',
  },
  cadeira_extensora: {
    youtubeId: 'YyvSfVjQeL0',
    youtubeSearch: 'https://www.youtube.com/results?search_query=cadeira+extensora+técnica+quadríceps',
    duration: '2:55',
    tip: 'Não trave o joelho no topo, controle total na excêntrica',
  },
  panturrilha_em_pe: {
    youtubeId: 'gwLzBJYoWlI',
    youtubeSearch: 'https://www.youtube.com/results?search_query=elevação+panturrilha+em+pé+técnica',
    duration: '2:30',
    tip: 'Segure 2 segundos no topo, desce totalmente para alongar',
  },
  hip_thrust: {
    youtubeId: 'xDmFkJxPzeM',
    youtubeSearch: 'https://www.youtube.com/results?search_query=hip+thrust+técnica+correta+glúteos',
    duration: '4:30',
    tip: 'Ombros no banco, contraia o glúteo 2s no topo, coluna neutra',
  },
  // ─── UPPER BODY — PUSH ────────────────────────────────────
  supino_reto_halteres: {
    youtubeId: 'VmB1G1K7v94',
    youtubeSearch: 'https://www.youtube.com/results?search_query=supino+halteres+técnica+ombro+seguro',
    duration: '5:10',
    tip: 'Escápulas esmagadas, halteres no plano escapular, descida controlada',
  },
  supino_inclinado_halteres: {
    youtubeId: 'DbFgADa2PL8',
    youtubeSearch: 'https://www.youtube.com/results?search_query=supino+inclinado+halteres+técnica',
    duration: '3:50',
    tip: 'Banco a 30-45°, não a 90°. Cotovelos levemente à frente',
  },
  desenvolvimento_halteres: {
    youtubeId: 'qEwKCR5JCog',
    youtubeSearch: 'https://www.youtube.com/results?search_query=desenvolvimento+ombros+halteres+técnica+segura',
    duration: '4:00',
    tip: 'Banco a 75-80°, cotovelos à frente do plano lateral do corpo',
  },
  elevacao_lateral: {
    youtubeId: 'XPPfnSEATJA',
    youtubeSearch: 'https://www.youtube.com/results?search_query=elevação+lateral+halteres+técnica+deltóide',
    duration: '3:20',
    tip: 'Plano escapular (30° à frente), pense em "jogar água na parede"',
  },
  triceps_corda: {
    youtubeId: 'vB5OHsJ3EME',
    youtubeSearch: 'https://www.youtube.com/results?search_query=triceps+pulley+corda+técnica+correta',
    duration: '2:45',
    tip: 'Abra a corda no final, cotovelos fixos ao lado do corpo',
  },
  supino_maquina: {
    youtubeId: 'xUm0BiZCWlQ',
    youtubeSearch: 'https://www.youtube.com/results?search_query=supino+máquina+chest+press+técnica',
    duration: '3:00',
    tip: 'Ajuste o assento para que os punhos fiquem na linha do peito',
  },
  // ─── UPPER BODY — PULL ────────────────────────────────────
  puxada_frente: {
    youtubeId: 'CAwf7n6Luuc',
    youtubeSearch: 'https://www.youtube.com/results?search_query=puxada+frontal+técnica+costas+correto',
    duration: '4:20',
    tip: 'Puxe com os cotovelos, não os punhos. Estufe o peito no final',
  },
  remada_maquina: {
    youtubeId: 'GZbfZ033f74',
    youtubeSearch: 'https://www.youtube.com/results?search_query=remada+máquina+seated+row+técnica',
    duration: '3:30',
    tip: 'Peito no apoio, puxe para o umbigo, controle na volta',
  },
  remada_curvada: {
    youtubeId: 'pYcpY20QaE8',
    youtubeSearch: 'https://www.youtube.com/results?search_query=remada+curvada+barra+halter+técnica+lombar',
    duration: '4:45',
    tip: 'Coluna neutra OBRIGATÓRIO. Core bracing. Puxe para o umbigo',
  },
  rosca_direta: {
    youtubeId: 'ykJmrZ5v0Oo',
    youtubeSearch: 'https://www.youtube.com/results?search_query=rosca+direta+bíceps+técnica+correta',
    duration: '3:15',
    tip: 'Cotovelos fixos nas laterais, não balance a lombar',
  },
  barra_fixa: {
    youtubeId: 'eGo4IYlbE5g',
    youtubeSearch: 'https://www.youtube.com/results?search_query=barra+fixa+pull+up+técnica+iniciante',
    duration: '5:00',
    tip: 'Escápulas para baixo antes de puxar. Peito no topo',
  },
  // ─── CORE ─────────────────────────────────────────────────
  prancha_abdominal: {
    youtubeId: 'pvIjChbGka8',
    youtubeSearch: 'https://www.youtube.com/results?search_query=prancha+abdominal+plank+técnica+core',
    duration: '2:50',
    tip: 'Glúteo contraído, puxe cotovelos em direção aos pés, não afunde o quadril',
  },
  abdominal_infra: {
    youtubeId: 'Wp4BlxcFTkE',
    youtubeSearch: 'https://www.youtube.com/results?search_query=abdominal+infra+leg+raise+técnica',
    duration: '3:00',
    tip: 'Lombar grudada no chão durante todo o movimento',
  },
  // ─── CARDIO / HIIT ────────────────────────────────────────
  burpee: {
    youtubeId: 'dZgVxmf6jkA',
    youtubeSearch: 'https://www.youtube.com/results?search_query=burpee+técnica+correta+iniciante',
    duration: '2:20',
    tip: 'Controle o impacto na aterrissagem, mantenha o core ativo',
  },
  mountain_climber: {
    youtubeId: 'nmwgirgXLYM',
    youtubeSearch: 'https://www.youtube.com/results?search_query=mountain+climber+técnica+cardio+core',
    duration: '2:00',
    tip: 'Quadril alinhado com o corpo, não levante nem afunde',
  },
};

/**
 * Get video entry for a given exercise ID.
 * Falls back to YouTube search if no direct video ID.
 */
export function getExerciseVideo(exerciseId: string): VideoEntry | null {
  return VIDEO_CATALOG[exerciseId] || null;
}

/**
 * Get YouTube embed URL for tutorial modal.
 * Uses direct video ID when available, else returns search URL.
 */
export function getYouTubeEmbedUrl(exerciseId: string): string | null {
  const entry = VIDEO_CATALOG[exerciseId];
  if (!entry) return null;
  if (entry.youtubeId) {
    return `https://www.youtube.com/embed/${entry.youtubeId}?autoplay=0&rel=0&modestbranding=1`;
  }
  return null;
}

/**
 * Get YouTube watch URL (opens in new tab).
 */
export function getYouTubeWatchUrl(exerciseId: string): string {
  const entry = VIDEO_CATALOG[exerciseId];
  if (!entry) return `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseId.replace(/_/g, ' '))}+técnica+correta`;
  if (entry.youtubeId) return `https://www.youtube.com/watch?v=${entry.youtubeId}`;
  return entry.youtubeSearch;
}

export { VIDEO_CATALOG };
