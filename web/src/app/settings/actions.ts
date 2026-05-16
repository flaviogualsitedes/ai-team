'use server';

import { revalidatePath } from 'next/cache';
import { saveApiKey, updateSetting } from '@/lib/db';

export async function updateApiKeysAction(formData: FormData) {
  // Captura dinamicamente todos os campos que terminam em _key
  for (const [name, value] of formData.entries()) {
    if (name.endsWith('_key') && typeof value === 'string' && value && !value.includes('***')) {
      const provider = name.replace('_key', '');
      saveApiKey(provider, value);
    }
  }

  revalidatePath('/settings');
  return { success: true };
}

export async function updateGlobalSettingsAction(formData: FormData) {
  const defaultModel = formData.get('default_model') as string;
  const defaultProvider = formData.get('default_provider') as string;

  if (defaultModel) updateSetting('default_model', defaultModel);
  if (defaultProvider) updateSetting('default_provider', defaultProvider);

  revalidatePath('/settings');
  return { success: true };
}
