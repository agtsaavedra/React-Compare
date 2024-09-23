import { gridFilteredSortedRowIdsSelector } from '@mui/x-data-grid';


export const calculateColumnWidth = (field, rows, headerText) => {
    const headerWidth = headerText.length * 10;
    const maxCellWidth = Math.max(...rows.map((row) => String(row[field] || '').length * 10));
    return Math.max(headerWidth, maxCellWidth);
  };
  
  export const calculateTotalWidth = (columns) => {
    return columns.reduce((totalWidth, col) => totalWidth + col.width, 0);
  };

  export const getRowsWithIds = (afectaciones = []) =>
    afectaciones.map((afectacion, index) => ({
      id: index + 1,
      ...afectacion,
    }));

    export const handleFilterModelChange = (model, apiRef, setFilteredIds, pageSize, setPage, setRowsCount, page) => {
      setTimeout(() => {
        const visibleRowIds = gridFilteredSortedRowIdsSelector(apiRef.current.state);
    
        if (model.items && model.items.length > 0 && model.items[0].value) {
          setFilteredIds(visibleRowIds); // Actualizar filteredIds solo si hay un valor en el filtro
        } else {
          setFilteredIds([]); // Limpiar filteredIds si no hay filtros activos
        }
    
        // Actualizar la paginación y el conteo de filas inmediatamente después de aplicar los filtros
        const filteredRowCount = visibleRowIds.length;
        const maxPages = Math.ceil(filteredRowCount / pageSize);
        if (page > maxPages) {
          setPage(1); // Volver a la primera página si el número de filas es menor que la página actual
        }
        setRowsCount(filteredRowCount); // Actualizar el conteo de filas con los datos filtrados
      }, 50);
    };

    export const syncScroll = (scrollLeft, grid1Ref, grid2Ref) => {
      if (grid1Ref.current && grid2Ref.current) {
        grid1Ref.current.querySelector('.MuiDataGrid-virtualScroller').scrollLeft = scrollLeft;
        grid2Ref.current.querySelector('.MuiDataGrid-virtualScroller').scrollLeft = scrollLeft;
      }
    };


  export const getPinnedColumns = (pinnedAfect) => {
    const pinnedColumnOrder = ['Legajo', 'nombre', 'EnSnap', 'funcion', 'CategoriaLiquidacion', 'idAfectacionAcademica', 'idAfectacionPresupuestaria'];
    
    return pinnedColumnOrder.map((key) => ({
      field: key,
      headerName: key.replace(/_/g, ' ').toUpperCase(),
      width: calculateColumnWidth(key, pinnedAfect, key.replace(/_/g, ' ').toUpperCase()),
      headerClassName: 'header-cell',
      cellClassName: (params) => '',
  
      // Agregar el renderCell solo para la columna "nombre"
      renderCell: key === 'nombre' ? (params) => (
        <a
          href={`https://apps-dev.ufasta.edu.ar/personal/legajos/#/tabs/cargos-afectaciones?Legajo=${params.row.Legajo}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
          title="Clic para ver más detalles" // Tooltip al pasar el ratón
        >
          {params.value}
        </a>
      ) : undefined, // Para las demás columnas no hacemos renderCell personalizado
    }));
  };
  
  export const getComparisonColumns = (afectaciones1, afectaciones2, tableType, pinnedKeys = []) => {
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
        const value1 = afectaciones1[rowIndex] ? afectaciones1[rowIndex][key] : '';
        const value2 = afectaciones2[rowIndex] ? afectaciones2[rowIndex][key] : '';
        if (value1 !== value2) {
            return tableType === 'table1' ? 'cell-different-red' : 'cell-different-green';
          }
          return '';
      },
    }));
  };
  