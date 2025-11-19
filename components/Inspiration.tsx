import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, Filter } from 'lucide-react';

// Mock Data for Stories (Top Dark Section)
const STORIES = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  image: `https://images.unsplash.com/photo-${
    [
      '1611162616305-c69b3fa7fbe0',
      '1542291026-7eec264c27ff',
      '1505740420926-4d673942470d',
      '1629198688000-71f23e745b6e',
      '1523275335684-37898b6baf30',
    ][i % 5]
  }?auto=format&fit=crop&w=200&q=80`,
  title: `Story ${i + 1}`
}));

// Mock Data for Grid Items
const GRID_ITEMS = Array.from({ length: 30 }).map((_, i) => ({
  id: i,
  image: `https://images.unsplash.com/photo-${
    [
      '1586495777744-4413f21062fa',
      '1618331835717-801e976710b2',
      '1515378791036-0648a3ef77b2',
      '1583511655857-d19b40a7a54e',
      '1620916566398-39f1143ab7be',
      '1596462502278-27bfdd403ea6',
      '1550684848-fac1c5b4e853',
      '1555212697-194d092e3b8f',
    ][i % 8]
  }?auto=format&fit=crop&w=400&q=80`,
  title: [
    "Golden toad", 
    "The enchanted tea", 
    "Cat That Does Aerobics", 
    "Magical Gold", 
    "Flexible Glass", 
    "World Inside Fridge"
  ][i % 6],
  duration: `00:${10 + (i % 50)}`,
  isNew: i % 4 === 0,
  badgeType: i % 3 === 0 ? 'script' : 'clips',
  prompt: `Create a video about ${["Golden toad", "Enchanted tea", "Aerobics cat", "Magical Gold"][i%4]} in a viral TikTok style.`
}));

const Inspiration: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Em alta no TikTok');

  const handleUseTemplate = (prompt: string) => {
      // Navigate to video generator with the prompt
      navigate('/video', { state: { prompt, mode: 'marketing' } });
  };

  return (
    <div className="w-full min-h-screen bg-white animate-fade-in">
      
      {/* Header Title */}
      <div className="px-8 py-6 bg-white">
        <h1 className="text-2xl font-bold text-slate-900">Inspiração</h1>
      </div>

      {/* Dark Trending Carousel */}
      <div className="bg-black w-full py-8 px-4 relative overflow-hidden">
        <div className="max-w-[1800px] mx-auto flex justify-between items-start">
            
            <div className="flex gap-3 overflow-x-auto no-scrollbar flex-1 pr-8 mask-linear-fade-right">
                {STORIES.map((story) => (
                    <div 
                        key={story.id} 
                        onClick={() => handleUseTemplate(`Create a story based on ${story.title}`)}
                        className="relative flex-shrink-0 w-[110px] h-[180px] rounded-lg overflow-hidden group cursor-pointer border border-white/10 hover:border-white/40 transition-all"
                    >
                        <img src={story.image} alt={story.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                            <span className="text-[10px] text-white font-semibold truncate block">{story.title}</span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                 <Play size={12} className="text-white fill-white" />
                             </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block w-64 text-right pl-6 border-l border-white/10 h-[160px] flex flex-col justify-center">
                <p className="text-white text-sm font-medium mb-1">
                    Confira o que é <span className="text-red-500 font-bold bg-red-500/10 px-1 rounded">tendência</span> no TikTok e <br/> crie a sua própria
                </p>
                <div className="flex justify-end mt-3">
                    <button onClick={() => handleUseTemplate("Trending TikTok viral video concept")} className="bg-white hover:bg-gray-100 text-slate-900 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 transition-colors">
                        <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="tiktok" className="w-4 h-4" />
                        Buscar inspiração
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
          <div className="px-8 flex items-center gap-8 overflow-x-auto no-scrollbar">
            {['Em alta no TikTok', 'Modelos de vídeo', 'Modelos de imagem', 'Favoritos'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab 
                        ? 'border-slate-900 text-slate-900' 
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {tab}
                </button>
            ))}
          </div>
          
          <div className="px-8 py-3 bg-slate-50 border-b border-slate-100 flex gap-3 overflow-x-auto">
             <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600 hover:border-slate-300">
                Setor <Filter size={10} />
             </button>
             <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600 hover:border-slate-300">
                Duração <Filter size={10} />
             </button>
             <div className="h-6 w-px bg-slate-300 mx-2"></div>
             {['E-commerce', 'Educação', 'Beleza', 'Moda', 'Comida'].map(tag => (
                 <button key={tag} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors whitespace-nowrap">
                     {tag}
                 </button>
             ))}
          </div>
      </div>

      {/* Masonry Grid */}
      <div className="p-6 bg-slate-50">
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-6 gap-4 space-y-4 max-w-[1800px] mx-auto">
            {GRID_ITEMS.map((item) => (
                <div 
                    key={item.id} 
                    onClick={() => handleUseTemplate(item.prompt)}
                    className="break-inside-avoid relative group rounded-xl overflow-hidden bg-white shadow-sm cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="relative">
                        <img src={item.image} alt={item.title} className="w-full h-auto object-cover" />
                        
                        {item.badgeType === 'script' && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4 pointer-events-none">
                                <div className="bg-white/90 backdrop-blur-sm border-2 border-white shadow-lg p-2 rounded-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
                                     <p className="text-center text-[10px] leading-tight font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                        AI GENERATES<br/>SCRIPT & SPEECH!
                                     </p>
                                </div>
                            </div>
                        )}

                         {item.badgeType === 'clips' && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4 pointer-events-none">
                                <div className="bg-yellow-300/90 backdrop-blur-sm border-2 border-white shadow-lg px-3 py-2 rounded-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-300">
                                     <p className="text-center text-[10px] leading-tight font-black text-yellow-900">
                                        USE YOUR CLIPS
                                     </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                        {item.isNew && <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">Novo</span>}
                    </div>

                    <div className="absolute top-2 right-2">
                         <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Clock size={8} /> {item.duration}
                         </span>
                    </div>
                    
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-between items-end">
                        <span className="text-white text-xs font-bold truncate flex-1">{item.title}</span>
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-sm hover:scale-110 transition-transform">
                             <Play size={10} className="fill-current ml-0.5" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
};

export default Inspiration;