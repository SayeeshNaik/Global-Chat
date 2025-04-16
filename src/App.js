// src/App.js
import React from 'react';
import ChatApp from './components/ChatApp';
import ChatAppDB from './components/ChatAppDB';
// import { CssBaseline } from '@mui/material';

function App() {
  return (
    <>
      {/* <CssBaseline /> */}
      <ChatAppDB />
    </>
  );
}

export default App;