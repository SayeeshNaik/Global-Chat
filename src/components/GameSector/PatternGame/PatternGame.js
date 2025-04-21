import React, { useState, useEffect } from 'react';
import '../MindGames.css';

const PatternPrediction = () => {
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [level, setLevel] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [showPattern, setShowPattern] = useState(false);

  const colors = ['red', 'blue', 'green', 'yellow'];

  const startGame = () => {
    setLevel(1);
    generateSequence(1);
    setGameActive(true);
  };

  const generateSequence = (length) => {
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    setSequence(newSequence);
    setUserInput([]);
    showSequence(newSequence);
  };

  const showSequence = (seq) => {
    setShowPattern(true);
    setTimeout(() => {
      setShowPattern(false);
    }, seq.length * 1000 + 500);
  };

  const handleColorClick = (color) => {
    if (!gameActive || showPattern) return;
    
    const newInput = [...userInput, color];
    setUserInput(newInput);

    if (newInput.length === sequence.length) {
      if (newInput.every((c, i) => c === sequence[i])) {
        setTimeout(() => {
          setLevel(prev => prev + 1);
          generateSequence(level + 1);
        }, 1000);
      } else {
        setGameActive(false);
      }
    }
  };

  return (
    <div className="mind-game">
      <h2>🔮 Pattern Prediction</h2>
      <p>Repeat the color sequence correctly</p>
      <p>Level: {level}</p>
      
      {showPattern && (
        <div className="pattern-display">
          {sequence.map((color, i) => (
            <div 
              key={i} 
              className={`color-box ${color}`}
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))}
        </div>
      )}
      
      <div className="color-buttons">
        {colors.map(color => (
          <button
            key={color}
            className={color}
            onClick={() => handleColorClick(color)}
            disabled={showPattern}
          />
        ))}
      </div>
      
      {!gameActive && (
        <button onClick={startGame}>
          {level === 1 ? 'Start Game' : `Reached Level ${level} - Try Again`}
        </button>
      )}
    </div>
  );
};

export default PatternPrediction;