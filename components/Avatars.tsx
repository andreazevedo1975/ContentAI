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
        ? 'bg-black text-white shadow-lg scale-105' 
        : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
    }`}
  >
    {icon}
    {label}
  </button>
);

const CreateCard: React.FC<{ label: string; subLabel: string; onClick: () => void; icon: React.ReactNode }> = ({ label, subLabel, onClick, icon }) => (
  <button 
    onClick={onClick}
    className="relative aspect-[3/4] bg-white rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group text-center p-4"
  >
    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors mb-4 shadow-sm">
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
        <div className="relative aspect-[9/16] rounded-2xl overflow-hidden group bg-slate-900 shadow-md hover:shadow-xl transition-all">
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
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                        {isPlaying ? <Pause size={20} className="fill-white text-white"/> : <Play size={20} className="fill-white text-white ml-1"/>}
                    </div>
                </button>
            )}
        </div>
    );
}

const VoiceCard: React.FC<{ name: string; style: string; gender: string; audioSrc?: string; colorClass: string }> = ({ name, style, gender, audioSrc, colorClass }) => {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const toggleAudio = () => {
        if (!audioSrc) return;
        
        if (!audioRef.current) {
            audioRef.current = new Audio(audioSrc);
            audioRef.current.onended = () => setPlaying(false);
        }

        if (playing) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setPlaying(false);
        } else {
            audioRef.current.play();
            setPlaying(true);
        }
    };

    return (
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex items-center gap-4 group">
            <button 
                onClick={toggleAudio}
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${playing ? 'bg-indigo-600 text-white scale-110 shadow-indigo-200' : `${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]}`}`}
            >
                {playing ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
            </button>

            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800">{name}</h4>
                    <span className="text-[10px] font-bold uppercase text-slate-400 border border-slate-100 px-1.5 rounded">{gender}</span>
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
          
          // Find style metadata for saving
          const voiceMeta = GEMINI_VOICES.find(v => v.id === selectedBaseVoice);

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
    <div className="p-6 max-w-7xl mx-auto pb-24 animate-fade-in">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div>
              <h1 className="text-3xl font-bold text-slate-900">Avatares e Vozes</h1>
              <p className="text-slate-500 mt-1">Crie personagens digitais e clone vozes com IA.</p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-full">
              <TabButton 
                active={activeTab === 'avatars'} 
                onClick={() => setActiveTab('avatars')} 
                icon={<User size={18}/>} 
                label="Estúdio de Avatares" 
              />
              <TabButton 
                active={activeTab === 'voices'} 
                onClick={() => setActiveTab('voices')} 
                icon={<AudioLines size={18}/>} 
                label="Laboratório de Voz" 
              />
          </div>
      </div>

      {/* --- TAB 1: AVATARES --- */}
      {activeTab === 'avatars' && (
          <div className="animate-in slide-in-from-left-4">
             <div className="mb-8">
                 <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Video className="text-indigo-600" size={24}/> Meus Vídeos de Avatar
                 </h2>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 text-white mb-10 shadow-xl flex items-center justify-between relative overflow-hidden">
                  <div className="relative z-10">
                      <h2 className="text-2xl font-bold mb-2">Crie sua Voz Sintética</h2>
                      <p className="text-indigo-100 mb-6 max-w-md">Escolha uma base neural (Gemini Voices), dê um nome e personalize o tom para seus vídeos.</p>
                      <button 
                        onClick={() => setShowVoiceModal(true)}
                        className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors shadow-lg"
                      >
                          <Plus size={20} /> Criar Nova Voz
                      </button>
                  </div>
                  <div className="absolute right-0 top-0 h-full w-1/2 opacity-20">
                        {/* Decorative Waveform */}
                        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
                            <path d="M0 50 Q 25 100 50 50 T 100 50" fill="none" stroke="white" strokeWidth="2" />
                            <path d="M0 50 Q 25 0 50 50 T 100 50" fill="none" stroke="white" strokeWidth="2" opacity="0.5"/>
                        </svg>
                  </div>
              </div>

              {/* My Voices */}
              <div className="mb-10">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Minhas Vozes Criadas</h3>
                  {myVoices.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                          <Music className="mx-auto text-slate-300 mb-2" size={32} />
                          <p className="text-slate-500 font-medium">Nenhuma voz personalizada criada ainda.</p>
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Biblioteca Gemini (Bases Disponíveis)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {GEMINI_VOICES.map(voice => (
                          <VoiceCard 
                            key={voice.id}
                            name={voice.label}
                            style={voice.style}
                            gender={voice.gender}
                            colorClass={voice.color}
                            // Note: System voices in list don't play audio directly here unless we generate samples on fly.
                            // For UI demo we leave them static or we could add sample URL.
                            // audioSrc={`/samples/${voice.id}.mp3`} 
                          />
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* --- MODAL: CREATE VIDEO --- */}
      {showVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative">
                  <button onClick={() => setShowVideoModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  
                  <h2 className="text-xl font-bold mb-6 text-slate-900">Novo Avatar Animado</h2>

                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl h-48 flex flex-col items-center justify-center relative hover:bg-slate-100 transition-colors cursor-pointer mb-6 group">
                      {videoFile ? (
                          <div className="relative w-full h-full p-2">
                              <img src={URL.createObjectURL(videoFile)} className="w-full h-full object-contain rounded-lg" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                  <p className="text-white font-bold text-sm">Trocar Imagem</p>
                              </div>
                          </div>
                      ) : (
                          <>
                            <Upload size={32} className="text-indigo-500 mb-3" />
                            <p className="font-bold text-slate-700">Clique para fazer upload</p>
                            <p className="text-xs text-slate-400">PNG, JPG (Max 5MB)</p>
                          </>
                      )}
                      <input type="file" accept="image/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>

                  <div className="mb-6">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Comportamento / Prompt</label>
                      <textarea 
                        value={videoPrompt}
                        onChange={e => setVideoPrompt(e.target.value)}
                        placeholder="Ex: Personagem falando calmamente, piscando os olhos, iluminação natural..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24 text-sm"
                      />
                  </div>

                  <button 
                    onClick={handleCreateVideo}
                    disabled={loading || !videoFile}
                    className="w-full bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-slate-800 transition-colors"
                  >
                      {loading ? <Loader2 className="animate-spin"/> : <Video size={18} />}
                      Gerar Vídeo
                  </button>
              </div>
          </div>
      )}

      {/* --- MODAL: CREATE VOICE --- */}
      {showVoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative">
                  <button onClick={() => setShowVoiceModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  
                  <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                          <Mic size={20} />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">Criar Nova Voz</h2>
                  </div>

                  <div className="space-y-4 mb-6">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Voz</label>
                          <input 
                            value={voiceName}
                            onChange={e => setVoiceName(e.target.value)}
                            placeholder="Ex: Narrador Corporativo"
                            className="w-full border border-slate-200 rounded-lg p-3 font-bold text-slate-900 outline-none focus:border-indigo-500"
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Voz Base (Gemini Model)</label>
                          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                              {GEMINI_VOICES.map(voice => (
                                  <button
                                    key={voice.id}
                                    onClick={() => setSelectedBaseVoice(voice.id)}
                                    className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 ${
                                        selectedBaseVoice === voice.id 
                                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                                        : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                  >
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${voice.color}`}>
                                          {voice.id[0]}
                                      </div>
                                      <div>
                                          <p className="text-xs font-bold text-slate-800">{voice.label}</p>
                                          <p className="text-[9px] text-slate-500">{voice.gender}</p>
                                      </div>
                                      {selectedBaseVoice === voice.id && <CheckCircle2 size={14} className="ml-auto text-indigo-600"/>}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Texto de Teste</label>
                          <textarea 
                            value={voiceText}
                            onChange={e => setVoiceText(e.target.value)}
                            placeholder="O que você quer que esta voz diga?"
                            className="w-full border border-slate-200 rounded-lg p-3 h-24 resize-none text-sm outline-none focus:border-indigo-500"
                          />
                      </div>
                  </div>

                  <button 
                    onClick={handleCreateVoice}
                    disabled={loading || !voiceName || !voiceText}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                  >
                      {loading ? <Loader2 className="animate-spin"/> : <AudioLines size={18} />}
                      Gerar e Salvar Voz
                  </button>
              </div>
          </div>
      )}

    </div>
  );
};

export default Avatars;