// resources/js/features/createProduct/services/productService.ts
import { apiFetch } from '@/lib/api-client';
import type { ProductPayload } from '@/features/createProduct/types';


export async function createProduct(payload: ProductPayload) {
  return apiFetch('/productos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}