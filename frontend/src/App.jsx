import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatBox } from './components/ChatBox';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { BodyAnalysisPage } from './pages/BodyAnalysisPage';
import { SkinAnalysisPage } from './pages/SkinAnalysisPage';
import { FashionAdvisorPage } from './pages/FashionAdvisorPage';
import { MakeupAdvisorPage } from './pages/MakeupAdvisorPage';
import { ColorPalettePage } from './pages/ColorPalettePage';
import { ExplainableAIPage } from './pages/ExplainableAIPage';
import { ShoppingHubPage } from './pages/ShoppingHubPage';
import { ProfilePage } from './pages/ProfilePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { AuthPage } from './pages/AuthPage';
import { StylistStudioPage } from './pages/StylistStudioPage';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('landing');

  // If user is authenticated and is on landing or auth pages, redirect to dashboard
  const currentTab = isAuthenticated && (activeTab === 'landing' || activeTab.startsWith('auth')) 
    ? 'dashboard' 
    : activeTab;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1E1B18]">
      <Navbar activeTab={currentTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1">
        {currentTab === 'landing' && <LandingPage setActiveTab={setActiveTab} />}
        {currentTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
        {currentTab === 'studio' && <StylistStudioPage setActiveTab={setActiveTab} />}
        {currentTab === 'body' && <BodyAnalysisPage setActiveTab={setActiveTab} />}
        {currentTab === 'skin' && <SkinAnalysisPage setActiveTab={setActiveTab} />}
        {currentTab === 'fashion' && <FashionAdvisorPage setActiveTab={setActiveTab} />}
        {currentTab === 'makeup' && <MakeupAdvisorPage setActiveTab={setActiveTab} />}
        {currentTab === 'palette' && <ColorPalettePage setActiveTab={setActiveTab} />}
        {currentTab === 'xai' && <ExplainableAIPage setActiveTab={setActiveTab} />}
        {currentTab === 'shopping' && <ShoppingHubPage setActiveTab={setActiveTab} />}
        {currentTab === 'profile' && <ProfilePage setActiveTab={setActiveTab} />}
        {currentTab === 'privacy' && <PrivacyPolicyPage setActiveTab={setActiveTab} />}
        {currentTab === 'feedback' && <FeedbackPage setActiveTab={setActiveTab} />}
        {currentTab === 'auth-login' && <AuthPage initialTab="login" setActiveTab={setActiveTab} />}
        {currentTab === 'auth-signup' && <AuthPage initialTab="signup" setActiveTab={setActiveTab} />}
      </main>

      <ChatBox activeTab={currentTab} setActiveTab={setActiveTab} />

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
