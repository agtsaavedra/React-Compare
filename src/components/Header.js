// src/components/Header.js
import React from 'react';
import { Typography } from '@mui/material';

const Header = () => {
  return (
    <Typography
      variant="h4"
      component="div"
      gutterBottom
      sx={{
        height: '40px',
        backgroundColor: '#5c6bc0',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '10px',
        width: '100vw',
        margin: '0',
        boxSizing: 'border-box',
        fontSize: '18px',
        fontFamily: 'Helvetica, Arial, sans-serif',
      }}
    >
      Afectaciones
    </Typography>
  );
};

export default Header;