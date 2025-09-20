import { useEffect, useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Matriz General", href: "/matriz-general" },
];

export default function MatrizGeneral() {
  const [productos, setProductos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [batchNumbers, setBatchNumbers] = useState<{ [key: string]: string }>({});
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // 🔹 Consumir API
  useEffect(() => {
    fetch("/productos/list") // 👈 ruta Laravel
      .then((res) => res.json())
      .then((data) => {
        // Transformar los datos
        const productosTransformados = data.map((prod: any) => ({
          ...prod,
          sku_jarabe: prod.sku_jarabe ?? "-", // si null poner '-'
          linea: prod.linea ? `L${String(prod.linea).padStart(2, "0")}` : "-", // de 1 → L01
        }));
        setProductos(productosTransformados);
      })
      .catch((err) => console.error("Error al cargar productos:", err));
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Matriz General" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Input búsqueda */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="Buscar producto..."
            className="w-full max-w-2xl px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabla */}
        <div className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
          <div className="relative p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 border">Línea</th>
                    <th className="px-4 py-2 border">SKU Envasado</th>
                    <th className="px-4 py-2 border">SKU Jara  be</th>
                    <th className="px-4 py-2 border">Formato</th>
                    <th className="px-4 py-2 border">Marca</th>
                    <th className="px-4 py-2 border">Sabor</th>
                    <th className="px-4 py-2 border">Batch</th>
                    <th className="px-4 py-2 border">Formula</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((producto, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-2 border">{producto.linea}</td>
                      <td className="px-4 py-2 border">{producto.sku_envasado}</td>
                      <td className="px-4 py-2 border">{producto.sku_jarabe}</td>
                      <td className="px-4 py-2 border">{producto.formato}</td>
                      <td className="px-4 py-2 border">{producto.marca}</td>
                      <td className="px-4 py-2 border">{producto.sabor}</td>
                      <td className="px-4 py-2 border">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder={producto.sku_jarabe !== "-" ? "Ingrese batch" : "Ingrese paquetes"}
                          value={batchNumbers[producto.sku_envasado] || ""}
                          onChange={(e) => handleBatchChange(producto.sku_envasado, e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <button
                          className={`px-4 py-1 rounded ${
                            batchNumbers[producto.sku_envasado]
                              ? "bg-blue-500 text-white hover:bg-blue-600"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                          onClick={() => handleFormulaClick(producto)}
                          disabled={!batchNumbers[producto.sku_envasado]}
                        >
                          Mostrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white text-black p-6 rounded-lg max-w-2xl w-full">
              <div className="flex justify-between mb-6">
                <div className="w-1/2 pr-4 border-r">
                  <h2 className="text-xl font-bold mb-4">Fórmula de Envasado</h2>
                  <p><strong>SKU:</strong> {selectedProduct.sku_envasado}</p>
                  <p><strong>Marca:</strong> {selectedProduct.marca}</p>
                  <p><strong>Sabor:</strong> {selectedProduct.sabor}</p>
                  <p><strong>Batch:</strong> {batchNumbers[selectedProduct.sku_envasado]}</p>
                </div>
                {selectedProduct.sku_jarabe !== "-" && (
                  <div className="w-1/2 pl-4">
                    <h2 className="text-xl font-bold mb-4">Fórmula de Jarabe</h2>
                    <p><strong>SKU:</strong> {selectedProduct.sku_jarabe}</p>
                    <p><strong>Marca:</strong> {selectedProduct.marca}</p>
                    <p><strong>Sabor:</strong> {selectedProduct.sabor}</p>
                    <p><strong>Batch:</strong> {batchNumbers[selectedProduct.sku_envasado]}</p>
                  </div>
                )}
              </div>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => setShowModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
