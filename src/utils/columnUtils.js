export const calculateColumnWidth = (field, rows, headerText) => {
    const headerWidth = headerText.length * 10;
    const maxCellWidth = Math.max(...rows.map((row) => String(row[field] || '').length * 10));
    return Math.max(headerWidth, maxCellWidth);
  };
  
  export const calculateTotalWidth = (columns) => {
    return columns.reduce((totalWidth, col) => totalWidth + col.width, 0);
  };
  
  export const getPinnedColumns = (pinnedAfect) => {
    const pinnedColumnOrder = ['Legajo', 'nombre', 'EnSnap', 'funcion', 'CategoriaLiquidacion', 'idAfectacionAcademica', 'idAfectacionPresupuestaria'];
    return pinnedColumnOrder.map((key) => ({
      field: key,
      headerName: key.replace(/_/g, ' ').toUpperCase(),
      width: calculateColumnWidth(key, pinnedAfect, key.replace(/_/g, ' ').toUpperCase()),
      headerClassName: 'header-cell',
      cellClassName: (params) => '',
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
  