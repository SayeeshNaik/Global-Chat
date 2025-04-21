import React, { useState, useEffect } from 'react';
import '../MindGames.css';

const QuickMath = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [problem, setProblem] = useState('');
  const [answer, setAnswer] = useState('');
  const [gameActive, setGameActive] = useState(false);

  const operators = ['+', '-', '*'];
  
  const generateProblem = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const op = operators[Math.floor(Math.random() * operators.length)];
    let solution;
    
    switch(op) {
      case '+': solution = num1 + num2; break;
      case '-': solution = num1 - num2; break;
      case '*': solution = num1 * num2; break;
      default: solution = num1 + num2;
    }
    
    setProblem(`${num1} ${op} ${num2}`);
    return solution;
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    generateProblem();
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

  const checkAnswer = () => {
    const solution = eval(problem);
    if (parseInt(answer) === solution) {
      setScore(prev => prev + 1);
      setAnswer('');
      generateProblem();
    } else {
      setGameActive(false);
    }
  };

  return (
    <div className="mind-game">
      <h2>➗ Quick Math</h2>
      <p>Solve as many problems as you can in 30 seconds!</p>
      
      <div className="game-info">
        <p>Score: {score}</p>
        <p>Time: {timeLeft}s</p>
      </div>
      
      {gameActive ? (
        <>
          <div className="problem">{problem} = ?</div>
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
            autoFocus
          />
          <button onClick={checkAnswer}>Submit</button>
        </>
      ) : (
        <button onClick={startGame}>
          {score === 0 ? 'Start Game' : `Your Score: ${score} - Play Again`}
        </button>
      )}
    </div>
  );
};

export default QuickMath;