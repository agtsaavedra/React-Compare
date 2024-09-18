import React, { useState, useEffect } from 'react';
import AfectacionesDataGrid from './components/AfectacionesDataGrid';
import SearchBar from './components/SearchBar';
import useFetchData from './hooks/useFetchData';
import Loader from './components/Loader'; // Loader pantalla completa
import PartialLoader from './components/PartialLoader';
import { toast } from 'react-toastify';

const App = () => {
  const [snap1, setSnap1] = useState(null);
  const [snap2, setSnap2] = useState(null);
  const [availableHeight, setAvailableHeight] = useState(window.innerHeight);
  const [isFetching, setIsFetching] = useState(true); // Para loader de pantalla completa
  const [loadingPartial, setLoadingPartial] = useState(false); // Para el loader parcial al buscar manualmente

  const [url1, setUrl1] = useState(null);
  const [url2, setUrl2] = useState(null);
  const [url3, setUrl3] = useState(null);

  const { data: afectaciones1, loading: loading1, error: error1 } = useFetchData(url1);
  const { data: afectaciones2, loading: loading2, error: error2 } = useFetchData(url2);
  const { data: pinnedAfectacion, loading: loading3, error: error3 } = useFetchData(url3);

  const showToast = (message) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Detectar parámetros en la URL y ejecutar delayedSearch automáticamente (solo al cargar)
  useEffect(() => {
    setIsFetching(true);
    const pathParts = window.location.pathname.split('/').filter(Boolean); // Extraer las partes de la URL
    if (pathParts.length >= 3) {
      const paramSnap1 = pathParts[pathParts.length - 2];
      const paramSnap2 = pathParts[pathParts.length - 1];

      
      
      delayedSearch(paramSnap1, paramSnap2);
    } else {
      setIsFetching(false); // Si no hay parámetros en la URL, desactivar el loader completo
    }
  }, []); // Solo se ejecuta al cargar la aplicación

  // Al iniciar una búsqueda, activa el loader parcial o completo y actualiza las URLs
  const delayedSearch = (selectedSnap1, selectedSnap2, manualSearch = false) => {
    // Verificar si los parámetros son los mismos que la última búsqueda
    if (selectedSnap1 === snap1 && selectedSnap2 === snap2) {
      showToast('Los parámetros son los mismos');
      setLoadingPartial(false); // No realizar la búsqueda si los parámetros son los mismos
      return;
    }

    // Si los parámetros son diferentes, continuar con la búsqueda
    setSnap1(selectedSnap1);
    setSnap2(selectedSnap2);

    // Actualizar las URLs para realizar la llamada al servicio
    setUrl1(`https://services-dev.ufasta.edu.ar/a/perso/snap/compare/${selectedSnap1}/${selectedSnap2}`);
    setUrl2(`https://services-dev.ufasta.edu.ar/a/perso/snap/compare/${selectedSnap2}/${selectedSnap1}`);
    setUrl3(`https://services-dev.ufasta.edu.ar/a/perso/snap/compare/pinned/${selectedSnap1}/${selectedSnap2}`);

    // Mostrar el partial loader para búsquedas manuales
    if (manualSearch) {
      setLoadingPartial(true);
      setIsFetching(false); // Desactivar el loader completo para las búsquedas manuales
      window.history.pushState({}, '', `/personal/comp-afectaciones/${selectedSnap1}/${selectedSnap2}`); // Reiniciar la URL
    } else {
      setIsFetching(true); // Para la búsqueda inicial con parámetros URL
    }
  };

  // Maneja el estado del loader completo y parcial basado en el estado del fetch
  useEffect(() => {
    if (!loading1 && !loading2 && !loading3 && !error1 && !error2 && !error3) {
      setIsFetching(false); // Desactiva el loader completo cuando los datos estén listos y no hay error
      setLoadingPartial(false); // Desactiva el loader parcial también
    } else if (loading1 || loading2 || loading3) {
      if (isFetching) {
        setLoadingPartial(false); // No mostrar partial loader en la búsqueda inicial
      } else {
        setLoadingPartial(true); // Mantener el partial loader activo si es una búsqueda manual
      }
    } else if (error1 || error2 || error3) {
      setIsFetching(false); // Desactiva el loader completo si ocurre un error
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
          <SearchBar delayedSearch={(snap1, snap2) => delayedSearch(snap1, snap2, true)} snap1={snap1} snap2={snap2} />
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
              !loading1 && !loading2 && !loading3 && (  // Solo mostrar el mensaje cuando no hay carga en proceso
                <div style={{ justifyContent: "center", alignContent: "center", display: "flex", alignItems: "center", padding: 10, fontSize: 20 }}>
                  No hay datos disponibles para mostrar. Por favor seleccionar planta para hacer la comparación.
                </div>
              )
            )
          )}
        </>
      )}
    </div>
  );
};

export default App;
