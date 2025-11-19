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
  Wand2
} from 'lucide-react';

// --- Components for this page ---

const QuickActionPill: React.FC<{ icon?: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all whitespace-nowrap shadow-sm"
  >
    {icon}
    {label}
  </button>
);

const ToolCard: React.FC<{ icon: React.ReactNode; title: string; color: string; onClick: () => void }> = ({ icon, title, color, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-4 p-4 bg-[#f8fafc] hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-left group w-full"
  >
    <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <span className="font-semibold text-slate-700 group-hover:text-slate-900">{title}</span>
  </button>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all border-b-2 ${
      active 
        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
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
  const [activeTab, setActiveTab] = useState<'main' | 'background'>('main');
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

  // Voice/Persona Detection State (Auto)
  const [voiceAnalysis, setVoiceAnalysis] = useState<{ label: string; voicePrompt: string; type: string } | null>(null);
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);

  // Handle incoming navigation state
  useEffect(() => {
    if (location.state) {
      const state = location.state as { mode?: string; prompt?: string };
      
      if (state.mode === 'background') {
          setActiveTab('background');
          if (state.prompt) setBgPrompt(state.prompt);
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
                // Open voice settings for avatar
                setShowVoiceSettings(true);
                break;
            case 'talking_photo':
                setMainPrompt(prev => prev || "Anime esta foto para que o personagem fale naturalmente...");
                setShowVoiceSettings(true);
                // Small delay to allow UI to mount before opening dialog if needed, though usually automatic
                setTimeout(() => fileInputRef.current?.click(), 500);
                break;
            case 'showcase':
                setMainPrompt(prev => prev || "Showcase de produto girando em 360 graus, iluminação de estúdio...");
                break;
        }
      }
    }
  }, [location.state]);

  // Dictation Handler
  const handleDictation = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Seu navegador não suporta reconhecimento de voz.");
      return;
    }

    if (isListening) {
      setIsListening(false); // Stop logic would be handled by the onend event usually, but simple toggle here
      return;
    }

    setIsListening(true);
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (activeTab === 'main') {
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

  // Handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        setPreviewUrl(result);

        // Check for Talking Photo / Avatar context to auto-detect voice
        const isTalkingContext = activeTab === 'main' && 
          (mainPrompt.toLowerCase().includes('fale') || 
           mainPrompt.toLowerCase().includes('talk') || 
           mainPrompt.toLowerCase().includes('avatar') || 
           mainPrompt.toLowerCase().includes('foto'));

        if (isTalkingContext) { 
           setIsAnalyzingVoice(true);
           const base64 = result.split(',')[1];
           try {
             const analysis = await detectVoicePersona(base64);
             setVoiceAnalysis(analysis);
             
             // Update UI controls based on analysis
             if (analysis.type === 'MALE') { setVoiceGender('MALE'); setVoiceAge('ADULT'); }
             else if (analysis.type === 'FEMALE') { setVoiceGender('FEMALE'); setVoiceAge('ADULT'); }
             else if (analysis.type === 'CHILD') { setVoiceAge('CHILD'); }
             else if (analysis.type === 'CUTE_ANIMAL') { setVoiceGender('MASCOT'); }
             
           } catch (error) {
             console.error("Voice detection failed", error);
           } finally {
             setIsAnalyzingVoice(false);
           }
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

  // Helper: Map Settings to Real Gemini Voice Name
  const getVoiceFromSettings = () => {
    // MASCOT overrides everything to Zephyr (high pitch/bright/energetic)
    if (voiceGender === 'MASCOT') return 'Zephyr';

    if (voiceAge === 'CHILD') {
        // Children usually simulated with Zephyr or sometimes high pitch Kore
        return 'Zephyr';
    }
    
    // Adults
    if (voiceGender === 'MALE') return 'Puck'; // Deep/Clear Male
    return 'Kore'; // Calm/Clear Female
  };

  const handleAudioPreview = async () => {
    const text = activeTab === 'main' ? mainPrompt : bgPrompt;
    if (!text) return;
    
    try {
        const voice = getVoiceFromSettings();
        const base64 = await import('../services/geminiService').then(m => m.generateSpeech(text, voice));
        const { decodeBase64, pcmToWav } = await import('../services/audioUtils');
        
        const pcm = decodeBase64(base64);
        const wav = pcmToWav(pcm, 24000, 1);
        const url = URL.createObjectURL(wav);
        const audio = new Audio(url);
        audio.play();
    } catch (e) {
        console.error(e);
        alert("Erro ao gerar prévia de áudio.");
    }
  };

  const handleGenerate = async () => {
    const currentPrompt = activeTab === 'main' ? mainPrompt : bgPrompt;

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

      // Determine Duration Constraints
      const wordCount = currentPrompt.split(/\s+/).length;
      const isLongText = wordCount > 20; // Approximate threshold
      const shouldBeLong = durationMode === 'long' || (durationMode === 'auto' && isLongText);
      
      // Select model based on Preview Mode toggle & Duration
      const modelId = (isLiteMode && !shouldBeLong) ? 'veo-3.1-fast-generate-preview' : 'veo-3.1-generate-preview';

      // --- Construct Final Prompt ---
      let finalPrompt = currentPrompt;
      
      if (activeTab === 'background' && !currentPrompt.toLowerCase().includes('background')) {
          finalPrompt = `Background video, abstract, looping, cinematic, no text, ${currentPrompt}`;
      }

      // Add Duration Instructions
      if (shouldBeLong) {
          finalPrompt += ". Generate a long take, continuous movement, extend duration to match narration.";
      }

      // --- Add Voice Instructions ---
      // Build descriptive voice prompt based on Granular Controls
      if (activeTab === 'main' && (mainPrompt.includes('fale') || mainPrompt.includes('say') || showVoiceSettings)) {
          
          let voiceDescr = "";
          const mappedVoice = getVoiceFromSettings();

          if (voiceGender === 'MASCOT') {
             // Specific engineering for Mascot comic effects
             voiceDescr = "High-pitched, energetic, cute cartoon mascot voice, exaggerated expression, squeaky, fast-paced";
          } else {
             const genderStr = voiceGender === 'MALE' ? 'Male' : 'Female';
             const ageStr = voiceAge === 'ADULT' ? 'Adult' : 'Child/Young';
             voiceDescr = `${ageStr} ${genderStr} voice`;
          }
          
          if (voiceStyle) {
              voiceDescr += `, tone: ${voiceStyle}`;
          }

          // Ensure the base model (Zephyr, Puck, etc) is hinted in prompt too if using audio model directly
          finalPrompt += `. Audio Style strictly defined as: ${voiceDescr} (Base Model: ${mappedVoice}).`;
      }


      const videoUri = await generateVideo(finalPrompt, imageBase64, modelId);
      setGeneratedVideo(videoUri);

    } catch (error) {
      console.error(error);
      alert("Erro ao gerar vídeo. Verifique o console ou sua API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to get current prompt state
  const currentPromptValue = activeTab === 'main' ? mainPrompt : bgPrompt;
  const setCurrentPromptValue = (val: string) => activeTab === 'main' ? setMainPrompt(val) : setBgPrompt(val);

  return (
    <div className="p-8 max-w-6xl mx-auto pb-24 animate-fade-in">
      
      <div className="text-center mb-10 mt-4">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Transforme qualquer coisa em vídeos</h1>
      </div>

      {/* Main Input Area */}
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 transition-shadow hover:shadow-xl ring-1 ring-black/5 overflow-hidden">
            
            {/* Tabs for Prompt Type */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
                <TabButton 
                    active={activeTab === 'main'} 
                    onClick={() => setActiveTab('main')} 
                    icon={<Film size={16} />} 
                    label="Conteúdo Principal"
                />
                <TabButton 
                    active={activeTab === 'background'} 
                    onClick={() => setActiveTab('background')} 
                    icon={<Wallpaper size={16} />} 
                    label="Vídeo de Fundo (Veo)"
                />
            </div>

            <div className="p-4">
                {/* Text Input */}
                <div className="relative">
                    <textarea
                        value={currentPromptValue}
                        onChange={(e) => setCurrentPromptValue(e.target.value)}
                        placeholder={activeTab === 'main' 
                            ? "Descreva a história, o personagem ou o cenário principal..." 
                            : "Descreva a textura, o ambiente ou o loop abstrato para o fundo..."}
                        className="w-full min-h-[100px] max-h-[200px] resize-none outline-none text-slate-700 placeholder:text-slate-400 text-lg bg-transparent p-2 pr-12"
                    />
                    
                    {/* Mic Button inside textarea */}
                    <button 
                        onClick={handleDictation}
                        className={`absolute top-2 right-2 p-2 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-white text-slate-400 hover:text-indigo-600 shadow-sm'}`}
                        title="Dictate prompt"
                    >
                        <Mic size={18} />
                    </button>
                </div>

                {/* File Preview Badge & Voice Analysis */}
                {previewUrl && (
                    <div className="flex flex-wrap gap-2 mb-4 mx-2">
                        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100">
                            <ImageIcon size={16} />
                            <span className="text-xs font-bold max-w-[150px] truncate">{selectedFile?.name}</span>
                            <button onClick={handleRemoveFile} className="hover:text-indigo-900"><X size={14}/></button>
                        </div>

                        {/* Voice Analysis Badge */}
                        {isAnalyzingVoice ? (
                           <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100 animate-pulse">
                              <Loader2 size={14} className="animate-spin"/>
                              <span className="text-xs font-bold">Detectando voz...</span>
                           </div>
                        ) : voiceAnalysis ? (
                           <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
                              <Sparkles size={14} className="fill-emerald-200"/>
                              <span className="text-xs font-bold">Sugerido: {voiceAnalysis.label}</span>
                           </div>
                        ) : null}
                    </div>
                )}
                
                {/* Voice Settings Panel (Refactored for Gender/Age/Tone) */}
                {showVoiceSettings && (
                  <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100 animate-in slide-in-from-top-2">
                      <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <Volume2 size={14} /> Configurações de Voz
                          </h4>
                          <div className="flex items-center gap-2">
                             <button 
                                onClick={handleAudioPreview}
                                className="text-xs font-bold text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100"
                             >
                                <Music size={12}/> Ouvir Exemplo
                             </button>
                             <button onClick={() => setShowVoiceSettings(false)} className="text-slate-400 hover:text-slate-600"><X size={14}/></button>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          {/* Gender & Mascot */}
                          <div>
                              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Tipo de Voz</label>
                              <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                                  <button
                                      onClick={() => setVoiceGender('FEMALE')}
                                      className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                                          voiceGender === 'FEMALE' ? 'bg-pink-100 text-pink-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                      }`}
                                  >
                                      Feminino
                                  </button>
                                  <button
                                      onClick={() => setVoiceGender('MALE')}
                                      className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                                          voiceGender === 'MALE' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                      }`}
                                  >
                                      Masculino
                                  </button>
                                  <button
                                      onClick={() => setVoiceGender('MASCOT')}
                                      className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                                          voiceGender === 'MASCOT' ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                      }`}
                                  >
                                      <Cat size={12} className="inline mr-1"/> Mascote
                                  </button>
                              </div>
                          </div>
                          
                          {/* Age (Disable if Mascot) */}
                          <div className={voiceGender === 'MASCOT' ? 'opacity-50 pointer-events-none' : ''}>
                              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Idade</label>
                              <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                                  <button
                                      onClick={() => setVoiceAge('ADULT')}
                                      className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                                          voiceAge === 'ADULT' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                      }`}
                                  >
                                      <User size={12} className="inline mr-1"/> Adulto
                                  </button>
                                  <button
                                      onClick={() => setVoiceAge('CHILD')}
                                      className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                                          voiceAge === 'CHILD' ? 'bg-teal-100 text-teal-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                      }`}
                                  >
                                      <Baby size={12} className="inline mr-1"/> Criança
                                  </button>
                              </div>
                          </div>
                      </div>

                      {/* Custom Tone/Emotion Input + Mascot Comic Effects */}
                      <div>
                          <label className="text-xs font-semibold text-slate-700 mb-1.5 block flex items-center gap-1">
                              <Heart size={10}/> {voiceGender === 'MASCOT' ? 'Efeitos Cômicos & Personalidade' : 'Emoção e Estilo'}
                          </label>
                          
                          <input
                               type="text"
                               value={voiceStyle}
                               onChange={(e) => setVoiceStyle(e.target.value)}
                               placeholder={voiceGender === 'MASCOT' ? "Ex: Voz de esquilo, rindo, muito rápido..." : "Ex: Voz rouca e sussurrada, tom muito alegre..."}
                               className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                          />

                          {voiceGender === 'MASCOT' ? (
                             /* Mascot Presets */
                             <div className="flex gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
                                {['Voz de Hélio (Agudo)', 'Robótico Fofo', 'Tagarela (Rápido)', 'Risadinha', 'Cartoon', 'Sussurro Fofo'].map(tag => (
                                    <button 
                                      key={tag} 
                                      onClick={() => setVoiceStyle(prev => prev ? prev + ", " + tag : tag)}
                                      className="text-[10px] font-bold px-2 py-1 bg-orange-50 text-orange-600 border border-orange-100 rounded hover:bg-orange-100 whitespace-nowrap flex items-center gap-1"
                                    >
                                        <Wand2 size={10}/> {tag}
                                    </button>
                                ))}
                             </div>
                          ) : (
                             /* Standard Presets */
                             <div className="flex gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
                                {['Alegre', 'Sério', 'Sussurrando', 'Gritando', 'Triste', 'Robótico'].map(tag => (
                                    <button 
                                      key={tag} 
                                      onClick={() => setVoiceStyle(tag)}
                                      className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded hover:bg-slate-200 whitespace-nowrap"
                                    >
                                        {tag}
                                    </button>
                                ))}
                             </div>
                          )}
                      </div>
                  </div>
                )}

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 pt-2 border-t border-slate-50">
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar px-2">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors shrink-0"
                            title="Adicionar Mídia"
                        >
                            <Plus size={20} />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

                        {/* Voice Settings Toggle */}
                        <button
                            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors shrink-0 ${showVoiceSettings ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            title="Configurar Voz"
                        >
                            <Volume2 size={20} />
                        </button>

                        <div className="h-6 w-px bg-slate-200 mx-1 shrink-0"></div>

                        {/* Modo Lite Toggle -> Renamed to Preview */}
                        <button 
                            onClick={() => setIsLiteMode(!isLiteMode)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
                                isLiteMode ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            {isLiteMode ? <Zap size={16} className="fill-amber-700"/> : <Settings2 size={16} />}
                            {isLiteMode ? 'Modo Preview' : 'Pro'}
                        </button>

                        {/* Background Mode Toggle in Toolbar (New) */}
                        <button 
                            onClick={() => {
                                setActiveTab('background');
                                if (!bgPrompt) setBgPrompt("Abstract background, cinematic lighting, 4k loop...");
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
                                activeTab === 'background' ? 'bg-teal-100 text-teal-700 border border-teal-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            <Wallpaper size={16} />
                            Fundo
                        </button>

                        {/* Aspect Ratio */}
                        <button 
                            onClick={() => setAspectRatio(aspectRatio === '16:9' ? '9:16' : '16:9')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-700 transition-colors whitespace-nowrap"
                        >
                            <Settings2 size={16} className="rotate-90"/>
                            {aspectRatio}
                        </button>

                        {/* Duration Selector */}
                        <button 
                            onClick={() => setDurationMode(prev => prev === 'auto' ? 'long' : prev === 'long' ? 'short' : 'auto')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-700 transition-colors whitespace-nowrap"
                        >
                            <Clock size={16} />
                            {durationMode === 'auto' ? 'Auto' : durationMode === 'long' ? 'Longo' : 'Curto'}
                        </button>
                    </div>

                    {/* Generate Button */}
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || (!currentPromptValue && !selectedFile)}
                        className={`w-full sm:w-auto font-bold px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                            activeTab === 'main' 
                                ? 'bg-black hover:bg-slate-800 text-white' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                    >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : "Gerar"}
                    </button>
                </div>
            </div>
        </div>

        {/* Quick Suggestions */}
        <div className="flex items-center gap-3 mt-6 overflow-x-auto pb-4 mask-linear-fade">
            <QuickActionPill 
                icon={<img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" className="w-4 h-4" alt="tiktok"/>}
                label="Vídeo TikTok" 
                onClick={() => {
                    setActiveTab('main');
                    setMainPrompt("Vídeo dinâmico e viral para TikTok, estilo rápido, sobre um novo produto de tecnologia...");
                }}
            />
            <QuickActionPill 
                icon={<Type size={14} />}
                label="Promoção Escolar" 
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
             <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full shadow-sm shrink-0 hover:bg-slate-50">
                <ChevronRight size={16} className="text-slate-500" />
            </button>
        </div>
      </div>

      {/* Result Area */}
      {generatedVideo && (
        <div className="max-w-4xl mx-auto mt-12 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2"><Film size={24} className="text-indigo-600"/> Resultado</h2>
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video relative group">
                 <video src={generatedVideo} controls autoPlay loop className="w-full h-full object-contain" />
            </div>
            <div className="mt-4 flex justify-end">
                 <a href={generatedVideo} download="video-gerado.mp4" className="text-indigo-600 font-bold hover:underline">Baixar Vídeo</a>
            </div>
        </div>
      )}

      {/* Popular Tools Grid */}
      <div className="max-w-5xl mx-auto mt-16">
        <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-slate-500 uppercase tracking-wide">Ferramentas populares</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <ToolCard 
                icon={<User size={20}/>} 
                title="Vídeo de avatar" 
                color="bg-purple-500"
                onClick={() => {
                    setActiveTab('main');
                    setMainPrompt("Avatar realista falando diretamente para a câmera, ambiente de escritório moderno...");
                    setShowVoiceSettings(true);
                }}
            />
            <ToolCard 
                icon={<User size={20}/>} 
                title="Foto falante de IA" 
                color="bg-indigo-500"
                onClick={() => {
                    setActiveTab('main');
                    setMainPrompt("Anime esta foto para que o rosto se mova e fale naturalmente...");
                    setShowVoiceSettings(true);
                    setTimeout(() => fileInputRef.current?.click(), 500);
                }}
            />
             <ToolCard 
                icon={<Wallpaper size={20}/>} 
                title="Vídeo de fundo" 
                color="bg-teal-500"
                onClick={() => {
                    setActiveTab('background');
                    setBgPrompt("Vídeo de fundo 4k, textura animada 3D, minimalista, cores suaves, iluminação cinemática, sem texto, loop...");
                }}
            />
            <ToolCard 
                icon={<Film size={20}/>} 
                title="Vitrine de produtos" 
                color="bg-pink-500"
                onClick={() => {
                    setActiveTab('main');
                    setMainPrompt("Vídeo cinematográfico de produto girando, iluminação dramática, alta resolução...");
                }}
            />
            <ToolCard 
                icon={<Eraser size={20}/>} 
                title="Remover fundo" 
                color="bg-blue-500"
                onClick={() => {
                    setActiveTab('main');
                    setMainPrompt("Objeto isolado no centro, fundo verde chroma key sólido perfeito para remoção...");
                }}
            />
            <ToolCard 
                icon={<Scissors size={20}/>} 
                title="Corte rápido" 
                color="bg-orange-500"
                onClick={() => {
                    setActiveTab('main');
                    setMainPrompt("Montagem rápida de clipes de ação, transições dinâmicas, estilo TikTok...");
                }}
            />
        </div>
      </div>

    </div>
  );
};

export default VideoGenerator;