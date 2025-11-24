import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowRight, Split, Video, Image as ImageIcon, Mic, Sparkles, Layers } from 'lucide-react';

// Mock Data simulating the screenshot items
const TOOLS = [
  { id: 1, title: "Gerador de Animais", type: "image", image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=400&q=80", prompt: "Cute 3D rendered animal, pixar style", badge: "Novo" },
  { id: 2, title: "Alterar a expressão facial", type: "edit", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", prompt: "Change facial expression to smile", compare: true },
  { id: 3, title: "Alterar plano de fundo", type: "edit", image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80", prompt: "Change background to mars landscape", compare: true },
  { id: 4, title: "Substituir elemento", type: "edit", image: "https://images.unsplash.com/photo-1595461135849-bf08dc93a958?auto=format&fit=crop&w=400&q=80", prompt: "Replace object with...", compare: true },
  { id: 5, title: "Vídeo de carro UGC", type: "video", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80", prompt: "UGC style video review of a car interior, handheld camera" },
  { id: 6, title: "Aprimorador de fotos antigas", type: "image", image: "https://images.unsplash.com/photo-1531844251246-9a1bfaaeeb9a?auto=format&fit=crop&w=400&q=80", prompt: "Restored vintage photograph, high quality, remove scratches", compare: true },
  { id: 7, title: "Selfie de influenciador UGC", type: "image", image: "https://images.unsplash.com/photo-1516726817505-f5ed8259b496?auto=format&fit=crop&w=400&q=80", prompt: "Influencer selfie holding a product, ring light lighting" },
  { id: 8, title: "Desfocar imagem", type: "edit", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80", prompt: "Apply gaussian blur to background", compare: true },
  { id: 9, title: "Converter para P&B", type: "edit", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80", prompt: "Convert to artistic black and white photography", compare: true },
  { id: 10, title: "Transformar em algas", type: "edit", image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=80", prompt: "Style transfer, algae texture overlay", compare: true },
  { id: 11, title: "Foto em desenho animado", type: "image", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80", prompt: "Turn person into a 3D cartoon character", compare: true },
  { id: 12, title: "Foto em esboço", type: "image", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80", prompt: "Pencil sketch style portrait", compare: true },
  { id: 13, title: "Remover texto da imagem", type: "edit", image: "https://images.unsplash.com/photo-1555445054-dab9940f89b6?auto=format&fit=crop&w=400&q=80", prompt: "Remove text overlay, clean background", compare: true },
  { id: 14, title: "Colorir foto", type: "edit", image: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=400&q=80", prompt: "Colorize black and white photo", compare: true },
  { id: 15, title: "Efeito caleidoscópio", type: "edit", image: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=400&q=80", prompt: "Kaleidoscope abstract effect", compare: true },
  { id: 16, title: "Sessão de fotos de produtos", type: "image", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80", prompt: "Professional product photography session", compare: true },
  { id: 17, title: "Substituir fundo por tela verde", type: "edit", image: "https://images.unsplash.com/photo-1535376472810-5d229c65da09?auto=format&fit=crop&w=400&q=80", prompt: "Replace background with chroma key green", compare: true },
  { id: 18, title: "Age Me (Envelhecer)", type: "edit", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80", prompt: "Make person look older, aging effect", compare: true },
  { id: 19, title: "Repórter de notícias", type: "video", image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80", prompt: "News reporter avatar speaking", badge: "Video" },
  { id: 20, title: "Apenas esboços", type: "image", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80", prompt: "Architectural sketch", compare: true },
  { id: 21, title: "Henry: Vídeo do Produto", type: "video", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80", prompt: "Professional presenter Henry talking about product", badge: "Avatar" },
  { id: 22, title: "Do esboço à realidade", type: "image", image: "https://images.unsplash.com/photo-1517423568366-028c497177f1?auto=format&fit=crop&w=400&q=80", prompt: "Turn sketch into photorealistic render", compare: true },
  { id: 23, title: "Cartoon para realista", type: "image", image: "https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&w=400&q=80", prompt: "Turn cartoon into photorealistic human", compare: true },
  { id: 24, title: "Outdoor Mockup", type: "edit", image: "https://images.unsplash.com/photo-1552083375-1447ce886485?auto=format&fit=crop&w=400&q=80", prompt: "Place image on outdoor billboard", compare: true },
  { id: 25, title: "Sandra: Vídeo do Produto", type: "video", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80", prompt: "Professional presenter Sandra talking about product", badge: "Avatar" },
  { id: 26, title: "Dublagem personalizada", type: "audio", image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80", prompt: "Custom voice dubbing", badge: "Audio" },
  { id: 27, title: "Gerador de trilha sonora", type: "audio", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80", prompt: "Generate background music", badge: "Audio" },
  { id: 28, title: "Aprimore uma imagem", type: "edit", image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=400&q=80", prompt: "Upscale and enhance image details", compare: true },
  { id: 29, title: "Podcaster UGC", type: "video", image: "https://images.unsplash.com/photo-1583121833477-06cb66f15238?auto=format&fit=crop&w=400&q=80", prompt: "UGC Podcaster talking into microphone" },
  { id: 30, title: "Produto em mãos", type: "image", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80", prompt: "Hand holding product pov", compare: true },
  { id: 31, title: "Streamer UGC", type: "video", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80", prompt: "Game streamer reacting to screen" },
  { id: 32, title: "Expansor de imagens", type: "edit", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", prompt: "Outpaint image, expand borders", compare: true },
  { id: 33, title: "Foto ao vivo", type: "video", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80", prompt: "Animate static photo", compare: true },
  { id: 34, title: "Remover objeto", type: "edit", image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=400&q=80", prompt: "Remove selected object", compare: true },
  { id: 35, title: "Entrevista de rua UGC", type: "video", image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=400&q=80", prompt: "Street interview UGC style" }
];

const ModelCard: React.FC<{ item: typeof TOOLS[0]; onClick: () => void }> = ({ item, onClick }) => (
  <div 
    onClick={onClick}
    className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 bg-slate-100 mb-6"
  >
    <div className="relative aspect-[3/4] overflow-hidden">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        
        {/* Compare visual effect (Split line) */}
        {item.compare && (
            <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
                <div className="h-full w-0.5 bg-white/50 shadow-[0_0_10px_rgba(0,0,0,0.3)]"></div>
                <div className="absolute bg-white p-1.5 rounded-full shadow-lg">
                    <Split size={14} className="text-slate-600" />
                </div>
                <div className="absolute top-3 left-3 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">Antes</div>
                <div className="absolute top-3 right-3 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">Depois</div>
            </div>
        )}

        {/* Badge */}
        {item.badge && (
            <div className="absolute top-3 left-3">
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide">
                    {item.badge}
                </span>
            </div>
        )}

        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
            <h3 className="text-white font-bold text-sm leading-tight mb-1">{item.title}</h3>
            <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider flex items-center gap-1">
               {item.type === 'video' ? <Video size={10}/> : item.type === 'audio' ? <Mic size={10}/> : <ImageIcon size={10}/>}
               {item.type === 'edit' ? 'Edição' : item.type}
            </p>
        </div>
    </div>
  </div>
);

const AdditionalTools: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Explorar');

  const handleToolClick = (tool: typeof TOOLS[0]) => {
      // Map tool types to existing routes/components
      switch(tool.type) {
          case 'video':
              navigate('/video', { state: { mode: 'marketing', prompt: tool.prompt } });
              break;
          case 'image':
              navigate('/image', { state: { mode: 'product', prompt: tool.prompt } });
              break;
          case 'edit':
              // For edit tools, we go to image studio in 'design' mode which supports upload
              navigate('/image', { state: { mode: 'design', prompt: tool.prompt } });
              break;
          case 'audio':
              navigate('/tts');
              break;
          default:
              navigate('/image');
      }
  };

  const filteredTools = TOOLS.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen animate-fade-in">
      
      <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 font-display mb-6">Modelos & Ferramentas</h1>
          
          {/* Search and Tabs */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
              <div className="flex items-center gap-6 border-b border-slate-200 flex-1 w-full md:w-auto">
                  {['Explorar', 'História'].map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === tab ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                      >
                          {tab}
                      </button>
                  ))}
              </div>
              
              <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Modelos de pesquisa..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                  />
              </div>
          </div>

          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
              {['Todos', 'Vídeo', 'Imagem', 'Áudio', 'Edição', 'UGC', 'Produto', 'Avatar'].map(tag => (
                  <button key={tag} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
                      {tag}
                  </button>
              ))}
          </div>
      </div>

      {/* Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {filteredTools.map(tool => (
              <ModelCard key={tool.id} item={tool} onClick={() => handleToolClick(tool)} />
          ))}
      </div>

      {filteredTools.length === 0 && (
          <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Search size={32}/>
              </div>
              <p className="text-slate-500 font-medium">Nenhum modelo encontrado para "{searchTerm}"</p>
          </div>
      )}

    </div>
  );
};

export default AdditionalTools;