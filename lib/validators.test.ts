import { describe, it, expect } from 'vitest';
import {
  validatePrompt,
  validateUserName,
  validateAge,
  validateGender,
  validateChatRequest,
  sanitizeString,
  ValidationError,
} from './validators';

describe('Validadores', () => {
  describe('validatePrompt', () => {
    it('deve aceitar prompt válido', () => {
      const result = validatePrompt('Quero um programa de 5 dias');
      expect(result).toBe('Quero um programa de 5 dias');
    });

    it('deve rejeitar prompt vazio', () => {
      expect(() => validatePrompt('')).toThrow(ValidationError);
      expect(() => validatePrompt('   ')).toThrow(ValidationError);
    });

    it('deve rejeitar prompt não-string', () => {
      expect(() => validatePrompt(123 as any)).toThrow(ValidationError);
      expect(() => validatePrompt(null as any)).toThrow(ValidationError);
    });

    it('deve rejeitar prompt muito longo (>5000 caracteres)', () => {
      const longPrompt = 'a'.repeat(5001);
      expect(() => validatePrompt(longPrompt)).toThrow(ValidationError);
    });

    it('deve aceitar prompt no limite (5000 caracteres)', () => {
      const maxPrompt = 'a'.repeat(5000);
      expect(() => validatePrompt(maxPrompt)).not.toThrow();
    });

    it('deve remover espaços em branco desnecessários', () => {
      const result = validatePrompt('  Meu prompt  ');
      expect(result).toBe('Meu prompt');
    });
  });

  describe('validateUserName', () => {
    it('deve aceitar nome válido', () => {
      const result = validateUserName('João Silva');
      expect(result).toBe('João Silva');
    });

    it('deve retornar "Usuário" se nome não fornecido', () => {
      expect(validateUserName(null)).toBe('Usuário');
      expect(validateUserName(undefined)).toBe('Usuário');
      expect(validateUserName('')).toBe('Usuário');
    });

    it('deve remover caracteres perigosos', () => {
      const result = validateUserName('João<script>alert(1)</script>');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('deve rejeitar nome muito longo (>100 caracteres)', () => {
      const longName = 'a'.repeat(101);
      expect(() => validateUserName(longName)).toThrow(ValidationError);
    });

    it('deve aceitar nome no limite (100 caracteres)', () => {
      const maxName = 'a'.repeat(100);
      expect(() => validateUserName(maxName)).not.toThrow();
    });
  });

  describe('validateAge', () => {
    it('deve aceitar idade válida', () => {
      expect(validateAge(45)).toBe(45);
      expect(validateAge('45')).toBe(45);
    });

    it('deve retornar null se idade não fornecida', () => {
      expect(validateAge(null)).toBeNull();
      expect(validateAge(undefined)).toBeNull();
    });

    it('deve rejeitar idade menor que 18', () => {
      expect(() => validateAge(17)).toThrow(ValidationError);
    });

    it('deve rejeitar idade maior que 120', () => {
      expect(() => validateAge(121)).toThrow(ValidationError);
    });

    it('deve rejeitar valor não-numérico', () => {
      expect(() => validateAge('abc')).toThrow(ValidationError);
      expect(() => validateAge(NaN)).toThrow(ValidationError);
    });

    it('deve aceitar limites válidos (18 e 120)', () => {
      expect(validateAge(18)).toBe(18);
      expect(validateAge(120)).toBe(120);
    });
  });

  describe('validateGender', () => {
    it('deve aceitar gênero válido', () => {
      expect(validateGender('M')).toBe('M');
      expect(validateGender('male')).toBe('male');
      expect(validateGender('F')).toBe('F');
      expect(validateGender('Outro')).toBe('Outro');
    });

    it('deve retornar null se gênero não fornecido', () => {
      expect(validateGender(null)).toBeNull();
      expect(validateGender(undefined)).toBeNull();
    });

    it('deve rejeitar gênero inválido', () => {
      expect(() => validateGender('xyz')).toThrow(ValidationError);
    });

    it('deve rejeitar gênero não-string', () => {
      expect(() => validateGender(123 as any)).toThrow(ValidationError);
    });
  });

  describe('validateChatRequest', () => {
    it('deve aceitar request válido', () => {
      const request = {
        prompt: 'Quero um programa',
        userProfile: { name: 'João', age: 45, gender: 'M' },
      };

      const result = validateChatRequest(request);
      expect(result.prompt).toBe('Quero um programa');
      expect(result.userProfile.name).toBe('João');
      expect(result.userProfile.age).toBe(45);
    });

    it('deve rejeitar request sem prompt', () => {
      const request = {
        prompt: '',
        userProfile: { name: 'João' },
      };

      expect(() => validateChatRequest(request)).toThrow(ValidationError);
    });

    it('deve validar todos os campos do perfil', () => {
      const request = {
        prompt: 'Meu prompt',
        userProfile: {
          name: 'João Silva',
          age: 45,
          gender: 'M',
        },
      };

      const result = validateChatRequest(request);
      expect(result.userProfile.name).toBe('João Silva');
      expect(result.userProfile.age).toBe(45);
      expect(result.userProfile.gender).toBe('M');
    });

    it('deve aceitar request sem userProfile', () => {
      const request = {
        prompt: 'Meu prompt',
      };

      const result = validateChatRequest(request);
      expect(result.prompt).toBe('Meu prompt');
    });

    it('deve validar currentProgram se fornecido', () => {
      const request = {
        prompt: 'Meu prompt',
        userProfile: { name: 'João' },
        currentProgram: {
          name: 'Programa A',
          days: [],
        },
      };

      const result = validateChatRequest(request);
      expect(result.currentProgram).toBeDefined();
      expect(result.currentProgram?.name).toBe('Programa A');
    });

    it('deve validar recentCheckins se fornecido', () => {
      const request = {
        prompt: 'Meu prompt',
        userProfile: { name: 'João' },
        recentCheckins: [
          { fatigue: 7, rpe: 6, notes: 'Bom treino' },
          { fatigue: 5, rpe: 5, notes: 'Normal' },
        ],
      };

      const result = validateChatRequest(request);
      expect(result.recentCheckins).toBeDefined();
      expect(result.recentCheckins?.length).toBe(2);
      expect(result.recentCheckins?.[0].fatigue).toBe(7);
    });
  });

  describe('sanitizeString', () => {
    it('deve remover caracteres perigosos', () => {
      const dirty = 'Hello<script>alert("xss")</script>World';
      const clean = sanitizeString(dirty);
      expect(clean).not.toContain('<');
      expect(clean).not.toContain('>');
      expect(clean).not.toContain('"');
      expect(clean).toContain('Hello');
      expect(clean).toContain('World');
    });

    it('deve remover espaços desnecessários', () => {
      const result = sanitizeString('  Hello World  ');
      expect(result).toBe('Hello World');
    });

    it('deve retornar string vazia para input não-string', () => {
      expect(sanitizeString(null as any)).toBe('');
      expect(sanitizeString(undefined as any)).toBe('');
    });

    it('deve aceitar strings seguras', () => {
      const safe = 'João da Silva - 45 anos';
      const result = sanitizeString(safe);
      expect(result).toBe(safe);
    });
  });

  describe('ValidationError', () => {
    it('deve ser uma instância de Error', () => {
      const error = new ValidationError('Test error');
      expect(error).toBeInstanceOf(Error);
    });

    it('deve ter mensagem correta', () => {
      const error = new ValidationError('Test error message');
      expect(error.message).toBe('Test error message');
    });

    it('deve ter nome "ValidationError"', () => {
      const error = new ValidationError('Test');
      expect(error.name).toBe('ValidationError');
    });
  });
});
