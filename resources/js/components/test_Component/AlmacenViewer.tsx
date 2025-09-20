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
    'articulo': 'ARTICULO',
    'descripcion': 'DESCRIPCION',
    'u_m': 'U M',
    'contenido': 'CONTENIDO',
    'saldo_inicial': 'SALDO INICIAL',
    'ingresos': 'INGRESOS', 
    'salidas': 'SALIDAS',
    'saldo_final': 'SALDO FINAL',
    'lin_art': 'LIN ART',
    'nombre_linea': 'NOMBRE LINEA'
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
    <div className={className}>
      <div className="flex gap-4 items-center mb-4">
        <button onClick={() => fetchView('05')} className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors">Almacén 05</button>
        <button onClick={() => fetchView('20')} className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors">Almacén 20</button>
        {viewType && <button onClick={closeView} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors">Cerrar</button>}
        {loading && <span className="text-yellow-300">Cargando...</span>}
        {error && <span className="text-red-400">{error}</span>}
      </div>

      {viewType && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">Almacén {viewType} — {viewData.length} registros</h2>
            <div className="flex items-center gap-4">
              <input
                placeholder="Buscar..."
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-blue-500"
              />
              {/* <input
                placeholder="Filtrar columnas..."
                value={columnFilter}
                onChange={(e) => { setColumnFilter(e.target.value); setPage(1); }}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-blue-500"
              /> */}
            </div>
          </div>

          <div className="overflow-auto rounded-lg border dark:border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="p-3 text-left font-semibold text-gray-600 dark:text-gray-200">#</th>
                  {columns.map((c) => (
                    <th key={c} className="p-3 text-left font-semibold text-gray-600 dark:text-gray-200">
                      {columnLabels[c]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((row, i) => (
                  <tr key={i} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3 text-gray-600 dark:text-gray-200">{(page - 1) * pageSize + i + 1}</td>
                    {columns.map((c) => (
                      <td key={c} className="p-3 text-gray-600 dark:text-gray-200">
                        {String(row[c] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Página {page} de {totalPages} • Mostrando {pageData.length} registros
            </div>
            <div className="flex items-center gap-2">
              <button 
                disabled={page <= 1} 
                onClick={() => setPage((p) => Math.max(1, p - 1))} 
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
              >
                Anterior
              </button>
              <button 
                disabled={page >= totalPages} 
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
              >
                Siguiente
              </button>
              <button 
                onClick={() => { setPage(1); setQ(''); setColumnFilter(''); }} 
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
