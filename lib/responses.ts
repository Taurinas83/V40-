/**
 * Classes e interfaces para respostas padronizadas
 */

export interface ChatResponse {
  text: string;
  isProgram: boolean;
  program?: ProgramData;
  isWorkout: boolean;
  workout?: WorkoutData;
  _metadata?: {
    aiProvider: string;
    timestamp: string;
    responseTime: number;
  };
}

export interface ProgramData {
  name: string;
  days: ProgramDay[];
  notes?: string[];
}

export interface ProgramDay {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface Exercise {
  id?: string;
  n: string;
  sets: number;
  reps: string;
  t: number;
  bfr: boolean;
  muscles: string;
  desc?: string[];
  mistakes?: string[];
}

export interface WorkoutData {
  name?: string;
  exercises: Exercise[];
}

export interface ProgressAnalysis {
  status: 'no_data' | 'optimal' | 'undertrained' | 'overreaching';
  avgFatigue: string;
  avgRPE: string;
  recommendation: string;
}

/**
 * Classe de erro personalizado
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Erros específicos da aplicação
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Autenticação falhou') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Não autorizado') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class AIServiceError extends AppError {
  constructor(message: string = 'Serviço de IA indisponível') {
    super(message, 503, 'AI_SERVICE_ERROR');
    this.name = 'AIServiceError';
  }
}

/**
 * Cria resposta de sucesso do chat
 */
export function createChatResponse(
  response: Partial<ChatResponse>,
  provider: string,
  responseTime: number
): ChatResponse {
  return {
    text: response.text || '',
    isProgram: response.isProgram || false,
    program: response.program,
    isWorkout: response.isWorkout || false,
    workout: response.workout,
    _metadata: {
      aiProvider: provider,
      timestamp: new Date().toISOString(),
      responseTime,
    },
  };
}

/**
 * Cria resposta de offline
 */
export function createOfflineResponse(
  text: string,
  program?: ProgramData
): ChatResponse {
  return {
    text,
    isProgram: !!program,
    program,
    isWorkout: false,
    _metadata: {
      aiProvider: 'offline',
      timestamp: new Date().toISOString(),
      responseTime: 0,
    },
  };
}

/**
 * Cria resposta de erro genérica
 */
export function createErrorResponse(error: AppError) {
  return {
    error: error.message,
    code: error.code,
    statusCode: error.statusCode,
  };
}
