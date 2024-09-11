import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const Loader = () => {
  return (
    
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
     
      <CircularProgress content='Cargando' />
      
    </Box>
    
  );
};

export default Loader;