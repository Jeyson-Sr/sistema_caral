// features/matrizGeneral/components/FormulaViewer.tsx
import React from "react";



interface FormulaViewerProps {
  data: any;
  paquetes?: number | undefined;
  batch?: number | undefined;
}

const FormulaViewer: React.FC<FormulaViewerProps> = ({ data, paquetes, batch }) => {



  if (!data) return <div>No hay datos para mostrar</div>;
  return (
    <div className="space-y-6">
      {/* Jarabe */}
      {data.jarabe && data.jarabe.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-2">Jarabe</h4>
          <table className="w-full border border-gray-700 text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-2 py-1 border border-gray-700">Artículo</th>
                <th className="px-2 py-1 border border-gray-700">Descripción</th>
                <th className="px-2 py-1 border border-gray-700">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {data.jarabe.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-800">
                  <td className="px-2 py-1 border border-gray-700">{row.articulo}</td>
                  <td className="px-2 py-1 border border-gray-700">{row.descripcion}</td>
                  <td className="px-2 py-1 border border-gray-700">
                    {Number.isInteger(row.cantidad * (batch || 1))
                      ? row.cantidad * (batch || 1)
                      : (row.cantidad * (batch || 1)).toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Envasado */}
      {data.envasado && data.envasado.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-2">Envasado</h4>
          <table className="w-full border border-gray-700 text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-2 py-1 border border-gray-700">Artículo</th>
                <th className="px-2 py-1 border border-gray-700">Descripción</th>
                <th className="px-2 py-1 border border-gray-700">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {data.envasado.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-800">
                  <td className="px-2 py-1 border border-gray-700">{row.articulo}</td>
                  <td className="px-2 py-1 border border-gray-700">{row.descripcion}</td>
                  <td className="px-2 py-1 border border-gray-700">
                    {(() => {
                      const multiplier =
                        data.cantidadPaquetes && typeof data.cantidadPaquetes === "number" && data.cantidadPaquetes > 0
                          ? data.cantidadPaquetes
                          : data.cantidadBatch && typeof data.cantidadBatch === "number" && data.cantidadBatch > 0
                          ? data.cantidadBatch
                          : 1;
                      const value = row.cantidad * multiplier * (paquetes || batch || 1);
                      return Number.isInteger(value) ? value : value.toFixed(4);
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Coincidencias */}
      {data.matchingRows && data.matchingRows.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-2">Coincidencias (Jarabe + Envasado)</h4>
          <table className="w-full border border-gray-700 text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-2 py-1 border border-gray-700">Artículo</th>
                <th className="px-2 py-1 border border-gray-700">Descripción Jarabe</th>
                <th className="px-2 py-1 border border-gray-700">Descripción Envasado</th>
              </tr>
            </thead>
            <tbody>
              {data.matchingRows.map((row: any, idx: number) => {
                const envasadoMatch = data.envasado.find((e: any) => e.articulo === row.articulo);
                return (
                  <tr key={idx} className="hover:bg-gray-800">
                    <td className="px-2 py-1 border border-gray-700">{row.articulo}</td>
                    <td className="px-2 py-1 border border-gray-700">{row.descripcion}</td>
                    <td className="px-2 py-1 border border-gray-700">{envasadoMatch?.descripcion ?? "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FormulaViewer;
