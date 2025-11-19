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
      <div className="flex min-h-screen bg-[#f8f9fa] text-slate-900 font-sans">
        <Sidebar />
        <main className="flex-1 ml-64 overflow-y-auto h-screen relative">
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