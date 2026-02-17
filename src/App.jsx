import React, { Suspense } from 'react';
import ChatWindow from './components/ChatWindow';

function App() {
  return (
    <Suspense fallback={<div style={{ color: 'white' }}>Loading translations...</div>}>
      <ChatWindow />
    </Suspense>
  );
}

export default App;
