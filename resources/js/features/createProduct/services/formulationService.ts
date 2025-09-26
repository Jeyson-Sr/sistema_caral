// resources/js/features/createProduct/services/formulationService.ts
import { apiFetch } from '@/lib/api-client';
import type { FormulationPayload } from '@/features/createProduct/types';


export async function postFormulation(payload: FormulationPayload) {
  return apiFetch('/formulas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
