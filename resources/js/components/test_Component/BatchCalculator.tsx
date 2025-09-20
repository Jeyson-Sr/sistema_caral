import React, { useState, useEffect } from 'react';

interface BatchData {
  cantidadBatch: number;
  formato: number;
  litrosBatch: number;
  bebidaFinal: number;
  factorAzucar: number;
  efiVelocidad: number;
  velocidadBot: number;
  unidadPaquete: number;
  paquetesNivel: number;
  cartonNivel: number;
}

interface ResultData {
  ratio: number;
  cantAzucarBatch: number;
  paquetesLanzados: number;
  horasProduccion: number;
  diasProduccion: number;
  batchMinutos: number;
  paletasProduccion: number;
  cu30Litros: number;
  litrosJarabeReal: number;
  kgAzucarReal: number;
  velocidadPalletHora: number;
  paquetesPallets: number;
}

const BatchCalculator: React.FC = () => {
  const [data, setData] = useState<BatchData>({
    cantidadBatch: 0,
    formato: 0.400,
    litrosBatch: 2140,
    bebidaFinal: 13822,
    factorAzucar: 0.048265,
    efiVelocidad: 80.0,
    velocidadBot: 52000,
    unidadPaquete: 15,
    paquetesNivel: 25,
    cartonNivel: 8,
  });

  const [results, setResults] = useState<ResultData | null>(null);

  const calcular = () => {
    if (data.cantidadBatch === 0) return;

    const ratio = data.litrosBatch / data.bebidaFinal;
    const cantAzucarBatch = data.bebidaFinal * data.factorAzucar;
    const paquetesLanzados = data.cantidadBatch * data.bebidaFinal / data.formato / data.unidadPaquete;
    const horasProduccion = data.bebidaFinal / ((data.velocidadBot * (data.efiVelocidad / 100)) * data.formato) * data.cantidadBatch;
    const diasProduccion = horasProduccion / 24;
    const batchMinutos = (horasProduccion / data.cantidadBatch) * 60;
    const paquetesPallets = data.paquetesNivel * data.cartonNivel;
    const paletasProduccion = paquetesLanzados / paquetesPallets;
    const cu30Litros = paquetesLanzados * data.formato * data.unidadPaquete / 30;
    const litrosJarabeReal = data.cantidadBatch * data.litrosBatch;
    const kgAzucarReal = data.factorAzucar * data.cantidadBatch;
    const velocidadPalletHora = data.velocidadBot / data.unidadPaquete / paquetesPallets;

    setResults({
      ratio,
      cantAzucarBatch,
      paquetesLanzados,
      horasProduccion,
      diasProduccion,
      batchMinutos,
      paletasProduccion,
      cu30Litros,
      litrosJarabeReal,
      kgAzucarReal,
      velocidadPalletHora,
      paquetesPallets,
    });
  };

  useEffect(() => {
    if (data.cantidadBatch > 0) {
      calcular();
    }
  }, [data]);

  const handleInputChange = (field: keyof BatchData, value: number) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const ResultCard: React.FC<{ title: string; value: number | string; format?: 'decimal' | 'integer' | 'currency' }> = ({ 
    title, 
    value, 
    format = 'decimal' 
  }) => {
    const formatValue = (val: number | string) => {
      if (typeof val === 'string') return val;
      switch (format) {
        case 'integer': return Math.round(val).toLocaleString();
        case 'currency': return val.toFixed(2);
        default: return val >= 1000 ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : val.toFixed(6);
      }
    };

    return (
      <div className="bg-black p-4 rounded shadow">
        <div className="text-sm text-gray-300">{title}</div>
        <div className="text-lg font-medium text-white">{formatValue(value)}</div>
      </div>
    );
  };

  const InputField: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    step?: number;
    min?: number;
    max?: number;
    isMainInput?: boolean;
  }> = ({ label, value, onChange, step = 0.01, min, max, isMainInput = false }) => (
    <div className="mb-4">
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={step}
        min={min}
        max={max}
        className={`w-full px-3 py-2 border rounded bg-black text-white ${
          isMainInput ? 'border-blue-500' : 'border-gray-600'
        }`}
        placeholder={isMainInput ? 'Ingresa cantidad de batch' : ''}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-black shadow rounded-lg border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-medium text-white">Calculadora de Producción por Batch</h1>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <InputField
                label="Cantidad Batch"
                value={data.cantidadBatch}
                onChange={(value) => handleInputChange('cantidadBatch', value)}
                isMainInput={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {Object.entries(data).map(([key, value]) => (
                key !== 'cantidadBatch' && (
                  <InputField
                    key={key}
                    label={key}
                    value={value}
                    onChange={(value) => handleInputChange(key as keyof BatchData, value)}
                  />
                )
              ))}
            </div>

            {results && data.cantidadBatch > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(results).map(([key, value]) => (
                  <ResultCard
                    key={key}
                    title={key}
                    value={value}
                    format={typeof value === 'number' && value % 1 === 0 ? 'integer' : 'decimal'}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 p-4">
                Ingrese la cantidad de batch para ver resultados
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchCalculator;