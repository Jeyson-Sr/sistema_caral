import React, { useState } from 'react';
import Formulacion from './Formulacion';

type JarabeOption = 'si' | 'no' | '';

type FormData = {
  sku: number | '';
  marca: string;
  sabor: string;
  linea: number | '';
  jarabe: JarabeOption;
  formato: number | '';
  litrosBatch: number | '';
  bebidaFinal: number | '';
  factorAzucar: number | '';
  efVelocidad: number | '';
  velocidadBot: number | '';
  unidadPaquete: number | '';
  paquetesNivel: number | '';
  cartonNivel: number | '';
};

const MARCAS = [
  'BIG','BIO ALOE','CIELO','CIELO ALCALINA','CIFRUT','CRECE BIEN',
  'DILYTE','FREE TEA','KR','ORO','PULP','SPORADE','VIDA','VOLT'
];

const SABORES = [
  'COLA','UVA','KOLITA','AGUA','LIMON','MANZANA','MARACUYA','PERA',
  'FRUIT PUNCH','CITRUS PUNCH','GREEN PUNCH','MANGO','BLUEBERRY','FRUTOS ROJOS',
  'NEGRO DURAZNO','NEGRO LIMON','PIÑA','NARANJA','LIMA LIMON','FRESA','GUARANA',
  'AMARILLA','DURAZNO','FORTIHIERRO DURAZNO','TROPICAL','MANDARINA',
  'APPLE ICE SIN AZÚCAR','FANTASY','FRAMBUESA-MORA AZUL','GAMER PONCHE DE FRUTAS',
  'GINSENG SIN AZUCAR','DARK','OTRO'
];

const NUMBER_FIELDS = new Set([
  'sku','linea','formato','litrosBatch','bebidaFinal','factorAzucar',
  'efVelocidad','velocidadBot','unidadPaquete','paquetesNivel','cartonNivel'
]);

