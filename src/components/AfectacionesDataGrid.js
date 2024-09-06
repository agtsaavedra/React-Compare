import React, { useRef, useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Fab, Tooltip, Pagination } from '@mui/material';
import { FilterList } from '@mui/icons-material';
import Loader from './Loader';

// Función para calcular el ancho de las columnas basadas en el contenido
const calculateColumnWidth = (field, rows, headerText) => {
  const headerWidth = headerText.length * 10;
  const maxCellWidth = Math.max(
    ...rows.map((row) => String(row[field] || '').length * 10)
  );
  return Math.max(headerWidth, maxCellWidth);
};

// Calcula el ancho total de las columnas de una tabla
const calculateTotalWidth = (columns) => {
  return columns.reduce((totalWidth, col) => totalWidth + col.width, 0);
};

const getPinnedColumns = (pinnedAfect) => {
  const pinnedColumnOrder = ['Legajo', 'nombre', 'EnSnap'];

  return pinnedColumnOrder.map((key) => ({
    field: key,
    headerName: key.replace(/_/g, ' ').toUpperCase(),
    width: calculateColumnWidth(key, pinnedAfect, key.replace(/_/g, ' ').toUpperCase()),
    headerClassName: 'header-cell',
    cellClassName: (params) => '',
  }));
};

