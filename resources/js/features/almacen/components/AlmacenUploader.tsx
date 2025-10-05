// resources/js/features/almacen/components/AlmacenUploader.tsx
import React from 'react';
import { Upload, FileSpreadsheet, Save, Loader2, CheckCircle, FileText } from 'lucide-react';
import { useAlmacenUpload } from '../hooks/useAlmacenUpload';
import { saveAlmacen } from '../services/almacenService';
type Props = {
  label: string;
  postUrl: string;
  onSaved?: (result: any) => void;         // callback cuando backend responde OK
  onDataChange?: (data: any[]) => void;    // callback cuando se carga el archivo (para preview)
};

export default function AlmacenUploader({ label, postUrl, onSaved, onDataChange }: Props) {
  const { data, pending, message, handleFile, setPending, setMessage, clear } = useAlmacenUpload();
  const [loadingSave, setLoadingSave] = React.useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
    // small timeout so hook sets data first (FileReader async)
    setTimeout(() => onDataChange?.(file ? (Array.isArray((window as any).__lastAlmData) ? (window as any).__lastAlmData : data) : []), 100);
  };

  // Better: call onDataChange whenever data changes — but here parent can also pass setData if needed

  React.useEffect(() => {
    onDataChange?.(data);
    // store last for the timeout hack above (not ideal but safe)
    (window as any).__lastAlmData = data;
  }, [data, onDataChange]);

  const handleSave = async () => {
    if (!data.length) {
      alert('No hay datos para guardar.');
      return;
    }

    setLoadingSave(true);
    setMessage(null);

    try {
      const res = await saveAlmacen(postUrl, data);
      if (res.success) {
        setMessage(res.message ?? `Guardado OK. Insertados: ${res.inserted ?? 0}`);
        setPending(false);
        onSaved?.(res);
        // keep data for preview but mark as saved; parent can clear if wants
      } else {
        setMessage(res.message ?? 'Backend devolvió false.');
      }
    } catch (err: any) {
      console.error('Error saveAlmacen:', err);
      setMessage(err.message ?? 'Error al guardar en servidor');
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-green-50/30"></div>
      <div className="relative p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl border border-emerald-200">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{label}</h3>
            <p className="text-sm text-slate-600">Carga datos desde archivo Excel</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              <FileSpreadsheet size={16} className="inline mr-2" />
              Archivo Excel
            </label>
            <div className="relative group">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={onFileChange}
                className="block w-full text-sm text-slate-700 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-emerald-500 file:to-green-600 file:text-white hover:file:from-emerald-600 hover:file:to-green-700 file:transition-all file:duration-200 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition-colors"
              />
              <Upload className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-colors" size={20} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {pending ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-700">Listo para guardar</span>
                </div>
              ) : data.length > 0 ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
                  <FileText size={14} className="text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-700">{data.length} registros cargados</span>
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={!pending || loadingSave}
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loadingSave ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Guardar
                  </>
                )}
              </button>

              <button
                onClick={() => { clear(); setMessage(null); setPending(false); }}
                className="px-3 py-2 text-sm rounded-lg bg-slate-100 hover:bg-slate-200"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
