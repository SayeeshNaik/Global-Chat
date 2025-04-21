// import React from 'react';
// import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
// // import VoiceFlightGame from './VoiceFlightGame';

// import BubblePop from './BubblePop/BubblePop';
// // import 'GameSelector.css';
// import ScreamMeter from './ScreamMeter/ScreamMeter';
// import BananaCatcher from './BananaCatcher/BananaCatcher';
// import DanceOff from './DanceOff/DanceOff';

// const GameSector = () => {
//   return (
//     <Router>
//       <div className="game-selector">
//         <Routes>
//           <Route path="/" element={<MainMenu />} />
//           {/* <Route path="/voice-flight" element={<VoiceFlightGame />} /> */}
//           <Route path="/scream-meter" element={<ScreamMeter />} />
//           <Route path="/banana-catcher" element={<BananaCatcher />} />
//           <Route path="/dance-off" element={<DanceOff />} />
//           <Route path="/bubble-pop" element={<BubblePop />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// };

// const MainMenu = () => {
//   return (
//     <div className="main-menu">
//       <h1>🤪 Crazy Fun Games 🤪</h1>
//       <p className="subtitle">Pick your poison!</p>
      
//       <div className="game-buttons">
//         <Link to="/voice-flight" className="game-button">
//           <div className="game-icon">🦸</div>
//           <h3>Voice Flight</h3>
//           <p>Fly with your voice!</p>
//         </Link>
        
//         <Link to="/scream-meter" className="game-button">
//           <div className="game-icon">📢</div>
//           <h3>Scream Meter</h3>
//           <p>Who can scream loudest?</p>
//         </Link>
        
//         <Link to="/banana-catcher" className="game-button">
//           <div className="game-icon">🍌</div>
//           <h3>Banana Catcher</h3>
//           <p>Catch falling bananas!</p>
//         </Link>
        
//         <Link to="/dance-off" className="game-button">
//           <div className="game-icon">🕺</div>
//           <h3>Dance Off</h3>
//           <p>Dance with your voice!</p>
//         </Link>
        
//         <Link to="/bubble-pop" className="game-button">
//           <div className="game-icon">🫧</div>
//           <h3>Bubble Pop</h3>
//           <p>Pop bubbles with clicks!</p>
//         </Link>
//       </div>
      
//       <div className="instructions">
//         <h3>How to Play:</h3>
//         <p>1. Click any game button</p>
//         <p>2. Follow the on-screen instructions</p>
//         <p>3. Most games use your microphone 🎤</p>
//         <p>4. Have ridiculous amounts of fun!</p>
//       </div>
//     </div>
//   );
// };

// export default GameSector;