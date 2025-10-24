// features/matrizGeneral/types/index.ts
export type Product = {
  sku_envasado: string;
  sku_jarabe?: string | null;
  linea?: number | string | null;
  formato?: number | null;
  marca?: string | null;
  sabor?: string | null;
  litros_batch?: number | null;
  bebida_final?: number | null;
  factor_azucar?: number | null;
  ef_velocidad?: number | null;
  velocidad_bot?: number | null;
  unidad_paquete?: number | null;
  paquetes_nivel?: number | null;
  carton_nivel?: number | null;
  [key: string]: any;
};

export type BatchData = {
  sku_descripcion?: string | null;
  cantidadBatch?: number;
  formato?: number;
  litrosBatch?: number;
  bebidaFinal?: number;
  factorAzucar?: number;
  efiVelocidad?: number;
  velocidadBot?: number;
  unidadPaquete?: number;
  paquetesNivel?: number;
  cartonNivel?: number;
  cantidadPaquetes?: number;
  skuJarabe?: string;
  skuEnvasado?: string;
};

export type FormulaResponse = {
  jarabe?: any[];
  envasado?: any[];
  matchingRows?: any[];
  // otros campos que retorne tu backend
  [key: string]: any;
};

export type AlmacenResponse = {
  articulo: string;
  descripcion: string;
  u_m: string;
  contenido: string;
  saldo_inicial: string;
  ingresos: string;
  salidas: string;
  saldo_final: string;
  lin_art: string;
  nombre_linea: string;
};

export type Almacen = {
  id: number;
  articulo: number | null;
  descripcion: string;
  nombre_linea?: string;
};
