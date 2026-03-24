
import React, { useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface FileUploaderProps {
  onDataLoaded: (headers: string[], data: any[]) => void;
  onUploadStart: () => void;
}

/**
 * Función utilitaria para obtener la letra de una columna de Excel según su índice (0 = A, 1 = B...)
 */
const getColumnLetter = (colIndex: number): string => {
  let letter = '';
  while (colIndex >= 0) {
    letter = String.fromCharCode((colIndex % 26) + 65) + letter;
    colIndex = Math.floor(colIndex / 26) - 1;
  }
  return letter;
};

const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded, onUploadStart }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    onUploadStart();

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Obtenemos todas las filas como matriz para procesarlas manualmente
        const rows = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, 
          raw: false, // Seguimos usando false para obtener strings formateados por defecto
          defval: "" 
        }) as any[][];

        if (rows.length === 0) return;

        // La primera fila son los encabezados de texto
        const rawHeaders = rows[0].map(h => String(h || "").trim());
        
        // Creamos una lista de encabezados únicos (Texto + Letra de Columna)
        const headersSet = new Set<string>();
        rawHeaders.forEach((h, i) => {
          if (h) headersSet.add(h);
          headersSet.add(getColumnLetter(i));
        });
        const allPossibleHeaders = Array.from(headersSet);

        // Procesamos los datos mapeando tanto por Nombre como por Letra (A, B, C...)
        const dataRows = rows.slice(1).map(row => {
          const rowData: any = {};
          row.forEach((cellValue, i) => {
            const headerName = rawHeaders[i];
            const colLetter = getColumnLetter(i);
            
            // Mapeamos por nombre si existe
            if (headerName) {
              rowData[headerName] = cellValue;
            }
            // Mapeamos SIEMPRE por letra (A, B, C...)
            rowData[colLetter] = cellValue;
          });
          return rowData;
        });
        
        onDataLoaded(allPossibleHeaders, dataRows);
        
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error) {
        console.error("Error al procesar el archivo:", error);
        alert("Error al leer el archivo. Asegúrate de que es un Excel o CSV válido.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <Upload className="w-8 h-8 mb-3 text-gray-400" />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Haz clic para subir</span> o arrastra un archivo
          </p>
          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Excel (.xlsx, .xls) o CSV</p>
        </div>
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
          onChange={handleFileUpload} 
        />
      </label>
      
      <div className="mt-4 flex items-start gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-md border border-blue-100">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>Tip: Ahora puedes usar letras (A, B, C...) como etiquetas si los nombres de columna no funcionan.</p>
      </div>
    </div>
  );
};

export default FileUploader;
