import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { config } from './lib/config';
import { initializeSentry, captureApiMetric, addBreadcrumb } from './lib/monitoring';
import { initializeDatabase, isDatabaseAvailable } from './lib/database';
import {
  helmetMiddleware,
  corsMiddleware,
  apiLimiter,
  authLimiter,
  authenticateToken,
  validateContentType,
  requestLogger,
  errorHandler,
  notFoundHandler
} from './lib/middleware';
import {
  validateChatRequest,
  ValidationError as InputValidationError
} from './lib/validators';
import {
  createChatResponse,
  createOfflineResponse,
  ChatResponse,
  AppError,
  AIServiceError
} from './lib/responses';
import { AIService, validateJSONResponse } from './lib/ai-service';
import {
  createToken,
  generateUserId,
  hashPassword,
  verifyPassword,
} from './lib/auth';
import {
  EXERCISE_DATABASE,
  enrichExerciseWithDefinition,
  getAvailableExerciseIds
} from './lib/exercise-db';
import {
  canHandleLocally,
  generateLocalResponse,
  UserProfile as LocalUserProfile,
} from './lib/local-brain/index';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // ==========================================
  // MONITORAMENTO E DATABASE
  // ==========================================
  initializeSentry();
  initializeDatabase();

  // ==========================================
  // MIDDLEWARE DE SEGURANÇA
  // ==========================================
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(requestLogger);
  app.use(validateContentType);
  app.use(express.json({ limit: '10mb' }));
  app.use(apiLimiter);

  // ==========================================
  // HEALTH CHECK
  // ==========================================
  app.get('/api/health', async (req: Request, res: Response) => {
    const dbAvailable = await isDatabaseAvailable();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      services: {
        gemini: !!config.apiKeys.gemini,
        groq: !!config.apiKeys.groq,
        openai: !!config.apiKeys.openai,
        supabase: dbAvailable,
      },
      version: '1.0.0',
    });
  });

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  app.post('/api/auth/register', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        throw new AppError('Email e senha obrigatórios', 400, 'MISSING_FIELDS');
      }

      if (password.length < 6) {
        throw new AppError('Senha deve ter pelo menos 6 caracteres', 400, 'WEAK_PASSWORD');
      }

      const userId = generateUserId();
      const hashedPassword = await hashPassword(password);

      // Aqui você salvaria no banco de dados
      // Por enquanto, apenas gera o token
      const token = createToken({
        id: userId,
        email,
        name: name || 'Usuário',
      });

      res.status(201).json({
        token,
        user: {
          id: userId,
          email,
          name: name || 'Usuário',
        },
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/login', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError('Email e senha obrigatórios', 400, 'MISSING_FIELDS');
      }

      // Simulação de autenticação (em produção, verificar no banco)
      const token = createToken({
        id: 'user_' + email,
        email,
        name: email.split('@')[0],
      });

      res.json({
        token,
        user: {
          id: 'user_' + email,
          email,
          name: email.split('@')[0],
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // ==========================================
  // API CHAT - PRINCIPAL
  // ==========================================
  app.post('/api/chat', async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    try {
      const validatedRequest = validateChatRequest(req.body);

      // ──────────────────────────────────────────────
      // LOCAL BRAIN — handles 90%+ of requests for free
      // ──────────────────────────────────────────────
      const userProfileForBrain: Partial<LocalUserProfile> = {
        objetivo:        validatedRequest.userProfile?.objetivo,
        nivel:           validatedRequest.userProfile?.nivel,
        diasDisponiveis: validatedRequest.userProfile?.diasDisponiveis,
        equipamento:     validatedRequest.userProfile?.equipamento,
        lesoes:          validatedRequest.userProfile?.lesoes,
        idade:           validatedRequest.userProfile?.age,
        genero:          validatedRequest.userProfile?.gender,
        nome:            validatedRequest.userProfile?.name,
      };

      if (canHandleLocally(validatedRequest.prompt, userProfileForBrain)) {
        const localResponse = generateLocalResponse(
          validatedRequest.prompt,
          userProfileForBrain,
          startTime
        );
        return res.json(localResponse);
      }
      // ──────────────────────────────────────────────

      const progressAnalysis = analyzeProgress(
        validatedRequest.recentCheckins || [],
        validatedRequest.currentProgram
      );
      const responseType = determineResponseType(
        validatedRequest.prompt,
        validatedRequest.currentProgram,
        validatedRequest.recentCheckins
      );

      const systemPrompt = buildSystemPrompt(responseType, progressAnalysis);
      const context = buildContextBlock(
        validatedRequest.prompt,
        validatedRequest.userProfile,
        validatedRequest.currentProgram,
        validatedRequest.recentCheckins || [],
        progressAnalysis
      );

      const aiService = new AIService(systemPrompt, context);
      const { text, provider } = await aiService.getResponse();

      // Valida e parseia JSON
      const parsed = validateJSONResponse(text);

      // Enriquece programa com dados da base
      if (parsed.isProgram && parsed.program) {
        parsed.program = enrichProgramWithDatabase(parsed.program);
      }

      const responseTime = Date.now() - startTime;
      const response = createChatResponse(parsed, provider, responseTime);

      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  // ==========================================
  // API AUXILIARES
  // ==========================================
  app.get('/api/exercises', (req: Request, res: Response) => {
    res.json({
      exercises: Object.entries(EXERCISE_DATABASE).map(([id, data]) => ({
        id,
        ...data,
      })),
    });
  });

  app.get('/api/exercises/:id', (req: Request, res: Response, next: NextFunction) => {
    const exercise = EXERCISE_DATABASE[req.params.id];
    if (!exercise) {
      return next(new AppError('Exercício não encontrado', 404, 'EXERCISE_NOT_FOUND'));
    }
    res.json({ id: req.params.id, ...exercise });
  });

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  function analyzeProgress(checkins: any[], program: any) {
    if (!checkins || checkins.length === 0) {
      return {
        status: 'no_data' as const,
        avgFatigue: '5',
        avgRPE: '5',
        recommendation: 'Continue com o programa atual.',
      };
    }

    const recent = checkins.slice(0, 5);
    const avgFatigue =
      recent.reduce((sum: number, c: any) => sum + (c.fatigue || 5), 0) / recent.length;
    const avgRPE =
      recent.reduce((sum: number, c: any) => sum + (c.rpe || 5), 0) / recent.length;

    const status =
      avgFatigue >= 7 ? ('overreaching' as const) :
      avgRPE <= 5 ? ('undertrained' as const) :
      ('optimal' as const);

    return {
      status,
      avgFatigue: avgFatigue.toFixed(1),
      avgRPE: avgRPE.toFixed(1),
      recommendation: 'Ajuste conforme necessário.',
    };
  }

  function determineResponseType(
    prompt: string,
    program: any,
    checkins: any[]
  ): string {
    const p = prompt.toLowerCase();
    if (
      p.includes('programa') ||
      p.includes('treino semanal') ||
      p.includes('gerar') ||
      p.includes('montar')
    ) {
      return 'new_program';
    }
    if (p.includes('atualizar') || p.includes('ajustar') || p.includes('evolu')) {
      return 'update_program';
    }
    return 'chat';
  }

  function buildSystemPrompt(type: string, analysis: any): string {
    const exerciseIds = getAvailableExerciseIds().join('", "');
    return `Você é o "Elite Coach V40+", uma Inteligência Artificial especializada em longevidade hipertrófica para HOMENS E MULHERES acima de 40 anos. Sua voz é motivadora, mas letalmente técnica, prudente e empática com as dores da idade. Seu lema é: "Construir músculos de pedra, protegendo articulações de vidro".

REGRA DE OURO (Anamnese Estruturada e Obrigatória):
Sempre que o usuário solicitar um novo programa, NÃO gere imediatamente (isProgram = false). Faça uma Anamnese Biomecânica:
1. Gênero e Fisiologia (menopausa/andropausa)
2. Histórico Ortopédico (dores atuais)
3. Disponibilidade (dias/semana, local)
4. Objetivo (hipertrofia, emagrecimento, densidade óssea)

Somente com TODAS as informações, monte o programa (isProgram = true).

EXERCÍCIOS DISPONÍVEIS: "${exerciseIds}"
Para exercícios na lista, envie apenas {"id": "...", "sets": X, "reps": "Y", "t": Z, "bfr": false}
Não preencha n, desc, mistakes para exercícios com ID.

RESPOSTA EM JSON:
{
  "text": "Análise técnica (Markdown)",
  "isProgram": boolean,
  "program": {"name": "...", "days": [...]},
  "isWorkout": false,
  "workout": null
}`;
  }

  function buildContextBlock(
    prompt: string,
    profile: any,
    program: any,
    checkins: any[],
    analysis: any
  ): string {
    return `[PERFIL] ${JSON.stringify(profile || {})}
[PROGRAMA_ATUAL] ${JSON.stringify(program || {})}
[ANÁLISE_PROGRESSO] ${JSON.stringify(analysis)}
[PERGUNTA] ${prompt}`;
  }

  function enrichProgramWithDatabase(program: any) {
    if (!program.days) program.days = [];

    program.days.forEach((day: any) => {
      if (day.exercises && Array.isArray(day.exercises)) {
        day.exercises = day.exercises.map((exercise: any) => {
          if (exercise.id) {
            return enrichExerciseWithDefinition(exercise);
          }
          return exercise;
        });
      }
    });

    return program;
  }

  // ==========================================
  // VITE MIDDLEWARE E STATIC FILES
  // ==========================================
  if (config.nodeEnv !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { maxAge: '1d' }));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // ==========================================
  // ERROR HANDLING
  // ==========================================
  app.use(notFoundHandler);
  app.use(errorHandler);

  // ==========================================
  // START SERVER
  // ==========================================
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`
🚀 Vitalidade 40+ Server iniciado
📍 URL: http://localhost:${config.port}
🔧 Ambiente: ${config.nodeEnv}
🔐 JWT Secret: ${config.jwtSecret === 'dev-secret-change-in-production' ? 'DEV (MUDE EM PRODUÇÃO!)' : 'Configurado'}
🧠 Cérebro Local: ✓ (zero custo de API)
🤖 APIs Disponíveis:
  - Groq:   ${config.apiKeys.groq ? '✓' : '✗'}
  - Gemini: ${config.apiKeys.gemini ? '✓' : '✗'}
  - OpenAI: ${config.apiKeys.openai ? '✓' : '✗'}
  - Ollama: ${config.ollama.enabled ? `✓ (${config.ollama.model})` : '✗ (OLLAMA_ENABLED=true para ativar)'}
    `);
  });
}

startServer().catch((error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
  process.exit(1);
});
