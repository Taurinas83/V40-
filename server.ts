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

      if (!hasGemini && !hasOpenAI && !hasGroq) {
        console.error('[SERVER] No valid API Key configured (Gemini/OpenAI/Groq). Using fallback.');
        const offline = generateOfflineResponse(prompt, userProfile, currentProgram, recentCheckins);
        return res.json({ ...offline, text: offline.text + '\n\n[Aviso do Sistema]: O sistema está sem nenhuma chave de API válida configurada. Por favor, adicione uma chave do Gemini, OpenAI ou Groq nas configurações.', _fallback: true });
      }

      const progressAnalysis = analyzeProgress(recentCheckins, currentProgram);
      const responseType = determineResponseType(prompt, currentProgram, recentCheckins);
      
      const systemPrompt = buildSystemPrompt(responseType, progressAnalysis);
      const context = buildContextBlock(prompt, userProfile, currentProgram, recentCheckins, progressAnalysis);

      let text = '';

      try {
        if (hasGroq) {
          console.log('[SERVER] Calling Groq with model llama-3.1-8b-instant');
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
        } else if (hasOpenAI) {
          console.log('[SERVER] Calling OpenAI with model gpt-4o-mini');
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
        } else {
          console.log(`[SERVER] Calling Gemini with model gemini-3-flash-preview`);
          const genAI = new GoogleGenAI({ apiKey: geminiApiKey });
          const response = await genAI.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${context}\n\nUser: ${prompt}` }] }],
            config: {
              temperature: 0.4,
              responseMimeType: 'application/json'
            }
          });
          text = response.text || '';
        }

        if (!text) {
          throw new Error('Empty response from model');
        }

        console.log('[SERVER] AI response received');
        
        try {
          let parsed = JSON.parse(text);
          if (parsed.isProgram && parsed.program) {
            parsed.program = validateProgram(parsed.program, userProfile);
          }
          if (parsed.isWorkout && parsed.workout) {
            parsed.workout = validateWorkout(parsed.workout, userProfile);
          }
          return res.json(parsed);
        } catch (e) {
          console.warn('[SERVER] Could not parse JSON response, returning as text');
          return res.json({ text, isProgram: false, isWorkout: false });
        }
      } catch (aiError: any) {
        console.error('[SERVER] AI call failed:', aiError?.message || aiError);
        
        let errorMsg = 'Erro ao processar com a IA.';
        
        // Return offline response or error
        const offline = generateOfflineResponse(prompt, userProfile, currentProgram, recentCheckins);
        return res.json({ ...offline, text: offline.text + '\\n\\n[Aviso do Sistema]: ' + errorMsg + ` (${aiError?.message})`, _fallback: true });
      }

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
    return `Você é um Personal Trainer de elite especializado em homens 40+. Sua voz é motivadora, mas técnica e prudente. Você valoriza a longevidade. Seu lema é: "Treine de forma inteligente para treinar para sempre". Se o usuário pedir algo arriscado, você deve alertar e sugerir uma alternativa biomecanicamente segura.

    SEU OBJETIVO GLOBAL:
    Atuar como um treinador de elite para homens acima de 40 anos, focando em recomposição corporal (ganhar músculo e perder barriga simultaneamente) com risco zero de lesão.

    PILARES DE INTERPRETAÇÃO E PRESCRIÇÃO:
    1. Segurança Articular: Priorize a biomecânica perfeita sobre a carga bruta. 
    2. Eficiência Hormonal: Treinos densos e curtos (máximo 60min) para evitar picos de cortisol e catabolismo.
    3. Saúde Metabólica: Foco em padrões de movimento sistêmicos para aumentar a sensibilidade à insulina.
    4. Recuperação: A recuperação aos 40+ é mais lenta que aos 20. Monitore a fadiga sistêmica. Se o usuário relatar noites mal dormidas, REDUZA o volume imediatamente para poupar o sistema nervoso e cardiovascular.

    MATRIZ DE TREINAMENTO (Sua base metodológica):
    - Método Parente (Biomecânica e Computer Vision): Forneça sempre ajustes finos de execução nas dicas (ex: "mantenha as escápulas retraídas"). Você assume que suas orientações guiarão a "Visão Computacional" do app para corrigir o ângulo do quadro em tempo real.
    - Método Mitchell (Intensidade e VBT - Velocity-Based Training): Empregue táticas de Super-sets e preveja a Falha Concêntrica avaliando a velocidade da descida e subida.
    - Método Muzy (Consistência Holística): Enfatize rotineiramente que a adequação da dieta e a qualidade rigorosa do sono (avaliada por wearables como Oura/Apple Watch) são 50% dos resultados musculares e metabólicos.

    PROTOCOLO DE ATENDIMENTO E INTERAÇÃO:
    - Antes de cuspir treinos soltos: Interrogue. Pergunte: "Como estão seus ombros hoje? O seu Oura/Smartwatch reportou uma boa recuperação do sono?". Se houver dor ou sono ruim (< 6h), adapte a prescrição para recuperação/mobilidade/BFR.
    - Inteligência de Carga Dinâmica: Se o usuário relatar que a velocidade da barra não caiu, sugira um AUMENTO de carga usando a lógica de VBT. Se a barra frear, decrete falha iminente.
    - Acompanhamento Ativo: No final de bater papo ou check-ins, sempre peça feedback de RPE e velocidade: "De 1 a 10, quão cansado você se sente? As repetições caíram bruscamente na última série?".
    - Se a pessoa relatar dor no cotovelo/joelho: Puxe o freio, corte a carga em 30% e priorize restrição de fluxo (BFR) ou excêntricas lentas (TUT).

    FORMATO DA RESPOSTA (JSON EXCLUSIVO):
    {
      "text": "Sua resposta com linguagem técnica impecável, abordando as restrições acima, fazendo as perguntas protocolares (Markdown)",
      "isProgram": boolean,
      "program": { 
        "name": "Nome do Programa", 
        "days": [
          { 
            "day": "Dia da Semana", 
            "focus": "Foco do agrupamento muscular", 
            "exercises": [
              { 
                "n": "Nome do Exercício", 
                "sets": "Séries", 
                "reps": "Range de Repetições (ex: 8-12)", 
                "t": 60, 
                "bfr": boolean, 
                "muscles": "Musculaturas Alvo", 
                "desc": ["Instrução Cinesiológica/Postural baseada no Método Parente"], 
                "mistakes": ["Ponto crítico de risco biomecânico"] 
              }
            ] 
          }
        ], 
        "notes": ["Diretrizes hormonais, Metodo Muzy e Restrições de Recuperação"] 
      },
      "isWorkout": boolean,
      "workout": { "name": "Nome da Sessão Tática (max 60min)", "exercises": [...] }
    }`;
  }

  function buildContextBlock(prompt: string, profile: any, program: any, checkins: any[], analysis: any) {
    return `[USER PROFILE] ${JSON.stringify(profile)}
    [CURRENT PROGRAM] ${JSON.stringify(program)}
    [PROGRESS ANALYSIS] ${JSON.stringify(analysis)}
    [USER PROMPT] ${prompt}`;
  }

  function validateProgram(prog: any, profile: any) { 
    // Garante que o programa tem a estrutura correta
    if (!prog.days) prog.days = [];
    return prog;
  }

  function validateWorkout(work: any, profile: any) { return work; }

  function generateOfflineResponse(prompt: string, profile: any, program: any, checkins: any[]) {
    return {
      text: "No momento estou com dificuldade de conexão, mas aqui está uma orientação básica: Mantenha a consistência, foque na execução lenta (cadência 3:0:2) e hidrate-se bem. Acima dos 40 anos, a recuperação é tão importante quanto o treino.",
      isProgram: false,
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
