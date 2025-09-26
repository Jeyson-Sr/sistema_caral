import { Suspense } from 'react';
import CreateProductBlock from '@/features/createProduct/components/CreateProduct.block';

export default function CreateProduct() {
  return (
    <Suspense fallback={<div>Cargando Crear Producto...</div>}>
      <CreateProductBlock />
    </Suspense>
  );
} 