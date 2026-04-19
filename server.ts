import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Route: chat
  app.post('/api/chat', async (req, res) => {
    console.log('[SERVER] Recieved chat request');
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

      // ==========================================
      // CASCATA DE DELEGAÇÃO (GROQ -> GEMINI -> OPENAI)
      // ==========================================
      
      // 1. TENTATIVA GROQ (Llama 3 - Ultra rápido, salva o Vercel Timeout)
      if (hasGroq && !parsed) {
        try {
          console.log('[SERVER] Calling Groq (Primary)...');
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
          console.log('[SERVER] Groq Success');
        } catch (e: any) {
          console.warn('[SERVER] Groq failed:', e.message);
          lastAiError = e.message;
        }
      }

      // 2. TENTATIVA GEMINI (Fallback 1)
      if (hasGemini && !parsed) {
        try {
          console.log('[SERVER] Calling Gemini (Fallback 1)...');
          const genAI = new GoogleGenAI({ apiKey: geminiApiKey });
          const response = await genAI.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${context}\n\nUser: ${prompt}` }] }],
            config: { temperature: 0.4, responseMimeType: 'application/json' }
          });
          text = response.text || '';
          parsed = JSON.parse(text);
          console.log('[SERVER] Gemini Success');
        } catch (e: any) {
          console.warn('[SERVER] Gemini failed:', e.message);
          lastAiError = e.message;
        }
      }

      // 3. TENTATIVA OPENAI (Fallback 2)
      if (hasOpenAI && !parsed) {
         try {
           console.log('[SERVER] Calling OpenAI (Fallback 2)...');
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
           console.log('[SERVER] OpenAI Success');
         } catch(e: any) {
           console.warn('[SERVER] OpenAI failed:', e.message);
           lastAiError = e.message;
         }
      }

      // ==========================================
      // TRATAMENTO DA RESPOSTA E OFFLINE INJECTION
      // ==========================================

      // Se todas as APIs caírem ou não tiver chaves
      if (!parsed) {
         console.error('[SERVER] All AI attempts failed. Generating Engine Offline Program.');
         parsed = generateRobustOfflineResponse(prompt, userProfile, currentProgram);
         if (lastAiError) parsed.text += `\n\n*(Aviso de Rede: ${lastAiError}. Módulo Bio-Mecânico Tático Acionado Offline)*`;
      }

      // Intersecção do "Expert Brain" da Aplicação com a resposta da IA
      if (parsed.isProgram && parsed.program) {
         parsed.program = validateProgram(parsed.program, userProfile);
      }
      if (parsed.isWorkout && parsed.workout) {
         parsed.workout = validateWorkout(parsed.workout, userProfile);
      }

      return res.json(parsed);

    } catch (error) {
      console.error('[SERVER] Chat error:', error);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  });

  // Helper Functions
  function analyzeProgress(checkins: any[], program: any) {
    if (!checkins || checkins.length === 0) {
      return { status: 'no_data', avgFatigue: '5', avgRPE: '5', recommendation: 'Continue com o programa atual.' };
    }
    const recent = checkins.slice(0, 5);
    const avgFatigue = recent.reduce((sum: number, c: any) => sum + (c.fatigue || 5), 0) / recent.length;
    const avgRPE = recent.reduce((sum: number, c: any) => sum + (c.rpe || 5), 0) / recent.length;
    const status = avgFatigue >= 7 ? 'overreaching' : (avgRPE <= 5 ? 'undertrained' : 'optimal');
    return { status, avgFatigue: avgFatigue.toFixed(1), avgRPE: avgRPE.toFixed(1), recommendation: 'Ajuste conforme necessário.' };
  }

  function determineResponseType(prompt: string, program: any, checkins: any[]) {
    const p = prompt.toLowerCase();
    if (p.includes('programa') || p.includes('treino semanal') || p.includes('gerar') || p.includes('montar')) return 'new_program';
    if (p.includes('atualizar') || p.includes('ajustar') || p.includes('evolu')) return 'update_program';
    return 'chat';
  }

  function buildSystemPrompt(type: string, analysis: any) {
    return `Você é o "Elite Coach V40+", uma Inteligência Artificial especializada em longevidade hipertrófica para HOMENS E MULHERES acima de 40 anos. Sua voz é motivadora, mas letalmente técnica, prudente e empática com as dores da idade. Seu lema é: "Construir músculos de pedra, protegendo articulações de vidro". Você não é engessado: uma semana pode ter 3 dias, 4 dias ou 7 dias de treino dependendo do tempo do aluno.

    REGRA DE OURO (Anamnese Estruturada e Obrigatória):
    Sempre que o usuário solicitar a criação de um novo programa de treino, VOCÊ ESTÁ PROIBIDO DE GERAR O TREINO IMEDIATAMENTE (NÃO envie isProgram = true). Antes de qualquer prescrição, você DEVE submetê-lo a uma "Anamnese Biomecânica e Fisiológica". Faça uma ou duas perguntas por vez para não sobrecarregar.
    
    A Anamnese DEVE cobrir, obrigatoriamente, os seguintes pilares antes da prescrição final:
    1. Gênero e Fisiologia Base (Homem/Mulher, ciclo hormonal - menopausa/andropausa).
    2. Histórico Ortopédico (Dores atuais em ombros, joelhos, lombar, pelve, cotovelos).
    3. Carga Horária e Equipamento (Quantos dias reais o aluno pode treinar na semana, quanto tempo e onde: Casa ou Academia).
    4. Objetivo Frontal (Densidade óssea, hipertrofia, emagrecimento).
    Somente quando tiver TODAS essas informações, você monta o protocolo DINÂMICO JSON devolvendo ("isProgram": true) com a exata quantia de 'days' que o aluno pediu, incluindo dias de descanso ('Rest').

    PILARES DE PRESCRIÇÃO (Após a Anamnese):
    1. Modulação de Gênero: Para mulheres pós-40 (menopausa), foque em exercícios estruturais que combatam a osteopenia e atrofia muscular (treino de força base). Para homens (andropausa), foque em volume denso para pico testosterona sem exaurir articulações nervosas.
    2. Dias e Volume Dinâmico: Se o aluno tiver apenas 3 dias, monte um Fullbody. Se tiver 5 dias, faça um Split. Responda com a exata quantidade de dias solicitados.
    3. Proteção Neural: Treinos com falhas controladas.

    O CÉREBRO BASE (Economia de Tokens e Metodologia):
    O sistema possui um Dicionário Cérebro com a execução física correta.
    **IDs Disponíveis Localmente:** 
    ["supino_reto_halteres", "supino_inclinado_halteres", "puxada_frente", "remada_curvada", "agachamento_livre", "agachamento_bulgaro", "leg_press", "terra_romeno", "mesa_flexora", "cadeira_extensora", "desenvolvimento_halteres", "elevacao_lateral", "rosca_direta", "triceps_corda", "panturrilha_em_pe", "prancha_abdominal"].
    
    Se você for prescrever um dos exercícios acima na Array, você NÃO PRECISA preencher os campos 'n', 'desc' ou 'mistakes'. Basta enviar o campo 'id' na propriedade e os demais dados numéricos (sets, reps, etc). Exemplo: {"id": "supino_reto_halteres", "sets": 3, "reps": "8-12", "t": 60, "bfr": false}. 
    Se o exercício não estiver na lista acima, gere o bloco completo.

    FORMATO DA RESPOSTA (JSON EXCLUSIVO):
    {
      "text": "Sua resposta com linguagem técnica enxuta (Markdown). Se estiver fazendo a anamnese, faça as perguntas aqui e deixe isProgram FALSE.",
      "isProgram": boolean (Apenas se ANAMNESE FOI CONCLUÍDA e VOCÊ TEM as informações. O Array de Days gerado abaixo deve bater com a disponibilidade do aluno!),
      "program": { 
        "name": "Nome do Programa", 
        "days": [
          { 
            "day": "Dia da Semana (Ex: Segunda-feira)", 
            "focus": "Foco muscular ou REST DAY", 
            "exercises": [
              { 
                "id": "OPCIONAL: ID da base de dados (remove as necessidades de detalhe)",
                "n": "Nome (Se não usar ID)", 
                "sets": 3, 
                "reps": "Range", 
                "t": 60, 
                "bfr": boolean, 
                "muscles": "Alvo", 
                "desc": ["Apenas se não obteve da base"], 
                "mistakes": ["Apenas se não obteve da base"] 
              }
            ] 
          }
        ], 
        "notes": ["Nota de técnica customizada (citando as dores e o gênero da pessoa)"] 
      },
      "isWorkout": boolean,
      "workout": null
    }`;
  }

  function buildContextBlock(prompt: string, profile: any, program: any, checkins: any[], analysis: any) {
    return `[USER PROFILE] ${JSON.stringify(profile)}
    [CURRENT PROGRAM] ${JSON.stringify(program)}
    [PROGRESS ANALYSIS] ${JSON.stringify(analysis)}
    [USER PROMPT] ${prompt}`;
  }

  function validateProgram(prog: any, profile: any) { 
    if (!prog.days) prog.days = [];
    // Fundir o programa da IA com o "Cérebro Base Dinâmico"
    prog.days.forEach((d: any) => {
       if (d.exercises && Array.isArray(d.exercises)) {
          d.exercises = d.exercises.map((ex: any) => {
             if (ex.id && EXPERT_BRAIN[ex.id]) {
                const dbEx = EXPERT_BRAIN[ex.id];
                return {
                   ...dbEx,
                   ...ex,
                   n: dbEx.n, // Always prioritize brain
                   desc: dbEx.desc,
                   mistakes: dbEx.mistakes,
                   muscles: dbEx.muscles || ex.muscles
                };
             }
             return ex;
          });
       }
    });

    return prog;
  }

  function validateWorkout(work: any, profile: any) { return work; }

  // Fallback Físico Sem Conexão ou Servidor Sobrecarregado
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
         notes: ["Programa gerado localmente pelo Motor Tático sem depender de rede neural.", "Concentre-se fortemente no TUT (Time under tension) de 3 segundos na fase excêntrica."]
       };
    }

    return {
      text: "Minhas conexões neurais globais caíram temporariamente. Estamos no banco de dados isolado do Vitalidade V40+. Mantendo a nossa consistência primária sob qualquer condição técnica. Acionei um protocolo base abaixo para não perdermos o dia.",
      isProgram: isWorkoutSearch,
      program: baseProgram,
      isWorkout: false
    };
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
