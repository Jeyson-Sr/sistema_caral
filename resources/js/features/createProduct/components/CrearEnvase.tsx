// resources/js/features/createProduct/components/CrearEnvase.improved.tsx
import React, { useState } from 'react';
import { Package, Beaker, Zap, Users, Settings, Save, Loader2, Check, AlertCircle, Info } from 'lucide-react';
import Formulacion from './Formulacion';
import useCreateProduct from '../hooks/useCreateProduct';
import type { ProductPayload } from '../types';

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

type JarabeOption = 'si' | 'no' | '';

type FormData = {
  sku: number | '';
  marca: string;
  sabor: string;
  linea: number | '';
  jarabe: JarabeOption;
  sku_jarabe: number | '';
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

// Enhanced UI Components
const Field: React.FC<{ label: string; children: React.ReactNode; hint?: string; icon?: React.ReactNode; required?: boolean }> = ({ 
  label, children, hint, icon, required 
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      {icon && <div className="text-slate-500">{icon}</div>}
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-emerald-500 ml-1">*</span>}
      </label>
    </div>
    {children}
    {hint && (
      <div className="flex items-start gap-2 mt-1">
        <Info size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-500">{hint}</p>
      </div>
    )}
  </div>
);

const InputBase = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full rounded-xl px-4 py-3 bg-white border border-slate-200/60 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 text-slate-800 hover:border-slate-300 ${props.className ?? ''}`}
  />
);

const SelectBase = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={`w-full rounded-xl px-4 py-3 bg-white border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 text-slate-800 hover:border-slate-300 ${props.className ?? ''}`}
  />
);

const SectionCard: React.FC<{ 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  description?: string;
  gradient?: string;
}> = ({ title, icon, children, description, gradient = "from-slate-50 to-white" }) => (
  <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 mb-8">
    <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-50`}></div>
    <div className="relative p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl border border-emerald-200">
          <div className="text-emerald-600">{icon}</div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  </div>
);

