import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Sparkles, ArrowRight, Box, Camera, Video, User, Mic } from 'lucide-react';

// --- Components ---

const GreetingHeader = () => (
  <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 animate-fade-in">
    <div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 border border-white/60 backdrop-blur-md shadow-sm mb-5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600">Gemini 2.5 & Veo 3.1 Online</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight font-display leading-[1.1]">
          Materialize sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">Imaginação</span><br/> 
          sem limites.
        </h1>
    </div>
  </div>
);

interface BentoCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  imageSrc: string;
  to: string;
  state?: any;
  className?: string;
  gradient?: string;
}

const BentoCard: React.FC<BentoCardProps> = ({ title, subtitle, icon, badge, imageSrc, to, state, className, gradient }) => (
  <Link 
    to={to} 
    state={state} 
    className={`glass-card relative group overflow-hidden rounded-[32px] p-1 flex flex-col ${className} border-white/40 bg-white/40 hover:bg-white/60`}
  >
    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-0" style={{ backgroundImage: gradient || 'linear-gradient(to bottom right, #6366f1, #ec4899)' }}></div>
    
    {/* Image Background Layer */}
    <div className="absolute inset-0 z-0">
        <img src={imageSrc} alt={title} className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-1000 ease-out mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/30 to-transparent"></div>
    </div>

    {/* Content */}
    <div className="relative z-10 p-8 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
            <div className={`w-14 h-14 rounded-2xl bg-white/70 backdrop-blur-md border border-white/50 flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-500/5 group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            {badge && (
                <span className="px-3 py-1.5 rounded-lg bg-white/60 border border-white backdrop-blur-md text-[10px] font-extrabold uppercase tracking-widest text-slate-800 shadow-sm">
                    {badge}
                </span>
            )}
        </div>
        
        <div className="mt-auto pt-10">
             <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-indigo-800 transition-colors font-display tracking-tight">{title}</h3>
             <p className="text-sm text-slate-600 font-medium leading-relaxed">{subtitle}</p>
        </div>

        {/* Action Button (Visible on Hover) */}
        <div className="absolute bottom-8 right-8 w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-2xl">
            <ArrowRight size={20} />
        </div>
    </div>
  </Link>
);

const Dashboard: React.FC = () => {
  return (
    <div className="p-8 md:p-12 w-full max-w-[1800px] mx-auto pb-32 animate-fade-in">
      <GreetingHeader />

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 grid-auto-rows-[340px]">
        
        {/* Large Hero Card - Video */}
        <BentoCard 
            className="md:col-span-2 bg-indigo-50/30"
            title="Vídeo de Marketing" 
            subtitle="Crie comerciais cinematográficos com Veo 3.1 e roteiros inteligentes."
            icon={<Video size={28}/>}
            badge="Sora Class Quality"
            imageSrc="https://images.unsplash.com/photo-1626785774573-4b79931fd95f?auto=format&fit=crop&w=800&q=80"
            to="/video"
            state={{ mode: 'marketing' }}
            gradient="linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
        />

        {/* Vertical Card - Avatar */}
        <BentoCard 
            className="md:row-span-1 bg-purple-50/30"
            title="Avatar Humano" 
            subtitle="Apresentadores realistas."
            icon={<User size={28}/>}
            imageSrc="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80"
            to="/video"
            state={{ mode: 'avatar' }}
        />

         {/* Card - Product Photo */}
        <BentoCard 
            className="bg-blue-50/30"
            title="Foto de Produto" 
            subtitle="Estúdio virtual Imagen 3."
            icon={<Camera size={28}/>}
            imageSrc="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
            to="/image"
            state={{ mode: 'product' }}
        />

        {/* Card - Talking Photo */}
        <BentoCard 
            className="bg-pink-50/30"
            title="Foto Falante" 
            subtitle="Anime retratos estáticos."
            icon={<Mic size={28}/>}
            badge="Preview Mode"
            imageSrc="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"
            to="/video"
            state={{ mode: 'talking_photo' }}
        />

        {/* Wide Card - AI Design */}
        <BentoCard 
            className="md:col-span-2 bg-amber-50/30"
            title="Design Instantâneo" 
            subtitle="Geração ultra-rápida com Nano Banana para social media."
            icon={<Box size={28}/>}
            badge="Flash Image"
            imageSrc="https://images.unsplash.com/photo-1558655146-d09347e0c766?auto=format&fit=crop&w=800&q=80"
            to="/image"
            state={{ mode: 'design' }}
            gradient="linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)"
        />

        {/* Card - Showcase */}
        <BentoCard 
            className="bg-teal-50/30"
            title="Vitrine 360º" 
            subtitle="Vídeos de produto dinâmicos."
            icon={<Sparkles size={28}/>}
            imageSrc="https://images.unsplash.com/photo-1505740420926-4d673942470d?auto=format&fit=crop&w=600&q=80"
            to="/video"
            state={{ mode: 'showcase' }}
        />

      </div>
      
      {/* Footer / Promo */}
      <div className="mt-16 p-1 rounded-[32px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-2xl">
          <div className="bg-white/90 backdrop-blur-xl rounded-[28px] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
               <div>
                   <h2 className="text-3xl font-black text-slate-900 mb-3 font-display tracking-tight">Pronto para o próximo nível?</h2>
                   <p className="text-slate-600 text-lg font-medium">Desbloqueie o potencial do Gemini 3 Pro com nossas ferramentas de pesquisa de mercado.</p>
               </div>
               <Link to="/resources" className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold shadow-xl hover:scale-105 hover:bg-black transition-all flex items-center gap-3 text-lg">
                   Explorar Ferramentas Pro <Sparkles size={20} className="text-amber-400 fill-amber-400 animate-pulse"/>
               </Link>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;