const getComparisonColumns = (afectaciones1, afectaciones2, tableType, pinnedKeys = []) => {
  const keys = Object.keys(afectaciones1[0] || {}).concat(Object.keys(afectaciones2[0] || {}));
  const uniqueKeys = [...new Set(keys)];

  const filteredKeys = tableType === 'tablePinned' ? uniqueKeys : uniqueKeys.filter((key) => !pinnedKeys.includes(key));

  return filteredKeys.map((key) => ({
    field: key,
    headerName: key.replace(/_/g, ' ').toUpperCase(),
    width: calculateColumnWidth(key, afectaciones1.concat(afectaciones2), key.replace(/_/g, ' ').toUpperCase()),
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

const AfectacionesDataGrid = ({ afectaciones1, afectaciones2, pinnedAfect, filterText, availableHeight }) => {
  const grid1Ref = useRef(null);
  const grid2Ref = useRef(null);
  const pinnedGridRef = useRef(null);
  const pinnedScrollRef = useRef(null);
  const [page, setPage] = useState(1);
  const [showDifferences, setShowDifferences] = useState(false);
  const [loading, setLoading] = useState(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const rowHeight = 52;
  const [pageSize, setPageSize] = useState(null);

  // Estado para el ancho del scrollbar
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const [pinnedScrollbarWidth, setPinnedScrollbarWidth] = useState(0); // Para tabla pinned

  const calculatedGridHeight = pageSize ? pageSize * rowHeight + 100 : availableHeight;

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const getRowsWithIds = (afectaciones) =>
    afectaciones.map((afectacion, index) => ({
      id: index + 1,
      ...afectacion,
    }));

  const filterDifferences = (rows, otherRows) => {
    return rows.filter((row, index) => {
      const keys = Object.keys(row);
      return keys.some((key) => row[key] !== otherRows[index]?.[key]);
    });
  };

  const allRows1 = getRowsWithIds(afectaciones1);
  const allRows2 = getRowsWithIds(afectaciones2);
  const allPinnedRows = getRowsWithIds(pinnedAfect);

  const filteredRows1 = showDifferences ? filterDifferences(allRows1, allRows2) : allRows1;
  const filteredRows2 = showDifferences ? filterDifferences(allRows2, allRows1) : allRows2;
  const filteredPinnedRows = showDifferences ? filterDifferences(allPinnedRows, allPinnedRows) : allPinnedRows;

  const maxRows = Math.max(filteredRows1.length, filteredRows2.length);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const newPageSize = Math.floor((windowHeight - 150) / rowHeight);
    setPageSize(newPageSize > 0 ? newPageSize : 1);

    const maxPages = Math.ceil(maxRows / newPageSize);
    if (page > maxPages) {
      setPage(maxPages);
    }

    // Calcula el ancho total de las columnas para sincronizar el ancho del scrollbar
    const totalWidth = calculateTotalWidth(getComparisonColumns(afectaciones1, afectaciones2, 'table1')) +
      calculateTotalWidth(getComparisonColumns(afectaciones1, afectaciones2, 'table2'));

    const totalPinnedWidth = calculateTotalWidth(getPinnedColumns(pinnedAfect)); // Para tabla pinned

    setScrollbarWidth(totalWidth);
    setPinnedScrollbarWidth(totalPinnedWidth);

  }, [windowHeight, maxRows, page, afectaciones1, afectaciones2, pinnedAfect]);

  const paginatedAfectaciones1 = filteredRows1.slice((page - 1) * pageSize, page * pageSize);
  const paginatedAfectaciones2 = filteredRows2.slice((page - 1) * pageSize, page * pageSize);
  const paginatedPinnedAfect = filteredPinnedRows.slice((page - 1) * pageSize, page * pageSize);

  const syncScroll = (scrollLeft) => {
    if (grid1Ref.current && grid2Ref.current) {
      grid1Ref.current.querySelector('.MuiDataGrid-virtualScroller').scrollLeft = scrollLeft;
      grid2Ref.current.querySelector('.MuiDataGrid-virtualScroller').scrollLeft = scrollLeft;
    }
  };

  const handleScroll = (e) => {
    syncScroll(e.target.scrollLeft);
  };

  const handlePinnedScroll = (e) => {
    if (pinnedGridRef.current) {
      pinnedGridRef.current.querySelector('.MuiDataGrid-virtualScroller').scrollLeft = e.target.scrollLeft;
    }
  };

  const pinnedKeys = Object.keys(pinnedAfect[0] || {});

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative', height: '100%' }}>
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Loader />
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', width: '100%', position: 'sticky', zIndex: 1000, boxSizing: 'border-box' }}>
            <Box
              sx={{
                width: '60%',
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

          {/* Contenedor para las tres tablas */}
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              flexGrow: 1,
              flexDirection: 'column',
              boxSizing: 'border-box',
              overflowX: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', width: '100%', flexGrow: 1 }}>
              {/* Tabla Pinned */}
              <Box ref={pinnedGridRef} sx={{ width: '20%', boxSizing: 'border-box' }}>
                <DataGrid
                  rows={paginatedPinnedAfect}
                  columns={getPinnedColumns(pinnedAfect)}
                  pageSize={pageSize}
                  hideFooterPagination
                  disableSelectionOnClick
                  disableColumnSorting
                  sx={{
                    height: calculatedGridHeight,
                    '& .MuiDataGrid-columnHeaders': {
                      position: 'sticky',
                    },
                    '& .MuiDataGrid-virtualScroller': {
                      marginTop: '0 !important',
                    },
                    '& .MuiDataGrid-main': {
                      overflow: 'visible',
                    },
                    '& .MuiDataGrid-scrollbar--horizontal': {
                      display: 'none',
                    },
                  }}
                />

                {/* Scrollbar horizontal para tabla pinned */}
                <Box
                  className="scrollbar-container-pinned"
                  sx={{
                    width: '100%',
                    height: '16px',
                    backgroundColor: 'green',
                    borderRadius: '8px',
                    marginTop: 'auto',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    margin:'2px'
                  }}
                  onScroll={handlePinnedScroll}
                >
                  <Box sx={{ width: `${pinnedScrollbarWidth}px`, height: '1px' }} />
                </Box>
              </Box>

              {/* Contenedor para tablas 1 y 2 */}
              <Box
                sx={{
                  width: '80%',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  overflowX: 'hidden',
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', flexGrow: 1 }}>
                  {/* Tabla 1 */}
                  <Box ref={grid1Ref} sx={{ width: '50%', boxSizing: 'border-box' }}>
                    <DataGrid
                      rows={paginatedAfectaciones1}
                      columns={getComparisonColumns(afectaciones1, afectaciones2, 'table1', pinnedKeys)}
                      pageSize={pageSize}
                      hideFooterPagination
                      disableSelectionOnClick
                      disableColumnSorting
                      sx={{
                        height: calculatedGridHeight,
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

                  {/* Tabla 2 */}
                  <Box ref={grid2Ref} sx={{ width: '50%', boxSizing: 'border-box' }}>
                    <DataGrid
                      rows={paginatedAfectaciones2}
                      columns={getComparisonColumns(afectaciones1, afectaciones2, 'table2', pinnedKeys)}
                      pageSize={pageSize}
                      hideFooterPagination
                      disableSelectionOnClick
                      disableColumnSorting
                      sx={{
                        height: calculatedGridHeight,
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

                {/* Scrollbar horizontal sincronizado para las tablas 1 y 2 */}
                <Box
                  className="scrollbar-container"
                  sx={{
                    width: '100%',
                    height: '16px',
                    backgroundColor: '#5c6bc0',
                    borderRadius: '8px',
                    marginTop: 'auto',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    margin:'2px'
                  }}
                  onScroll={handleScroll}
                >
                  <Box sx={{ width: `${scrollbarWidth}px`, height: '1px' }} />
                </Box>
              </Box>
            </Box>
          </Box>

          <Box display="flex" justifyContent="center" marginTop="16px">
            <Pagination count={Math.ceil(maxRows / pageSize)} page={page} onChange={handlePageChange} color="primary" />
          </Box>
        </>
      )}
    </Box>
  );
};

export default AfectacionesDataGrid;
