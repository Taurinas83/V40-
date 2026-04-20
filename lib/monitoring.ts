import * as Sentry from '@sentry/node';
import { config } from './config';

/**
 * Inicializa Sentry para monitoramento de erros
 */
export function initializeSentry(): void {
  const sentryDsn = process.env.SENTRY_DSN;

  if (!sentryDsn) {
    console.log('[Sentry] Não configurado. Monitoramento desativado.');
    return;
  }

  try {
    Sentry.init({
      dsn: sentryDsn,
      environment: config.nodeEnv,
      tracesSampleRate: config.nodeEnv === 'production' ? 0.1 : 1.0,
      maxBreadcrumbs: 50,
      attachStacktrace: true,
      beforeSend(event: any) {
        // Filtrar eventos sensíveis
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
        return event;
      },
    });

    console.log('[Sentry] Inicializado com sucesso');
  } catch (error) {
    console.warn('[Sentry] Erro ao inicializar:', error);
  }
}

/**
 * Captura exceção e envia para Sentry
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
}

/**
 * Captura mensagem de erro
 */
export function captureMessage(message: string, level: 'fatal' | 'error' | 'warning' | 'info' = 'error'): void {
  Sentry.captureMessage(message, level);
}

/**
 * Define informações de usuário no Sentry
 */
export function setUserContext(userId: string, email?: string, name?: string): void {
  Sentry.setUser({
    id: userId,
    email,
    username: name,
  });
}

/**
 * Limpa contexto de usuário
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Adiciona breadcrumb para rastreamento
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  data?: Record<string, any>
): void {
  Sentry.captureMessage(message, level);
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Rastreia performance
 */
export function startPerformanceTrace(name: string): () => void {
  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;
    addBreadcrumb(`${name} completado em ${duration.toFixed(2)}ms`, 'performance', 'info', {
      duration,
    });
  };
}

/**
 * Middleware Express para Sentry (opcional)
 */
export function sentryRequestHandler() {
  return (req: any, res: any, next: any) => {
    try {
      next();
    } catch (error) {
      Sentry.captureException(error);
      next(error);
    }
  };
}

/**
 * Função para capturar API response times
 */
export function captureApiMetric(
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number
): void {
  addBreadcrumb(
    `${method} ${endpoint}`,
    'http',
    statusCode >= 400 ? 'warning' : 'info',
    {
      statusCode,
      duration,
      endpoint,
      method,
    }
  );
}

/**
 * Log estruturado com Sentry
 */
export function logWithContext(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' = 'info',
  context?: Record<string, any>
): void {
  if (context) {
    Sentry.setContext('log', context);
  }

  switch (level) {
    case 'fatal':
    case 'error':
      console.error(message, context);
      captureMessage(message, level);
      break;
    case 'warning':
      console.warn(message, context);
      captureMessage(message, level);
      break;
    case 'info':
      console.log(message, context);
      break;
  }
}
