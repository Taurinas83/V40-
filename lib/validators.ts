/**
 * Validadores de entrada para garantir dados seguros
 */

export interface ChatRequestPayload {
  prompt: string;
  userProfile: {
    id?: string;
    name?: string;
    age?: number;
    gender?: string;
  };
  currentProgram?: Record<string, any>;
  recentCheckins?: Array<Record<string, any>>;
}

const MAX_PROMPT_LENGTH = 5000;
const MAX_NAME_LENGTH = 100;
const MIN_AGE = 18;
const MAX_AGE = 120;

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Valida string de prompt
 */
export function validatePrompt(prompt: any): string {
  if (typeof prompt !== 'string') {
    throw new ValidationError('Prompt deve ser uma string');
  }

  const trimmed = prompt.trim();

  if (trimmed.length === 0) {
    throw new ValidationError('Prompt não pode estar vazio');
  }

  if (trimmed.length > MAX_PROMPT_LENGTH) {
    throw new ValidationError(`Prompt não pode exceder ${MAX_PROMPT_LENGTH} caracteres`);
  }

  return trimmed;
}

/**
 * Valida nome de usuário
 */
export function validateUserName(name: any): string {
  if (!name) return 'Usuário';

  if (typeof name !== 'string') {
    throw new ValidationError('Nome deve ser uma string');
  }

  const trimmed = name.trim();

  if (trimmed.length > MAX_NAME_LENGTH) {
    throw new ValidationError(`Nome não pode exceder ${MAX_NAME_LENGTH} caracteres`);
  }

  // Remove caracteres potencialmente maliciosos
  const sanitized = trimmed.replace(/[<>\"'`]/g, '');

  return sanitized || 'Usuário';
}

/**
 * Valida idade
 */
export function validateAge(age: any): number | null {
  if (age === null || age === undefined) return null;

  const ageNum = parseInt(age, 10);

  if (isNaN(ageNum)) {
    throw new ValidationError('Idade deve ser um número');
  }

  if (ageNum < MIN_AGE || ageNum > MAX_AGE) {
    throw new ValidationError(`Idade deve estar entre ${MIN_AGE} e ${MAX_AGE}`);
  }

  return ageNum;
}

/**
 * Valida gênero
 */
export function validateGender(gender: any): string | null {
  if (!gender) return null;

  if (typeof gender !== 'string') {
    throw new ValidationError('Gênero deve ser uma string');
  }

  const valid = ['M', 'F', 'Outro', 'Não especificado', 'male', 'female', 'other'].map(g => g.toLowerCase());
  const normalized = gender.toLowerCase();

  if (!valid.includes(normalized)) {
    throw new ValidationError('Gênero inválido');
  }

  return gender;
}

/**
 * Valida request completo do chat
 */
export function validateChatRequest(body: any): ChatRequestPayload {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request deve ser um objeto JSON');
  }

  const { prompt, userProfile, currentProgram, recentCheckins } = body;

  // Validar prompt (obrigatório)
  const validatedPrompt = validatePrompt(prompt);

  // Validar user profile
  const validatedProfile = {
    name: validateUserName(userProfile?.name),
    age: validateAge(userProfile?.age),
    gender: validateGender(userProfile?.gender),
    id: userProfile?.id || undefined,
  };

  // Validar programa atual (se fornecido)
  const validatedProgram = currentProgram ? validateProgram(currentProgram) : undefined;

  // Validar checkins recentes (se fornecido)
  const validatedCheckins = recentCheckins
    ? validateCheckinsArray(recentCheckins)
    : undefined;

  return {
    prompt: validatedPrompt,
    userProfile: validatedProfile,
    currentProgram: validatedProgram,
    recentCheckins: validatedCheckins,
  };
}

/**
 * Valida estrutura de programa
 */
function validateProgram(program: any): Record<string, any> {
  if (!program || typeof program !== 'object') {
    throw new ValidationError('Programa deve ser um objeto');
  }

  // Validação básica
  if (program.days && !Array.isArray(program.days)) {
    throw new ValidationError('Programa.days deve ser um array');
  }

  return {
    name: typeof program.name === 'string' ? program.name.substring(0, 200) : 'Programa Padrão',
    days: program.days || [],
  };
}

/**
 * Valida array de checkins
 */
function validateCheckinsArray(checkins: any): Array<Record<string, any>> {
  if (!Array.isArray(checkins)) {
    throw new ValidationError('recentCheckins deve ser um array');
  }

  return checkins.slice(0, 20).map(checkin => {
    if (typeof checkin !== 'object') {
      throw new ValidationError('Cada checkin deve ser um objeto');
    }

    return {
      fatigue: validateNumberRange(checkin.fatigue, 1, 10, 5),
      rpe: validateNumberRange(checkin.rpe, 1, 10, 5),
      date: typeof checkin.date === 'string' ? checkin.date : new Date().toISOString(),
      notes: typeof checkin.notes === 'string' ? checkin.notes.substring(0, 500) : '',
    };
  });
}

/**
 * Valida número dentro de range
 */
function validateNumberRange(value: any, min: number, max: number, defaultValue: number): number {
  if (value === null || value === undefined) return defaultValue;

  const num = parseFloat(value);

  if (isNaN(num)) return defaultValue;
  if (num < min || num > max) return defaultValue;

  return num;
}

/**
 * Sanitiza string removendo caracteres perigosos
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>\"'`]/g, '').trim();
}
