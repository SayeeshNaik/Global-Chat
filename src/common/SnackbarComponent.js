import React, { useEffect, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';

// Slide Transition: left to right
const SlideTransition = (props) => {
  return <Slide {...props} direction="left" />;
};


const SnackbarComponent = ({ message, status = 'info' }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (message) {
      setOpen(true);
    }
  }, [message]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
      sx={{
        marginTop: 7,
      }}
    >
      <MuiAlert onClose={handleClose} severity={status} elevation={6} variant="filled" sx={{padding: '1px 16px'}}>
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

export default SnackbarComponent;
