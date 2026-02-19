import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ModalHistorialEmpleado({ especialista, alCerrar }) {
  const [turnos, setTurnos] = useState([]);

  useEffect(() => {
    const leerTurnos = async () => {
      const { data, error } = await supabase
        .from('turnos')
        .select(`
          id, fecha, hora, estado,
          servicios ( nombre ),
          cliente:cliente_id ( nombre )
        `)
        .eq('empleado_id', especialista.id)
        .eq('archivado_empleado', false) // <--- SOLO TRAER LO NO ARCHIVADO
        .order('fecha', { ascending: true });

      if (!error) setTurnos(data);
    };
    leerTurnos();
  }, [especialista.id]);

  const realizados = turnos.filter(t => t.estado === 'CONFIRMADO').length;
  const pendientes = turnos.filter(t => t.estado === 'PENDIENTE').length;

  const actualizarEstadoTurno = async (id, nuevoEstado) => {
  const { error } = await supabase
    .from('turnos')
    .update({ estado: nuevoEstado })
    .eq('id', id);

  if (error) {
    console.error("Error al actualizar:", error.message);
    alert("No se pudo actualizar el estado del turno.");
  } else {
    // Refrescamos la lista localmente para que el usuario vea el cambio al instante
    setTurnos(turnos.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t));
  }
};

const archivarTurno = async (id) => {
  const { error } = await supabase
    .from('turnos')
    .update({ archivado_empleado: true })
    .eq('id', id);

  if (error) {
    console.error("Error al archivar:", error.message);
  } else {
    // Lo eliminamos de la lista visual del empleado inmediatamente
    setTurnos(turnos.filter(t => t.id !== id));
  }
};

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.titulo}>Agenda de {especialista.nombre} {especialista.apellido}</h2>

        {/* CONTADORES SUPERIORES */}
        <div style={styles.contadoresContainer}>
          <div style={{ ...styles.cardContador, backgroundColor: '#e8f5e9' }}>
            <span style={{ ...styles.numero, color: '#2e7d32' }}>{realizados}</span>
            <span style={styles.labelContador}>REALIZADOS</span>
          </div>
          <div style={{ ...styles.cardContador, backgroundColor: '#fff8e1' }}>
            <span style={{ ...styles.numero, color: '#f9a825' }}>{pendientes}</span>
            <span style={styles.labelContador}>PENDIENTES</span>
          </div>
        </div>

        {/* LISTA DE TURNOS */}
<div style={styles.listaContainer}>
  {turnos.length === 0 ? (
    <p style={{ textAlign: 'center', color: '#999' }}>No hay turnos registrados</p>
  ) : (
    turnos.map((t) => (
      <div key={t.id} style={styles.cardTurno}>
        <div style={styles.headerTurno}>
          <span style={styles.fechaHora}>{t.fecha} - {t.hora.slice(0, 5)}hs</span>
          <span style={{ 
            ...styles.badgeEstado, 
            backgroundColor: t.estado === 'CONFIRMADO' ? '#e8f5e9' : t.estado === 'CANCELADO' ? '#ffebee' : '#eee',
            color: t.estado === 'CONFIRMADO' ? '#2e7d32' : t.estado === 'CANCELADO' ? '#c62828' : '#666'
          }}>
            {t.estado}
          </span>
        </div>
        <p style={styles.clienteInfo}>
          <strong>Cliente:</strong> {t.cliente?.nombre || 'Sin nombre'}
        </p>
        
        {/* Lógica condicional: Acciones vs Archivados */}
        {t.estado === 'PENDIENTE' ? (
          <div style={styles.acciones}>
            <button 
              style={styles.btnCheck} 
              onClick={() => actualizarEstadoTurno(t.id, 'CONFIRMADO')}
            > ✓ </button>
            <button 
              style={styles.btnCancel} 
              onClick={() => actualizarEstadoTurno(t.id, 'CANCELADO')}
            > ✕ </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button 
              onClick={() => archivarTurno(t.id)}
              style={styles.btnArchivar}
            >
              Archivar de mi lista
            </button>
          </div>
        )}
      </div>
    ))
  )}
</div>

        <button onClick={alCerrar} style={styles.btnCerrar}>CERRAR</button>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modal: { backgroundColor: '#fff', padding: '30px', borderRadius: '25px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  titulo: { textAlign: 'center', color: '#8c6d4f', marginBottom: '25px', fontSize: '1.4rem' },
  contadoresContainer: { display: 'flex', gap: '15px', marginBottom: '25px' },
  cardContador: { flex: 1, padding: '15px', borderRadius: '15px', textAlign: 'center', display: 'flex', flexDirection: 'column' },
  numero: { fontSize: '1.5rem', fontWeight: 'bold' },
  labelContador: { fontSize: '0.65rem', fontWeight: 'bold', marginTop: '5px' },
  listaContainer: { maxHeight: '350px', overflowY: 'auto', marginBottom: '20px', paddingRight: '5px' },
  cardTurno: { border: '1px solid #f2e9e1', borderRadius: '15px', padding: '15px', marginBottom: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' },
  headerTurno: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  fechaHora: { color: '#a6835a', fontSize: '0.9rem', fontWeight: '500' },
  badgeEstado: { fontSize: '0.65rem', padding: '4px 10px', backgroundColor: '#eee', borderRadius: '10px', color: '#666', fontWeight: 'bold' },
  clienteInfo: { color: '#8c6d4f', fontSize: '0.95rem', marginBottom: '15px' },
  acciones: { display: 'flex', gap: '10px' },
  btnCheck: { flex: 1, backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' },
  btnCancel: { flex: 1, backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' },
  btnCerrar: { width: '100%', padding: '15px', border: 'none', borderRadius: '25px', backgroundColor: '#a6835a', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  btnArchivar: {
  backgroundColor: '#f5f5f5',
  color: '#8c6d4f',
  border: '1px solid #d1c4b9',
  padding: '5px 12px',
  borderRadius: '12px',
  fontSize: '0.65rem',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'all 0.2s'
},
};