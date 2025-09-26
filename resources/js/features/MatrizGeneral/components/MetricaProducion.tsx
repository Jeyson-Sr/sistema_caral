// ProductionMetrics.tsx
import React from "react";
import { useProductionMetrics } from "../hooks/useMetricaProducion"; // adjust path
import type { ComputedMetrics } from "../utils/helperProduccion";

type RawInput = Record<string, any>;

type Props = {
  data: RawInput;
  className?: string;
  compact?: boolean; // muestra versión compacta
  children?: (computed: ComputedMetrics, inputs: Record<string, any>) => React.ReactNode;
};

const fmt = (v: number | null, decimals = 2) =>
  v === null ? null : Number(v).toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });

export default function ProductionMetrics({ data, className = "", compact = false, children }: Props) {
  const { computed, inputs } = useProductionMetrics(data);

  // Si el consumidor pasa children, devolvemos render prop para control total
  if (typeof children === "function") {
    return <>{children(computed, inputs)}</>;
  }

  // Vista por defecto — simple y reutilizable
  return (
    <div className={`production-metrics card ${className} p-0 rounded-lg shadow-lg bg-black`}>
      <h4 className="m-0 mb-2 text-white">Métricas de Producción</h4>

      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
        {computed.paquetes_x_pallets !== null && <Metric label="Paquetes x Pallet" value={fmt(computed.paquetes_x_pallets) || ''} />}
        {computed.paquetes_lanzados !== null && <Metric label="Paquetes lanzados" value={fmt(computed.paquetes_lanzados) || ''} />}
        {computed.horas_produccion !== null && <Metric label="Horas producción" value={fmt(computed.horas_produccion, 3) || ''} />}
        {computed.dias_produccion !== null && <Metric label="Días producción" value={fmt(computed.dias_produccion, 3) || ''} />}
        {computed.batch_minutos !== null && <Metric label="Minutos por batch" value={fmt(computed.batch_minutos, 3) || ''} />}
        {computed.paletas_produccion !== null && <Metric label="Paletas producción" value={fmt(computed.paletas_produccion) || ''} />}
        {computed.cu30l !== null && <Metric label="Cu30l" value={fmt(computed.cu30l) || ''} />}
        {computed.litros_jarabe_real !== null && <Metric label="Litros jarabe real" value={fmt(computed.litros_jarabe_real) || ''} />}
        {computed.kg_azucar_real !== null && <Metric label="Kg azúcar real" value={fmt(computed.kg_azucar_real, 3) || ''} />}
        {computed.velocidad_pallet_hora !== null && <Metric label="Velocidad pallet/hora" value={fmt(computed.velocidad_pallet_hora, 3) || ''} />}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-md bg-gray-800 flex flex-col gap-1">
      <span className="text-xs text-gray-400">{label}</span>
      <strong className="text-base text-white">{value}</strong>
    </div>
  );
}
