// features/matrizGeneral/components/MatrizGeneral.block.tsx
import React from "react";
import type { BreadcrumbItem } from "@/types";
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import useMatrizGeneral from "../hooks/useMatrizGeneral";
import BatchModal from "./BatchModal";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Matriz General", href: "/matriz-general" },
];

export default function MatrizGeneralBlock() {
  const {
    productos,
    searchTerm,
    setSearchTerm,
    handleBatchChange,
    handleFormulaClick,
    batchNumbers,
    showModal,
    setShowModal,
    modalData,
  } = useMatrizGeneral();

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
                    <th className="px-4 py-2 border">SKU Jarabe</th>
                    <th className="px-4 py-2 border">Formato</th>
                    <th className="px-4 py-2 border">Marca</th>
                    <th className="px-4 py-2 border">Sabor</th>
                    <th className="px-4 py-2 border">Batch</th>
                    <th className="px-4 py-2 border">Formula</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto, index) => (
                    <tr key={producto.sku_envasado ?? index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-2 border">{producto.linea}</td>
                      <td className="px-4 py-2 border">{producto.sku_envasado}</td>
                      <td className="px-4 py-2 border">{producto.sku_jarabe ?? "-"}</td>
                      <td className="px-4 py-2 border">{producto.formato}</td>
                      <td className="px-4 py-2 border">{producto.marca}</td>
                      <td className="px-4 py-2 border">{producto.sabor}</td>
                      <td className="px-4 py-2 border">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder={producto.sku_jarabe && producto.sku_jarabe !== "-" ? "Ingrese batch" : "Ingrese paquetes"}
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
        {showModal && modalData && (
          <BatchModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={modalData.skuJarabe ? "Fórmula de Jarabe" : "Fórmula de Envasado"}
            data={modalData}
          />
        )}
      </div>
    </AppLayout>
  );
}
