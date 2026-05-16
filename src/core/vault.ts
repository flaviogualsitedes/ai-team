/**
 * Vault (Cofre de Segurança).
 *
 * Responsável por criptografar e descriptografar dados sensíveis (API Keys)
 * usando AES-256-GCM.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ALGORITHM = 'aes-256-gcm';
const KEY_PATH = path.join(os.homedir(), '.aiteam', '.vault_key');

export class Vault {
  private static masterKey: Buffer;

  /**
   * Inicializa ou carrega a chave mestra do disco.
   */
  private static init(): void {
    if (this.masterKey) return;

    if (!fs.existsSync(KEY_PATH)) {
      const dir = path.dirname(KEY_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      const newKey = crypto.randomBytes(32);
      fs.writeFileSync(KEY_PATH, newKey);
    }

    this.masterKey = fs.readFileSync(KEY_PATH);
  }

  /**
   * Criptografa um texto.
   */
  static encrypt(text: string): string {
    this.init();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Retorno: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Descriptografa um texto.
   */
  static decrypt(encryptedData: string): string {
    this.init();
    const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');
    
    if (!ivHex || !authTagHex || !encryptedText) {
      throw new Error('Formato de dados criptografados inválido no Vault.');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, this.masterKey, iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
