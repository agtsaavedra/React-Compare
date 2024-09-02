import React, { useRef, useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';

const AfectacionesDataGrid = ({ afectaciones1, afectaciones2, filterText }) => {
  const grid1Ref = useRef(null);
  const grid2Ref = useRef(null);
  const [totalColumnsWidth, setTotalColumnsWidth] = useState(0);

  const getComparisonColumns = (afectaciones1, afectaciones2, tableType) => {
    const keys = Object.keys(afectaciones1[0] || {}).concat(Object.keys(afectaciones2[0] || {}));
    const uniqueKeys = [...new Set(keys)];

    return uniqueKeys.map((key) => ({
      field: key,
      headerName: key.replace(/_/g, ' ').toUpperCase(),
      width: 150,
      headerClassName: 'header-cell',
      cellClassName: (params) => {
        const rowIndex = params.id - 1;
        const value1 = afectaciones1[rowIndex] ? afectaciones1[rowIndex][key] : null;
        const value2 = afectaciones2[rowIndex] ? afectaciones2[rowIndex][key] : null;

        if (value1 !== value2) {
          return tableType === 'table1' ? 'cell-different-red' : 'cell-different-green';
        }
        return '';
      },
    }));
  };

  const getRowsWithIds = (afectaciones) =>
    afectaciones.map((afectacion, index) => ({
      id: index + 1,
      ...afectacion,
    }));

  const columns1 = getComparisonColumns(afectaciones1, afectaciones2, 'table1');
  const columns2 = getComparisonColumns(afectaciones2, afectaciones1, 'table2');

  useEffect(() => {
    const maxColumnWidth = Math.max(
      columns1.reduce((sum, col) => sum + col.width, 0),
      columns2.reduce((sum, col) => sum + col.width, 0)
    );
    setTotalColumnsWidth(maxColumnWidth + 50); // Add a small buffer for safety
  }, [columns1, columns2]);

  const rows1 = getRowsWithIds(afectaciones1).filter(
    (row) =>
      row.Legajo.toString().includes(filterText) ||
      row.Funcion_descripcion.toLowerCase().includes(filterText.toLowerCase())
  );

  const rows2 = getRowsWithIds(afectaciones2).filter(
    (row) =>
      row.Legajo.toString().includes(filterText) ||
      row.Funcion_descripcion.toLowerCase().includes(filterText.toLowerCase())
  );

  const syncScroll = (scrollLeft) => {
    if (grid1Ref.current && grid2Ref.current) {
      grid1Ref.current.querySelector('.MuiDataGrid-virtualScroller').scrollLeft = scrollLeft;
      grid2Ref.current.querySelector('.MuiDataGrid-virtualScroller').scrollLeft = scrollLeft;
    }
  };

  const handleScroll = (e) => {
    syncScroll(e.target.scrollLeft);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', width: '100%', flexGrow: 1 }}>
        <Box
          ref={grid1Ref}
          sx={{
            width: '50%',
            '& .MuiDataGrid-root': {
              overflowX: 'hidden !important', // Hide the horizontal scroll
            },
            '& .MuiDataGrid-scrollbar--horizontal': {
              overflowX: 'hidden !important', // Hide the horizontal scroll
            },
          }}
        >
          <DataGrid
            rows={rows1}
            columns={columns1}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection
            disableColumnMenu
            disableSelectionOnClick
            hideFooterPagination
          />
        </Box>
        <Box
          ref={grid2Ref}
          sx={{
            width: '50%',
            '& .MuiDataGrid-root': {
              overflowX: 'hidden !important', // Hide the horizontal scroll
            },
            '& .MuiDataGrid-scrollbar--horizontal': {
              overflowX: 'hidden !important', // Hide the horizontal scroll
            },
          }}
        >
          <DataGrid
            rows={rows2}
            columns={columns2}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection
            disableColumnMenu
            disableSelectionOnClick
            hideFooterPagination
          />
        </Box>
      </Box>
      <Box
        sx={{ width: '100%', overflowX: 'auto', marginTop: 'auto', minHeight: '20px',   
         }}
        onScroll={handleScroll}
         className="scrollbar-container"
      >
        <Box sx={{ width: `${totalColumnsWidth+1000}px`, height: '1px' }} />
      </Box>
    </Box>
  );
};

export default AfectacionesDataGrid;