const CrearEnvase: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    sku: '',
    marca: '',
    sabor: '',
    linea: '',
    jarabe: '',
    formato: '',
    litrosBatch: '',
    bebidaFinal: '',
    factorAzucar: '',
    efVelocidad: '',
    velocidadBot: '',
    unidadPaquete: '',
    paquetesNivel: '',
    cartonNivel: ''
  });

  const [mostrarFormulacion, setMostrarFormulacion] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue: any = value;

    if (NUMBER_FIELDS.has(name)) {
      newValue = value === '' ? '' : Number(value);
    }

    if (name === 'marca' || name === 'sabor') {
      newValue = String(value).toUpperCase();
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const showJarabeFields = formData.jarabe === 'si';

  const buildPayload = () => {
    const sku_envasado = formData.sku === '' ? null : Number(formData.sku);
    const sku_jarabe = formData.jarabe === ''
      ? null
      : (formData.jarabe === 'si' ? 1 : 0);

    const marca = formData.marca?.trim() || '';
    const sabor = formData.sabor?.trim() || '';
    const formatoStr = formData.formato === '' ? '' : Number(formData.formato).toFixed(3);
    const unidadPaqueteStr = formData.unidadPaquete === '' ? '' : String(formData.unidadPaquete);

    const sku_descripcion = `${marca} ${sabor} ${formatoStr}${formatoStr ? 'ML' : ''} ${unidadPaqueteStr ? 'x' + unidadPaqueteStr : ''}`.trim();

    return {
      linea: formData.linea === '' ? null : Number(formData.linea),
      sku_descripcion: sku_descripcion || null,
      sku_envasado: sku_envasado,
      sku_jarabe: sku_jarabe,
      formato: formData.formato === '' ? null : Number(formData.formato),
      marca: marca || null,
      sabor: sabor || null,
      litros_batch: formData.litrosBatch === '' ? null : Number(formData.litrosBatch),
      bebida_final: formData.bebidaFinal === '' ? null : Number(formData.bebidaFinal),
      factor_azucar: formData.factorAzucar === '' ? null : Number(formData.factorAzucar),
      ef_velocidad: formData.efVelocidad === '' ? null : Number(formData.efVelocidad),
      velocidad_bot: formData.velocidadBot === '' ? null : Number(formData.velocidadBot),
      unidad_paquete: formData.unidadPaquete === '' ? null : Number(formData.unidadPaquete),
      paquetes_nivel: formData.paquetesNivel === '' ? null : Number(formData.paquetesNivel),
      carton_nivel: formData.cartonNivel === '' ? null : Number(formData.cartonNivel),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = buildPayload();
    console.log('Payload listo para enviar:', payload);

    try {
      const res = await fetch('/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify(payload)
      });

      const contentType = (res.headers.get('content-type') || '').toLowerCase();

      if (!res.ok) {
        if (contentType.includes('application/json')) {
          const err = await res.json();
          console.error('Error del servidor (json):', err);
          throw new Error(JSON.stringify(err));
        } else {
          const txt = await res.text();
          console.error('Error del servidor (html/text):', txt);
          throw new Error(`Server returned ${res.status} - see console for body`);
        }
      }

      if (contentType.includes('application/json')) {
        const data = await res.json();
        console.log('Guardado con éxito:', data);
      } else {
        const text = await res.text();
        console.log('Respuesta no-JSON del servidor (posible Inertia/HTML):', text);
      }

      setMostrarFormulacion(true);

    } catch (err) {
      console.error('Error al enviar:', err);
    } finally {
      setLoading(false);
    }
  };

  // Si mostrarFormulacion true, mostramos solo Formulacion (cambio de página)
  if (mostrarFormulacion) {
    return <Formulacion 
      sku_description={buildPayload().sku_descripcion || ''} 
      sku_jarabe={formData.jarabe === 'si' ? 'si' : 'no'} 
    />;
  }

  // Generar preview del producto
  const generatePreview = () => {
    const payload = buildPayload();
    return payload.sku_descripcion || 'Vista previa del producto';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-8 shadow-2xl border border-slate-600/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">🏭 Crear Nuevo Envase</h1>
              <p className="text-slate-300">Define las especificaciones del producto y continúa a la formulación</p>
            </div>
            
            <div className="text-right">
              <div className="px-4 py-2 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300 text-sm">Vista previa:</span>
                <div className="text-white font-semibold mt-1">{generatePreview()}</div>
              </div>
            </div>
          </div>

          {/* Indicadores de progreso */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-slate-300">Configuración del Producto</span>
            </div>
            <div className="w-8 h-px bg-slate-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
              <span className="text-slate-500">Formulación</span>
            </div>
          </div>
        </div>

        {/* Formulario Principal */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 shadow-2xl border border-slate-700/50">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Sección 1: Información Básica */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <h2 className="text-xl font-bold text-white">Información Básica del Producto</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">
                    SKU (Envasado) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="sku"
                    value={formData.sku as any}
                    onChange={handleChange}
                    placeholder="Ej: 12345"
                    className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                             placeholder:text-slate-400 font-mono"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">
                    Marca <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    placeholder="Seleccione marca..."
                    className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                             placeholder:text-slate-400 uppercase"
                    list="marcasList"
                    required
                  />
                  <datalist id="marcasList">
                    {MARCAS.map((m, i) => <option key={i} value={m} />)}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">
                    Sabor <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="sabor"
                    value={formData.sabor}
                    onChange={handleChange}
                    placeholder="Seleccione sabor..."
                    className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                             placeholder:text-slate-400 uppercase"
                    list="saboresList"
                    required
                  />
                  <datalist id="saboresList">
                    {SABORES.map((s, i) => <option key={i} value={s} />)}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">
                    Línea de Producción <span className="text-amber-400">*</span>
                  </label>
                  <select
                    name="linea"
                    value={formData.linea as any}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {Array.from({ length: 14 }).map((_, i) => (
                      <option key={i} value={i + 1}>
                        {`Línea ${String(i + 1).padStart(2, '0')}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">
                    ¿Requiere Jarabe? <span className="text-amber-400">*</span>
                  </label>
                  <select
                    name="jarabe"
                    value={formData.jarabe}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="no">❌ No requiere</option>
                    <option value="si">✅ Sí requiere</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sección 2: Especificaciones Técnicas */}
            <div className="space-y-6 pt-6 border-t border-slate-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <h2 className="text-xl font-bold text-white">Especificaciones Técnicas</h2>
                <div className="flex-1"></div>
                {formData.jarabe === 'si' && (
                  <div className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg text-sm font-medium">
                    🧪 Modo Jarabe Activado
                  </div>
                )}
              </div>

              {showJarabeFields ? (
                // Layout para productos con jarabe
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">Formato (ML)</label>
                      <input
                        type="number"
                        name="formato"
                        step="0.001"
                        min="0"
                        value={formData.formato as any}
                        onChange={handleChange}
                        placeholder="250.000"
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                                 placeholder:text-slate-400 font-mono text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">Litros Batch</label>
                      <input
                        type="number"
                        name="litrosBatch"
                        value={formData.litrosBatch as any}
                        onChange={handleChange}
                        placeholder="1000"
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                                 placeholder:text-slate-400 font-mono text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">Bebida Final</label>
                      <input
                        type="number"
                        name="bebidaFinal"
                        value={formData.bebidaFinal as any}
                        onChange={handleChange}
                        placeholder="950"
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                                 placeholder:text-slate-400 font-mono text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">Factor Azúcar</label>
                      <input
                        type="number"
                        name="factorAzucar"
                        step="0.0000001"
                        min="0"
                        value={formData.factorAzucar as any}
                        onChange={handleChange}
                        placeholder="0.1234567"
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                                 placeholder:text-slate-400 font-mono text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">EF Velocidad</label>
                      <input
                        type="number"
                        name="efVelocidad"
                        value={formData.efVelocidad as any}
                        onChange={handleChange}
                        placeholder="85"
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                                 placeholder:text-slate-400 font-mono text-right"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">Velocidad Bot</label>
                      <input
                        type="number"
                        name="velocidadBot"
                        value={formData.velocidadBot as any}
                        onChange={handleChange}
                        placeholder="120"
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                                 placeholder:text-slate-400 font-mono text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">Unidad Paquete</label>
                      <input
                        type="number"
                        name="unidadPaquete"
                        value={formData.unidadPaquete as any}
                        onChange={handleChange}
                        placeholder="24"
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                                 placeholder:text-slate-400 font-mono text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">Paquetes por Nivel</label>
                      <input
                        type="number"
                        name="paquetesNivel"
                        value={formData.paquetesNivel as any}
                        onChange={handleChange}
                        placeholder="8"
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                                 placeholder:text-slate-400 font-mono text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">Cartón por Nivel</label>
                      <input
                        type="number"
                        name="cartonNivel"
                        value={formData.cartonNivel as any}
                        onChange={handleChange}
                        placeholder="4"
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                                 placeholder:text-slate-400 font-mono text-right"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Layout simplificado para productos sin jarabe
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">Formato (ML)</label>
                      <input
                        type="number"
                        name="formato"
                        step="0.001"
                        min="0"
                        value={formData.formato as any}
                        onChange={handleChange}
                        placeholder="250.000"
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                                 placeholder:text-slate-400 font-mono text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">EF Velocidad</label>
                      <input
                        type="number"
                        name="efVelocidad"
                        value={formData.efVelocidad as any}
                        onChange={handleChange}
                        placeholder="85"
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                                 placeholder:text-slate-400 font-mono text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">Velocidad Bot</label>
                      <input
                        type="number"
                        name="velocidadBot"
                        value={formData.velocidadBot as any}
                        onChange={handleChange}
                        placeholder="120"
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                                 placeholder:text-slate-400 font-mono text-right"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">Unidad Paquete</label>
                      <input
                        type="number"
                        name="unidadPaquete"
                        value={formData.unidadPaquete as any}
                        onChange={handleChange}
                        placeholder="24"
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                                 placeholder:text-slate-400 font-mono text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">Paquetes por Nivel</label>
                      <input
                        type="number"
                        name="paquetesNivel"
                        value={formData.paquetesNivel as any}
                        onChange={handleChange}
                        placeholder="8"
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                                 placeholder:text-slate-400 font-mono text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">Cartón por Nivel</label>
                      <input
                        type="number"
                        name="cartonNivel"
                        value={formData.cartonNivel as any}
                        onChange={handleChange}
                        placeholder="4"
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                                 placeholder:text-slate-400 font-mono text-right"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botón de envío */}
            <div className="flex justify-between items-center pt-8 border-t border-slate-700/50">
              <div className="text-slate-400">
                <span className="text-amber-400">*</span> Campos requeridos
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                           text-white font-bold rounded-lg transition-all hover:shadow-2xl hover:shadow-blue-500/25 
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span>Guardar y Continuar</span>
                    <span className="text-lg">→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearEnvase;