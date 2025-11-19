import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Play, Download, Loader2, Volume2, Wand2, Trash2, StopCircle } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';
import { decodeBase64, pcmToWav } from '../services/audioUtils';

const VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  
  // Dictation State
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const r = new window.webkitSpeechRecognition();
      r.continuous = false;
      r.interimResults = false;
      r.lang = 'pt-BR';
      setRecognition(r);
    }
  }, []);

  const handleDictation = () => {
    if (!recognition) {
      alert("Seu navegador não suporta reconhecimento de voz.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText(prev => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setAudioUrl(null);

    try {
      const base64Audio = await generateSpeech(text, selectedVoice);
      const pcmData = decodeBase64(base64Audio);
      // Create a WAV blob for playback (24kHz is default for Gemini Flash Audio/TTS)
      const wavBlob = pcmToWav(pcmData, 24000, 1);
      const url = URL.createObjectURL(wavBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error("Error generating speech:", error);
      alert("Falha ao gerar áudio. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMainButtonAction = () => {
      if (isListening) {
          handleDictation(); // Stop
      } else if (text.trim().length > 0) {
          handleGenerate(); // Generate
      } else {
          handleDictation(); // Start Recording
      }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24 animate-fade-in">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Texto para Fala</h1>
        <p className="text-slate-500">Transforme sua voz em texto ou digite para gerar narrações com IA.</p>
      </header>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden relative">
        {/* Toolbar */}
        <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm">
                    <Volume2 size={16} className="text-slate-400"/>
                    <select 
                        value={selectedVoice} 
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
                    >
                        {VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
                {isListening && (
                    <span className="flex items-center gap-2 text-xs font-bold text-red-500 animate-pulse bg-red-50 px-3 py-1 rounded-full">
                        <span className="w-2 h-2 bg-red-500 rounded-full"/> Ouvindo...
                    </span>
                )}
            </div>
            
            {text && (
                <button onClick={() => setText('')} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                </button>
            )}
        </div>

        {/* Input Area */}
        <div className="relative p-6">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={isListening ? "Ouvindo sua voz..." : "Digite o texto ou use o microfone para falar..."}
                className="w-full h-48 text-lg text-slate-700 placeholder:text-slate-300 outline-none resize-none bg-transparent leading-relaxed"
                spellCheck={false}
            />
            
            {/* Main Action Button */}
            <div className="absolute bottom-6 right-6">
                <button 
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
                        isGenerating 
                            ? 'bg-slate-200 text-slate-500 cursor-wait'
                            : isListening 
                                ? 'bg-red-500 text-white hover:bg-red-600 scale-110' 
                                : text.trim().length > 0
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-white text-slate-400 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                    onClick={handleMainButtonAction}
                    disabled={isGenerating}
                    title={isListening ? "Parar" : text.trim().length > 0 ? "Gerar Áudio" : "Falar (Dictation)"}
                >
                    {isGenerating ? (
                        <Loader2 size={24} className="animate-spin" />
                    ) : isListening ? (
                        <MicOff size={24} />
                    ) : text.trim().length > 0 ? (
                        <Wand2 size={24} />
                    ) : (
                        <Mic size={24} />
                    )}
                </button>
            </div>
        </div>
      </div>

      {/* Result Player */}
      {audioUrl && (
        <div className="mt-8 bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                <Volume2 size={24} className="text-white" />
            </div>
            
            <div className="flex-1 w-full">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Áudio Gerado ({selectedVoice})</p>
                <audio controls src={audioUrl} className="w-full h-8 opacity-90" />
            </div>

            <a 
                href={audioUrl} 
                download={`speech-${selectedVoice}.wav`}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors"
            >
                <Download size={16} />
                Baixar
            </a>
        </div>
      )}
    </div>
  );
};

export default TextToSpeech;