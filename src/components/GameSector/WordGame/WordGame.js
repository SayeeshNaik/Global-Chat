import React, { useState, useEffect } from 'react';
import '../MindGames.css';
import { userDetails } from '../../../constants/user-details';
import { notificationSound } from '../../../enhancements/enhancements';

const words = userDetails.map((data)=> (data.username).split(' ')[1].toLowerCase())

const WordGame = () => {
  const [scrambled, setScrambled] = useState('');
  const [solution, setSolution] = useState('');
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [prevData, setPreviousData] = useState(null);

  const scrambleWord = (word) => {
    return word.split('').sort(() => Math.random() - 0.5).join('');
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameActive(true);
    newWord();
  };

  const newWord = () => {
    const word = words[Math.floor(Math.random() * words.length)];
    setSolution(word);
    setScrambled(scrambleWord(word));
    setGuess('');
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

  const checkGuess = () => {
    if (guess.toLowerCase() === solution) {
      setScore(prev => prev + 1);
      let tempPrevData = userDetails.filter((data) => (data.username).split(' ')[1].toLowerCase() === solution.toLowerCase())[0];
      let audioPath = tempPrevData.notification;
      setPreviousData(tempPrevData);
      notificationSound(audioPath)
      newWord();
    }
  };

  return (
    <div className="mind-game">
      <h3> Guess The Name 🫣 </h3>
      <p> Guess Quick for get High Score 🐵 </p>
      
      <div className="game-info">
        <p>Score: {score}</p>
        <p>Time: {timeLeft}s</p>
      </div>
      
      {gameActive ? (
        <>
          { prevData && <p>Sound : { `${prevData?.username?.split(' ')[0]}  ${prevData?.name} `}</p> }
          <p className="scrambled">{scrambled}</p>
          <input
            style={{fontSize:'15px'}}
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkGuess()}
            placeholder="Your guess..."
            autoFocus
          />
          <button onClick={checkGuess}>Submit</button>
          {/* <button onClick={newWord} className="skip">Skip</button> */}
        </>
      ) : (
        <button onClick={startGame}>
          {score === 0 ? 'Start Game' : `Score: ${score} - Play Again`}
        </button>
      )}
    </div>
  );
};

export default WordGame;