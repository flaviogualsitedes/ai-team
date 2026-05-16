import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';

export const maxDuration = 30;

/**
 * Vault Logic (AES-256-GCM)
 */
class VaultInternal {
  private static masterKey: Buffer;
  private static KEY_PATH = path.join(os.homedir(), '.aiteam', '.vault_key');

  private static init(): void {
    if (this.masterKey) return;
    if (!fs.existsSync(this.KEY_PATH)) {
      throw new Error('Chave mestra do Vault não encontrada. Configure o sistema primeiro.');
    }
    this.masterKey = fs.readFileSync(this.KEY_PATH);
  }

  static decrypt(encryptedData: string): string {
    try {
      this.init();
      const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');
      if (!ivHex || !authTagHex || !encryptedText) return encryptedData;

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.masterKey, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (e) {
      console.error("Erro na descriptografia do Vault:", e);
      return encryptedData;
    }
  }
}

export async function POST(req: Request) {
  let db: any = null;
  try {
    const { messages } = await req.json();

    // 1. Conectar ao Banco de Dados (Sincronizado com lib/db.ts)
    const dbPath = path.join(os.homedir(), '.aiteam', 'aiteam.db');
    db = new Database(dbPath);


    // 2. Buscar Configurações Globais
    const settingsRows = db.prepare('SELECT key, value FROM settings').all() as any[];
    const settings = settingsRows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {}) as any;

    const defaultProvider = settings.default_provider || 'google';
    const defaultModelId = settings.default_model || (defaultProvider === 'google' ? 'gemini-1.5-flash' : 'gpt-4o');

    // 3. Buscar API Key do provedor ativo
    const keyRecord = db.prepare('SELECT api_key FROM api_keys WHERE provider = ?').get(defaultProvider) as any;
    
    if (!keyRecord) {
      throw new Error(`API Key para o provedor '${defaultProvider}' não encontrada no banco.`);
    }

    const apiKey = VaultInternal.decrypt(keyRecord.api_key);

    // 4. Instanciar o Provedor Correto com a chave injetada
    let model;
    console.log(`[Magnus] Operando com Provedor: ${defaultProvider} | Modelo: ${defaultModelId}`);

    if (defaultProvider === 'google') {
      const google = createGoogleGenerativeAI({ apiKey });
      model = google(defaultModelId);
    } else if (defaultProvider === 'groq') {
      const groq = createOpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: apiKey,
      });
      model = groq(defaultModelId);
    } else if (defaultProvider === 'openai') {
      const openai = createOpenAI({ apiKey });
      model = openai(defaultModelId);
    } else if (defaultProvider === 'anthropic') {
      const anthropic = createAnthropic({ apiKey });
      model = anthropic(defaultModelId);
    } else {
      // Fallback Google
      const google = createGoogleGenerativeAI({ apiKey });
      model = google('gemini-1.5-flash');
    }

    console.log(`[Magnus] Invocando streamText...`);


    // 5. Executar o Magnus Mastermind
    const result = await streamText({
      model: model as any,
      messages,
      system: `Você é o Magnus Mastermind, o orquestrador supremo da plataforma AITeam. 
      Sua missão é RECRUTAR um novo agente de elite para a squad do usuário. 

      PROTOCOLO:
      1. Use 'updateDraftSpec' para atualizar o XML de identidade no Spec Forge lateral sempre que houver progresso.
      2. Mantenha a Regra Marvel de Aliteração (ex: 'Dante Data', 'Sora Sombra').
      3. Seja investigativo: entenda o "trabalho sujo" que o agente fará antes de definir sua identidade.
      4. Pergunte UMA coisa por vez.
      5. XML padrão: <agent><identity><name>...</name><role>...</role></identity><skills>...</skills></agent>`,
      tools: {
        updateDraftSpec: tool({
          description: 'Atualiza o rascunho da especificação do agente no Spec Forge lateral.',
          parameters: z.object({
            spec: z.string().describe('O conteúdo XML completo da especificação do agente.'),
          }),
          execute: async ({ spec }) => {
            return { status: "success", message: "Forge sincronizado." };
          }
        }),
      },
      maxSteps: 5,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Erro na Rota de Chat Dinâmica:", error);
    return new Response(JSON.stringify({ 
      error: "Erro na orquestração do Magnus", 
      details: error.message 
    }), { status: 500 });
  } finally {
    if (db) db.close();
  }
}
