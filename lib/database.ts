import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';

/**
 * Instância global do cliente Supabase
 */
let supabaseClient: SupabaseClient | null = null;

/**
 * Interface para usuário no banco de dados
 */
export interface DbUser {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  age?: number;
  gender?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface para programa de treino salvo
 */
export interface DbProgram {
  id: string;
  user_id: string;
  name: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Interface para checkin de progresso
 */
export interface DbCheckin {
  id: string;
  user_id: string;
  program_id: string;
  fatigue: number;
  rpe: number;
  notes: string;
  date: string;
  created_at: string;
}

/**
 * Inicializa conexão com Supabase
 */
export function initializeDatabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[DB] Supabase não configurado. Usando modo offline.');
    return null;
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log('[DB] Supabase conectado com sucesso');
    return supabaseClient;
  } catch (error) {
    console.error('[DB] Erro ao conectar Supabase:', error);
    return null;
  }
}

/**
 * Obtém instância do Supabase
 */
export function getDatabase(): SupabaseClient | null {
  if (!supabaseClient) {
    return initializeDatabase();
  }
  return supabaseClient;
}

/**
 * Cria novo usuário no banco de dados
 */
export async function createUser(
  email: string,
  passwordHash: string,
  name: string
): Promise<DbUser | null> {
  const db = getDatabase();
  if (!db) return null;

  try {
    const { data, error } = await db
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as DbUser;
  } catch (error) {
    console.error('[DB] Erro ao criar usuário:', error);
    return null;
  }
}

/**
 * Busca usuário por email
 */
export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const db = getDatabase();
  if (!db) return null;

  try {
    const { data, error } = await db
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data as DbUser;
  } catch (error) {
    console.error('[DB] Erro ao buscar usuário:', error);
    return null;
  }
}

/**
 * Busca usuário por ID
 */
export async function getUserById(id: string): Promise<DbUser | null> {
  const db = getDatabase();
  if (!db) return null;

  try {
    const { data, error } = await db
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as DbUser;
  } catch (error) {
    console.error('[DB] Erro ao buscar usuário:', error);
    return null;
  }
}

/**
 * Atualiza perfil do usuário
 */
export async function updateUserProfile(
  id: string,
  updates: Partial<Omit<DbUser, 'id' | 'email' | 'password_hash' | 'created_at'>>
): Promise<DbUser | null> {
  const db = getDatabase();
  if (!db) return null;

  try {
    const { data, error } = await db
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as DbUser;
  } catch (error) {
    console.error('[DB] Erro ao atualizar usuário:', error);
    return null;
  }
}

/**
 * Salva programa de treino
 */
export async function saveProgram(
  userId: string,
  name: string,
  programData: Record<string, any>
): Promise<DbProgram | null> {
  const db = getDatabase();
  if (!db) return null;

  try {
    const { data, error } = await db
      .from('programs')
      .insert({
        user_id: userId,
        name,
        data: programData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as DbProgram;
  } catch (error) {
    console.error('[DB] Erro ao salvar programa:', error);
    return null;
  }
}

/**
 * Busca programas do usuário
 */
export async function getUserPrograms(userId: string): Promise<DbProgram[]> {
  const db = getDatabase();
  if (!db) return [];

  try {
    const { data, error } = await db
      .from('programs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as DbProgram[];
  } catch (error) {
    console.error('[DB] Erro ao buscar programas:', error);
    return [];
  }
}

/**
 * Busca programa por ID
 */
export async function getProgramById(id: string): Promise<DbProgram | null> {
  const db = getDatabase();
  if (!db) return null;

  try {
    const { data, error } = await db
      .from('programs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as DbProgram;
  } catch (error) {
    console.error('[DB] Erro ao buscar programa:', error);
    return null;
  }
}

/**
 * Salva checkin de progresso
 */
export async function saveCheckin(
  userId: string,
  programId: string,
  fatigue: number,
  rpe: number,
  notes: string
): Promise<DbCheckin | null> {
  const db = getDatabase();
  if (!db) return null;

  try {
    const { data, error } = await db
      .from('checkins')
      .insert({
        user_id: userId,
        program_id: programId,
        fatigue,
        rpe,
        notes,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as DbCheckin;
  } catch (error) {
    console.error('[DB] Erro ao salvar checkin:', error);
    return null;
  }
}

/**
 * Busca checkins recentes do usuário
 */
export async function getUserCheckins(userId: string, limit = 20): Promise<DbCheckin[]> {
  const db = getDatabase();
  if (!db) return [];

  try {
    const { data, error } = await db
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as DbCheckin[];
  } catch (error) {
    console.error('[DB] Erro ao buscar checkins:', error);
    return [];
  }
}

/**
 * Busca checkins de um programa
 */
export async function getProgramCheckins(programId: string): Promise<DbCheckin[]> {
  const db = getDatabase();
  if (!db) return [];

  try {
    const { data, error } = await db
      .from('checkins')
      .select('*')
      .eq('program_id', programId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []) as DbCheckin[];
  } catch (error) {
    console.error('[DB] Erro ao buscar checkins do programa:', error);
    return [];
  }
}

/**
 * Verifica se banco de dados está disponível
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  const db = getDatabase();
  if (!db) return false;

  try {
    const { error } = await db.from('users').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
