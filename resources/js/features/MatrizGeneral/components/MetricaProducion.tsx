// ProductionMetrics.tsx
import React, { useState } from "react";
import { useProductionMetrics } from "../hooks/useMetricaProducion"; // adjust path
import type { ComputedMetrics } from "../utils/helperProduccion";
import {
  Clock,
  Calendar,
  Package,
  Zap,
  Beaker,
  Scale,
  TrendingUp,
  Activity,
  BarChart3,
  Timer
} from "lucide-react";

type RawInput = Record<string, any>;

type Props = {
  data: RawInput;
  className?: string;
  compact?: boolean; // muestra versión compacta
  children?: (computed: ComputedMetrics, inputs: Record<string, any>) => React.ReactNode;
};

const fmt = (v: number | null, decimals = 2) =>
  v === null ? null : Number(v).toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });

const getMetricIcon = (label: string) => {
  if (label.includes('Paquetes')) return <Package size={16} />;
  if (label.includes('Horas')) return <Clock size={16} />;
  if (label.includes('Turnos')) return <Calendar size={16} />;
  if (label.includes('Minutos')) return <Timer size={16} />;
  if (label.includes('Paletas')) return <BarChart3 size={16} />;
  if (label.includes('Velocidad')) return <Zap size={16} />;
  if (label.includes('jarabe') || label.includes('Cu30l')) return <Beaker size={16} />;
  if (label.includes('azúcar') || label.includes('Kg')) return <Scale size={16} />;
  return <TrendingUp size={16} />;
};

const getMetricColor = (label: string) => {
  if (label.includes('Paquetes')) return 'from-blue-50 to-indigo-50 border-blue-200 text-blue-700';
  if (label.includes('Horas') || label.includes('Turnos') || label.includes('Minutos')) return 'from-purple-50 to-violet-50 border-purple-200 text-purple-700';
  if (label.includes('Paletas')) return 'from-emerald-50 to-green-50 border-emerald-200 text-emerald-700';
  if (label.includes('Velocidad')) return 'from-amber-50 to-orange-50 border-amber-200 text-amber-700';
  if (label.includes('jarabe') || label.includes('Cu30l')) return 'from-cyan-50 to-blue-50 border-cyan-200 text-cyan-700';
  if (label.includes('azúcar') || label.includes('Kg')) return 'from-pink-50 to-rose-50 border-pink-200 text-pink-700';
  return 'from-slate-50 to-gray-50 border-slate-200 text-slate-700';
};

export default function ProductionMetrics({ data, className = "", compact = false, children }: Props) {
  const { computed, inputs } = useProductionMetrics(data);

  // Si el consumidor pasa children, devolvemos render prop para control total
  if (typeof children === "function") {
    return <>{children(computed, inputs)}</>;
  }


  const metrics = [
    { key: 'paquetes_x_pallets', label: 'Paquetes x Pallet', value: computed.paquetes_x_pallets },
    { key: 'paquetes_lanzados', label: 'Paquetes lanzados', value: computed.paquetes_lanzados },
    { key: 'horas_produccion', label: 'Horas producción', value: computed.horas_produccion, decimals: 3 },
    { key: 'dias_produccion', label: 'Turnos de producción', value: computed.dias_produccion, decimals: 3 },
    { key: 'batch_minutos', label: 'Minutos por batch', value: computed.batch_minutos, decimals: 3 },
    { key: 'paletas_produccion', label: 'Paletas producción', value: computed.paletas_produccion },
    { key: 'cu30l', label: 'Cu30l', value: computed.cu30l },
    { key: 'litros_jarabe_real', label: 'Litros jarabe real', value: computed.litros_jarabe_real },
    { key: 'kg_azucar_real', label: 'Kg azúcar real', value: computed.kg_azucar_real, decimals: 3 },
    { key: 'velocidad_pallet_hora', label: 'Velocidad pallet/hora', value: computed.velocidad_pallet_hora, decimals: 3 },
  ].filter(metric => metric.value !== null);

  // Vista por defecto — simple y reutilizable
  return (
    <>
      {/* <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg border border-blue-200">
          <Activity className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-800 m-0">Métricas de Producción</h4>
          <p className="text-sm text-slate-600 mt-1">{metrics.length} métricas calculadas</p>
        </div>
      </div> */}

      {metrics.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-slate-500">
          <Activity size={48} className="mb-3 opacity-30" />
          <p className="text-sm">No hay métricas para calcular</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${compact ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {metrics.map(({ key, label, value, decimals = 2 }) => (
            <Metric 
              key={key}
              label={label} 
              value={fmt(value, decimals) || ''} 
              icon={getMetricIcon(label)}
              colorClass={getMetricColor(label)}
            />
          ))}
        </div>
      )}
    </>
  );
}


function Metric({ 
  label, 
  value, 
  icon, 
  colorClass 
}: { 
  label: string; 
  value: string; 
  icon: React.ReactNode;
  colorClass: string;
}) {
  return (
    <div className={`group relative overflow-hidden bg-gradient-to-br ${colorClass} rounded-xl border p-4 hover:shadow-md transition-all duration-200`}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-current opacity-70">
              {icon}
            </div>
            <span className="text-xs font-semibold text-current opacity-80 uppercase tracking-wider leading-tight">
              {label}
            </span>
          </div>
          <div className="text-lg font-bold text-current">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}