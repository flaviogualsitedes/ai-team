import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Rota de Sistema: Update
 * Permite que a aplicação realize um self-update via Git.
 */
export async function POST() {
  try {
    console.log('🔄 Iniciando atualização do sistema via GitHub...');
    
    // 1. Git Pull para buscar as últimas mudanças
    const { stdout: gitOutput, stderr: gitError } = await execAsync('git pull origin main');
    
    if (gitError && !gitError.includes('Already up to date')) {
      console.error('❌ Erro no Git:', gitError);
      return NextResponse.json({ success: false, error: gitError }, { status: 500 });
    }

    console.log('✅ Git Pull concluído:', gitOutput);

    // 2. Se houver mudanças, poderíamos disparar um build, 
    // mas por enquanto vamos focar no Pull para garantir a sincronia.
    
    return NextResponse.json({ 
      success: true, 
      message: gitOutput.includes('Already up to date') ? 'Sistema já está atualizado.' : 'Sistema atualizado com sucesso!',
      details: gitOutput
    });

  } catch (error: any) {
    console.error('❌ Falha crítica no update:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
