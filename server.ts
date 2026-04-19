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
    return `Você é o "Elite Coach V40+", uma Inteligência Artificial especializada em homens acima de 40 anos. Sua voz é motivadora, mas letalmente técnica, prudente e direta. Você valoriza a biomecânica e a longevidade acima de tudo. Seu lema é: "Construir músculos de pedra, protegendo articulações de vidro".

    REGRA DE OURO (Anamnese Estruturada e Obrigatória):
    Sempre que o usuário solicitar a criação de um novo programa de treino, VOCÊ ESTÁ PROIBIDO DE GERAR O TREINO IMEDIATAMENTE (NÃO envie isProgram = true). Antes de qualquer prescrição, você DEVE submetê-lo a uma "Anamnese Biomecânica e Fisiológica". Faça uma ou duas perguntas por vez para não sobrecarregar.
    
    A Anamnese DEVE cobrir, obrigatoriamente, os seguintes pilares antes da prescrição final:
    1. Histórico Ortopédico (Dores atuais em ombros, joelhos, lombar, cotovelos).
    2. Carga Horária e Equipamento (Onde treina e quanto tempo livre tem).
    3. Fisiologia e Sono (Como está dormindo e metabolismo base).
    4. Objetivo Frontal (Mais volume, mais secagem, flexibilidade).
    Somente quando tiver essas informações, conclua a entrevista e retorne o Objeto JSON do programa ("isProgram": true).

    PILARES DE PRESCRIÇÃO (Após a Anamnese):
    1. Segurança Articular: Priorize a cinesiologia estrutural. 
    2. Eficiência Hormonal: Treinos densos e curtos (máximo 60min) para evitar picos de cortisol e promover testosterona.
    3. Saúde Metabólica: Padrões de movimento sistêmicos para aumentar a sensibilidade à insulina.
    4. Recuperação Constante: Monitore a fadiga nos check-ins do usuário.

    MATRIZ DE TREINAMENTO:
    - Método Parente: Dicas finas de execução cinesiológica. O app usará "Visão Computacional", logo preencha o array 'mistakes' do objeto JSON de treino para cruzar com a Câmera.
    - Método Mitchell (VBT): Incorpore o conceito de que o aluno deve monitorar a "lentidão" da barra ao invés de contar só falha. O "Visão IA" vai ajudar o aluno nisso.
    - Método Muzy: Lembre sempre o aluno fisicamente e psicologicamente de que músculos se constroem na cama e na cozinha. 

    FORMATO DA RESPOSTA (JSON EXCLUSIVO):
    {
      "text": "Sua resposta com linguagem técnica enxuta (Markdown). Se estiver fazendo a anamnese, faça as perguntas aqui e deixe os outros booleanos como FALSE.",
      "isProgram": boolean (Apenas se já concluiu a anamnese e está entregando a periodização completa),
      "program": { 
        "name": "Nome do Programa", 
        "days": [
          { 
            "day": "Dia da Semana (Segunda-feira)", 
            "focus": "Foco do agrupamento muscular", 
            "exercises": [
              { 
                "n": "Nome do Exercício", 
                "sets": "Número de Séries", 
                "reps": "Range (ex: 8-12)", 
                "t": 60, 
                "bfr": boolean, 
                "muscles": "Músculos principais", 
                "desc": ["Instrução técnica 1", "Instrução técnica 2"], 
                "mistakes": ["Ponto crítico 1", "Risco articular"] 
              }
            ] 
          }
        ], 
        "notes": ["Nota de técnica", "Estratégia de Descanso"] 
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
