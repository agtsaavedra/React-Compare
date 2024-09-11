import React, { useRef, useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import PartialLoader from './PartialLoader'; // El nuevo loader parcial
import { calculateTotalWidth, getPinnedColumns, getComparisonColumns } from '../utils/columnUtils';
import TooltipFab from './TooltipFab';
import PaginationComponent from './PaginationComponent';
import HeaderBoxes from './HeaderBoxes';
import CustomNoRowsOverlay from './CustomNoRows';
import { esES } from '@mui/x-data-grid/locales';

const AfectacionesDataGrid = ({ afectaciones1, afectaciones2, pinnedAfect, availableHeight, loading }) => {
  const grid1Ref = useRef(null);
  const grid2Ref = useRef(null);
  const pinnedGridRef = useRef(null);
  const [page, setPage] = useState(1);
  const [showDifferences, setShowDifferences] = useState(false);
  const rowHeight = 52;
  const [pageSize, setPageSize] = useState(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  // Estado para el ancho del scrollbar
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const [pinnedScrollbarWidth, setPinnedScrollbarWidth] = useState(0); // Para la tabla pinned

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
    const newPageSize = Math.floor((windowHeight - 250) / rowHeight);
    setPageSize(newPageSize > 0 ? newPageSize : 1);

    const maxPages = Math.ceil(maxRows / newPageSize);
    if (page > maxPages) {
      setPage(maxPages);
    }

    // Calcula el ancho total de las columnas para sincronizar el ancho del scrollbar
    const totalWidth = calculateTotalWidth(getComparisonColumns(afectaciones1, afectaciones2, 'table1')) + 900;
    const totalPinnedWidth = calculateTotalWidth(getPinnedColumns(pinnedAfect)) + 900; // Para la tabla pinned

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
    <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative', height: 'calc(100vh - 90px - 160px)' }}>
      <TooltipFab showDifferences={showDifferences} setShowDifferences={setShowDifferences} />

      <Box sx={{ display: 'flex', width: '100%', position: 'sticky', zIndex: 1000, boxSizing: 'border-box' }}>
        <HeaderBoxes />
      </Box>

      {loading ? (
        <PartialLoader /> // Usamos el loader parcial aquí
      ) : (
        <>
          {/* Contenedor para las tablas */}
          <Box sx={{ display: 'flex', width: '100%', flexGrow: 1 }}>
            <Box sx={{ display: 'flex', width: '100%', flexGrow: 1 }}>
              {/* Tabla Pinned */}
              <Box ref={pinnedGridRef} sx={{ width: '20%', boxSizing: 'border-box', height: calculatedGridHeight }}>
                <DataGrid
                  rows={paginatedPinnedAfect}
                  columns={getPinnedColumns(pinnedAfect)}
                  pageSize={pageSize}
                  hideFooterPagination
                  disableSelectionOnClick
                  disableColumnSorting
                  sx={{
                    '& .MuiDataGrid-columnHeaders': { position: 'sticky' },
                    '& .MuiDataGrid-virtualScroller': { marginTop: '0 !important' },
                    '& .MuiDataGrid-main': { overflow: 'visible' },
                    '& .MuiDataGrid-footerContainer': { display: 'none' },
                    '& .MuiDataGrid-filler': { display: 'none' },
                  }}
                  components={{
                    NoRowsOverlay: CustomNoRowsOverlay, // Mensaje personalizado cuando no hay filas
                    NoResultsOverlay: CustomNoRowsOverlay,
                  }}
                  localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                />

                {/* Scrollbar horizontal para la tabla pinned */}
                <Box
                  className="scrollbar-container-pinned"
                  sx={{
                    width: '100%',
                    height: '12px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    marginTop: 'auto',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
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
                  <Box ref={grid1Ref} sx={{ width: '50%', height: calculatedGridHeight }}>
                    <DataGrid
                      rows={paginatedAfectaciones1}
                      columns={getComparisonColumns(afectaciones1, afectaciones2, 'table1', pinnedKeys)}
                      pageSize={pageSize}
                      hideFooterPagination
                      disableSelectionOnClick
                      disableColumnSorting
                      sx={{
                        '& .MuiDataGrid-columnHeaders': { position: 'sticky' },
                        '& .MuiDataGrid-virtualScroller': { marginTop: '0 !important' },
                        '& .MuiDataGrid-main': { overflow: 'visible' },
                        '& .MuiDataGrid-footerContainer': { display: 'none' },
                        '& .MuiDataGrid-filler': { display: 'none' },
                      }}
                      components={{
                        NoRowsOverlay: CustomNoRowsOverlay, // Mostrar mensaje personalizado
                        NoResultsOverlay: CustomNoRowsOverlay,
                      }}
                      localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                    />
                  </Box>

                  {/* Tabla 2 */}
                  <Box ref={grid2Ref} sx={{ width: '50%', height: calculatedGridHeight }}>
                    <DataGrid
                      rows={paginatedAfectaciones2}
                      columns={getComparisonColumns(afectaciones1, afectaciones2, 'table2', pinnedKeys)}
                      pageSize={pageSize}
                      hideFooterPagination
                      disableSelectionOnClick
                      disableColumnSorting
                      sx={{
                        '& .MuiDataGrid-columnHeaders': { position: 'sticky' },
                        '& .MuiDataGrid-virtualScroller': { marginTop: '0 !important' },
                        '& .MuiDataGrid-main': { overflow: 'visible' },
                        '& .MuiDataGrid-footerContainer': { display: 'none' },
                        '& .MuiDataGrid-filler': { display: 'none' },
                      }}
                      components={{
                        NoRowsOverlay: CustomNoRowsOverlay,
                        NoResultsOverlay: CustomNoRowsOverlay,
                      }}
                      localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                    />
                  </Box>
                </Box>

                {/* Scrollbar horizontal sincronizado para las tablas 1 y 2 */}
                <Box
                  className="scrollbar-container"
                  sx={{
                    width: '100%',
                    height: '12px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    marginTop: 'auto',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                  }}
                  onScroll={handleScroll}
                >
                  <Box sx={{ width: `${scrollbarWidth}px`, height: '1px' }} />
                </Box>
              </Box>
            </Box>
          </Box>

          <Box display="flex" justifyContent="center" marginTop="16px" height={30}>
            <PaginationComponent
              maxRows={maxRows}
              pageSize={pageSize}
              page={page}
              handlePageChange={handlePageChange}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default AfectacionesDataGrid;
