import React, { useState, useEffect } from 'react';
import { Button, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import useFetchData from '../hooks/useFetchData';
import { snaps as localSnapData } from '../var2';
import '../css/SearchBar.css'; // Importar los estilos
import Loader from './Loader';

const SearchBar = ({ delayedSearch, snap1: initialSnap1, snap2: initialSnap2 }) => {
  const { data, loading, error } = useFetchData('https://services-dev.ufasta.edu.ar/a/perso/afectaciones/snap/selecciona');
  const [snapData, setSnapData] = useState([]);
  const [snap1, setSnap1] = useState(initialSnap1); // Inicializa con el valor recibido
  const [snap2, setSnap2] = useState(initialSnap2); // Inicializa con el valor recibido

  // Detectar los parámetros en la URL
  useEffect(() => {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 3) {
      const paramSnap1 = pathParts[pathParts.length - 2];
      const paramSnap2 = pathParts[pathParts.length - 1];

      // Esperar hasta que los datos estén disponibles y encontrar los snaps correspondientes
      if (snapData.length > 0) {
        const snap1Match = snapData.find(snap => snap.id_snap === paramSnap1);
        const snap2Match = snapData.find(snap => snap.id_snap === paramSnap2);
        if (snap1Match) setSnap1(snap1Match);
        if (snap2Match) setSnap2(snap2Match);

        // Realizar la búsqueda automática si ambos snaps son válidos
        if (snap1Match && snap2Match) {
          delayedSearch(snap1Match.id_snap, snap2Match.id_snap);
        }
      }
    }
  }, [snapData]); // Ejecutar cuando snapData esté listo

  // Manejar errores y asignar datos locales si es necesario
  useEffect(() => {
    if (error) {
      console.warn('Error en el fetch, usando datos locales:', error);
      setSnapData(localSnapData);
    } else if (data) {
      setSnapData(data); // Asignar los datos obtenidos
    }
  }, [data, error]);

  // Manejar la búsqueda manual si el usuario cambia los valores
  const handleSearch = () => {
    if (snap1 && snap2) {
      delayedSearch(snap1.id_snap, snap2.id_snap); // Pasar los IDs seleccionados
    }
  };

  if (loading) {
    return <Loader />; // Mostrar el loader mientras se cargan los datos
  }

  return (
    <div className="searchbar-box">
      <div className="autocomplete-wrapper">
        <Autocomplete
          options={snapData}
          getOptionLabel={(option) => option.nombre_snap}
          value={snap1} // Mostrar el valor seleccionado
          isOptionEqualToValue={(option, value) => option.id_snap === value?.id_snap} // Verificar que los valores coincidan por ID
          sx={{ width: 500, height: 30 }}
          onChange={(event, newValue) => setSnap1(newValue)} // Cambiar el valor seleccionado
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Seleccione Snap 1"
              variant="outlined"
              className="searchbar-input"
              sx={{
                '& .MuiOutlinedInput-root': { height: '35px' }, // Ajustar la altura del contenedor del input
              }}
            />
          )}
        />

        <Autocomplete
          options={snapData}
          getOptionLabel={(option) => option.nombre_snap}
          value={snap2} // Mostrar el valor seleccionado
          isOptionEqualToValue={(option, value) => option.id_snap === value?.id_snap} // Verificar que los valores coincidan por ID
          sx={{ width: 500, height: 30 }}
          onChange={(event, newValue) => setSnap2(newValue)} // Cambiar el valor seleccionado
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Seleccione Snap 2"
              variant="outlined"
              className="searchbar-input"
              sx={{
                '& .MuiOutlinedInput-root': { height: '35px' }, // Ajustar la altura del contenedor del input
              }}
            />
          )}
        />

        <Button
          variant="contained"
          className="searchbar-box-btn"
          onClick={handleSearch}
          startIcon={<SearchIcon />}
        >
          Buscar
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
