// resources/js/features/createProduct/components/Formulacion.tsx
import React, { useEffect, useState } from 'react';
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

  // EnvasadoForm (inline)
  const EnvasadoForm: React.FC<any> = ({ filas, setFilas, envasesList, addRow, onSubmit, submitting, unidadPaquete }) => {
    const handleChange = (id: number, campo: keyof FilaFormulacion, valor: string) => {
      setFilas((prev: FilaFormulacion[]) =>
        prev.map((f: FilaFormulacion) => {
          if (f.id !== id) return f;
          if (campo === 'descripcion') {
            const match = envasesList.find((a: Almacen) => a.descripcion.toLowerCase() === valor.toLowerCase());
            return { ...f, descripcion: valor, articulo: match ? match.articulo : null };
          }
          if (campo === 'cantidad') return { ...f, cantidad: validarNumero(valor) };
          return f;
        })
      );
    };

    return (
      <form onSubmit={onSubmit}>
        <div className="space-y-3">
          {filas.map((f: FilaFormulacion) => (
            <div key={f.id} className="flex gap-2 items-center">
              <div className="flex-1">
                <input
                  list="almacenes-envases"
                  className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600"
                  value={f.descripcion}
                  onChange={(e) => {
                    const v = e.target.value;
                    handleChange(f.id, 'descripcion', v);
                    if (v.toLowerCase().match(/(tapa|etiqueta|preforma)/)) {
                      handleChange(f.id, 'cantidad', unidadPaquete?.toString() || '');
                    }
                  }}
                  placeholder="Artículo (envase)"
                  required
                />
                <datalist id="almacenes-envases">{envasesList.map((it: Almacen) => <option key={it.id} value={it.descripcion} />)}</datalist>
              </div>

              <div className="w-36">
                <input
                  type="number" 
                  step="0.01"
                  className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600 text-right"
                  value={f.cantidad}
                  onChange={(e) => handleChange(f.id, 'cantidad', e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="w-24 text-sm text-slate-400 text-right">
                {f.articulo !== null ? <span className="px-2 py-1 bg-emerald-700/20 rounded">cod:{f.articulo}</span> : <span className="text-amber-400">sin id</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <button type="button" onClick={addRow} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">+</button>
          </div>

          <button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
            {submitting ? 'Enviando...' : 'Guardar Envasado'}
          </button>
        </div>
      </form>
    );
  };

  // JarabeForm (inline)
  const JarabeForm: React.FC<any> = ({ filas, setFilas, materiaList, addRow, onSubmit, submitting, sku_jarabe_global }) => {
    const handleChange = (id: number, campo: keyof FilaFormulacion, valor: string) => {
      setFilas((prev: FilaFormulacion[]) =>
        prev.map((f: FilaFormulacion) => {
          if (f.id !== id) return f;
          if (campo === 'descripcion') {
            if (valor.toLowerCase().includes('preforma')) {
              return { ...f, descripcion: valor, articulo: null, sku_jarabe: sku_jarabe_global ?? null };
            }
            const match = materiaList.find((a: Almacen) => a.descripcion.toLowerCase() === valor.toLowerCase());
            return { ...f, descripcion: valor, articulo: match ? match.articulo : null, sku_jarabe: sku_jarabe_global ?? null };
          }
          if (campo === 'cantidad') return { ...f, cantidad: validarNumero(valor), sku_jarabe: sku_jarabe_global ?? null };
          return f;
        })
      );
    };

    return (
      <form onSubmit={onSubmit}>
        <div className="space-y-3">
          {filas.map((f: FilaFormulacion) => (
            <div key={f.id} className="flex gap-2 items-center">
              <div className="flex-1">
                <input
                  list="almacenes-materia"
                  className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600"
                  value={f.descripcion}
                  onChange={(e) => handleChange(f.id, 'descripcion', e.target.value)}
                  placeholder="Artículo (jarabe)"
                  required
                />
                <datalist id="almacenes-materia">{materiaList.map((it: Almacen) => <option key={it.id} value={it.descripcion} />)}</datalist>
                {f.descripcion.toLowerCase().includes('preforma') && <div className="text-xs text-amber-300 mt-1">Artículo con "preforma" bloqueado en Jarabe.</div>}
              </div>

              <div className="w-36">
                <input
                  inputMode="decimal"
                  className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600 text-right"
                  value={f.cantidad}
                  onChange={(e) => handleChange(f.id, 'cantidad', e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="w-24 text-sm text-slate-400 text-right">
                {f.articulo !== null ? <span className="px-2 py-1 bg-emerald-700/20 rounded">cod:{f.articulo}</span> : <span className="text-amber-400">sin cod</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <button type="button" onClick={addRow} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">+</button>
          </div>

          <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
            {submitting ? 'Enviando...' : 'Guardar Jarabe y Finalizar'}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-slate-900 text-white rounded-lg p-4">
        <h1 className="text-xl font-bold">{sku_description}</h1>
        <p className="text-sm text-slate-400">Proceso: primero Envasado → luego Jarabe (si aplica).</p>
      </div>

      {showEnvasado && (
        <div className="bg-white/5 rounded-lg p-4 shadow-inner border border-slate-700">
          <h2 className="text-lg font-semibold mb-3">Fórmula de Envasado</h2>
          <EnvasadoForm filas={filas} setFilas={setFilas} envasesList={envasesList} addRow={addEnvasadoRow} onSubmit={onSubmitEnvasado} submitting={submitting} unidadPaquete={unidadPaquete} />
        </div>
      )}

      {showJarabeForm && jarabe.toLowerCase() === 'si' && (
        <div className="bg-white/5 rounded-lg p-4 shadow-inner border border-slate-700">
          <h2 className="text-lg font-semibold mb-3">Fórmula de Jarabe</h2>
          <JarabeForm filas={jarabeFilas} setFilas={setJarabeFilas} materiaList={materiaList} addRow={addJarabeRow} onSubmit={onSubmitJarabe} submitting={submitting} sku_jarabe_global={sku_jarabe ?? null} />
        </div>
      )}
    </div>
  );
};

export default Formulacion;
