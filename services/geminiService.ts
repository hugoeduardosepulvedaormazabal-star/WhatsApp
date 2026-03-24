
import { GoogleGenAI } from "@google/genai";

export const generateTemplateSuggestion = async (headers: string[]): Promise<string> => {
  // Use the API key directly from the environment variable as required.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Actúa como un experto en comunicación. Tengo un archivo con estas columnas: ${headers.join(", ")}.
    Necesito una plantilla de mensaje para WhatsApp amable y profesional que use estas etiquetas en formato {{nombre_columna}}.
    El mensaje debe sonar natural. Ejemplo de uso: "Hola {{nombre}}, confirmamos tu entrega para el {{fecha}}".
    Devuelve ÚNICAMENTE el texto de la plantilla sugerida, nada de explicaciones adicionales.
  `;

  try {
    // Call generateContent with the model name and prompt directly.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Access the response text using the getter property.
    return response.text || "Hola, hoy {{fecha}} voy a llegar a {{direccion}} con el documento {{documento}} de {{kilos}} kilos durante las 09:00 a 21:00.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Hola, hoy {{fecha}} voy a llegar a {{direccion}} con el documento {{documento}} de {{kilos}} kilos.";
  }
};
