// features/matrizGeneral/components/MatrizGeneral.block.tsx
import React from "react";
import type { BreadcrumbItem } from "@/types";
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { 
  Search, 
  Grid3X3, 
  Package, 
  Beaker, 
  Settings, 
  Eye, 
  Filter,
  BarChart3,
  FileSpreadsheet,
  Hash,
  Palette,
  FlaskConical
} from "lucide-react";
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
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10"></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl border border-blue-200">
                    <Grid3X3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Matriz General
                    </h1>
                    <p className="text-slate-600 mt-1">Gestión integral de productos, fórmulas y procesos de producción</p>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800">{productos.length}</div>
                    <div className="text-xs text-slate-500">Productos</div>
                  </div>
                  <div className="w-px h-12 bg-slate-200"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {Object.keys(batchNumbers).filter(key => batchNumbers[key]).length}
                    </div>
                    <div className="text-xs text-slate-500">Con Calculo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-green-50/30"></div>
            <div className="relative p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl border border-emerald-200">
                  <Search className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar por SKU, marca, sabor, formato..."
                      className="w-full pl-12 pr-6 py-4 rounded-xl bg-white border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 text-slate-800 placeholder:text-slate-400"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
                  <Filter size={16} className="text-slate-500" />
                  <span className="text-sm text-slate-600">Filtros activos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Table */}
          <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 to-white"></div>
            
            {/* Table Header */}
            <div className="relative border-b border-slate-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Matriz de Productos</h2>
                  <p className="text-sm text-slate-600">
                    {productos.length} productos • Ingresa batch/paquetes para generar fórmulas
                  </p>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="relative overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/70 backdrop-blur-sm border-b border-slate-600 ">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Settings size={14} />
                        Línea
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Hash size={14} />
                        SKU Envasado
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Beaker size={14} />
                        SKU Jarabe
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Package size={14} />
                        Formato
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Palette size={14} />
                        Marca
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FlaskConical size={14} />
                        Sabor
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <BarChart3 size={14} />
                        Batch/Paquetes
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet size={14} />
                        Fórmula
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productos.map((producto, index) => (
                    <tr 
                      key={producto.sku_envasado ?? index} 
                      className="hover:bg-slate-50/80 transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-medium">
                            {String(producto.linea).padStart(2, '0')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-sm font-medium">
                          #{producto.sku_envasado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {producto.sku_jarabe && producto.sku_jarabe !== "-" ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-sm font-medium">
                            #{producto.sku_jarabe}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">Sin jarabe</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-800">
                          {producto.formato} <span className="text-slate-500 text-xs">ml</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-sm font-medium">
                          {producto.marca}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-800 font-medium">
                          {producto.sabor}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                            placeholder={producto.sku_jarabe && producto.sku_jarabe !== "-" ? "Ingrese batch" : "Ingrese paquetes"}
                            value={batchNumbers[producto.sku_envasado] || ""}
                            onChange={(e) => handleBatchChange(producto.sku_envasado, e.target.value)}
                          />
                          {batchNumbers[producto.sku_envasado] && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            batchNumbers[producto.sku_envasado]
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                          onClick={() => handleFormulaClick(producto)}
                          disabled={!batchNumbers[producto.sku_envasado]}
                        >
                          <Eye size={16} />
                          {batchNumbers[producto.sku_envasado] ? "Ver Fórmula" : "Ingresa Batch"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {productos.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <Grid3X3 size={64} className="mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">No hay productos disponibles</h3>
                <p className="text-sm text-center max-w-md">
                  No se encontraron productos que coincidan con los criterios de búsqueda.
                </p>
              </div>
            )}

            {/* Footer Stats */}
            <div className="relative border-t border-slate-100 p-6">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Total productos: {productos.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Con Cálculo configurado: {Object.keys(batchNumbers).filter(key => batchNumbers[key]).length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Con jarabe: {productos.filter(p => p.sku_jarabe && p.sku_jarabe !== "-").length}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  Última actualización: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
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
    </AppLayout>
  );
}