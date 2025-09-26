// features/matrizGeneral/hooks/useMatrizGeneral.ts
import { useEffect, useMemo, useState } from "react";
import type { Product, BatchData } from "../types";
import * as service from "../services/matrizService";

export function useMatrizGeneral() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [batchNumbers, setBatchNumbers] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    let mounted = true;
    service
      .getProductos()
      .then((data) => {
        if (!mounted) return;
        const productosTransformados = data.map((prod) => ({
          ...prod,
          sku_jarabe: prod.sku_jarabe ?? "-",
          linea: prod.linea ? `L${String(prod.linea).padStart(2, "0")}` : "-",
        }));
        setProductos(productosTransformados);
      })
      .catch((err) => {
        console.error("Error al cargar productos:", err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleBatchChange = (skuEnvasado: string, value: string) => {
    setBatchNumbers((prev) => ({ ...prev, [skuEnvasado]: value }));
  };

  const handleFormulaClick = (producto: Product) => {
    if (batchNumbers[producto.sku_envasado]) {
      setSelectedProduct(producto);
      setShowModal(true);
    }
  };

  const filteredProducts = useMemo(() => {
    const terms = searchTerm.toLowerCase().split(" ").filter(Boolean);
    if (terms.length === 0) return productos;
    return productos.filter((producto) =>
      terms.every((term) =>
        Object.values(producto).some((value) =>
          value?.toString().toLowerCase().includes(term)
        )
      )
    );
  }, [productos, searchTerm]);

  const modalData = useMemo(() => {
    if (!selectedProduct) return null;
    const sku = selectedProduct.sku_envasado;
    const batchValue = batchNumbers[sku] ?? "";
    const hasJarabe = selectedProduct.sku_jarabe && selectedProduct.sku_jarabe !== "-";
    if (hasJarabe) {
      return {
        cantidadBatch: Number(batchValue),
        formato: selectedProduct.formato,
        litrosBatch: selectedProduct.litros_batch,
        bebidaFinal: selectedProduct.bebida_final,
        factorAzucar: selectedProduct.factor_azucar,
        efiVelocidad: selectedProduct.ef_velocidad,
        velocidadBot: selectedProduct.velocidad_bot,
        unidadPaquete: selectedProduct.unidad_paquete,
        paquetesNivel: selectedProduct.paquetes_nivel,
        cartonNivel: selectedProduct.carton_nivel,
        skuJarabe: selectedProduct.sku_jarabe,
        skuEnvasado: selectedProduct.sku_envasado,
      } as BatchData;
    } else {
      return {
        cantidadPaquetes: Number(batchValue),
        formato: selectedProduct.formato,
        velocidadBot: selectedProduct.velocidad_bot,
        efiVelocidad: selectedProduct.ef_velocidad,
        unidadPaquete: selectedProduct.unidad_paquete,
        paquetesNivel: selectedProduct.paquetes_nivel,
        cartonNivel: selectedProduct.carton_nivel,
        
        skuEnvasado: selectedProduct.sku_envasado,
      } as BatchData;
    }
  }, [selectedProduct, batchNumbers]);

  return {
    productos: filteredProducts,
    allProductos: productos,
    searchTerm,
    setSearchTerm,
    batchNumbers,
    handleBatchChange,
    showModal,
    setShowModal,
    selectedProduct,
    setSelectedProduct,
    handleFormulaClick,
    modalData,
  };
}

export default useMatrizGeneral;
