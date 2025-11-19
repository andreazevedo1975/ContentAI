import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, Search, MapPin, Video, ArrowRight } from 'lucide-react';

const ResourceCard: React.FC<{ to: string; icon: React.ReactNode; title: string; desc: string; color: string }> = ({ to, icon, title, desc, color }) => (
  <Link to={to} className="glass-card p-8 rounded-3xl flex flex-col hover:border-indigo-200 group">
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">{title}</h3>
    <p className="text-sm text-slate-500 mb-8 flex-1 leading-relaxed">{desc}</p>
    <div className="flex items-center text-sm font-bold text-indigo-600 gap-2 mt-auto group-hover:gap-3 transition-all">
      Acessar Ferramenta <ArrowRight size={16} />
    </div>
  </Link>
);

const ResourcesHub: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-3 font-display">Recursos Avançados</h1>
        <p className="text-slate-500 text-lg max-w-2xl">Ferramentas de nível empresarial utilizando os modelos mais recentes do Google (Gemini 3 Pro, Live API).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <ResourceCard 
          to="/live"
          icon={<Mic size={28} />}
          title="Assistente Live"
          desc="Converse em tempo real por voz com baixa latência usando a Live API nativa."
          color="bg-red-500"
        />
        <ResourceCard 
          to="/research"
          icon={<Search size={28} />}
          title="Pesquisa Profunda"
          desc="Use o Thinking Mode e Google Search para relatórios de mercado detalhados."
          color="bg-blue-500"
        />
        <ResourceCard 
          to="/locations"
          icon={<MapPin size={28} />}
          title="Scouting de Locais"
          desc="Encontre os melhores lugares para gravações usando dados do Google Maps."
          color="bg-green-500"
        />
        <ResourceCard 
          to="/video-analysis"
          icon={<Video size={28} />}
          title="Análise de Vídeo"
          desc="Use o Gemini 3 Pro para entender e extrair informações visuais dos seus vídeos."
          color="bg-purple-500"
        />
      </div>
    </div>
  );
};

export default ResourcesHub;