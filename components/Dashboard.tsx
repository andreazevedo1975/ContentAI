import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Sparkles, Gift, Bell, Globe, Database, ArrowRight } from 'lucide-react';

// --- Header Component (Local) ---
const DashboardHeader = () => (
  <header className="flex items-center justify-between mb-8 pt-2">
    <h1 className="text-2xl font-bold text-slate-900">Início</h1>
    {/* User/Credits section removed for personal version */}
  </header>
);

// --- Feature Card Component ---
interface FeatureCardProps {
  title: string;
  badge?: string;
  badgeColor?: string;
  imageSrc: string; 
  colorClass: string;
  to: string;
  state?: any;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, badge, badgeColor = "bg-indigo-500", imageSrc, colorClass, to, state }) => (
  <Link to={to} state={state} className={`relative group overflow-hidden rounded-3xl ${colorClass} transition-all hover:shadow-lg hover:-translate-y-1 h-[280px] flex flex-col justify-between border border-transparent hover:border-indigo-100`}>
    
    {/* Header / Title Area */}
    <div className="p-6 z-10">
        <div className="flex flex-col items-start gap-2">
            <h3 className="font-bold text-slate-900 text-lg leading-tight">{title}</h3>
            {badge && (
                <span className={`inline-block ${badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm`}>
                    {badge}
                </span>
            )}
        </div>
    </div>
    
    {/* Image Area - Centered/Bottom, simulating "floating" element */}
    <div className="relative w-full h-40 flex items-end justify-center pb-4">
         {/* Use mix-blend-multiply to make white backgrounds of jpgs transparent-ish on light bg, 
             and object-contain to prevent cropping */}
         <img 
            src={imageSrc} 
            alt={title} 
            className="h-full max-w-[80%] object-contain transform group-hover:scale-105 transition-transform duration-500 drop-shadow-xl mix-blend-multiply" 
         />
    </div>

    {/* Hover Play/Action Button Overlay */}
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-20 pointer-events-none">
        <div className="w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center text-indigo-600 transform scale-75 group-hover:scale-100 transition-all">
            <Play fill="currentColor" size={24} className="ml-1" />
        </div>
    </div>
  </Link>
);

const Dashboard: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-20">
      <DashboardHeader />

      {/* Announcement Banner */}
      <div className="flex justify-center mb-10">
        <button className="bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 px-5 py-2 rounded-full text-sm font-medium shadow-sm flex items-center gap-2 transition-all hover:shadow-md">
           <Sparkles size={16} className="fill-current text-indigo-500" />
           O Sora 2 e o Veo 3.1 já estão disponíveis
           <ArrowRight size={16} />
        </button>
      </div>

      {/* Hero Text */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
          Olá! O que você está a fim de <span className="text-gradient">criar</span> hoje?
        </h2>
      </div>

      {/* Tools Grid - Synced with Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Vídeo de marketing */}
        <FeatureCard 
            title="Vídeo de marketing" 
            badge="Sora 2 & Veo 3.1"
            badgeColor="bg-indigo-600"
            to="/video"
            state={{ mode: 'marketing' }}
            colorClass="bg-[#f3f4f6]"
            imageSrc="https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" // Purple shoe/item
        />

        {/* 2. Vídeo de avatar */}
        <FeatureCard 
            title="Vídeo de avatar" 
            to="/video"
            state={{ mode: 'avatar' }}
            colorClass="bg-[#f1f5f9]"
            imageSrc="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" // Woman smiling
        />

        {/* 3. Foto falante de IA */}
        <FeatureCard 
            title="Foto falante de IA" 
            to="/video"
            state={{ mode: 'talking_photo' }}
            colorClass="bg-[#f8fafc] border border-slate-100"
            imageSrc="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" // Portrait
        />

        {/* 4. Design de IA */}
        <FeatureCard 
            title="Design de IA" 
            badge="Nano Banana"
            badgeColor="bg-purple-500"
            to="/image"
            state={{ mode: 'design' }}
            colorClass="bg-[#f3f4f6]"
            imageSrc="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" // Abstract 3D
        />

        {/* 5. Foto do produto */}
        <FeatureCard 
            title="Foto do produto" 
            to="/image"
            state={{ mode: 'product' }}
            colorClass="bg-[#f1f5f9]"
            imageSrc="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" // Minimalist bottle
        />

        {/* 6. Vitrine de produtos */}
        <FeatureCard 
            title="Vitrine de produtos" 
            to="/video"
            state={{ mode: 'showcase' }}
            colorClass="bg-[#f8fafc] border border-slate-100"
            imageSrc="https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" // Watch/Product
        />

      </div>
    </div>
  );
};

export default Dashboard;