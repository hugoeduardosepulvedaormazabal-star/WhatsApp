
import React, { useState, useEffect } from 'react';
import { MessageCircle, Trash2, AlertTriangle, Phone } from 'lucide-react';
import { DataRow } from '../types';

interface DataTableProps {
  headers: string[];
  data: DataRow[];
  template: string;
  onClear: () => void;
}

const DataTable: React.FC<DataTableProps> = ({ headers, data, template, onClear }) => {
  const [selectedPhoneColumn, setSelectedPhoneColumn] = useState<string>('');

  // Intentar detectar la columna de teléfono automáticamente al cargar datos
  useEffect(() => {
    if (headers.length > 0) {
      const autoDetected = headers.find(k => {
        const normalized = k.toLowerCase().trim();
        return ['telefono', 'phone', 'celular', 'mobile', 'tel', 'whatsapp', 'nro', 'i'].includes(normalized);
      });
      if (autoDetected) {
        setSelectedPhoneColumn(autoDetected);
      } else {
        setSelectedPhoneColumn(headers[0]);
      }
    }
  }, [headers]);

  /**
   * Procesa un valor para asegurar que si es un peso (Columna G o nombre con "peso"), 
   * no tenga decimales y sea un número entero.
   */
  const formatCellContent = (key: string, rawValue: any): string => {
    const normalizedKey = key.toUpperCase().trim();
    
    // 1. Si el valor es una instancia de Date (posible si XLSX lo entrega así)
    if (rawValue instanceof Date) {
      return rawValue.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }

    let value = String(rawValue || '');
    
    // 2. Si la columna parece ser una fecha, intentamos reformatearla a español
    if (normalizedKey.includes('FECHA') || normalizedKey.includes('DATE') || normalizedKey === 'A') {
      // Si el valor es un número (posible Excel serial date), lo convertimos
      const numericValue = Number(value);
      if (!isNaN(numericValue) && numericValue > 30000 && numericValue < 60000) {
        // Conversión básica de fecha Excel a JS Date
        const excelDate = new Date((numericValue - 25569) * 86400 * 1000);
        return excelDate.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }

      // Intentar detectar si es una fecha y reformatearla
      const date = new Date(value);
      if (!isNaN(date.getTime()) && value.length > 5 && !/^\d+$/.test(value)) {
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    }

    // 3. Procesamiento original para pesos y otros
    // Si es columna G o el nombre de la columna contiene "peso"
    if (normalizedKey === 'G' || key.toLowerCase().includes('peso')) {
      // Reemplazar coma por punto y quitar espacios
      const cleanValue = value.replace(',', '.').trim();
      // Extraer solo la parte numérica inicial (ej: "12.5 kg" -> "12.5")
      const numericMatch = cleanValue.match(/^-?\d+(\.\d+)?/);
      
      if (numericMatch) {
        const numValue = parseFloat(numericMatch[0]);
        if (!isNaN(numValue)) {
          // Redondear al entero más cercano
          return Math.round(numValue).toString();
        }
      }
    }
    return value;
  };

  const parseMessage = (row: DataRow): string => {
    let msg = template;
    Object.keys(row).forEach(key => {
      const value = formatCellContent(key, row[key]);
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`{{${escapedKey}}}`, 'gi');
      msg = msg.replace(regex, value);
    });
    return msg;
  };

  const sendWhatsApp = (row: DataRow) => {
    const phoneValue = row[selectedPhoneColumn];

    if (!phoneValue) {
      alert(`La columna seleccionada "${selectedPhoneColumn}" está vacía.`);
      return;
    }

    const cleanPhone = String(phoneValue).replace(/\D/g, '');

    if (cleanPhone.length < 8) {
      alert('Número de teléfono inválido. Asegúrate de incluir el código de país.');
      return;
    }

    const message = encodeURIComponent(parseMessage(row));
    const url = `https://wa.me/${cleanPhone}?text=${message}`;
    
    window.open(url, '_blank');
  };

  if (data.length === 0) return null;

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col">
          <h3 className="font-semibold text-gray-700">Previsualización de Envíos</h3>
          <p className="text-xs text-gray-500">Selecciona la columna con los números de teléfono</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white border border-red-200 rounded-lg px-3 py-1.5 shadow-sm">
            <Phone className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-gray-600">Columna Teléfono:</span>
            <select 
              value={selectedPhoneColumn}
              onChange={(e) => setSelectedPhoneColumn(e.target.value)}
              className="text-xs font-bold text-red-700 bg-transparent outline-none cursor-pointer border-b border-red-200 focus:border-red-500"
            >
              {headers.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Borrar Todo
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3 bg-gray-100 sticky left-0 z-10">Acción</th>
              <th className="px-4 py-3 min-w-[300px]">Mensaje a Enviar</th>
              {headers.map(header => (
                <th key={header} className={`px-4 py-3 ${header === selectedPhoneColumn ? 'bg-red-50 text-red-700 font-bold' : ''}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const fullMessage = parseMessage(row);
              return (
                <tr key={idx} className="bg-white border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 sticky left-0 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.05)] z-10">
                    <button
                      onClick={() => sendWhatsApp(row)}
                      className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all shadow-sm text-xs font-bold active:scale-95 whitespace-nowrap"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Enviar
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="bg-red-50/50 p-2 rounded border border-red-100 text-[11px] leading-relaxed max-w-md">
                      {fullMessage}
                    </div>
                  </td>
                  {headers.map(header => (
                    <td key={header} className={`px-4 py-3 whitespace-nowrap ${header === selectedPhoneColumn ? 'bg-red-50 font-semibold text-red-800' : ''}`}>
                      {formatCellContent(header, row[header])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-amber-50 border-t border-amber-100 flex gap-2 items-start">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
        <p className="text-xs text-amber-700">
          <b>Nota:</b> La columna <b>G</b> (y las que contienen "Peso") se han redondeado automáticamente para eliminar decimales.
        </p>
      </div>
    </div>
  );
};

export default DataTable;
