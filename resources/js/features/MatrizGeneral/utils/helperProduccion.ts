export interface ProductionInput {
  cantidadBatch?: number;
  formato?: number;
  litrosBatch?: number;
  bebidaFinal?: number;
  factorAzucar?: number;
  efiVelocidad?: number;
  velocidadBot?: number;
  unidadPaquete?: number;
  paquetesNivel?: number;
  cartonNivel?: number;
  cantidadPaquetes?: number;
  skuJarabe?: string;
  skuEnvasado?: string;
}

export interface ComputedMetrics {
  paquetes_x_pallets: number | null;
  ratio_bebida: number | null;
  cant_azucar_batch: number | null;
  paquetes_lanzados: number | null;
  horas_produccion: number | null;
  dias_produccion: number | null;
  batch_minutos: number | null;
  paletas_produccion: number | null;
  cu30l: number | null;
  litros_jarabe_real: number | null;
  kg_azucar_real: number | null;
  velocidad_pallet_hora: number | null;
  
}

export interface ProductionCache {
  computed: ComputedMetrics;
}

export interface ProductionResult {
  inputs: ProductionInput;
  computed: ComputedMetrics;
}

function toNumber(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return isFinite(v) ? v : null;
  const n = Number(String(v).replace(',', '.'));
  return isFinite(n) ? n : null;
}

export function computeProductionMetrics(input: ProductionInput): ProductionResult {
  // Convert all input values to numbers
  const formato = toNumber(input.formato) ?? 0;
  const litros_batch = toNumber(input.litrosBatch) ?? 0;
  const bebida_final = toNumber(input.bebidaFinal) ?? 0;
  const factor_azucar_kg = toNumber(input.factorAzucar) ?? 0;
  const cantidad_batch = toNumber(input.cantidadBatch) ?? 0;
  const unidad_x_paquete = toNumber(input.unidadPaquete) ?? 0;
  const velocidad_bot_hora = toNumber(input.velocidadBot) ?? 0;
  let pct_efi = toNumber(input.efiVelocidad) ?? 0;
  const paquetes_x_nivel = toNumber(input.paquetesNivel) ?? 0;
  const carton_x_nivel = toNumber(input.cartonNivel) ?? 0;
  const cantidad_paquetes = toNumber(input.cantidadPaquetes);

  // Normalize percentage (85 -> 0.85)
  if (pct_efi > 1) pct_efi = pct_efi / 100;

  // Initialize all metrics as null
  let paquetes_x_pallets: number | null = null;
  let ratio_bebida: number | null = null;
  let cant_azucar_batch: number | null = null;
  let paquetes_lanzados: number | null = null;
  let horas_produccion: number | null = null;
  let dias_produccion: number | null = null;
  let batch_minutos: number | null = null;
  let paletas_produccion: number | null = null;
  let cu30l: number | null = null;
  let litros_jarabe_real: number | null = null;
  let kg_azucar_real: number | null = null;
  let velocidad_pallet_hora: number | null = null;

  // Calculate paquetes_x_pallets regardless of mode
  if (paquetes_x_nivel > 0 && carton_x_nivel > 0) {
    paquetes_x_pallets = paquetes_x_nivel * carton_x_nivel;
  }

  if (cantidad_batch > 0) {
    // Batch mode calculations
    ratio_bebida = bebida_final > 0 ? litros_batch / bebida_final : null;
    cant_azucar_batch = (bebida_final > 0 && factor_azucar_kg !== null) ? bebida_final * factor_azucar_kg : null;

    if (formato > 0 && unidad_x_paquete > 0) {
      paquetes_lanzados = (cantidad_batch * bebida_final) / formato / unidad_x_paquete;
    }

    if (velocidad_bot_hora > 0 && pct_efi > 0 && formato > 0) {
      horas_produccion = (bebida_final) / ((velocidad_bot_hora * pct_efi) * formato) * cantidad_batch;
    }

    if (horas_produccion !== null) {
      batch_minutos = (horas_produccion / cantidad_batch) * 60;
      dias_produccion = horas_produccion / 24;
    }

    litros_jarabe_real = (litros_batch > 0) ? cantidad_batch * litros_batch : null;
    kg_azucar_real = (factor_azucar_kg > 0 && cant_azucar_batch !== null) ? cantidad_batch * cant_azucar_batch : null;

  } else if (cantidad_paquetes !== null) {
    // Package mode calculations - only calculate specific metrics
    paquetes_lanzados = cantidad_paquetes;

    if (velocidad_bot_hora > 0 && unidad_x_paquete > 0 && pct_efi > 0) {
      horas_produccion = (paquetes_lanzados / velocidad_bot_hora) * unidad_x_paquete / pct_efi;
      dias_produccion = horas_produccion / 24;
    }
  }

  // Common calculations for both modes
  if (paquetes_lanzados !== null && paquetes_x_pallets && paquetes_x_pallets > 0) {
    paletas_produccion = paquetes_lanzados / paquetes_x_pallets;
  }

  if (paquetes_lanzados !== null && formato > 0 && unidad_x_paquete > 0) {
    cu30l = paquetes_lanzados * formato * unidad_x_paquete / 30;
  }

  if (velocidad_bot_hora > 0 && unidad_x_paquete > 0 && paquetes_x_pallets && paquetes_x_pallets > 0) {
    velocidad_pallet_hora = velocidad_bot_hora / unidad_x_paquete / paquetes_x_pallets;
  }

  
  const computed: ComputedMetrics = {
    paquetes_x_pallets,
    ratio_bebida,
    cant_azucar_batch,
    paquetes_lanzados,
    horas_produccion,
    dias_produccion,
    batch_minutos,
    paletas_produccion,
    cu30l,
    litros_jarabe_real,
    kg_azucar_real,
    velocidad_pallet_hora,
  };
  
  return {
    inputs: input,
    computed,
  };
}



export function calculatePackagesLaunched(
  formato: number,
  unidad_x_paquete: number,
  cantidad_batch: number,
  bebida_final: number
): number | null {
  if (formato > 0 && unidad_x_paquete > 0) {
    return (cantidad_batch * bebida_final) / formato / unidad_x_paquete;
  }
  return null;
}


// Example usage in .tsx (not exported, just for reference):
/*
import React, { useMemo } from 'react';
import { computeProductionMetrics } from './helperProduccion';

export default function ExampleBatchMetrics() {
  const input = {
    formato: 1.5,
    litrosBatch: 200,
    bebidaFinal: 180,
    factorAzucar: 0.12,
    cantidadBatch: 10,
    unidadPaquete: 6,
    velocidadBot: 2000,
    efiVelocidad: 85,
    paquetesNivel: 4,
    cartonNivel: 2,
  };

  const { computed } = useMemo(() => computeProductionMetrics(input), [JSON.stringify(input)]);

  return (
    <div>
      <h3>Métricas de producción</h3>
      <ul>
        <li>Paquetes lanzados: {computed.paquetes_lanzados ?? '—'}</li>
        <li>Horas producción: {computed.horas_produccion ?? '—'}</li>
        <li>Batch minutos: {computed.batch_minutos ?? '—'}</li>
        <li>Paletas: {computed.paletas_produccion ?? '—'}</li>
      </ul>
    </div>
  );
}
*/
