import React, { useState, useEffect } from 'react';
import '../MindGames.css';

const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple'];

const ColorConfusion = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [color, setColor] = useState('');
  const [text, setText] = useState('');
  const [gameActive, setGameActive] = useState(false);

  const generateChallenge = () => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomText = colors[Math.floor(Math.random() * colors.length)];
    setColor(randomColor);
    setText(randomText);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    generateChallenge();
  };

  useEffect(() => {
    if (!gameActive) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameActive]);

  const handleAnswer = (isColor) => {
    const correct = isColor ? color === text : color !== text;
    if (correct) {
      setScore(prev => prev + 1);
      generateChallenge();
    } else {
      setGameActive(false);
    }
  };

  return (
    <div className="mind-game">
      <h2>🎨 Color Confusion</h2>
      <p>Does the WORD match the COLOR it's shown in?</p>
      
      <div className="game-info">
        <p>Score: {score}</p>
        <p>Time: {timeLeft}s</p>
      </div>
      
      {gameActive ? (
        <>
          <div 
            className="challenge" 
            style={{ color: color.toLowerCase() }}
          >
            {text}
          </div>
          <div className="buttons">
            <button onClick={() => handleAnswer(true)}>YES</button>
            <button onClick={() => handleAnswer(false)}>NO</button>
          </div>
        </>
      ) : (
        <button onClick={startGame}>
          {score === 0 ? 'Start Game' : `Score: ${score} - Try Again`}
        </button>
      )}
    </div>
  );
};

export default ColorConfusion;