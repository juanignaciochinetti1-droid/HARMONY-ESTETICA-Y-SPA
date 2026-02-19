import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
// Importamos el nuevo modal (crearemos este archivo a continuación)
import ModalFiltroEspecialistas from '../components/Servicios/ModalFiltroEspecialistas';

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // ESTADOS NUEVOS PARA EL FLUJO
  const [servicioEnProceso, setServicioEnProceso] = useState(null);
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    obtenerServicios();
  }, []);

  const obtenerServicios = async () => {
    const { data, error } = await supabase.from('servicios').select('*').eq('activo', true);
    if (!error) setServicios(data);
    setCargando(false);
  };

  // PASO 1: Al hacer clic, guardamos el servicio y abrimos el filtro de especialistas
  const iniciarReserva = (servicio) => {
    setServicioEnProceso(servicio);
    setMostrarFiltro(true);
  };

  // PASO 2: Cuando el usuario elige al especialista en el modal
  const finalizarSeleccion = (especialista) => {
    setMostrarFiltro(false);
    // Navegamos pasando toda la información necesaria para el calendario
    navigate('/equipo', { 
      state: { 
        servicioElegido: servicioEnProceso,
        especialistaElegido: especialista,
        abrirCalendario: true 
      } 
    });
  };

  return (
    <main style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.tituloHeader}>Nuestros Servicios</h1>
        <p style={styles.subtituloHeader}>RESERVA CON EL 30% DE SEÑA</p>
      </header>

      <div style={styles.grid}>
        {servicios.map((s) => (
          <div key={s.id} style={styles.card}>
            <div style={styles.optionsBadge}>⋮</div>
            <h2 style={styles.servicioNombre}>{s.nombre}</h2>
            <p style={styles.servicioDescripcion}>{s.descripcion}</p>
            <div style={styles.infoContenedor}>
              <p style={styles.duracionTexto}>DURACIÓN: {s.duracion_min} MIN</p>
              <p style={styles.precioTexto}>${Number(s.precio).toLocaleString('es-AR')}</p>
            </div>
            <button style={styles.btnReservar} onClick={() => iniciarReserva(s)}>
              Reservar Turno
            </button>
          </div>
        ))}
      </div>

      {/* MODAL DE FILTRO */}
      {mostrarFiltro && (
        <ModalFiltroEspecialistas 
          servicio={servicioEnProceso}
          alCerrar={() => setMostrarFiltro(false)}
          alSeleccionar={finalizarSeleccion}
        />
      )}
    </main>
  );
}

const styles = {
  container: {
    backgroundColor: '#f3ece4',
    minHeight: '100vh',
    padding: '80px 20px',
    fontFamily: "'Playfair Display', serif"
  },
  header: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  tituloHeader: {
    color: '#8c6d4f',
    fontSize: '3.2rem',
    fontWeight: '400',
    marginBottom: '10px',
  },
  subtituloHeader: {
    color: '#bfa38a',
    fontSize: '0.8rem',
    letterSpacing: '3px',
    fontWeight: '600',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '40px',
    justifyContent: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '45px 30px',
    width: '320px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
    position: 'relative',
    border: '1px solid #f2e9e1',
  },
  optionsBadge: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    border: '1px solid #f2e9e1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d1c4b9',
    fontSize: '1.2rem',
    cursor: 'pointer',
  },
  servicioNombre: {
    color: '#8c6d4f',
    fontSize: '2rem',
    fontWeight: '400',
    marginBottom: '15px',
  },
  servicioDescripcion: {
    color: '#bfa38a',
    fontSize: '0.9rem',
    lineHeight: '1.6',
    marginBottom: '25px',
    minHeight: '50px',
  },
  infoContenedor: {
    marginBottom: '30px',
  },
  duracionTexto: {
    color: '#bfa38a',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    letterSpacing: '1.5px',
    marginBottom: '10px',
  },
  precioTexto: {
    color: '#bfa38a',
    fontSize: '1.6rem',
    fontWeight: '500',
  },
  btnReservar: {
    backgroundColor: '#a6835a',
    color: '#fff',
    border: 'none',
    padding: '12px 35px',
    borderRadius: '25px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  }
};