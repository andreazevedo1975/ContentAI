
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateImage, generateFastImage, enhancePrompt } from '../services/geminiService';
import { 
  Image as ImageIcon, 
  Loader2, 
  Download, 
  Sparkles, 
  Zap, 
  Wand2, 
  Maximize2, 
  Layers, 
  Edit, 
  ArrowLeft, 
  ArrowRight,
  Box,
  Camera,
  Upload,
  X,
  Mic,
  Rocket,
  Droplet
} from 'lucide-react';
import { ImageMode } from '../types';

// --- Mock Data for Inspiration Grid (Unsplash) ---
const INSPIRATION_IMAGES = [
  { id: 1, src: "https://images.unsplash.com/photo-1535376472810-5d229c65da09?auto=format&fit=crop&w=600&q=80", title: "Industrial Robot", tag: "poster" },
  { id: 2, src: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&w=600&q=80", title: "Jewelry Nature", tag: "product" },
  { id: 3, src: "https://images.unsplash.com/photo-1602143407151-01114192003b?auto=format&fit=crop&w=600&q=80", title: "Bottle Stream", tag: "product" },
  { id: 4, src: "https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=600&q=80", title: "Sweet Croissant", tag: "text" },
  { id: 5, src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80", title: "Portraits", tag: "poster" },
  { id: 6, src: "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&w=600&q=80", title: "Chair Sand", tag: "product" },
  { id: 7, src: "https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&w=600&q=80", title: "Abstract Waves", tag: "poster" },
  { id: 8, src: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80", title: "Dog Selfie", tag: "poster" },
];

const HeroCard: React.FC<{ 
  title: string; 
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  imageSrc: string; 
  bgColor: string;
  textColor?: string;
  onClick: () => void;
}> = ({ title, subtitle, badge, badgeColor, imageSrc, bgColor, textColor = "text-slate-900", onClick }) => (
  <div 
    onClick={onClick} 
    className={`relative overflow-hidden rounded-2xl ${bgColor} h-48 text-left group transition-all hover:shadow-xl hover:-translate-y-1 w-full border border-transparent hover:border-slate-200/50 cursor-pointer z-10 shadow-sm`}
  >
    <div className="absolute inset-0 pointer-events-none">
        <img src={imageSrc} alt={title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 mix-blend-overlay" />
        <div className={`absolute inset-0 bg-gradient-to-r ${bgColor === 'bg-slate-900' ? 'from-slate-900/90 to-transparent' : 'from-white/60 to-white/10'}`} />
    </div>
    <div className="relative p-5 h-full flex flex-col justify-between z-10 pointer-events-none">
        <div>
            {badge && (
                <span className={`inline-block ${badgeColor || 'bg-blue-100 text-blue-700'} text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mb-2 shadow-sm`}>
                    {badge}
                </span>
            )}
            <h3 className={`text-lg font-bold leading-tight ${textColor}`}>{title}</h3>
            {subtitle && <p className={`text-xs font-medium opacity-70 mt-1 ${textColor}`}>{subtitle}</p>}
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${textColor === 'text-white' ? 'bg-white/20 text-white' : 'bg-white text-slate-900'} shadow-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0`}>
            <ArrowRight size={14} strokeWidth={3} />
        </div>
    </div>
  </div>
);

const ToolButton: React.FC<{ icon: React.ReactNode; label: string; color?: string; onClick?: () => void }> = ({ icon, label, color = "bg-slate-100", onClick }) => (
  <button onClick={onClick} className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all group shadow-sm cursor-pointer z-10">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-slate-700 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
  </button>
);

// --- Main Component ---
const ImageStudio: React.FC = () => {
  const location = useLocation();
  const initialState = location.state as { mode?: ImageMode; prompt?: string; image?: string } | null;
  
  const [view, setView] = useState<'hub' | 'generator'>(initialState?.mode ? 'generator' : 'hub');
  const [mode, setMode] = useState<ImageMode>(initialState?.mode || 'product');
  const [activeTab, setActiveTab] = useState('Todos');

  // Generator State
  const [prompt, setPrompt] = useState(initialState?.prompt || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(initialState?.image ? `data:image/png;base64,${initialState.image}` : null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  
  const [isListening, setIsListening] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialState?.prompt) {
        setPrompt(initialState.prompt);
        setMode(initialState.mode || 'product');
        if(initialState.image) {
            setFilePreview(`data:image/png;base64,${initialState.image}`);
             // Note: selectedFile won't be set from base64 easily, but we handle base64 pass-through in logic if needed
        }
        setView('generator');
    }
  }, [initialState]);

  // Handlers
  const openGenerator = (targetMode: ImageMode, startPrompt: string = '', autoUpload: boolean = false) => {
    setMode(targetMode);
    setPrompt(startPrompt);
    setView('generator');
    setImage(null);
    setSelectedFile(null);
    setFilePreview(null);
    
    if (autoUpload) {
        setTimeout(() => fileInputRef.current?.click(), 500);
    }
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
      setPrompt(prev => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) {
          setSelectedFile(f);
          setFilePreview(URL.createObjectURL(f));
          setMode('design'); // Switch to design mode for image editing
      }
  };

  const handleClearFile = () => {
      setSelectedFile(null);
      setFilePreview(null);
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      let result;
      
      // Handle file or passed base64 preview
      let base64Data = '';
      if (selectedFile) {
          const reader = new FileReader();
          base64Data = await new Promise((resolve) => {
               reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
               reader.readAsDataURL(selectedFile);
          });
      } else if (filePreview && filePreview.startsWith('data:')) {
          base64Data = filePreview.split(',')[1];
      }

      if (mode === 'design' && base64Data) {
          // Image editing logic using Fast Image
          result = await generateFastImage(prompt, base64Data, selectedFile?.type || 'image/png');
          setImage(result);
      } else {
          result = mode === 'design'
            ? await generateFastImage(prompt) 
            : await generateImage(prompt);
          setImage(result);
      }
    } catch (e) {
      alert("Erro ao gerar imagem.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt) return;
    setEnhancing(true);
    const improved = await enhancePrompt(prompt);
    setPrompt(improved);
    setEnhancing(false);
  };

  // Helper for UI based on Mode
  const isNano = mode === 'design';
  const title = isNano ? "Design de IA" : "Foto de Produto";
  const suggestions = isNano 
    ? ['Poster', 'Tipografia 3D', 'Neon', 'Vibrante', 'Vetor', 'Abstrato', 'Cyberpunk']
    : ['Fundo branco', 'Iluminação de estúdio', 'Alta resolução', 'Minimalista', 'Cinemático', 'Luxo', 'Bokeh'];
  
  const placeholder = isNano
    ? "Ex: Design abstrato de cores vibrantes, estilo 3D render..."
    : "Descreva seu produto com detalhes: Ex: Um frasco de perfume dourado elegante sobre mármore branco, iluminação suave de estúdio, fundo limpo...";


  // --- Hub View ---
  if (view === 'hub') {
    return (
      <div className="p-8 max-w-7xl mx-auto pb-20 animate-fade-in">
        
        {/* Top Section */}
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 font-display">Imagem & Design</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                <HeroCard 
                    title="Design de IA"
                    badge="Nano Banana"
                    badgeColor="bg-purple-100 text-purple-700"
                    imageSrc="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=80" 
                    bgColor="bg-purple-50"
                    onClick={() => openGenerator('design')}
                />
                <HeroCard 
                    title="Foto de Produto"
                    badge="Imagen 3"
                    badgeColor="bg-indigo-100 text-indigo-700"
                    imageSrc="https://images.unsplash.com/photo-1594035910387-fea477942698?auto=format&fit=crop&w=400&q=80"
                    bgColor="bg-indigo-50"
                    onClick={() => openGenerator('product', "Produto cosmético de luxo sobre pódio de pedra, fundo natural desfocado, iluminação suave...")}
                />
                <HeroCard 
                    title="Remover Fundo"
                    imageSrc="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
                    bgColor="bg-blue-50"
                    onClick={() => openGenerator('design', "Remove the person/object in the background and replace with clean studio background...", true)}
                />
                <HeroCard 
                    title="Layout em Design"
                    badge="Big Sale"
                    badgeColor="bg-slate-200 text-slate-700"
                    imageSrc="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=400&q=80"
                    bgColor="bg-slate-100"
                    onClick={() => openGenerator('design', "Poster promocional de venda 'BIG SALE', tipografia moderna 3D, cores vibrantes...")}
                />
            </div>
        </div>

        {/* Quick Tools - Now Functional via Prompt Presets */}
        <div className="mb-16 relative z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Ferramentas rápidas</h3>
            <div className="flex flex-wrap gap-4">
                <ToolButton 
                    icon={<Camera size={20} />} 
                    label="Novo Produto" 
                    color="bg-green-100" 
                    onClick={() => openGenerator('product', "Foto de produto profissional, iluminação de estúdio, alta qualidade...")} 
                />
                <ToolButton 
                    icon={<Wand2 size={20} />} 
                    label="Magia da IA (Editor)" 
                    color="bg-pink-100" 
                    onClick={() => openGenerator('design', "Adicionar brilho e efeitos mágicos...", true)} 
                />
                <ToolButton 
                    icon={<Maximize2 size={20} />} 
                    label="Amplificar (Upscale)" 
                    color="bg-orange-100" 
                    onClick={() => openGenerator('product', "Imagem ultra detalhada, 8k, alta resolução, textura realista de...")} 
                />
                <ToolButton 
                    icon={<Layers size={20} />} 
                    label="Variações em lote" 
                    color="bg-blue-100" 
                    onClick={() => openGenerator('design', "Variações de design para...")} 
                />
                <ToolButton 
                    icon={<Droplet size={20} />} 
                    label="Denoise / Limpar" 
                    color="bg-teal-100" 
                    onClick={() => openGenerator('design', "Denoise image, remove grain, smooth textures, high clarity", true)} 
                />
                <ToolButton 
                    icon={<Rocket size={20} />} 
                    label="Tech Launch Post" 
                    color="bg-cyan-100" 
                    onClick={() => openGenerator('design', "Eye-catching abstract design for a tech product launch, vibrant, modern social media post style...")} 
                />
            </div>
        </div>

        {/* Inspiration Section */}
        <div>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900 font-display">Galeria de Estilos</h2>
                <div className="hidden md:flex gap-2">
                    <div className="bg-white border border-slate-200 p-1 rounded-xl flex shadow-sm">
                        {['Todas as imagens', 'Pôster de produto', 'Pôster de texto'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Masonry Grid */}
            <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                {INSPIRATION_IMAGES.map((img) => (
                    <div key={img.id} className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 z-0">
                        <img src={img.src} alt={img.title} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-white text-sm font-bold mb-2">{img.title}</p>
                            <button 
                                onClick={() => openGenerator('product', `Recrie uma imagem estilo ${img.title}, de alta qualidade, iluminação profissional...`)}
                                className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-white hover:text-slate-900 transition-colors"
                            >
                                Usar Estilo
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    );
  }

  // --- Generator View ---

  return (
    <div className="p-8 max-w-6xl mx-auto pb-20 animate-fade-in">
      {/* Nav Back */}
      <button 
        onClick={() => setView('hub')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium mb-8 transition-colors group"
      >
        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-900 transition-colors">
             <ArrowLeft size={14} />
        </div>
        Voltar para a galeria
      </button>

      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3 flex items-center gap-3 font-display">
                {title}
            </h1>
            <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setMode('product')} 
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 border ${mode === 'product' ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'}`}
                    >
                        <Camera size={14} /> Foto de Produto
                    </button>
                    <button 
                        onClick={() => setMode('design')} 
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 border ${mode === 'design' ? 'bg-purple-50 border-purple-200 text-purple-600 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'}`}
                    >
                        <Box size={14} /> Design Rápido
                    </button>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:h-[650px]">
        {/* Sidebar Controls */}
        <div className="glass-panel p-6 rounded-3xl h-full shadow-lg flex flex-col justify-between">
          <div className="flex-1 flex flex-col">
              
              {/* Upload Section */}
              <div 
                 className={`mb-4 border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-colors cursor-pointer ${selectedFile || filePreview ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-indigo-300'}`}
                 onClick={() => fileInputRef.current?.click()}
              >
                 <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden"/>
                 
                 {filePreview ? (
                     <div className="relative w-full h-32">
                         <img src={filePreview} className="w-full h-full object-contain rounded-lg"/>
                         <button onClick={(e) => { e.stopPropagation(); handleClearFile(); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:scale-110"><X size={12}/></button>
                         <p className="text-[10px] text-center text-indigo-600 font-bold mt-1">Imagem Carregada</p>
                     </div>
                 ) : (
                     <>
                         <Upload size={24} className="text-slate-400 mb-2"/>
                         <p className="text-xs font-bold text-slate-600 text-center">Upload Imagem Base</p>
                         <p className="text-[9px] text-slate-400 text-center">(Opcional para edição/remção de fundo)</p>
                     </>
                 )}
              </div>

              <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles size={18} className={isNano ? "text-purple-600" : "text-indigo-600"}/> Prompt Criativo
                  </label>
                  {/* Magic Enhance Button */}
                  <button 
                    onClick={handleEnhancePrompt}
                    disabled={enhancing || !prompt}
                    className="text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1.5 rounded-full flex items-center gap-1 hover:shadow-md transition-all disabled:opacity-50"
                  >
                     {enhancing ? <Loader2 size={12} className="animate-spin"/> : <Wand2 size={12} />}
                     Melhorar
                  </button>
              </div>
              
              <div className="relative">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-white/50 backdrop-blur-sm border border-white/50 rounded-2xl p-5 pr-12 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none mb-6 text-base leading-relaxed shadow-inner h-32"
                    placeholder={placeholder}
                />
                <button 
                    onClick={handleDictation}
                    className={`absolute bottom-8 right-4 p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-red-500/50' : 'bg-white/80 text-slate-400 hover:text-indigo-600 shadow-sm'}`}
                    title="Dictate Prompt"
                >
                    <Mic size={18} className={isListening ? 'animate-bounce' : ''}/>
                </button>
              </div>
              
              <div className="mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tags Sugeridas</p>
                <div className="flex flex-wrap gap-2">
                    {suggestions.map(tag => (
                        <button key={tag} onClick={() => setPrompt(p => p + (p ? ', ' : '') + tag)} className="px-3 py-1.5 bg-white border border-slate-100 hover:border-indigo-200 hover:text-indigo-600 text-slate-600 text-xs font-bold rounded-lg transition-all shadow-sm">
                            {tag}
                        </button>
                    ))}
                </div>
              </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className={`w-full ${isNano ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600' : 'bg-gradient-to-r from-indigo-600 to-blue-600'} text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-indigo-200 hover:scale-[1.02] transition-all mt-4`}
          >
            {loading ? <Loader2 className="animate-spin" /> : (isNano ? <Zap size={20} /> : <ImageIcon size={20} />)}
            {isNano ? (selectedFile ? 'Editar com Flash' : 'Gerar Flash') : 'Gerar Imagem'}
          </button>
        </div>

        {/* Image Output Area */}
        <div className="lg:col-span-2 glass-card rounded-3xl flex items-center justify-center relative overflow-hidden group shadow-2xl min-h-[400px] ring-1 ring-black/5">
          {loading && (
            <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center backdrop-blur-md">
              <div className="relative">
                   <div className={`absolute inset-0 blur-xl opacity-50 rounded-full ${isNano ? 'bg-purple-400' : 'bg-indigo-400'}`}></div>
                   <Loader2 className={`relative animate-spin ${isNano ? 'text-purple-600' : 'text-indigo-600'} mb-6`} size={64} />
              </div>
              <p className={`${isNano ? 'text-purple-900' : 'text-indigo-900'} font-bold text-lg animate-pulse`}>
                  {isNano ? 'Renderizando Design...' : 'Criando Arte...'}
              </p>
            </div>
          )}
          
          {image ? (
            <div className="relative w-full h-full flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
              <img src={image} alt="Generated" className="max-w-full max-h-full object-contain shadow-2xl" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-end">
                 <div className="max-w-[70%]">
                     <p className="text-white/60 text-xs uppercase font-bold mb-1 tracking-wider">Prompt Utilizado</p>
                     <p className="text-white text-sm line-clamp-2 font-medium leading-relaxed">{prompt}</p>
                 </div>
                 <a href={image} download="generated-ai.png" className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors shadow-lg">
                    <Download size={18} /> Baixar
                 </a>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 max-w-md p-10">
              <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                <ImageIcon size={48} className="opacity-20" />
              </div>
              <h3 className="text-2xl font-bold text-slate-700 mb-3 font-display">Sua Tela em Branco</h3>
              <p className="text-slate-500 leading-relaxed">Selecione um modo e digite seu prompt para ver a mágica acontecer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;
