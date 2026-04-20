import '@testing-library/jest-dom';
import { expect, afterEach, beforeEach, vi } from 'vitest';

// Limpar localStorage e sessionStorage após cada teste (browser envs only)
afterEach(() => {
  if (typeof localStorage !== 'undefined') localStorage.clear();
  if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
});

// Mock de variáveis de ambiente
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.NODE_ENV = 'test';

// Suppressões de console para testes
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.error = vi.fn((...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Not implemented') ||
        args[0].includes('NaN') ||
        args[0].includes('TypeError'))
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  });

  console.warn = vi.fn((...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning')
    ) {
      return;
    }
    originalConsoleWarn.call(console, ...args);
  });
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
