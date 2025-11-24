import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  Podcast, 
  Link as LinkIcon, 
  FileText, 
  Video, 
  Music, 
  Scissors, 
  VolumeX, 
  Wand2, 
  UploadCloud, 
  User, 
  ChevronDown, 
  Loader2,
  Play,
  Download
} from 'lucide-react';
import { generateSpeech } from '../services/geminiService';
import { decodeBase64, pcmToWav } from '../services/audioUtils';

// Mock Voice List
const VOICES = [
  { id: 'Puck', label: 'Puck (Masculino - Narrativa)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Puck' },
  { id: 'Kore', label: 'Kore (Feminina - Calma)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kore' },
  { id: 'Fenrir', label: 'Fenrir (Masculino - Profundo)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fenrir' },
  { id: 'Zephyr', label: 'Zephyr (Feminina - Enérgica)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zephyr' },
  { id: 'Charon', label: 'Charon (Masculino - Grave)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charon' },
];

const InternalNavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean }> = ({ icon, label, active }) => (
  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
    {icon}
    {label}
  </button>
);

const AudiobookCreator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [autoAssign, setAutoAssign] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCreateProject = async () => {
    if (!file) {
        alert("Por favor, envie um arquivo de texto (.txt) primeiro.");
        return;
    }

    setLoading(true);
    try {
        // Read file content (Basic TXT support for demo)
        const text = await file.text();
        
        // Limit text for demo purposes to avoid huge generation costs/time
        const previewText = text.substring(0, 500); 
        
        const base64 = await generateSpeech(previewText, selectedVoice);
        const pcm = decodeBase64(base64);
        const wav = pcmToWav(pcm, 24000, 1);
        const url = URL.createObjectURL(wav);
        
        setGeneratedAudio(url);
    } catch (error) {
        console.error(error);
        alert("Erro ao processar audiolivro.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-white rounded-[32px] overflow-hidden shadow-sm animate-fade-in">
      {/* Left Sidebar (Internal Tools) */}
      <div className="w-72 bg-white border-r border-slate-100 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        
        <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4">Áudio</h3>
            <div className="space-y-1">
                <InternalNavItem icon={<BookOpen size={18}/>} label="Novo audiolivro" active />
                <InternalNavItem icon={<Podcast size={18}/>} label="Criar um podcast" />
                <InternalNavItem icon={<LinkIcon size={18}/>} label="URL para áudio" />
                <InternalNavItem icon={<FileText size={18}/>} label="Gerador de Roteiro com IA" />
            </div>
        </div>

        <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4">Vídeo</h3>
            <div className="space-y-1">
                <InternalNavItem icon={<Video size={18}/>} label="Nova locução para vídeo" />
                <InternalNavItem icon={<Music size={18}/>} label="Adicionar efeitos sonoros" />
                <InternalNavItem icon={<Scissors size={18}/>} label="Partir legendas" />
                <InternalNavItem icon={<VolumeX size={18}/>} label="Remover ruído de fundo" />
                <InternalNavItem icon={<Wand2 size={18}/>} label="Corrija erros de locução" />
            </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100">
             <InternalNavItem icon={<UploadCloud size={18}/>} label="Novo projeto de áudio" />
             <InternalNavItem icon={<Video size={18}/>} label="Novo projeto de vídeo" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-10 bg-slate-50/50 overflow-y-auto relative">
          
          <button className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div className="max-w-2xl mx-auto mt-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2 font-display">Crie um audiolivro</h1>
              <p className="text-slate-500 mb-8">Se você já tem um documento, faça o upload abaixo.</p>

              {/* File Upload */}
              <div className="mb-8">
                  <label className="block text-sm font-bold text-slate-700 mb-3">Envie um documento (opcional)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`bg-white border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all group hover:border-indigo-300 ${file ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200'}`}
                  >
                      {file ? (
                          <div className="text-center">
                              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                                  <FileText size={24} />
                              </div>
                              <p className="text-sm font-bold text-indigo-900">{file.name}</p>
                              <p className="text-xs text-indigo-500 mt-1">Clique para trocar</p>
                          </div>
                      ) : (
                          <div className="text-center">
                              <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                  <UploadCloud size={20} />
                              </div>
                              <p className="text-sm font-bold text-slate-700 mb-1">Clique para enviar, ou prender e soltar</p>
                              <p className="text-xs text-slate-400">.epub, .pdf, .txt, .html, .docx</p>
                          </div>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt,.md,.html" className="hidden" />
                  </div>
              </div>

              {/* Voice Selection */}
              <div className="mb-8">
                  <label className="block text-sm font-bold text-slate-700 mb-3">Voz</label>
                  <div className="relative">
                      <select 
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pl-12 appearance-none outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 cursor-pointer shadow-sm"
                      >
                          {VOICES.map(v => (
                              <option key={v.id} value={v.id}>{v.label}</option>
                          ))}
                      </select>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-200 rounded-full overflow-hidden">
                          <img src={VOICES.find(v => v.id === selectedVoice)?.avatar} alt="avatar" className="w-full h-full"/>
                      </div>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
              </div>

              {/* Auto Assign Toggle */}
              <div className="flex items-center justify-between mb-12">
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-700">Atribuir vozes automaticamente</span>
                          <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded">Alfa</span>
                      </div>
                      <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                          Detecte automaticamente os personagens no projeto e atribua vozes correspondentes a eles.
                      </p>
                  </div>
                  <button 
                    onClick={() => setAutoAssign(!autoAssign)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${autoAssign ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${autoAssign ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
              </div>

              <div className="flex justify-end">
                  <button 
                    onClick={handleCreateProject}
                    disabled={loading || !file}
                    className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
                  >
                      {loading ? <Loader2 size={16} className="animate-spin"/> : "Criar projeto"}
                  </button>
              </div>

              {/* Generated Result Preview */}
              {generatedAudio && (
                  <div className="mt-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-lg animate-in fade-in slide-in-from-bottom-4">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <BookOpen size={18} className="text-indigo-600"/> Seu Audiolivro (Preview)
                      </h3>
                      <audio controls src={generatedAudio} className="w-full mb-4 accent-indigo-600" />
                      <a 
                        href={generatedAudio} 
                        download="audiolivro-preview.wav"
                        className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline"
                      >
                          <Download size={14}/> Baixar arquivo
                      </a>
                  </div>
              )}

          </div>
      </div>
    </div>
  );
};

export default AudiobookCreator;