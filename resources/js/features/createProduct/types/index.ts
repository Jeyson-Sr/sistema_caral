// resources/js/features/createProduct/types/index.ts
export type ProductPayload = {
linea?: number | null;
sku_descripcion?: string | null;
sku_envasado?: number | null;
jarabe?: number | null; // 1 | 0 | null
sku_jarabe?: number | null;
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
};


export type FormulationPayload = {
formulacion_id?: number | null;
envasado: Array<any>;
jarabe: Array<any>;
};


export type FilaFormulacion = {
id: number;
descripcion: string;
sku_jarabe?: number | null;
articulo: number | null;
cantidad: string;
};


export type Almacen = { id: number; articulo: number | null; descripcion: string; nombre_linea?: string };