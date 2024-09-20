import React, { useRef, useState, useEffect } from 'react';
import { DataGrid, gridFilteredSortedRowIdsSelector, useGridApiRef } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import PartialLoader from './PartialLoader'; // El nuevo loader parcial
import { calculateTotalWidth, getPinnedColumns, getComparisonColumns } from '../utils/columnUtils';
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
  const rowHeight = 45; // Establece la altura de la fila en 45px
  const [pageSize, setPageSize] = useState(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [filtersActive, setFiltersActive] = useState(false);// Ref para guardar los IDs anteriores
  // Estado para los IDs filtrados en la tabla pinned
  const [filteredIds, setFilteredIds] = useState([]);
  const previousMaxRows = useRef(0);
  // Estado para el ancho del scrollbar
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const [pinnedScrollbarWidth, setPinnedScrollbarWidth] = useState(0); // Para la tabla pinned

  const apiRefPinned = useGridApiRef(); // Usar apiRef solo para la tabla pinned

  const calculatedGridHeight = pageSize ? pageSize * rowHeight + 80 : availableHeight;

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const getRowsWithIds = (afectaciones = []) =>
    afectaciones.map((afectacion, index) => ({
      id: index + 1,
      ...afectacion,
    }));

  const allRows1 = getRowsWithIds(afectaciones1);
  const allRows2 = getRowsWithIds(afectaciones2);
  const allPinnedRows = getRowsWithIds(pinnedAfect);

  const maxRows = Math.max(allRows1.length, allRows2.length);
  const [rowsCount, setRowsCount] = useState(maxRows); 
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

  const paginatedAfectaciones1 = allRows1
    .filter(row => filteredIds.length === 0 || filteredIds.includes(row.id)) // Mostrar solo las filas que coincidan con los IDs filtrados
    .slice((page - 1) * pageSize, page * pageSize);

  const paginatedAfectaciones2 = allRows2
    .filter(row => filteredIds.length === 0 || filteredIds.includes(row.id)) // Mostrar solo las filas que coincidan con los IDs filtrados
    .slice((page - 1) * pageSize, page * pageSize);

  const paginatedPinnedAfect = allPinnedRows.slice((page - 1) * pageSize, page * pageSize);

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

  const handleClearFilterPinned = () => {
    if (filteredIds.length > 0) {
      setFilteredIds([]); // Restablecemos los IDs filtrados
      if (grid1Ref.current) {
        grid1Ref.current.apiRef?.current.forceUpdate(); // Forzamos la actualización de la tabla 1
      }
      if (grid2Ref.current) {
        grid2Ref.current.apiRef?.current.forceUpdate(); // Forzamos la actualización de la tabla 2
      }
    }
  };


  const handleFilterModelChange = (model) => {
    setTimeout(() => {
      const visibleRowIds = gridFilteredSortedRowIdsSelector(apiRefPinned.current.state);
      
      // Verificamos si model.items existe y tiene al menos un elemento
      if (model.items && model.items.length > 0) {
        // Si el valor del primer filtro es vacío, nulo o no definido, vaciamos los filteredIds
        if (model.items[0].value === '' || model.items[0].value === null || !model.items[0].value) {
          setFilteredIds([]); // Vaciar filteredIds si no hay valor en el filtro
        } else {
          setFilteredIds(visibleRowIds); // Actualizamos los IDs filtrados si hay un valor válido
        }
      } else {
        // Si model.items está vacío o no existe, también vaciamos filteredIds
        setFilteredIds([]); // Vaciar filteredIds si no hay filtros activos
      }
    }, 50); // Timeout para asegurar que el filtro se aplique antes de capturar los IDs
  };
  

  useEffect(() => {

    console.log(previousMaxRows.current)
    // Guardar el valor original de maxRows antes de aplicar los filtros
    if (filteredIds.length > 0 && previousMaxRows.current === 0) {
      previousMaxRows.current = maxRows; // Guardamos el número total de filas antes de aplicar los filtros
    }
  
    if (filteredIds.length === 0) {
      // Restaurar el valor original de maxRows y recalcular el pageSize
      setRowsCount(previousMaxRows.current); // Restaurar el número total de filas sin filtrar
    } else {
      // Actualizar el número total de filas filtradas
      setRowsCount(filteredIds.length); // Actualizamos el estado con el número de filas filtradas
    }
  }, [filteredIds, maxRows]);
  
  useEffect(() => {
    if (!filtersActive) {
      // Si no hay filtros activos, restauramos el número original de filas
      if (previousMaxRows.current === 0) {
        previousMaxRows.current = maxRows; // Guardamos el número total de filas la primera vez
      }
      setRowsCount(previousMaxRows.current); // Restauramos el número de filas sin filtrar
    } else {
      // Si hay filtros activos, actualizamos el número de filas filtradas
      setRowsCount(filteredIds.length);
    }
  }, [filtersActive, filteredIds.length, maxRows]);


  const pinnedKeys = Object.keys(pinnedAfect[0] || {});

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative', height: 'calc(100vh - 90px - 160px)' }}>
      {/* TooltipFab actualizado sin la funcionalidad de diferencias */}
      <TooltipFab />

      <Box sx={{ display: 'flex', width: '100%', position: 'sticky', zIndex: 1000, boxSizing: 'border-box' }}>
        <HeaderBoxes />
      </Box>

      {loading ? (
        <PartialLoader /> // Usamos el loader parcial aquí
      ) : afectaciones1.length > 0 ? (
        <>
          {/* Contenedor para las tablas */}
          <Box sx={{ display: 'flex', width: '100%', flexGrow: 1 }}>
            <Box sx={{ display: 'flex', width: '100%', flexGrow: 1 }}>
              {/* Tabla Pinned */}
              <Box ref={pinnedGridRef} sx={{ width: '20%', boxSizing: 'border-box', height: calculatedGridHeight }}>
                <Box sx={{ display: 'flex', flexGrow: 1, height: calculatedGridHeight }}>
                  <DataGrid
                    rows={paginatedPinnedAfect}
                    columns={getPinnedColumns(pinnedAfect)} // Aquí usamos el renderCell en la columna "Nombre"
                    pageSize={pageSize}
                    apiRef={apiRefPinned} // Usar apiRef solo para la tabla pinned
                    hideFooterPagination
                    disableSelectionOnClick
                    autoHeight
                    disableColumnSorting
                    rowHeight={rowHeight} // Establecer la altura de la fila a 40px
                    onFilterModelChange={handleFilterModelChange} // Capturar cambios de filtro en la tabla pinned
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
                </Box>
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
                      autoHeight
                      hideFooterPagination
                      disableSelectionOnClick
                      disableColumnSorting
                      disableColumnFilter // Deshabilitar la opción de filtrado en esta tabla
                      rowHeight={rowHeight} // Establecer la altura de la fila a 40px
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
                      disableColumnFilter // Deshabilitar la opción de filtrado en esta tabla
                      autoHeight
                      rowHeight={rowHeight} // Establecer la altura de la fila a 40px
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
