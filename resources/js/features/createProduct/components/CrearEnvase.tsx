// resources/js/features/createProduct/components/CrearEnvase.tsx
import React, { useState } from 'react';
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

const CrearEnvase: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    sku: '',
    marca: '',
    sabor: '',
    linea: '',
    jarabe: '',
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

    if (NUMBER_FIELDS.has(name)) {
      newValue = value === '' ? '' : Number(value);
    }

    if (name === 'marca' || name === 'sabor') {
      newValue = String(value).toUpperCase();
    }

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
        //Borra en porducion 
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
    <div className="p-4 bg-black rounded-lg shadow">
      <form onSubmit={handleSubmit}>
        <div className={`grid ${showJarabeFields ? 'grid-cols-6' : 'grid-cols-5'} gap-4 mb-6`}>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">SKU (envasado)</label>
            <input
              type="number"
              name="sku"
              value={formData.sku as any}
              onChange={handleChange}
              placeholder="Ingrese SKU Envasado"
              className="w-full border rounded-md p-2 bg-black text-white"
            />
          </div>

          {showJarabeFields && (
            <div>
              <label className="block text-sm font-medium mb-1 text-white">SKU (jarabe)</label>
              <input
                type="number"
                name="sku_jarabe"
                value={formData.sku_jarabe as any}
                onChange={handleChange}
                placeholder="Ingrese SKU Jarabe"
                className="w-full border rounded-md p-2 bg-black text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-white">Marca</label>
            <input
              type="text"
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              placeholder="Ingrese marca"
              className="w-full border rounded-md p-2 bg-black text-white"
              list="marcasList"
            />
            <datalist id="marcasList">
              {MARCAS.map((m, i) => <option key={i} value={m} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-white">Sabor</label>
            <input
              type="text"
              name="sabor"
              value={formData.sabor}
              onChange={handleChange}
              placeholder="Ingrese sabor"
              className="w-full border rounded-md p-2 bg-black text-white"
              list="saboresList"
            />
            <datalist id="saboresList">
              {SABORES.map((s, i) => <option key={i} value={s} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-white">Línea</label>
            <select
              name="linea"
              value={formData.linea as any}
              onChange={handleChange}
              className="w-full border rounded-md p-2 bg-black text-white"
            >
              <option value="">---</option>
              {Array.from({ length: 14 }).map((_, i) => (
                <option key={i} value={i + 1}>
                  {`L${String(i + 1).padStart(2, '0')}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-white">Jarabe</label>
            <select
              name="jarabe"
              value={formData.jarabe}
              onChange={handleChange}
              className="w-full border rounded-md p-2 bg-black text-white"
            >
              <option value="no">No</option>
              <option value="si">Si</option>
            </select>
          </div>
        </div>

        {showJarabeFields ? (
          <>
            <div className="grid grid-cols-5 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Formato</label>
                <input
                  type="number"
                  name="formato"
                  step="0.001"
                  min="0"
                  value={formData.formato as any}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 bg-black text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">Litros Batch</label>
                <input
                  type="number"
                  name="litrosBatch"
                  value={formData.litrosBatch as any}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 bg-black text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">Bebida Final</label>
                <input
                  type="number"
                  name="bebidaFinal"
                  value={formData.bebidaFinal as any}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 bg-black text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">Factor Azúcar</label>
                <input
                  type="number"
                  name="factorAzucar"
                  step="0.0000001"
                  min="0"
                  value={formData.factorAzucar as any}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 bg-black text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">EF Velocidad</label>
                <input
                  type="number"
                  name="efVelocidad"
                  value={formData.efVelocidad as any}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 bg-black text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Velocidad Bot</label>
                <input
                  type="number"
                  name="velocidadBot"
                  value={formData.velocidadBot as any}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 bg-black text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">Unidad Paquete</label>
                <input
                  type="number"
                  name="unidadPaquete"
                  value={formData.unidadPaquete as any}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 bg-black text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">Paquetes Nivel</label>
                <input
                  type="number"
                  name="paquetesNivel"
                  value={formData.paquetesNivel as any}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 bg-black text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">Cartón Nivel</label>
                <input
                  type="number"
                  name="cartonNivel"
                  value={formData.cartonNivel as any}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 bg-black text-white"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Formato</label>
                <input
                  type="number"
                  name="formato"
                  step="0.001"
                  min="0"
                  value={formData.formato as any}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 bg-black text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">EF Velocidad</label>
                <input
                  type="number"
                  name="efVelocidad"
                  value={formData.efVelocidad as any}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 bg-black text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">Velocidad Bot</label>
                <input
                  type="number"
                  name="velocidadBot"
                  value={formData.velocidadBot as any}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 bg-black text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Unidad Paquete</label>
                <input
                  type="number"
                  name="unidadPaquete"
                  value={formData.unidadPaquete as any}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 bg-black text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">Paquetes Nivel</label>
                <input
                  type="number"
                  name="paquetesNivel"
                  value={formData.paquetesNivel as any}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 bg-black text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">Cartón Nivel</label>
                <input
                  type="number"
                  name="cartonNivel"
                  value={formData.cartonNivel as any}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 bg-black text-white"
                />
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearEnvase;
