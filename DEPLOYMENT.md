# 🚀 Guia de Deploy - Vitalidade 40+

Instruções para colocar o Vitalidade 40+ em produção.

---

## 📋 Opções de Deployment

| Plataforma | Dificuldade | Custo | Recomendado para |
|----------|-------------|-------|-----------------|
| **Vercel** | ⭐ Fácil | Grátis-$20/mês | Startups, testes |
| **Netlify** | ⭐ Fácil | Grátis-$19/mês | Hobby, blogs |
| **Render** | ⭐⭐ Médio | Grátis-$15/mês | Produção pequena |
| **Cloud Run** | ⭐⭐ Médio | Pay-as-you-go | Google Cloud users |
| **AWS EC2** | ⭐⭐⭐ Difícil | $5-100/mês | Escala grande |
| **DigitalOcean** | ⭐⭐ Médio | $5-40/mês | Full control |

---

## 1️⃣ Deploy no Vercel (Recomendado)

### Requisitos
- Conta Vercel (https://vercel.com)
- Repositório GitHub

### Passos

```bash
# 1. Conectar repositório no Vercel Dashboard
# https://vercel.com/new

# 2. Configurar Environment Variables
# Settings → Environment Variables
JWT_SECRET=<gere-uma-string-aleatoria>
GEMINI_API_KEY=<sua-chave>
OPENAI_API_KEY=<sua-chave>
GROQ_API_KEY=<sua-chave>
CORS_ORIGIN=https://seu-dominio.com
NODE_ENV=production

# 3. Deploy automático (push para main)
git push origin main
# Vercel detectará e fará deploy automaticamente
```

### Configuração Automática

Vercel detectará automaticamente:
- ✅ Framework: React/Vite
- ✅ Build command: `npm run build`
- ✅ Output directory: `dist`
- ✅ Node version: 18.x

### Monitoramento

```bash
# Ver logs em tempo real
vercel logs <seu-projeto>

# Listar deployments
vercel list

# Revert para deploy anterior
vercel rollback
```

---

## 2️⃣ Deploy no Render

### Requisitos
- Conta Render (https://render.com)
- Repositório GitHub

### Passos

```bash
# 1. No dashboard Render, clique "New +" → "Web Service"
# 2. Conecte repositório GitHub
# 3. Preencha:
#    - Name: vitalidade-40-app
#    - Root Directory: (deixar vazio)
#    - Build Command: npm run build
#    - Start Command: npm run dev (ou node server.ts)

# 4. Environment Variables (Settings → Environment)
JWT_SECRET=<valor-aleatório>
GEMINI_API_KEY=<sua-chave>
OPENAI_API_KEY=<sua-chave>
GROQ_API_KEY=<sua-chave>
CORS_ORIGIN=https://seu-dominio.com
NODE_ENV=production
PORT=3000

# 5. Deploy automático com push
git push origin main
```

---

## 3️⃣ Deploy Manual (VPS/DigitalOcean)

### Requisitos
- Servidor Linux (Ubuntu 20.04+)
- SSH access
- Node.js 18+ instalado

### Passos

```bash
# 1. Conectar ao servidor
ssh root@seu-ip-aqui

# 2. Instalar Node.js (se não tiver)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clonar repositório
git clone https://github.com/seu-usuario/v40-app.git
cd v40-app

# 4. Instalar dependências
npm install --production

# 5. Configurar .env
nano .env
# Preencher:
# NODE_ENV=production
# JWT_SECRET=<valor-aleatório>
# GEMINI_API_KEY=...
# etc

# 6. Build
npm run build

# 7. Iniciar com PM2 (gerenciador de processos)
sudo npm install -g pm2

pm2 start server.ts --name "vitalidade-40"
pm2 startup
pm2 save

# 8. Configurar Nginx (reverse proxy)
sudo apt-get install -y nginx

sudo nano /etc/nginx/sites-available/default
# Adicionar:
# server {
#     listen 80;
#     server_name seu-dominio.com;
#     location / {
#         proxy_pass http://localhost:3000;
#     }
# }

sudo nginx -t
sudo systemctl restart nginx

# 9. SSL com Let's Encrypt
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

---

## 4️⃣ Deploy no AWS EC2

### Requisitos
- Conta AWS
- EC2 instance Ubuntu 20.04

### Passos

```bash
# Similar ao DigitalOcean, mas com:

# 1. Security Group (permite porta 80, 443, 3000)
# 2. Elastic IP para IP fixo
# 3. Usar CloudFront como CDN

# Script de setup completo:
#!/bin/bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git

git clone https://github.com/seu-usuario/v40-app.git
cd v40-app
npm install --production
npm run build

# Configurar Nginx...
# (mesmo que DigitalOcean)
```

---

## 5️⃣ Deploy com Docker

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      GROQ_API_KEY: ${GROQ_API_KEY}
    restart: unless-stopped
```

### Deploy

```bash
docker-compose up -d
docker logs -f <container-id>
```

---

## 🔐 Configuração de Domínio

### Com Vercel (automático)
```bash
# No Vercel Dashboard:
# Settings → Domains → Add Domain
# vercel.com gera DNS records automaticamente
```

### Domínio personalizado

```bash
# 1. Comprar domínio em:
#    - Namecheap.com
#    - Google Domains
#    - GoDaddy
#    - etc

# 2. Apontar nameservers para Vercel:
#    - ns1.vercel-dns.com
#    - ns2.vercel-dns.com

# 3. No Vercel, adicionar domínio:
# https://vercel.com/docs/concepts/projects/domains
```

---

## 📊 Monitoramento & Logging

### Vercel Analytics
```bash
# Ativado automaticamente em Vercel
# Ver em: Dashboard → Analytics
```

### Sentry (Error Tracking)

```bash
npm install @sentry/node

# Em server.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "seu-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

### Logs Estruturados

```bash
# Ver logs no Vercel
vercel logs

# Em DigitalOcean/AWS
pm2 logs vitalidade-40

# Com systemctl
journalctl -u vitalidade-40 -f
```

---

## 🔄 CI/CD com GitHub Actions

### .github/workflows/deploy.yml

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Install Node
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run linter
      run: npm run lint
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Vercel
      uses: vercel/action@master
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        production: true
```

---

## ✅ Checklist Pré-Deploy

- [ ] `npm run lint` sem erros
- [ ] `npm run build` executado com sucesso
- [ ] `.env.local` preenchido com todas as chaves
- [ ] JWT_SECRET alterado (não use padrão dev)
- [ ] CORS_ORIGIN configurado para domínio
- [ ] NODE_ENV=production
- [ ] HTTPS/TLS ativado
- [ ] Rate limiting ativado
- [ ] Logs sendo armazenados
- [ ] Monitoramento de erros configurado
- [ ] Backup de dados configurado
- [ ] Testes manuais finais realizados

---

## 🐛 Troubleshooting Deploy

### "Port already in use"
```bash
# Mude porta em .env
PORT=3001

# Ou libere porta
lsof -i :3000
kill -9 <PID>
```

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### "Build timeout no Vercel"
- Aumentar timeout em Vercel Settings
- Ou mover para Render (timeout maior)

### "CORS error em produção"
- Verificar CORS_ORIGIN=seu-dominio.com
- Não usar `*` em produção

### "Token inválido"
- Verificar JWT_SECRET é igual em dev e prod
- Regenerar tokens se mudar secret

---

## 📞 Suporte

- Vercel: https://vercel.com/support
- Render: https://render.com/docs
- Stack Overflow: tag `node.js` + `deployment`

---

## ✅ Último Update

Deploy guide atualizado em: **2026-04-20**
