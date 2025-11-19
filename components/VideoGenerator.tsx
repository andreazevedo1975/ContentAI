import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateVideo, detectVoicePersona } from '../services/geminiService';
import { 
  Loader2, 
  Plus, 
  Settings2, 
  ChevronRight, 
  Film, 
  Image as ImageIcon, 
  User, 
  Scissors, 
  Eraser, 
  X,
  Wallpaper,
  Mic,
  Type,
  Sparkles,
  Clock,
  Volume2,
  Music,
  Heart,
  Zap,
  Baby,
  Smile,
  Cat,
  Wand2,
  Share2,
  Check,
  Link as LinkIcon,
  Facebook,
  Linkedin,
  Twitter
} from 'lucide-react';

// --- Constants ---

const PREDEFINED_VOICES = [
  { id: 'Auto', label: 'Automático (Baseado em Gênero/Idade)' },
  { id: 'Kore', label: 'Kore (Fem - Calma)' },
  { id: 'Puck', label: 'Puck (Masc - Clara)' },
  { id: 'Charon', label: 'Charon (Masc - Grave)' },
  { id: 'Fenrir', label: 'Fenrir (Masc - Profunda)' },
  { id: 'Zephyr', label: 'Zephyr (Fem - Enérgica)' },
];

const VOICE_EMOTIONS_PRESETS = [
    { label: 'Alegria (Joyful)', prompt: 'cheerful, happy, smiling tone' },
    { label: 'Tristeza (Sad)', prompt: 'melancholic, sad, slower pace, lower pitch' },
    { label: 'Tensão (Tense)', prompt: 'tense, suspenseful, whispery, fast paced' },
    { label: 'Reflexão (Reflective)', prompt: 'thoughtful, slow, calm, philosophical tone' },
    { label: 'Entusiasmo (Excited)', prompt: 'excited, high energy, loud, fast paced' },
    { label: 'Profissional (Pro)', prompt: 'professional, clear, authoritative, news anchor style' }
];

// --- Components for this page ---

const QuickActionPill: React.FC<{ icon?: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 bg-white/80 border border-white rounded-full text-sm font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white transition-all whitespace-nowrap shadow-sm backdrop-blur-sm"
  >
    {icon}
    {label}
  </button>
);

