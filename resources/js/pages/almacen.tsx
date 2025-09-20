import AlmacenViewer  from '@/components/test_Component/AlmacenViewer';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Almacen', href: '/almacen' }];

export default function Almacen() {
  const [alm05Data, setAlm05Data] = useState<any[]>([]);
  const [alm20Data, setAlm20Data] = useState<any[]>([]);
  const [pending05, setPending05] = useState(false);
  const [pending20, setPending20] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setData: (data: any[]) => void,
    setPending: (v: boolean) => void
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });

        setData(jsonData);
        if (!jsonData.length) {
          alert('El archivo no contiene filas -> nada que guardar.');
          setPending(false);
          return;
        }

        // marcar como pendiente (habilita boton "Guardar")
        setPending(true);
        setMessage('JSON listo. Revísalo y pulsa Guardar para persistir en DB.');
      } catch (err) {
        console.error('Error parseando archivo:', err);
        alert('Error leyendo el archivo Excel.');
      }
    };

    reader.readAsBinaryString(file);
  };

  const saveJsonToServer = async (data: any[], url: string, setPending: (v: boolean) => void) => {
    if (!data || !data.length) {
      alert('No hay datos para guardar.');
      return;
    }

    setLoadingSave(true);
    setMessage(null);

    try {
      const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)
        ?.content || '';

      const resp = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ data }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error('Server error:', resp.status, text);
        if (resp.status === 419) {
          alert('Token CSRF inválido o expirado (419). Revisa meta csrf-token.');
        } else {
          alert(`Error servidor ${resp.status}. Revisa consola.`);
        }
        return;
      }

      const json = await resp.json();
      if (json?.success) {
        setMessage(`Guardado OK. Insertados: ${json.inserted || 0}, Actualizados: ${json.updated || 0}`);
        setPending(false);
      } else {
        console.warn('Backend returned:', json);
        setMessage('El backend devolvió resultado inesperado. Revisa consola.');
      }
    } catch (err) {
      console.error('Error en fetch/parse:', err);
      setMessage('Error en la conexión al servidor o parseo del archivo.');
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Almacen" />
      <div className="p-4 bg-gray-900">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Almacen 05 Excel File:
          </label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => handleFileUpload(e, setAlm05Data, setPending05)}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600"
          />
          <div className="mt-2">
            <button
              disabled={!pending05 || loadingSave}
              onClick={() => saveJsonToServer(alm05Data, '/almacen/05', setPending05)}
              className={`px-4 py-2 rounded-md font-medium ${pending05 && !loadingSave ? 'bg-green-600' : 'bg-gray-500 cursor-not-allowed'}`}
            >
              {loadingSave ? 'Guardando...' : 'Guardar Almacen 05'}
            </button>
            {pending05 && <span className="ml-3 text-sm text-yellow-300">JSON listo para guardar</span>}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Almacen 20 Excel File:
          </label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => handleFileUpload(e, setAlm20Data, setPending20)}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600"
          />
          <div className="mt-2">
            <button
              disabled={!pending20 || loadingSave}
              onClick={() => saveJsonToServer(alm20Data, '/almacen/20', setPending20)}
              className={`px-4 py-2 rounded-md font-medium ${pending20 && !loadingSave ? 'bg-green-600' : 'bg-gray-500 cursor-not-allowed'}`}
            >
              {loadingSave ? 'Guardando...' : 'Guardar Almacen 20'}
            </button>
            {pending20 && <span className="ml-3 text-sm text-yellow-300">JSON listo para guardar</span>}
          </div>
        </div>

        {message && <p className="text-blue-400 font-semibold mb-4">{message}</p>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-200">Almacen 05 Data:</h3>
            <pre className="bg-gray-800 text-gray-300 p-4 rounded-md overflow-auto max-h-96 border border-gray-700">
              {JSON.stringify(alm05Data, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-200">Almacen 20 Data:</h3>
            <pre className="bg-gray-800 text-gray-300 p-4 rounded-md overflow-auto max-h-96 border border-gray-700">
              {JSON.stringify(alm20Data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
      <AlmacenViewer urls={{ '05': '/almacen/05', '20': '/almacen/20' }} pageSize={50} className="mt-8" />
    </AppLayout>
  );
}
