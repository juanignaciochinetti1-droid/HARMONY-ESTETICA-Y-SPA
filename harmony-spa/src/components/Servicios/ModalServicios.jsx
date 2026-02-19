import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const ModalServicios = ({ alSeleccionar, alCerrar }) => {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerServicios();
  }, []);

  const obtenerServicios = async () => {
    const { data, error } = await supabase
      .from('servicios')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (!error) {
      setServicios(data);
    }
    setCargando(false);
  };

  return (
    <div style={styles.overlay} onClick={alCerrar}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.titulo}>Nuestros Servicios</h2>
        <p style={styles.subtitulo}>¿QUÉ TRATAMIENTO BUSCÁS HOY?</p>

        <div style={styles.lista}>
          {cargando ? (
            <p style={styles.mensaje}>Cargando experiencias...</p>
          ) : servicios.length > 0 ? (
            servicios.map((s) => (
              <div key={s.id} style={styles.item} onClick={() => alSeleccionar(s)}>
                <div style={styles.info}>
                  <span style={styles.nombre}>{s.nombre}</span>
                  <p style={styles.detalle}>{s.duracion_min} min | ${Number(s.precio).toLocaleString('es-AR')}</p>
                </div>
                <span style={styles.flecha}>❯</span>
              </div>
            ))
          ) : (
            <p style={styles.mensaje}>No hay servicios disponibles en este momento.</p>
          )}
        </div>
        
        <p style={styles.btnVolver} onClick={alCerrar}>Volver</p>
      </div>
    </div>
  );
};

const styles = {
  overlay: { 
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', 
    alignItems: 'center', zIndex: 4000 
  },
  modal: { 
    background: '#fff', padding: '35px', borderRadius: '40px', 
    width: '380px', textAlign: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' 
  },
  titulo: { 
    color: '#8c6d4f', fontSize: '1.6rem', fontWeight: '400', 
    marginBottom: '5px', fontFamily: 'serif' 
  },
  subtitulo: { 
    color: '#bfa38a', fontSize: '0.6rem', letterSpacing: '2px', 
    marginBottom: '20px', fontWeight: 'bold' 
  },
  lista: { 
    maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' 
  },
  item: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
    padding: '15px 10px', borderBottom: '1px solid #f2e9e1', 
    cursor: 'pointer', transition: 'background 0.2s' 
  },
  info: { textAlign: 'left' },
  nombre: { color: '#8c6d4f', fontSize: '0.95rem', fontWeight: '500' },
  detalle: { color: '#bfa38a', fontSize: '0.75rem', marginTop: '3px' },
  flecha: { color: '#d1c4b9', fontSize: '0.8rem' },
  mensaje: { color: '#bfa38a', fontSize: '0.8rem', padding: '20px' },
  btnVolver: { 
    color: '#a6835a', textDecoration: 'underline', fontSize: '0.8rem', 
    marginTop: '25px', cursor: 'pointer' 
  }
};

export default ModalServicios;