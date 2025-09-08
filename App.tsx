import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { useData } from './hooks/useData';
import AuthPage from './components/AuthPage';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import Progress from './components/Progress';
import Profile from './components/Profile';
import Spinner from './components/common/Spinner';
import { ThemeProvider } from './context/ThemeContext';
import { ChartBarIcon, UserCircleIcon, ViewGridIcon } from './components/common/Icons';
import ThemeToggle from './components/common/ThemeToggle';
import NotificationManager from './components/NotificationManager';

type Tab = 'dashboard' | 'progress' | 'profile';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <Main />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const Main: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, isInitialized } = useData();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  if (authLoading || (user && !isInitialized)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (!profile) {
    return <ProfileSetup />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'progress':
        return <Progress />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <NotificationManager />
      <div className="container mx-auto max-w-4xl p-4 pb-24">
        <header className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">FitTrack AI</h1>
            <ThemeToggle />
        </header>
        <main>{renderContent()}</main>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="container mx-auto max-w-4xl flex justify-around">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 w-full ${activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>
            <ViewGridIcon />
            <span className="text-xs">Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('progress')} className={`flex flex-col items-center p-2 w-full ${activeTab === 'progress' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>
            <ChartBarIcon />
            <span className="text-xs">Progress</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center p-2 w-full ${activeTab === 'profile' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>
            <UserCircleIcon />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};


export default App;