import React, { useState } from 'react';
import { Search, BrainCircuit, Loader2, ExternalLink } from 'lucide-react';
import { performDeepResearch } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const MarketResearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleResearch = async () => {
      if (!query) return;
      setLoading(true);
      setResult(null);
      setSources([]);
      try {
          const response = await performDeepResearch(query);
          setResult(response.text || "No text returned.");
          // Extract grounding chunks safely
          const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          const webSources = chunks
            .filter((c: any) => c.web)
            .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));
          setSources(webSources);
      } catch (e) {
          setResult("Erro ao realizar pesquisa. Tente novamente.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in pb-20">
       <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
           <BrainCircuit className="text-blue-600"/> Pesquisa de Mercado Profunda
       </h1>

       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
           <div className="flex gap-3">
               <input 
                 value={query}
                 onChange={e => setQuery(e.target.value)}
                 className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                 placeholder="Ex: Tendências de moda sustentável para 2025..."
               />
               <button 
                 onClick={handleResearch}
                 disabled={loading || !query}
                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
               >
                   {loading ? <Loader2 className="animate-spin"/> : <Search size={20} />}
                   Pesquisar
               </button>
           </div>
           <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
               <span className="flex items-center gap-1"><BrainCircuit size={12}/> Thinking Mode</span>
               <span className="flex items-center gap-1"><Search size={12}/> Google Search Grounding</span>
           </div>
       </div>

       {loading && (
           <div className="text-center py-20">
               <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
               <p className="text-slate-500 font-medium animate-pulse">Analisando web e raciocinando...</p>
           </div>
       )}

       {result && (
           <div className="animate-in slide-in-from-bottom-4">
               <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm prose prose-slate max-w-none mb-6">
                   <ReactMarkdown>{result}</ReactMarkdown>
               </div>

               {sources.length > 0 && (
                   <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                       <h3 className="text-sm font-bold text-slate-700 uppercase mb-4">Fontes Consultadas</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {sources.map((src, idx) => (
                               <a key={idx} href={src.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline bg-white p-3 rounded-lg border border-slate-200">
                                   <ExternalLink size={14} />
                                   <span className="truncate">{src.title || src.uri}</span>
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

export default MarketResearch;