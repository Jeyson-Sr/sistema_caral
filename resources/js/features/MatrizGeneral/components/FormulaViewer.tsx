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

    function esGasCarbonico(row: any): boolean {
      return row?.descripcion && String(row.descripcion).toUpperCase().includes("GAS CARBONICO");
    }
    function esAzucar(row: any): boolean {
      return row?.descripcion && String(row.descripcion).toUpperCase().includes("AZUCAR REFINADA ESPECIAL IMPORTADA");
    }

    function calcularValor(
      data: any,
      row: any,
      computed: ComputedMetrics,
      paquetes?: number,
      batch?: number,
      valor?: boolean,
    ): number | string {

      

      if (esCajaMaster(row)) {
        return Math.round(Number(computed.paquetes_lanzados)) ?? 1;
      }
      // if (esGasCarbonico(row)) {
      //   const cantidad = Number(row.cantidad);
      //   return Math.round((Number(computed.cu30l ?? 0) * 30) * cantidad) ?? 0;
      // }

      if (valor === true) {
        // Calcular por batch
        if (esAzucar(row)) {
          return Math.round((Number(computed.cant_azucar_batch ?? 0)) * (batch ?? 1)) ?? 0;
        }

        const baseBatch = batch ?? 1;
        const valueBatch = Math.round(row.cantidad * baseBatch);
        return valueBatch;
      }

      // Flujo normal por paquetes
      if (esAzucar(row)) {
        return Math.round((Number(computed.cant_azucar_batch ?? 0)) * (batch ?? 1)) ?? 0;
      }

      let multiplier = 1;

      if (typeof data.cantidadPaquetes === "number" && data.cantidadPaquetes > 0) {
        multiplier = data.cantidadPaquetes;
      } else if (typeof data.cantidadBatch === "number" && data.cantidadBatch > 0) {
        multiplier = computed.paquetes_lanzados ?? 1;
      }

      const base = paquetes || computed.paquetes_lanzados || 1;
      const value = Math.round(row.cantidad * multiplier * base);

      return value;
    }


    const renderDiferencia = (stock: number | null, cantidad: number | string): React.ReactElement => {
      const diff = calcularDiferencia(stock, cantidad);
      const isPositive = Number(diff) >= 0;
      return (
        <span className={isPositive ? "text-emerald-600" : "text-rose-600"}>
          {Math.abs((Number(diff))).toLocaleString("es-MX")}
          {isPositive ? " ✓" : " -"}
        </span>
      );
    };

    const BatchMin = (stock: Number, cantidad: Number):Number | string=> {
      if (isNaN(Number(stock)) || isNaN(Number(cantidad))) {
        return 0;
      }
      return (Number(stock) / Number(cantidad)) * (batch ?? computed?.paquetes_lanzados ?? 1);
    } 

    const generarStackId = (): string => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
    const uuidShort = crypto.randomUUID().split('-')[0].toUpperCase(); // solo el primer bloque del UUID
    
    return `${week}${now.getFullYear()}-${uuidShort}`;
};



  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <AlertTriangle size={64} className="mb-4 opacity-30" />
        <h3 className="text-lg font-medium mb-2">No hay datos para mostrar</h3>
        <p className="text-sm text-center max-w-md">
          No se encontraron datos de receta para procesar.
        </p>
      </div>
    );
  }

