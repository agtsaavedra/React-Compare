import React from 'react';
import { Pagination, Box } from '@mui/material';

const PaginationComponent = ({ maxRows, pageSize, page, handlePageChange }) => {
  return (
    <Box display="flex" justifyContent="center" marginTop="16px">
      <Pagination
        count={Math.ceil(maxRows / pageSize)}
        page={page}
        onChange={handlePageChange}
        color="primary"
      />
    </Box>
  );
};

export default PaginationComponent;