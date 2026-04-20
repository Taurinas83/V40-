# 📊 Guia de Monitoramento - Sentry + Analytics

Documentação sobre monitoramento de erros e analytics com Sentry e Vercel Analytics.

---

## 🚨 Sentry - Error Tracking

### Setup

#### 1. Criar Conta

```bash
# Acesse: https://sentry.io
# Sign up → Create Organization → New Project
```

#### 2. Configurar Projeto

```bash
# Sentry Dashboard → Projects → New Project
Platform: Node.js (backend) + React (frontend)
Alert Rule: Notify on new issues
```

#### 3. Obter DSN

```bash
# Settings → Client Keys (DSN)
SENTRY_DSN=https://seu-dsn@sentry.io/123456
```

#### 4. Adicionar ao .env

```bash
SENTRY_DSN=sua-dsn-aqui
```

#### 5. Inicializar no App

```typescript
// server.ts
import { initializeSentry } from './lib/monitoring';

initializeSentry(); // No início do servidor
```

---

### Usar Sentry

#### Capturar Exceção

```typescript
import { captureException } from './lib/monitoring';

try {
  // seu código
} catch (error) {
  captureException(error as Error, {
    context: 'chat-endpoint',
    userId: req.user?.id
  });
}
```

#### Capturar Mensagem

```typescript
import { captureMessage } from './lib/monitoring';

if (totalTime > 5000) {
  captureMessage('API endpoint lento', 'warning');
}
```

#### Adicionar Contexto

```typescript
import { setUserContext } from './lib/monitoring';

// Após login
setUserContext(user.id, user.email, user.name);

// Após logout
clearUserContext();
```

#### Breadcrumbs (Rastreamento)

```typescript
import { addBreadcrumb } from './lib/monitoring';

addBreadcrumb(
  'Programa salvo com sucesso',
  'program-save',
  'info',
  { programId: '123', exercises: 5 }
);
```

---

### Dashboard Sentry

#### Issues

```
Sentry → Issues
→ Ver erros reportados
→ Rastrear que usuários foram afetados
→ Ver stack trace completo
```

#### Releases

```
Sentry → Releases
→ Ver erros por versão
→ Monitorar impacto de deploys
```

#### Performance

```
Sentry → Performance
→ Ver endpoints lentos
→ Monitorar db queries
→ Identificar gargalos
```

#### Alertas

```
Sentry → Alerts
→ Notificação em Slack/Email
→ Quando novo erro aparece
→ Quando threshold ultrapassado
```

---

## 📈 Vercel Analytics

### Setup Automático

Em Vercel, Analytics é ativado automaticamente:

```bash
# Vercel Dashboard → Project → Analytics
# Ja mostra:
# - Page Load Time
# - Web Vitals
# - User Count
```

### Frontend Analytics

#### 1. Instalar

```bash
npm install @vercel/analytics
```

#### 2. Adicionar ao App

```tsx
// app/App.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

#### 3. Configurar Events (opcional)

```typescript
import { track } from '@vercel/analytics';

// Rastrear eventos customizados
track('programa_criado', {
  dias: 5,
  exercicios: 12
});

track('checkin_realizado', {
  fatiga: 7,
  rpe: 6
});
```

---

### Dashboard Vercel Analytics

#### Real-time

```
Vercel → Analytics → Real-time
→ Usuários atuais
→ Página sendo visitada
→ Localização
```

#### Web Vitals

```
→ Largest Contentful Paint (LCP): < 2.5s
→ First Input Delay (FID): < 100ms
→ Cumulative Layout Shift (CLS): < 0.1
```

#### Top Pages

```
→ Qual página mais acessada
→ Tempo médio de carregamento
→ Taxa de rejeição
```

---

## 🔗 Integração Sentry + Vercel

### Vinculação

```bash
# Vercel Dashboard → Project → Integrations
# → Add Sentry Integration
# → Selecione projeto Sentry
# → Autorize
```

### Releases Automáticas

```yaml
# .github/workflows/ci-cd.yml
- name: Create Sentry Release
  run: |
    curl -X POST https://sentry.io/api/0/organizations/seu-org/releases/ \
      -H 'Authorization: Bearer YOUR_SENTRY_TOKEN' \
      -H 'Content-Type: application/json' \
      -d '{
        "version": "${{ github.sha }}",
        "projects": ["seu-projeto"],
        "commits": [...]
      }'
```

---

## 📊 Métricas Importantes

### Acompanhar

```
✅ Error Rate: < 1% de requisições
✅ API Response Time: < 500ms
✅ Database Queries: < 100ms
✅ User Engagement: > 10 visitas/usuário/mês
✅ Performance Score: > 90
```

### Goals (Metas)

```
1. Reduzir error rate em 50%
2. Melhorar LCP para < 2s
3. Aumentar retenção de usuários
4. Monitorar API endpoints críticos
```

---

## 🚨 Alertas Sentry

### Criar Alerta

```bash
# Sentry → Alerts → Create Alert Rule
```

**Exemplo 1: Novo erro crítico**
```
IF: error rate is above 5%
THEN: Notify in Slack
```

**Exemplo 2: Endpoint lento**
```
IF: response time > 1s
THEN: Notify in Email
```

**Exemplo 3: Erro específico**
```
IF: error type = "DatabaseError"
THEN: Page incident
```

---

## 💡 Best Practices

### 1. Não Expor Dados Sensíveis

```typescript
// ❌ Errado
captureException(error, {
  email: user.email,
  apiKey: process.env.API_KEY
});

// ✅ Correto
captureException(error, {
  userId: user.id
});
```

### 2. Usar Severidade Apropriada

```typescript
captureMessage('Usuario logou', 'info');      // Informação
captureMessage('API lenta', 'warning');       // Aviso
captureMessage('Falha crítica', 'error');     // Erro
```

### 3. Sample Rate (Amostragem)

```typescript
// Para reduzir custo, amostrar erros:
// Capturar 50% dos erros
tracesSampleRate: config.nodeEnv === 'production' ? 0.5 : 1.0
```

### 4. Source Maps

```bash
# Fazer upload de source maps para Sentry
# Permite rastrear erros até código original
```

---

## 📱 Monitorar em Produção

### Checklist Diário

```
□ Verificar Sentry Issues
□ Revisar Web Vitals
□ Analisar top pages
□ Checkar taxa de erro
□ Revisar performance
```

### Checklist Semanal

```
□ Analisar trends de erro
□ Revisar novo código
□ Planejar otimizações
□ Revisar alertas
□ Comunicar status
```

---

## 🔧 Troubleshooting

### "Sentry eventos não aparecem"

**Solução:**
```bash
# Verificar se SENTRY_DSN está correto
echo $SENTRY_DSN

# Testar localmente
npm run dev
# Gerar erro
```

### "Analytics não mostra dados"

**Solução:**
```bash
# Verificar se Analytics está instalado
npm list @vercel/analytics

# Verificar se está em production
vercel env list
```

### "Muitos eventos Sentry"

**Solução:**
```typescript
// Aumentar sample rate
tracesSampleRate: 0.1 // 10% apenas
```

---

## 📚 Referências

- [Sentry Docs](https://docs.sentry.io)
- [Vercel Analytics](https://vercel.com/analytics)
- [Web Vitals](https://web.dev/vitals/)

---

## ✅ Checklist

- [ ] Conta Sentry criada
- [ ] DSN obtido
- [ ] Sentry inicializado
- [ ] Vercel Analytics ativado
- [ ] Web Vitals monitorados
- [ ] Alertas configurados
- [ ] Dashboard acessível

---

**Status**: ✅ Monitoramento implementado
