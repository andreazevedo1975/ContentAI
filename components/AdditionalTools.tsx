
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Video, Image as ImageIcon, Mic, Split, ArrowRight, X, Upload, Check, Monitor, Smartphone, Square, RectangleHorizontal, Sparkles } from 'lucide-react';

// --- Compare Slider Component ---
const CompareSlider: React.FC<{ before: string; after: string; alt: string; isVintage?: boolean; isNoisy?: boolean }> = ({ before, after, alt, isVintage, isNoisy }) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleMove = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(event.target.value));
  };

  return (
    <div className="relative w-full h-full overflow-hidden group">
      {/* AFTER Image (Background) */}
      <img 
        src={after} 
        alt={`${alt} After`} 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* BEFORE Image Container (Foreground - Clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
          <img 
            src={before} 
            alt={`${alt} Before`} 
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Vintage Scratches Overlay (CSS Procedural) */}
          {isVintage && (
            <div className="absolute inset-0 pointer-events-none opacity-60 mix-blend-screen" 
                 style={{
                    backgroundImage: `
                        repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px),
                        radial-gradient(circle, transparent 50%, rgba(100,50,0,0.2) 100%)
                    `,
                    filter: 'contrast(1.5) sepia(0.3)'
                 }}
            >
                <div className="absolute top-1/4 left-0 w-full h-[1px] bg-white/40 rotate-12 blur-[1px]"></div>
                <div className="absolute top-3/4 left-0 w-full h-[1px] bg-white/30 -rotate-6 blur-[1px]"></div>
            </div>
          )}

          {/* Noise Overlay */}
          {isNoisy && (
              <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay" 
                    style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    filter: 'contrast(1.2)'
                    }}
              ></div>
          )}
      </div>

      {/* Slider Line */}
      <div 
        className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1.5 rounded-full shadow-lg flex items-center justify-center">
          <Split size={14} className="text-indigo-600" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 bg-black/60 text-white text-[9px] font-bold px-2 py-1 rounded backdrop-blur-sm z-10 pointer-events-none border border-white/10">
        Antes
      </div>
      <div className="absolute top-3 right-3 bg-indigo-600/80 text-white text-[9px] font-bold px-2 py-1 rounded backdrop-blur-sm z-10 pointer-events-none border border-white/10">
        Depois (IA)
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={handleMove}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
      />
    </div>
  );
};

