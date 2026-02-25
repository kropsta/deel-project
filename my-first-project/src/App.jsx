import React from 'react';
import Quiz from './components/Quiz';

function App() {
  return (
    <div className="app-container">
      <header>
        <div className="logo">Harborway Life</div>
      </header>
      <main>
        <Quiz />
      </main>
    </div>
  );
}

export default App;
