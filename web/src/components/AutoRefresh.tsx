'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Componente utilitário que força a revalidação dos Server Components
 * em um intervalo definido, permitindo atualizações em tempo real 
 * sem refresh de página (Soft Refresh).
 */
export function AutoRefresh({ interval = 3000 }: { interval?: number }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      // O router.refresh() do Next.js solicita ao servidor os novos dados
      // e faz o diff do DOM de forma inteligente (estilo AJAX/React)
      router.refresh();
    }, interval);

    return () => clearInterval(timer);
  }, [router, interval]);

  return null;
}
