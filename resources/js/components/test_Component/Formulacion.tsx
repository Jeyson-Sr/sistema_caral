import React, { useEffect, useState } from 'react';

interface FormulacionProps {
  sku_description: string;
  sku_jarabe: string; // 'si' | 'no'
}

interface FilaFormulacion {
  id: number;
  descripcion: string;
  articulo: number | null;
  cantidad: string;
}

interface Almacen {
  id: number;
  descripcion: string;
  nombre_linea?: string;
}

const Formulacion: React.FC<FormulacionProps> = ({ sku_description, sku_jarabe }) => {
  const [almacen05, setAlmacen05] = useState<Almacen[]>([]);
  const [filas, setFilas] = useState<FilaFormulacion[]>([
    { id: 1, descripcion: '', articulo: null, cantidad: '' },
  ]);

  const [showEnvasado, setShowEnvasado] = useState(true); // mostramos Envasado primero
  const [showJarabeForm, setShowJarabeForm] = useState(false);
  const [jarabeFilas, setJarabeFilas] = useState<FilaFormulacion[]>([
    { id: 1, descripcion: '', articulo: null, cantidad: '' },
  ]);

  const [savedEnvasado, setSavedEnvasado] = useState<FilaFormulacion[] | null>(null);
  const [savedJarabe, setSavedJarabe] = useState<FilaFormulacion[] | null>(null);

  useEffect(() => {
    fetch('/almacen/05')
      .then((res) => res.json())
      .then((data: Almacen[]) => setAlmacen05(data))
      .catch((err) => {
        console.error('Error cargando almacen05:', err);
        setAlmacen05([]);
      });
  }, []);

  const nextId = (arr: FilaFormulacion[]) => (arr.length ? Math.max(...arr.map((r) => r.id)) + 1 : 1);
  const isPreforma = (desc: string) => desc.toLowerCase().includes('preforma');

  // listas filtradas con reglas:
  // Envasado: ENVASES Y EMBALAJES OR cualquier descripcion que contenga 'preforma'
  const envasesList = almacen05.filter(
    (a) => (a.nombre_linea ?? '').toLowerCase() === 'envases y embalajes' || isPreforma(a.descripcion || '')
  );
  // Jarabe: MATERIA PRIMA E INSUMOS AND NOT preforma
  const materiaList = almacen05.filter(
    (a) => (a.nombre_linea ?? '').toLowerCase() === 'materia prima e insumos' && !isPreforma(a.descripcion || '')
  );

  const agregarFila = () =>
    setFilas((prev) => [...prev, { id: nextId(prev), descripcion: '', articulo: null, cantidad: '' }]);
  const agregarFilaJarabe = () =>
    setJarabeFilas((prev) => [...prev, { id: nextId(prev), descripcion: '', articulo: null, cantidad: '' }]);

  const validarNumero = (valor: string) => {
    const regex = /^\d*\.?\d{0,7}$/;
    return regex.test(valor) || valor === '' ? valor : valor.slice(0, -1);
  };

  // cambios en Envasado: solo se buscan coincidencias en envasesList
  const handleChange = (id: number, campo: keyof FilaFormulacion, valor: string) => {
    setFilas((prev) =>
      prev.map((fila) => {
        if (fila.id !== id) return fila;
        if (campo === 'descripcion') {
          const match = envasesList.find((a) => a.descripcion.toLowerCase() === valor.toLowerCase());
          return { ...fila, descripcion: valor, articulo: match ? match.id : null };
        }
        if (campo === 'cantidad') return { ...fila, cantidad: valor };
        return fila;
      })
    );
  };

  // cambios en Jarabe: busca match en materiaList; bloquea si incluye 'preforma'
  const handleChangeJarabe = (id: number, campo: keyof FilaFormulacion, valor: string) => {
    setJarabeFilas((prev) =>
      prev.map((fila) => {
        if (fila.id !== id) return fila;
        if (campo === 'descripcion') {
          if (isPreforma(valor)) {
            // bloqueado: preforma no permitido en jarabe
            return { ...fila, descripcion: valor, articulo: null };
          }
          const match = materiaList.find((a) => a.descripcion.toLowerCase() === valor.toLowerCase());
          return { ...fila, descripcion: valor, articulo: match ? match.id : null };
        }
        if (campo === 'cantidad') return { ...fila, cantidad: valor };
        return fila;
      })
    );
  };

  const validarFilas = (rows: FilaFormulacion[]) => {
    if (!rows.length) return false;
    for (const r of rows) if (!r.descripcion.trim() || !r.cantidad.trim() || r.articulo === null) return false;
    return true;
  };

  // Guardar Envasado: guarda y oculta Envasado; si sku_jarabe === 'si' abre Jarabe; si 'no' imprime todo
  const handleMainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFilas(filas)) {
      window.alert('Revisa Envasado: todas las filas necesitan descripción válida, cantidad y coincidir con artículo permitido.');
      return;
    }

    setSavedEnvasado(filas.map(f => ({ ...f })));
    // cerrar envasado
    setShowEnvasado(false);

    if (sku_jarabe.toLowerCase() === 'si') {
      // abrir jarabe
      setShowJarabeForm(true);
      setJarabeFilas([{ id: 1, descripcion: '', articulo: null, cantidad: '' }]);
      // scroll
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 150);
      return;
    }

    // no aplica jarabe: imprimir en consola solo envasado
    console.log('FORMULACIÓN FINAL - ENVASADO:', filas.map(f => ({ descripcion: f.descripcion, articulo: f.articulo, cantidad: f.cantidad })));
    window.alert('Fórmula de Envasado guardada y final (sin Jarabe). Revisa consola.');
  };

  // Guardar Jarabe: valida y luego imprime todo (envasado + jarabe)
  const handleJarabeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFilas(jarabeFilas)) {
      window.alert('Revisa Jarabe: todas las filas necesitan descripción válida, cantidad y coincidir con artículo permitido (sin preforma).');
      return;
    }

    setSavedJarabe(jarabeFilas.map(f => ({ ...f })));

    const resultadoEnvasado = (savedEnvasado ?? filas).map(f => ({ descripcion: f.descripcion, articulo: f.articulo, cantidad: f.cantidad }));
    const resultadoJarabe = jarabeFilas.map(f => ({ descripcion: f.descripcion, articulo: f.articulo, cantidad: f.cantidad }));

    console.log('FORMULACIÓN FINAL - ENVASADO:', resultadoEnvasado);
    console.log('FORMULACIÓN FINAL - JARABE:', resultadoJarabe);

    window.alert('Formulaciones guardadas. Revisa consola.');
    setShowJarabeForm(false);
    // opcional: resetear formulario o permitir editar antes de enviar al backend
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="bg-slate-900 text-white rounded-lg p-4">
        <h1 className="text-xl font-bold">{sku_description}</h1>
        <p className="text-sm text-slate-400">Proceso: primero Envasado → luego Jarabe (si aplica).</p>
      </div>

      {/* ENVASADO (se muestra inicialmente) */}
      {showEnvasado && (
        <div className="bg-white/5 rounded-lg p-4 shadow-inner border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Fórmula de Envasado</h2>
            <span className="text-sm text-slate-300">ENVASES Y EMBALAJES + preforma</span>
          </div>

          <form onSubmit={handleMainSubmit}>
            <div className="space-y-3">
              {filas.map((fila) => (
                <div key={fila.id} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      list="almacenes-envases"
                      className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600"
                      value={fila.descripcion}
                      onChange={(e) => handleChange(fila.id, 'descripcion', e.target.value)}
                      placeholder="Artículo (ENVASES o que contenga 'preforma')"
                      required
                    />
                    <datalist id="almacenes-envases">
                      {envasesList.map(it => <option key={it.id} value={it.descripcion} />)}
                    </datalist>
                  </div>

                  <div className="w-36">
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600 text-right"
                      value={fila.cantidad}
                      onChange={(e) => handleChange(fila.id, 'cantidad', validarNumero(e.target.value))}
                      placeholder="0.0000000"
                      required
                    />
                  </div>

                  <div className="w-24 text-sm text-slate-400 text-right">
                    {fila.articulo !== null ? <span className="px-2 py-1 bg-emerald-700/20 rounded">id:{fila.articulo}</span> : <span className="text-amber-400">sin id</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <button type="button" onClick={agregarFila} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">+ Fila</button>
                <button type="button" onClick={() => setFilas([{ id: 1, descripcion: '', articulo: null, cantidad: '' }])} className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded">Limpiar</button>
              </div>

              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Guardar Envasado</button>
            </div>
          </form>
        </div>
      )}

      {/* JARABE: se muestra solo si aplica y después de guardar Envasado */}
      {showJarabeForm && sku_jarabe.toLowerCase() === 'si' && (
        <div className="bg-white/5 rounded-lg p-4 shadow-inner border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Fórmula de Jarabe</h2>
            <span className="text-sm text-slate-300">MATERIA PRIMA E INSUMOS (sin preforma)</span>
          </div>

          <form onSubmit={handleJarabeSubmit}>
            <div className="space-y-3">
              {jarabeFilas.map((fila) => (
                <div key={fila.id} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      list="almacenes-materia"
                      className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600"
                      value={fila.descripcion}
                      onChange={(e) => handleChangeJarabe(fila.id, 'descripcion', e.target.value)}
                      placeholder="Artículo (MATERIA PRIMA, NO preforma)"
                      required
                    />
                    <datalist id="almacenes-materia">
                      {materiaList.map(it => <option key={it.id} value={it.descripcion} />)}
                    </datalist>
                    {isPreforma(fila.descripcion) && <div className="text-xs text-amber-300 mt-1">Artículo con "preforma" bloqueado en Jarabe.</div>}
                  </div>

                  <div className="w-36">
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600 text-right"
                      value={fila.cantidad}
                      onChange={(e) => handleChangeJarabe(fila.id, 'cantidad', validarNumero(e.target.value))}
                      placeholder="0.0000000"
                      required
                    />
                  </div>

                  <div className="w-24 text-sm text-slate-400 text-right">
                    {fila.articulo !== null ? <span className="px-2 py-1 bg-emerald-700/20 rounded">id:{fila.articulo}</span> : <span className="text-amber-400">sin id</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <button type="button" onClick={agregarFilaJarabe} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">+ Fila</button>
                <button type="button" onClick={() => setJarabeFilas([{ id: 1, descripcion: '', articulo: null, cantidad: '' }])} className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded">Limpiar</button>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowJarabeForm(false); setShowEnvasado(true); }} className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded">Volver Envasado</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">Guardar Jarabe y Finalizar</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Formulacion;
