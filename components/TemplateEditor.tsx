
import React from 'react';
import { Tag, Sparkles, Hash } from 'lucide-react';
import { generateTemplateSuggestion } from '../services/geminiService';

interface TemplateEditorProps {
  template: string;
  headers: string[];
  setTemplate: (val: string) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, headers, setTemplate }) => {
  const [loading, setLoading] = React.useState(false);

  const insertTag = (header: string) => {
    setTemplate(template + ` {{${header}}}`);
  };

  const handleAISuggestion = async () => {
    if (headers.length === 0) return;
    setLoading(true);
    const suggestion = await generateTemplateSuggestion(headers);
    setTemplate(suggestion);
    setLoading(false);
  };

  // Separar los encabezados de texto de las letras de columna (A, B, C...)
  const textHeaders = headers.filter(h => h.length > 1 || !/^[A-Z]$/.test(h));
  const letterHeaders = headers.filter(h => h.length === 1 && /^[A-Z]$/.test(h));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Editor de Plantilla</h3>
        {headers.length > 0 && (
          <button
            onClick={handleAISuggestion}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors bg-purple-50 px-3 py-1.5 rounded-full"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Generando...' : 'Sugerir con IA'}
          </button>
        )}
      </div>

      <div className="mb-4 space-y-3">
        {textHeaders.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Encabezados Detectados:</p>
            <div className="flex flex-wrap gap-1.5">
              {textHeaders.map((header) => (
                <button
                  key={header}
                  onClick={() => insertTag(header)}
                  className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded border border-red-200 text-xs hover:bg-red-100 transition-all"
                >
                  <Tag className="w-3 h-3" />
                  {header}
                </button>
              ))}
            </div>
          </div>
        )}

        {letterHeaders.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Letras de Columna (Usa {"{{G}}"} para Peso):</p>
            <div className="flex flex-wrap gap-1.5">
              {letterHeaders.map((header) => (
                <button
                  key={header}
                  onClick={() => insertTag(header)}
                  className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 text-xs hover:bg-blue-100 transition-all"
                >
                  <Hash className="w-3 h-3" />
                  {header}
                </button>
              ))}
            </div>
          </div>
        )}

        {headers.length === 0 && <p className="text-sm text-gray-400 italic">Sube un archivo para ver las columnas...</p>}
      </div>

      <textarea
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        className="w-full h-44 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none text-gray-700 leading-relaxed font-sans text-sm"
        placeholder="Escribe tu mensaje aquí. Usa {{G}} para insertar los kilos de la columna G..."
      />
      
      <p className="mt-2 text-xs text-gray-400">
        {"Ejemplo: ... con {{G}} kilos de la comuna {{Comuna}}."}
      </p>
    </div>
  );
};

export default TemplateEditor;
