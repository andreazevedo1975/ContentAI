
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateVideo, detectVoicePersona, enhanceVideoPrompt } from '../services/geminiService';
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
  Twitter,
  Monitor,
  Aperture,
  Captions,
  UploadCloud
} from 'lucide-react';

// ... Constants ...

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

// ... Components for this page ...

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
  
  // Audio Sync Refs
  const musicInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const lastVideoTimeRef = useRef(0);
  
  // State for Prompts
  const [activeTab, setActiveTab] = useState<'main' | 'background' | 'avatar'>('main');
  const [mainPrompt, setMainPrompt] = useState('');
  const [bgPrompt, setBgPrompt] = useState('');

  // Other State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Music Upload State
  const [bgMusicFile, setBgMusicFile] = useState<File | null>(null);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [bgMusicVolume, setBgMusicVolume] = useState(0.2);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [durationMode, setDurationMode] = useState<'auto' | 'short' | 'long'>('auto');
  
  // NEW: Resolution and FPS
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4k'>('720p');
  const [fps, setFps] = useState<'24' | '30' | '60'>('30');

  // Mode: false = High Quality, true = Lite (Fast/Preview)
  const [isLiteMode, setIsLiteMode] = useState(false);
  
  // Voice Dictation State
  const [isListening, setIsListening] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Voice Settings State (Updated)
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'MALE' | 'FEMALE' | 'MASCOT' | 'NONE'>('FEMALE');
  const [voiceAge, setVoiceAge] = useState<'ADULT' | 'CHILD'>('ADULT');
  const [voiceStyle, setVoiceStyle] = useState(''); // Custom text for emotion/tone
  
  // NEW: Specific Voice Selector
  const [specificVoiceId, setSpecificVoiceId] = useState('Auto');

  // New Voice Settings: Pitch and Speed
  const [voicePitch, setVoicePitch] = useState(0); // -20 to 20
  const [voiceSpeed, setVoiceSpeed] = useState(1.0); // 0.5 to 2.0

  // Voice/Persona Detection State (Auto)
  const [voiceAnalysis, setVoiceAnalysis] = useState<{ label: string; voicePrompt: string; type: string } | null>(null);
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);
  
  // Captions
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [captionsLanguage, setCaptionsLanguage] = useState('pt-BR');
  
  // Avatar Facial Animation
  const [facialExpressiveness, setFacialExpressiveness] = useState('default'); // default, happy, serious, surprised
  const [headMovement, setHeadMovement] = useState(false);

  // Share Menu State
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Handle incoming navigation state
  useEffect(() => {
    if (location.state) {
      const state = location.state as { mode?: string; prompt?: string; aspectRatio?: string; image?: string };
      
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

      // Handle Aspect Ratio if passed
      if (state.aspectRatio) {
          setAspectRatio(state.aspectRatio);
      }
      
      // Handle Image if passed (base64)
      if (state.image) {
          setPreviewUrl(state.image);
          // Note: state.image is data url
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

  // Object URL cleanup for music
  useEffect(() => {
    if (bgMusicFile) {
      const url = URL.createObjectURL(bgMusicFile);
      setMusicUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setMusicUrl(null);
    }
  }, [bgMusicFile]);

  // Sync Volume effect
  useEffect(() => {
    if (audioPlayerRef.current) {
        audioPlayerRef.current.volume = bgMusicVolume;
    }
  }, [bgMusicVolume, musicUrl]);

  // UI Helper to switch gender and reset specific dropdown to Auto (to ensure manual choice wins)
  const setGenderAndResetSpecific = (g: 'MALE' | 'FEMALE' | 'MASCOT' | 'NONE') => {
      setVoiceGender(g);
      setSpecificVoiceId('Auto');
      
      // Reset defaults suitable for the gender
      if (g === 'MASCOT') setVoiceAge('CHILD'); // Default mascot to cute/childlike
      else if (g !== 'NONE') setVoiceAge('ADULT');
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

  const handleEnhancePrompt = async () => {
    const current = (activeTab === 'main' || activeTab === 'avatar') ? mainPrompt : bgPrompt;
    if (!current) return;
    
    setIsEnhancing(true);
    try {
        const enhanced = await enhanceVideoPrompt(current);
        if (activeTab === 'main' || activeTab === 'avatar') {
            setMainPrompt(enhanced);
        } else {
            setBgPrompt(enhanced);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsEnhancing(false);
    }
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

  const handleMusicSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setBgMusicFile(file);
      }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setVoiceAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveMusic = () => {
    setBgMusicFile(null);
    if (musicInputRef.current) musicInputRef.current.value = '';
  };

  // ROBUST VOICE MAPPING FUNCTION
  const getVoiceFromSettings = () => {
    // Priority 1: Specific Selection (if user manually chose from dropdown)
    if (specificVoiceId !== 'Auto') return specificVoiceId;

    // Priority 2: Auto Logic based on Buttons
    if (voiceGender === 'MASCOT') {
        // "Funny (Masc)" is mapped to ADULT in the state logic for reuse.
        // Use PUCK for Male Mascot to ensure it sounds Male (Prompt will make it funny/cartoonish)
        if (voiceAge === 'ADULT') return 'Puck';
        
        // Default Cute Mascot -> Zephyr (High Pitched)
        return 'Zephyr'; 
    }

    if (voiceAge === 'CHILD') {
        // Explicitly map Child Male to Puck and Child Female to Zephyr
        if (voiceGender === 'MALE') return 'Puck'; 
        return 'Zephyr'; 
    }
    
    // Adult Logic
    // Male Adult -> Fenrir (Deep/Authoritative)
    if (voiceGender === 'MALE') return 'Fenrir'; 
    // Female Adult -> Kore (Calm)
    return 'Kore'; 
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
        // Removed specific key error message
        alert("Erro ao gerar prévia de áudio.");
    }
  };

  const handleGenerate = async () => {
    const currentPrompt = (activeTab === 'main' || activeTab === 'avatar') ? mainPrompt : bgPrompt;

    if (!currentPrompt && !selectedFile) return;
    
    setIsGenerating(true);
    setGeneratedVideo(null);

    try {
      let imageBase64 = undefined;
      let mimeType = 'image/png';
      if (previewUrl) {
        // Handle data URL (which might come from navigation state OR file upload)
        if (previewUrl.startsWith('data:')) {
            const parts = previewUrl.split(',');
            imageBase64 = parts[1];
            // Extract mime type from data url header if possible
            const match = parts[0].match(/:(.*?);/);
            if (match) mimeType = match[1];
        } else if (selectedFile) {
            // It's a file selection
            const reader = new FileReader();
            imageBase64 = await new Promise((resolve) => {
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(selectedFile);
            });
            mimeType = selectedFile.type;
        }
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
          
          // Facial Emotion
          if (facialExpressiveness === 'happy') finalPrompt += " Smiling, cheerful expression, happy eyes.";
          else if (facialExpressiveness === 'serious') finalPrompt += " Serious, professional, focused expression.";
          else if (facialExpressiveness === 'surprised') finalPrompt += " Wide eyes, surprised, dynamic eyebrows.";
          else finalPrompt += " Neutral, natural expression.";

          if (headMovement) finalPrompt += " Natural head movement, nodding, dynamic posture.";
          else finalPrompt += " Minimal head movement, steady camera.";
      }

      if (shouldBeLong) {
          finalPrompt += ". Generate a long take, continuous movement, extend duration to match narration.";
      } else if (durationMode === 'short') {
          finalPrompt += ". Short, concise clip.";
      }

      // Audio/Voice Logic
      const needsAudio = activeTab === 'avatar' || ((activeTab === 'main') && (mainPrompt.includes('fale') || mainPrompt.includes('say') || showVoiceSettings));
      
      if (needsAudio && voiceGender !== 'NONE') {
          let voiceDescr = "";
          let baseModel = getVoiceFromSettings(); 

          // Build Description based on Gender/Age if in Auto mode, otherwise trust the specific voice name
          if (specificVoiceId === 'Auto') {
              if (voiceGender === 'MASCOT') {
                 if (voiceAge === 'ADULT') {
                     // Explicit instruction for Funny Male Mascot using PUCK (Male base) but shaped by prompt
                     voiceDescr = "Funny male cartoon mascot voice, energetic, squeaky but definitely male tone, expressive, character voice, comedic timing";
                 } else {
                     // Cute Mascot (Zephyr base)
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

          // Add Pitch and Speed to prompt
          if (voicePitch !== 0) {
              const pitchDesc = voicePitch > 0 ? "high pitch" : "low pitch";
              voiceDescr += `, ${pitchDesc}`;
          }
          if (voiceSpeed !== 1.0) {
              const speedDesc = voiceSpeed > 1.0 ? "fast speaking rate" : "slow speaking rate";
              voiceDescr += `, ${speedDesc}`;
          }

          finalPrompt += `. AUDIO STYLE STRICTLY DEFINED AS: ${voiceDescr} (Base Model: ${baseModel}).`;
      }

      // Captions Logic
      if (captionsEnabled) {
          finalPrompt += `. Include auto-generated captions in ${captionsLanguage}, stylish font, bottom center placement.`;
      }
      
      // FPS Logic
      if (fps === '60') {
          finalPrompt += ", smooth motion, 60fps, high frame rate, fluid animation.";
      } else if (fps === '24') {
          finalPrompt += ", cinematic motion, 24fps, film look, traditional cinema frame rate.";
      }

      // Pass resolution AND aspectRatio to service
      const videoUri = await generateVideo(finalPrompt, imageBase64, mimeType, modelId, resolution, aspectRatio);
      setGeneratedResultVideo(videoUri);

    } catch (error) {
      console.error(error);
      // Removed specific key error message
      alert("Erro ao gerar vídeo. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Dedicated Video State for the Result View
  // Using 'generatedVideo' from the state, but we need to ensure the setter is consistent
  const setGeneratedResultVideo = (uri: string) => {
      setGeneratedVideo(uri);
      // Reset audio sync tracking
      lastVideoTimeRef.current = 0;
  };

  const handleCopyLink = () => {
      if (generatedVideo) {
          navigator.clipboard.writeText(generatedVideo);
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
      }
  };

  // --- SYNC LOGIC ---

  const handleVideoPlay = () => {
      if (audioPlayerRef.current) {
          audioPlayerRef.current.currentTime = videoPlayerRef.current?.currentTime || 0;
          audioPlayerRef.current.play().catch(e => console.error("Audio playback failed:", e));
      }
  };

  const handleVideoPause = () => {
      audioPlayerRef.current?.pause();
  };

  const handleVideoTimeUpdate = () => {
      if (!videoPlayerRef.current || !audioPlayerRef.current) return;
      
      const videoTime = videoPlayerRef.current.currentTime;
      const audioTime = audioPlayerRef.current.currentTime;
      
      // Detect Loop: If video time jumped back significantly close to 0
      if (videoTime < lastVideoTimeRef.current && videoTime < 0.5) {
          audioPlayerRef.current.currentTime = 0;
          audioPlayerRef.current.play().catch(() => {});
      }
      lastVideoTimeRef.current = videoTime;

      // Soft Sync: if drift > 0.3s, adjust. 
      // Only adjust if audio is actually playing and has duration.
      if (!audioPlayerRef.current.paused && audioPlayerRef.current.duration > 0) {
           if (Math.abs(videoTime - audioTime) > 0.3) {
               // Only seek audio if within valid range
               if (videoTime < audioPlayerRef.current.duration) {
                   audioPlayerRef.current.currentTime = videoTime;
               }
           }
      }
  };
  
  const handleVideoSeeked = () => {
      if (videoPlayerRef.current && audioPlayerRef.current) {
          const videoTime = videoPlayerRef.current.currentTime;
          if (videoTime < audioPlayerRef.current.duration) {
              audioPlayerRef.current.currentTime = videoTime;
          }
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

  // Cycle Resolution
  const cycleResolution = () => {
      if (resolution === '720p') setResolution('1080p');
      else if (resolution === '1080p') setResolution('4k');
      else setResolution('720p');
  };

  // Cycle FPS
  const cycleFps = () => {
      if (fps === '30') setFps('60');
      else if (fps === '60') setFps('24');
      else setFps('30');
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
                            ? "Descreva a textura, o ambiente ou o loop abstrato para o fundo gerado pelo Veo..."
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
                    
                    <button 
                        onClick={handleEnhancePrompt}
                        disabled={isEnhancing || !currentPromptValue}
                        className={`absolute top-2 right-14 p-3 rounded-xl transition-all border border-white/50 ${isEnhancing ? 'bg-indigo-50 text-indigo-600' : 'bg-white/50 text-slate-400 hover:text-indigo-600 hover:bg-white shadow-sm'}`}
                        title="Melhorar Prompt com IA (Câmera & Estilo)"
                    >
                        {isEnhancing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
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
                {(previewUrl || bgMusicFile) && (
                    <div className="flex flex-wrap gap-2 mb-6 mx-2 mt-6">
                        {previewUrl && (
                            <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100 shadow-sm">
                                <ImageIcon size={18} />
                                <span className="text-sm font-bold max-w-[200px] truncate">{selectedFile?.name || "Imagem Carregada"}</span>
                                <button onClick={handleRemoveFile} className="hover:text-indigo-900 bg-indigo-200/50 rounded-full p-1"><X size={12}/></button>
                            </div>
                        )}

                        {bgMusicFile && (
                            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-100 shadow-sm">
                                <Music size={18} />
                                <span className="text-sm font-bold max-w-[200px] truncate">{bgMusicFile.name}</span>
                                <button onClick={handleRemoveMusic} className="hover:text-green-900 bg-green-200/50 rounded-full p-1"><X size={12}/></button>
                            </div>
                        )}

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
                
                {/* Dedicated Avatar Upload CTA if in Avatar mode */}
                {activeTab === 'avatar' && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Avatar Image Upload Area */}
                        {!previewUrl ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-purple-200 bg-purple-50/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-all group min-h-[120px]"
                            >
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-purple-500 shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                    <User size={20}/>
                                </div>
                                <p className="text-xs font-bold text-purple-900">Upload Avatar</p>
                                <p className="text-[9px] text-purple-500 text-center">Imagem Própria</p>
                            </div>
                        ) : (
                            <div className="relative rounded-xl overflow-hidden border border-purple-200 min-h-[120px] group">
                                <img src={previewUrl} className="w-full h-full object-cover absolute inset-0"/>
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <span className="text-white text-xs font-bold flex items-center gap-1"><UploadCloud size={12}/> Trocar</span>
                                </div>
                                <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-[8px] font-bold px-2 py-0.5 rounded shadow-sm">Avatar Personalizado</div>
                            </div>
                        )}

                        {/* Music Upload (Large Box in Avatar Mode) */}
                        <div 
                            onClick={() => musicInputRef.current?.click()}
                            className={`border border-dashed rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-colors ${bgMusicFile ? 'bg-green-50 border-green-300' : 'bg-white/50 border-slate-200 hover:bg-slate-50'}`}
                        >
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bgMusicFile ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                 <Music size={18}/>
                             </div>
                             <div className="min-w-0">
                                 <p className={`text-xs font-bold truncate ${bgMusicFile ? 'text-green-700' : 'text-slate-600'}`}>
                                     {bgMusicFile ? bgMusicFile.name : "Trilha Sonora"}
                                 </p>
                                 <p className="text-[9px] text-slate-400">{bgMusicFile ? "Clique para trocar" : "MP3/WAV (Opcional)"}</p>
                             </div>
                             {bgMusicFile && (
                                 <button onClick={(e) => { e.stopPropagation(); setBgMusicFile(null); }} className="ml-auto text-slate-400 hover:text-red-500">
                                     <X size={14}/>
                                 </button>
                             )}
                        </div>
                    </div>
                )}
                
                {/* Facial Controls Row */}
                {activeTab === 'avatar' && (
                    <div className="mt-4 bg-purple-50/30 border border-purple-100 rounded-xl p-3">
                         <div className="flex items-center justify-between mb-2">
                             <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Expressão Facial</p>
                         </div>
                         <div className="flex flex-wrap gap-2">
                             {['default', 'happy', 'serious', 'surprised'].map(emotion => (
                                 <button 
                                    key={emotion}
                                    onClick={() => setFacialExpressiveness(emotion)}
                                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-colors capitalize ${facialExpressiveness === emotion ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-white text-slate-500 border-slate-200'}`}
                                 >
                                     {emotion === 'default' ? 'Natural' : emotion}
                                 </button>
                             ))}
                             <div className="w-px h-4 bg-purple-200 mx-1"></div>
                             <button 
                                onClick={() => setHeadMovement(!headMovement)}
                                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-colors ${headMovement ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-white text-slate-500 border-slate-200'}`}
                             >
                                 {headMovement ? 'Movimento Cabeça (ON)' : 'Cabeça Estática'}
                             </button>
                         </div>
                    </div>
                )}

                {/* Voice Settings Panel */}
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
                              <label className="text-xs font-semibold text-slate-700 mb-2 block">Gênero</label>
                              <div className="flex bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm overflow-x-auto">
                                  <button
                                      onClick={() => setGenderAndResetSpecific('FEMALE')}
                                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all px-2 whitespace-nowrap ${
                                          voiceGender === 'FEMALE' ? 'bg-pink-100 text-pink-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                      }`}
                                  >
                                      Feminino
                                  </button>
                                  <button
                                      onClick={() => setGenderAndResetSpecific('MALE')}
                                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all px-2 whitespace-nowrap ${
                                          voiceGender === 'MALE' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                      }`}
                                  >
                                      Masculino
                                  </button>
                                  <button
                                      onClick={() => setGenderAndResetSpecific('MASCOT')}
                                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all px-2 whitespace-nowrap ${
                                          voiceGender === 'MASCOT' ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                      }`}
                                  >
                                      <Cat size={12} className="inline mr-1"/> Mascote
                                  </button>
                                  <button
                                      onClick={() => setGenderAndResetSpecific('NONE')}
                                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all px-2 whitespace-nowrap ${
                                          voiceGender === 'NONE' ? 'bg-slate-200 text-slate-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                      }`}
                                  >
                                      <Mic size={12} className="inline mr-1 text-slate-400"/> Sem Voz
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
                                            <Zap size={12} className="inline mr-1"/> Divertido (Masc)
                                        </button>
                                      </>
                                  ) : voiceGender === 'NONE' ? (
                                      <div className="flex-1 py-2 text-xs text-slate-400 text-center italic">Nenhuma opção</div>
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

                      {/* Pitch and Speed Controls */}
                      {voiceGender !== 'NONE' && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-xs font-semibold text-slate-700">Tom (Pitch)</label>
                                    <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-1 rounded">{voicePitch}</span>
                                </div>
                                <input 
                                    type="range" min="-20" max="20" value={voicePitch} 
                                    onChange={e => setVoicePitch(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                                    <span>Grave</span>
                                    <span>Agudo</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-xs font-semibold text-slate-700">Velocidade</label>
                                    <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-1 rounded">{voiceSpeed}x</span>
                                </div>
                                <input 
                                    type="range" min="0.5" max="2.0" step="0.1" value={voiceSpeed} 
                                    onChange={e => setVoiceSpeed(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                                    <span>Lento</span>
                                    <span>Rápido</span>
                                </div>
                            </div>
                        </div>
                      )}
                      
                       {/* EMOTIONS SECTION */}
                      {voiceGender !== 'NONE' && (
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
                      )}

                      {voiceGender !== 'NONE' && (
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
                      )}
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

                        {/* GLOBAL MUSIC UPLOAD BUTTON */}
                        <button 
                            onClick={() => musicInputRef.current?.click()}
                            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shrink-0 border ${bgMusicFile ? 'bg-green-100 border-green-300 text-green-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            title="Adicionar Música de Fundo (MP3/WAV)"
                        >
                            <Music size={18} />
                        </button>
                        <input type="file" ref={musicInputRef} accept=".mp3,.wav,audio/*" onChange={handleMusicSelect} className="hidden"/>

                        <button
                            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shrink-0 border ${showVoiceSettings ? 'bg-indigo-100 border-indigo-300 text-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            title="Configurar Voz"
                        >
                            <Volume2 size={18} />
                        </button>
                        
                        {/* Auto Captions Group */}
                         <div className={`flex items-center rounded-full transition-all border ${captionsEnabled ? 'bg-indigo-50 border-indigo-200 pl-1 pr-3 gap-2' : 'bg-white border-slate-200'}`}>
                             <button
                                onClick={() => setCaptionsEnabled(!captionsEnabled)}
                                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shrink-0 ${captionsEnabled ? 'text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                                title="Legendas Automáticas"
                            >
                                <Captions size={18} />
                            </button>
                            {captionsEnabled && (
                                <select
                                    value={captionsLanguage}
                                    onChange={(e) => setCaptionsLanguage(e.target.value)}
                                    className="bg-transparent text-xs font-bold text-indigo-700 outline-none cursor-pointer appearance-none"
                                >
                                    <option value="pt-BR">PT-BR</option>
                                    <option value="en-US">EN-US</option>
                                    <option value="es-ES">ES-ES</option>
                                </select>
                            )}
                         </div>

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
                            
                             <div className="w-px h-4 bg-slate-300 mx-1"></div>

                            {/* Resolution Selector */}
                            <button 
                                onClick={cycleResolution}
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-slate-600 hover:text-indigo-600"
                                title="Resolução"
                            >
                                <Monitor size={14} />
                            </button>
                            <span className="text-[10px] font-bold text-slate-400 px-1 min-w-[30px] text-center">{resolution}</span>

                            {/* FPS Selector */}
                            <button 
                                onClick={cycleFps}
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-slate-600 hover:text-indigo-600"
                                title="Frame Rate"
                            >
                                <Aperture size={14} />
                            </button>
                            <span className="text-[10px] font-bold text-slate-400 px-1 min-w-[30px] text-center">{fps}</span>
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
                 <video 
                    ref={videoPlayerRef}
                    src={generatedVideo} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full h-full object-contain" 
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                    onSeeked={handleVideoSeeked}
                    onTimeUpdate={handleVideoTimeUpdate}
                 />
                 {/* Hidden Audio Player for Background Music Sync */}
                 {musicUrl && (
                     <audio ref={audioPlayerRef} src={musicUrl} loop />
                 )}
            </div>

            {/* Music Controls */}
            {bgMusicFile && (
                <div className="mt-4 bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-sm animate-in fade-in">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                        <Music size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{bgMusicFile.name}</p>
                        <p className="text-xs text-slate-500">Música de Fundo</p>
                    </div>
                    <div className="flex items-center gap-3 w-48">
                        <Volume2 size={16} className="text-slate-400"/>
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.05" 
                            value={bgMusicVolume} 
                            onChange={(e) => setBgMusicVolume(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                            title="Volume da Música"
                        />
                    </div>
                </div>
            )}

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
