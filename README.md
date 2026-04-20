<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🏋️ Vitalidade 40+ | IA Personal Trainer

**Personal Trainer de Elite baseado em IA para homens e mulheres 40+**

Especializado em **longevidade**, **biomecânica segura** e **otimização hormonal** para recomposição corporal sem dores articulares.

---

## 🚀 Quickstart

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação Local

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/v40-app.git
cd V40-

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local

# 4. Adicionar API Keys no .env.local
# - GEMINI_API_KEY (obtenha em: https://aistudio.google.com/app/apikey)
# - OPENAI_API_KEY (opcional)
# - GROQ_API_KEY (opcional)
# - JWT_SECRET (mude para produção!)

# 5. Executar em desenvolvimento
npm run dev

# 6. Acessar em http://localhost:3000
```

---

## 🏗️ Arquitetura

```
Vitalidade 40+
├── Frontend:     React 19 + Vite + Tailwind
├── Backend:      Express + TypeScript
├── AI Stack:     Groq → Gemini → OpenAI (cascata de fallback)
└── Database:     Exercício Knowledge Base Embarcado
```

### Fluxo de Requisição

```
Cliente → Request Validado → Rate Limited →
→ JWT Verificado → AIService (Cascata) →
→ Enriquecido c/ Database de Exercícios →
→ Resposta JSON Estruturada
```

---

## 🔐 Segurança

Este aplicativo implementa **best practices de segurança**:

✅ **Autenticação JWT** com expiração configurável
✅ **Validação robusta** de entrada
✅ **CORS configurável** por origem
✅ **Rate limiting** por IP
✅ **Helmet.js** para security headers
✅ **Sem API keys hardcoded**
✅ **Logging estruturado** de requisições

### Variáveis Obrigatórias em Produção

```bash
JWT_SECRET=valor-criptografico-aleatorio-seguro
NODE_ENV=production
CORS_ORIGIN=https://seu-dominio.com
```

⚠️ **NUNCA** commite `.env` ou `.env.local` no git!

---

## 📚 API Endpoints

### Saúde & Info
```
GET /api/health
```

### Autenticação
```
POST /api/auth/register
POST /api/auth/login
```

### Chat (Principal)
```
POST /api/chat
Body: {
  "prompt": "Quero um programa 5 dias",
  "userProfile": { "name": "João", "age": 45, "gender": "M" },
  "currentProgram": { /* programa anterior */ },
  "recentCheckins": [ /* dados de progresso */ ]
}
```

### Exercícios
```
GET /api/exercises              # Lista todos
GET /api/exercises/:id          # Detalhe de um
```

---

## 🧠 Cérebro de Exercícios (Knowledge Base)

O app possui **16 exercícios especializados** com:
- Cues técnicos precisos
- Progressões seguras para 40+
- Proteção de articulações
- Erros comuns e como evitar

**IDs Disponíveis:**
```
supino_reto_halteres, supino_inclinado_halteres, puxada_frente,
remada_curvada, agachamento_livre, agachamento_bulgaro, leg_press,
terra_romeno, mesa_flexora, cadeira_extensora, desenvolvimento_halteres,
elevacao_lateral, rosca_direta, triceps_corda, panturrilha_em_pe,
prancha_abdominal
```

---

## 🤖 Sistema de IA (Cascata Inteligente)

Prioridade de APIs:
1. **Groq** (Llama 3.1) - Rápido, economiza timeout
2. **Google Gemini** - Fallback 1, multimodal
3. **OpenAI** (GPT-4) - Fallback 2, premium
4. **Offline** - Banco de dados local se todas caírem

---

## 📊 Build & Deploy

```bash
# Development
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Type checking
npm run lint

# Limpar build anterior
npm run clean
```

### Deploy no Vercel

```bash
vercel env add GEMINI_API_KEY
vercel env add OPENAI_API_KEY
vercel env add GROQ_API_KEY
vercel env add JWT_SECRET
vercel deploy --prod
```

### Deploy Manual (VPS/Cloud Run)

```bash
npm run build
NODE_ENV=production node server.ts
```

---

## 📁 Estrutura do Projeto

```
V40-/
├── lib/
│   ├── config.ts           # Configurações centralizadas
│   ├── auth.ts             # JWT + hash de senha
│   ├── validators.ts       # Validação de entrada
│   ├── middleware.ts       # Segurança + CORS + rate limit
│   ├── responses.ts        # Tipos e respostas padronizadas
│   ├── ai-service.ts       # Cascata de APIs de IA
│   └── exercise-db.ts      # Knowledge base de exercícios
├── app/                    # Código React (frontend)
├── public/                 # Assets estáticos
├── server.ts               # Express main
├── vite.config.ts          # Build config
├── tsconfig.json           # TypeScript config
├── .env.example            # Template de env vars
└── package.json            # Dependências
```

---

## 🐛 Troubleshooting

### "API key not valid"
- Verifique se a chave está no `.env.local`
- Confirme se é a chave correta (copy-paste sem espaços)
- Teste em: https://aistudio.google.com (Gemini)

### "Too many requests"
- Rate limiting ativado: aguarde 15 minutos
- Ou configure `RATE_LIMIT_WINDOW` em produção

### "CORS error"
- Verifique `CORS_ORIGIN` no `.env.local`
- Em dev, use `*` (apenas para testes)

### "JWT token invalid"
- Token expirou (validade padrão: 7 dias)
- Faça login novamente para gerar novo token

---

## 📖 Documentação Adicional

- [SECURITY.md](./SECURITY.md) - Guia de segurança
- [API_DOCS.md](./API_DOCS.md) - Documentação detalhada de endpoints
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guia de deploy em produção

---

## 🤝 Contribuir

Encontrou um bug? Abra uma issue!
Quer contribuir? Pull requests são bem-vindas.

---

## 📄 Licença

MIT License - veja [LICENSE](./LICENSE) para detalhes

---

## 📞 Suporte

- Email: support@vitalidade40.com
- Issues: GitHub Issues
- Documentação: https://docs.vitalidade40.com
