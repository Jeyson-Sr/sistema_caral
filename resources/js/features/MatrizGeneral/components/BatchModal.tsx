// features/matrizGeneral/components/BatchModal.tsx
import React, { useMemo, useState } from "react";
import type { BatchData } from "../types";
import { fetchFormula } from "../services/matrizService";
import FormulaViewer from "./FormulaViewer";
import ProductionMetrics from "./MetricaProducion"; // <--- usa tu componente, sin lógica aquí

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
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
        <div className="relative max-w-4xl w-full mx-4 bg-black rounded-lg overflow-hidden shadow-lg text-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold">{title ?? "Calculadora de Producción"}</h2>
            <button onClick={onClose} className="text-sm text-gray-300">Cerrar</button>
          </div>

          {/* Datos de batch */}
          <div className="p-4 bg-black">
            <div className="mb-3 text-sm text-gray-300">
              <strong>Modo:</strong>{" "}
              {mode === "batch" ? "Batch" : mode === "paquetes" ? "Paquetes" : "Inválido"}
            </div>

            {/* Contenido principal de calculos batch */}
            <div className="flex items-start justify-between">
                <div>
                  <h4>Datos de Matriz</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  {Object.entries(data).length === 0 && (
                    <div className="text-sm text-red-400">No se recibieron datos en props.</div>
                  )}
                  {Object.entries(data).map(([k, v]) =>
                    v === undefined ? null : (
                      <div key={k} className="p-2 rounded-md bg-gray-800 flex flex-col gap-1">
                        <span className="text-xs text-gray-400">{labelize(k)}</span>
                        <strong className="text-base text-white">{String(v)}</strong>
                      </div>
                    )
                  )}
                </div>
                </div>

                {/*  componente ProductionMetrics*/}
                <div>
                  <ProductionMetrics data={data} />
                </div>
              </div>
          </div>

          {/* Footer con botones */}
          <div className="flex items-center justify-between gap-3 p-3 border-t border-gray-700">
            {errorMsg && <div className="text-red-400 text-sm mr-auto">{errorMsg}</div>}

            <button onClick={onClose} className="px-3 py-1 rounded border border-gray-700 hover:bg-gray-800">
              Cerrar
            </button>
            
            <button
              onClick={fetchFormulaData}
              disabled={loading}
              className="px-3 py-1 rounded border border-gray-700 hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Ver Fórmula"}
            </button>

          </div>
        </div>
      </div>

      {/* Overlay con la fórmula */}
      {isFormulaOpen && formulaData && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-auto bg-black/80 p-6">
          <div
            className="absolute inset-0"
            onClick={() => {
              setIsFormulaOpen(false);
              setFormulaData(null);
            }}
            aria-hidden
          />
          <div className="relative bg-gray-900 text-white rounded-xl shadow-lg max-w-6xl w-full mx-auto my-12">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold">Fórmula</h3>
              <button
                onClick={() => {
                  setIsFormulaOpen(false);
                  setFormulaData(null);
                }}
                className="px-3 py-1 rounded border border-gray-700 hover:bg-gray-800"
              >
                Cerrar
              </button>
            </div>
            <div className="p-6">
              <FormulaViewer data={formulaData} paquetes={(data as any).cantidadPaquetes} batch={(data as any).cantidadBatch}  />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BatchModal;
