// resources/js/features/almacen/hooks/useAlmacenUpload.ts
import { useState } from 'react';
import * as XLSX from 'xlsx';

export function useAlmacenUpload() {
  const [data, setData] = useState<any[]>([]);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const raw = e.target?.result;
        // read workbook
        const workbook = XLSX.read(raw, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // convert to JSON - defval:null para que no salgan undefined
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });

        setData(jsonData);

        if (!jsonData.length) {
          setPending(false);
          setMessage('El archivo no contiene filas.');
          return;
        }

        setPending(true);
        setMessage('JSON listo. Revísalo y pulsa Guardar para persistir en DB.');
      } catch (err) {
        console.error('Error parseando Excel:', err);
        setMessage('Error leyendo el archivo. Revisa la consola.');
        setPending(false);
        setData([]);
      }
    };

    reader.onerror = (err) => {
      console.error('FileReader error:', err);
      setMessage('Error leyendo el archivo (FileReader).');
      setPending(false);
      setData([]);
    };

    // binary string mantiene compatibilidad con xlsx lib
    reader.readAsBinaryString(file);
  };

  const clear = () => {
    setData([]);
    setPending(false);
    setMessage(null);
  };

  return {
    data,
    setData,
    pending,
    setPending,
    message,
    setMessage,
    handleFile,
    clear,
  } as const;
}
