import React, { useState, useEffect } from 'react';
import AfectacionesDataGrid from './components/AfectacionesDataGrid';
import SearchBar from './components/SearchBar';
import useFetchData from './hooks/useFetchData';
import Loader from './components/Loader'; // Loader pantalla completa
import PartialLoader from './components/PartialLoader';

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

  // Al iniciar una búsqueda, activa el estado de carga parcial y actualiza las URLs
  const delayedSearch = (selectedSnap1, selectedSnap2) => {
    setSnap1(selectedSnap1);
    setSnap2(selectedSnap2);
    setLoadingPartial(true); // Activa el loader parcial al iniciar la búsqueda

    setUrl1(`https://services-dev.ufasta.edu.ar/a/perso/snap/compare/${selectedSnap1}/${selectedSnap2}`);
    setUrl2(`https://services-dev.ufasta.edu.ar/a/perso/snap/compare/${selectedSnap2}/${selectedSnap1}`);
    setUrl3(`https://services-dev.ufasta.edu.ar/a/perso/snap/compare/pinned/${selectedSnap1}/${selectedSnap2}`);
  };

  // Maneja el estado del loader parcial basado en el estado del fetch
  useEffect(() => {
    if (!loading1 && !loading2 && !loading3 && !error1 && !error2 && !error3) {
      setLoadingPartial(false); // Desactiva el loader parcial cuando los datos estén listos y no hay error
    } else if (error1 || error2 || error3) {
      setLoadingPartial(false); // Desactiva el loader parcial si ocurre un error
    }
  }, [loading1, loading2, loading3, error1, error2, error3]);

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
      ) : (
        <>
          <SearchBar delayedSearch={delayedSearch} />
          {loadingPartial ? (
            <PartialLoader /> // Mostrar el loader parcial mientras los datos se están buscando
          ) : (
            (afectaciones1?.length > 0 || afectaciones2?.length > 0 || pinnedAfectacion?.length > 0) ? (  // Mostrar el DataGrid si al menos uno tiene datos
              <AfectacionesDataGrid
                afectaciones1={afectaciones1 || []}
                afectaciones2={afectaciones2 || []}
                pinnedAfect={pinnedAfectacion || []}
                availableHeight={availableHeight}
                loading={loadingPartial} // Controla el loader parcial
              />
            ) : (
              <div style={{ justifyContent: "center", alignContent: "center", display: "flex", alignItems: "center", padding: 10, fontSize: 20 }}>
                No hay datos disponibles para mostrar. Por favor seleccionar planta para hacer la comparación.
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default App;
