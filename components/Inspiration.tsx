import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, Filter, Sparkles, Heart } from 'lucide-react';

// Mock Data for Stories (Top Dark Section)
const STORIES = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  image: `https://images.unsplash.com/photo-${
    [
      '1611162616305-c69b3fa7fbe0', // Fashion / TikTok
      '1542291026-7eec264c27ff', // Product
      '1505740420926-4d673942470d', // Tech
      '1629198688000-71f23e745b6e', // Lifestyle
      '1523275335684-37898b6baf30', // Watch
    ][i % 5]
  }?auto=format&fit=crop&w=200&q=80`,
  title: `Story ${i + 1}`
}));

// Categories and Tags for Filtering
const CATEGORIES = ['Em alta no TikTok', 'Modelos de vídeo', 'Modelos de imagem'];
const TAGS = ['E-commerce', 'Educação', 'Beleza', 'Moda', 'Comida', 'Tech', 'Viagem'];

// Enhanced Mock Data for Grid Items
// Using specific Unsplash IDs to match the titles faithfully
const GRID_ITEMS = Array.from({ length: 60 }).map((_, i) => {
  const themes = [
    { title: "Golden toad", id: "1628151015968-3a4429e9ef04", cat: "Nature" }, // Toad
    { title: "The enchanted tea", id: "1579633657748-0d17d0505191", cat: "Food" }, // Magical Tea
    { title: "Cat That Does Aerobics", id: "1514888286974-6c03e2ca1dba", cat: "Animals" }, // Funny Cat
    { title: "Magical Gold", id: "1610375461490-6799d8085d2a", cat: "Abstract" }, // Gold texture
    { title: "Flexible Glass", id: "1567634262102-18a0961b248a", cat: "Abstract" }, // Glass/Abstract
    { title: "World Inside Fridge", id: "1584269600464-37b1b58a9fe7", cat: "Food" }, // Food inside
    { title: "Neon City Lights", id: "1514565131-fce0801e5785", cat: "City" }, // Neon City
    { title: "Future Tech", id: "1485827404703-89b55fcc595e", cat: "Tech" }, // Robot
    { title: "Eco Lifestyle", id: "1542601906990-b4d3fb7d5b43", cat: "Nature" }, // Green
    { title: "Urban Jungle", id: "1449824913929-2b362a3fec17", cat: "City" }, // Urban Plants
    { title: "Space Odyssey", id: "1446776811953-b23d57bd21aa", cat: "Space" }, // Space
    { title: "Cyberpunk Street", id: "1555680202-c86f0e12f086", cat: "City" } // Cyberpunk
  ];

  const theme = themes[i % themes.length];

  return {
    id: i,
    image: `https://images.unsplash.com/photo-${theme.id}?auto=format&fit=crop&w=400&q=80`,
    title: theme.title,
    duration: `00:${10 + (i % 50)}`,
    isNew: i % 7 === 0,
    category: CATEGORIES[i % CATEGORIES.length],
    tag: TAGS[i % TAGS.length],
    badgeType: i % 3 === 0 ? 'script' : 'clips',
    prompt: `Create a high quality video about ${theme.title} in a viral TikTok style, cinematic lighting.`
  };
});

