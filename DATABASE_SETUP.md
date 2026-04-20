# 🗄️ Setup do Banco de Dados - Supabase

Guia completo para configurar o banco de dados PostgreSQL com Supabase.

---

## 🚀 Quickstart

### 1. Criar Projeto no Supabase

```bash
# Acesse: https://supabase.com
# Sign up → Create Organization → New Project

# Preencha:
Project name: vitalidade-40
Database password: <gere-senha-forte>
Region: Brazil (sa-east-1)
```

### 2. Obter API Keys

```bash
# Dashboard → Project Settings → API
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

### 3. Adicionar ao .env.local

```bash
SUPABASE_URL=sua-url-aqui
SUPABASE_ANON_KEY=sua-chave-aqui
```

### 4. Rodar Migrations

```bash
npm run db:migrate
```

---

## 📊 Schema do Banco de Dados

### Tabela: `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  age INTEGER,
  gender VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Índices:**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

---

### Tabela: `programs`

```sql
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Índices:**
```sql
CREATE INDEX idx_programs_user_id ON programs(user_id);
CREATE INDEX idx_programs_created_at ON programs(created_at);
```

---

### Tabela: `checkins`

```sql
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  fatigue INTEGER NOT NULL CHECK (fatigue >= 1 AND fatigue <= 10),
  rpe INTEGER NOT NULL CHECK (rpe >= 1 AND rpe <= 10),
  notes TEXT,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Índices:**
```sql
CREATE INDEX idx_checkins_user_id ON checkins(user_id);
CREATE INDEX idx_checkins_program_id ON checkins(program_id);
CREATE INDEX idx_checkins_date ON checkins(date);
```

---

## 🔐 Row Level Security (RLS)

Configurar acesso aos dados por usuário:

### Users - RLS Policies

```sql
-- Apenas o próprio usuário pode ver seus dados
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);
```

### Programs - RLS Policies

```sql
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own programs"
  ON programs FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create programs"
  ON programs FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own programs"
  ON programs FOR UPDATE
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own programs"
  ON programs FOR DELETE
  USING (user_id::text = auth.uid()::text);
```

### Checkins - RLS Policies

```sql
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins"
  ON checkins FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create checkins"
  ON checkins FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own checkins"
  ON checkins FOR DELETE
  USING (user_id::text = auth.uid()::text);
```

---

## 🔄 Operações do Banco de Dados

### Criar Usuário

```typescript
import { createUser } from './lib/database';
import { hashPassword } from './lib/auth';

const passwordHash = await hashPassword('senha-do-usuario');
const user = await createUser('usuario@example.com', passwordHash, 'João Silva');
```

### Salvar Programa

```typescript
import { saveProgram } from './lib/database';

const program = await saveProgram(
  userId,
  'Meu Programa de 5 Dias',
  {
    name: 'Programa 5 Dias',
    days: [
      {
        day: 'Segunda',
        focus: 'Peito e Tríceps',
        exercises: [ /* ... */ ]
      }
    ]
  }
);
```

### Salvar Checkin

```typescript
import { saveCheckin } from './lib/database';

const checkin = await saveCheckin(
  userId,
  programId,
  fatigue,  // 1-10
  rpe,      // 1-10
  'Notas do treino'
);
```

### Buscar Dados

```typescript
import { 
  getUserById, 
  getUserPrograms, 
  getUserCheckins,
  getProgramCheckins 
} from './lib/database';

const user = await getUserById(userId);
const programs = await getUserPrograms(userId);
const checkins = await getUserCheckins(userId);
const programCheckins = await getProgramCheckins(programId);
```

---

## 📋 Modo Offline

Se Supabase não estiver configurado, o app funciona com dados em memória:

```typescript
const db = getDatabase();
if (!db) {
  console.log('Modo offline - dados em memória');
  // App continua funcionando com cache local
}
```

---

## 🔧 Backup e Restore

### Fazer Backup

```bash
# Via Dashboard Supabase
# Database → Backups → Create Backup

# Via CLI
supabase db pull
```

### Restore

```bash
# Via Dashboard
# Database → Backups → Restore

# Via CLI
supabase db push
```

---

## 📊 Monitoramento

### Ver Logs do Banco

```bash
# Dashboard → Logs → Database Logs
# Ver queries lentas, erros, etc
```

### Performance

```sql
-- Ver queries lentas
SELECT 
  query, 
  calls, 
  total_time, 
  mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC;
```

---

## 🚨 Troubleshooting

### "Connection refused"
- Verificar se SUPABASE_URL está correto
- Verificar se SUPABASE_ANON_KEY está válida
- Verificar firewall (Supabase > Database > Firewall)

### "RLS policy violation"
- Usuário não autenticado ou token expirado
- Verificar se policies estão criadas
- Usar `service_role` para operações admin

### "Rows returned is beyond the limit"
- Adicionar paginação: `.limit(100)`
- Usar `.range(0, 99)` para paginação

### "JWT invalid or expired"
- Token JWT expirou (7 dias padrão)
- Fazer login novamente para novo token

---

## 📚 Referências

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Checklist de Setup

- [ ] Conta Supabase criada
- [ ] Projeto criado em Supabase
- [ ] API keys obtidas
- [ ] .env.local preenchido
- [ ] Tabelas criadas (SQL)
- [ ] RLS policies configuradas
- [ ] Backup automatizado ativado
- [ ] Testes de conexão passando

---

**Status**: ✅ Banco de dados integrado
