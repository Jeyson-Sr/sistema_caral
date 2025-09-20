// resources/js/Components/AlmacenViewer.tsx
import React, { useMemo, useState } from 'react';

type Props = {
  urls?: { '05'?: string; '20'?: string }; // endpoints GET
  pageSize?: number;
  className?: string;
};

export default function AlmacenViewer({
  urls = { '05': '/almacen/05', '20': '/almacen/20' },
  pageSize = 50,
  className = '',
}: Props) {
  const [viewType, setViewType] = useState<'05' | '20' | null>(null);
  const [viewData, setViewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [columnFilter, setColumnFilter] = useState('');

  const columnLabels: { [key: string]: string } = {
    'articulo': 'ARTÍCULO',
    'descripcion': 'DESCRIPCIÓN',
    'u_m': 'U.M.',
    'contenido': 'CONTENIDO',
    'saldo_inicial': 'SALDO INICIAL',
    'ingresos': 'INGRESOS', 
    'salidas': 'SALIDAS',
    'saldo_final': 'SALDO FINAL',
    'lin_art': 'LIN ART',
    'nombre_linea': 'NOMBRE LÍNEA'
  };

  const fetchView = async (type: '05' | '20') => {
    setError(null);
    setLoading(true);
    setViewType(type);
    setPage(1);
    setQ('');
    setColumnFilter('');
    try {
      const url = urls[type];
      const res = await fetch(url!, {
        method: 'GET',
        credentials: 'same-origin',
        headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
      });
      if (!res.ok) {
        const t = await res.text();
        setError(`Error ${res.status}: ${t}`);
        setViewData([]);
      } else {
        const json = await res.json();
        setViewData(Array.isArray(json) ? json : json.data ?? []);
      }
    } catch (err: any) {
      console.error(err);
      setError('Error en la petición. Revisa consola.');
      setViewData([]);
    } finally {
      setLoading(false);
    }
  };

  const closeView = () => {
    setViewType(null);
    setViewData([]);
    setPage(1);
    setQ('');
    setColumnFilter('');
    setError(null);
  };

  const filtered = useMemo(() => {
    if (!q && !columnFilter) return viewData;
    
    return viewData.filter((row) => {
      const rowStr = JSON.stringify(row).toLowerCase();
      const qMatch = !q || rowStr.includes(q.toLowerCase());
      
      if (!columnFilter) return qMatch;
      
      return qMatch && Object.values(row).some(value => 
        String(value).toLowerCase().includes(columnFilter.toLowerCase())
      );
    });
  }, [viewData, q, columnFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = useMemo(() => {
    if (!viewData.length) return [];
    return Object.keys(viewData[0]).filter(key => 
      key !== 'created_at' && 
      key !== 'updated_at' && 
      columnLabels.hasOwnProperty(key)
    );
  }, [viewData]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${className}`}>
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header y controles principales */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-8 shadow-2xl border border-slate-600/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Visor de Almacenes</h1>
              <p className="text-slate-300">Consulta el inventario de los almacenes 05 y 20</p>
            </div>
            
            {loading && (
              <div className="flex items-center gap-3 text-blue-400">
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium">Cargando...</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <button 
              onClick={() => fetchView('05')} 
              className={`px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg ${
                viewType === '05' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-slate-600 hover:bg-blue-600 text-white hover:shadow-blue-500/25'
              }`}
            >
              📦 Almacén 05
            </button>
            
            <button 
              onClick={() => fetchView('20')} 
              className={`px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg ${
                viewType === '20' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-slate-600 hover:bg-blue-600 text-white hover:shadow-blue-500/25'
              }`}
            >
              🏪 Almacén 20
            </button>
            
            {viewType && (
              <button 
                onClick={closeView} 
                className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold 
                           transition-all hover:shadow-lg hover:shadow-red-500/25"
              >
                ✕ Cerrar Vista
              </button>
            )}

            {error && (
              <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>

        {/* Tabla de datos */}
        {viewType && (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            {/* Header de la tabla con controles */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <h2 className="text-2xl font-bold text-white">
                    Almacén {viewType}
                  </h2>
                </div>
                <div className="px-4 py-2 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-300 font-medium">
                    {viewData.length.toLocaleString()} registros
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <input
                    placeholder="🔍 Buscar en todos los campos..."
                    value={q}
                    onChange={(e) => { setQ(e.target.value); setPage(1); }}
                    className="w-full sm:w-80 px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                             placeholder:text-slate-400"
                  />
                  {q && (
                    <button
                      onClick={() => { setQ(''); setPage(1); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tabla responsive */}
            <div className="overflow-hidden rounded-xl border border-slate-700/50 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/80">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-slate-300 bg-slate-900/50">
                        #
                      </th>
                      {columns.map((c) => (
                        <th key={c} className="px-6 py-4 text-left font-semibold text-slate-300">
                          {columnLabels[c]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {pageData.map((row, i) => (
                      <tr 
                        key={i} 
                        className="hover:bg-slate-700/30 transition-colors group"
                      >
                        <td className="px-6 py-4 text-slate-400 font-mono text-sm bg-slate-900/20">
                          {(page - 1) * pageSize + i + 1}
                        </td>
                        {columns.map((c) => (
                          <td key={c} className="px-6 py-4 text-slate-200">
                            <div className="max-w-xs truncate" title={String(row[c] ?? '')}>
                              {c === 'descripcion' ? (
                                <span className="font-medium">{String(row[c] ?? '')}</span>
                              ) : c === 'articulo' ? (
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded font-mono text-sm">
                                  {String(row[c] ?? '')}
                                </span>
                              ) : typeof row[c] === 'number' ? (
                                <span className="font-mono text-emerald-300">
                                  {row[c]?.toLocaleString() ?? ''}
                                </span>
                              ) : (
                                String(row[c] ?? '')
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Estado vacío */}
                {pageData.length === 0 && !loading && (
                  <div className="text-center py-16 text-slate-400">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold mb-2">No hay datos para mostrar</h3>
                    <p>
                      {q ? 'No se encontraron resultados para tu búsqueda' : 'No hay registros disponibles'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Paginación */}
            {pageData.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-8 pt-6 border-t border-slate-700/50">
                <div className="text-slate-400 text-center sm:text-left">
                  <span className="font-medium text-white">Página {page}</span> de {totalPages} • 
                  Mostrando <span className="font-medium text-white">{pageData.length}</span> de {' '}
                  <span className="font-medium text-white">{filtered.length.toLocaleString()}</span> registros
                  {q && <span className="text-blue-300"> (filtrados)</span>}
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    disabled={page <= 1} 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white 
                             disabled:opacity-50 disabled:cursor-not-allowed transition-all
                             hover:shadow-lg font-medium"
                  >
                    ← Anterior
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + Math.max(1, page - 2);
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            pageNum === page
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                              : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button 
                    disabled={page >= totalPages} 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white 
                             disabled:opacity-50 disabled:cursor-not-allowed transition-all
                             hover:shadow-lg font-medium"
                  >
                    Siguiente →
                  </button>

                  <div className="w-px h-6 bg-slate-600 mx-2"></div>

                  <button 
                    onClick={() => { setPage(1); setQ(''); setColumnFilter(''); }} 
                    className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white 
                             transition-all hover:shadow-lg font-medium"
                  >
                    🔄 Limpiar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estado inicial cuando no hay vista seleccionada */}
        {!viewType && (
          <div className="bg-slate-800/30 rounded-2xl p-16 text-center border border-slate-700/30">
            <div className="text-8xl mb-6">📋</div>
            <h2 className="text-2xl font-bold text-white mb-4">Selecciona un Almacén</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Elige el almacén 05 o 20 para comenzar a visualizar el inventario y realizar búsquedas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}