const CrearEnvase: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    sku: '',
    marca: '',
    sabor: '',
    linea: '',
    jarabe: 'no',
    sku_jarabe: '',
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
  const { loading, handleCreateProduct } = useCreateProduct();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue: any = value;

    if (NUMBER_FIELDS.has(name)) newValue = value === '' ? '' : Number(value);
    if (name === 'marca' || name === 'sabor') newValue = String(value).toUpperCase();

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const showJarabeFields = formData.jarabe === 'si';

  const buildPayload = (): ProductPayload & { sku_descripcion?: string | null } => {
    const sku_envasado = formData.sku === '' ? null : Number(formData.sku);
    const sku_jarabe = formData.sku_jarabe === '' ? null : Number(formData.sku_jarabe);
    const jarabe = formData.jarabe === '' ? null : (formData.jarabe === 'si' ? 1 : 0);
    const marca = formData.marca?.trim() || '';
    const sabor = formData.sabor?.trim() || '';
    const formatoStr = formData.formato === '' ? '' : Number(formData.formato).toFixed(3);
    const unidadPaqueteStr = formData.unidadPaquete === '' ? '' : String(formData.unidadPaquete);
    const sku_descripcion = `${marca} ${sabor} ${formatoStr}${formatoStr ? 'ML' : ''} ${unidadPaqueteStr ? 'x' + unidadPaqueteStr : ''}`.trim();

    return {
      linea: formData.linea === '' ? null : Number(formData.linea),
      sku_descripcion: sku_descripcion || null,
      sku_envasado,
      jarabe,
      sku_jarabe,
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
    const payload = buildPayload();
    try {
      const res = await handleCreateProduct(payload);
      setMostrarFormulacion(true);
      console.log('Respuesta backend:', res);
    } catch (err) {
      console.error('Error crear producto:', err);
      alert('Error al crear producto. Revisa consola.');
    }
  };

  if (mostrarFormulacion) {
    return (
      <Formulacion
        sku_description={buildPayload().sku_descripcion || ''}
        jarabe={formData.jarabe === 'si' ? 'si' : 'no'}
        unidadPaquete={formData.unidadPaquete}
        formulacion_id={buildPayload().sku_envasado || 0}
        sku_jarabe={formData.sku_jarabe ? Number(formData.sku_jarabe) : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-green-50/10 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-emerald-500/10"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl border border-emerald-200">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Crear Nuevo Envase
                  </h1>
                  <p className="text-slate-600 mt-1">Configura los parámetros del producto y sus especificaciones técnicas</p>
                </div>
              </div>
              
              {/* Status Indicator */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-700">Configurando</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Information Section */}
          <SectionCard 
            title="Información Básica" 
            icon={<Package size={20} />}
            description="Datos fundamentales del producto"
            gradient="from-blue-50/30 to-indigo-50/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Field 
                label="SKU Envasado" 
                icon={<Package size={14} />}
                required
                hint="Código único del producto envasado"
              >
                <InputBase
                  type="number"
                  name="sku"
                  value={formData.sku as any}
                  onChange={handleChange}
                  placeholder="Ej: 12345"
                  inputMode="numeric"
                  required
                />
              </Field>

              <Field 
                label="Marca" 
                icon={<Settings size={14} />}
                required
                hint="Selecciona o ingresa la marca"
              >
                <InputBase
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  placeholder="Selecciona marca..."
                  list="marcasList"
                  required
                />
                <datalist id="marcasList">
                  {MARCAS.map((m, i) => <option key={i} value={m} />)}
                </datalist>
              </Field>

              <Field 
                label="Sabor" 
                icon={<Beaker size={14} />}
                required
                hint="Especifica el sabor del producto"
              >
                <InputBase
                  type="text"
                  name="sabor"
                  value={formData.sabor}
                  onChange={handleChange}
                  placeholder="Selecciona sabor..."
                  list="saboresList"
                  required
                />
                <datalist id="saboresList">
                  {SABORES.map((s, i) => <option key={i} value={s} />)}
                </datalist>
              </Field>

              <Field 
                label="Línea de Producción" 
                icon={<Settings size={14} />}
                hint="Línea donde se producirá"
              >
                <SelectBase name="linea" value={formData.linea as any} onChange={handleChange}>
                  <option value="">Seleccionar línea...</option>
                  {Array.from({ length: 14 }).map((_, i) => (
                    <option key={i} value={i + 1}>{`Línea ${String(i + 1).padStart(2, '0')}`}</option>
                  ))}
                </SelectBase>
              </Field>

              <Field 
                label="¿Requiere Jarabe?" 
                icon={<Beaker size={14} />}
                hint="Indica si el producto necesita jarabe"
              >
                <SelectBase name="jarabe" value={formData.jarabe} onChange={handleChange}>
                  <option value="no">No requiere</option>
                  <option value="si">Sí requiere</option>
                </SelectBase>
              </Field>

              {showJarabeFields && (
                <Field 
                  label="SKU Jarabe" 
                  icon={<Beaker size={14} />}
                  hint="Código del jarabe asociado"
                >
                  <InputBase
                    type="number"
                    name="sku_jarabe"
                    value={formData.sku_jarabe as any}
                    onChange={handleChange}
                    placeholder="Ej: 54321"
                  />
                </Field>
              )}

              <Field 
                label="Formato (ml)" 
                icon={<Package size={14} />}
                hint="Capacidad del envase en mililitros"
              >
                <InputBase
                  type="number"
                  name="formato"
                  step="0.001"
                  min="0"
                  value={formData.formato as any}
                  onChange={handleChange}
                  placeholder="Ej: 500"
                />
              </Field>
            </div>
          </SectionCard>

          {/* Production Parameters Section */}
          {showJarabeFields && (
            <SectionCard 
              title="Parámetros de Producción - Jarabe" 
              icon={<Beaker size={20} />}
              description="Configuración específica para productos con jarabe"
              gradient="from-purple-50/30 to-indigo-50/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Field 
                  label="Litros por Batch" 
                  hint="Volumen de producción por lote"
                >
                  <InputBase
                    type="number"
                    name="litrosBatch"
                    value={formData.litrosBatch as any}
                    onChange={handleChange}
                    placeholder="Ej: 1000"
                  />
                </Field>

                <Field 
                  label="Bebida Final" 
                  hint="Cantidad final de bebida producida"
                >
                  <InputBase
                    type="number"
                    name="bebidaFinal"
                    value={formData.bebidaFinal as any}
                    onChange={handleChange}
                    placeholder="Ej: 950"
                  />
                </Field>

                <Field 
                  label="Factor Azúcar" 
                  hint="Proporción de azúcar en la mezcla"
                >
                  <InputBase
                    type="number"
                    name="factorAzucar"
                    step="0.0000001"
                    min="0"
                    value={formData.factorAzucar as any}
                    onChange={handleChange}
                    placeholder="Ej: 0.12"
                  />
                </Field>
              </div>
            </SectionCard>
          )}

          {/* Technical Specifications Section */}
          <SectionCard 
            title="Especificaciones Técnicas" 
            icon={<Zap size={20} />}
            description="Parámetros de velocidad y configuración de máquinas"
            gradient="from-orange-50/30 to-red-50/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Field 
                label="Eficiencia Velocidad" 
                icon={<Zap size={14} />}
                hint="Factor de eficiencia de la línea"
              >
                <InputBase
                  type="number"
                  name="efVelocidad"
                  value={formData.efVelocidad as any}
                  onChange={handleChange}
                  placeholder="Ej: 85%"
                />
              </Field>

              <Field 
                label="Velocidad Botella" 
                icon={<Zap size={14} />}
                hint="Velocidad de procesamiento por minuto"
              >
                <InputBase
                  type="number"
                  name="velocidadBot"
                  value={formData.velocidadBot as any}
                  onChange={handleChange}
                  placeholder="Ej: 120"
                />
              </Field>
            </div>
          </SectionCard>

          {/* Packaging Configuration Section */}
          <SectionCard 
            title="Configuración de Empaque" 
            icon={<Users size={20} />}
            description="Especificaciones de empaque y distribución"
            gradient="from-green-50/30 to-emerald-50/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Field 
                label="Unidades por Paquete" 
                icon={<Package size={14} />}
                hint="Cantidad de unidades por paquete"
              >
                <InputBase
                  type="number"
                  name="unidadPaquete"
                  value={formData.unidadPaquete as any}
                  onChange={handleChange}
                  placeholder="Ej: 12"
                />
              </Field>

              <Field 
                label="Paquetes por Nivel" 
                hint="Paquetes que caben en un nivel"
              >
                <InputBase
                  type="number"
                  name="paquetesNivel"
                  value={formData.paquetesNivel as any}
                  onChange={handleChange}
                  placeholder="Ej: 8"
                />
              </Field>

              <Field 
                label="Cartones por Nivel" 
                hint="Cartones que se apilan por nivel"
              >
                <InputBase
                  type="number"
                  name="cartonNivel"
                  value={formData.cartonNivel as any}
                  onChange={handleChange}
                  placeholder="Ej: 4"
                />
              </Field>
            </div>
          </SectionCard>

          {/* Preview Section */}
          {(formData.marca || formData.sabor || formData.formato) && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Vista Previa del Producto</h3>
              </div>
              <div className="bg-white rounded-xl p-4 border border-emerald-200/50">
                <p className="text-lg font-medium text-slate-800">
                  {buildPayload().sku_descripcion || 'Descripción del producto aparecerá aquí...'}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                  <span>SKU: {formData.sku || '---'}</span>
                  <span>•</span>
                  <span>Línea: {formData.linea ? `L${String(formData.linea).padStart(2, '0')}` : '---'}</span>
                  <span>•</span>
                  <span>Jarabe: {formData.jarabe === 'si' ? 'Sí' : 'No'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <AlertCircle size={16} />
              <span>Revisa todos los campos antes de continuar</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="px-6 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="relative overflow-hidden px-8 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                <span className="relative flex items-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creando Producto...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Crear Producto
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearEnvase;