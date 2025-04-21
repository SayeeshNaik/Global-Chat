import React, { useState, useEffect } from 'react';
import './FlipMemoryGame.css';

const FlipMemoryGame = () => {
  const [level, setLevel] = useState(1);
  const [blocks, setBlocks] = useState([]);
  const [gameActive, setGameActive] = useState(false);
  const [showPattern, setShowPattern] = useState(false);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [message, setMessage] = useState('');
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'];

  // Initialize game
  useEffect(() => {
    if (gameActive) {
      const blockCount = 6 + ((level - 1) * 3); // 6,9,12,15...
      const colorCount = Math.min(level + 1, colors.length);
      initializeBlocks(blockCount, colorCount);
    }
  }, [level, gameActive]);

  const initializeBlocks = (blockCount, colorCount) => {
    const newBlocks = Array(blockCount).fill().map((_, i) => ({
      id: i,
      color: '',
      flipped: false,
      matched: false
    }));
    setBlocks(newBlocks);
    setSelectedBlocks([]);
    setMessage('');
    showColorPattern(newBlocks, colorCount);
  };

  const startGame = () => {
    setLevel(1);
    setGameActive(true);
  };

  const showColorPattern = (currentBlocks, colorCount) => {
    // Create color groups (3 blocks per color)
    const colorGroups = {};
    const availableBlocks = [...currentBlocks];
    
    for (let i = 0; i < colorCount; i++) {
      const color = colors[i];
      colorGroups[color] = [];
      
      for (let j = 0; j < 3; j++) {
        const randomIndex = Math.floor(Math.random() * availableBlocks.length);
        const block = availableBlocks[randomIndex];
        availableBlocks.splice(randomIndex, 1);
        colorGroups[color].push(block.id);
      }
    }

    // Show the pattern
    setBlocks(prev => 
      prev.map(block => {
        for (const color in colorGroups) {
          if (colorGroups[color].includes(block.id)) {
            return { ...block, color, flipped: true };
          }
        }
        return block;
      })
    );
    setShowPattern(true);

    // Hide after 3 seconds
    setTimeout(() => {
      setShowPattern(false);
      setBlocks(prev => prev.map(block => ({ ...block, flipped: false })));
    }, 3000);
  };

  const handleBlockClick = (block) => {
    if (!gameActive || showPattern || block.flipped || block.matched) return;

    const newBlocks = blocks.map(b => 
      b.id === block.id ? { ...b, flipped: true } : b
    );
    setBlocks(newBlocks);
    
    const newSelected = [...selectedBlocks, block.id];
    setSelectedBlocks(newSelected);

    // Check if 3 blocks are selected
    if (newSelected.length === 3) {
      checkMatch(newBlocks, newSelected);
    }
  };

  const checkMatch = (currentBlocks, selectedIds) => {
    const selected = selectedIds.map(id => 
      currentBlocks.find(b => b.id === id)
    );
    const allSameColor = selected.every(b => b.color === selected[0].color);

    if (allSameColor) {
      // Mark as matched
      const updatedBlocks = currentBlocks.map(b => 
        selectedIds.includes(b.id) ? { ...b, matched: true } : b
      );
      setBlocks(updatedBlocks);
      setSelectedBlocks([]);

      // Check level completion
      if (updatedBlocks.every(b => b.matched || b.color === '')) {
        setMessage(`Level ${level} Complete!`);
        setTimeout(() => setLevel(prev => prev + 1), 1500);
      }
    } else {
      // Game over
      setGameActive(false);
      setMessage(`Game Over at Level ${level}`);
      // Briefly show all blocks
      setBlocks(prev => prev.map(b => ({ ...b, flipped: true })));
      setTimeout(() => {
        setBlocks(prev => prev.map(b => ({ ...b, flipped: false })));
      }, 2000);
    }
  };

  return (
    <div className="flip-memory-game">
      <h3>🔢 Memory Blocks 🔢</h3>
      <div className="game-info">
        <p style={{fontSize:'15px'}}>Level: {level}</p>
        <p style={{fontSize:'15px'}}>Highest Score: {}</p>
        {/* <p>Blocks: {blocks.length}</p>
        <p>Find 3 matching colors</p> */}
      </div>
      
      {message && <div className="message">{message}</div>}

      <div 
        className="blocks-grid"
        style={{ 
          gridTemplateColumns: `repeat(${Math.min(Math.ceil(Math.sqrt(blocks.length)), 8)}, 1fr)`
        }}
      >
        {blocks.map(block => (
          <div
            key={block.id}
            className={`block ${block.flipped ? 'flipped' : ''} ${block.matched ? 'matched' : ''}`}
            onClick={() => handleBlockClick(block)}
          >
            <div 
              className="block-front" 
              style={{ backgroundColor: block.color || '#ddd' }}
            />
            <div className="block-back" />
          </div>
        ))}
      </div>

      {!gameActive ? (
        <button className="start-button" onClick={startGame}>
          {level === 1 ? 'Start Game' : 'Try Again'}
        </button>
      ) : ( <></>
        // <button 
        //   className="show-pattern-button" 
        //   onClick={() => initializeBlocks(blocks.length, Math.min(level + 1, colors.length))}
        //   disabled={showPattern}
        // >
        //   Show Pattern
        // </button>
      )}
    </div>
  );
};

export default FlipMemoryGame;