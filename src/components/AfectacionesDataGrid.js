import React, { useRef, useState, useLayoutEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Fab, Tooltip } from '@mui/material';
import { FilterList } from '@mui/icons-material';

const AfectacionesDataGrid = ({ afectaciones1, afectaciones2, filterText }) => {
  const grid1Ref = useRef(null);
  const grid2Ref = useRef(null);
  const [totalColumnsWidth, setTotalColumnsWidth] = useState(0);
  const [showDifferences, setShowDifferences] = useState(false);

  useLayoutEffect(() => {
    if (grid1Ref.current && grid2Ref.current) {
      const grid1Width = grid1Ref.current.querySelector('.MuiDataGrid-scrollbar--horizontal')?.scrollWidth;
      const grid2Width = grid2Ref.current.querySelector('.MuiDataGrid-scrollbar--horizontal')?.scrollWidth;
      setTotalColumnsWidth(Math.max(grid1Width, grid2Width));
      console.log(totalColumnsWidth)
    }
  }, [afectaciones1, afectaciones2]);

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

  const filterDifferences = (rows, otherRows) => {
    return rows.filter((row, index) => {
      const keys = Object.keys(row);
      return keys.some((key) => row[key] !== otherRows[index]?.[key]);
    });
  };

  const filteredRows1 = showDifferences ? filterDifferences(getRowsWithIds(afectaciones1), getRowsWithIds(afectaciones2)) : getRowsWithIds(afectaciones1);
  const filteredRows2 = showDifferences ? filterDifferences(getRowsWithIds(afectaciones2), getRowsWithIds(afectaciones1)) : getRowsWithIds(afectaciones2);

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
    setShowDifferences((prev) => !prev);
  };


  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
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
      <Box sx={{ display: 'flex', width: '100%', flexGrow: 1, flexDirection: 'row', overflowX: 'hidden' }}>
        <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
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
            ref={grid1Ref}
            sx={{
              width: '100%',
              height: '100%',
            }}
          >
            <DataGrid
              rows={filteredRows1}
              columns={columns1}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              checkboxSelection
              disableColumnMenu
              disableSelectionOnClick
              hideFooterPagination
              sx={{
                overflowX: 'hidden',
                "&.MuiDataGrid-scrollbar": {
                  overflow: "hidden",
                },
                "& .MuiDataGrid-columnHeaders": {
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  backgroundColor: 'white',
                },
                "& .MuiDataGrid-virtualScroller": {
                  marginTop: "0!important",
                },
              }}
            />
          </Box>
        </Box>
        <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              backgroundColor: 'green',
              padding: '8px',
              color: 'white',
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            <Typography>Lote Posterior</Typography>
          </Box>
          <Box
            ref={grid2Ref}
            sx={{
              width: '100%',
              height: '100%',
            }}
          >
            <DataGrid
              rows={filteredRows2}
              columns={columns2}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              checkboxSelection
              disableColumnMenu
              disableSelectionOnClick
              hideFooterPagination
              sx={{
                "&.MuiDataGrid-scrollbar": {
                  overflowX: "hidden"
                },
                "& .MuiDataGrid-columnHeaders": {
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  backgroundColor: 'white',
                },
                "& .MuiDataGrid-virtualScroller": {
                  marginTop: "0!important",
                  overflow: "hidden",
                },
              }}
            />
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          width: '100%',
          overflowX: 'auto',
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
    </Box>
  );
};

export default AfectacionesDataGrid;

