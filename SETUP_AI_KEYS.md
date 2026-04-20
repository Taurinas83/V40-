# 🤖 Setup das API Keys - Ative a IA

A IA do app não está funcionando porque **faltam as chaves de API**.

---

## ✅ 3 Passos Para Ativar

### **PASSO 1: Obter Chave Gemini** (2 minutos)

1. Abra: https://aistudio.google.com/app/apikey
2. Clique: **"Create API key"**
3. Copie a chave

### **PASSO 2: Adicionar ao `.env.local`**

Abra o arquivo `/home/user/V40-/.env.local` e preencha:

```bash
GEMINI_API_KEY=sua-chave-aqui
```

Exemplo completo:
```bash
GEMINI_API_KEY=AIzaSyDQzBEo-dFxK_Mhzc3E9OS6-wwmhHAqjJI
OPENAI_API_KEY=
GROQ_API_KEY=
```

### **PASSO 3: Reiniciar o Servidor**

```bash
# Para o servidor atual (Ctrl+C)

# Rode novamente
npm run dev
```

---

## 🧪 Testar Se Funciona

```bash
# Terminal 1: Rodar servidor
npm run dev

# Terminal 2: Testar chat
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Quero um programa de 5 dias",
    "userProfile": {
      "name": "João",
      "age": 45,
      "gender": "M"
    }
  }'
```

**Resposta esperada:**
```json
{
  "text": "Perfeito! Antes de montar seu programa...",
  "isProgram": false,
  "program": null,
  "isWorkout": false,
  "_metadata": {
    "aiProvider": "gemini",
    "timestamp": "2026-04-20T...",
    "responseTime": 1234
  }
}
```

---

## 🔄 APIs Disponíveis (em cascata)

Se uma cair, tenta a próxima automaticamente:

1. **Groq (Llama)** - Ultra rápido ⚡
2. **Google Gemini** - Muito bom 🎯
3. **OpenAI (GPT-4)** - Mais preciso 💎
4. **Offline** - Fallback local 📱

---

## 🆓 Opções Gratuitas

### **Google Gemini** (RECOMENDADO)
- ✅ Gratuito (60 req/min)
- ✅ Boa qualidade
- ✅ Setup em 2 min
- Link: https://aistudio.google.com/app/apikey

### **Groq** (MUITO BOM)
- ✅ Gratuito
- ✅ Ultra rápido
- ✅ Melhor para tokens grandes
- Link: https://console.groq.com/keys

### **OpenAI** (PAGO)
- 💰 $0.05 por 1M tokens
- 🎯 Mais preciso
- Link: https://platform.openai.com/api-keys

---

## ❓ Troubleshooting

### "API key invalid"
```bash
# Verifique se copiou corretamente (sem espaços)
echo $GEMINI_API_KEY
```

### "401 Unauthorized"
```bash
# Chave expirou ou está errada
# Gere uma nova em: https://aistudio.google.com/app/apikey
```

### "429 Too Many Requests"
```bash
# Excedeu limite da API (60/min no Gemini)
# Aguarde 1 minuto e tente novamente
```

### "Response invalid JSON"
```bash
# A IA respondeu com algo que não é JSON válido
# Tente novamente (problema temporário)
```

---

## 📊 Testar Health Check

```bash
curl http://localhost:3000/api/health

# Resposta:
{
  "status": "ok",
  "services": {
    "gemini": true,      ← Se false, chave não está configurada!
    "groq": false,
    "openai": false,
    "supabase": false
  }
}
```

---

## ✅ Checklist

- [ ] `.env.local` criado
- [ ] `GEMINI_API_KEY` preenchido
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] `/api/health` retorna `"gemini": true`
- [ ] Teste de chat respondeu
- [ ] IA funcionando! 🎉

---

**Pronto! Sua IA está viva!** 🤖✨
