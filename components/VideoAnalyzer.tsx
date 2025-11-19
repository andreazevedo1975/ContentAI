import React, { useState, useRef } from 'react';
import { Video, Upload, Loader2, MessageSquare } from 'lucide-react';
import { analyzeVideo } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const VideoAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) {
          setFile(f);
          setPreview(URL.createObjectURL(f));
          setResult(null);
      }
  };

  const handleAnalyze = async () => {
      if (!file || !prompt) return;
      
      // Basic client-side size check (Limit to ~20MB for base64 safety)
      if (file.size > 20 * 1024 * 1024) {
          alert("File too large for client-side analysis. Please use a video under 20MB.");
          return;
      }

      setLoading(true);
      try {
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64 = (reader.result as string).split(',')[1];
              const text = await analyzeVideo(prompt, base64, file.type);
              setResult(text || "No analysis returned.");
              setLoading(false);
          };
          reader.readAsDataURL(file);
      } catch (e) {
          setResult("Error analyzing video.");
          setLoading(false);
      }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in pb-20">
       <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
           <Video className="text-purple-600"/> Análise de Vídeo (Vision)
       </h1>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Left: Upload */}
           <div>
               <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl h-64 flex flex-col items-center justify-center relative hover:bg-slate-200 transition-colors overflow-hidden">
                   {preview ? (
                       <video src={preview} controls className="w-full h-full object-contain bg-black" />
                   ) : (
                       <div className="text-center p-4">
                           <Upload size={40} className="text-slate-400 mx-auto mb-2"/>
                           <p className="text-sm font-bold text-slate-500">Upload Video</p>
                           <p className="text-xs text-slate-400">Max 20MB (Client Limit)</p>
                       </div>
                   )}
                   <input type="file" accept="video/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
               </div>
           </div>

           {/* Right: Prompt */}
           <div className="flex flex-col">
               <textarea 
                 value={prompt}
                 onChange={e => setPrompt(e.target.value)}
                 className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 outline-none resize-none focus:ring-2 focus:ring-purple-500 mb-4"
                 placeholder="Pergunte algo sobre o vídeo: Ex: 'Descreva o que acontece e qual a emoção principal?'"
               />
               <button 
                 onClick={handleAnalyze}
                 disabled={loading || !file || !prompt}
                 className="bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
               >
                   {loading ? <Loader2 className="animate-spin"/> : <MessageSquare size={20} />}
                   Analisar com Gemini 3 Pro
               </button>
           </div>
       </div>

       {result && (
           <div className="mt-8 animate-in slide-in-from-bottom-4">
               <h3 className="text-lg font-bold text-slate-900 mb-4">Resultado da Análise</h3>
               <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm prose prose-slate max-w-none">
                   <ReactMarkdown>{result}</ReactMarkdown>
               </div>
           </div>
       )}
    </div>
  );
};

export default VideoAnalyzer;