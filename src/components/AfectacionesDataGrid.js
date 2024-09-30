import React, { useRef, useState, useEffect } from 'react';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import PartialLoader from './PartialLoader';
import {calculateTotalWidth,getPinnedColumns,getComparisonColumns,getRowsWithIds,syncScroll,handleFilterModelChange,} from '../utils/columnUtils';
import TooltipFab from './TooltipFab';
import PaginationComponent from './PaginationComponent';
import HeaderBoxes from './HeaderBoxes';
import CustomNoRowsOverlay from './CustomNoRows';
import { esES } from '@mui/x-data-grid/locales';

const AfectacionesDataGrid = ({ afectaciones1 = [], afectaciones2 = [], pinnedAfect = [], availableHeight, loading }) => {
  const grid1Ref = useRef(null);
  const grid2Ref = useRef(null);
  const pinnedGridRef = useRef(null);
  const [page, setPage] = useState(1);
  const rowHeight = 40;
  const [pageSize, setPageSize] = useState(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [filteredIds, setFilteredIds] = useState([]);
  const [rowsCount, setRowsCount] = useState(0);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const [pinnedScrollbarWidth, setPinnedScrollbarWidth] = useState(0);

  const [filteredRows1, setFilteredRows1] = useState([]);
  const [filteredRows2, setFilteredRows2] = useState([]);
  const [filteredPinnedRows, setFilteredPinnedRows] = useState([]);

  const apiRefPinned = useGridApiRef();
  const apiRefGrid1 = useGridApiRef();
  const apiRefGrid2 = useGridApiRef();

  const calculatedGridHeight = pageSize ? pageSize * rowHeight + 80 : availableHeight;

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const allRows1 = getRowsWithIds(afectaciones1);
  const allRows2 = getRowsWithIds(afectaciones2);
  const allPinnedRows = getRowsWithIds(pinnedAfect);

  const maxRows = Math.max(allRows1.length, allRows2.length);

  // Actualizar el tamaño de página y el número de filas cuando cambie la altura de la ventana o los filtros
  useEffect(() => {
    // Función para manejar el cambio de tamaño de la ventana
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
  
    // Escuchar el evento 'resize' para actualizar el estado de windowHeight
    window.addEventListener('resize', handleResize);
  
    // Calcular el nuevo tamaño de página
    const newPageSize = Math.floor((windowHeight - 250) / rowHeight);
    setPageSize(newPageSize > 0 ? newPageSize : 1);
  
    // Actualizar el número de filas
    const currentRowsCount = filteredIds.length > 0 ? filteredIds.length : maxRows;
    setRowsCount(currentRowsCount);
  
    // Calcular el ancho total de las tablas
    const totalWidth = calculateTotalWidth(getComparisonColumns(afectaciones1, afectaciones2, 'table1')) + 900;
    const totalPinnedWidth = calculateTotalWidth(getPinnedColumns(pinnedAfect)) + 900;
    setScrollbarWidth(totalWidth);
    setPinnedScrollbarWidth(totalPinnedWidth);
  
    // Limpiar el listener al desmontar el componente
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [windowHeight, maxRows, afectaciones1, afectaciones2, pinnedAfect, filteredIds]);

  // Ajustar la página si los filtros modifican el número de páginas disponibles
  useEffect(() => {
    const maxPages = Math.ceil(rowsCount / pageSize);

    if (page > maxPages) {
      setPage(maxPages > 0 ? maxPages : 1);
    }
  }, [rowsCount, pageSize]);

  // Al aplicar un filtro, restablecer la página a la primera y ajustar el número de filas
  useEffect(() => {
    const filteredRowCount = filteredIds.length > 0 ? filteredIds.length : maxRows;
    setPage(1); // Restablecer siempre a la primera página al aplicar un filtro
    setRowsCount(filteredRowCount); // Ajustar el número de filas basado en los filtros
  }, [filteredIds]);

  const handleScroll = (e) => {
    syncScroll(e.target.scrollLeft, grid1Ref, grid2Ref);
  };

  const handlePinnedScroll = (e) => {
    if (pinnedGridRef.current) {
      pinnedGridRef.current.querySelector('.MuiDataGrid-virtualScroller').scrollLeft = e.target.scrollLeft;
    }
  };

  const paginatedAfectaciones1 = allRows1
    .filter((row) => filteredIds.length === 0 || filteredIds.includes(row.id))
    .slice((page - 1) * pageSize, page * pageSize);

  const paginatedAfectaciones2 = allRows2
    .filter((row) => filteredIds.length === 0 || filteredIds.includes(row.id))
    .slice((page - 1) * pageSize, page * pageSize);

  const paginatedPinnedAfect = allPinnedRows
    .filter((row) => filteredIds.length === 0 || filteredIds.includes(row.id))
    .slice((page - 1) * pageSize, page * pageSize);

  const pinnedKeys = Object.keys(pinnedAfect[0] || {});

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative', height: 'calc(100vh - 90px - 160px)' }}>
      <TooltipFab />

      <Box sx={{ display: 'flex', width: '100%', position: 'sticky', zIndex: 1000, boxSizing: 'border-box' }}>
        <HeaderBoxes />
      </Box>

      {loading ? (
        <PartialLoader />
      ) : afectaciones1.length > 0 ? (
        <>
          <Box sx={{ display: 'flex', width: '100%', flexGrow: 1 }}>
            <Box sx={{ display: 'flex', width: '100%', flexGrow: 1 }}>
              <Box ref={pinnedGridRef} sx={{ width: '20%', boxSizing: 'border-box', height: calculatedGridHeight }}>
              <Box sx={{ display: 'flex', flexGrow: 1, height: calculatedGridHeight }}>
                <DataGrid
                  rows={paginatedPinnedAfect}
                  columns={getPinnedColumns(pinnedAfect)}
                  pageSize={pageSize}
                  apiRef={apiRefPinned}
                  hideFooterPagination
                  disableSelectionOnClick
                  autoHeight
                  disableColumnSorting
                  rowHeight={rowHeight}
                  onFilterModelChange={(model) => handleFilterModelChange(model, apiRefPinned, setFilteredIds, pageSize, setPage, setRowsCount, page, allRows1, setFilteredPinnedRows)}
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
                  <Box ref={grid1Ref} sx={{ width: '50%', height: calculatedGridHeight }}>
                    <DataGrid
                      rows={paginatedAfectaciones1}
                      columns={getComparisonColumns(afectaciones1, afectaciones2, 'table1', pinnedKeys)}
                      pageSize={pageSize}
                      autoHeight
                      hideFooterPagination
                      disableSelectionOnClick
                      disableColumnSorting
                      rowHeight={rowHeight}
                      apiRef={apiRefGrid1}
                      onFilterModelChange={(model) => handleFilterModelChange(model, apiRefGrid1, setFilteredIds, pageSize, setPage, setRowsCount, page, allRows1, setFilteredRows1)}
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

                  <Box ref={grid2Ref} sx={{ width: '50%', height: calculatedGridHeight }}>
                    <DataGrid
                      rows={paginatedAfectaciones2}
                      columns={getComparisonColumns(afectaciones1, afectaciones2, 'table2', pinnedKeys)}
                      pageSize={pageSize}
                      hideFooterPagination
                      disableSelectionOnClick
                      disableColumnSorting
                      autoHeight
                      rowHeight={rowHeight}
                      apiRef={apiRefGrid2}
                      onFilterModelChange={(model) => handleFilterModelChange(model, apiRefGrid2, setFilteredIds, pageSize, setPage, setRowsCount, page, allRows1, setFilteredRows2)}
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
              maxRows={rowsCount}
              pageSize={pageSize}
              page={page}
              handlePageChange={handlePageChange}
            />
          </Box>
        </>
      ) : (
        <div style={{ justifyContent: 'center', alignContent: 'center', display: 'flex', alignItems: 'center' }}>
          No hay datos disponibles
        </div>
      )}
    </Box>
  );
};

export default AfectacionesDataGrid;
