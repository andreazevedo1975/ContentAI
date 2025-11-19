import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { generateSocialPlan } from '../services/geminiService';
import { CalendarPost } from '../types';

const PlatformItem: React.FC<{ name: string; colorClass: string; iconSrc: string }> = ({ name, colorClass, iconSrc }) => (
  <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${colorClass} shadow-sm`}>
        <img src={iconSrc} alt={name} className="w-3.5 h-3.5 brightness-0 invert" />
    </div>
    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{name}</span>
  </div>
);

const CalendarEvent: React.FC<{ title: string; time: string; colorClass: string; iconSrc: string }> = ({ title, time, colorClass, iconSrc }) => (
    <div className="mt-1.5 p-1.5 bg-white border border-slate-100 rounded-md shadow-sm flex gap-2 items-start animate-in fade-in slide-in-from-top-2">
        <div className={`w-3 h-3 rounded-full ${colorClass} flex items-center justify-center shrink-0 mt-0.5`}>
             <img src={iconSrc} className="w-1.5 h-1.5 brightness-0 invert" />
        </div>
        <div className="min-w-0">
            <p className="text-[8px] font-bold text-slate-700 truncate leading-tight">{title}</p>
            <p className="text-[7px] text-slate-400">{time}</p>
        </div>
    </div>
)

const Publisher: React.FC = () => {
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<CalendarPost[]>([]);

  const handleGeneratePlan = async () => {
    if (!niche) return;
    setLoading(true);
    try {
        const result = await generateSocialPlan(niche);
        if (result.posts) {
            setPosts(result.posts);
        }
    } catch (error) {
        alert("Could not generate plan. Try again.");
    } finally {
        setLoading(false);
    }
  };

  const getPlatformIcon = (p: string) => {
      if (p === 'TikTok') return "https://cdn-icons-png.flaticon.com/512/3046/3046121.png";
      if (p === 'Instagram') return "https://cdn-icons-png.flaticon.com/512/2111/2111463.png";
      return "https://cdn-icons-png.flaticon.com/512/596/596876.png";
  }

  const getPlatformColor = (p: string) => {
      if (p === 'TikTok') return "bg-black";
      if (p === 'Instagram') return "bg-gradient-to-br from-yellow-400 to-pink-600";
      return "bg-blue-600";
  }

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen flex flex-col animate-fade-in">
        {/* Header */}
      <div className="flex items-center gap-3 mb-12">
        <h1 className="text-2xl font-bold text-slate-900">Publicador</h1>
      </div>

      <div className="flex flex-col lg:flex-row items-start justify-between gap-16 mt-8">
           {/* Left Column: Controls */}
        <div className="flex-1 max-w-lg">
            <h2 className="text-3xl font-bold text-slate-900 leading-tight mb-6">
                Gerencie suas publicações nas plataformas sociais em um só lugar.
            </h2>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-2">Nicho ou Tópico da Marca</label>
                <div className="flex gap-2">
                    <input 
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        placeholder="Ex: Cafeteria Artesanal, Loja de Sapatos..." 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-indigo-500"
                    />
                    <button 
                        onClick={handleGeneratePlan}
                        disabled={loading || !niche}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16} />}
                        Gerar Plano
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">A IA irá preencher o calendário com ideias de posts para o mês.</p>
            </div>

            <div className="space-y-4 opacity-70">
                <div className="flex items-start gap-3">
                     <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                     <div>
                        <h4 className="font-bold text-slate-800 text-sm">Planejamento Automático</h4>
                        <p className="text-xs text-slate-500">Deixe o Gemini organizar sua estratégia de postagem.</p>
                     </div>
                </div>
            </div>
        </div>

        {/* Right Visual: Functional Calendar */}
         <div className="flex-1 relative w-full max-w-md lg:max-w-xl h-[600px]">
             <div className="absolute w-[480px] h-[480px] bg-[#6366f1] rounded-full opacity-100 lg:translate-x-8 translate-y-12 -z-10" />

             <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-6 w-full h-full border border-slate-100 flex flex-col">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <h3 className="font-bold text-slate-900 text-lg">Publishing</h3>
                    <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 cursor-pointer hover:bg-slate-100">
                        <ChevronLeft size={16} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">Current Month</span>
                        <ChevronRight size={16} className="text-slate-400" />
                    </div>
                </div>

                {/* Calendar Grid Header */}
                <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-slate-400 uppercase mb-2 text-center border-b border-slate-100 pb-2 shrink-0">
                    {['S','M','T','W','T','F','S'].map(d => <div key={d}>{d}</div>)}
                </div>

                {/* Calendar Grid Body */}
                <div className="grid grid-cols-7 grid-rows-5 gap-px bg-slate-100 border border-slate-100 rounded-lg overflow-hidden flex-1">
                    {Array.from({ length: 35 }).map((_, i) => {
                        const day = i + 1;
                        // Find posts for this day (mapped simply for demo, assuming standard month layout)
                        const dayPosts = posts.filter(p => p.day === day);
                        
                        return (
                            <div key={i} className="bg-white p-1 min-h-[60px] flex flex-col relative group hover:bg-slate-50 transition-colors">
                                <span className={`text-[10px] font-bold mb-1 ${dayPosts.length > 0 ? 'text-slate-800' : 'text-slate-300'}`}>{day <= 30 ? day : ''}</span>
                                {day <= 30 && dayPosts.map((post, idx) => (
                                    <div key={idx} className="mb-1">
                                        <div className={`w-full h-1.5 rounded-full ${getPlatformColor(post.platform)} mb-0.5`} title={post.platform} />
                                        <p className="text-[6px] leading-none truncate text-slate-600 font-medium">{post.title}</p>
                                    </div>
                                ))}
                            </div>
                        )
                    })}
                </div>
             </div>
         </div>
      </div>
    </div>
  )
}

export default Publisher;