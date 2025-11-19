import React, { useState } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { findLocations } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const LocationScout: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleScout = async () => {
      if (!query) return;
      setLoading(true);
      setResult(null);
      setPlaces([]);
      
      try {
          const response = await findLocations(query);
          setResult(response.text || "Nenhum resultado.");
          
          // Extract Maps chunks
          const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          const mapPlaces = chunks
             .filter((c: any) => c.groundingChunk?.type === 'googleMaps' || (c as any).web?.uri?.includes('maps')) // Handling can vary slightly by API version, checking broadly
             // The API typically returns markdown links, but chunks contain metadata.
             // For this demo, we'll extract links from the text or metadata if available.
             // In current Gemini API, groundingChunks often returns web sources or standard text.
             // Maps tool typically embeds links in markdown.
             // We will try to parse sources if structured data exists.
             
          // Fallback: if no structured chunks, text has links.
      } catch (e) {
          setResult("Erro ao buscar locais.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in pb-20">
       <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
           <MapPin className="text-green-600"/> Scouting de Locais
       </h1>

       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
           <div className="flex gap-3">
               <input 
                 value={query}
                 onChange={e => setQuery(e.target.value)}
                 className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                 placeholder="Ex: Cafés estéticos em São Paulo para gravação..."
               />
               <button 
                 onClick={handleScout}
                 disabled={loading || !query}
                 className="bg-green-600 hover:bg-green-700 text-white px-6 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
               >
                   {loading ? <Loader2 className="animate-spin"/> : <Navigation size={20} />}
                   Buscar
               </button>
           </div>
           <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
               <span className="flex items-center gap-1"><MapPin size={12}/> Powered by Google Maps Grounding</span>
           </div>
       </div>

       {loading && (
           <div className="text-center py-20">
               <Loader2 size={48} className="animate-spin text-green-600 mx-auto mb-4" />
               <p className="text-slate-500 font-medium animate-pulse">Buscando os melhores locais...</p>
           </div>
       )}

       {result && (
           <div className="animate-in slide-in-from-bottom-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm prose prose-slate max-w-none">
               <ReactMarkdown>{result}</ReactMarkdown>
           </div>
       )}
    </div>
  );
};

export default LocationScout;