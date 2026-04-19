import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

// ==========================================
// CÉREBRO BASE (KNOWLEDGE DICTIONARY 40+)
// ==========================================
const EXPERT_BRAIN: Record<string, any> = {
  "supino_reto_halteres": { n: "Supino Reto com Halteres", muscles: "Peitoral, Tríceps, Deltoide Ant.", desc: ["Mantenha as escápulas esmagadas contra o banco.", "Dessa forma a articulação do ombro fica protegida."], mistakes: ["Esticar totalmente travando os cotovelos", "Ombros protraídos (redondos)"] },
  "supino_inclinado_halteres": { n: "Supino Inclinado (30/45°)", muscles: "Porção Clavicular do Peitoral", desc: ["Traga os halteres um pouco abaixo da linha dos ombros.", "Mantenha o arco natural da lombar."], mistakes: ["Cotovelos na linha exata dos ombros (90°)"] },
  "puxada_frente": { n: "Puxada Frontal Aberta", muscles: "Dorsal, Bíceps", desc: ["Pense em puxar com os cotovelos, não com o punho.", "Estufe o peito ao final do movimento."], mistakes: ["Balanço excessivo de tronco", "Puxar a barra muito abaixo do queixo"] },
  "remada_curvada": { n: "Remada Curvada (Halter ou Barra)", muscles: "Dorsal, Rombóides, Core", desc: ["Coluna perfeitamente neutra e core ativo (bracing).", "Puxe em direção ao umbigo."], mistakes: ["Lombar arredondada (cat-back)", "Puxar para o peito"] },
  "agachamento_livre": { n: "Agachamento Livre", muscles: "Quadríceps, Glúteos", desc: ["Pressão nos calcanhares.", "Quebre o quadril (sente) antes de dobrar os joelhos."], mistakes: ["Valgo dinâmico (joelho pra dentro)", "Calcanhar saindo do chão"] },
  "agachamento_bulgaro": { n: "Agachamento Búlgaro", muscles: "Glúteos, Quadríceps (Unilateral)", desc: ["Mantenha o peito inclinado levemente à frente para maior foco no glúteo.", "Controle a descida fortemente."], mistakes: ["Passo curto demais esmagando o joelho"] },
  "leg_press": { n: "Leg Press 45°", muscles: "Quadríceps, Glúteos", desc: ["Nunca estenda totalmente (não dê lock) nos joelhos.", "Mantenha os glúteos e lombar grudados no banco."], mistakes: ["Lombar descolar do estofamento no final da descida"] },
  "terra_romeno": { n: "Levantamento Terra Romeno (RDL)", muscles: "Posterior de Coxa, Glúteos", desc: ["Movimento puramente de quadril: empurre a pelve para trás.", "Mantenha a barra colada nas pernas."], mistakes: ["Dobrar demais os joelhos", "Descer além da flexibilidade da lombar"] },
  "mesa_flexora": { n: "Mesa Flexora", muscles: "Isquiotibiais", desc: ["Aperte os glúteos contra o estofado antes de contrair a perna.", "Controle firme a fase excêntrica."], mistakes: ["Subir a pelve no momento da força"] },
  "cadeira_extensora": { n: "Cadeira Extensora", muscles: "Quadríceps isolado", desc: ["Abrace o banco firmemente para gerar torque.", "Traga a ponta do pé sutilmente para você."], mistakes: ["Deixar o peso cair sem controle na volta"] },
  "desenvolvimento_halteres": { n: "Desenvolvimento de Ombros", muscles: "Deltoide Anterior e Lateral", desc: ["Ajuste o banco em cerca de 75° a 80°, não 90° retos.", "Cotovelos levemente apontados para a frente."], mistakes: ["Cotovelos alinhados demais com as costas"] },
  "elevacao_lateral": { n: "Elevação Lateral com Halteres", muscles: "Deltoide Lateral", desc: ["Faça o movimento no plano escapular (levemente à frente do corpo).", "Pense em 'jogar água' na parede com os halteres."], mistakes: ["Subir os ombros (encolhimento) junto com os braços"] },
  "rosca_direta": { n: "Rosca Direta (Barra ou Halter)", muscles: "Bíceps", desc: ["Prenda os cotovelos nas laterais do corpo.", "Faça a subida e desça por 3 segundos controlados."], mistakes: ["Dançar (momentum) com a lombar"] },
  "triceps_corda": { n: "Tríceps Pulley C/ Corda", muscles: "Tríceps", desc: ["Abra a corda exatamente na parte mais baixa do movimento.", "Estabilize as escápulas para isolar."], mistakes: ["Mover o cotovelo para frente e para trás"] },
  "panturrilha_em_pe": { n: "Elevação de Panturrilha em Pé", muscles: "Gastrocnêmio", desc: ["Segure a contração máxima por 1 a 2 segundos.", "Desça bem fundo para alongar totalmente."], mistakes: ["Execução em ritmo 'mola' saltitante"] },
  "prancha_abdominal": { n: "Prancha Abdominal (Plank)", muscles: "Core Sistêmico", desc: ["Contraia ativamente os glúteos.", "Puxe os cotovelos em direção aos pés para esmagar o abdômen."], mistakes: ["Quadril afundando causando dor lombar"] }
};

