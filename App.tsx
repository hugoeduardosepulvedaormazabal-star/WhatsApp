
import React, { useState } from 'react';
import { MessageSquare, Info } from 'lucide-react';
import FileUploader from './components/FileUploader';
import TemplateEditor from './components/TemplateEditor';
import DataTable from './components/DataTable';
import { DataRow } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  // Plantilla actualizada con la puntuación y redacción exacta solicitada (incluyendo "vía" con tilde)
  const [template, setTemplate] = useState<string>(
    "Buenas tardes, le escribimos de Limatco, para indicarle que el dia {{Fecha}}, le enviaremos el documento {{Boleta o Factura}}, a la dirección {{Direccion de entrega}}, de la comuna de {{Comuna}}, con {{G}} kilos.\n\nPuede seguir su despacho en https://limatco.cl/seguimiento-de-pedidos/ el día del envío.\nCualquier cambio o instrucción favor de indicarnos por esta vía para coordinar.\nNuestras entregas son de 09:00 a 21:00 horas de lunes a viernes y de 09:00 a 16:00 para los días sábados, https://limatco.cl/politicas-despacho/\nAtentamente Coordinacion de Transportes de Limatco S.A.\n\nCERÁMICAS Y PORCELANATOS, LA MAYOR VARIEDAD DEL MERCADO"
  );

  const handleDataLoaded = (h: string[], d: DataRow[]) => {
    setHeaders(h);
    setData(d);
  };

  const handleClearData = () => {
    setData([]);
    setHeaders([]);
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <nav className="bg-red-600 text-white shadow-lg py-4 px-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-7 h-7" />
            <h1 className="text-xl font-bold tracking-tight">Mensajeria Limatco</h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="opacity-80">v1.2.8</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Instructions and Upload */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-red-700">
                <Info className="w-5 h-5" />
                <h3 className="font-semibold">¿Cómo funciona?</h3>
              </div>
              <ol className="text-sm text-gray-600 space-y-3 list-decimal list-inside">
                <li>Sube tu archivo de <b>Excel (.xlsx)</b> o CSV.</li>
                <li>Ahora puedes usar <b>Letras (A, B, C...)</b> para referirte a las columnas.</li>
                <li>Define tu mensaje usando etiquetas como <b>{"{{G}}"}</b> para la columna G.</li>
                <li>Envía individualmente cada mensaje revisado.</li>
              </ol>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">1. Cargar Archivo</h3>
              <FileUploader 
                onDataLoaded={handleDataLoaded} 
                onUploadStart={handleClearData} 
              />
            </div>
          </div>

          {/* Right Column: Template Editor */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">2. Personalizar Mensaje</h3>
              <TemplateEditor 
                template={template} 
                headers={headers} 
                setTemplate={setTemplate} 
              />
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <DataTable 
          headers={headers} 
          data={data} 
          template={template} 
          onClear={handleClearData}
        />

        {data.length === 0 && (
          <div className="mt-12 flex flex-col items-center justify-center text-gray-400 py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
            <MessageSquare className="w-12 h-12 mb-4 opacity-10" />
            <p className="text-lg font-medium">Lista de espera vacía</p>
            <p className="text-sm">Carga un Excel para ver la previsualización aquí</p>
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-gray-200 py-8 text-center text-gray-500 text-sm">
        <p>© 2024 Mensajeria Limatco. Los datos se procesan localmente en tu navegador.</p>
      </footer>
    </div>
  );
};

export default App;
