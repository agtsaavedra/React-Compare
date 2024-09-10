import React, { useState, useEffect } from 'react';
import AfectacionesDataGrid from './components/AfectacionesDataGrid';
import SearchBar from './components/SearchBar';
import useFetchData from './hooks/useFetchData';
import Loader from './components/Loader';
import { afectacionesLocal, afectacionesLocal2, pinnedafect } from './var.js';

const App = () => {
  const [snap1, setSnap1] = useState(null);
  const [snap2, setSnap2] = useState(null);
  const [availableHeight, setAvailableHeight] = useState(window.innerHeight);

  // Definimos URLs dinámicas solo cuando snap1 y snap2 están definidos
  const [url1, setUrl1] = useState(null);
  const [url2, setUrl2] = useState(null);
  const [url3, setUrl3] = useState(null);

  const { data: afectaciones1, loading: loading1, error: error1 } = useFetchData(url1);
  const { data: afectaciones2, loading: loading2, error: error2 } = useFetchData(url2);
  const { data: pinnedAfectacion, loading: loading3, error: error3 } = useFetchData(url3);

  useEffect(() => {
    if (snap1 && snap2) {
      // Actualizamos las URLs solo cuando snap1 y snap2 están definidos
      setUrl1(`https://services-dev.ufasta.edu.ar/a/perso/snap/compare/${snap1}/${snap2}`);
      setUrl2(`https://services-dev.ufasta.edu.ar/a/perso/snap/compare/${snap2}/${snap1}`);
      setUrl3(`https://services-dev.ufasta.edu.ar/a/perso/snap/compare/pinned/${snap1}/${snap2}`);
    }
  }, [snap1, snap2]);

  const isLoading = loading1 || loading2 || loading3;
  
  const finalAfectaciones1 = afectaciones1 && afectaciones1.length > 0 ? afectaciones1 : afectacionesLocal;
  const finalAfectaciones2 = afectaciones2 && afectaciones2.length > 0 ? afectaciones2 : afectacionesLocal2;
  const pinnedFinal  = pinnedAfectacion && pinnedAfectacion.length > 0 ? pinnedAfectacion : pinnedafect;
  const hasError = (error1 || error2 || error3) && (!finalAfectaciones1.length || !finalAfectaciones2.length);

  const delayedSearch = (selectedSnap1, selectedSnap2) => {
    setSnap1(selectedSnap1);
    setSnap2(selectedSnap2);
    console.log("Valores seleccionados: ", selectedSnap1, selectedSnap2);
  };

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
      {isLoading ? (
        <Loader />
      ) : hasError ? (
        <div className="error-message">Error al llamar al servicio</div>
      ) : (
        <>
          <SearchBar delayedSearch={delayedSearch} />
          <AfectacionesDataGrid
            afectaciones1={finalAfectaciones1}
            afectaciones2={finalAfectaciones2}
            pinnedAfect={pinnedFinal}
            availableHeight={availableHeight}
          />
        </>
      )}
    </div>
  );
};

export default App;
