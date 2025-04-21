import React, { useState, useEffect } from 'react';
import '../MindGames.css';

const MemoryMatrix = () => {
  const [grid, setGrid] = useState(Array(9).fill(false));
  const [sequence, setSequence] = useState([]);
  const [level, setLevel] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [message, setMessage] = useState('');

  const startGame = () => {
    setLevel(1);
    generateSequence(1);
    setGameActive(true);
  };

  const generateSequence = (length) => {
    const newSequence = [];
    while (newSequence.length < length) {
      const randomCell = Math.floor(Math.random() * 9);
      if (!newSequence.includes(randomCell)) {
        newSequence.push(randomCell);
      }
    }
    setSequence(newSequence);
    showSequence(newSequence);
  };

  const showSequence = (seq) => {
    setGrid(Array(9).fill(false));
    setMessage('Memorize the pattern...');
    
    seq.forEach((cell, index) => {
      setTimeout(() => {
        setGrid(prev => {
          const newGrid = [...prev];
          newGrid[cell] = true;
          return newGrid;
        });
      }, 1000 * index);

      setTimeout(() => {
        setGrid(prev => {
          const newGrid = [...prev];
          newGrid[cell] = false;
          return newGrid;
        });
        if (index === seq.length - 1) {
          setMessage('Now repeat the pattern!');
        }
      }, 1000 * index + 500);
    });
  };

  const handleClick = (index) => {
    if (!gameActive || message.includes('Memorize')) return;

    const expectedCell = sequence[grid.filter(Boolean).length];
    const newGrid = [...grid];
    newGrid[index] = true;
    setGrid(newGrid);

    if (index !== expectedCell) {
      setMessage(`Game Over! Reached level ${level}`);
      setGameActive(false);
      return;
    }

    if (grid.filter(Boolean).length + 1 === sequence.length) {
      setTimeout(() => {
        setLevel(prev => prev + 1);
        generateSequence(level + 1);
        setGrid(Array(9).fill(false));
      }, 1000);
    }
  };

  return (
    <div className="mind-game">
      <h2>🧠 Memory Matrix</h2>
      <p>Remember and repeat the flashing pattern</p>
      <p>Level: {level}</p>
      {message && <p className="message">{message}</p>}

      <div className="grid-container">
        {grid.map((active, index) => (
          <div
            key={index}
            className={`grid-cell ${active ? 'active' : ''}`}
            onClick={() => handleClick(index)}
          />
        ))}
      </div>

      {!gameActive && (
        <button onClick={startGame}>
          {level === 1 ? 'Start Game' : 'Try Again'}
        </button>
      )}
    </div>
  );
};

export default MemoryMatrix;