export default async function handler(req: any, res: any) {
  // CORS Setup for Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, userProfile, currentProgram, recentCheckins } = req.body;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;

    const hasGemini = geminiApiKey && geminiApiKey.trim() !== '' && geminiApiKey !== 'MY_GEMINI_API_KEY';
    const hasOpenAI = openaiApiKey && openaiApiKey.trim() !== '';
    const hasGroq = groqApiKey && groqApiKey.trim() !== '';

    const progressAnalysis = analyzeProgress(recentCheckins, currentProgram);
    const responseType = determineResponseType(prompt, currentProgram, recentCheckins);
    
    const systemPrompt = buildSystemPrompt(responseType, progressAnalysis);
    const context = buildContextBlock(prompt, userProfile, currentProgram, recentCheckins, progressAnalysis);

    let text = '';
    let parsed = null;
    let lastAiError = null;

    // 1. TENTATIVA GROQ
    if (hasGroq && !parsed) {
      try {
        const openai = new OpenAI({ apiKey: groqApiKey, baseURL: 'https://api.groq.com/openai/v1' });
        const response = await openai.chat.completions.create({
           model: 'llama-3.1-8b-instant',
           messages: [
             { role: 'system', content: systemPrompt + '\n\nPlease reply in valid JSON only.' },
             { role: 'user', content: context + '\n\n' + prompt }
           ],
           response_format: { type: 'json_object' }
        });
        text = response.choices[0].message.content || '';
        parsed = JSON.parse(text);
      } catch (e: any) {
        lastAiError = e.message;
      }
    }

    // 2. TENTATIVA GEMINI
    if (hasGemini && !parsed) {
      try {
        const genAI = new GoogleGenAI({ apiKey: geminiApiKey });
        const response = await genAI.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${context}\n\nUser: ${prompt}` }] }],
          config: { temperature: 0.4, responseMimeType: 'application/json' }
        });
        text = response.text || '';
        parsed = JSON.parse(text);
      } catch (e: any) {
        lastAiError = e.message;
      }
    }

    // 3. TENTATIVA OPENAI
    if (hasOpenAI && !parsed) {
       try {
         const openai = new OpenAI({ apiKey: openaiApiKey });
         const response = await openai.chat.completions.create({
           model: 'gpt-4o-mini',
           messages: [
             { role: 'system', content: systemPrompt + '\n\nPlease reply in valid JSON only.' },
             { role: 'user', content: context + '\n\n' + prompt }
           ],
           response_format: { type: 'json_object' }
         });
         text = response.choices[0].message.content || '';
         parsed = JSON.parse(text);
       } catch(e: any) {
         lastAiError = e.message;
       }
    }

    if (!parsed) {
       parsed = generateRobustOfflineResponse(prompt, userProfile, currentProgram);
       if (lastAiError) parsed.text += `\n\n*(Aviso de Rede: ${lastAiError}. Módulo Bio-Mecânico Tático Acionado)*`;
    }

    if (parsed.isProgram && parsed.program) {
       parsed.program = validateProgram(parsed.program, userProfile);
    }
    if (parsed.isWorkout && parsed.workout) {
       parsed.workout = validateWorkout(parsed.workout, userProfile);
    }

    return res.status(200).json(parsed);

  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}

// Helpers
function analyzeProgress(checkins: any[], program: any) {
  if (!checkins || checkins.length === 0) return { status: 'no_data', avgFatigue: '5' };
  const recent = checkins.slice(0, 5);
  const avgFatigue = recent.reduce((sum: number, c: any) => sum + (c.fatigue || 5), 0) / recent.length;
  return { status: avgFatigue >= 7 ? 'overreaching' : 'optimal', avgFatigue: avgFatigue.toFixed(1) };
}

function determineResponseType(prompt: string, program: any, checkins: any[]) {
  const p = prompt.toLowerCase();
  if (p.includes('programa') || p.includes('treinar') || p.includes('gerar') || p.includes('montar')) return 'new_program';
  return 'chat';
}

function buildSystemPrompt(type: string, analysis: any) {
  return `Você é o "Elite Coach V40+", IA especializada em longevidade hipertrófica para HOMENS E MULHERES acima de 40 anos.

  REGRA DE OURO (Anamnese Estruturada e Obrigatória):
  NÃO envie isProgram = true antes da "Anamnese Biomecânica e Fisiológica":
  1. Gênero e Fisiologia Base
  2. Histórico Ortopédico
  3. Carga Horária e Equipamento
  4. Objetivo Frontal
  Só devolva isProgram = true com a array de dias perfeitamente ajustada.

  O CÉREBRO BASE (Economia de Tokens):
  IDs Disponíveis Localmente: ["supino_reto_halteres", "supino_inclinado_halteres", "puxada_frente", "remada_curvada", "agachamento_livre", "agachamento_bulgaro", "leg_press", "terra_romeno", "mesa_flexora", "cadeira_extensora", "desenvolvimento_halteres", "elevacao_lateral", "rosca_direta", "triceps_corda", "panturrilha_em_pe", "prancha_abdominal"].
  Se usar ID da base, NÃO PREENCHA desc, mistakes nem n. Exemplo: {"id": "supino_reto_halteres", "sets": 3, "reps": "8-12", "t": 60, "bfr": false}. 

  FORMATO DA RESPOSTA (JSON EXCLUSIVO):
  {
    "text": "Sua resposta com linguagem técnica enxuta (Markdown). Se estiver fazendo a anamnese, faça as perguntas aqui e deixe isProgram FALSE.",
    "isProgram": boolean,
    "program": { 
      "name": "Nome do Programa", 
      "days": [ { "day": "Dia da Semana", "focus": "Foco", "exercises": [ { "id": "id se houver", "n": "Nome", "sets": 3, "reps": "Range", "t": 60, "bfr": false, "muscles": "Alvo", "desc": ["Apenas se não obteve da base"], "mistakes": ["Apenas se não obteve da base"] } ] } ], 
      "notes": ["Nota de técnica"] 
    },
    "isWorkout": boolean,
    "workout": null
  }`;
}

function buildContextBlock(prompt: string, profile: any, program: any, checkins: any[], analysis: any) {
  return `[USER PROFILE] ${JSON.stringify(profile)} [CURRENT PROGRAM] ${JSON.stringify(program)} [USER PROMPT] ${prompt}`;
}

function validateProgram(prog: any, profile: any) { 
  if (!prog.days) prog.days = [];
  prog.days.forEach((d: any) => {
     if (d.exercises && Array.isArray(d.exercises)) {
        d.exercises = d.exercises.map((ex: any) => {
           if (ex.id && EXPERT_BRAIN[ex.id]) {
              const dbEx = EXPERT_BRAIN[ex.id];
              return { ...dbEx, ...ex, n: dbEx.n, desc: dbEx.desc, mistakes: dbEx.mistakes };
           }
           return ex;
        });
     }
  });
  return prog;
}

function validateWorkout(work: any, profile: any) { return work; }

function generateRobustOfflineResponse(prompt: string, profile: any, program: any) {
  const isWorkoutSearch = prompt.toLowerCase().includes("treino") || prompt.toLowerCase().includes("programa");
  let baseProgram = null;
  if (isWorkoutSearch) {
     baseProgram = {
       name: "Protocolo 40+ Tático de Emergência",
       days: [
         {
           day: "Fullbody Tátil",
           focus: "Recomposição Estrutural e Sensibilidade à Insulina",
           exercises: [
             { ...EXPERT_BRAIN["agachamento_livre"], sets: 4, reps: "8-12", t: 60, bfr: false },
             { ...EXPERT_BRAIN["supino_reto_halteres"], sets: 4, reps: "8-12", t: 60, bfr: false },
             { ...EXPERT_BRAIN["remada_curvada"], sets: 4, reps: "10-15", t: 60, bfr: false }
           ]
         }
       ],
       notes: ["Programa gerado localmente pelo Motor Tático sem depender de APIs.", "Concentre-se fortemente no TUT (Time under tension)."]
     };
  }

  return {
    text: "Minhas conexões neurais globais caíram temporariamente. Estamos no banco de dados isolado do Vitalidade V40+. Mantendo a nossa consistência primária. Acionei um protocolo base abaixo para não perdermos o dia.",
    isProgram: isWorkoutSearch,
    program: baseProgram,
    isWorkout: false
  };
}
