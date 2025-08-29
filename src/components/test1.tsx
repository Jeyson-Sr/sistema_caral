import  { useState } from "react";

const productData = [
  {
    id: 1,
    linea: "1",
    sku: "408462",
    marca: "CIELO",
    sabor: "AGUA",
    formato: "0.625",
    detalles: [
      {
        cod: "48289",
        descripcion: "STRETCH DE ALTO RENDIMIENTO 20\" (TS)",
        um: "KG",
        stock: "2,300",
        produccion: "142",
        dif: "2,158",
        batchMin: "324.86",
        paqMin: "383,333",
        almacen20: "0.00",
      },
    ],
  },
  {
    id: 2,
    linea: "2",
    sku: "408361",
    marca: "VIDA",
    sabor: "AGUA",
    formato: "0.625",
    detalles: [
      {
        cod: "53308",
        descripcion: "LAMINA TERMOCONTRAIBLE 920MM X 40 MICRAS",
        um: "KG",
        stock: "9,500",
        produccion: "1,416",
        dif: "8,084",
        batchMin: "134.18",
        paqMin: "158,333",
        almacen20: "0.00",
      },
    ],
  },
];

export default function Test1() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 text-white p-6">
      {/* Header */}
      <header className="text-center bg-white/10 p-4 rounded-xl shadow-lg mb-6">
        <h1 className="text-2xl font-bold">
          SPORADE TROPICAL PET NO RETORNABLE 500 ML 12 - ASÉPTICA
        </h1>
      </header>

      {/* Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Tabla productos */}
        <div className="bg-white/10 p-4 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-center">
            Productos Disponibles
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead className="bg-blue-800">
              <tr>
                <th className="p-2">N° LÍNEA</th>
                <th className="p-2">SKU</th>
                <th className="p-2">MARCA</th>
                <th className="p-2">SABOR</th>
                <th className="p-2">FORMATO</th>
                <th className="p-2">ACTIVADOR</th>
              </tr>
            </thead>
            <tbody>
              {productData.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-white/20 cursor-pointer"
                  onClick={() => setSelected(p as any)}
                >
                  <td className="p-2 text-center">{p.linea}</td>
                  <td className="p-2">{p.sku}</td>
                  <td className="p-2">{p.marca}</td>
                  <td className="p-2">{p.sabor}</td>
                  <td className="p-2">{p.formato}</td>
                  <td className="p-2">
                    <button className="px-3 py-1 bg-blue-500 rounded-lg text-xs hover:bg-blue-600">
                      VER
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabla detalles */}
        <div className="bg-white/10 p-4 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-center">
            Detalles del Producto
          </h2>
          {selected ? (
            <table className="w-full text-sm border-collapse">
              <thead className="bg-blue-800">
                <tr>
                  <th className="p-2">COD</th>
                  <th className="p-2">DESCRIPCIÓN</th>
                  <th className="p-2">U.M</th>
                  <th className="p-2">STOCK</th>
                  <th className="p-2">PRODUCCIÓN</th>
                  <th className="p-2">DIF</th>
                  <th className="p-2">BATCH MIN</th>
                  <th className="p-2">PAQ MIN</th>
                  <th className="p-2">ALMACÉN 20</th>
                </tr>
              </thead>
              <tbody>
                {(selected as typeof productData[0]).detalles.map((d, i) => (
                  <tr key={i} className="hover:bg-white/20">
                    <td className="p-2 text-center">{d.cod}</td>
                    <td className="p-2">{d.descripcion}</td>
                    <td className="p-2">{d.um}</td>
                    <td className="p-2 text-right">{d.stock}</td>
                    <td className="p-2 text-right">{d.produccion}</td>
                    <td className="p-2 text-right">{d.dif}</td>
                    <td className="p-2 text-right">{d.batchMin}</td>
                    <td className="p-2 text-right">{d.paqMin}</td>
                    <td className="p-2 text-right">{d.almacen20}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center italic text-gray-300">
              Selecciona un producto para ver detalles
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
