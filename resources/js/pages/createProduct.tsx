import BatchCalculator from '@/components/test_Component/BatchCalculator';
import CrearEnvase from '@/components/test_Component/CrearEnvase';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Crear Producto',
    href: '/crear-producto',
  },
];

export default function CreateProduct() {



  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Crear Producto" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
          <div className="relative p-4">
            <h2 className="text-2xl font-bold mb-6">Crear Nuevo Producto</h2>
            <div className="flex flex-col gap-4">
              <CrearEnvase />
            </div>
          </div>
        </div>
      </div>

    </AppLayout>
  );
}
