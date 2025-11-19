import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, Radio } from 'lucide-react';
import { connectLiveSession } from '../services/geminiService';
import { decodeBase64, decodeAudioData, pcmToWav } from '../services/audioUtils';

// --- Live API Audio Utils ---
function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return new Blob([int16], { type: 'audio/pcm' });
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

const LiveAssistant: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false); // Model is talking
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const stopSession = () => {
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    // Cannot strictly "close" the session object from SDK easily if not exposed, 
    // but cutting audio context stops the flow.
    setIsConnected(false);
  };

  const startSession = async () => {
    setError(null);
    try {
        // 1. Setup Audio Setup
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        audioContextRef.current = audioCtx;
        
        // Output Context (24kHz for model output)
        const outputCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        nextStartTimeRef.current = 0;

        // 2. Connect to Live API
        const sessionPromise = connectLiveSession({
            onopen: () => {
                setIsConnected(true);
                console.log("Live Session Connected");

                // Start Input Streaming
                const source = audioCtx.createMediaStreamSource(stream);
                const processor = audioCtx.createScriptProcessor(4096, 1, 1);
                
                processor.onaudioprocess = async (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    // Convert Float32 to Int16 PCM
                    const l = inputData.length;
                    const int16 = new Int16Array(l);
                    for (let i = 0; i < l; i++) {
                        int16[i] = inputData[i] * 32768;
                    }
                    // Encode to base64
                    const base64Data = arrayBufferToBase64(int16.buffer);
                    
                    sessionPromise.then(session => {
                        session.sendRealtimeInput({ 
                            media: { 
                                mimeType: 'audio/pcm;rate=16000', 
                                data: base64Data 
                            } 
                        });
                    });
                };

                source.connect(processor);
                processor.connect(audioCtx.destination);
                
                inputSourceRef.current = source;
                processorRef.current = processor;
            },
            onmessage: async (msg: any) => {
                // Handle Audio Output
                const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (base64Audio) {
                    setIsTalking(true);
                    const audioData = decodeBase64(base64Audio);
                    const buffer = await decodeAudioData(audioData, outputCtx, 24000, 1);
                    
                    const source = outputCtx.createBufferSource();
                    source.buffer = buffer;
                    source.connect(outputCtx.destination);
                    
                    const now = outputCtx.currentTime;
                    const start = Math.max(now, nextStartTimeRef.current);
                    source.start(start);
                    nextStartTimeRef.current = start + buffer.duration;
                    
                    source.onended = () => {
                        if (outputCtx.currentTime >= nextStartTimeRef.current) {
                             setIsTalking(false);
                        }
                    };
                }
            },
            onclose: () => {
                console.log("Live Session Closed");
                setIsConnected(false);
            },
            onerror: (err: any) => {
                console.error("Live Session Error", err);
                setError("Conexão perdida ou erro de API.");
                setIsConnected(false);
            }
        });
        
        sessionRef.current = sessionPromise;

    } catch (e) {
        console.error(e);
        setError("Falha ao acessar microfone ou conectar.");
    }
  };

  // Cleanup
  useEffect(() => {
      return () => stopSession();
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto text-center animate-fade-in h-screen flex flex-col justify-center">
       <div className="mb-8">
           <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${isConnected ? 'bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]' : 'bg-slate-200'}`}>
                {isConnected ? (
                    <div className="flex gap-1 items-center h-12">
                         {[1,2,3,4,5].map(i => (
                             <div key={i} className={`w-2 bg-white rounded-full animate-pulse ${isTalking ? 'h-12' : 'h-4'}`} style={{animationDelay: `${i * 0.1}s`}} />
                         ))}
                    </div>
                ) : (
                    <MicOff size={48} className="text-slate-400" />
                )}
           </div>
           <h1 className="mt-8 text-3xl font-bold text-slate-900">Gemini Live</h1>
           <p className="text-slate-500 mt-2">{isConnected ? "Ouvindo... Fale agora." : "Clique para conectar e conversar."}</p>
       </div>

       {error && (
           <div className="mb-6 bg-red-50 text-red-600 px-4 py-2 rounded-lg inline-flex items-center gap-2 mx-auto">
               <AlertCircle size={16}/> {error}
           </div>
       )}

       <div className="flex justify-center">
           {!isConnected ? (
               <button onClick={startSession} className="bg-black text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 hover:scale-105 transition-transform shadow-xl">
                   <Mic size={24} /> Iniciar Conversa
               </button>
           ) : (
               <button onClick={stopSession} className="bg-slate-100 text-slate-900 px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 hover:bg-red-50 hover:text-red-600 transition-colors">
                   <MicOff size={24} /> Encerrar
               </button>
           )}
       </div>
       
       <div className="mt-12 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-400">
           <p className="flex items-center justify-center gap-2"><Radio size={12}/> Powered by Gemini 2.5 Flash Native Audio (Low Latency)</p>
       </div>
    </div>
  );
};

export default LiveAssistant;