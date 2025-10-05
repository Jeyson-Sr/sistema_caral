// features/matrizGeneral/components/BatchModal.tsx
import React, { useMemo, useState } from "react";
import type { BatchData } from "../types";
import { fetchFormula } from "../services/matrizService";
import FormulaViewer from "./FormulaViewer";
import ProductionMetrics from "./MetricaProducion";
import { 
  X, 
  Calculator, 
  Package, 
  Beaker, 
  FileSpreadsheet, 
  Loader2, 
  AlertTriangle,
  Info,
  TrendingUp,
  Hash,
  Settings
} from "lucide-react";

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BatchData;
  title?: string;
}

const labelize = (k: string) =>
  k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();

const numberOrSkip = (v?: number) =>
  typeof v === "number" && !Number.isNaN(v) ? v : undefined;

const BatchModal: React.FC<BatchModalProps> = ({ isOpen, onClose, data, title }) => {
  const [formulaData, setFormulaData] = useState<any>(null);
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mode = useMemo(() => {
    if (numberOrSkip((data as any).cantidadPaquetes) && (data as any).cantidadPaquetes! > 0) return "paquetes";
    if (numberOrSkip((data as any).cantidadBatch) && (data as any).cantidadBatch! > 0) return "batch";
    return "invalid";
  }, [data]);

  const fetchFormulaData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchFormula(Number((data as any).skuJarabe) ?? null, Number((data as any).skuEnvasado) ?? null);
      setFormulaData(res);
      setIsFormulaOpen(true);
    } catch (err: any) {
      console.error("❌ Error fetch fórmula:", err);
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden />
        <div className="relative max-w-6xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {title ?? "Calculadora de Producción"}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full border ${
                      mode === "batch" 
                        ? "bg-emerald-500/20 border-emerald-300/50 text-emerald-100" 
                        : mode === "paquetes" 
                        ? "bg-blue-500/20 border-blue-300/50 text-blue-100"
                        : "bg-red-500/20 border-red-300/50 text-red-100"
                    }`}>
                      {mode === "batch" ? (
                        <Beaker size={14} />
                      ) : mode === "paquetes" ? (
                        <Package size={14} />
                      ) : (
                        <AlertTriangle size={14} />
                      )}
                      <span className="text-sm font-medium">
                        Modo: {mode === "batch" ? "Batch" : mode === "paquetes" ? "Paquetes" : "Inválido"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg border border-white/30 text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 bg-gradient-to-br from-slate-50 to-white">
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Left Column - Datos de Matriz */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                    <Info className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">Datos de Matriz</h4>
                </div>

                {Object.entries(data).length === 0 ? (
                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-red-700 font-medium">No se recibieron datos en props.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(data).map(([k, v]) =>
                      v === undefined ? null : (
                        <div key={k} className="group relative overflow-hidden bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                              {k.includes('sku') && <Hash size={14} className="text-slate-500" />}
                              {k.includes('cantidad') && <TrendingUp size={14} className="text-slate-500" />}
                              {!k.includes('sku') && !k.includes('cantidad') && <Settings size={14} className="text-slate-500" />}
                              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                {labelize(k)}
                              </span>
                            </div>
                            <div className="text-lg font-bold text-slate-800">
                              {String(v)}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Right Column - Production Metrics */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">Métricas de Producción</h4>
                </div>
                <div className="bg-white">
                  <ProductionMetrics data={data} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 p-6 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {errorMsg && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-200">
                    <AlertTriangle size={16} className="text-red-500" />
                    <span className="text-sm text-red-700 font-medium">{errorMsg}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={onClose}
                  className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-all"
                >
                  Cerrar
                </button>
                
                <button
                  onClick={fetchFormulaData}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet size={16} />
                      Ver Fórmula
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formula Overlay */}
      {isFormulaOpen && formulaData && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-auto p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => {
            setIsFormulaOpen(false);
            setFormulaData(null);
          }} aria-hidden />
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-7xl w-full mx-auto my-12 overflow-hidden">
            {/* Formula Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <FileSpreadsheet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Fórmula de Producción</h3>
                    <p className="text-emerald-100 mt-1">Detalles completos del proceso</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsFormulaOpen(false);
                    setFormulaData(null);
                  }}
                  className="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg border border-white/30 text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Formula Content */}
            <div className="p-8 bg-gradient-to-br from-slate-50 to-white max-h-[80vh] overflow-auto">
              <FormulaViewer 
                data={formulaData} 
                paquetes={(data as any).cantidadPaquetes} 
                batch={(data as any).cantidadBatch}  
                catidades={(data as any)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BatchModal;