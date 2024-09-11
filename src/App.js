import React, { useState, useEffect } from 'react';
import AfectacionesDataGrid from './components/AfectacionesDataGrid';
import SearchBar from './components/SearchBar';
import useFetchData from './hooks/useFetchData';
import Loader from './components/Loader'; // Loader pantalla completa
import { afectacionesLocal, afectacionesLocal2, pinnedafect } from './var.js';

const App = () => {
  const [snap1, setSnap1] = useState(null);
  const [snap2, setSnap2] = useState(null);
  const [availableHeight, setAvailableHeight] = useState(window.innerHeight);
  const [isFetching, setIsFetching] = useState(true); // Para loader de pantalla completa
  const [loadingPartial, setLoadingPartial] = useState(false); // Para el loader parcial al buscar

  const [url1, setUrl1] = useState(null);
  const [url2, setUrl2] = useState(null);
  const [url3, setUrl3] = useState(null);

  const { data: afectaciones1, loading: loading1, error: error1 } = useFetchData(url1);
  const { data: afectaciones2, loading: loading2, error: error2 } = useFetchData(url2);
  const { data: pinnedAfectacion, loading: loading3, error: error3 } = useFetchData(url3);

  // Controla el loader de pantalla completa al cargar los datos iniciales
  useEffect(() => {
    if (!loading1 && !loading2 && !loading3) {
      setIsFetching(false); // Desactiva loader de pantalla completa cuando los datos están listos
    }
  }, [loading1, loading2, loading3]);

  // Al iniciar una búsqueda, activa el estado de carga parcial y restablece en caso de error
  const delayedSearch = (selectedSnap1, selectedSnap2) => {
    setSnap1(selectedSnap1);
    setSnap2(selectedSnap2);
    setLoadingPartial(true); // Activa el loader parcial al iniciar la búsqueda

    // Restablece el estado del loader parcial después de 3 segundos si la búsqueda falla
    setTimeout(() => {
      if (loading1 || loading2 || loading3 || error1 || error2 || error3) {
        setLoadingPartial(false); // Forzar desactivación del loader si ocurre un error o timeout
      }
    }, 3000);
  };

  // Controla las URLs dinámicas basadas en los snaps seleccionados
  useEffect(() => {
    if (snap1 && snap2) {
      setUrl1(`https://services-dev.ufasta.edu.ar/a/perso/snap/compare/${snap1}/${snap2}`);
      setUrl2(`https://services-dev.ufasta.edu.ar/a/perso/snap/compare/${snap2}/${snap1}`);
      setUrl3(`https://services-dev.ufasta.edu.ar/a/perso/snap/compare/pinned/${snap1}/${snap2}`);
    }
  }, [snap1, snap2]);

  // Maneja el estado del loader parcial basado en el estado del fetch
  useEffect(() => {
    if ((!loading1 && !loading2 && !loading3) || error1 || error2 || error3) {
      setLoadingPartial(false); // Desactiva el loader parcial cuando los datos (locales o remotos) estén listos o si hay error
    }
  }, [loading1, loading2, loading3, error1, error2, error3]);

  // Maneja los datos locales en caso de error o si no hay datos remotos
  const finalAfectaciones1 = afectaciones1 && afectaciones1.length > 0 ? afectaciones1 : afectacionesLocal;
  const finalAfectaciones2 = afectaciones2 && afectaciones2.length > 0 ? afectaciones2 : afectacionesLocal2;
  const pinnedFinal = pinnedAfectacion && pinnedAfectacion.length > 0 ? pinnedAfectacion : pinnedafect;

  const hasError = (error1 || error2 || error3) && (!finalAfectaciones1.length || !finalAfectaciones2.length);

  useEffect(() => {
    const handleResize = () => {
      const availableHeight = window.innerHeight - 169;
      setAvailableHeight(availableHeight);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="App">
      {isFetching ? (
        <Loader />  // Loader pantalla completa al ingresar
      ) : hasError ? (
        <div className="error-message">Error al llamar al servicio. Mostrando datos locales...</div>
      ) : (
        <>
          <SearchBar delayedSearch={delayedSearch} />
          <AfectacionesDataGrid
            afectaciones1={finalAfectaciones1}
            afectaciones2={finalAfectaciones2}
            pinnedAfect={pinnedFinal}
            availableHeight={availableHeight}
            loading={loadingPartial} // Controla el loader parcial
          />
        </>
      )}
    </div>
  );
};

export default App;
