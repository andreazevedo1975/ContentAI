
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
  Download,
  Mic,
  Check
} from 'lucide-react';
import { generateSpeech, generateSocialPlan, generateAnalysis } from '../services/geminiService'; // Reusing existing services where possible
import { decodeBase64, pcmToWav } from '../services/audioUtils';
import { GoogleGenAI } from "@google/genai"; // Direct import for specific one-off calls

// Mock Voice List
const VOICES = [
  { id: 'Puck', label: 'Puck (Masculino - Narrativa)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Puck' },
  { id: 'Kore', label: 'Kore (Feminina - Calma)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kore' },
  { id: 'Fenrir', label: 'Fenrir (Masculino - Profundo)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fenrir' },
  { id: 'Zephyr', label: 'Zephyr (Feminina - Enérgica)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zephyr' },
  { id: 'Charon', label: 'Charon (Masculino - Grave)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charon' },
];

type ToolId = 'audiobook' | 'podcast' | 'url_audio' | 'script_gen' | 'video_voiceover' | 'sfx' | 'captions' | 'denoise' | 'fix_audio';

const InternalNavItem: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    active?: boolean; 
    onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${active ? 'bg-slate-100 text-slate-900 font-bold border-l-4 border-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-l-4 border-transparent'}`}
  >
    <div className={active ? 'text-slate-900' : 'text-slate-400'}>{icon}</div>
    {label}
  </button>
);

const AudiobookCreator: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolId>('audiobook');
  
  // Shared State
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null); // Can be audio URL or text
  const [resultType, setResultType] = useState<'audio' | 'text'>('audio');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = (tool: ToolId) => {
      setActiveTool(tool);
      setFile(null);
      setTextInput('');
      setGeneratedResult(null);
      setLoading(false);
  };

  // --- API HELPERS ---

  const generateTextContent = async (prompt: string) => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
      });
      return response.text || "";
  };

  // --- HANDLERS ---

  const handleAction = async () => {
      setLoading(true);
      setGeneratedResult(null);
      
      try {
          if (activeTool === 'audiobook') {
              // Logic: File/Text -> Speech
              let content = textInput;
              if (file) content = await file.text();
              if (!content) throw new Error("Sem conteúdo para processar");
              
              const base64 = await generateSpeech(content.substring(0, 1000), selectedVoice);
              const url = URL.createObjectURL(pcmToWav(decodeBase64(base64)));
              setGeneratedResult(url);
              setResultType('audio');
          } 
          else if (activeTool === 'podcast') {
              // Logic: Topic -> Script -> Speech
              const script = await generateTextContent(`Create a short, engaging podcast intro script about: ${textInput}. Two hosts (Host A and Host B). Keep it under 100 words.`);
              const base64 = await generateSpeech(script, selectedVoice);
              const url = URL.createObjectURL(pcmToWav(decodeBase64(base64)));
              setGeneratedResult(url);
              setResultType('audio');
          }
          else if (activeTool === 'url_audio') {
              // Logic: URL -> Summarize -> Speech
              const summary = await generateTextContent(`Summarize the main content of this topic/url for an audio overview: ${textInput}. Keep it concise.`);
              const base64 = await generateSpeech(summary, selectedVoice);
              const url = URL.createObjectURL(pcmToWav(decodeBase64(base64)));
              setGeneratedResult(url);
              setResultType('audio');
          }
          else if (activeTool === 'script_gen') {
              // Logic: Prompt -> Text
              const script = await generateTextContent(`Write a professional video script for: ${textInput}. Format with Scenes and Narrator lines.`);
              setGeneratedResult(script);
              setResultType('text');
          }
          else if (activeTool === 'sfx') {
              // Logic: Prompt -> Speech (Simulated SFX description or tone)
              // Gemini isn't a SFX generator, but we can try to make it say the sound or describe it
              const base64 = await generateSpeech(`[Sound effect of: ${textInput}]`, 'Zephyr'); // Using Zephyr for higher pitch
              const url = URL.createObjectURL(pcmToWav(decodeBase64(base64)));
              setGeneratedResult(url);
              setResultType('audio');
          }
          else if (activeTool === 'captions') {
              // Logic: Video -> Transcription
              // Mocking transcription for now as we don't have server-side video processing
              await new Promise(r => setTimeout(r, 2000));
              setGeneratedResult(`[00:00] Iniciando o vídeo...\n[00:05] Esta é uma legenda gerada automaticamente.\n[00:10] O sistema detectou fala em português.\n[00:15] Fim da transcrição.`);
              setResultType('text');
          }
          else {
              // Fallback
              await new Promise(r => setTimeout(r, 1000));
              alert("Funcionalidade em desenvolvimento.");
          }

      } catch (e) {
          console.error(e);
          alert("Erro ao processar.");
      } finally {
          setLoading(false);
      }
  };

  // --- RENDER CONTENT ---

  const renderContent = () => {
      switch(activeTool) {
          case 'audiobook':
              return (
                  <>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 font-display">Crie um audiolivro</h1>
                    <p className="text-slate-500 mb-8">Transforme textos longos ou arquivos em áudio narrado.</p>
                    
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Envie um documento ou Cole Texto</label>
                        <div className="flex flex-col gap-4">
                            <textarea 
                                value={textInput}
                                onChange={e => setTextInput(e.target.value)}
                                placeholder="Cole o texto do seu livro aqui..."
                                className="w-full h-32 p-4 border border-slate-200 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            />
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-slate-400 uppercase">OU</span>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors"
                                >
                                    <UploadCloud size={16}/> {file ? file.name : "Upload .TXT/.PDF"}
                                </button>
                                <input type="file" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" accept=".txt,.pdf"/>
                            </div>
                        </div>
                    </div>
                  </>
              );
          case 'podcast':
              return (
                  <>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 font-display">Criar Podcast IA</h1>
                    <p className="text-slate-500 mb-8">Gere um episódio de podcast completo a partir de um tópico.</p>
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Tópico do Episódio</label>
                        <input 
                            value={textInput}
                            onChange={e => setTextInput(e.target.value)}
                            placeholder="Ex: O futuro da inteligência artificial..."
                            className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                        />
                    </div>
                  </>
              );
          case 'url_audio':
              return (
                  <>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 font-display">URL para Áudio</h1>
                    <p className="text-slate-500 mb-8">Ouça o conteúdo de qualquer página da web.</p>
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Cole o Link</label>
                        <input 
                            value={textInput}
                            onChange={e => setTextInput(e.target.value)}
                            placeholder="https://..."
                            className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                    </div>
                  </>
              );
          case 'script_gen':
              return (
                  <>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 font-display">Gerador de Roteiro</h1>
                    <p className="text-slate-500 mb-8">Crie roteiros estruturados para vídeos, anúncios ou apresentações.</p>
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Sobre o que é o vídeo?</label>
                        <textarea 
                            value={textInput}
                            onChange={e => setTextInput(e.target.value)}
                            placeholder="Descreva o objetivo, público e tom..."
                            className="w-full h-32 p-4 border border-slate-200 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </div>
                  </>
              );
          case 'sfx':
              return (
                  <>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 font-display">Efeitos Sonoros</h1>
                    <p className="text-slate-500 mb-8">Gere sons rápidos para suas produções.</p>
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Descreva o som</label>
                        <input 
                            value={textInput}
                            onChange={e => setTextInput(e.target.value)}
                            placeholder="Ex: Passos na chuva, explosão distante..."
                            className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                        />
                    </div>
                  </>
              );
          case 'captions':
              return (
                  <>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 font-display">Partir Legendas</h1>
                    <p className="text-slate-500 mb-8">Gere legendas SRT a partir de vídeos.</p>
                    <div className="mb-8 border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50" onClick={() => fileInputRef.current?.click()}>
                        <Video size={32} className="text-slate-400 mb-2"/>
                        <p className="text-sm font-bold text-slate-600">Upload Vídeo (MP4)</p>
                        <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={e => setFile(e.target.files?.[0] || null)}/>
                        {file && <p className="text-xs text-green-600 mt-2 font-bold">{file.name}</p>}
                    </div>
                  </>
              );
          default:
              return (
                  <div className="text-center py-20">
                      <Wand2 size={48} className="mx-auto text-slate-300 mb-4"/>
                      <h2 className="text-xl font-bold text-slate-700">Selecione uma ferramenta</h2>
                  </div>
              );
      }
  };

  return (
    <div className="flex h-full bg-white rounded-[32px] overflow-hidden shadow-sm animate-fade-in">
      {/* Left Sidebar (Internal Tools) */}
      <div className="w-72 bg-white border-r border-slate-100 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar shrink-0">
        
        <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4">Áudio</h3>
            <div className="space-y-1">
                <InternalNavItem 
                    icon={<BookOpen size={18}/>} 
                    label="Novo audiolivro" 
                    active={activeTool === 'audiobook'} 
                    onClick={() => resetState('audiobook')}
                />
                <InternalNavItem 
                    icon={<Podcast size={18}/>} 
                    label="Criar um podcast" 
                    active={activeTool === 'podcast'} 
                    onClick={() => resetState('podcast')}
                />
                <InternalNavItem 
                    icon={<LinkIcon size={18}/>} 
                    label="URL para áudio" 
                    active={activeTool === 'url_audio'} 
                    onClick={() => resetState('url_audio')}
                />
                <InternalNavItem 
                    icon={<FileText size={18}/>} 
                    label="Gerador de Roteiro" 
                    active={activeTool === 'script_gen'} 
                    onClick={() => resetState('script_gen')}
                />
            </div>
        </div>

        <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4">Vídeo</h3>
            <div className="space-y-1">
                <InternalNavItem 
                    icon={<Video size={18}/>} 
                    label="Nova locução para vídeo" 
                    active={activeTool === 'video_voiceover'} 
                    onClick={() => resetState('video_voiceover')}
                />
                <InternalNavItem 
                    icon={<Music size={18}/>} 
                    label="Adicionar efeitos sonoros" 
                    active={activeTool === 'sfx'} 
                    onClick={() => resetState('sfx')}
                />
                <InternalNavItem 
                    icon={<Scissors size={18}/>} 
                    label="Partir legendas" 
                    active={activeTool === 'captions'} 
                    onClick={() => resetState('captions')}
                />
                <InternalNavItem 
                    icon={<VolumeX size={18}/>} 
                    label="Remover ruído de fundo" 
                    active={activeTool === 'denoise'} 
                    onClick={() => resetState('denoise')}
                />
                <InternalNavItem 
                    icon={<Wand2 size={18}/>} 
                    label="Corrija erros de locução" 
                    active={activeTool === 'fix_audio'} 
                    onClick={() => resetState('fix_audio')}
                />
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-10 bg-slate-50/50 overflow-y-auto relative">
          
          <div className="max-w-2xl mx-auto mt-8">
              {renderContent()}

              {/* Voice Selection (Only for audio tools) */}
              {(['audiobook', 'podcast', 'url_audio', 'sfx'].includes(activeTool)) && (
                  <div className="mb-8">
                      <label className="block text-sm font-bold text-slate-700 mb-3">Voz / Narrador</label>
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
              )}

              {/* Action Button */}
              <div className="flex justify-end">
                  <button 
                    onClick={handleAction}
                    disabled={loading || (!textInput && !file)}
                    className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
                  >
                      {loading ? <Loader2 size={16} className="animate-spin"/> : "Processar"}
                  </button>
              </div>

              {/* Result Area */}
              {generatedResult && (
                  <div className="mt-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-lg animate-in fade-in slide-in-from-bottom-4">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Check size={18} className="text-green-600"/> Resultado Gerado
                      </h3>
                      
                      {resultType === 'audio' ? (
                          <>
                            <audio controls src={generatedResult} className="w-full mb-4 accent-indigo-600" />
                            <a 
                                href={generatedResult} 
                                download={`result-${activeTool}.wav`}
                                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline"
                            >
                                <Download size={14}/> Baixar arquivo
                            </a>
                          </>
                      ) : (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap font-mono">
                              {generatedResult}
                          </div>
                      )}
                  </div>
              )}

          </div>
      </div>
    </div>
  );
};

export default AudiobookCreator;
