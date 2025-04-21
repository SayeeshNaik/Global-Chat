import React, { useState, useEffect, useRef } from 'react';
import './Voicegame.css';

const VoiceGame = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [verticalPosition, setVerticalPosition] = useState(0); // 0 = ground, higher = up
  const [isFlying, setIsFlying] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [sensitivity, setSensitivity] = useState(100); // Lower = more sensitive
  
  const characterRef = useRef(null);
  const gameAreaRef = useRef(null);
  const animationRef = useRef(null);
  const microphoneRef = useRef(null);
  const lastVolumeRef = useRef(0);
  const gravityIntervalRef = useRef(null);
  
  // Initialize microphone
  useEffect(() => {
    if (!gameStarted) return;
    
    const handleSuccess = (stream) => {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;
      
      microphoneRef.current = { audioContext, analyser, stream };
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        lastVolumeRef.current = average;
        
        if (average > sensitivity) {
          // Continuous flying while making sound
          setIsFlying(true);
          setVerticalPosition(prev => Math.min(prev + average/30, 200)); // Cap max height
        } else {
          setIsFlying(false);
        }
        
        if (!gameOver) {
          animationRef.current = requestAnimationFrame(checkVolume);
        }
      };
      
      animationRef.current = requestAnimationFrame(checkVolume);
    };
    
    const handleError = (err) => {
      console.error('Microphone error:', err);
      // Fallback to keyboard if microphone fails
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
          setIsFlying(true);
          setVerticalPosition(prev => Math.min(prev + 5, 200));
        }
      });
      window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
          setIsFlying(false);
        }
      });
    };
    
    navigator.mediaDevices.getUserMedia({ audio: true, echoCancellation: true })
      .then(handleSuccess)
      .catch(handleError);
    
    return () => {
      if (microphoneRef.current) {
        microphoneRef.current.stream.getTracks().forEach(track => track.stop());
        if (microphoneRef.current.audioContext) {
          microphoneRef.current.audioContext.close();
        }
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameStarted, gameOver, sensitivity]);
  
  // Gravity effect
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    gravityIntervalRef.current = setInterval(() => {
      if (!isFlying) {
        setVerticalPosition(prev => Math.max(prev - 3, 0));
      }
    }, 30);
    
    return () => clearInterval(gravityIntervalRef.current);
  }, [gameStarted, gameOver, isFlying]);
  
  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const gameLoop = setInterval(() => {
      // Move obstacles
      setObstacles(prev => {
        const newObstacles = prev.map(ob => ({
          ...ob,
          x: ob.x - 5
        })).filter(ob => ob.x > -50);
        
        // Check collisions
        const characterRect = characterRef.current.getBoundingClientRect();
        newObstacles.forEach(ob => {
          const obRect = document.getElementById(`obstacle-${ob.id}`).getBoundingClientRect();
          if (
            characterRect.right > obRect.left &&
            characterRect.left < obRect.right &&
            characterRect.bottom > obRect.top &&
            characterRect.top < obRect.bottom
          ) {
            gameEnd();
          }
        });
        
        return newObstacles;
      });
      
      // Add new obstacle randomly
      if (Math.random() < 0.02) {
        setObstacles(prev => [
          ...prev,
          {
            id: Date.now(),
            x: gameAreaRef.current.offsetWidth,
            height: 30 + Math.random() * 70
          }
        ]);
      }
      
      // Update score
      setScore(prev => prev + 1);
      
      // Gradually increase difficulty
      if (score % 500 === 0) {
        setSensitivity(prev => Math.max(prev - 1, 5));
      }
    }, 30);
    
    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, score]);
  
  const gameEnd = () => {
    setGameOver(true);
    setHighScore(prev => Math.max(prev, score));
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (gravityIntervalRef.current) {
      clearInterval(gravityIntervalRef.current);
    }
  };
  
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setVerticalPosition(0);
    setObstacles([]);
    setSensitivity(100);
  };
  
  return (
    <div className="game-container">
      {!gameStarted ? (
        <div className="start-screen">
          <h1>Voice Flight Game</h1>
          <p>Make continuous sound to fly! Stop to descend.</p>
          <p>Current sensitivity: {sensitivity} (lower is easier)</p>
          <button onClick={startGame}>Start Game</button>
        </div>
      ) : gameOver ? (
        <div className="game-over-screen">
          <h1>Game Over</h1>
          <p>Your Score: {score}</p>
          <p>High Score: {highScore}</p>
          <button onClick={startGame}>Play Again</button>
        </div>
      ) : (
        <div className="game-area" ref={gameAreaRef}>
          <div 
            ref={characterRef}
            className={`character ${isFlying ? 'flying' : ''}`}
            style={{ 
              bottom: `${50 + verticalPosition}px`,
              transition: 'bottom 0.1s ease-out'
            }}
          />
          {obstacles.map(ob => (
            <div
              key={ob.id}
              id={`obstacle-${ob.id}`}
              className="obstacle"
              style={{
                left: `${ob.x}px`,
                height: `${ob.height}px`
              }}
            />
          ))}
          <div className="ground" />
          <div className="score-display">Score: {score}</div>
          <div className="volume-display">
            Volume: {Math.round(lastVolumeRef.current)} (need {sensitivity})
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceGame;