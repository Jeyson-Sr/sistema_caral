import { useEffect, useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Matriz General", href: "/matriz-general" },
];

export default function MatrizGeneral() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [batchNumbers, setBatchNumbers] = useState<{ [key: string]: string }>({});
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Consumir API
  useEffect(() => {
    setLoading(true);
    fetch("/productos/list")
      .then((res) => res.json())
      .then((data) => {
        const productosTransformados = data.map((prod: any) => ({
          ...prod,
          sku_jarabe: prod.sku_jarabe ?? "-",
          linea: prod.linea ? `L${String(prod.linea).padStart(2, "0")}` : "-",
        }));
        setProductos(productosTransformados);
      })
      .catch((err) => console.error("Error al cargar productos:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleBatchChange = (skuEnvasado: string, value: string) => {
    setBatchNumbers((prev) => ({
      ...prev,
      [skuEnvasado]: value,
    }));
  };

  const handleFormulaClick = (producto: any) => {
    if (batchNumbers[producto.sku_envasado]) {
      setSelectedProduct(producto);
      setShowModal(true);
    }
  };

  const filteredProducts = productos.filter((producto) => {
    const searchTerms = searchTerm.toLowerCase().split(" ").filter((t) => t.length > 0);
    return searchTerms.every((term) =>
      Object.values(producto).some((value) =>
        value?.toString().toLowerCase().includes(term)
      )
    );
  });

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Matriz General" />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-full mx-auto space-y-8">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-8 shadow-2xl border border-slate-600/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Matriz General de Productos</h1>
                <p className="text-slate-300">Gestiona las fórmulas y batches de producción</p>
              </div>
              
              <div className="text-right">
                <div className="px-4 py-2 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-300 text-sm">Total productos:</span>
                  <div className="text-white font-bold text-xl">
                    {loading ? "..." : productos.length.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de búsqueda mejorada */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por SKU, marca, sabor, línea..."
                  className="w-full px-6 py-4 rounded-xl bg-slate-700/50 text-white border border-slate-600 
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                           placeholder:text-slate-400 pr-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  )}
                  <span className="text-slate-500">🔍</span>
                </div>
              </div>
              
              {searchTerm && (
                <div className="mt-3 text-center">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm">
                    {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tabla de productos */}
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-4 text-blue-400">
                  <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xl font-medium">Cargando productos...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-900/80">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-slate-300 border-b border-slate-700">Línea</th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-300 border-b border-slate-700">SKU Envasado</th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-300 border-b border-slate-700">SKU Jarabe</th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-300 border-b border-slate-700">Formato</th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-300 border-b border-slate-700">Marca</th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-300 border-b border-slate-700">Sabor</th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-300 border-b border-slate-700">Batch/Paquetes</th>
                        <th className="px-6 py-4 text-center font-semibold text-slate-300 border-b border-slate-700">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {filteredProducts.map((producto, index) => (
                        <tr key={index} className="hover:bg-slate-700/30 transition-all group">
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg font-mono text-sm">
                              {producto.linea}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-200 font-mono font-medium">
                              {producto.sku_envasado}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {producto.sku_jarabe !== "-" ? (
                              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg font-mono text-sm">
                                {producto.sku_jarabe}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">Sin jarabe</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-200 font-mono">
                              {producto.formato ? `${producto.formato} ML` : "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-600/50 text-slate-200 rounded text-sm font-medium">
                              {producto.marca}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-200 capitalize">
                              {producto.sabor?.toLowerCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded-lg bg-slate-700/50 text-white border border-slate-600 
                                       focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                                       placeholder:text-slate-400 text-center font-mono"
                              placeholder={producto.sku_jarabe !== "-" ? "Batch #" : "Paquetes"}
                              value={batchNumbers[producto.sku_envasado] || ""}
                              onChange={(e) => handleBatchChange(producto.sku_envasado, e.target.value)}
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                batchNumbers[producto.sku_envasado]
                                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
                                  : "bg-slate-600/50 text-slate-400 cursor-not-allowed"
                              }`}
                              onClick={() => handleFormulaClick(producto)}
                              disabled={!batchNumbers[producto.sku_envasado]}
                            >
                              {batchNumbers[producto.sku_envasado] ? "Ver Fórmula" : "Ingrese Batch"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Estado vacío */}
                {filteredProducts.length === 0 && !loading && (
                  <div className="text-center py-16 text-slate-400">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold mb-2">No se encontraron productos</h3>
                    <p>
                      {searchTerm 
                        ? 'Prueba ajustando los términos de búsqueda'
                        : 'No hay productos disponibles en este momento'
                      }
                    </p>
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Limpiar búsqueda
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal mejorado */}
        {showModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-700/50 max-h-[80vh] overflow-y-auto">
              {/* Header del modal */}
              <div className="p-8 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Fórmulas de Producción</h2>
                    <p className="text-slate-400">
                      {selectedProduct.marca} {selectedProduct.sabor} - {selectedProduct.formato}ML
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 text-white 
                             transition-colors flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Contenido del modal */}
              <div className="p-8">
                <div className={`grid ${selectedProduct.sku_jarabe !== "-" ? "lg:grid-cols-2" : "grid-cols-1"} gap-8`}>
                  
                  {/* Fórmula de Envasado */}
                  <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">📦</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Fórmula de Envasado</h3>
                        <p className="text-slate-400 text-sm">Proceso de empaque</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-slate-600/30">
                        <span className="text-slate-400">SKU:</span>
                        <span className="text-white font-mono font-bold">{selectedProduct.sku_envasado}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-600/30">
                        <span className="text-slate-400">Línea:</span>
                        <span className="text-blue-300 font-medium">{selectedProduct.linea}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-600/30">
                        <span className="text-slate-400">Marca:</span>
                        <span className="text-white">{selectedProduct.marca}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-600/30">
                        <span className="text-slate-400">Sabor:</span>
                        <span className="text-white capitalize">{selectedProduct.sabor?.toLowerCase()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-600/30">
                        <span className="text-slate-400">Formato:</span>
                        <span className="text-emerald-300 font-mono">{selectedProduct.formato} ML</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">Batch/Paquetes:</span>
                        <span className="text-amber-300 font-bold">{batchNumbers[selectedProduct.sku_envasado]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fórmula de Jarabe */}
                  {selectedProduct.sku_jarabe !== "-" && (
                    <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold">🧪</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Fórmula de Jarabe</h3>
                          <p className="text-slate-400 text-sm">Preparación de jarabe</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between py-2 border-b border-slate-600/30">
                          <span className="text-slate-400">SKU:</span>
                          <span className="text-white font-mono font-bold">{selectedProduct.sku_jarabe}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-600/30">
                          <span className="text-slate-400">Línea:</span>
                          <span className="text-blue-300 font-medium">{selectedProduct.linea}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-600/30">
                          <span className="text-slate-400">Marca:</span>
                          <span className="text-white">{selectedProduct.marca}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-600/30">
                          <span className="text-slate-400">Sabor:</span>
                          <span className="text-white capitalize">{selectedProduct.sabor?.toLowerCase()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-600/30">
                          <span className="text-slate-400">Formato:</span>
                          <span className="text-emerald-300 font-mono">{selectedProduct.formato} ML</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-slate-400">Batch:</span>
                          <span className="text-amber-300 font-bold">{batchNumbers[selectedProduct.sku_envasado]}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-700/50">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg 
                             transition-all font-medium"
                  >
                    Cerrar
                  </button>
                  <button
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                             transition-all font-medium shadow-lg shadow-blue-500/25"
                  >
                    Generar Fórmula
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}