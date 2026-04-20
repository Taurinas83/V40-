/**
 * Configurações centralizadas e validação de variáveis de ambiente
 */

export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  jwtSecret: string;
  apiKeys: {
    gemini: string | null;
    openai: string | null;
    groq: string | null;
  };
  cors: {
    origin: string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  auth: {
    tokenExpiry: string;
    bcryptRounds: number;
  };
}

function getEnvVar(key: string, defaultValue?: string, required = false): string {
  const value = process.env[key] || defaultValue;
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
}

export function loadConfig(): AppConfig {
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  const isDev = nodeEnv === 'development';

  // JWT Secret - obrigatório em produção
  const jwtSecret = getEnvVar('JWT_SECRET', 'dev-secret-change-in-production', !isDev);

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv,
    jwtSecret,
    apiKeys: {
      gemini: getEnvVar('GEMINI_API_KEY') || null,
      openai: getEnvVar('OPENAI_API_KEY') || null,
      groq: getEnvVar('GROQ_API_KEY') || null,
    },
    cors: {
      origin: (process.env.CORS_ORIGIN || (isDev ? '*' : 'https://yourdomain.com')).split(','),
      credentials: true,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      maxRequests: isDev ? 1000 : 100, // Mais permissivo em dev
    },
    auth: {
      tokenExpiry: '7d',
      bcryptRounds: 10,
    },
  };
}

export const config = loadConfig();
