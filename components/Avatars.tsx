import React, { useState, useRef } from 'react';
import { Plus, AudioLines, Mic, Play, Loader2, X, Upload, Video, User, Music, CheckCircle2, Pause } from 'lucide-react';
import { generateSpeech, generateVideo } from '../services/geminiService';
import { decodeBase64, pcmToWav } from '../services/audioUtils';

// --- CONSTANTS ---

const GEMINI_VOICES = [
  { id: 'Kore', label: 'Kore', gender: 'Feminina', style: 'Calma & Relaxante', color: 'bg-rose-100 text-rose-600' },
  { id: 'Puck', label: 'Puck', gender: 'Masculina', style: 'Narrativa & Clara', color: 'bg-blue-100 text-blue-600' },
  { id: 'Charon', label: 'Charon', gender: 'Masculina', style: 'Grave & Séria', color: 'bg-slate-200 text-slate-700' },
  { id: 'Fenrir', label: 'Fenrir', gender: 'Masculina', style: 'Profunda & Autoritária', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'Zephyr', label: 'Zephyr', gender: 'Feminina', style: 'Brilhante & Enérgica', color: 'bg-amber-100 text-amber-600' },
];

// --- SUB-COMPONENTS ---

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all ${
      active 
        ? 'bg-slate-900 text-white shadow-lg scale-105 ring-2 ring-white/20' 
        : 'bg-white/80 backdrop-blur text-slate-500 hover:bg-white border border-white/50'
    }`}
  >
    {icon}
    {label}
  </button>
);

const CreateCard: React.FC<{ label: string; subLabel: string; onClick: () => void; icon: React.ReactNode }> = ({ label, subLabel, onClick, icon }) => (
  <button 
    onClick={onClick}
    className="relative aspect-[3/4] bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:border-indigo-500 hover:bg-white transition-all group text-center p-4 shadow-sm hover:shadow-md"
  >
    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-4 shadow-md">
        {icon}
    </div>
    <h3 className="font-bold text-slate-800 text-lg">{label}</h3>
    <p className="text-xs text-slate-500 mt-1">{subLabel}</p>
  </button>
);

const VideoAvatarCard: React.FC<{ name: string; imageSrc: string; videoSrc?: string }> = ({ name, imageSrc, videoSrc }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const vidRef = useRef<HTMLVideoElement>(null);

    const togglePlay = () => {
        if (!vidRef.current) return;
        if (isPlaying) {
            vidRef.current.pause();
        } else {
            vidRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="relative aspect-[9/16] rounded-2xl overflow-hidden group bg-slate-900 shadow-lg hover:shadow-xl transition-all border border-white/20">
            {videoSrc ? (
                <video 
                    ref={vidRef}
                    src={videoSrc} 
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    onEnded={() => setIsPlaying(false)}
                />
            ) : (
                <img src={imageSrc} alt={name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                <p className="font-bold text-sm">{name}</p>
                <p className="text-[10px] opacity-70 uppercase tracking-wider">AI Avatar</p>
            </div>

            {/* Play Overlay */}
            {videoSrc && (
                <button 
                    onClick={togglePlay}
                    className={`absolute inset-0 flex items-center justify-center z-20 transition-all ${isPlaying ? 'opacity-0 hover:opacity-100 bg-black/20' : 'bg-black/20'}`}
                >
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform border border-white/30">
                        {isPlaying ? <Pause size={20} className="fill-white text-white"/> : <Play size={20} className="fill-white text-white ml-1"/>}
                    </div>
                </button>
            )}
        </div>
    );
}

interface VoiceCardProps {
    name: string;
    style: string;
    gender: string;
    audioSrc?: string;
    colorClass: string;
    voiceId?: string; // Added to support on-demand generation
    previewText?: string; // Text to say if generating
}

const VoiceCard: React.FC<VoiceCardProps> = ({ name, style, gender, audioSrc, colorClass, voiceId, previewText }) => {
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const toggleAudio = async () => {
        if (loading) return;

        // If audio object exists, just toggle
        if (audioRef.current) {
            if (playing) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setPlaying(false);
            } else {
                audioRef.current.play();
                setPlaying(true);
            }
            return;
        }

        // If we need to generate on the fly
        if (!audioSrc && voiceId) {
            setLoading(true);
            try {
                const text = previewText || `Olá, eu sou a voz ${name}. Sou uma inteligência artificial do Google.`;
                const base64 = await generateSpeech(text, voiceId);
                const pcm = decodeBase64(base64);
                const wav = pcmToWav(pcm, 24000, 1);
                const url = URL.createObjectURL(wav);
                
                audioRef.current = new Audio(url);
                audioRef.current.onended = () => setPlaying(false);
                
                await audioRef.current.play();
                setPlaying(true);
            } catch (e) {
                console.error("Failed to preview voice", e);
                alert("Erro ao gerar preview.");
            } finally {
                setLoading(false);
            }
            return;
        }

        // Legacy: If audioSrc was passed directly
        if (audioSrc) {
             audioRef.current = new Audio(audioSrc);
             audioRef.current.onended = () => setPlaying(false);
             audioRef.current.play();
             setPlaying(true);
        }
    };

    return (
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4 group hover:border-indigo-200">
            <button 
                onClick={toggleAudio}
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all shadow-md ${playing ? 'bg-indigo-600 text-white scale-110 shadow-indigo-200' : `${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]}`}`}
            >
                {loading ? (
                    <Loader2 size={20} className="animate-spin fill-current" />
                ) : playing ? (
                    <Pause size={20} className="fill-current" />
                ) : (
                    <Play size={20} className="fill-current ml-1" />
                )}
            </button>

            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800">{name}</h4>
                    <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{gender}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{style}</p>
                
                {/* Visual Waveform Simulation */}
                <div className="flex items-end gap-0.5 h-4 mt-2 opacity-50">
                    {[...Array(12)].map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-1 bg-indigo-500 rounded-full transition-all duration-300 ${playing ? 'animate-pulse' : ''}`}
                            style={{ height: playing ? `${Math.random() * 100}%` : `${30 + Math.sin(i)*20}%` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}


// --- MAIN COMPONENT ---

const Avatars: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'avatars' | 'voices'>('avatars');
  
  // Modals
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Video Creation State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPrompt, setVideoPrompt] = useState('');
  
  // Voice Creation State
  const [voiceName, setVoiceName] = useState('');
  const [voiceText, setVoiceText] = useState('');
  const [selectedBaseVoice, setSelectedBaseVoice] = useState('Puck');

  // Data Storage (Session)
  const [myVideos, setMyVideos] = useState<{url: string, name: string}[]>([]);
  const [myVoices, setMyVoices] = useState<{url: string, name: string, base: string}[]>([]);

  // Handlers
  const handleCreateVideo = async () => {
      if (!videoFile) return;
      setLoading(true);
      try {
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64 = (reader.result as string).split(',')[1];
              const url = await generateVideo(videoPrompt || "Portrait talking naturally", base64, 'veo-3.1-generate-preview');
              setMyVideos([...myVideos, { url, name: "Novo Avatar" }]);
              setShowVideoModal(false);
              setVideoFile(null);
              setVideoPrompt('');
          };
          reader.readAsDataURL(videoFile);
      } catch (e) {
          alert("Erro ao gerar vídeo.");
      } finally {
          setLoading(false);
      }
  };

  const handleCreateVoice = async () => {
      if (!voiceText || !voiceName) return;
      setLoading(true);
      try {
          const base64 = await generateSpeech(voiceText, selectedBaseVoice);
          const pcm = decodeBase64(base64);
          const wav = pcmToWav(pcm, 24000, 1);
          const url = URL.createObjectURL(wav);
          
          setMyVoices([...myVoices, { url, name: voiceName, base: selectedBaseVoice }]);
          setShowVoiceModal(false);
          setVoiceName('');
          setVoiceText('');
      } catch (e) {
          alert("Erro ao criar voz.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24 animate-fade-in">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div>
              <h1 className="text-4xl font-extrabold text-slate-900 font-display">Avatares & Voz</h1>
              <p className="text-slate-500 mt-2 font-medium">Laboratório de identidade digital.</p>
          </div>
          <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-full border border-white/50 shadow-sm">
              <TabButton 
                active={activeTab === 'avatars'} 
                onClick={() => setActiveTab('avatars')} 
                icon={<User size={18}/>} 
                label="Estúdio Visual" 
              />
              <TabButton 
                active={activeTab === 'voices'} 
                onClick={() => setActiveTab('voices')} 
                icon={<AudioLines size={18}/>} 
                label="Laboratório Sonoro" 
              />
          </div>
      </div>

      {/* --- TAB 1: AVATARES --- */}
      {activeTab === 'avatars' && (
          <div className="animate-in slide-in-from-left-4">
             <div className="mb-8">
                 <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Video className="text-indigo-600" size={24}/> Meus Vídeos de Avatar
                 </h2>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                     <CreateCard 
                        label="Novo Avatar" 
                        subLabel="Upload foto + Prompt" 
                        icon={<Plus size={28}/>} 
                        onClick={() => setShowVideoModal(true)}
                     />
                     
                     {/* User Generated */}
                     {myVideos.map((vid, i) => (
                         <VideoAvatarCard key={`my-${i}`} name={vid.name} imageSrc="" videoSrc={vid.url} />
                     ))}

                     {/* Samples */}
                     <VideoAvatarCard 
                        name="Exemplo: Apresentadora" 
                        imageSrc="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
                        videoSrc="" // Placeholder, user can upload to test
                     />
                     <VideoAvatarCard 
                        name="Exemplo: Mascote" 
                        imageSrc="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80"
                     />
                 </div>
             </div>
          </div>
      )}

      {/* --- TAB 2: VOZES --- */}
      {activeTab === 'voices' && (
          <div className="animate-in slide-in-from-right-4">
              
              {/* Create New Section */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-10 text-white mb-12 shadow-2xl shadow-indigo-500/30 flex items-center justify-between relative overflow-hidden group">
                  <div className="relative z-10">
                      <h2 className="text-3xl font-extrabold mb-2 font-display">Crie sua Voz Sintética</h2>
                      <p className="text-indigo-100 mb-8 max-w-md text-lg">Clone estilos de voz usando a engine do Gemini 2.5 para seus projetos.</p>
                      <button 
                        onClick={() => setShowVoiceModal(true)}
                        className="bg-white text-indigo-700 px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 hover:scale-105 transition-all shadow-xl"
                      >
                          <Plus size={20} /> Criar Nova Voz
                      </button>
                  </div>
                  <div className="absolute right-0 top-0 h-full w-1/2 opacity-20 group-hover:scale-105 transition-transform duration-1000">
                        {/* Decorative Waveform */}
                        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
                            <path d="M0 50 Q 25 100 50 50 T 100 50" fill="none" stroke="white" strokeWidth="2" />
                            <path d="M0 50 Q 25 0 50 50 T 100 50" fill="none" stroke="white" strokeWidth="2" opacity="0.5"/>
                        </svg>
                  </div>
              </div>

              {/* My Voices */}
              <div className="mb-12">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Minhas Vozes Criadas</h3>
                  {myVoices.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-slate-300/50 rounded-2xl bg-white/30 backdrop-blur-sm">
                          <Music className="mx-auto text-slate-300 mb-3" size={40} />
                          <p className="text-slate-500 font-medium">Nenhuma voz personalizada criada ainda.</p>
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {myVoices.map((voice, i) => {
                              const meta = GEMINI_VOICES.find(v => v.id === voice.base) || GEMINI_VOICES[0];
                              return (
                                <VoiceCard 
                                    key={i}
                                    name={voice.name}
                                    style={`Base: ${meta.id} • Personalizada`}
                                    gender={meta.gender}
                                    colorClass={meta.color}
                                    audioSrc={voice.url}
                                />
                              );
                          })}
                      </div>
                  )}
              </div>

              {/* System Voices */}
              <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Base Neural (Gemini Models)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {GEMINI_VOICES.map(voice => (
                          <VoiceCard 
                            key={voice.id}
                            voiceId={voice.id}
                            name={voice.label}
                            style={voice.style}
                            gender={voice.gender}
                            colorClass={voice.color}
                            previewText={`Olá! Eu sou a voz ${voice.label}. Estou pronta para gerar seus conteúdos.`}
                          />
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* --- MODAL: CREATE VIDEO --- */}
      {showVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
              <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative border border-white/20">
                  <button onClick={() => setShowVideoModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1"><X size={20}/></button>
                  
                  <h2 className="text-2xl font-bold mb-6 text-slate-900 font-display">Novo Avatar Animado</h2>

                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl h-56 flex flex-col items-center justify-center relative hover:bg-indigo-50/30 hover:border-indigo-300 transition-all cursor-pointer mb-6 group">
                      {videoFile ? (
                          <div className="relative w-full h-full p-2">
                              <img src={URL.createObjectURL(videoFile)} className="w-full h-full object-contain rounded-xl" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-sm">
                                  <p className="text-white font-bold text-sm flex items-center gap-2"><Upload size={16}/> Trocar Imagem</p>
                              </div>
                          </div>
                      ) : (
                          <>
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                                <Upload size={24} />
                            </div>
                            <p className="font-bold text-slate-700">Clique para fazer upload</p>
                            <p className="text-xs text-slate-400 mt-1">PNG, JPG (Max 5MB)</p>
                          </>
                      )}
                      <input type="file" accept="image/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>

                  <div className="mb-8">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Comportamento / Prompt</label>
                      <textarea 
                        value={videoPrompt}
                        onChange={e => setVideoPrompt(e.target.value)}
                        placeholder="Ex: Personagem falando calmamente, piscando os olhos, iluminação natural..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-28 text-sm shadow-sm"
                      />
                  </div>

                  <button 
                    onClick={handleCreateVideo}
                    disabled={loading || !videoFile}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition-transform shadow-lg"
                  >
                      {loading ? <Loader2 className="animate-spin"/> : <Video size={20} />}
                      Gerar Vídeo
                  </button>
              </div>
          </div>
      )}

      {/* --- MODAL: CREATE VOICE --- */}
      {showVoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
              <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative border border-white/20">
                  <button onClick={() => setShowVoiceModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1"><X size={20}/></button>
                  
                  <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                          <Mic size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 font-display">Criar Nova Voz</h2>
                        <p className="text-xs text-slate-500">Defina o DNA da sua voz sintética.</p>
                      </div>
                  </div>

                  <div className="space-y-5 mb-8">
                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Nome da Voz</label>
                          <input 
                            value={voiceName}
                            onChange={e => setVoiceName(e.target.value)}
                            placeholder="Ex: Narrador Corporativo"
                            className="w-full border border-slate-200 rounded-xl p-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Voz Base (Gemini Model)</label>
                          <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                              {GEMINI_VOICES.map(voice => (
                                  <button
                                    key={voice.id}
                                    onClick={() => setSelectedBaseVoice(voice.id)}
                                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                                        selectedBaseVoice === voice.id 
                                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                                        : 'border-slate-200 hover:border-indigo-200'
                                    }`}
                                  >
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${voice.color}`}>
                                          {voice.id[0]}
                                      </div>
                                      <div className="min-w-0">
                                          <p className="text-xs font-bold text-slate-800 truncate">{voice.label}</p>
                                          <p className="text-[9px] text-slate-500 truncate">{voice.gender}</p>
                                      </div>
                                      {selectedBaseVoice === voice.id && <CheckCircle2 size={16} className="ml-auto text-indigo-600 shrink-0"/>}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Texto de Teste</label>
                          <textarea 
                            value={voiceText}
                            onChange={e => setVoiceText(e.target.value)}
                            placeholder="O que você quer que esta voz diga?"
                            className="w-full border border-slate-200 rounded-xl p-4 h-28 resize-none text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                          />
                      </div>
                  </div>

                  <button 
                    onClick={handleCreateVoice}
                    disabled={loading || !voiceName || !voiceText}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition-transform shadow-lg shadow-indigo-200"
                  >
                      {loading ? <Loader2 className="animate-spin"/> : <AudioLines size={20} />}
                      Gerar e Salvar Voz
                  </button>
              </div>
          </div>
      )}

    </div>
  );
};

export default Avatars;