const handleAgregarPlan = async () => {
  const payload = {
    UNmedida: batch !== undefined && batch > 0 ? batch : (paquetes ?? 1),
    stack: `PL-${generarStackId()}`,

    jarabe: (data.jarabe || []).map((row: any) => ({
      articulo: row.articulo,
      descripcion: row.descripcion,
      cantidad: calcularValor(data, row, computed, paquetes, batch, true),
    })),
    envasado: (data.envasado || []).map((row: any) => ({
      articulo: row.articulo,
      descripcion: row.descripcion,
      cantidad: calcularValor(data, row, computed, paquetes, batch),
    })),
  };

  console.log(payload)

  // tomar token CSRF desde meta
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

  try {
    const response = await fetch("/almacen-planeamiento", { // ruta en web.php
      method: "POST",
      credentials: "same-origin", // envía cookies de sesión
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRF-TOKEN": token,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    try {
      const result = JSON.parse(text);
      console.log("Respuesta JSON:", result);
      if (response.ok) {
        alert("Plan guardado correctamente ✅");
      } else {
        alert("Error: " + (result.error || JSON.stringify(result)));
      }
    } catch (e) {
      console.error("Respuesta no-JSON (HTML):", text);
      alert("Respuesta inesperada del servidor — revisa la consola o logs.");
    }
  } catch (err) {
    console.error("Error en la petición:", err);
    alert("Error de conexión con el servidor ❌");
  }
};



  return (
    <div className="space-y-8">

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
                  <h4 className="text-xl font-bold text-slate-800">Receta de Envasado</h4>
                  <p className="text-sm text-slate-600 mt-1">{data.envasado.length} componentes</p>
                </div>
                <div>
                  <p className="text-sm mt-1 text-emerald-600 bg-emerald-50 rounded-full border border-emerald-200 p-1 w-[100px]  text-center" > <sup>SKU</sup> {data.matchingRows[0]} </p>
                </div>
                <div className="ml-auto flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
                  <Calculator size={18} className="text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">
                    {paquetes ? `Paquetes: ${Number(paquetes).toLocaleString("es-MX")}` : `Paquetes: ${Math.round(computed.paquetes_lanzados || 1).toLocaleString("es-MX")}`}
                  </span>
                </div>
              </div>

            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-600/70 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Hash size={14} />
                        Artículo
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FileText size={14} />
                        Descripción
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Package size={14} />
                        Stock
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-100 uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-2">
                        <TrendingUp size={14} />
                        Cantidad
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-100 uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-2">
                        <BarChart3 size={14} />
                        Diferencia
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-100 uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-2">
                        <BarChart3 size={14} />
                        PAQ /MIN
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.envasado.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors duration-150">
                      <td className="px-6 py-4">
                        {/* Artículo */}
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-medium">
                          #{row.articulo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {/* Descripción */}
                        <span className="text-sm text-slate-800 font-medium">
                          {row.descripcion}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {/* Stock */}
                        <span className="text-sm text-slate-800 font-medium">
                          {Number(getSaldoFinal(row.articulo) || 0).toLocaleString("es-MX")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* Cantidad */}
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold">
                            {calcularValor(data, row, computed, paquetes, batch).toLocaleString("es-MX")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* Diferencia */}
                        <span  className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold">
                            {renderDiferencia(getSaldoFinal(row.articulo), calcularValor(data, row, computed, paquetes, batch))}  
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* BatchMin */}
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold">
                          {Number(Number(BatchMin(Number(getSaldoFinal(row.articulo)), Number(calcularValor(data, row, computed, paquetes, batch)))).toFixed(0)).toLocaleString("es-MX")}
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
                  <h4 className="text-xl font-bold text-slate-800">Receta de Jarabe</h4>
                  <p className="text-sm text-slate-600 mt-1">{data.jarabe.length} componentes</p>
                </div>
                <div>
                  <p className="text-sm mt-1 text-purple-600 bg-purple-50 rounded-full border border-purple-200 p-1 w-[100px]  text-center" > <sup>SKU</sup> {data.matchingRows[1]} </p>
                </div>
                <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-200">
                  <Calculator size={24} className="text-purple-600" />
                  <span className="text-base font-medium text-purple-700">Batch: {batch || 1}</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-600/70 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Hash size={14} />
                        Artículo
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FileText size={14} />
                        Descripción
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FileText size={14} />
                        Stock
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-100 uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-2">
                        <TrendingUp size={14} />
                        Cantidad
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-100 uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-2">
                        <BarChart3 size={14} />
                        Diferencia
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-100 uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-2">
                        <BarChart3 size={14} />
                        BATCH /MIN
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.jarabe.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors duration-150">
                      <td className="px-6 py-4">
                        {/* Artículo */}
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-medium">
                          #{row.articulo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {/* Descripción */}
                        <span className="text-sm text-slate-800 font-medium">
                          {row.descripcion}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {/* Stock */}
                        <span className="text-sm text-slate-800 font-medium">
                          {Number(getSaldoFinal(row.articulo) || 0).toLocaleString("es-MX")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* Cantidad */}
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold">
                          {calcularValor(data, row, computed, paquetes, batch, true).toLocaleString("es-MX")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* Diferencia */}
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold">
                          {renderDiferencia(getSaldoFinal(row.articulo), calcularValor(data, row, computed, paquetes, batch, true))}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* BatchMin */}
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold">
                          {Number(Number(BatchMin(Number(getSaldoFinal(row.articulo)), Number(calcularValor(data, row, computed, paquetes, batch, true)))).toFixed(1)).toLocaleString("es-MX")}
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

     

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAgregarPlan}
          className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors duration-150"
        >
          Agregar a Plan
        </button>
      </div>
    </div>
  );
};

export default FormulaViewer;