import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Download, Loader2, Volume2, Wand2, Trash2, StopCircle, FileAudio } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';
import { decodeBase64, pcmToWav } from '../services/audioUtils';

const VOICES = [
  { id: 'Kore', label: 'Kore (Feminina - Calma)' },
  { id: 'Puck', label: 'Puck (Masculina - Clara)' },
  { id: 'Charon', label: 'Charon (Masculina - Grave)' },
  { id: 'Fenrir', label: 'Fenrir (Masculina - Profunda)' },
  { id: 'Zephyr', label: 'Zephyr (Feminina - Enérgica)' }
];

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  
  // Recording State (Web Speech API)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            
            // Update text mostly when final to avoid cursor jumping too much, 
            // but you could append interim if desired.
            if (finalTranscript) {
                setText(prev => prev + (prev ? ' ' : '') + finalTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
      if (!recognitionRef.current) {
          alert("Seu navegador não suporta ditado por voz. Tente usar o Google Chrome.");
          return;
      }

      if (isListening) {
          recognitionRef.current.stop();
          setIsListening(false);
      } else {
          recognitionRef.current.start();
          setIsListening(true);
      }
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setAudioUrl(null); // Clear previous

    try {
      // 1. Call Gemini API
      const base64Audio = await generateSpeech(text, selectedVoice);
      
      // 2. Decode and Convert to WAV
      const pcmData = decodeBase64(base64Audio);
      const wavBlob = pcmToWav(pcmData, 24000, 1); // 24kHz is standard for Gemini Flash Audio
      
      // 3. Create Playable URL
      const url = URL.createObjectURL(wavBlob);
      setAudioUrl(url);

    } catch (error) {
      console.error("Error generating speech:", error);
      alert("Falha ao gerar áudio. Verifique sua conexão ou tente um texto menor.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24 animate-fade-in">
      <header className="mb-10 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4 shadow-inner ring-4 ring-indigo-50">
            <Volume2 size={32} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-3 font-display">Texto para Fala (TTS)</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">Transforme seus roteiros em narrações profissionais instantaneamente.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Input & Settings */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="glass-panel rounded-3xl shadow-xl border border-white/60 overflow-hidden relative flex flex-col h-full min-h-[500px]">
                {/* Toolbar */}
                <div className="bg-white/60 backdrop-blur-md border-b border-white/50 p-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                            <Volume2 size={16} className="text-indigo-500"/>
                            <select 
                                value={selectedVoice} 
                                onChange={(e) => setSelectedVoice(e.target.value)}
                                className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer w-full min-w-[140px]"
                            >
                                {VOICES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                            </select>
                        </div>
                        
                        {isListening && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 text-red-600 rounded-full text-xs font-bold animate-pulse">
                                <div className="w-2 h-2 bg-red-500 rounded-full"/> Ouvindo...
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => setText('')} 
                        disabled={!text}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-0"
                        title="Limpar texto"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                {/* Text Area */}
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Digite seu roteiro aqui ou clique no microfone para ditar..."
                    className="flex-1 w-full p-8 text-xl text-slate-700 placeholder:text-slate-300 outline-none resize-none bg-transparent leading-relaxed font-medium"
                    spellCheck={false}
                />

                {/* Actions Bar (Floating) */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4">
                    <button 
                        onClick={toggleListening}
                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all border-4 border-white group ${
                            isListening 
                            ? 'bg-red-500 text-white shadow-red-500/30 scale-110' 
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                        title="Gravar Voz (Ditado)"
                    >
                        {isListening ? <StopCircle size={24} className="fill-current"/> : <Mic size={24} className="group-hover:text-indigo-600 transition-colors"/>}
                    </button>

                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !text.trim()}
                        className="flex-1 h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold text-lg shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                    >
                        {isGenerating ? (
                            <Loader2 size={24} className="animate-spin text-indigo-400" />
                        ) : (
                            <>
                                <Wand2 size={20} className="text-indigo-400" /> Gerar Narração
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>

        {/* RIGHT: Preview & History */}
        <div className="flex flex-col gap-6">
            
            {/* Audio Player Card */}
            <div className={`bg-white rounded-3xl p-6 shadow-xl border border-slate-100 transition-all duration-500 ${audioUrl ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 grayscale'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg text-white">
                         <Play size={24} className="fill-white ml-1"/>
                    </div>
                    {audioUrl && (
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase">Pronto</span>
                    )}
                </div>

                <h3 className="font-bold text-slate-900 text-lg mb-1">Preview de Áudio</h3>
                <p className="text-sm text-slate-500 mb-6">Voz: <span className="font-semibold text-indigo-600">{selectedVoice}</span></p>

                {audioUrl ? (
                    <div className="animate-in fade-in">
                        <audio controls src={audioUrl} className="w-full h-10 accent-indigo-600 mb-6" />
                        
                        <a 
                            href={audioUrl} 
                            download={`narracao-${selectedVoice}.wav`}
                            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors border border-indigo-200"
                        >
                            <Download size={16} /> Download .WAV
                        </a>
                    </div>
                ) : (
                    <div className="h-32 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                        <FileAudio size={32} className="mb-2 opacity-50"/>
                        <p className="text-xs font-medium">O áudio gerado aparecerá aqui</p>
                    </div>
                )}
            </div>

            {/* Tip Card */}
            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
                <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                    <span className="text-xl">💡</span> Dica Pro
                </h4>
                <p className="text-xs text-amber-700/80 leading-relaxed">
                    Para melhores resultados com o Gemini TTS, use pontuação clara. Vírgulas adicionam pausas curtas e pontos finais pausas longas.
                </p>
            </div>

        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;