import React, { useRef, useState, useLayoutEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Fab, Tooltip, Pagination } from '@mui/material';
import { FilterList } from '@mui/icons-material';
import Loader from './Loader';

const AfectacionesDataGrid = ({ afectaciones1, afectaciones2, filterText, availableHeight }) => {
  const grid1Ref = useRef(null);
  const grid2Ref = useRef(null);
  const [page, setPage] = useState(1); // Estado para la página
  const [showDifferences, setShowDifferences] = useState(false); // Estado para mostrar diferencias
  const [loading, setLoading] = useState(false); // Estado de carga

  const rowHeight = 52; // Altura aproximada de cada fila en la tabla (ajústalo según el diseño)
  const maxPageSize = 10; // Máximo número de filas por página
  const minHeight = rowHeight * maxPageSize; // Altura mínima calculada para la tabla

  // Calcula las columnas para la comparación
  const getComparisonColumns = (afectaciones1, afectaciones2, tableType) => {
    const keys = Object.keys(afectaciones1[0] || {}).concat(Object.keys(afectaciones2[0] || {}));
    const uniqueKeys = [...new Set(keys)];

    return uniqueKeys.map((key) => ({
      field: key,
      headerName: key.replace(/_/g, ' ').toUpperCase(),
      width: 150,
      headerClassName: 'header-cell',
      cellClassName: (params) => {
        const rowIndex = params.id - 1; // Asegurarse de que el índice sea correcto
        const value1 = afectaciones1[rowIndex] ? afectaciones1[rowIndex][key] : null;
        const value2 = afectaciones2[rowIndex] ? afectaciones2[rowIndex][key] : null;

        if (value1 !== value2) {
          return tableType === 'table1' ? 'cell-different-red' : 'cell-different-green';
        }
        return '';
      },
    }));
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage); // Cambiar de página
  };

  const getRowsWithIds = (afectaciones) =>
    afectaciones.map((afectacion, index) => ({
      id: index + 1, // Usamos un ID para mantener el índice original
      ...afectacion,
    }));

  // Filtra las diferencias si el estado 'showDifferences' está activo
  const filterDifferences = (rows, otherRows) => {
    return rows.filter((row, index) => {
      const keys = Object.keys(row);
      return keys.some((key) => row[key] !== otherRows[index]?.[key]);
    });
  };

  const allRows1 = getRowsWithIds(afectaciones1);
  const allRows2 = getRowsWithIds(afectaciones2);

  // Aplica el filtro de diferencias si está activo
  const filteredRows1 = showDifferences ? filterDifferences(allRows1, allRows2) : allRows1;
  const filteredRows2 = showDifferences ? filterDifferences(allRows2, allRows1) : allRows2;

  const paginatedAfectaciones1 = filteredRows1.slice((page - 1) * maxPageSize, page * maxPageSize);
  const paginatedAfectaciones2 = filteredRows2.slice((page - 1) * maxPageSize, page * maxPageSize);

  const syncScroll = (scrollLeft) => {
    if (grid1Ref.current && grid2Ref.current) {
      grid1Ref.current.querySelector('.MuiDataGrid-scrollbar--horizontal').scrollLeft = scrollLeft;
      grid2Ref.current.querySelector('.MuiDataGrid-scrollbar--horizontal').scrollLeft = scrollLeft;
    }
  };

  const handleScroll = (e) => {
    syncScroll(e.target.scrollLeft);
  };

  const toggleShowDifferences = () => {
    setLoading(true); // Mostrar el loader al comenzar el filtrado
  
    // Simular el proceso de filtrado
    setTimeout(() => {
      setShowDifferences((prev) => !prev);
      setPage(1); // Reiniciar a la página 1 después de aplicar el filtro
      setLoading(false); // Ocultar el loader una vez que termine el proceso
    }, 500);
  };

  return (
    <Box sx={{ height: availableHeight, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Botón para filtrar diferencias */}
      <Tooltip title="Listar únicamente diferencias" placement="left">
        <Fab
          color="primary"
          aria-label="filter"
          onClick={toggleShowDifferences}
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

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Loader />
        </Box>
      ) : (
        <>
          {/* Contenedor para Lote Anterior y Lote Posterior */}
          <Box sx={{ display: 'flex', width: '100%', position: 'sticky', zIndex: 1000 }}>
            <Box
              sx={{
                width: '50%',
                backgroundColor: 'red',
                padding: '8px',
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold',
              }}
            >
              <Typography>Lote Anterior</Typography>
            </Box>
            <Box
              sx={{
                width: '50%',
                backgroundColor: 'green',
                padding: '8px',
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold',
              }}
            >
              <Typography>Lote Posterior</Typography>
            </Box>
          </Box>

          {/* Contenedor para las dos tablas */}
          <Box sx={{ display: 'flex', width: '100%', flexGrow: 1 }}>
            <Box ref={grid1Ref} sx={{ width: '50%', height: minHeight }}>
              <DataGrid
                rows={paginatedAfectaciones1}
                columns={getComparisonColumns(afectaciones1, afectaciones2, 'table1')}
                pageSize={maxPageSize}
                hideFooterPagination
                disableSelectionOnClick
                sx={{
                  '& .MuiDataGrid-columnHeaders': {
                    position: 'sticky',
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    marginTop: '0 !important',
                  },
                  '& .MuiDataGrid-main': {
                    overflow: 'visible',
                  },
                }}
              />
            </Box>
            <Box ref={grid2Ref} sx={{ width: '50%', height: minHeight }}>
              <DataGrid
                rows={paginatedAfectaciones2}
                columns={getComparisonColumns(afectaciones1, afectaciones2, 'table2')}
                pageSize={maxPageSize}
                hideFooterPagination
                disableSelectionOnClick
                sx={{
                  '& .MuiDataGrid-columnHeaders': {
                    position: 'sticky',
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    marginTop: '0 !important',
                  },
                  '& .MuiDataGrid-main': {
                    overflow: 'visible',
                  },
                }}
              />
            </Box>
          </Box>
          {/* Paginador común para ambas tablas */}
          <Box display="flex" justifyContent="center" marginTop="16px">
            <Pagination
              count={Math.ceil(Math.max(filteredRows1.length, filteredRows2.length) / maxPageSize)}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
          {/* Scrollbar horizontal sincronizado */}
          <Box
            sx={{
              width: '100%',
              marginTop: 'auto',
              minHeight: '20px',
              position: 'sticky',
              bottom: 0,
            }}
            onScroll={handleScroll}
            className="scrollbar-container"
          >
            <Box sx={{ width: `10850px`, height: '1px' }} />
          </Box>


        </>
      )}
    </Box>
  );
};

export default AfectacionesDataGrid;