const ToolCard: React.FC<{ icon: React.ReactNode; title: string; color: string; onClick: () => void }> = ({ icon, title, color, onClick }) => (
  <button 
    onClick={onClick}
    className="glass-card flex items-center gap-4 p-4 rounded-xl transition-all text-left group w-full hover:shadow-md"
  >
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <span className="font-bold text-slate-700 group-hover:text-slate-900">{title}</span>
  </button>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; activeColor?: string }> = ({ active, onClick, icon, label, activeColor = "border-indigo-600 text-indigo-600 bg-indigo-50/50" }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all border-b-2 ${
      active 
        ? activeColor
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
    }`}
  >
    {icon}
    {label}
  </button>
);

const VideoGenerator: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for Prompts
  const [activeTab, setActiveTab] = useState<'main' | 'background' | 'avatar'>('main');
  const [mainPrompt, setMainPrompt] = useState('');
  const [bgPrompt, setBgPrompt] = useState('');

  // Other State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [durationMode, setDurationMode] = useState<'auto' | 'short' | 'long'>('auto');
  
  // Mode: false = High Quality, true = Lite (Fast/Preview)
  const [isLiteMode, setIsLiteMode] = useState(false);
  
  // Voice Dictation State
  const [isListening, setIsListening] = useState(false);

  // Voice Settings State (Updated)
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'MALE' | 'FEMALE' | 'MASCOT'>('FEMALE');
  const [voiceAge, setVoiceAge] = useState<'ADULT' | 'CHILD'>('ADULT');
  const [voiceStyle, setVoiceStyle] = useState(''); // Custom text for emotion/tone
  
  // NEW: Specific Voice Selector
  const [specificVoiceId, setSpecificVoiceId] = useState('Auto');

  // Voice/Persona Detection State (Auto)
  const [voiceAnalysis, setVoiceAnalysis] = useState<{ label: string; voicePrompt: string; type: string } | null>(null);
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);

  // Share Menu State
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Handle incoming navigation state
  useEffect(() => {
    if (location.state) {
      const state = location.state as { mode?: string; prompt?: string };
      
      if (state.mode === 'background') {
          setActiveTab('background');
          if (state.prompt) setBgPrompt(state.prompt);
      } else if (state.mode === 'avatar' || state.mode === 'talking_photo') {
          setActiveTab('avatar');
          if (state.prompt) setMainPrompt(state.prompt);
      } else {
          setActiveTab('main');
          if (state.prompt) setMainPrompt(state.prompt);
      }

      if (state.mode) {
        switch(state.mode) {
            case 'marketing':
                setMainPrompt(prev => prev || "Vídeo promocional de marketing cinematográfico para...");
                break;
            case 'avatar':
                setMainPrompt(prev => prev || "Personagem falando para a câmera, estilo avatar realista...");
                setShowVoiceSettings(true);
                break;
            case 'talking_photo':
                setMainPrompt(prev => prev || "Anime esta foto para que o personagem fale naturalmente...");
                setShowVoiceSettings(true);
                setIsLiteMode(true);
                setTimeout(() => fileInputRef.current?.click(), 500);
                break;
            case 'showcase':
                setMainPrompt(prev => prev || "Showcase de produto girando em 360 graus, iluminação de estúdio...");
                break;
        }
      }
    }
  }, [location.state]);

  // UI Helper to switch gender and reset specific dropdown to Auto (to ensure manual choice wins)
  const setGenderAndResetSpecific = (g: 'MALE' | 'FEMALE' | 'MASCOT') => {
      setVoiceGender(g);
      setSpecificVoiceId('Auto');
  };

  const handleDictation = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Seu navegador não suporta reconhecimento de voz.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (activeTab === 'main' || activeTab === 'avatar') {
          setMainPrompt(prev => prev + (prev ? ' ' : '') + transcript);
      } else {
          setBgPrompt(prev => prev + (prev ? ' ' : '') + transcript);
      }
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        setPreviewUrl(result);

        const isTalkingContext = (activeTab === 'main' || activeTab === 'avatar') && 
          (mainPrompt.toLowerCase().includes('fale') || 
           mainPrompt.toLowerCase().includes('talk') || 
           mainPrompt.toLowerCase().includes('avatar') || 
           mainPrompt.toLowerCase().includes('foto') ||
           activeTab === 'avatar');

        if (isTalkingContext) { 
           setIsAnalyzingVoice(true);
           // Auto-enable Lite mode for talking photos usually, but user can override
           if (activeTab === 'avatar') setIsLiteMode(true);
           
           const base64 = result.split(',')[1];
           try {
             const analysis = await detectVoicePersona(base64);
             setVoiceAnalysis(analysis);
             
             if (analysis.type === 'MALE') { setGenderAndResetSpecific('MALE'); setVoiceAge('ADULT'); }
             else if (analysis.type === 'FEMALE') { setGenderAndResetSpecific('FEMALE'); setVoiceAge('ADULT'); }
             else if (analysis.type === 'CHILD') { setVoiceAge('CHILD'); }
             else if (analysis.type === 'CUTE_ANIMAL') { setGenderAndResetSpecific('MASCOT'); }
             
           } catch (error) {
             console.error("Voice detection failed", error);
           } finally {
             setIsAnalyzingVoice(false);
           }
           
           // Auto-open settings if in avatar mode
           if (activeTab === 'avatar') setShowVoiceSettings(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setVoiceAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ROBUST VOICE MAPPING FUNCTION
  const getVoiceFromSettings = () => {
    // Priority 1: Specific Selection (if user manually chose from dropdown)
    if (specificVoiceId !== 'Auto') return specificVoiceId;

    // Priority 2: Auto Logic based on Buttons
    if (voiceGender === 'MASCOT') {
        if (voiceAge === 'ADULT') return 'Puck'; // Male mascot (using Puck as base)
        return 'Zephyr'; // Female/Cute mascot
    }

    if (voiceAge === 'CHILD') {
        if (voiceGender === 'MALE') return 'Puck'; // Boy (Puck + prompts)
        return 'Zephyr'; // Girl (Zephyr is naturally higher pitched)
    }
    
    // Adult Logic
    if (voiceGender === 'MALE') return 'Fenrir'; // Fenrir is Deep/Male. Puck is softer.
    return 'Kore'; // Kore is Female.
  };

  const handleAudioPreview = async () => {
    const text = (activeTab === 'main' || activeTab === 'avatar') ? mainPrompt : bgPrompt;
    if (!text) {
        alert("Digite algum texto para ouvir o exemplo.");
        return;
    }
    
    try {
        // Dynamically get the voice based on current UI state
        let voice = getVoiceFromSettings();
        console.log("Generating preview with voice:", voice);
        
        const base64 = await import('../services/geminiService').then(m => m.generateSpeech(text, voice));
        const { decodeBase64, pcmToWav } = await import('../services/audioUtils');
        
        const pcm = decodeBase64(base64);
        const wav = pcmToWav(pcm, 24000, 1);
        const url = URL.createObjectURL(wav);
        const audio = new Audio(url);
        audio.play();
    } catch (e) {
        console.error(e);
        alert("Erro ao gerar prévia de áudio. Verifique sua chave API.");
    }
  };

  const handleGenerate = async () => {
    const currentPrompt = (activeTab === 'main' || activeTab === 'avatar') ? mainPrompt : bgPrompt;

    if (!currentPrompt && !selectedFile) return;
    
    setIsGenerating(true);
    setGeneratedVideo(null);

    try {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey && window.aistudio.openSelectKey) {
            await window.aistudio.openSelectKey();
        }
      }

      let imageBase64 = undefined;
      if (previewUrl) {
        imageBase64 = previewUrl.split(',')[1];
      }

      const wordCount = currentPrompt.split(/\s+/).length;
      const isLongText = wordCount > 20;
      const shouldBeLong = durationMode === 'long' || (durationMode === 'auto' && isLongText);
      
      const modelId = (isLiteMode && !shouldBeLong) ? 'veo-3.1-fast-generate-preview' : 'veo-3.1-generate-preview';

      let finalPrompt = currentPrompt;
      
      if ((activeTab === 'main' || activeTab === 'avatar') && bgPrompt) {
           finalPrompt += `. Visual Background Context: ${bgPrompt}`;
      }
      
      if (activeTab === 'background' && !currentPrompt.toLowerCase().includes('background')) {
          finalPrompt = `Background video, abstract, looping, cinematic, no text, ${currentPrompt}`;
      }

      if (activeTab === 'avatar') {
          finalPrompt += ". Talking avatar style, focus on facial animation, lip sync with audio, natural movements.";
      }

      if (shouldBeLong) {
          finalPrompt += ". Generate a long take, continuous movement, extend duration to match narration.";
      } else if (durationMode === 'short') {
          finalPrompt += ". Short, concise clip.";
      }

      // Audio/Voice Logic
      const needsAudio = activeTab === 'avatar' || ((activeTab === 'main') && (mainPrompt.includes('fale') || mainPrompt.includes('say') || showVoiceSettings));
      
      if (needsAudio) {
          let voiceDescr = "";
          let baseModel = getVoiceFromSettings(); // This now returns Fenrir for Male, Kore for Female, etc.

          // Build Description based on Gender/Age if in Auto mode, otherwise trust the specific voice name
          if (specificVoiceId === 'Auto') {
              if (voiceGender === 'MASCOT') {
                 if (voiceAge === 'ADULT') {
                     voiceDescr = "MALE MASCOT VOICE, funny cartoon character, energetic, slightly deeper but playful tone";
                 } else {
                     voiceDescr = "HIGH-PITCHED, squeaky, cute talking animal voice, happy and smiling tone, cartoon character style";
                 }
              } else {
                 const genderStr = voiceGender === 'MALE' ? 'MALE VOICE' : 'FEMALE VOICE';
                 const ageStr = voiceAge === 'ADULT' ? 'ADULT' : 'CHILD/YOUNG';
                 
                 voiceDescr = `${ageStr} ${genderStr}`;
                 
                 if (voiceAge === 'CHILD') {
                     voiceDescr += ", energetic, young tone, kid voice";
                 }
                 if (voiceGender === 'MALE') {
                     voiceDescr += ", deep tone, resonant, authoritative";
                 }
              }
          } else {
              voiceDescr = `Character voice strictly using base model ${specificVoiceId}`;
          }
          
          if (voiceStyle) {
              voiceDescr += `, specific tone: ${voiceStyle}`;
          }

          finalPrompt += `. AUDIO STYLE STRICTLY DEFINED AS: ${voiceDescr} (Base Model: ${baseModel}).`;
      }


      const videoUri = await generateVideo(finalPrompt, imageBase64, modelId);
      setGeneratedVideo(videoUri);

    } catch (error) {
      console.error(error);
      alert("Erro ao gerar vídeo. Verifique a chave API e tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
      if (generatedVideo) {
          navigator.clipboard.writeText(generatedVideo);
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
      }
  };

  const currentPromptValue = (activeTab === 'main' || activeTab === 'avatar') ? mainPrompt : bgPrompt;
  const setCurrentPromptValue = (val: string) => (activeTab === 'main' || activeTab === 'avatar') ? setMainPrompt(val) : setBgPrompt(val);

  const getDurationLabel = () => {
      switch(durationMode) {
          case 'long': return 'Longa';
          case 'short': return 'Curta';
          default: return 'Auto';
      }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto pb-24 animate-fade-in">
      
      <div className="text-center mb-10 mt-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 font-display">Vídeo & Motion</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">Transforme texto e imagens em vídeos de alta qualidade com a potência do Veo 3.1.</p>
      </div>

      {/* Main Input Area */}
      <div className="max-w-4xl mx-auto relative z-10">
        <div className={`glass-card rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/5 ring-1 ring-black/5 transition-all ${activeTab === 'background' ? 'border-teal-200 ring-teal-50' : 'border-white'}`}>
            
            <div className="flex border-b border-slate-100/50 bg-white/30">
                <TabButton 
                    active={activeTab === 'main'} 
                    onClick={() => setActiveTab('main')} 
                    icon={<Film size={16} />} 
                    label="Conteúdo Principal"
                />
                <TabButton 
                    active={activeTab === 'avatar'} 
                    onClick={() => setActiveTab('avatar')} 
                    icon={<User size={16} />} 
                    label="Avatar & Foto Falante"
                    activeColor="border-purple-600 text-purple-600 bg-purple-50/50"
                />
                <TabButton 
                    active={activeTab === 'background'} 
                    onClick={() => setActiveTab('background')} 
                    icon={<Wallpaper size={16} />} 
                    label="Somente Fundo"
                    activeColor="border-teal-500 text-teal-600 bg-teal-50/50"
                />
            </div>

            <div className="p-6">
                <div className="relative">
                    <textarea
                        value={currentPromptValue}
                        onChange={(e) => setCurrentPromptValue(e.target.value)}
                        placeholder={
                            activeTab === 'avatar'
                            ? "Digite o roteiro que o avatar deve falar e descreva o comportamento (ex: sorrindo, acenando)..."
                            : activeTab === 'background'
                            ? "Descreva a textura, o ambiente ou o loop abstrato para o fundo..."
                            : "Descreva a história, o personagem ou o roteiro principal..."
                        }
                        className="w-full min-h-[120px] max-h-[200px] resize-none outline-none text-slate-700 placeholder:text-slate-400 text-xl bg-transparent p-2 pr-12 font-medium"
                    />
                    
                    <button 
                        onClick={handleDictation}
                        className={`absolute top-2 right-2 p-3 rounded-xl transition-all ${isListening ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-white/50 text-slate-400 hover:text-indigo-600 shadow-sm border border-white'}`}
                        title="Dictate prompt"
                    >
                        <Mic size={20} />
                    </button>
                </div>
                
                {/* Specific Voice Dropdown for Avatar Mode */}
                {activeTab === 'avatar' && (
                    <div className="mt-2 flex items-center gap-2 animate-in fade-in">
                         <div className="relative w-full max-w-xs">
                             <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-purple-600">
                                 <User size={14} />
                             </div>
                             <select
                                value={specificVoiceId}
                                onChange={(e) => setSpecificVoiceId(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 bg-purple-50/50 border border-purple-100 rounded-lg text-xs font-bold text-purple-800 focus:ring-2 focus:ring-purple-500 outline-none appearance-none cursor-pointer"
                             >
                                {PREDEFINED_VOICES.map(v => (
                                    <option key={v.id} value={v.id}>{v.label}</option>
                                ))}
                             </select>
                             <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-purple-400">
                                 <ChevronRight size={12} className="rotate-90" />
                             </div>
                         </div>
                         <span className="text-[10px] text-slate-400 font-medium">Selecione a voz do avatar</span>
                    </div>
                )}

                {/* Secondary Prompt Input for Main/Avatar Modes */}
                {(activeTab === 'main' || activeTab === 'avatar') && (
                    <div className="mt-6 pt-4 border-t border-slate-100/50 animate-in fade-in slide-in-from-top-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-teal-600 uppercase mb-2 tracking-wider">
                             <Wallpaper size={12} /> Prompt para Vídeo de Fundo (Veo)
                        </label>
                        <div className="relative">
                            <textarea
                                value={bgPrompt}
                                onChange={(e) => setBgPrompt(e.target.value)}
                                placeholder="Descreva o cenário de fundo que o Veo deve gerar (ex: Escritório futurista, Praia ao pôr do sol)..."
                                className="w-full h-20 bg-teal-50/30 border border-teal-100/50 rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none"
                            />
                            <button 
                                onClick={() => setBgPrompt(prev => (prev ? prev + ", " : "") + "cinematic background, 4k, ambient lighting, no people")}
                                className="absolute bottom-2 right-2 text-[10px] font-bold text-teal-600 bg-white px-2 py-1 rounded border border-teal-100 hover:bg-teal-50 flex items-center gap-1 transition-colors shadow-sm"
                            >
                                <Sparkles size={10}/> Otimizar Fundo
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'background' && (
                    <div className="flex justify-end mt-2">
                         <button 
                            onClick={() => setBgPrompt(prev => (prev ? prev + ", " : "") + "seamless loop, 4k, cinematic lighting, abstract texture, no people")}
                            className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded border border-teal-100 hover:bg-teal-100 flex items-center gap-1 transition-colors"
                        >
                            <Sparkles size={10}/> Otimizar para Fundo
                        </button>
                    </div>
                )}

                {/* File Preview & Avatar Specific UI */}
                {previewUrl && (
                    <div className="flex flex-wrap gap-2 mb-6 mx-2 mt-6">
                        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100 shadow-sm">
                            <ImageIcon size={18} />
                            <span className="text-sm font-bold max-w-[200px] truncate">{selectedFile?.name}</span>
                            <button onClick={handleRemoveFile} className="hover:text-indigo-900 bg-indigo-200/50 rounded-full p-1"><X size={12}/></button>
                        </div>

                        {isAnalyzingVoice ? (
                           <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl border border-amber-100 animate-pulse">
                              <Loader2 size={14} className="animate-spin"/>
                              <span className="text-sm font-bold">Detectando voz...</span>
                           </div>
                        ) : voiceAnalysis ? (
                           <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
                              <Sparkles size={16} className="fill-emerald-200"/>
                              <span className="text-sm font-bold">Sugerido: {voiceAnalysis.label}</span>
                           </div>
                        ) : null}
                    </div>
                )}
                
                {/* Dedicated Avatar Upload CTA if in Avatar mode and no file */}
                {activeTab === 'avatar' && !previewUrl && (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4 border-2 border-dashed border-purple-200 bg-purple-50/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-purple-500 shadow-sm mb-2 group-hover:scale-110 transition-transform">
                            <User size={24}/>
                        </div>
                        <p className="text-sm font-bold text-purple-900">Upload Foto do Avatar (Opcional)</p>
                        <p className="text-xs text-purple-500">Se não enviar, a IA criará um personagem baseado no roteiro.</p>
                    </div>
                )}

                {/* Voice Settings Panel - Auto shown in Avatar mode or toggled */}
                {(showVoiceSettings || activeTab === 'avatar') && (
                  <div className="mt-6 p-5 bg-slate-50/80 backdrop-blur-sm rounded-2xl border border-slate-200 animate-in slide-in-from-top-2">
                      <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                            <Volume2 size={14} /> Configurações Detalhadas de Voz
                          </h4>
                          <div className="flex items-center gap-2">
                             <button 
                                onClick={handleAudioPreview}
                                className="text-xs font-bold text-indigo-600 flex items-center gap-1 bg-white border border-indigo-100 px-3 py-1.5 rounded-lg hover:shadow-sm transition-all"
                             >
                                <Music size={12}/> Ouvir Exemplo
                             </button>
                             {activeTab !== 'avatar' && (
                                 <button onClick={() => setShowVoiceSettings(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-lg"><X size={14}/></button>
                             )}
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                              <label className="text-xs font-semibold text-slate-700 mb-2 block">Tipo de Voz</label>
                              <div className="flex bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm">
                                  <button
                                      onClick={() => setGenderAndResetSpecific('FEMALE')}
                                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                          voiceGender === 'FEMALE' ? 'bg-pink-100 text-pink-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                      }`}
                                  >
                                      Feminino
                                  </button>
                                  <button
                                      onClick={() => setGenderAndResetSpecific('MALE')}
                                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                          voiceGender === 'MALE' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                      }`}
                                  >
                                      Masculino
                                  </button>
                                  <button
                                      onClick={() => setGenderAndResetSpecific('MASCOT')}
                                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                          voiceGender === 'MASCOT' ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                      }`}
                                  >
                                      <Cat size={12} className="inline mr-1"/> Mascote
                                  </button>
                              </div>
                          </div>
                          
                          {/* AGE / VARIATION SELECTOR */}
                          <div>
                              <label className="text-xs font-semibold text-slate-700 mb-2 block">
                                  {voiceGender === 'MASCOT' ? 'Estilo do Mascote' : 'Idade'}
                              </label>
                              <div className="flex bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm">
                                  {voiceGender === 'MASCOT' ? (
                                      <>
                                        <button
                                            onClick={() => setVoiceAge('CHILD')}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                                voiceAge === 'CHILD' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                        >
                                            <Smile size={12} className="inline mr-1"/> Fofo (Padrão)
                                        </button>
                                        <button
                                            onClick={() => setVoiceAge('ADULT')}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                                voiceAge === 'ADULT' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                        >
                                            <Zap size={12} className="inline mr-1"/> Masculino
                                        </button>
                                      </>
                                  ) : (
                                      <>
                                        <button
                                            onClick={() => setVoiceAge('ADULT')}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                                voiceAge === 'ADULT' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                        >
                                            <User size={12} className="inline mr-1"/> Adulto
                                        </button>
                                        <button
                                            onClick={() => setVoiceAge('CHILD')}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                                voiceAge === 'CHILD' ? 'bg-teal-100 text-teal-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                        >
                                            <Baby size={12} className="inline mr-1"/> Criança
                                        </button>
                                      </>
                                  )}
                              </div>
                          </div>
                      </div>
                      
                       {/* EMOTIONS SECTION */}
                      <div className="mb-4">
                          <label className="text-xs font-semibold text-slate-700 mb-2 block flex items-center gap-1">
                             <Heart size={10}/> Emoção e Atmosfera
                          </label>
                          <div className="flex flex-wrap gap-2">
                              {VOICE_EMOTIONS_PRESETS.map((preset, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setVoiceStyle(prev => `${prev ? prev + ', ' : ''}${preset.prompt}`)}
                                    className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-transparent transition-colors"
                                  >
                                      {preset.label}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-semibold text-slate-700 mb-2 block flex items-center gap-1">
                               Personalização Livre
                          </label>
                          
                          <input
                               type="text"
                               value={voiceStyle}
                               onChange={(e) => setVoiceStyle(e.target.value)}
                               placeholder={voiceGender === 'MASCOT' ? "Ex: Voz de Quokka sorridente, muito fofo..." : "Ex: Voz rouca e sussurrada, tom muito alegre..."}
                               className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                          />

                          {voiceGender === 'MASCOT' && (
                             <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
                                {['Estilo Quokka (Feliz)', 'Voz de Hélio', 'Robótico Fofo', 'Tagarela', 'Risadinha', 'Sussurro Fofo'].map(tag => (
                                    <button 
                                      key={tag} 
                                      onClick={() => setVoiceStyle(prev => prev ? prev + ", " + tag : tag)}
                                      className="text-[10px] font-bold px-2 py-1 bg-orange-50 text-orange-600 border border-orange-100 rounded-lg hover:bg-orange-100 whitespace-nowrap flex items-center gap-1"
                                    >
                                        <Wand2 size={10}/> {tag}
                                    </button>
                                ))}
                             </div>
                          )}
                      </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 pt-4 border-t border-slate-100/50">
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar px-1 pb-1">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-10 h-10 flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 rounded-full text-indigo-600 transition-colors shrink-0 border border-indigo-200"
                            title="Adicionar Mídia"
                        >
                            <Plus size={20} />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

                        <button
                            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shrink-0 border ${showVoiceSettings ? 'bg-indigo-100 border-indigo-300 text-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            title="Configurar Voz"
                        >
                            <Volume2 size={18} />
                        </button>

                        <div className="h-6 w-px bg-slate-200 mx-2 shrink-0"></div>

                        <button 
                            onClick={() => setIsLiteMode(!isLiteMode)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap border ${
                                isLiteMode ? 'bg-amber-100 text-amber-700 border-amber-300 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {isLiteMode ? <Zap size={16} className="fill-amber-700"/> : <Settings2 size={16} />}
                            {isLiteMode ? 'Preview' : 'Pro'}
                        </button>

                        <button 
                            onClick={() => {
                                setActiveTab('background');
                                if (!bgPrompt) setBgPrompt("Abstract background, cinematic lighting, 4k loop...");
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap border ${
                                activeTab === 'background' ? 'bg-teal-100 text-teal-700 border-teal-300 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <Wallpaper size={16} />
                            Fundo
                        </button>

                        <div className="flex items-center gap-2 bg-slate-100 rounded-full p-1 border border-slate-200">
                            <button 
                                onClick={() => setAspectRatio(aspectRatio === '16:9' ? '9:16' : '16:9')}
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-slate-600 hover:text-indigo-600"
                                title="Aspect Ratio"
                            >
                                <Settings2 size={14} className="rotate-90"/>
                            </button>
                            <span className="text-[10px] font-bold text-slate-400 px-1">{aspectRatio}</span>

                            <div className="w-px h-4 bg-slate-300 mx-1"></div>

                            <button 
                                onClick={() => setDurationMode(prev => prev === 'auto' ? 'long' : prev === 'long' ? 'short' : 'auto')}
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-slate-600 hover:text-indigo-600"
                                title="Duração"
                            >
                                <Clock size={14} />
                            </button>
                            <span className="text-[10px] font-bold text-slate-400 px-1 min-w-[30px] text-center">{getDurationLabel()}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || (!currentPromptValue && !selectedFile)}
                        className={`w-full sm:w-auto font-bold px-8 py-3 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0.5 ${
                            activeTab === 'main' 
                                ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white' 
                                : activeTab === 'avatar'
                                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white'
                                : 'bg-gradient-to-r from-teal-600 to-teal-500 text-white'
                        }`}
                    >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : (
                            activeTab === 'background' 
                                ? "Gerar Fundo" 
                                : activeTab === 'avatar'
                                ? "Gerar Avatar"
                                : isLiteMode 
                                    ? "Gerar Preview (Rápido)" 
                                    : "Gerar Vídeo (Pro)"
                        )}
                    </button>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-3 mt-8 overflow-x-auto pb-4 mask-linear-fade pl-2">
            <QuickActionPill 
                icon={<img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" className="w-4 h-4" alt="tiktok"/>}
                label="TikTok Viral" 
                onClick={() => {
                    setActiveTab('main');
                    setMainPrompt("Vídeo dinâmico e viral para TikTok, estilo rápido, sobre um novo produto de tecnologia...");
                }}
            />
            <QuickActionPill 
                icon={<Type size={14} />}
                label="Promo Escolar" 
                onClick={() => {
                    setActiveTab('main');
                    setMainPrompt("Comercial promocional de volta às aulas mostrando mochilas e cadernos em ambiente escolar brilhante...");
                }}
            />
             <QuickActionPill 
                icon={<Wallpaper size={14} />}
                label="Fundo Abstrato" 
                onClick={() => {
                    setActiveTab('background');
                    setBgPrompt("Vídeo de fundo abstrato 4k, movimento líquido suave, cores pastéis, relaxante, sem pessoas, loop infinito...");
                }}
            />
             <button className="w-8 h-8 flex items-center justify-center bg-white/60 border border-white rounded-full shadow-sm shrink-0 hover:bg-white backdrop-blur-sm">
                <ChevronRight size={16} className="text-slate-500" />
            </button>
        </div>
      </div>

      {generatedVideo && (
        <div className="max-w-4xl mx-auto mt-12 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Film size={20} className="text-white"/>
                     </div>
                     <h2 className="text-2xl font-bold text-slate-900">Resultado Final</h2>
                 </div>
                 
                 <div className="relative">
                     <button 
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                     >
                        <Share2 size={16} /> Compartilhar
                     </button>
                     
                     {showShareMenu && (
                         <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                             <div className="flex gap-2 mb-3">
                                <button className="flex-1 bg-slate-900 text-white p-2 rounded-lg flex justify-center hover:bg-slate-800" title="Twitter/X"><Twitter size={16}/></button>
                                <button className="flex-1 bg-blue-600 text-white p-2 rounded-lg flex justify-center hover:bg-blue-700" title="Facebook"><Facebook size={16}/></button>
                                <button className="flex-1 bg-blue-700 text-white p-2 rounded-lg flex justify-center hover:bg-blue-800" title="LinkedIn"><Linkedin size={16}/></button>
                             </div>
                             <div className="h-px bg-slate-100 mb-3"></div>
                             <button 
                                onClick={handleCopyLink}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-600 transition-colors"
                             >
                                {linkCopied ? <Check size={16} className="text-green-500"/> : <LinkIcon size={16}/>}
                                {linkCopied ? "Link Copiado!" : "Copiar Link do Vídeo"}
                             </button>
                         </div>
                     )}
                 </div>
            </div>
            
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-900/20 aspect-video relative group ring-4 ring-white">
                 <video src={generatedVideo} controls autoPlay loop className="w-full h-full object-contain" />
            </div>
            <div className="mt-6 flex justify-center">
                 <a href={generatedVideo} download="video-gerado.mp4" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                    Baixar Vídeo
                 </a>
            </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto mt-20">
        <div className="text-center mb-10">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Atalhos de Criação</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <ToolCard 
                icon={<User size={24}/>} 
                title="Vídeo de Avatar" 
                color="bg-purple-500"
                onClick={() => {
                    setActiveTab('avatar');
                    setMainPrompt("Avatar realista falando diretamente para a câmera, ambiente de escritório moderno...");
                    setShowVoiceSettings(true);
                }}
            />
            <ToolCard 
                icon={<User size={24}/>} 
                title="Foto Falante" 
                color="bg-indigo-500"
                onClick={() => {
                    setActiveTab('avatar');
                    setMainPrompt("Anime esta foto para que o rosto se mova e fale naturalmente...");
                    setShowVoiceSettings(true);
                    setIsLiteMode(true);
                    setTimeout(() => fileInputRef.current?.click(), 500);
                }}
            />
             <ToolCard 
                icon={<Wallpaper size={24}/>} 
                title="Vídeo de Fundo" 
                color="bg-teal-500"
                onClick={() => {
                    setActiveTab('background');
                    setBgPrompt("Vídeo de fundo 4k, textura animada 3D, minimalista, cores suaves, iluminação cinemática, sem texto, loop...");
                }}
            />
            <ToolCard 
                icon={<Film size={24}/>} 
                title="Vitrine 360º" 
                color="bg-pink-500"
                onClick={() => {
                    setActiveTab('main');
                    setMainPrompt("Vídeo cinematográfico de produto girando, iluminação dramática, alta resolução...");
                }}
            />
            <ToolCard 
                icon={<Eraser size={24}/>} 
                title="Remover Fundo" 
                color="bg-blue-500"
                onClick={() => {
                    navigate('/image', { state: { mode: 'design', prompt: 'Remove background, isolate object on white studio background...' } });
                }}
            />
            <ToolCard 
                icon={<Scissors size={24}/>} 
                title="Corte Rápido" 
                color="bg-orange-500"
                onClick={() => {
                    setActiveTab('main');
                    setMainPrompt("Fast paced video montage, quick cuts, dynamic transitions, action style...");
                }}
            />
        </div>
      </div>

    </div>
  );
};

export default VideoGenerator;