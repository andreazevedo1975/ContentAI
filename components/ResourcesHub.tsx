import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, Search, MapPin, Video, ArrowRight } from 'lucide-react';

const ResourceCard: React.FC<{ to: string; icon: React.ReactNode; title: string; desc: string; color: string }> = ({ to, icon, title, desc, color }) => (
  <Link to={to} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 mb-6 flex-1">{desc}</p>
    <div className="flex items-center text-sm font-bold text-indigo-600 gap-2">
      Acessar <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
    </div>
  </Link>
);

const ResourcesHub: React.FC = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Recursos Avançados de IA</h1>
        <p className="text-slate-500">Ferramentas poderosas utilizando os modelos mais recentes do Google (Gemini 3 Pro, Live API).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ResourceCard 
          to="/live"
          icon={<Mic size={24} />}
          title="Assistente Live"
          desc="Converse em tempo real por voz com baixa latência usando a Live API."
          color="bg-red-500"
        />
        <ResourceCard 
          to="/research"
          icon={<Search size={24} />}
          title="Pesquisa Profunda"
          desc="Use o Thinking Mode e Google Search para relatórios de mercado detalhados."
          color="bg-blue-500"
        />
        <ResourceCard 
          to="/locations"
          icon={<MapPin size={24} />}
          title="Scouting de Locais"
          desc="Encontre os melhores lugares para gravações usando dados do Google Maps."
          color="bg-green-500"
        />
        <ResourceCard 
          to="/video-analysis"
          icon={<Video size={24} />}
          title="Análise de Vídeo"
          desc="Use o Gemini 3 Pro para entender e extrair informações dos seus vídeos."
          color="bg-purple-500"
        />
      </div>
    </div>
  );
};

export default ResourcesHub;