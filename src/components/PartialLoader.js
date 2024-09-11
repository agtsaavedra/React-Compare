import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const PartialLoader = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 160px)', // Ajusta la altura para que comience después de los HeaderBoxes
        marginTop: '160px', // Deja el espacio suficiente para el header y otros elementos superiores
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default PartialLoader;
