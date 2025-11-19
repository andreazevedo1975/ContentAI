import React from 'react';
import { Home, Video, Image as ImageIcon, Sparkles, Mic, User, BarChart2, Edit3, Cloud, Zap, Lock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; active: boolean }> = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all mb-1 ${
      active 
        ? 'bg-indigo-50 text-indigo-600 font-semibold' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement, { size: 18, strokeWidth: active ? 2.5 : 2 })}
    <span className="text-sm">{label}</span>
  </Link>
);

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <h3 className="px-3 mt-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
    {label}
  </h3>
);

const Sidebar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50">
      {/* Logo Area */}
      <div className="p-5 flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
            C
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">ContentAI</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <NavItem to="/" icon={<Home />} label="Início" active={path === '/'} />

        <SectionHeader label="Criação" />
        <NavItem to="/video" icon={<Video />} label="Gerador de vídeos" active={path === '/video'} />
        <NavItem to="/image" icon={<ImageIcon />} label="Estúdio de imagem" active={path === '/image'} />
        <NavItem to="/tts" icon={<Mic />} label="Texto para Fala" active={path === '/tts'} />
        <NavItem to="/inspiration" icon={<Sparkles />} label="Inspiração" active={path === '/inspiration'} />
        <NavItem to="/avatars" icon={<User />} label="Avatares e vozes" active={path === '/avatars'} />

        <SectionHeader label="Gerenciamento" />
        <NavItem to="/analytics" icon={<BarChart2 />} label="Análise" active={path === '/analytics'} />
        <NavItem to="/editor" icon={<Edit3 />} label="Editor" active={path === '/editor'} />

        <SectionHeader label="Espaço" />
        <NavItem to="/resources" icon={<Cloud />} label="Recursos & Tools" active={path.startsWith('/resources') || path === '/live' || path === '/research' || path === '/locations' || path === '/video-analysis'} />
      </nav>
    </div>
  );
};

export default Sidebar;