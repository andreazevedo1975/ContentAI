import React from 'react';
import { Home, Video, Image as ImageIcon, Sparkles, Mic, User, BarChart2, Edit3, Cloud, BookOpen, LayoutGrid, Boxes } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

// Brand Logo Component
const BrandLogo = () => (
  <div className="flex items-center gap-4 px-2">
    <div className="relative w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-white/50">
       {/* Abstract 'AI Spark' Logo */}
       <svg viewBox="0 0 100 100" className="w-8 h-8 drop-shadow-sm">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
          <path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" fill="none" stroke="url(#logoGradient)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="50" cy="50" r="12" fill="url(#logoGradient)" />
       </svg>
    </div>
    <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 font-display">Content<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">AI</span></h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Creative OS 2.0</p>
    </div>
  </div>
);

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; active: boolean; badge?: string }> = ({ to, icon, label, active, badge }) => (
  <Link
    to={to}
    className={`group flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 mb-2 ${
      active 
        ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 shadow-sm border border-indigo-100/50' 
        : 'text-slate-500 hover:bg-white/50 hover:text-slate-900 hover:pl-6'
    }`}
  >
    <div className="flex items-center gap-4">
        <div className={`transition-colors ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`}>
            {React.cloneElement(icon as React.ReactElement, { size: 22, strokeWidth: active ? 2.5 : 2 })}
        </div>
        <span className={`text-[15px] font-medium ${active ? 'font-bold' : ''}`}>{label}</span>
    </div>
    {badge && (
        <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            {badge}
        </span>
    )}
    {active && <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]" />}
  </Link>
);

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <div className="px-5 mt-8 mb-4 flex items-center gap-3">
      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest opacity-80">{label}</span>
      <div className="h-px bg-gradient-to-r from-slate-200 to-transparent flex-1"></div>
  </div>
);

const Sidebar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="hidden md:flex w-80 h-[calc(100vh-3rem)] rounded-[32px] bg-white/70 backdrop-blur-2xl border border-white/50 shadow-xl flex-col fixed left-6 top-6 z-50 overflow-hidden transition-all duration-500">
      {/* Header */}
      <div className="p-8 pb-4">
        <BrandLogo />
      </div>

      {/* Scrollable Nav */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar pb-8">
        <NavItem to="/" icon={<Home />} label="Início" active={path === '/'} />
        <NavItem to="/studio" icon={<LayoutGrid />} label="Estúdio" active={path === '/studio'} />

        <SectionLabel label="Creative Suite" />
        <NavItem to="/video" icon={<Video />} label="Vídeo & Motion" active={path === '/video'} />
        <NavItem to="/image" icon={<ImageIcon />} label="Imagem & Design" active={path === '/image'} />
        <NavItem to="/tools" icon={<Boxes />} label="Modelos & Ferramentas" active={path === '/tools'} badge="AI Hub" />
        <NavItem to="/avatars" icon={<User />} label="Avatares & Voz" active={path === '/avatars'} />
        <NavItem to="/audiobook" icon={<BookOpen />} label="Audiolivros" active={path === '/audiobook'} />
        <NavItem to="/tts" icon={<Mic />} label="Texto para Fala" active={path === '/tts'} />

        <SectionLabel label="Discover" />
        <NavItem to="/inspiration" icon={<Sparkles />} label="Inspiração" active={path === '/inspiration'} badge="New" />
        <NavItem to="/resources" icon={<Cloud />} label="Recursos Pro" active={path.startsWith('/resources')} />

        <SectionLabel label="Workspace" />
        <NavItem to="/analytics" icon={<BarChart2 />} label="Analytics" active={path === '/analytics'} />
        <NavItem to="/editor" icon={<Edit3 />} label="Calendário" active={path === '/editor'} />
      </nav>
      
      {/* No Footer Button - API Key is managed via Environment */}
    </div>
  );
};

export default Sidebar;