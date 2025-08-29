import React, { useState, useEffect } from 'react';

interface ProductDetail {
  cod: string;
  descripcion: string;
  um: string;
  stock: string;
  produccion: string;
  dif: string;
  batchMin: string;
  paqMin: string;
  almacen20: string;
}

interface Product {
  id: number;
  linea: string;
  sku: string;
  marca: string;
  sabor: string;
  formato: string;
  detalles: ProductDetail[];
}

interface SystemMetrics {
  sku: string;
  paqProgramado: string;
  batchProgramado: string;
  batchMin: string;
  palletsProgramado: string;
  eficiencia: string;
  paqMin: string;
  horasProduccion: string;
  temperaturaAmbiente: string;
  humedadRelativa: string;
  presionAtmosferica: string;
}

const ProductManagementSystem: React.FC = () => {
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Sistema inicializado');
  const [currentMetrics, setCurrentMetrics] = useState<SystemMetrics>({
    sku: "599371",
    paqProgramado: "23,600",
    batchProgramado: "20",
    batchMin: "116.6",
    palletsProgramado: "169",
    eficiencia: "80.00%",
    paqMin: "137,542",
    horasProduccion: "24.00",
    temperaturaAmbiente: "22°C",
    humedadRelativa: "65%",
    presionAtmosferica: "1013 hPa"
  });

  const productData: Product[] = [
    {
      id: 1,
      linea: "1",
      sku: "408462",
      marca: "CIELO",
      sabor: "AGUA",
      formato: "0.625",
      detalles: [
        { cod: "48289", descripcion: "STRETCH DE ALTO RENDIMIENTO 20\" (TS)", um: "KG", stock: "2,300", produccion: "142", dif: "2,158", batchMin: "324.86", paqMin: "383,333", almacen20: "0.00" },
        { cod: "53945", descripcion: "PREFORMA PET 13.1GR CRISTAL MIST (30) - Algarado) - S/A - F", um: "UN", stock: "1,650,500", produccion: "283,200", dif: "1,367,300", batchMin: "116.56", paqMin: "137,542", almacen20: "0.00" },
        { cod: "55537", descripcion: "ETIQUETA LAMINADA AGUA CIELO 625 ML SIN GAS UNIF AJE AJO TAST", um: "UN", stock: "2,540,600", produccion: "283,200", dif: "2,257,400", batchMin: "179.42", paqMin: "211,717", almacen20: "0.00" }
      ]
    },
    {
      id: 2,
      linea: "2",
      sku: "408361",
      marca: "VIDA",
      sabor: "AGUA",
      formato: "0.625",
      detalles: [
        { cod: "53308", descripcion: "LAMINA TERMOCONTRAIBLE 920MM X 40 MICRAS", um: "KG", stock: "9,500", produccion: "1,416", dif: "8,084", batchMin: "134.18", paqMin: "158,333", almacen20: "0.00" },
        { cod: "43683", descripcion: "TAPA PET 1881 - C30 8 AZUL (SAN MIGUEL)", um: "UN", stock: "3,450,600", produccion: "283,200", dif: "3,167,400", batchMin: "243.69", paqMin: "287,550", almacen20: "0.00" },
        { cod: "48290", descripcion: "ADHESIVO PARA ETIQUETAS TIPO HOT MELT", um: "KG", stock: "850", produccion: "45", dif: "805", batchMin: "98.50", paqMin: "116,250", almacen20: "0.00" }
      ]
    },
    {
      id: 3,
      linea: "3",
      sku: "422387",
      marca: "KR",
      sabor: "KOLITA",
      formato: "0.400",
      detalles: [
        { cod: "48291", descripcion: "FILM PLASTICO PARA EMPAQUE 15 MICRAS", um: "KG", stock: "1,200", produccion: "78", dif: "1,122", batchMin: "145.20", paqMin: "171,500", almacen20: "0.00" },
        { cod: "53946", descripcion: "BOTELLA PET 400ML TRANSPARENTE ROSCA 28MM", um: "UN", stock: "890,000", produccion: "156,800", dif: "733,200", batchMin: "89.75", paqMin: "105,950", almacen20: "0.00" },
        { cod: "43684", descripcion: "TAPA ROSCA 28MM AZUL METALIZADA", um: "UN", stock: "2,100,000", produccion: "156,800", dif: "1,943,200", batchMin: "198.40", paqMin: "234,200", almacen20: "0.00" }
      ]
    },
    // Adding more products for completeness
    {
      id: 4,
      linea: "4",
      sku: "422388",
      marca: "KR",
      sabor: "COLA",
      formato: "0.400",
      detalles: [
        { cod: "55538", descripcion: "ETIQUETA KR COLA 400ML NUEVA FORMULA", um: "UN", stock: "1,890,500", produccion: "156,800", dif: "1,733,700", batchMin: "167.85", paqMin: "198,125", almacen20: "0.00" }
      ]
    },
    {
      id: 5,
      linea: "5",
      sku: "422390",
      marca: "KR",
      sabor: "GUARANA",
      formato: "0.400",
      detalles: [
        { cod: "48293", descripcion: "EXTRACTO NATURAL DE GUARANA", um: "KG", stock: "450", produccion: "28", dif: "422", batchMin: "67.20", paqMin: "79,375", almacen20: "0.00" }
      ]
    }
  ];

  const defaultDetails: ProductDetail[] = [
    { cod: "48289", descripcion: "STRETCH DE ALTO RENDIMIENTO 20\" (TS)", um: "KG", stock: "2,300", produccion: "142", dif: "2,158", batchMin: "324.86", paqMin: "383,333", almacen20: "0.00" },
    { cod: "53945", descripcion: "PREFORMA PET 13.1GR CRISTAL MIST (30) - Algarado) - S/A - F", um: "UN", stock: "1,650,500", produccion: "283,200", dif: "1,367,300", batchMin: "116.56", paqMin: "137,542", almacen20: "0.00" },
    { cod: "53308", descripcion: "LAMINA TERMOCONTRAIBLE 920MM X 40 MICRAS", um: "KG", stock: "9,500", produccion: "1,416", dif: "8,084", batchMin: "134.18", paqMin: "158,333", almacen20: "0.00" },
    { cod: "43683", descripcion: "TAPA PET 1881 - C30 8 AZUL (SAN MIGUEL)", um: "UN", stock: "3,450,600", produccion: "283,200", dif: "3,167,400", batchMin: "243.69", paqMin: "287,550", almacen20: "0.00" },
    { cod: "55537", descripcion: "ETIQUETA LAMINADA AGUA CIELO 625 ML SIN GAS UNIF AJE AJO TAST", um: "UN", stock: "2,540,600", produccion: "283,200", dif: "2,257,400", batchMin: "179.42", paqMin: "211,717", almacen20: "0.00" }
  ];

  const showNotification = (message: string) => {
    setStatusMessage(message);
    // Create a visual notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-5 right-5 bg-green-500 bg-opacity-90 text-white px-5 py-3 rounded-md font-semibold text-sm z-50 transform translate-x-full opacity-0 transition-all duration-300 ease-out';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.remove('translate-x-full', 'opacity-0');
    }, 100);
    
    setTimeout(() => {
      notification.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const toggleProduct = (productId: number) => {
    if (activeProductId === productId) {
      setActiveProductId(null);
      showNotification('Ningún producto seleccionado');
      return;
    }
    
    setActiveProductId(productId);
    const product = productData.find(p => p.id === productId);
    if (product) {
      showNotification(`Producto seleccionado: ${product.marca} ${product.sabor} ${product.formato}L`);
    }
  };

  const updateRandomMetrics = () => {
    const eficienciaNum = parseFloat(currentMetrics.eficiencia);
    const newEficiencia = Math.max(75, Math.min(95, eficienciaNum + (Math.random() - 0.5) * 2));
    
    const tempNum = parseInt(currentMetrics.temperaturaAmbiente);
    const newTemp = Math.max(18, Math.min(28, tempNum + Math.floor((Math.random() - 0.5) * 3)));
    
    const humNum = parseInt(currentMetrics.humedadRelativa);
    const newHum = Math.max(50, Math.min(80, humNum + Math.floor((Math.random() - 0.5) * 5)));
    
    setCurrentMetrics(prev => ({
      ...prev,
      eficiencia: newEficiencia.toFixed(2) + '%',
      temperaturaAmbiente: newTemp + '°C',
      humedadRelativa: newHum + '%'
    }));
    
    showNotification('Métricas actualizadas');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '5') {
        const productId = parseInt(e.key);
        if (productData.find(p => p.id === productId)) {
          toggleProduct(productId);
        }
      }
      
      if (e.key === 'Escape') {
        setActiveProductId(null);
        showNotification('Selección cancelada');
      }
      
      if (e.key.toLowerCase() === 'r' && e.ctrlKey) {
        e.preventDefault();
        updateRandomMetrics();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Auto-update metrics every 30 seconds
    const interval = setInterval(updateRandomMetrics, 30000);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, []);

  const getDisplayDetails = (): ProductDetail[] => {
    if (activeProductId) {
      const product = productData.find(p => p.id === activeProductId);
      return product?.detalles || defaultDetails;
    }
    return defaultDetails;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white p-5">
  <div className="max-w-full mx-auto">
    {/* Header */}
    <header className="text-center mb-8 p-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
      <h1 className="text-3xl md:text-2xl lg:text-4xl font-bold tracking-wide">
        SPORADE TROPICAL PET NO RETORNABLE 500 ML 12 - ASÉPTICA
      </h1>
    </header>

    {/* Metrics Section */}
    <section className="mb-8 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-5">
        {/* SKU Card */}
        <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-[#4a90e2] to-[#357abd] rounded-lg shadow-lg min-w-[200px]">
          <label className="text-sm font-semibold mb-2 opacity-90">SKU</label>
          <span className="text-3xl font-bold text-white">{currentMetrics.sku}</span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            ["PAQ PROGRAMADO", currentMetrics.paqProgramado],
            ["N° BATCH PROGRAMADO", currentMetrics.batchProgramado],
            ["BATCH MIN", currentMetrics.batchMin],
            ["PALLETS PROGRAMADO", currentMetrics.palletsProgramado],
            ["% EFICIENCIA", currentMetrics.eficiencia],
            ["PAQ MIN", currentMetrics.paqMin],
            ["HORAS PRODUCCIÓN", currentMetrics.horasProduccion]
          ].map(([label, value], i) => (
            <div
              key={i}
              className="flex flex-col p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              <label className="text-xs font-semibold mb-1 opacity-90 uppercase tracking-wide">{label}</label>
              <span className="text-lg font-bold">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Products Table */}
    <section className="mb-8 p-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-x-auto">
      <h3 className="text-xl font-semibold mb-4 text-center uppercase tracking-wide">
        Productos Disponibles
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse bg-white/5 rounded-lg overflow-hidden shadow-lg">
          <thead className="bg-gradient-to-br from-[#2c5aa0] to-[#1e3c72]">
            <tr>
              {["N° LÍNEA","SKU","MARCA","SABOR","FORMATO","ACTIVADOR"].map((h) => (
                <th
                  key={h}
                  className="p-3 text-left font-bold text-xs uppercase tracking-wide border-b-2 border-white/20"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productData.map((product, index) => (
              <tr
                key={product.id}
                className={`border-b border-white/10 hover:bg-white/15 hover:scale-[1.01] transition-all duration-300 ${
                  index % 2 === 1 ? "bg-white/5" : ""
                }`}
              >
                <td className="p-3 text-center font-medium">{product.linea}</td>
                <td className="p-3 font-medium">{product.sku}</td>
                <td className="p-3 font-medium">{product.marca}</td>
                <td className="p-3 font-medium">{product.sabor}</td>
                <td className="p-3 font-medium">{product.formato}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => toggleProduct(product.id)}
                    className={`px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wide transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg text-white
                      ${
                        activeProductId === product.id
                          ? "bg-gradient-to-br from-[#28a745] to-[#20c997] animate-pulse hover:from-[#34ce57] hover:to-[#28a745]"
                          : "bg-gradient-to-br from-[#4a90e2] to-[#357abd] hover:from-[#5ba0f2] hover:to-[#4a90e2]"
                      }`}
                    title={`Ver detalles de ${product.marca} ${product.sabor} ${product.formato}L`}
                  >
                    VER
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    {/* Details Table */}
    <section className="p-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-x-auto">
      <h3 className="text-xl font-semibold mb-4 text-center uppercase tracking-wide">
        Detalles del Producto Seleccionado
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse bg-white/5 rounded-lg overflow-hidden shadow-lg">
          <thead className="bg-gradient-to-br from-[#2c5aa0] to-[#1e3c72]">
            <tr>
              {["COD","DESCRIPCIÓN","U.M","STOCK","PRODUCCIÓN","DIF","BATCH MIN","PAQ MIN","ALMACÉN 20"].map((h) => (
                <th
                  key={h}
                  className="p-3 text-left font-bold text-xs uppercase tracking-wide border-b-2 border-white/20"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getDisplayDetails().map((detail, index) => (
              <tr
                key={`${detail.cod}-${index}`}
                className={`animate-slideInUp border-b border-white/10 hover:bg-white/15 transition-all duration-300 ${
                  index % 2 === 1 ? "bg-white/5" : ""
                }`}
              >
                <td className="p-3 text-center font-medium">{detail.cod}</td>
                <td className="p-3 font-medium min-w-[200px]">{detail.descripcion}</td>
                <td className="p-3 text-center font-medium">{detail.um}</td>
                <td className="p-3 text-right font-medium">{detail.stock}</td>
                <td className="p-3 text-right font-medium">{detail.produccion}</td>
                <td className="p-3 text-right font-medium">{detail.dif}</td>
                <td className="p-3 text-right font-medium">{detail.batchMin}</td>
                <td className="p-3 text-right font-medium">{detail.paqMin}</td>
                <td className="p-3 text-right font-medium">{detail.almacen20}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </div>
</div>

  );
};

export default ProductManagementSystem;