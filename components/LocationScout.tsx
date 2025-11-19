import React, { useState } from 'react';
import { MapPin, Navigation, Loader2, ExternalLink } from 'lucide-react';
import { findLocations } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const LocationScout: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>([]);

  const handleScout = async () => {
      if (!query) return;
      setLoading(true);
      setResult(null);
      setSources([]);
      
      try {
          const response = await findLocations(query);
          setResult(response.text || "Nenhum resultado.");
          
          const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          // Safely extract map sources
          const mapLinks = chunks
             .map((c: any) => {
                 if (c.web) return { title: c.web.title, uri: c.web.uri };
                 return null;
             })
             .filter((c: any) => c !== null);
             
          setSources(mapLinks);

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
       </div>

       {result && (
           <div className="animate-in slide-in-from-bottom-4">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm prose prose-slate max-w-none mb-6">
                   <ReactMarkdown>{result}</ReactMarkdown>
                </div>

                {sources.length > 0 && (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Google Maps Sources</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {sources.map((src, i) => (
                                <a key={i} href={src.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-green-700 bg-white border border-slate-200 p-3 rounded-lg hover:bg-green-50 transition-colors">
                                    <ExternalLink size={14}/> {src.title || 'Ver no Mapa'}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
           </div>
       )}
    </div>
  );
};

export default LocationScout;