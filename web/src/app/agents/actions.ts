'use server';

import { updateAgent } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Ação para atualizar um agente.
 */
export async function saveAgentAction(id: string, formData: FormData) {
  // Extrai os dados do formulário conforme o schema real
  const data = {
    name: formData.get('name') as string,
    role: formData.get('role') as string,
    personality: formData.get('personality') as string,
    systemPrompt: formData.get('systemPrompt') as string,
    model: formData.get('model') as string,
    temperature: parseFloat(formData.get('temperature') as string) / 100,
  };

  // Salva no banco
  updateAgent(id, data);

  // Revalida o cache
  revalidatePath('/agents');
  revalidatePath(`/agents/${id}`);

  // Redireciona
  redirect('/agents');
}
