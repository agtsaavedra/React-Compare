import React, { useRef } from 'react';
import { Button, Icon } from '@mui/material';
import '../css/SearchBar.css'; // Importar los estilos


import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ delayedSearch }) => {
  const searchBarRef = useRef(null);

  return (
    <div className="searchbar-box">
      <input
        type="text"
        placeholder="funcion | legajo"
        onChange={(e) => {
          delayedSearch(e.target.value);
        }}
        ref={searchBarRef}
        className="searchbar-input"
      />
      <Button variant="contained" className="searchbar-box-btn">
        <SearchIcon></SearchIcon>
      </Button>
    </div>
  );
};

export default SearchBar;