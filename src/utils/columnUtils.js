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
    export const handleFilterModelChange = (model, apiRef, setFilteredIds, pageSize, setPage, setRowsCount, page, originalRows, setFilteredRows) => {
      setTimeout(() => {
          // Si hay filtros aplicados
          if (model.items && model.items.length > 0) {
              // Aplicamos el filtro manualmente sobre el conjunto completo de originalRows
              const filteredData = originalRows.filter((row) => {
                  // Para cada fila, verificamos si cumple con todos los filtros del modelo
                  return model.items.every((filterItem) => {
                      const { field, value, operator } = filterItem;
                      
                      if (!value || !field) return true; // Si no hay valor o campo, no hacemos nada
                      
                      const cellValue = row[field]; // Obtener el valor de la celda para la columna que se filtra
  
                      // Manejo de operadores dinámicos
                      switch (operator) {
                          case 'contains':
                              return String(cellValue).toLowerCase().includes(String(value).toLowerCase());
                          case 'equals':
                              return String(cellValue) === String(value);
                          case 'startsWith':
                              return String(cellValue).toLowerCase().startsWith(String(value).toLowerCase());
                          case 'endsWith':
                              return String(cellValue).toLowerCase().endsWith(String(value).toLowerCase());
                          case 'isEmpty':
                              return !cellValue || String(cellValue).trim() === '';
                          case 'isNotEmpty':
                              return cellValue && String(cellValue).trim() !== '';
                          case 'greaterThan':
                              return Number(cellValue) > Number(value);
                          case 'lessThan':
                              return Number(cellValue) < Number(value);
                          default:
                              return true; // Si no hay un operador definido o no lo reconocemos, devolvemos true
                      }
                  });
              });
  
              // Actualizamos los datos filtrados y los IDs filtrados
              setFilteredRows(filteredData); // Guardar el dataset filtrado
              const filteredIds = filteredData.map((row) => row.id); // Extraer los IDs filtrados
              setFilteredIds(filteredIds); // Actualizar los IDs filtrados
              setRowsCount(filteredData.length); // Actualizar el conteo de filas
  
              // Ajustar la página si el número de filas es menor al número de filas por página
              if (page > Math.ceil(filteredData.length / pageSize)) {
                  setPage(1); // Volver a la primera página si la página actual excede el máximo de páginas
              }
          } else {
              // Si no hay filtros, revertimos a los datos originales
              setFilteredRows(originalRows);
              setFilteredIds([]); // Limpiamos los IDs filtrados
              setRowsCount(originalRows.length); // Actualizamos el número de filas
          }
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
  