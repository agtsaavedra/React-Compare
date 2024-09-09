import React from 'react';
import { Fab, Tooltip } from '@mui/material';
import { FilterList } from '@mui/icons-material';

const TooltipFab = ({ showDifferences, setShowDifferences }) => {
  return (
    <Tooltip title="Listar únicamente diferencias" placement="left">
      <Fab
        color="primary"
        aria-label="filter"
        onClick={() => setShowDifferences(!showDifferences)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 20,
        }}
      >
        <FilterList />
      </Fab>
    </Tooltip>
  );
};

export default TooltipFab;
