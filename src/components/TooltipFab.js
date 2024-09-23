import React, { useState } from 'react';
import { Fab, Tooltip, Box, Zoom } from '@mui/material';
import { Add, FilterList, AccountCircle } from '@mui/icons-material';

const TooltipFab = () => {
  const [open, setOpen] = useState(false);

  const toggleButtons = () => {
    setOpen((prevOpen) => !prevOpen); // Alternar la visibilidad de los botones
  };

  const handleGoToLegajos = () => {
    window.open('https://apps-dev.ufasta.edu.ar/personal/legajos/#/tabs/cargos-afectaciones', '_blank');
  };

  const handleGoToFotoPlanta = () => {
    window.open('https://apps-dev.ufasta.edu.ar/reporte/personal/snaps/listadofotoplanta', '_blank');
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column', // Para mostrar los botones en una columna
        alignItems: 'center',
      }}
    >
      {/* Primer botón desplegable */}
      {open && (
        <Zoom in={open}>
          <Tooltip title="Ir a Cargos y Afectaciones" placement="left">
            <Fab
              color="primary"
              aria-label="legajos"
              onClick={handleGoToLegajos}
              sx={{ mb: 2 }} // Margen inferior para separar los botones
            >
              <AccountCircle />
            </Fab>
          </Tooltip>
        </Zoom>
      )}

      {/* Segundo botón desplegable */}
      {open && (
        <Zoom in={open}>
          <Tooltip title="Ir a Listado Foto Planta" placement="left">
            <Fab
              color="secondary"
              aria-label="foto-planta"
              onClick={handleGoToFotoPlanta}
              sx={{ mb: 2 }}
            >
              <FilterList />
            </Fab>
          </Tooltip>
        </Zoom>
      )}

      {/* Botón principal que despliega los demás */}
      <Tooltip title={open ? "Cerrar opciones" : "Abrir opciones"} placement="left">
        <Fab color="default" aria-label="add" onClick={toggleButtons}>
          <Add />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default TooltipFab;