// --- Workflow Modal Component ---
const ToolWorkflowModal: React.FC<{ 
    tool: typeof TOOLS[0]; 
    onClose: () => void; 
    onExecute: (data: { prompt: string; aspectRatio: string; imageBase64?: string }) => void 
}> = ({ tool, onClose, onExecute }) => {
    const [prompt, setPrompt] = useState(tool.prompt);
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setSelectedFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    const handleExecuteClick = () => {
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string); // Keep full data url for internal state passing
                onExecute({ prompt, aspectRatio, imageBase64: base64 });
            };
            reader.readAsDataURL(selectedFile);
        } else {
            onExecute({ prompt, aspectRatio });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-5xl h-[90vh] md:h-auto md:max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">{tool.title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    {/* Left Column: Inputs */}
                    <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto bg-white flex flex-col gap-6">
                        
                        {/* Description Input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Descrição (Prompt)</label>
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Descreva o que você deseja criar..."
                            />
                        </div>

                        {/* Reference Image Input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Imagem de Referência <span className="text-slate-300 normal-case">(opcional)</span></label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-colors relative overflow-hidden group"
                            >
                                {preview ? (
                                    <>
                                        <img src={preview} className="w-full h-full object-contain p-2" alt="Upload preview" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-bold flex items-center gap-2"><Upload size={14}/> Trocar Imagem</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 mb-3 shadow-sm">
                                            <Upload size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">Carregar imagem</span>
                                        <span className="text-[10px] text-slate-400 mt-2">Arraste ou clique para enviar</span>
                                    </>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*"/>
                            </div>
                        </div>

                        {/* Aspect Ratio Pills */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Proporção (Aspect Ratio)</label>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { label: '16:9', icon: <Monitor size={14}/> },
                                    { label: '1:1', icon: <Square size={14}/> },
                                    { label: '3:2', icon: <RectangleHorizontal size={14}/> },
                                    { label: '9:16', icon: <Smartphone size={14}/> }
                                ].map((ratio) => (
                                    <button
                                        key={ratio.label}
                                        onClick={() => setAspectRatio(ratio.label)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                                            aspectRatio === ratio.label 
                                            ? 'border-indigo-600 text-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
                                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        {ratio.icon} {ratio.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Preview Image */}
                    <div className="w-full md:w-1/2 bg-slate-50 p-6 md:p-8 flex items-center justify-center border-t md:border-t-0 md:border-l border-slate-100">
                        <div className="relative w-full h-full max-h-[500px] rounded-xl overflow-hidden shadow-lg border border-slate-200/50">
                             <img src={tool.image} alt="Preview" className="w-full h-full object-cover" />
                             <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                 <p className="text-white font-bold text-lg">{tool.title}</p>
                                 <p className="text-white/70 text-xs mt-1 line-clamp-2">{tool.prompt}</p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
                    <button 
                        onClick={onClose}
                        className="text-slate-500 font-bold text-sm px-6 py-3 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                        Voltar
                    </button>
                    <button 
                        onClick={handleExecuteClick}
                        className="bg-slate-900 text-white font-bold text-sm px-8 py-3 rounded-xl hover:bg-black transition-transform hover:scale-105 shadow-lg"
                    >
                        Executar workflow
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- DATA ---
// Using strictly Unsplash for reliability. No generic IDs or broken Freepik links.
const TOOLS = [
  { 
    id: 1, 
    title: "Gerador de Animais 3D", 
    type: "image", 
    image: "https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&w=600&q=80", 
    prompt: "Cute 3D rendered animal toy, pixar style, vibrant colors", 
    badge: "Novo" 
  },
  { 
    id: 2, 
    title: "Alterar Expressão Facial", 
    type: "edit", 
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80", 
    prompt: "Change facial expression to a wide happy smile", 
    compare: true,
    // Using two different men who look somewhat compatible for the demo concept of "Expression Change"
    beforeImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80", // Serious
    afterImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"  // Smiling
  },
  { 
    id: 3, 
    title: "Alterar Plano de Fundo", 
    type: "edit", 
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80", 
    prompt: "Change background to a professional audio studio context", 
    compare: true,
    beforeImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80", // Simple bg
    afterImage: "https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?auto=format&fit=crop&w=600&q=80" // Context bg (using similar watch concept/feel)
  },
  { 
    id: 50, 
    title: "Redução de Ruído (Denoise)", 
    type: "edit", 
    image: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=600&q=80", 
    prompt: "Denoise image, remove grain, smooth textures, high clarity, photorealistic", 
    compare: true,
    isNoisy: true,
    beforeImage: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=600&q=80", // Forest
    afterImage: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=600&q=80" // Forest (Same, overlay handles noise)
  },
  { 
    id: 13, 
    title: "Remover Texto da Imagem", 
    type: "edit", 
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80", 
    prompt: "Remove text overlay, clean background", 
    compare: true,
    beforeImage: "https://images.unsplash.com/photo-1555445054-dab9940f89b6?auto=format&fit=crop&w=600&q=80", // Image with sign/text
    afterImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80" // Clean look
  },
  { 
    id: 6, 
    title: "Restaurar Fotos Antigas", 
    type: "image", 
    image: "https://images.unsplash.com/photo-1548366086-7f1b76106622?auto=format&fit=crop&w=600&q=80", 
    prompt: "Restored vintage photograph, high quality, remove scratches, colorize", 
    compare: true,
    isVintage: true,
    beforeImage: "https://images.unsplash.com/photo-1548366086-7f1b76106622?auto=format&fit=crop&w=600&q=80&sat=-100&sepia=50&blur=1", 
    afterImage: "https://images.unsplash.com/photo-1548366086-7f1b76106622?auto=format&fit=crop&w=600&q=80&sat=0"
  },
  { 
    id: 9, 
    title: "Converter para P&B", 
    type: "edit", 
    image: "https://images.unsplash.com/photo-1503218751919-1ea90572e609?auto=format&fit=crop&w=600&q=80&sat=-100", 
    prompt: "Convert to artistic black and white", 
    compare: true,
    beforeImage: "https://images.unsplash.com/photo-1503218751919-1ea90572e609?auto=format&fit=crop&w=600&q=80", 
    afterImage: "https://images.unsplash.com/photo-1503218751919-1ea90572e609?auto=format&fit=crop&w=600&q=80&sat=-100"
  },
  { 
    id: 14, 
    title: "Colorir Foto", 
    type: "edit", 
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80", 
    prompt: "Colorize black and white photo", 
    compare: true,
    beforeImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80&sat=-100", 
    afterImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80" 
  },
  { 
    id: 32, 
    title: "Expansor de Imagens", 
    type: "edit", 
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80", 
    prompt: "Outpaint image, expand borders landscape", 
    compare: true,
    beforeImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&h=300&q=80", 
    afterImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" 
  },
  { id: 5, title: "Vídeo de Carro UGC", type: "video", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80", prompt: "UGC style video review of a car interior, woman speaking to camera in car" },
  { id: 7, title: "Selfie Influencer", type: "image", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80", prompt: "Influencer selfie holding a product, cozy bright room, smiling, authentic look" },
  { id: 16, title: "Sessão de Produtos", type: "image", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80", prompt: "Professional product photography" },
  { id: 19, title: "Repórter de Notícias", type: "video", image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80", prompt: "News reporter avatar speaking", badge: "Avatar" },
  { id: 25, title: "Apresentador de Vídeo", type: "video", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80", prompt: "Professional presenter talking", badge: "Avatar" },
  { id: 27, title: "Gerador de Trilha Sonora", type: "audio", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80", prompt: "Generate background music", badge: "Audio" }
];

const ModelCard: React.FC<{ item: typeof TOOLS[0]; onClick: () => void }> = ({ item, onClick }) => (
  <div 
    onClick={onClick}
    className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 bg-slate-100 mb-6"
  >
    <div className="relative aspect-[3/4] overflow-hidden bg-slate-200">
        {item.compare && item.beforeImage && item.afterImage ? (
            <CompareSlider 
              before={item.beforeImage} 
              after={item.afterImage} 
              alt={item.title}
              isVintage={(item as any).isVintage}
              isNoisy={(item as any).isNoisy}
            />
        ) : (
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
        )}

        {/* Badge */}
        {item.badge && (
            <div className="absolute top-3 left-3 z-20">
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide">
                    {item.badge}
                </span>
            </div>
        )}

        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-20">
            <h3 className="text-white font-bold text-sm leading-tight mb-1">{item.title}</h3>
            <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider flex items-center gap-1">
               {item.type === 'video' ? <Video size={10}/> : item.type === 'audio' ? <Mic size={10}/> : <ImageIcon size={10}/>}
               {item.type === 'edit' ? 'Edição de IA' : item.type}
            </p>
        </div>
    </div>
  </div>
);

const AdditionalTools: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Explorar');
  const [selectedTool, setSelectedTool] = useState<typeof TOOLS[0] | null>(null);

  const handleToolClick = (tool: typeof TOOLS[0]) => {
      setSelectedTool(tool);
  };

  const handleExecuteWorkflow = (data: { prompt: string; aspectRatio: string; imageBase64?: string }) => {
      if (!selectedTool) return;

      // Close modal
      setSelectedTool(null);

      // Navigate logic based on tool type
      switch(selectedTool.type) {
          case 'video':
              navigate('/video', { state: { mode: 'marketing', prompt: data.prompt, aspectRatio: data.aspectRatio, image: data.imageBase64 } });
              break;
          case 'image':
              navigate('/image', { state: { mode: 'product', prompt: data.prompt, image: data.imageBase64 } });
              break;
          case 'edit':
              navigate('/image', { state: { mode: 'design', prompt: data.prompt, image: data.imageBase64 } });
              break;
          case 'audio':
              navigate('/tts'); // TTS typically doesn't take visual prompt, but could be adapted
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
                    placeholder="Buscar modelos..." 
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
              <ModelCard 
                key={tool.id} 
                item={tool} 
                onClick={() => handleToolClick(tool)} 
              />
          ))}
      </div>

      {filteredTools.length === 0 && (
          <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Search size={32}/>
              </div>
              <p className="text-slate-500 font-medium">Nenhum modelo encontrado.</p>
          </div>
      )}

      {/* Workflow Modal */}
      {selectedTool && (
          <ToolWorkflowModal 
            tool={selectedTool} 
            onClose={() => setSelectedTool(null)} 
            onExecute={handleExecuteWorkflow}
          />
      )}

    </div>
  );
};

export default AdditionalTools;
