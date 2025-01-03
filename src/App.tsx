import React, { useEffect } from 'react';
import './App.css';
import Game from './components/Game';

function App() {
  useEffect(() => {
    document.title = '声控弹球 | Sound Bounce Ball';
  }, []);

  return (
    <div className="App">
      <Game />
    </div>
  );
}

export default App;
