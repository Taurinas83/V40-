# 🧪 Guia de Testes - Vitalidade 40+

Documentação completa sobre testes unitários com Vitest.

---

## 🚀 Quickstart

```bash
# Rodar todos os testes
npm run test

# Modo watch (re-rodar ao salvar)
npm run test:watch

# Com UI interativa
npm run test:ui

# Com cobertura de código
npm run test:coverage
```

---

## 📊 Estrutura de Testes

```
lib/
├── validators.ts         (Validação)
├── validators.test.ts    (Testes de validação)
├── auth.ts              (Autenticação)
├── auth.test.ts         (Testes de auth)
└── database.ts          (Banco de dados)
```

---

## ✍️ Escrevendo Testes

### Estrutura Básica

```typescript
import { describe, it, expect } from 'vitest';

describe('Meu Módulo', () => {
  it('deve fazer algo', () => {
    const result = meuFuncao();
    expect(result).toBe('esperado');
  });

  it('deve rejeitar entrada inválida', () => {
    expect(() => meuFuncao(null)).toThrow();
  });
});
```

### Assertions Comuns

```typescript
// Igualdade
expect(value).toBe(5);
expect(value).toEqual({ id: 1 });

// Verdadeiro/Falso
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Nulos
expect(value).toBeNull();
expect(value).toBeDefined();

// Arrays/Strings
expect(arr).toContain('item');
expect(str).toMatch(/pattern/);

// Funções
expect(() => fn()).toThrow();
expect(fn).toHaveBeenCalled();

// Números
expect(value).toBeGreaterThan(5);
expect(value).toBeLessThan(10);
expect(value).toBeCloseTo(3.14);
```

---

## 🔧 Hooks e Setup

```typescript
import { describe, it, expect, beforeAll, afterEach } from 'vitest';

describe('Com Setup', () => {
  let db: Database;

  beforeAll(() => {
    // Executado uma vez antes dos testes
    db = new Database();
  });

  afterEach(() => {
    // Executado após cada teste
    db.clear();
  });

  it('teste 1', () => {
    // Usa db
  });

  it('teste 2', () => {
    // Usa db limpo
  });
});
```

---

## 🎯 Testes Implementados

### 1. Validadores (validators.test.ts)

✅ **validatePrompt**
- Aceita prompt válido
- Rejeita vazio
- Rejeita muito longo (>5000 chars)
- Remove espaços extras

✅ **validateUserName**
- Aceita nome válido
- Retorna "Usuário" se vazio
- Remove caracteres perigosos
- Limita a 100 caracteres

✅ **validateAge**
- Aceita idade 18-120
- Retorna null se não fornecida
- Rejeita inválida

✅ **validateGender**
- Aceita gêneros válidos
- Retorna null se não fornecido

✅ **validateChatRequest**
- Valida request completo
- Valida todos os campos

✅ **sanitizeString**
- Remove caracteres perigosos
- Remove espaços extras

### 2. Autenticação (auth.test.ts)

✅ **generateUserId**
- Gera IDs únicos
- Retorna string válida

✅ **hashPassword**
- Faz hash seguro
- Hash diferente para mesma senha
- Determinístico na verificação

✅ **verifyPassword**
- Verifica senha correta
- Rejeita senha incorreta
- Case-sensitive

✅ **createToken**
- Cria JWT válido
- Inclui dados do usuário
- Formato correto (3 partes)

✅ **verifyToken**
- Verifica token válido
- Retorna null para token inválido
- Inclui timestamps (iat/exp)

✅ **extractTokenFromHeader**
- Extrai token do header "Bearer"
- Rejeita formato inválido
- Case-insensitive para "Bearer"

---

## 📈 Cobertura de Código

### Objetivo de Cobertura

```
Lines: 70%
Functions: 70%
Branches: 70%
Statements: 70%
```

### Ver Cobertura

```bash
npm run test:coverage
# Gera HTML em: coverage/index.html
```

### Interpretar Relatório

```
Green: Bem testado (>80%)
Yellow: Parcialmente testado (50-80%)
Red: Pouco testado (<50%)
```

---

## 🔍 Debugging Testes

### Rodar Teste Específico

```bash
# Por arquivo
npm run test validators.test.ts

# Por nome (usa regex)
npm run test -- -t "validatePrompt"

# Por suite
npm run test -- -t "Validadores"
```

### Com Logs

```typescript
it('teste com log', () => {
  console.log('Valor:', value);
  expect(value).toBe(5);
});

// Rodar com:
npm run test -- --reporter=verbose
```

### Debug Interativo

```bash
# Abre Node debugger
node --inspect node_modules/vitest/vitest.mjs
```

---

## 📝 Testes para Novas Features

### Template para Novo Módulo

```typescript
// novo-modulo.test.ts
import { describe, it, expect } from 'vitest';
import { minhaFuncao } from './novo-modulo';

describe('Meu Novo Módulo', () => {
  describe('minhaFuncao', () => {
    it('deve retornar valor esperado', () => {
      const result = minhaFuncao('entrada');
      expect(result).toBe('saída');
    });

    it('deve validar entrada', () => {
      expect(() => minhaFuncao(null)).toThrow();
    });

    it('deve lidar com casos extremos', () => {
      expect(minhaFuncao('')).toBeDefined();
      expect(minhaFuncao('a'.repeat(1000))).toBeDefined();
    });
  });
});
```

### Checklist de Cobertura

- [ ] Função principal testada
- [ ] Casos de sucesso cobertos
- [ ] Casos de erro testados
- [ ] Limites testados (min/max)
- [ ] Edge cases considerados
- [ ] Cobertura > 70%

---

## 🚀 Testes em CI/CD

Os testes rodamautomaticamente em GitHub Actions:

1. Node 18.x e 20.x
2. Lint + Type checking
3. Testes unitários
4. Upload de cobertura

```bash
# Visualizar na aba "Actions" do GitHub
# https://github.com/seu-usuario/v40-/actions
```

---

## 🐛 Troubleshooting

### "Cannot find module"
```bash
npm install
npm run test
```

### "Timeout exceeded"
```typescript
it('teste lento', async () => {
  // ...
}, 10000); // 10 segundos
```

### "ReferenceError: document is not defined"
```typescript
// Use environment: 'jsdom' no vitest.config.ts para testes DOM
```

---

## 📚 Referências

- [Vitest Docs](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [Jest Matchers](https://vitest.dev/api/expect.html)

---

**Status**: ✅ Testes implementados e documentados
