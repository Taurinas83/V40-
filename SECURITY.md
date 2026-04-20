# 🔐 Guia de Segurança - Vitalidade 40+

## Visão Geral

Este documento descreve as medidas de segurança implementadas no Vitalidade 40+ e como configurá-las para produção.

---

## ✅ Implementações de Segurança

### 1. **Autenticação JWT**

O app usa JWT (JSON Web Tokens) para autenticação stateless:

```typescript
// Login
POST /api/auth/login
Body: { "email": "user@example.com", "password": "senha123" }

// Resposta
{
  "token": "eyJhbGc...",
  "user": { "id": "...", "email": "user@example.com", "name": "João" }
}

// Uso em requisições
Authorization: Bearer eyJhbGc...
```

**Configuração em Produção:**
```bash
JWT_SECRET="gera-uma-string-aleatoria-forte-de-32-caracteres-aqui"
```

Use ferramentas como:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 2. **Validação Robusta de Entrada**

Todas as requisições são validadas:

| Campo | Limite | Regra |
|-------|--------|-------|
| `prompt` | 5000 caracteres | String não-vazia |
| `name` | 100 caracteres | Sem caracteres perigosos |
| `age` | 18-120 | Número inteiro |
| `fatigue` | 1-10 | Número válido |
| `rpe` | 1-10 | Número válido |

**Exemplo de validação:**
```typescript
// Rejeitado
{ "prompt": "<script>alert('xss')</script>" }

// Aceito
{ "prompt": "Quero um programa de 5 dias" }
```

---

### 3. **CORS (Cross-Origin Resource Sharing)**

Controla quais domínios podem acessar a API:

```bash
# Desenvolvimento (permitir todos)
CORS_ORIGIN=*

# Produção (apenas seu domínio)
CORS_ORIGIN=https://app.vitalidade40.com,https://www.vitalidade40.com
```

---

### 4. **Rate Limiting**

Proteção contra abuso e DDoS:

| Endpoint | Limite | Janela |
|----------|--------|--------|
| `/api/chat` | 100 req/IP | 15 min |
| `/api/auth/*` | 5 req/IP | 15 min |

Em desenvolvimento: limiters desativados

```bash
# Excedeu limite?
Status: 429 Too Many Requests
Message: "Muitas requisições. Tente novamente mais tarde."
```

---

### 5. **Helmet.js - Security Headers**

Headers HTTP de segurança automáticos:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
...
```

---

### 6. **Nenhuma API Key Hardcoded**

❌ **ANTES (Inseguro):**
```javascript
const GEMINI_API_KEY = "AIzaSyBEo-dFxK_Mhzc3E9OS6..."; // Exposado!
```

✅ **DEPOIS (Seguro):**
```typescript
const geminiKey = process.env.GEMINI_API_KEY; // De variável de ambiente
```

**Arquivo problemático deletado:** `api_chat_source.js` ❌

---

### 7. **Logging Estruturado**

Requisições são logadas com estrutura JSON:

```json
{
  "timestamp": "2026-04-20T10:30:45.123Z",
  "method": "POST",
  "path": "/api/chat",
  "statusCode": 200,
  "duration": "245ms",
  "user": "user_12345",
  "ip": "192.168.1.100"
}
```

Útil para auditoria e debugging.

---

## ⚠️ Checklist de Produção

Antes de lançar em produção, certifique-se de:

- [ ] JWT_SECRET alterado para valor aleatório forte
- [ ] NODE_ENV=production
- [ ] CORS_ORIGIN configurado para domínios válidos
- [ ] Todas as API keys preenchidas (ou serviços de fallback ativados)
- [ ] HTTPS/TLS configurado no servidor
- [ ] Rate limiting ativado (não em dev)
- [ ] Logs sendo armazenados seguramente
- [ ] Backup automático de dados de usuários
- [ ] Monitoramento de erros ativado
- [ ] SSL/TLS certificate renovação automática

---

## 🔑 Gerenciamento de Secrets

### Vercel Environment Variables

```bash
vercel env add JWT_SECRET
vercel env add GEMINI_API_KEY
vercel env add OPENAI_API_KEY
vercel env add GROQ_API_KEY
vercel env add CORS_ORIGIN
```

### GitHub Secrets (para CI/CD)

```bash
gh secret set JWT_SECRET --body "seu-valor-aqui"
gh secret set GEMINI_API_KEY --body "seu-valor-aqui"
```

### Variáveis locais (.env.local)

```bash
# NUNCA commite isto no git!
# Adicione no .gitignore:
.env.local
.env.*.local
```

---

## 🛡️ Proteção Contra Ataques Comuns

### 1. SQL Injection
✅ **Protegido:** Não usamos SQL direto (sem banco de dados tradicional)

### 2. XSS (Cross-Site Scripting)
✅ **Protegido:** 
- Validação remove `<>` e `"'` de entradas
- CSP headers restringem scripts
- React escapa automaticamente strings

### 3. CSRF (Cross-Site Request Forgery)
✅ **Protegido:** SameSite cookies + validação de origin

### 4. Rate Limiting
✅ **Protegido:** Limite de requisições por IP

### 5. Brute Force
✅ **Protegido:** Rate limit agressivo em `/api/auth/*` (5 tentativas/15min)

### 6. API Key Exposure
✅ **Protegido:** Nenhuma chave em código-fonte

---

## 🔍 Auditoria de Segurança

### Verificar Configuração

```bash
# Health check
curl http://localhost:3000/api/health

# Response esperada
{
  "status": "ok",
  "timestamp": "2026-04-20T10:30:45.123Z",
  "hasGeminiKey": true,
  "hasGroqKey": true,
  "hasOpenAIKey": true
}
```

### Testes de Segurança

```bash
# 1. Teste de validação de entrada
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "<script>alert(1)</script>"}'
# Deve remover scripts

# 2. Teste de rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/chat ...
done
# Deve rejeitar após limite

# 3. Teste de CORS
curl -H "Origin: https://ataque.com" \
  http://localhost:3000/api/chat
# Deve retornar 403 se origem não configurada
```

---

## 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)

---

## 📞 Reportar Vulnerabilidades

Se encontrar uma vulnerabilidade de segurança:

1. **NÃO** publique a vulnerabilidade publicamente
2. Envie email para: security@vitalidade40.com
3. Inclua: descrição detalhada, passos para reproduzir, impacto
4. Aguarde resposta em até 48 horas

---

## ✅ Último Update

Segurança atualizada em: **2026-04-20**

Versão do app: **1.0.0**
