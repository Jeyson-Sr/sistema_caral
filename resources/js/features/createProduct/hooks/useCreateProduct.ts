// resources/js/features/createProduct/hooks/useCreateProduct.ts
import { useState } from 'react';
import { createProduct } from '../services/productService';
import { postFormulation } from '../services/formulationService';
import type { ProductPayload, FormulationPayload } from '@/features/createProduct/types';


export default function useCreateProduct() {
const [loading, setLoading] = useState(false);
const [submittingFormulacion, setSubmittingFormulacion] = useState(false);
const [error, setError] = useState<string | null>(null);
const [productSaved, setProductSaved] = useState<any | null>(null);


async function handleCreateProduct(payload: ProductPayload) {
setLoading(true); setError(null);
try {
const res = await createProduct(payload);
setProductSaved(res);
return res;
} catch (err: any) {
setError(err?.message || JSON.stringify(err));
throw err;
} finally { setLoading(false); }
}


async function handlePostFormulation(payload: FormulationPayload) {
setSubmittingFormulacion(true); setError(null);
try {
const res = await postFormulation(payload);
return res;
} catch (err: any) {
setError(err?.message || JSON.stringify(err));
throw err;
} finally { setSubmittingFormulacion(false); }
}


return { loading, error, productSaved, handleCreateProduct, submittingFormulacion, handlePostFormulation };
}