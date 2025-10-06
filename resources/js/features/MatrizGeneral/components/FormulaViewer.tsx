// features/matrizGeneral/components/FormulaViewer.tsx
import React, { useMemo } from "react";
import { useProductionMetrics } from "../hooks/useMetricaProducion"; 
import type { ComputedMetrics } from "../utils/helperProduccion";
import { 
  Beaker, 
  Package, 
  Hash, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Calculator,
  BarChart3
} from "lucide-react";
import { AlmacenResponse } from "../types";

interface FormulaViewerProps {
  data: any;
  paquetes?: number | undefined;
  batch?: number | undefined;
  catidades?: any;
  almacenData?: AlmacenResponse | null;
}



const FormulaViewer: React.FC<FormulaViewerProps> = ({ data, paquetes, batch, catidades, almacenData }) => {


    const { computed, inputs } = useProductionMetrics(catidades);

    const getSaldoFinal = (articulo: number): number | null => {
      if (Array.isArray(almacenData)) {
        const item = almacenData.find((i) => i.articulo === articulo);
        return item ? item.saldo_final : null;
      }
      return null;
    };  

    function calcularDiferencia(stcok: any, cantidad: any): number {
      const stockFinal = Number(stcok);
      const cantidadFinal = Number(cantidad);
      if (isNaN(stockFinal) || isNaN(cantidadFinal)) {
        return 0;
      }
      return stockFinal - cantidadFinal;
    }



    function esCajaMaster(row: any): boolean {
      return row?.descripcion && String(row.descripcion).toUpperCase().includes("CAJA MASTER");
    }

    function calcularValor(
      data: any,
      row: any,
      computed: ComputedMetrics,
      paquetes?: number,
      batch?: number
    ): number | string {

      if (esCajaMaster(row)) {
        return Math.round(Number(computed.paquetes_lanzados)) ?? 1;
      }

      let multiplier = 1;

      if (typeof data.cantidadPaquetes === "number" && data.cantidadPaquetes > 0) {
        multiplier = data.cantidadPaquetes;
      } else if (typeof data.cantidadBatch === "number" && data.cantidadBatch > 0) {
        multiplier = computed.paquetes_lanzados ?? 1;
      }

      const base = paquetes || computed.paquetes_lanzados || 1;
      const value = row.cantidad * multiplier * base;

      return Number.isInteger(value) ? value : value.toFixed(4);
    }

    // Helper to format a quantity that may be multiplied by batch
    const formatBatch = (qty: number, batchMultiplier: number): number | string => {
      const total = qty * batchMultiplier;
      return Number.isInteger(total) ? total : total.toFixed(4);
    };

    const renderDiferencia = (stock: number | null, cantidad: number | string): React.ReactElement => {
      const diff = calcularDiferencia(stock, cantidad);
      const isPositive = Number(diff) >= 0;
      return (
        <span className={isPositive ? "text-emerald-600" : "text-rose-600"}>
          {Math.abs(Number(diff)).toLocaleString("es-MX")}
          {isPositive ? " ✓" : " -"}
        </span>
      );
    };



  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <AlertTriangle size={64} className="mb-4 opacity-30" />
        <h3 className="text-lg font-medium mb-2">No hay datos para mostrar</h3>
        <p className="text-sm text-center max-w-md">
          No se encontraron datos de fórmula para procesar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Jarabe Section */}
      {data.jarabe && data.jarabe.length > 0 && (
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-indigo-50/30"></div>
          <div className="relative">
            {/* Section Header */}
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl border border-purple-200">
                  <Beaker className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800">Fórmula de Jarabe</h4>
                  <p className="text-sm text-slate-600 mt-1">{data.jarabe.length} componentes</p>
                </div>
                <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full border border-purple-200">
                  <Calculator size={14} className="text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">Batch: {batch || 1}</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Hash size={14} />
                        Artículo
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FileText size={14} />
                        Descripción
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FileText size={14} />
                        Stock
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-2">
                        <TrendingUp size={14} />
                        Cantidad
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-2">
                        <BarChart3 size={14} />
                        Diferencia
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.jarabe.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-medium">
                          #{row.articulo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-800 font-medium">
                          {row.descripcion}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-800 font-medium">
                          {(getSaldoFinal(row.articulo) || 0).toLocaleString("es-MX")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold">
                          {formatBatch(row.cantidad, batch || 1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold">
                          {renderDiferencia(getSaldoFinal(row.articulo), formatBatch(row.cantidad, batch || 1))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Envasado Section */}
      {data.envasado && data.envasado.length > 0 && (
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-green-50/30"></div>
          <div className="relative">
            {/* Section Header */}
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl border border-emerald-200">
                  <Package className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800">Fórmula de Envasado</h4>
                  <p className="text-sm text-slate-600 mt-1">{data.envasado.length} componentes</p>
                </div>
                <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
                  <Calculator size={14} className="text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700">
                    {paquetes ? `Paquetes: ${Number(paquetes).toLocaleString("es-MX")}` : `Paquetes: ${Math.round(computed.paquetes_lanzados || 1).toLocaleString("es-MX")}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Hash size={14} />
                        Artículo
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FileText size={14} />
                        Descripción
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Package size={14} />
                        Stock
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-2">
                        <TrendingUp size={14} />
                        Cantidad
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-2">
                        <BarChart3 size={14} />
                        Diferencia
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.envasado.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-medium">
                          #{row.articulo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-800 font-medium">
                          {row.descripcion}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-800 font-medium">
                          {Math.round(getSaldoFinal(row.articulo) || 0).toLocaleString("es-MX")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold">
                            {calcularValor(data, row, computed, paquetes, batch).toLocaleString("es-MX")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span  className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold">
                            {renderDiferencia(getSaldoFinal(row.articulo), calcularValor(data, row, computed, paquetes, batch))}  
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Coincidencias Section */}
      {data.matchingRows && data.matchingRows.length > 0 && (
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50/50 to-orange-50/30"></div>
          <div className="relative">
            {/* Section Header */}
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl border border-amber-200">
                  <CheckCircle2 className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800">Coincidencias</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Artículos que aparecen tanto en jarabe como en envasado
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200">
                  <CheckCircle2 size={14} className="text-amber-600" />
                  <span className="text-xs font-medium text-amber-700">{data.matchingRows.length} coincidencias</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Hash size={14} />
                        Artículo
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Beaker size={14} />
                        Descripción Jarabe
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Package size={14} />
                        Descripción Envasado
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.matchingRows.map((row: any, idx: number) => {
                    const envasadoMatch = data.envasado.find((e: any) => e.articulo === row.articulo);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-medium">
                            #{row.articulo}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-800 font-medium">
                            {row.descripcion}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {envasadoMatch?.descripcion ? (
                            <span className="text-sm text-slate-800 font-medium">
                              {envasadoMatch.descripcion}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-xs">
                              Sin coincidencia
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button type="button" className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors duration-150">
          Agregar a Plan
        </button>
      </div>
    </div>
  );
};

export default FormulaViewer;