const Inspiration: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Em alta no TikTok');
  const [activeTag, setActiveTag] = useState('Todos');

  const handleUseTemplate = (prompt: string) => {
      // Navigate to video generator with the prompt
      navigate('/video', { state: { prompt, mode: 'marketing' } });
  };

  const filteredItems = useMemo(() => {
    return GRID_ITEMS.filter(item => {
        // Tab Filter
        if (activeTab === 'Favoritos') {
            if (!item.isNew) return false; // Mock logic for favorites
        } else {
            if (item.category !== activeTab) return false;
        }

        // Tag Filter
        if (activeTag !== 'Todos') {
            if (item.tag !== activeTag) return false;
        }

        return true;
    });
  }, [activeTab, activeTag]);

  return (
    <div className="w-full min-h-screen bg-white animate-fade-in">
      
      {/* Header Title */}
      <div className="px-8 py-6 bg-white flex items-center gap-2">
        <Sparkles className="text-indigo-600" />
        <h1 className="text-2xl font-bold text-slate-900 font-display">Galeria de Inspiração</h1>
      </div>

      {/* Dark Trending Carousel */}
      <div className="bg-slate-900 w-full py-8 px-4 relative overflow-hidden mb-4">
        <div className="max-w-[1800px] mx-auto flex justify-between items-start">
            
            <div className="flex gap-4 overflow-x-auto no-scrollbar flex-1 pr-8 mask-linear-fade-right pb-2">
                {STORIES.map((story) => (
                    <div 
                        key={story.id} 
                        onClick={() => handleUseTemplate(`Create a story based on ${story.title}`)}
                        className="relative flex-shrink-0 w-[110px] h-[180px] rounded-xl overflow-hidden group cursor-pointer border border-white/10 hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all transform hover:-translate-y-1"
                    >
                        <img src={story.image} alt={story.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                            <span className="text-[10px] text-white font-bold truncate block tracking-wide">{story.title}</span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50">
                                 <Play size={14} className="text-white fill-white ml-0.5" />
                             </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:flex w-72 text-right pl-8 border-l border-white/10 h-[160px] flex-col justify-center shrink-0">
                <p className="text-white text-lg font-bold mb-2 leading-tight">
                    Tendências <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">Virais</span>
                </p>
                <p className="text-slate-400 text-xs mb-4">
                    Explore o que está bombando nas redes e crie sua versão com IA.
                </p>
                <div className="flex justify-end">
                    <button onClick={() => handleUseTemplate("Trending TikTok viral video concept")} className="bg-white hover:bg-indigo-50 text-slate-900 text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors shadow-lg shadow-white/10">
                        <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="tiktok" className="w-4 h-4" />
                        Remixar Trend
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm transition-all">
          <div className="px-8 flex items-center gap-8 overflow-x-auto no-scrollbar">
            {['Em alta no TikTok', 'Modelos de vídeo', 'Modelos de imagem', 'Favoritos'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 text-sm font-bold border-b-[3px] transition-all whitespace-nowrap px-1 ${
                        activeTab === tab 
                        ? 'border-indigo-600 text-indigo-700' 
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    {tab}
                </button>
            ))}
          </div>
          
          <div className="px-8 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3 overflow-x-auto">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm shrink-0">
                <Filter size={12} className="text-slate-400"/> Filtros:
             </div>
             
             <button 
                 onClick={() => setActiveTag('Todos')}
                 className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm whitespace-nowrap ${activeTag === 'Todos' ? 'bg-slate-800 text-white ring-2 ring-slate-800 ring-offset-1' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
             >
                 Todos
             </button>

             <div className="h-4 w-px bg-slate-300 mx-1 shrink-0"></div>

             {TAGS.map(tag => (
                 <button 
                    key={tag} 
                    onClick={() => setActiveTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                        activeTag === tag 
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                        : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300'
                    }`}
                 >
                     {tag}
                 </button>
             ))}
          </div>
      </div>

      {/* Masonry Grid */}
      <div className="p-6 bg-slate-50 min-h-[500px]">
        {filteredItems.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Filter size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Nenhum resultado encontrado</h3>
                <p className="text-slate-500 text-sm">Tente ajustar seus filtros para ver mais inspirações.</p>
                <button 
                    onClick={() => { setActiveTag('Todos'); setActiveTab('Em alta no TikTok'); }}
                    className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
                >
                    Limpar filtros
                </button>
            </div>
        ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4 max-w-[1800px] mx-auto animate-fade-in">
                {filteredItems.map((item) => (
                    <div 
                        key={item.id} 
                        onClick={() => handleUseTemplate(item.prompt)}
                        className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-white cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100"
                    >
                        <div className="relative">
                            <img src={item.image} alt={item.title} className="w-full h-auto object-cover" loading="lazy" />
                            
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {item.badgeType === 'script' && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                                    <div className="bg-white/95 backdrop-blur-md shadow-2xl p-3 rounded-xl transform -rotate-2">
                                        <p className="text-center text-[10px] leading-tight font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 uppercase tracking-wider">
                                            Gerar com IA
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Top Labels */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                            {item.isNew && <span className="bg-indigo-500 text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-lg shadow-indigo-500/20">Novo</span>}
                            <span className="bg-black/40 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md border border-white/20">
                                {item.tag}
                            </span>
                        </div>

                        {/* Duration */}
                        <div className="absolute top-3 right-3">
                            <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Clock size={8} /> {item.duration}
                            </span>
                        </div>
                        
                        {/* Hover Details */}
                        <div className="absolute bottom-0 inset-x-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-white text-sm font-bold line-clamp-1">{item.title}</span>
                                    <p className="text-white/70 text-[10px] line-clamp-2 mt-1 leading-tight">{item.prompt}</p>
                                </div>
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-lg hover:scale-110 transition-transform shrink-0 ml-2">
                                    <Play size={12} className="fill-current ml-0.5" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
};

export default Inspiration;