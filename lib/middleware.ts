import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { config } from './config';
import { verifyToken, extractTokenFromHeader } from './auth';
import { AppError } from './responses';

/**
 * Middleware Helmet para segurança HTTP headers
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * Middleware CORS configurado
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);

    // Permitir origins configurados
    if (config.cors.origin.includes('*') || config.cors.origin.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 horas
});

/**
 * Rate limiting para API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Muitas requisições. Tente novamente mais tarde.',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
  },
  standardHeaders: true, // Retorna RateLimit headers
  skip: (req) => {
    // Skip rate limiting em desenvolvimento
    return config.nodeEnv === 'development';
  },
});

/**
 * Rate limiting mais restritivo para auth
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas por IP
  message: {
    error: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  skip: (req) => {
    return config.nodeEnv === 'development';
  },
});

/**
 * Middleware para autenticação via JWT
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    res.status(401).json({
      error: 'Token não fornecido',
      code: 'MISSING_TOKEN',
    });
    return;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({
      error: 'Token inválido ou expirado',
      code: 'INVALID_TOKEN',
    });
    return;
  }

  // Adiciona user ao request
  (req as any).user = decoded;
  next();
}

/**
 * Middleware para validação de Content-Type
 */
export function validateContentType(req: Request, res: Response, next: NextFunction): void {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      res.status(415).json({
        error: 'Content-Type deve ser application/json',
        code: 'INVALID_CONTENT_TYPE',
      });
      return;
    }
  }
  next();
}

/**
 * Middleware para sanitizar headers suspeitos
 */
export function sanitizeHeaders(req: Request, res: Response, next: NextFunction): void {
  // Remove headers potencialmente perigosos
  delete req.headers['x-forwarded-proto'];
  delete req.headers['x-forwarded-for'];

  next();
}

/**
 * Middleware de logging de requisições
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  // Logging no fim da resposta
  res.on('finish', () => {
    const duration = Date.now() - start;
    const user = (req as any).user?.id || 'anonymous';

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        user,
        ip: req.ip,
      })
    );
  });

  next();
}

/**
 * Middleware para tratamento de erros global
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', {
    timestamp: new Date().toISOString(),
    message: err.message,
    code: (err as AppError).code,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  } else {
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * Middleware para 404
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    code: 'NOT_FOUND',
  });
}
