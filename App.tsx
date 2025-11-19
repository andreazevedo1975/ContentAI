import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VideoGenerator from './components/VideoGenerator';
import ImageStudio from './components/ImageStudio';
import TextToSpeech from './components/TextToSpeech';
import Inspiration from './components/Inspiration';
import Avatars from './components/Avatars';
import Analytics from './components/Analytics';
import Publisher from './components/Publisher';
import ResourcesHub from './components/ResourcesHub';
import LiveAssistant from './components/LiveAssistant';
import MarketResearch from './components/MarketResearch';
import LocationScout from './components/LocationScout';
import VideoAnalyzer from './components/VideoAnalyzer';

const App: React.FC = () => {
  return (
    <Router>
      {/* New Vibrant Aurora Background */}
      <div className="aurora-bg"></div>

      <div className="flex min-h-screen text-slate-900 font-sans relative z-10 p-4 md:p-6 gap-6">
        <Sidebar />
        
        {/* Main Content Area - Floating Glass Panel */}
        <main className="flex-1 md:ml-80 rounded-[32px] bg-white/40 backdrop-blur-xl border border-white/60 shadow-2xl overflow-y-auto h-[calc(100vh-3rem)] relative custom-scrollbar">
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/video" element={<VideoGenerator />} />
                <Route path="/image" element={<ImageStudio />} />
                <Route path="/tts" element={<TextToSpeech />} />
                <Route path="/avatars" element={<Avatars />} />
                <Route path="/inspiration" element={<Inspiration />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/editor" element={<Publisher />} />
                
                {/* Advanced Tools Routes */}
                <Route path="/resources" element={<ResourcesHub />} />
                <Route path="/live" element={<LiveAssistant />} />
                <Route path="/research" element={<MarketResearch />} />
                <Route path="/locations" element={<LocationScout />} />
                <Route path="/video-analysis" element={<VideoAnalyzer />} />
                
                <Route path="*" element={<Dashboard />} />
            </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;