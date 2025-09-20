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
  const [currentStep, setCurrentStep] = useState<'envasado' | 'jarabe' | 'complete'>('envasado');
  
  const [envasadoFilas, setEnvasadoFilas] = useState<FilaFormulacion[]>([
    { id: 1, descripcion: '', articulo: null, cantidad: '' },
  ]);
  
  const [jarabeFilas, setJarabeFilas] = useState<FilaFormulacion[]>([
    { id: 1, descripcion: '', articulo: null, cantidad: '' },
  ]);

  const [savedData, setSavedData] = useState<{
    envasado: FilaFormulacion[];
    jarabe: FilaFormulacion[];
  }>({ envasado: [], jarabe: [] });

  // Cargar datos del almacén
  useEffect(() => {
    fetch('/almacen/05')
      .then((res) => res.json())
      .then((data: Almacen[]) => setAlmacen05(data))
      .catch(() => setAlmacen05([]));
  }, []);

  // Utilidades
  const nextId = (arr: FilaFormulacion[]) => Math.max(0, ...arr.map(r => r.id)) + 1;
  const isPreforma = (desc: string) => desc.toLowerCase().includes('preforma');
  const validarNumero = (valor: string) => /^\d*\.?\d{0,7}$/.test(valor) ? valor : valor.slice(0, -1);

  // Listas filtradas
  const envasesList = almacen05.filter(a => 
    (a.nombre_linea ?? '').toLowerCase() === 'envases y embalajes' || isPreforma(a.descripcion || '')
  );
  
  const materiaList = almacen05.filter(a => 
    (a.nombre_linea ?? '').toLowerCase() === 'materia prima e insumos' && !isPreforma(a.descripcion || '')
  );

  // Manejadores genéricos
  const updateFila = (
    filas: FilaFormulacion[], 
    setFilas: React.Dispatch<React.SetStateAction<FilaFormulacion[]>>,
    allowedList: Almacen[],
    id: number, 
    campo: keyof FilaFormulacion, 
    valor: string
  ) => {
    setFilas(prev => prev.map(fila => {
      if (fila.id !== id) return fila;
      
      if (campo === 'descripcion') {
        const isBlocked = currentStep === 'jarabe' && isPreforma(valor);
        const match = isBlocked ? null : allowedList.find(a => 
          a.descripcion.toLowerCase() === valor.toLowerCase()
        );
        return { ...fila, descripcion: valor, articulo: match?.id || null };
      }
      
      if (campo === 'cantidad') {
        return { ...fila, cantidad: validarNumero(valor) };
      }
      
      return fila;
    }));
  };

  const agregarFila = (filas: FilaFormulacion[], setFilas: React.Dispatch<React.SetStateAction<FilaFormulacion[]>>) => {
    setFilas(prev => [...prev, { id: nextId(prev), descripcion: '', articulo: null, cantidad: '' }]);
  };

  const limpiarFilas = (setFilas: React.Dispatch<React.SetStateAction<FilaFormulacion[]>>) => {
    setFilas([{ id: 1, descripcion: '', articulo: null, cantidad: '' }]);
  };

  const validarFilas = (filas: FilaFormulacion[]) => {
    return filas.every(f => f.descripcion.trim() && f.cantidad.trim() && f.articulo !== null);
  };

  // Manejadores de envío
  const handleEnvasadoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFilas(envasadoFilas)) {
      alert('Revisa Envasado: todas las filas necesitan descripción válida, cantidad y artículo válido.');
      return;
    }

    setSavedData(prev => ({ ...prev, envasado: [...envasadoFilas] }));

    if (sku_jarabe.toLowerCase() === 'si') {
      setCurrentStep('jarabe');
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 150);
    } else {
      console.log('FORMULACIÓN FINAL - ENVASADO:', envasadoFilas.map(f => ({
        descripcion: f.descripcion, articulo: f.articulo, cantidad: f.cantidad
      })));
      alert('Fórmula de Envasado guardada. Revisa consola.');
      setCurrentStep('complete');
    }
  };

  const handleJarabeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFilas(jarabeFilas)) {
      alert('Revisa Jarabe: todas las filas necesitan descripción válida, cantidad y artículo válido.');
      return;
    }

    setSavedData(prev => ({ ...prev, jarabe: [...jarabeFilas] }));

    console.log('FORMULACIÓN FINAL - ENVASADO:', savedData.envasado.map(f => ({
      descripcion: f.descripcion, articulo: f.articulo, cantidad: f.cantidad
    })));
    console.log('FORMULACIÓN FINAL - JARABE:', jarabeFilas.map(f => ({
      descripcion: f.descripcion, articulo: f.articulo, cantidad: f.cantidad
    })));

    alert('Formulaciones guardadas. Revisa consola.');
    setCurrentStep('complete');
  };

  // Componente de formulario reutilizable
  const FormularioSection = ({ 
    title, 
    subtitle, 
    filas, 
    setFilas, 
    allowedList, 
    datalistId, 
    onSubmit, 
    submitText, 
    showBack = false 
  }: {
    title: string;
    subtitle: string;
    filas: FilaFormulacion[];
    setFilas: React.Dispatch<React.SetStateAction<FilaFormulacion[]>>;
    allowedList: Almacen[];
    datalistId: string;
    onSubmit: (e: React.FormEvent) => void;
    submitText: string;
    showBack?: boolean;
  }) => (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-8 shadow-2xl border border-slate-700/50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-slate-400 text-sm">{subtitle}</p>
        </div>
        <div className="text-right">
          <span className="px-4 py-2 bg-slate-700/50 rounded-lg text-slate-300 text-sm font-medium">
            {filas.length} {filas.length === 1 ? 'artículo' : 'artículos'}
          </span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          {filas.map((fila) => (
            <div key={fila.id} className="flex gap-4 items-center p-4 bg-slate-900/50 rounded-lg border border-slate-600/30">
              <div className="flex-1">
                <input
                  type="text"
                  list={datalistId}
                  className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-600 
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                           placeholder:text-slate-500"
                  value={fila.descripcion}
                  onChange={(e) => updateFila(filas, setFilas, allowedList, fila.id, 'descripcion', e.target.value)}
                  placeholder={title === 'Fórmula de Envasado' ? 'Envase o embalaje...' : 'Materia prima...'}
                  required
                />
                <datalist id={datalistId}>
                  {allowedList.map(it => <option key={it.id} value={it.descripcion} />)}
                </datalist>
                {currentStep === 'jarabe' && isPreforma(fila.descripcion) && (
                  <div className="text-xs text-amber-400 mt-2 px-2 py-1 bg-amber-400/10 rounded">
                    ⚠️ Artículo con "preforma" bloqueado en Jarabe
                  </div>
                )}
              </div>

              <div className="w-40">
                <input
                  type="text"
                  inputMode="decimal"
                  className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-600 
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                           text-right font-mono placeholder:text-slate-500"
                  value={fila.cantidad}
                  onChange={(e) => updateFila(filas, setFilas, allowedList, fila.id, 'cantidad', e.target.value)}
                  placeholder="0.0000000"
                  required
                />
              </div>

              <div className="w-28 text-right">
                {fila.articulo !== null ? (
                  <span className="px-3 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg text-sm font-medium">
                    #{fila.articulo}
                  </span>
                ) : (
                  <span className="px-3 py-2 bg-amber-500/20 text-amber-300 rounded-lg text-sm">
                    Sin ID
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-700/50">
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={() => agregarFila(filas, setFilas)} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg 
                         transition-all hover:shadow-lg hover:shadow-blue-500/25 font-medium"
            >
              ✚ Agregar Fila
            </button>
            <button 
              type="button" 
              onClick={() => limpiarFilas(setFilas)} 
              className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg 
                         transition-all hover:shadow-lg font-medium"
            >
              🗑️ Limpiar
            </button>
          </div>

          <div className="flex gap-3">
            {showBack && (
              <button 
                type="button" 
                onClick={() => setCurrentStep('envasado')} 
                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg 
                           transition-all hover:shadow-lg font-medium"
              >
                ← Volver
              </button>
            )}
            <button 
              type="submit" 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 
                         text-white px-8 py-3 rounded-lg transition-all hover:shadow-lg 
                         hover:shadow-green-500/25 font-semibold"
            >
              {submitText}
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-8 shadow-2xl border border-slate-600/50">
          <h1 className="text-3xl font-bold text-white mb-3">{sku_description}</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${currentStep === 'envasado' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
              <span className="text-slate-300">Envasado</span>
            </div>
            {sku_jarabe.toLowerCase() === 'si' && (
              <>
                <div className="w-8 h-px bg-slate-600"></div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${currentStep === 'jarabe' ? 'bg-blue-500' : currentStep === 'complete' ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                  <span className="text-slate-300">Jarabe</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Formularios */}
        {currentStep === 'envasado' && (
          <FormularioSection
            title="Fórmula de Envasado"
            subtitle="Envases y embalajes + preformas"
            filas={envasadoFilas}
            setFilas={setEnvasadoFilas}
            allowedList={envasesList}
            datalistId="almacenes-envases"
            onSubmit={handleEnvasadoSubmit}
            submitText={sku_jarabe.toLowerCase() === 'si' ? 'Continuar a Jarabe →' : 'Finalizar Formulación'}
          />
        )}

        {currentStep === 'jarabe' && (
          <FormularioSection
            title="Fórmula de Jarabe"
            subtitle="Materia prima e insumos (sin preformas)"
            filas={jarabeFilas}
            setFilas={setJarabeFilas}
            allowedList={materiaList}
            datalistId="almacenes-materia"
            onSubmit={handleJarabeSubmit}
            submitText="✓ Finalizar Formulación"
            showBack={true}
          />
        )}

        {currentStep === 'complete' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
            <div className="text-green-400 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-white mb-2">Formulación Completada</h2>
            <p className="text-slate-300">Los datos han sido guardados y están disponibles en la consola.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Formulacion;