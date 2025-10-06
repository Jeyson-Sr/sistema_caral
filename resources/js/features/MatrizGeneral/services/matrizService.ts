// features/matrizGeneral/services/matrizService.ts
import { apiFetch } from "@/lib/api-client";
import type { Product, FormulaResponse, AlmacenResponse } from "@/features/MatrizGeneral/types";

/** Obtener lista de productos (transformación mínima) */
export async function getProductos(): Promise<Product[]> {
  return apiFetch<Product[]>("/productos/list");
}

/** Pedir fórmula al backend */
export async function fetchFormula(skuJarabe?: number | null, skuEnvasado?: number | null): Promise<FormulaResponse> {
  return apiFetch<FormulaResponse>("/formulas/create", {
    method: "POST",
    body: JSON.stringify({ skuJarabe, skuEnvasado }),
  });
}


export async function fetchAlmacen(url: string) {
  return apiFetch<AlmacenResponse>(url, {
    method: "GET",
  });
}
