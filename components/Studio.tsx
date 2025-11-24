import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Podcast, 
  Link as LinkIcon, 
  FileText, 
  Video, 
  Music, 
  Captions, 
  VolumeX, 
  Wand2, 
  Plus, 
  Upload, 
  Search, 
  MoreHorizontal,
  Clock
} from 'lucide-react';

const ToolCard: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  desc: string; 
  to?: string;
  colorClass: string; 
}> = ({ icon, title, desc, to, colorClass }) => {
  const Wrapper = to ? Link : 'div';
  return (
    <Wrapper 
      to={to || '#'} 
      className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-4 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white shadow-sm ${colorClass}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-indigo-700 transition-colors">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </Wrapper>
  );
};

const ProjectRow: React.FC<{ title: string; date: string }> = ({ title, date }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors px-2 -mx-2 rounded-lg group cursor-pointer">
    <div className="flex items-center gap-3 overflow-hidden">
       <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
          <FileText size={14}/>
       </div>
       <span className="text-sm font-medium text-slate-700 truncate group-hover:text-indigo-700">{title}</span>
    </div>
    <div className="flex items-center gap-8 text-xs text-slate-400 shrink-0">
       <span>{date}</span>
       <button className="p-1 hover:bg-slate-200 rounded-full transition-colors">
          <MoreHorizontal size={16}/>
       </button>
    </div>
  </div>
);

const Studio: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const recentProjects = [
    { title: "Como incorporar geradores de efeitos sonoros de IA no desenvolvimento de jogos", date: "há 1 hora" },
    { title: "Como usar o modificador de voz da ElevenLabs", date: "há 3 horas" },
    { title: "Um Guia Definitivo para Dublagem de Videogames", date: "há 6 horas" },
    { title: "Melhores geradores de voz para NPCs", date: "anteontem" },
    { title: "O que é um gerador de som com IA?", date: "há 2 semanas" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 font-display">Estúdio</h1>
        <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
                <Upload size={16}/> Carregar
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-black shadow-md transition-all hover:-translate-y-0.5">
                <Plus size={16}/> Novo projeto em branco
            </button>
        </div>
      </div>

      {/* Audio Tools Section */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Áudio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ToolCard 
                icon={<BookOpen size={20}/>}
                title="Novo audiolivro"
                desc="Comece do zero ou importe arquivos"
                to="/audiobook"
                colorClass="bg-blue-500"
            />
            <ToolCard 
                icon={<Podcast size={20}/>}
                title="Criar um podcast"
                desc="Gerar automaticamente um podcast a partir de documentos ou URLs"
                to="/tts"
                colorClass="bg-sky-500"
            />
            <ToolCard 
                icon={<LinkIcon size={20}/>}
                title="URL para áudio"
                desc="Crie uma locução em qualquer página da web"
                to="/tts"
                colorClass="bg-indigo-500"
            />
            <ToolCard 
                icon={<FileText size={20}/>}
                title="Gerador de Roteiro com IA"
                desc="Gere um roteiro a partir de um prompt"
                to="/editor"
                colorClass="bg-blue-600"
            />
        </div>
      </div>

      {/* Video Tools Section */}
      <div className="mb-12">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Vídeo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ToolCard 
                icon={<Video size={20}/>}
                title="Nova locução para vídeo"
                desc="Adicione narração aos seus vídeos"
                to="/video"
                colorClass="bg-purple-500"
            />
            <ToolCard 
                icon={<Music size={20}/>}
                title="Adicionar efeitos sonoros e música"
                desc="Adicione locuções, músicas e efeitos sonoros"
                to="/video"
                colorClass="bg-pink-500"
            />
            <ToolCard 
                icon={<Captions size={20}/>}
                title="Legendas Automáticas"
                desc="Legendas automáticas para o seu vídeo"
                to="/video"
                colorClass="bg-orange-500"
            />
            <ToolCard 
                icon={<VolumeX size={20}/>}
                title="Remover o ruído de fundo"
                desc="Limpe vídeos com ruído"
                to="/audiobook" 
                colorClass="bg-rose-500"
            />
            <ToolCard 
                icon={<Wand2 size={20}/>}
                title="Corrija erros de locução"
                desc="Use correção de fala para corrigir erros"
                to="/tts"
                colorClass="bg-violet-500"
            />
        </div>
      </div>

      {/* Recent Projects Section */}
      <div>
          <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Projetos Recentes</h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Search Bar */}
              <div className="p-4 border-b border-slate-100">
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Buscar..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                  </div>
              </div>

              {/* List Header */}
              <div className="flex justify-between px-6 py-3 bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Título</span>
                  <span>Criado em</span>
              </div>

              {/* List Items */}
              <div className="px-4">
                  {recentProjects
                    .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((project, i) => (
                      <ProjectRow key={i} title={project.title} date={project.date} />
                  ))}
                  
                  {recentProjects.length === 0 && (
                      <div className="py-10 text-center text-slate-400 text-sm">Nenhum projeto encontrado.</div>
                  )}
              </div>
          </div>
      </div>

    </div>
  );
};

export default Studio;