import { describe, it, expect, beforeAll } from 'vitest';
import {
  generateUserId,
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
  extractTokenFromHeader,
} from './auth';

describe('Autenticação', () => {
  describe('generateUserId', () => {
    it('deve gerar ID único', () => {
      const id1 = generateUserId();
      const id2 = generateUserId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('deve retornar string válida', () => {
      const id = generateUserId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('hashPassword', () => {
    it('deve fazer hash de senha', async () => {
      const password = 'minha-senha-secreta';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('deve gerar hash diferente para mesma senha', async () => {
      const password = 'minha-senha';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('deve ser determinístico na verificação', async () => {
      const password = 'senha-teste';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });
  });

  describe('verifyPassword', () => {
    let hash: string;

    beforeAll(async () => {
      hash = await hashPassword('senha-correta');
    });

    it('deve verificar senha correta', async () => {
      const isValid = await verifyPassword('senha-correta', hash);
      expect(isValid).toBe(true);
    });

    it('deve rejeitar senha incorreta', async () => {
      const isValid = await verifyPassword('senha-errada', hash);
      expect(isValid).toBe(false);
    });

    it('deve ser case-sensitive', async () => {
      const isValid = await verifyPassword('SENHA-CORRETA', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('createToken', () => {
    it('deve criar token válido', () => {
      const user = {
        id: 'user-123',
        email: 'teste@example.com',
        name: 'João',
      };

      const token = createToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT tem 3 partes
    });

    it('deve incluir dados do usuário no token', () => {
      const user = {
        id: 'user-456',
        email: 'joao@example.com',
        name: 'João Silva',
      };

      const token = createToken(user);
      const decoded = verifyToken(token);

      expect(decoded?.id).toBe(user.id);
      expect(decoded?.email).toBe(user.email);
      expect(decoded?.name).toBe(user.name);
    });

    it('deve ser determinístico para mesmo usuário', () => {
      const user = {
        id: 'user-789',
        email: 'test@example.com',
        name: 'Test User',
      };

      const token1 = createToken(user);
      const token2 = createToken(user);

      // Tokens diferentes por causa do timestamp (iat), mas decodificam igual
      const decoded1 = verifyToken(token1);
      const decoded2 = verifyToken(token2);

      expect(decoded1?.id).toBe(decoded2?.id);
      expect(decoded1?.email).toBe(decoded2?.email);
    });
  });

  describe('verifyToken', () => {
    let validToken: string;

    beforeAll(() => {
      validToken = createToken({
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test',
      });
    });

    it('deve verificar token válido', () => {
      const decoded = verifyToken(validToken);

      expect(decoded).toBeDefined();
      expect(decoded?.id).toBe('test-user');
      expect(decoded?.email).toBe('test@example.com');
    });

    it('deve retornar null para token inválido', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it('deve retornar null para token mal-formado', () => {
      const malformed = 'não-é-um-jwt';
      const decoded = verifyToken(malformed);

      expect(decoded).toBeNull();
    });

    it('deve incluir timestamp (iat) e expiração (exp)', () => {
      const decoded = verifyToken(validToken);

      expect(decoded?.iat).toBeDefined();
      expect(decoded?.exp).toBeDefined();
      expect(decoded?.exp).toBeGreaterThan(decoded?.iat || 0);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('deve extrair token válido do header', () => {
      const token = createToken({
        id: 'user',
        email: 'test@example.com',
        name: 'Test',
      });
      const header = `Bearer ${token}`;

      const extracted = extractTokenFromHeader(header);

      expect(extracted).toBe(token);
    });

    it('deve retornar null se header não fornecido', () => {
      const extracted = extractTokenFromHeader();

      expect(extracted).toBeNull();
    });

    it('deve retornar null se header vazio', () => {
      const extracted = extractTokenFromHeader('');

      expect(extracted).toBeNull();
    });

    it('deve rejeitar formato inválido (sem "Bearer")', () => {
      const token = 'algum-token-aqui';
      const extracted = extractTokenFromHeader(token);

      expect(extracted).toBeNull();
    });

    it('deve ser case-insensitive para "Bearer"', () => {
      const token = 'algum-token';
      const header = `bearer ${token}`;

      const extracted = extractTokenFromHeader(header);

      expect(extracted).toBe(token);
    });

    it('deve rejeitar múltiplas partes (mais de 2)', () => {
      const header = 'Bearer token com espaço extra';

      const extracted = extractTokenFromHeader(header);

      expect(extracted).toBeNull();
    });

    it('deve aceitar token com pontos (JWT válido)', () => {
      const token = createToken({
        id: 'user',
        email: 'test@example.com',
        name: 'Test',
      });
      const header = `Bearer ${token}`;

      const extracted = extractTokenFromHeader(header);

      expect(extracted).toBe(token);
      expect(extracted?.split('.').length).toBe(3);
    });
  });
});
