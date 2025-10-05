// resources/js/features/almacen/components/Almacen.block.tsx
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';

import AlmacenUploader from '../components/AlmacenUploader';
import JsonPreview from '../components/JsonPreview';
import AlmacenViewer from '@/features/almacen/components/AlmacenViewer'; // si moviste el viewer, cambia la ruta

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Almacén', href: '/almacen' }];

export default function AlmacenBlock() {
  const [alm05Data, setAlm05Data] = useState<any[]>([]);
  const [alm13Data, setAlm13Data] = useState<any[]>([]);
  const [alm20Data, setAlm20Data] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Almacén" />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl border border-blue-200">
                <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 13h18M3 6h18M3 20h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Gestión de Almacenes</h1>
                <p className="text-slate-600 mt-1">Carga y administra los datos de inventario desde archivos Excel</p>
              </div>
            </div>
          </div>

          {/* Uploaders grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <AlmacenUploader
              label="Almacén 05"
              postUrl="/almacen/create/05"
              onSaved={(res) => setStatusMessage(res?.message ?? 'Guardado Almacén 05')}
              onDataChange={(d) => setAlm05Data(d)}
            />
            <AlmacenUploader
              label="Almacén 13"
              postUrl="/almacen/create/13"
              onSaved={(res) => setStatusMessage(res?.message ?? 'Guardado Almacén 13')}
              onDataChange={(d) => setAlm13Data(d)}
            />
            <AlmacenUploader
              label="Almacén 20"
              postUrl="/almacen/create/20"
              onSaved={(res) => setStatusMessage(res?.message ?? 'Guardado Almacén 20')}
              onDataChange={(d) => setAlm20Data(d)}
            />
          </div>

          {/* status */}
          {statusMessage && (
            <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-4">
              <div className="text-sm text-slate-700">{statusMessage}</div>
            </div>
          )}

         

          {/* Viewer */}
          <div>
            <AlmacenViewer urls={{ '05': '/almacen/05', '13': '/almacen/13', '20': '/almacen/20' }} pageSize={50} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
