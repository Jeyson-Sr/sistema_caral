// resources/js/features/createProduct/components/Formulacion.improved.tsx
import React, { useEffect, useState } from 'react';
import { Package, Beaker, Plus, Save, Loader2, Check, AlertCircle } from 'lucide-react';
import type { FilaFormulacion, Almacen } from '../types';
import { postFormulation } from '../services/formulationService';

////////////////////////////////////////////////////////////////////////////////
// Utils
////////////////////////////////////////////////////////////////////////////////
const nextId = (arr: { id: number }[]) => (arr.length ? Math.max(...arr.map(r => r.id)) + 1 : 1);
const validarNumero = (valor: string) => {
  const regex = /^\d*\.?\d{0,7}$/;
  return regex.test(valor) || valor === '' ? valor : valor.slice(0, -1);
};

////////////////////////////////////////////////////////////////////////////////
// Hook local para cargar almacen
////////////////////////////////////////////////////////////////////////////////
const useAlmacen05 = (endpoint = '/almacen/05') => {
  const [almacen05, setAlmacen05] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(endpoint)
      .then((r) => r.json())
      .then((d: Almacen[]) => {
        if (mounted) setAlmacen05(d || []);
      })
      .catch(() => {
        if (mounted) setAlmacen05([]);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [endpoint]);

  const isPreforma = (desc = '') => desc.toLowerCase().includes('preforma');

  const envasesList = almacen05.filter(
    (a) => (a.nombre_linea ?? '').toLowerCase() === 'envases y embalajes' || isPreforma(a.descripcion || '')
  );
  const materiaList = almacen05.filter(
    (a) => (a.nombre_linea ?? '').toLowerCase() === 'materia prima e insumos' && !isPreforma(a.descripcion || '')
  );

  return { almacen05, envasesList, materiaList, loading };
};

////////////////////////////////////////////////////////////////////////////////
// Tipos del componente (props)
////////////////////////////////////////////////////////////////////////////////
interface Props {
  sku_description: string;
  jarabe: 'si' | 'no';
  unidadPaquete?: string | number;
  formulacion_id?: number | string;
  sku_jarabe?: number | null;
}

////////////////////////////////////////////////////////////////////////////////
// Componente
////////////////////////////////////////////////////////////////////////////////
const Formulacion: React.FC<Props> = ({
  sku_description,
  jarabe,
  unidadPaquete,
  formulacion_id,
  sku_jarabe,
}) => {
  const { envasesList, materiaList } = useAlmacen05();

  const [filas, setFilas] = useState<FilaFormulacion[]>([
    { id: 1, descripcion: '', articulo: null, cantidad: '' },
  ]);
  const [jarabeFilas, setJarabeFilas] = useState<FilaFormulacion[]>([
    { id: 1, descripcion: '', articulo: null, sku_jarabe: sku_jarabe ?? null, cantidad: '' },
  ]);

  const [showEnvasado, setShowEnvasado] = useState(true);
  const [showJarabeForm, setShowJarabeForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // validaciones simples
  const validarFilasLocal = (rows: FilaFormulacion[]) => {
    if (!rows.length) return false;
    for (const r of rows) if (!r.descripcion.trim() || !r.cantidad.trim() || r.articulo === null) return false;
    return true;
  };

  const normalizeForBackend = (rows: FilaFormulacion[], isJarabe = false) =>
    rows.map((r) => ({
      articulo: r.articulo,
      descripcion: r.descripcion,
      cantidad: r.cantidad,
      ...(isJarabe ? { sku_jarabe: r.sku_jarabe ?? (sku_jarabe ?? null) } : {}),
    }));

  const doPost = async (payload: any) => {
    setSubmitting(true);
    try {
      // postFormulation usa apiFetch (lanza error si status != ok)
      const res = await postFormulation(payload);
      setSubmitting(false);
      return { ok: true, data: res };
    } catch (err: any) {
      setSubmitting(false);
      // normalize error shape
      if (err instanceof Error) return { ok: false, error: err.message };
      return { ok: false, error: err };
    }
  };

  const onSubmitEnvasado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFilasLocal(filas)) return alert('Revisa Envasado: falta campo o match de artículo.');

    // si aplica jarabe, abrimos jarabe
    if (jarabe.toLowerCase() === 'si') {
      setShowEnvasado(false);
      setShowJarabeForm(true);
      setJarabeFilas([{ id: nextId(jarabeFilas), descripcion: '', articulo: null, sku_jarabe: sku_jarabe ?? null, cantidad: '' }]);
      return;
    }

    // si no aplica jarabe, enviamos solo envasado
    const payload = {
      formulacion_id: formulacion_id ?? null,
      envasado: normalizeForBackend(filas, false),
      jarabe: [],
    };

    const resp = await doPost(payload);
    if (resp.ok) {
      alert('Envasado guardado ✅');
    } else {
      console.error(resp);
      alert('Error guardando envasado: ' + (resp.error || 'ver consola'));
    }
  };

  const onSubmitJarabe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFilasLocal(jarabeFilas)) return alert('Revisa Jarabe: falta campo o match de artículo.');

    const payload = {
      formulacion_id: formulacion_id ?? null,
      envasado: normalizeForBackend(filas, false),
      jarabe: normalizeForBackend(jarabeFilas, true),
    };

    const resp = await doPost(payload);
    if (resp.ok) {
      alert('Formulación completa guardada ✅');
      setShowJarabeForm(false);
      setShowEnvasado(false);
    } else {
      console.error(resp);
      // manejo básico de errores 422 si el backend los manda en resp.error
      if (resp.error && typeof resp.error === 'string' && resp.error.includes('422')) {
        alert('Errores de validación (ver consola).');
      } else {
        alert('Error guardando (ver consola).');
      }
    }
  };

  const addEnvasadoRow = () =>
    setFilas((prev) => [...prev, { id: nextId(prev), descripcion: '', articulo: null, cantidad: '' }]);
  const addJarabeRow = () =>
    setJarabeFilas((prev) => [...prev, { id: nextId(prev), descripcion: '', articulo: null, sku_jarabe: sku_jarabe ?? null, cantidad: '' }]);

  // EnvasadoForm (inline) — solo diseño cambiada, lógica intacta
      const EnvasadoForm: React.FC<any> = ({ filas, setFilas, envasesList, addRow, onSubmit, submitting, unidadPaquete }) => {
    const handleChange = (id: number, campo: keyof FilaFormulacion, valor: string) => {
      setFilas((prev: FilaFormulacion[]) =>
        prev.map((f: FilaFormulacion) => {
          if (f.id !== id) return f;
          if (campo === 'descripcion') {
            // Solo buscar coincidencias si hay al menos 2 caracteres
            const match = valor.length >= 2 
              ? envasesList.find((a: Almacen) => a.descripcion.toLowerCase() === valor.toLowerCase())
              : null;
            return { ...f, descripcion: valor, articulo: match ? match.articulo : null };
          }
          if (campo === 'cantidad') return { ...f, cantidad: validarNumero(valor) };
          return f;
        })
      );
    };

    return (
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          {filas.map((f: FilaFormulacion, index: number) => (
            <div key={f.id} className="group relative">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex gap-4 items-start bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-200">
                <div className="flex-1 space-y-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Artículo de Envasado #{index + 1}
                  </label>
                  <input
                    list="almacenes-envases"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/90 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    value={f.descripcion}
                    onChange={(e) => {
                      const v = e.target.value;
                      handleChange(f.id, 'descripcion', v);
                      // Solo auto-llenar cantidad si hay match y valor significativo
                      if (v.length >= 2 && v.toLowerCase().match(/(tapa|etiqueta|preforma)/)) {
                        handleChange(f.id, 'cantidad', unidadPaquete?.toString() || '');
                      }
                    }}
                    onKeyDown={(e) => {
                      // Prevenir que se salga del input con pocas letras
                      if ((e.key === 'Tab' || e.key === 'Enter') && f.descripcion.trim().length <= 1) {
                        e.preventDefault();
                        return;
                      }
                    }}
                    placeholder="Buscar artículo..."
                    required
                  />
                  <datalist id="almacenes-envases">{envasesList.map((it: Almacen) => <option key={it.id} value={it.descripcion} />)}</datalist>
                </div>

                <div className="w-36 space-y-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/90 text-right text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    value={f.cantidad}
                    onChange={(e) => handleChange(f.id, 'cantidad', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="w-32 space-y-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Código
                  </label>
                  <div className="h-12 flex items-center justify-center">
                    {f.articulo !== null ? (
                      <span className="inline-flex items-center px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                        <Check size={14} className="mr-1" />
                        #{f.articulo}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 text-sm">
                        <AlertCircle size={14} className="mr-1" />
                        Sin código
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button 
            type="button" 
            onClick={addRow} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200"
          >
            <Plus size={16} />
            Agregar Fila
          </button>

          <button 
            type="submit" 
            disabled={submitting} 
            className="relative overflow-hidden px-6 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
            <span className="relative flex items-center gap-2">
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Guardar Envasado
                </>
              )}
            </span>
          </button>
        </div>
      </form>
    );
  };

  // JarabeForm (inline) — solo diseño cambiada, lógica intacta
      const JarabeForm: React.FC<any> = ({ filas, setFilas, materiaList, addRow, onSubmit, submitting, sku_jarabe_global }) => {
    const handleChange = (id: number, campo: keyof FilaFormulacion, valor: string) => {
      setFilas((prev: FilaFormulacion[]) =>
        prev.map((f: FilaFormulacion) => {
          if (f.id !== id) return f;
          if (campo === 'descripcion') {
            if (valor.toLowerCase().includes('preforma')) {
              return { ...f, descripcion: valor, articulo: null, sku_jarabe: sku_jarabe_global ?? null };
            }
            // Solo buscar coincidencias si hay al menos 2 caracteres
            const match = valor.length >= 2 
              ? materiaList.find((a: Almacen) => a.descripcion.toLowerCase() === valor.toLowerCase())
              : null;
            return { ...f, descripcion: valor, articulo: match ? match.articulo : null, sku_jarabe: sku_jarabe_global ?? null };
          }
          if (campo === 'cantidad') return { ...f, cantidad: validarNumero(valor), sku_jarabe: sku_jarabe_global ?? null };
          return f;
        })
      );
    };

    return (
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          {filas.map((f: FilaFormulacion, index: number) => (
            <div key={f.id} className="group relative">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-400 to-purple-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex gap-4 items-start bg-gradient-to-r from-indigo-50/50 to-white p-4 rounded-xl border border-indigo-200/40 shadow-sm hover:shadow-md transition-all duration-200 hover:border-indigo-300/60">
                <div className="flex-1 space-y-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Materia Prima #{index + 1}
                  </label>
                  <input
                    list="almacenes-materia"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/90 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    value={f.descripcion}
                    onChange={(e) => handleChange(f.id, 'descripcion', e.target.value)}
                    onKeyDown={(e) => {
                      // Prevenir que se salga del input con pocas letras
                      if ((e.key === 'Tab' || e.key === 'Enter') && f.descripcion.trim().length <= 1) {
                        e.preventDefault();
                        return;
                      }
                    }}
                    placeholder="Buscar materia prima..."
                    required
                  />
                  <datalist id="almacenes-materia">{materiaList.map((it: Almacen) => <option key={it.id} value={it.descripcion} />)}</datalist>
                  {f.descripcion.toLowerCase().includes('preforma') && (
                    <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle size={14} className="text-amber-500" />
                      <span className="text-xs text-amber-700 font-medium">Artículo con "preforma" bloqueado en Jarabe</span>
                    </div>
                  )}
                </div>

                <div className="w-36 space-y-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Cantidad
                  </label>
                  <input
                    inputMode="decimal"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/90 text-right text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    value={f.cantidad}
                    onChange={(e) => handleChange(f.id, 'cantidad', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="w-32 space-y-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Código
                  </label>
                  <div className="h-12 flex items-center justify-center">
                    {f.articulo !== null ? (
                      <span className="inline-flex items-center px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                        <Check size={14} className="mr-1" />
                        #{f.articulo}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 text-sm">
                        <AlertCircle size={14} className="mr-1" />
                        Sin código
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button 
            type="button" 
            onClick={addRow} 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg border border-indigo-200 hover:border-indigo-300 transition-all duration-200"
          >
            <Plus size={16} />
            Agregar Fila
          </button>

          <button 
            type="submit" 
            disabled={submitting} 
            className="relative overflow-hidden px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
            <span className="relative flex items-center gap-2">
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Beaker size={16} />
                  Guardar Jarabe y Finalizar
                </>
              )}
            </span>
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10"></div>
          <div className="relative p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {sku_description}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700">Proceso secuencial</span>
              </div>
            </div>
          </div>
        </div>

        {/* Envasado Form */}
        {showEnvasado && (
          <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-green-500/3 to-emerald-500/5"></div>
            <div className="relative p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl border border-emerald-200">
                  <Package className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Fórmula de Envasado</h2>
              </div>
              <EnvasadoForm 
                filas={filas} 
                setFilas={setFilas} 
                envasesList={envasesList} 
                addRow={addEnvasadoRow} 
                onSubmit={onSubmitEnvasado} 
                submitting={submitting} 
                unidadPaquete={unidadPaquete} 
              />
            </div>
          </div>
        )}

        {/* Jarabe Form */}
        {showJarabeForm && jarabe.toLowerCase() === 'si' && (
          <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/3 to-indigo-500/5"></div>
            <div className="relative p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl border border-indigo-200">
                  <Beaker className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Fórmula de Jarabe</h2>
              </div>
              <JarabeForm 
                filas={jarabeFilas} 
                setFilas={setJarabeFilas} 
                materiaList={materiaList} 
                addRow={addJarabeRow} 
                onSubmit={onSubmitJarabe} 
                submitting={submitting} 
                sku_jarabe_global={sku_jarabe ?? null} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Formulacion;