# 🔄 Guia CI/CD - GitHub Actions

Documentação completa sobre o pipeline de integração e entrega contínua.

---

## 🚀 Visão Geral

O pipeline automático:

1. **Test**: Roda testes em Node 18.x e 20.x
2. **Build**: Cria build de produção
3. **Security**: Verifica segurança (audit, secrets)
4. **Deploy**: Deploy automático para Vercel (main branch)
5. **Notify**: Notifica status (Slack, etc)

---

## 📋 Arquivo de Configuração

Localização: `.github/workflows/ci-cd.yml`

### Triggers (Quando Rodar)

```yaml
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
```

**Executa em:**
- Push para `main` ou `develop`
- Pull requests para `main` ou `develop`

---

## 🧪 Job: Test

Roda testes em múltiplas versões do Node.js

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
```

**Steps:**
1. Checkout do código
2. Setup Node.js + cache npm
3. Instalar dependências
4. Rodar type check (`npm run lint`)
5. Rodar testes (`npm run test`)
6. Upload de cobertura para Codecov

---

## 🏗️ Job: Build

Cria build de produção

```bash
npm run build
```

**Variáveis necessárias:**
```
GEMINI_API_KEY
OPENAI_API_KEY
GROQ_API_KEY
```

**Output:** Artefato `dist/` salvo para deploy

---

## 🔐 Job: Security

Verifica segurança e secrets

```bash
npm audit --production
trufflehog scan  # Detecta chaves expostas
```

**Falha se:** Vulnerabilidades críticas encontradas

---

## 🚀 Job: Deploy

Deploy automático para Vercel (apenas em `main`)

```yaml
if: github.ref == 'refs/heads/main' && 
    github.event_name == 'push'
```

**Requer:**
```
VERCEL_TOKEN (GitHub Secret)
```

---

## 🔧 Setup no GitHub

### 1. Adicionar Secrets

```bash
# GitHub → Settings → Secrets and variables → Actions
```

**Secrets necessários:**

```
VERCEL_TOKEN        # Vercel deploy token
GEMINI_API_KEY      # Para build
OPENAI_API_KEY      # Para build
GROQ_API_KEY        # Para build
SLACK_WEBHOOK       # (opcional) para notificações
```

**Como obter:**

```bash
# VERCEL_TOKEN
# Vercel.com → Settings → Tokens → Create

# SLACK_WEBHOOK (opcional)
# Slack → Apps → Incoming Webhooks
```

### 2. Adicionar Secrets no Terminal

```bash
# Via GitHub CLI
gh secret set VERCEL_TOKEN --body "seu-token-aqui"
gh secret set GEMINI_API_KEY --body "sua-chave-aqui"
gh secret set SLACK_WEBHOOK --body "seu-webhook-aqui"

# Ou via web interface (mais fácil)
```

### 3. Permitir GitHub Actions

```bash
# GitHub → Settings → Actions → General
# Marcado: "Allow all actions and reusable workflows"
```

---

## 📊 Monitorar Pipeline

### Ver Status

```bash
# GitHub → Actions → Clique no workflow
# Ou via CLI:
gh run list
gh run view <run-id>
```

### Ver Logs

```bash
# No browser: Actions → Seu workflow → Step
# Via CLI:
gh run view <run-id> --log
```

### Re-executar Workflow

```bash
# Manual: GitHub Actions → Re-run jobs
# Via CLI:
gh run rerun <run-id>
```

---

## 🎯 Workflow de Desenvolvimento

### 1. Criar Feature Branch

```bash
git checkout -b feature/minha-feature
```

### 2. Fazer Commits

```bash
git add .
git commit -m "feat: Adicionar minha feature"
```

### 3. Criar Pull Request

```bash
git push -u origin feature/minha-feature
# GitHub → Create Pull Request

# ✅ CI/CD roda automaticamente
```

### 4. Revisar Resultados

```
✅ Tests passed
✅ Build succeeded
✅ Security check passed
⏳ Waiting for review
```

### 5. Merge para Main

```bash
# Após aprovação:
# GitHub → Merge Pull Request

# ✅ Deploy automático para Vercel
```

---

## 🚨 Troubleshooting

### "Workflow failed: Build error"

**Solução:**
1. Ver logs: Actions → Seu workflow
2. Reproducir localmente: `npm run build`
3. Commitar fix
4. Push novamente

### "Deploy failed: VERCEL_TOKEN not found"

**Solução:**
```bash
# Adicionar secret
gh secret set VERCEL_TOKEN --body "seu-token"

# Verificar
gh secret list
```

### "Tests failing on CI but passing locally"

**Possíveis causas:**
- Versão Node diferente (use mesma do CI)
- Variáveis de ambiente faltando
- Race conditions

**Solução:**
```bash
# Testar com mesma versão
nvm use 18
npm run test

# Ou via Docker
docker run -it node:18 npm test
```

### "Security scan found vulnerabilities"

**Solução:**
```bash
# Ver vulnerabilidades
npm audit

# Tentar fix automático
npm audit fix

# Se não funcionar, update manual
npm update <package-name>
```

---

## 📈 Melhorias Futuras

### 1. Coverage Gates

```yaml
# Falhar se cobertura < 70%
- name: Check Coverage
  run: npm run test:coverage
```

### 2. Performance Monitoring

```yaml
# Alertar se build > 2MB
- name: Check Bundle Size
  run: npm run build && du -sh dist/
```

### 3. Automated Releases

```yaml
# Criar release automaticamente
# quando tag é pushed
if: startsWith(github.ref, 'refs/tags/')
```

### 4. Notificações Avançadas

```yaml
# Discord, Teams, Telegram
# via webhooks
```

---

## 📚 Referências

- [GitHub Actions Docs](https://docs.github.com/actions)
- [Workflow Syntax](https://docs.github.com/actions/workflows/workflow-syntax-for-github-actions)
- [Security Hardening](https://docs.github.com/actions/security-guides)

---

## ✅ Checklist

- [ ] Secrets adicionados no GitHub
- [ ] VERCEL_TOKEN configurado
- [ ] API keys adicionadas
- [ ] Workflow ativado
- [ ] Teste em PR criada
- [ ] Deploy automático em main
- [ ] Notificações configuradas (opcional)

---

**Status**: ✅ CI/CD implementado e documentado
