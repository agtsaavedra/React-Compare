import React, { useState } from 'react';
import AfectacionesDataGrid from './components/AfectacionesDataGrid';
import SearchBar from './components/SearchBar';
import useFetchData from './hooks/useFetchData';
import Loader from './components/Loader';
import './App.css';
import { afectacionesLocal, afectacionesLocal2 } from './var.js';

const App = () => {
  const [filterText, setFilterText] = useState('');

  // Supongamos que estos son los endpoints que vas a utilizar para obtener los datos
  const url1 = 'https://services-dev.ufasta.edu.ar/a/perso/snap/compare/1/2';
  const url2 = 'https://services-dev.ufasta.edu.ar/a/perso/snap/compare/2/1';

  // Utiliza el hook personalizado para obtener los datos y el estado de carga
  const { data: afectaciones1, loading: loading1, error: error1 } = useFetchData(url1);
  const { data: afectaciones2, loading: loading2, error: error2 } = useFetchData(url2);

  // Determina si se está cargando cualquiera de las dos solicitudes
  const isLoading = loading1 || loading2;

  // Si hay error o los datos son nulos o indefinidos, usar datos locales
  const finalAfectaciones1 = afectaciones1 && afectaciones1.length > 0 ? afectaciones1 : afectacionesLocal;
  const finalAfectaciones2 = afectaciones2 && afectaciones2.length > 0 ? afectaciones2 : afectacionesLocal2;

  // Mostrar el error solo si no hay datos ni del servidor ni locales
  const hasError = (error1 || error2) && (!finalAfectaciones1.length || !finalAfectaciones2.length);

  return (
    <div className="App">
      {isLoading ? (
        <Loader />
      ) : hasError ? (
        <div className="error-message">Error al llamar al servicio</div>
      ) : (
        <>
          <SearchBar filterText={filterText} onFilterTextChange={setFilterText} />
          <AfectacionesDataGrid
            afectaciones1={finalAfectaciones1}
            afectaciones2={finalAfectaciones2}
            filterText={filterText}
          />
        </>
      )}
    </div>
  );
};

export default App;
