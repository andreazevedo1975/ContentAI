import React, { useState } from 'react';
import { ChevronDown, Info, ArrowUp, ArrowDown, Sparkles, Loader2 } from 'lucide-react';
import { generateAnalysis } from '../services/geminiService';

// --- Components for the Mock UI on the right ---

const StatCard: React.FC<{ 
  label: string; 
  value: string; 
  trend: string; 
  trendUp: boolean; 
  className?: string 
}> = ({ label, value, trend, trendUp, className }) => (
  <div className={`bg-white p-5 rounded-2xl shadow-lg border border-slate-50 ${className}`}>
    <div className="flex items-center gap-1 text-slate-400 mb-1">
      <span className="text-xs font-semibold">{label}</span>
      <Info size={12} />
    </div>
    <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
    <div className={`text-[10px] font-bold flex items-center gap-1 ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
      <span className="text-slate-400 font-normal">vs last period</span>
      {trendUp ? <ArrowUp size={10} strokeWidth={3} /> : <ArrowDown size={10} strokeWidth={3} />}
      {trend}
    </div>
  </div>
);

const GraphCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`bg-white p-4 rounded-2xl shadow-xl border border-slate-50 ${className}`}>
    <div className="text-xs font-bold text-slate-900 mb-4">Follower growth</div>
    <div className="h-24 w-48 flex items-end gap-2 relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
            <path d="M0,50 L0,40 L20,30 L40,35 L60,20 L80,25 L100,10" fill="none" stroke="#6366f1" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <path d="M0,50 L0,40 L20,30 L40,35 L60,20 L80,25 L100,10 V50 H0" fill="url(#grad)" opacity="0.2" />
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
            </defs>
            <circle cx="20" cy="30" r="1.5" fill="#6366f1" />
            <circle cx="40" cy="35" r="1.5" fill="#6366f1" />
            <circle cx="60" cy="20" r="1.5" fill="#6366f1" />
            <circle cx="80" cy="25" r="1.5" fill="#6366f1" />
            <circle cx="100" cy="10" r="1.5" fill="#6366f1" />
        </svg>
    </div>
  </div>
);

const Analytics: React.FC = () => {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateInsight = async () => {
    setLoading(true);
    // Mock data derived from the UI components
    const metrics = {
        followers: 88680,
        follower_growth: "+18%",
        impressions: 1247,
        impression_growth: "+34%",
        engagement: 1247,
        engagement_growth: "-14%"
    };

    try {
        const text = await generateAnalysis(metrics);
        setInsight(text || "Analysis complete.");
    } catch (e) {
        setInsight("Could not generate insight.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen flex flex-col animate-fade-in">
      
      <div className="flex items-center gap-3 mb-12">
        <h1 className="text-2xl font-bold text-slate-900">Análises</h1>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-16 mt-8">
        
        <div className="flex-1 max-w-lg">
            <h2 className="text-3xl font-bold text-slate-900 leading-tight mb-8">
                Um painel para as suas publicações em todas as plataformas de mídia social.
            </h2>

            <div className="space-y-6 mb-10">
                 {/* Feature List */}
                <div className="pl-4 border-l-2 border-indigo-100">
                    <h3 className="font-bold text-slate-800 text-sm">Por conta</h3>
                    <p className="text-slate-500 text-xs">Métricas de engajamento individuais.</p>
                </div>
                <div className="pl-4 border-l-2 border-indigo-100">
                    <h3 className="font-bold text-slate-800 text-sm">Por publicação</h3>
                    <p className="text-slate-500 text-xs">Stories, posts e reels.</p>
                </div>
            </div>
            
            {/* AI Insight Feature */}
            <div className="bg-indigo-50 p-4 rounded-xl mb-6 border border-indigo-100">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-indigo-900 font-bold text-sm flex items-center gap-2">
                        <Sparkles size={14} /> AI Insights
                    </h4>
                    <button 
                        onClick={handleGenerateInsight}
                        disabled={loading}
                        className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full font-bold hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={12} className="animate-spin"/> : "Gerar"}
                    </button>
                </div>
                <p className="text-xs text-indigo-800 italic leading-relaxed min-h-[40px]">
                    {insight || "Clique em gerar para receber uma análise estratégica dos seus dados atuais."}
                </p>
            </div>

            <button className="bg-black hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg w-fit">
                Conectar Contas
                <ChevronDown size={16} />
            </button>
        </div>

        <div className="flex-1 relative w-full max-w-md lg:max-w-xl h-[500px] flex items-center justify-center">
            <div className="absolute w-[400px] h-[400px] bg-[#6366f1] rounded-full opacity-100 translate-x-12 translate-y-4" />
            
            <div className="relative z-10 w-full h-full">
                {/* Static Cards representing data */}
                <div className="absolute top-10 left-10 z-10 bg-white p-6 rounded-2xl shadow-lg border border-slate-100 w-64">
                    <div className="text-xs font-bold text-slate-500 mb-4">Summary</div>
                    <div className="mb-6">
                        <div className="text-3xl font-bold text-slate-900">88,680</div>
                        <div className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                            <ArrowUp size={10} /> 18%
                        </div>
                    </div>
                </div>

                <GraphCard className="absolute top-32 right-0 z-30 translate-x-4" />
                
                <StatCard 
                    label="Impression" 
                    value="1,247" 
                    trend="34%" 
                    trendUp={true} 
                    className="absolute top-56 left-10 z-20 w-56"
                />

                <StatCard 
                    label="Engagement" 
                    value="1,247" 
                    trend="14%" 
                    trendUp={false} 
                    className="absolute top-80 left-10 z-20 w-56 translate-y-2"
                />
            </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;