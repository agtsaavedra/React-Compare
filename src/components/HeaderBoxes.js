import React from 'react';
import { Box, Typography } from '@mui/material';

const HeaderBoxes = () => {
  return (
    <Box sx={{ display: 'flex', width: '100%', position: 'sticky', zIndex: 1000, boxSizing: 'border-box' }}>
      <Box
        sx={{
          width: '20%',
          backgroundColor: 'grey',
          padding: '8px',
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold',
          boxSizing: 'border-box',
          margin: 0,
        }}
      >
        <Typography>Personal</Typography>
      </Box>

      <Box
        sx={{
          width: '40%',
          backgroundColor: 'red',
          padding: '8px',
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold',
          boxSizing: 'border-box',
          margin: 0,
        }}
      >
        <Typography>Lote Anterior</Typography>
      </Box>

      <Box
        sx={{
          width: '40%',
          backgroundColor: 'green',
          padding: '8px',
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold',
          boxSizing: 'border-box',
          margin: 0,
        }}
      >
        <Typography>Lote Posterior</Typography>
      </Box>
    </Box>
  );
};

export default HeaderBoxes;
