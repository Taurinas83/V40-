import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { config } from './config';
import { ChatResponse, AIServiceError } from './responses';

export type AIProvider = 'groq' | 'gemini' | 'openai' | 'ollama' | 'offline';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Serviço unificado de IA com fallback automático
 */
export class AIService {
  private systemPrompt: string;
  private userContext: string;
  private lastError: string | null = null;

  constructor(systemPrompt: string, userContext: string) {
    this.systemPrompt = systemPrompt;
    this.userContext = userContext;
  }

  /**
   * Tenta obter resposta de IA em cascata: Groq → Gemini → OpenAI → Offline
   */
  async getResponse(): Promise<{ text: string; provider: AIProvider }> {
    const providers: AIProvider[] = [];

    if (config.apiKeys.groq) providers.push('groq');
    if (config.apiKeys.gemini) providers.push('gemini');
    if (config.apiKeys.openai) providers.push('openai');
    if (config.ollama.enabled) providers.push('ollama');

    for (const provider of providers) {
      try {
        const response = await this.callProvider(provider);
        return { text: response, provider };
      } catch (error) {
        console.warn(`[AI] ${provider} falhou:`, (error as Error).message);
        this.lastError = (error as Error).message;
      }
    }

    // Se todas as APIs falharem, usar geração offline
    console.warn('[AI] Todas as APIs indisponíveis, usando modo offline');
    return {
      text: this.generateOfflineResponse(),
      provider: 'offline',
    };
  }

  /**
   * Chama um provedor específico
   */
  private async callProvider(provider: AIProvider): Promise<string> {
    switch (provider) {
      case 'groq':
        return this.callGroq();
      case 'gemini':
        return this.callGemini();
      case 'openai':
        return this.callOpenAI();
      case 'ollama':
        return this.callOllama();
      default:
        throw new AIServiceError(`Provedor desconhecido: ${provider}`);
    }
  }

  /**
   * Chamada ao Groq (Llama)
   */
  private async callGroq(): Promise<string> {
    if (!config.apiKeys.groq) {
      throw new AIServiceError('Groq API key não configurada');
    }

    const openai = new OpenAI({
      apiKey: config.apiKeys.groq,
      baseURL: 'https://api.groq.com/openai/v1',
    });

    const response = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: this.systemPrompt + '\n\nResponda em JSON válido apenas.' },
        { role: 'user', content: this.userContext },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 2000,
    });

    const text = response.choices[0].message.content;
    if (!text) throw new AIServiceError('Resposta vazia do Groq');

    return text;
  }

  /**
   * Chamada ao Google Gemini
   */
  private async callGemini(): Promise<string> {
    if (!config.apiKeys.gemini) {
      throw new AIServiceError('Gemini API key não configurada');
    }

    const genAI = new GoogleGenAI({ apiKey: config.apiKeys.gemini });

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          parts: [
            {
              text: `${this.systemPrompt}\n\n${this.userContext}`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) throw new AIServiceError('Resposta vazia do Gemini');

    return text;
  }

  /**
   * Chamada ao OpenAI (GPT-4)
   */
  private async callOpenAI(): Promise<string> {
    if (!config.apiKeys.openai) {
      throw new AIServiceError('OpenAI API key não configurada');
    }

    const openai = new OpenAI({ apiKey: config.apiKeys.openai });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: this.systemPrompt + '\n\nResponda em JSON válido apenas.' },
        { role: 'user', content: this.userContext },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 2000,
    });

    const text = response.choices[0].message.content;
    if (!text) throw new AIServiceError('Resposta vazia do OpenAI');

    return text;
  }

  /**
   * Chamada ao Ollama (LLM local — Qwen, Llama, etc.)
   */
  private async callOllama(): Promise<string> {
    const { baseUrl, model } = config.ollama;

    const openai = new OpenAI({
      apiKey: 'ollama', // required by OpenAI client but unused by Ollama
      baseURL: `${baseUrl}/v1`,
    });

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: this.systemPrompt + '\n\nResponda em JSON válido apenas.' },
        { role: 'user', content: this.userContext },
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });

    const text = response.choices[0].message.content;
    if (!text) throw new AIServiceError('Resposta vazia do Ollama');

    return text;
  }

  /**
   * Gera resposta offline quando todas as APIs falham
   */
  private generateOfflineResponse(): string {
    const offlineProgram = {
      text: 'Modo offline acionado. Sistema de IA temporariamente indisponível. Gerando recomendação baseada em conhecimento local...',
      isProgram: false,
      program: null,
      isWorkout: false,
    };

    return JSON.stringify(offlineProgram);
  }

  /**
   * Retorna o último erro ocorrido
   */
  getLastError(): string | null {
    return this.lastError;
  }
}

/**
 * Valida se a resposta é JSON válido
 */
export function validateJSONResponse(text: string): Record<string, any> {
  try {
    const parsed = JSON.parse(text);
    if (!parsed.text) {
      throw new Error('Campo "text" obrigatório');
    }
    return parsed;
  } catch (error) {
    throw new AIServiceError(`Resposta de IA inválida: ${(error as Error).message}`);
  }
}
