import React, { useState, useEffect } from 'react';
import { Button, TextField, CircularProgress } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import useFetchData from '../hooks/useFetchData';
import { snaps as localSnapData } from '../var2';
import '../css/SearchBar.css'; // Importar los estilos

const SearchBar = ({ delayedSearch }) => {
  const { data, loading, error } = useFetchData('https://services-dev.ufasta.edu.ar/a/perso/afectaciones/snap/selecciona');
  const [snapData, setSnapData] = useState([]);
  const [snap1, setSnap1] = useState(null);
  const [snap2, setSnap2] = useState(null);

  useEffect(() => {
    if (error) {
      console.warn('Error en el fetch, usando datos locales:', error);
      setSnapData(localSnapData);
    } else if (data) {
      setSnapData(data);
    }
  }, [data, error]);

  const handleSearch = () => {
    if (snap1 && snap2) {
      delayedSearch(snap1.id_snap, snap2.id_snap); // Pasar los IDs seleccionados
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div className="searchbar-box">
      <div className="autocomplete-wrapper">
        <Autocomplete
          options={snapData} // Asegurarse de pasar el objeto completo
          getOptionLabel={(option) => option.nombre_snap} // Mostrar el nombre en la lista de opciones
          value={snap1}
          onChange={(event, newValue) => setSnap1(newValue)} // Seleccionar el objeto completo
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Seleccione Snap 1" // Reemplaza el label por un placeholder
              variant="outlined"
              className="searchbar-input"
            />
          )}
        />
      </div>
      <div className="autocomplete-wrapper">
        <Autocomplete
          options={snapData} // Asegurarse de pasar el objeto completo
          getOptionLabel={(option) => option.nombre_snap} // Mostrar el nombre en la lista de opciones
          value={snap2}
          onChange={(event, newValue) => setSnap2(newValue)} // Seleccionar el objeto completo
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Seleccione Snap 2" // Reemplaza el label por un placeholder
              variant="outlined"
              className="searchbar-input"
            />
          )}
        />
      </div>
      <Button
        variant="contained"
        className="searchbar-box-btn"
        onClick={handleSearch}
        startIcon={<SearchIcon />}
      >
        Buscar
      </Button>
    </div>
  );
};

export default SearchBar;
