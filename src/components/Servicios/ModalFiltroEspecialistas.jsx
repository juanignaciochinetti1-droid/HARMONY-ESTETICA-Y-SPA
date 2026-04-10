import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const ModalFiltroEspecialistas = ({ servicio, alCerrar, alSeleccionar }) => {
  const [especialistas, setEspecialistas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const buscarEspecialistas = async () => {
      setCargando(true);
      
      // Tomamos la primera palabra del servicio para una búsqueda más amplia
      // Ej: de "Masaje Descontracturante" busca solo "Masaje"
      const palabraClave = servicio.nombre.split(" ")[0];

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('rol', 'EMPLEADO')
        .eq('activo', true)
        .ilike('especialidad', `%${palabraClave}%`); 

      if (!error) {
        setEspecialistas(data);
      }
      setCargando(false);
    };

    if (servicio) buscarEspecialistas();
  }, [servicio]);

  return (
    <div style={styles.overlay} onClick={alCerrar}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
           <h3 style={styles.titulo}>Selecciona un Profesional</h3>
           <button onClick={alCerrar} style={styles.btnCerrar}>✕</button>
        </div>
        <p style={styles.subtitulo}>PARA {servicio.nombre.toUpperCase()}</p>
        
        <div style={styles.lista}>
          {cargando ? (
            <div style={styles.loader}>Buscando especialistas...</div>
          ) : especialistas.length > 0 ? (
            especialistas.map(esp => (
              <div key={esp.id} style={styles.item} onClick={() => alSeleccionar(esp)}>
                <img 
                  src={esp.foto_url || `https://ui-avatars.com/api/?name=${esp.nombre}+${esp.apellido}&background=a6835a&color=fff`} 
                  style={styles.img} 
                  alt={esp.nombre}
                />
                <div style={styles.info}>
                  <span style={styles.nombre}>{esp.nombre} {esp.apellido}</span>
                  <span style={styles.esp}>{esp.especialidad || 'Especialista Harmony'}</span>
                </div>
                <span style={styles.flecha}>❯</span>
              </div>
            ))
          ) : (
            <div style={styles.noResultados}>
              <p>No hay especialistas disponibles para esta categoría.</p>
              <button style={styles.btnVerTodos} onClick={async () => {
                const { data } = await supabase.from('users').select('*').eq('rol', 'EMPLEADO').eq('activo', true);
                setEspecialistas(data);
              }}>Ver todo el equipo</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 7000, backdropFilter: 'blur(3px)' },
  modal: { background: '#fff', padding: '30px', borderRadius: '30px', width: '380px', maxWidth: '90%', boxShadow: '0 15px 40px rgba(0,0,0,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  btnCerrar: { background: 'none', border: 'none', fontSize: '1.2rem', color: '#bfa38a', cursor: 'pointer' },
  titulo: { color: '#8c6d4f', fontFamily: 'serif', margin: 0, fontSize: '1.4rem' },
  subtitulo: { color: '#bfa38a', fontSize: '0.65rem', letterSpacing: '2px', marginBottom: '25px', fontWeight: 'bold' },
  lista: { display: 'flex', flexDirection: 'column', gap: '12px' },
  item: { display: 'flex', alignItems: 'center', padding: '15px', border: '1px solid #f2e9e1', borderRadius: '20px', cursor: 'pointer', transition: '0.3s' },
  img: { width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px', objectFit: 'cover', border: '2px solid #fdfbf9' },
  info: { flex: 1, textAlign: 'left' },
  nombre: { display: 'block', fontSize: '0.95rem', color: '#8c6d4f', fontWeight: 'bold' },
  esp: { fontSize: '0.75rem', color: '#bfa38a', fontStyle: 'italic' },
  flecha: { color: '#f2e9e1', fontWeight: 'bold' },
  loader: { padding: '20px', color: '#a6835a', fontSize: '0.9rem' },
  noResultados: { textAlign: 'center', padding: '20px' },
  btnVerTodos: { marginTop: '10px', background: '#a6835a', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer' }
};

export default ModalFiltroEspecialistas;