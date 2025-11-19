import React, { useState, useEffect } from 'react';
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
  Camera
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
  <button onClick={onClick} className={`relative overflow-hidden rounded-2xl ${bgColor} h-48 text-left group transition-all hover:shadow-md hover:-translate-y-1 w-full border border-transparent hover:border-slate-200/50`}>
    <div className="absolute inset-0">
        <img src={imageSrc} alt={title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 mix-blend-overlay" />
        <div className={`absolute inset-0 bg-gradient-to-r ${bgColor === 'bg-slate-900' ? 'from-slate-900/90 to-transparent' : 'from-white/60 to-white/10'}`} />
    </div>
    <div className="relative p-5 h-full flex flex-col justify-between z-10">
        <div>
            {badge && (
                <span className={`inline-block ${badgeColor || 'bg-blue-100 text-blue-700'} text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mb-2`}>
                    {badge}
                </span>
            )}
            <h3 className={`text-lg font-bold leading-tight ${textColor}`}>{title}</h3>
            {subtitle && <p className={`text-xs font-medium opacity-70 mt-1 ${textColor}`}>{subtitle}</p>}
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${textColor === 'text-white' ? 'bg-white/20 text-white' : 'bg-white text-slate-900'} shadow-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0`}>
            <ArrowLeft className="rotate-180" size={14} strokeWidth={3} />
        </div>
    </div>
  </button>
);

const ToolButton: React.FC<{ icon: React.ReactNode; label: string; color?: string; onClick?: () => void }> = ({ icon, label, color = "bg-slate-100", onClick }) => (
  <button onClick={onClick} className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all group">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-slate-700 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
  </button>
);

// --- Main Component ---
const ImageStudio: React.FC = () => {
  const location = useLocation();
  const initialState = location.state as { mode?: ImageMode; prompt?: string } | null;
  
  const [view, setView] = useState<'hub' | 'generator'>(initialState?.mode ? 'generator' : 'hub');
  const [mode, setMode] = useState<ImageMode>(initialState?.mode || 'product');
  const [activeTab, setActiveTab] = useState('Todos');

  // Generator State
  const [prompt, setPrompt] = useState(initialState?.prompt || '');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);

  useEffect(() => {
    if (initialState?.prompt) {
        setPrompt(initialState.prompt);
        setMode(initialState.mode || 'product');
        setView('generator');
    }
  }, [initialState]);

  // Handlers
  const openGenerator = (targetMode: ImageMode, startPrompt: string = '') => {
    setMode(targetMode);
    setPrompt(startPrompt);
    setView('generator');
    setImage(null);
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const result = mode === 'design'
        ? await generateFastImage(prompt) 
        : await generateImage(prompt);
      setImage(result);
    } catch (e) {
      alert("Falha na geração de imagem");
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
        <div className="mb-10">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Eleve o nível das suas imagens de marketing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    title="Remover plano de fundo"
                    imageSrc="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
                    bgColor="bg-blue-50"
                    onClick={() => openGenerator('product', "Objeto isolado em fundo branco puro, iluminação de estúdio para recorte...")}
                />
                <HeroCard 
                    title="Layout em design"
                    badge="Big Sale"
                    badgeColor="bg-slate-200 text-slate-700"
                    imageSrc="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=400&q=80"
                    bgColor="bg-slate-100"
                    onClick={() => openGenerator('design', "Poster promocional de venda 'BIG SALE', tipografia moderna 3D, cores vibrantes...")}
                />
            </div>
        </div>

        {/* Quick Tools - Now Functional via Prompt Presets */}
        <div className="mb-12">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Ferramentas rápidas</h3>
            <div className="flex flex-wrap gap-4">
                <ToolButton 
                    icon={<Wand2 size={18} />} 
                    label="Magia da IA (Editor)" 
                    color="bg-pink-100" 
                    onClick={() => openGenerator('product', "Prompt Mágico: ")} 
                />
                <ToolButton 
                    icon={<Maximize2 size={18} />} 
                    label="Amplificar (Upscale)" 
                    color="bg-orange-100" 
                    onClick={() => openGenerator('product', "Imagem ultra detalhada, 8k, alta resolução, textura realista de...")} 
                />
                <ToolButton 
                    icon={<Layers size={18} />} 
                    label="Variações em lote" 
                    color="bg-blue-100" 
                    onClick={() => openGenerator('design', "Variações de design para...")} 
                />
            </div>
        </div>

        {/* Inspiration Section */}
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Encontre inspiração</h2>
                <div className="hidden md:flex gap-2">
                    <div className="bg-slate-100 p-1 rounded-lg flex">
                        {['Todas as imagens', 'Pôster de produto', 'Pôster de texto'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === tab ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Masonry Grid */}
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {INSPIRATION_IMAGES.map((img) => (
                    <div key={img.id} className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer">
                        <img src={img.src} alt={img.title} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
                            <p className="text-white text-sm font-bold">{img.title}</p>
                            <button 
                                onClick={() => openGenerator('product', `Recrie uma imagem estilo ${img.title}, de alta qualidade, iluminação profissional...`)}
                                className="mt-2 bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-indigo-50"
                            >
                                Usar este estilo
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
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Voltar para a galeria
      </button>

      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                {title}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg ml-2">
                    <button 
                        onClick={() => setMode('product')} 
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${mode === 'product' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Camera size={12} /> Foto de Produto
                    </button>
                    <button 
                        onClick={() => setMode('design')} 
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${mode === 'design' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Box size={12} /> Design Rápido
                    </button>
                </div>
            </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:h-[600px]">
        {/* Sidebar Controls */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl h-full shadow-sm flex flex-col justify-between">
          <div className="flex-1">
              <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles size={16} className={isNano ? "text-purple-600" : "text-indigo-600"}/> Prompt
                  </label>
                  {/* Magic Enhance Button */}
                  <button 
                    onClick={handleEnhancePrompt}
                    disabled={enhancing || !prompt}
                    className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 disabled:opacity-50"
                  >
                     {enhancing ? <Loader2 size={12} className="animate-spin"/> : <Wand2 size={12} />}
                     Magia da IA
                  </button>
              </div>
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 h-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none mb-4 text-sm leading-relaxed"
                placeholder={placeholder}
              />
              
              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Sugestões</p>
                <div className="flex flex-wrap gap-2">
                    {suggestions.map(tag => (
                        <button key={tag} onClick={() => setPrompt(p => p + (p ? ', ' : '') + tag)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors">
                            {tag}
                        </button>
                    ))}
                </div>
              </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className={`w-full ${isNano ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'} text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg transition-all mt-4`}
          >
            {loading ? <Loader2 className="animate-spin" /> : (isNano ? <Zap size={20} /> : <ImageIcon size={20} />)}
            {isNano ? 'Gerar Rápido' : 'Gerar Imagem'}
          </button>
        </div>

        {/* Image Output Area */}
        <div className="lg:col-span-2 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center relative overflow-hidden group shadow-inner min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
              <Loader2 className={`animate-spin ${isNano ? 'text-purple-600' : 'text-indigo-600'} mb-4`} size={48} />
              <p className={`${isNano ? 'text-purple-600' : 'text-indigo-600'} font-medium animate-pulse`}>
                  {isNano ? 'Gerando design flash...' : 'Renderizando em alta qualidade...'}
              </p>
            </div>
          )}
          
          {image ? (
            <div className="relative w-full h-full flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
              <img src={image} alt="Generated" className="max-w-full max-h-full object-contain shadow-2xl" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-end">
                 <div className="max-w-[70%]">
                     <p className="text-white/60 text-xs uppercase font-bold mb-1">Prompt</p>
                     <p className="text-white text-sm line-clamp-2 font-medium">{prompt}</p>
                 </div>
                 <a href={image} download="generated-ai.png" className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors shadow-lg">
                    <Download size={16} /> Baixar
                 </a>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 max-w-md p-8">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200">
                <ImageIcon size={40} className="opacity-30" />
              </div>
              <h3 className="text-xl font-bold text-slate-600 mb-2">Pronto para criar</h3>
              <p className="text-slate-500">Selecione um modo e digite seu prompt para começar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;