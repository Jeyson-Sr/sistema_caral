// resources/js/Components/AlmacenViewer.tsx
import React, { useMemo, useState } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  RefreshCw, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  Warehouse, 
  FileText,
  AlertCircle,
  Loader2,
  Eye,
  Settings
} from 'lucide-react';

type Props = {
  urls?: { '05'?: string; '13'?: string; '20'?: string }; // endpoints GET
  pageSize?: number;
  className?: string;
};

export default function AlmacenViewer({
  urls = { '05': '/almacen/05', '13': '/almacen/13', '20': '/almacen/20' },
  pageSize = 50,
  className = '',
}: Props) {
  const [viewType, setViewType] = useState<'05' | '13' | '20' | null>(null);
  const [viewData, setViewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [columnFilter, setColumnFilter] = useState('');

  const columnLabels: { [key: string]: string } = {
    'articulo': 'ARTÍCULO',
    'descripcion': 'DESCRIPCIÓN',
    'u_m': 'UNIDAD MEDIDA',
    'contenido': 'CONTENIDO',
    'saldo_inicial': 'SALDO INICIAL',
    'ingresos': 'INGRESOS', 
    'salidas': 'SALIDAS',
    'saldo_final': 'SALDO FINAL',
    'lin_art': 'LÍNEA ART',
    'nombre_linea': 'LÍNEA'
  };

  const fetchView = async (type: '05' | '13' | '20') => {
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
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-blue-500/10"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl border border-blue-200">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Visor de Almacenes
                </h1>
                <p className="text-slate-600 mt-1">Consulta y analiza el inventario en tiempo real</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => fetchView('05')} 
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                <Warehouse size={16} />
                Almacén 05
              </button>

              <button 
                onClick={() => fetchView('13')} 
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                <FileText size={16} />
                Almacén 13
              </button>
              
              <button 
                onClick={() => fetchView('20')} 
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                <Package size={16} />
                Almacén 20
              </button>

              {viewType && (
                <button 
                  onClick={closeView} 
                  className="flex items-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-medium rounded-xl border border-red-200 hover:border-red-300 transition-all duration-200"
                >
                  <X size={16} />
                  Cerrar
                </button>
              )}
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-4 mt-6">
            {loading && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-200">
                <Loader2 size={16} className="animate-spin text-amber-500" />
                <span className="text-sm font-medium text-amber-700">Cargando datos...</span>
              </div>
            )}
            
            {error && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full border border-red-200">
                <AlertCircle size={16} className="text-red-500" />
                <span className="text-sm font-medium text-red-700">{error}</span>
              </div>
            )}
            
            {viewType && !loading && !error && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
                <Eye size={16} className="text-emerald-500" />
                <span className="text-sm font-medium text-emerald-700">
                  Visualizando Almacén {viewType}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data View Section */}
      {viewType && (
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 to-white"></div>
          
          {/* Table Header */}
          <div className="relative border-b border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Almacén {viewType}
                  </h2>
                  <p className="text-sm text-slate-600">{viewData.length.toLocaleString()} registros totales</p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    placeholder="Buscar en todos los campos..."
                    value={q}
                    onChange={(e) => { setQ(e.target.value); setPage(1); }}
                    className="pl-10 pr-4 py-2 w-80 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
                
                <button
                  onClick={() => { setPage(1); setQ(''); setColumnFilter(''); }}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all"
                >
                  <RefreshCw size={16} />
                  Limpiar
                </button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <FileText size={14} />
                <span>Mostrando {pageData.length} de {filtered.length} registros</span>
              </div>
              <div className="w-px h-4 bg-slate-300"></div>
              <div className="flex items-center gap-1">
                <Settings size={14} />
                <span>Página {page} de {totalPages}</span>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="relative">
            <div className="overflow-auto max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      #
                    </th>
                    {columns.map((c) => (
                      <th key={c} className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        {columnLabels[c]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageData.map((row, i) => (
                    <tr 
                      key={i} 
                      className="hover:bg-slate-50/80 transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                        {(page - 1) * pageSize + i + 1}
                      </td>
                      {columns.map((c) => (
                        <td key={c} className="px-6 py-4 text-sm text-slate-800">
                          <div className="max-w-xs truncate" title={String(row[c] ?? '')}>
                            {c === 'articulo' ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                                #{row[c]}
                              </span>
                            ) : c === 'saldo_final' ? (
                              <span className={`font-medium ${
                                Number(row[c]) > 0 
                                  ? 'text-emerald-600' 
                                  : Number(row[c]) < 0 
                                  ? 'text-red-600' 
                                  : 'text-slate-500'
                              }`}>
                                {String(row[c] ?? '')}
                              </span>
                            ) : c === 'nombre_linea' ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                                {String(row[c] ?? '')}
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
            </div>

            {/* Empty State */}
            {pageData.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Database size={48} className="mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No hay datos para mostrar</h3>
                <p className="text-sm text-center max-w-md">
                  {filtered.length === 0 && q 
                    ? 'No se encontraron resultados que coincidan con tu búsqueda.'
                    : 'No hay registros disponibles en este almacén.'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="relative border-t border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Página {page} de {totalPages}</span>
                <span>•</span>
                <span>{pageData.length} registros visibles</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  disabled={page <= 1} 
                  onClick={() => setPage((p) => Math.max(1, p - 1))} 
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                  Anterior
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          pageNum === page
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  disabled={page >= totalPages} 
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Siguiente
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}