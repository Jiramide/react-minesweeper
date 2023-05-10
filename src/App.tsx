import React from 'react';
import logo from './logo.svg';
import './App.css';
import MinesweeperBoard from './MinesweeperBoard';

function App() {
  return (
    <div className="App">
      <MinesweeperBoard
        width={15}
        height={15}
        mines={1}
      />
    </div>
  );
}

export default App;
