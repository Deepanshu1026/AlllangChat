import React, { Suspense } from 'react';
import ChatWindow from './components/ChatWindow';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';

const AppContent = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#212121] text-white">Loading...</div>}>
      <ChatWindow />
    </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
