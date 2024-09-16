import React from 'react';
import { Fab, Tooltip } from '@mui/material';
import { Add, FilterList } from '@mui/icons-material';

const TooltipFab = () => {
  const handleFabClick = () => {
    // Abrir enlace en una nueva pestaña
    window.open('https://apps-dev.ufasta.edu.ar/personal/legajos/#/tabs/cargos-afectaciones', '_blank');
  };


  return (
    <Tooltip title="Ir a cargos y afectaciones" placement="left">
      <Fab
        color="primary"
        aria-label="filter"
        onClick={handleFabClick}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 20,
        }}
      >
        <Add />
      </Fab>
    </Tooltip>
  );
};

export default TooltipFab;

