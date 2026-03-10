import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ModalHistorialEmpleado({ especialista, alCerrar }) {
  const [turnos, setTurnos] = useState([]);

  useEffect(() => {
    const leerTurnos = async () => {
      const { data, error } = await supabase
        .from('turnos')
        .select(`
          id, fecha, hora, estado, ya_reprogramado,
          servicios ( nombre ),
          cliente:cliente_id ( nombre, apellido )
        `)
        .eq('empleado_id', especialista.id)
        .eq('archivado_empleado', false)
        .order('fecha', { ascending: true });

      if (!error) setTurnos(data);
    };
    leerTurnos();
  }, [especialista.id]);

  const actualizarEstadoTurno = async (id, nuevoEstado) => {
    const { error } = await supabase
      .from('turnos')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (!error) {
      setTurnos(turnos.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t));
    }
  };

  const archivarTurno = async (id) => {
    const { error } = await supabase
      .from('turnos')
      .update({ archivado_empleado: true })
      .eq('id', id);

    if (!error) {
      setTurnos(turnos.filter(t => t.id !== id));
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 style={styles.titulo}>Agenda de {especialista.nombre}</h2>

        <div style={styles.contadoresContainer}>
          <div style={{ ...styles.cardContador, backgroundColor: '#e8f5e9' }}>
            <span style={{ ...styles.numero, color: '#2e7d32' }}>{turnos.filter(t => t.estado === 'CONFIRMADO').length}</span>
            <span style={styles.labelContador}>CONFIRMADOS</span>
          </div>
          <div style={{ ...styles.cardContador, backgroundColor: '#fff8e1' }}>
            <span style={{ ...styles.numero, color: '#f9a825' }}>{turnos.filter(t => t.estado === 'PENDIENTE' || t.estado === 'REPROGRAMADO').length}</span>
            <span style={styles.labelContador}>PENDIENTES</span>
          </div>
        </div>

        <div style={styles.listaContainer}>
          {turnos.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999' }}>No hay turnos registrados</p>
          ) : (
            turnos.map((t) => (
              <div key={t.id} style={styles.cardTurno}>
                <div style={styles.headerTurno}>
                  <span style={styles.fechaHora}>{t.fecha} - {t.hora.slice(0, 5)}hs</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      ...styles.badgeEstado, 
                      backgroundColor: 
                        t.estado === 'CONFIRMADO' ? '#e8f5e9' : 
                        t.estado === 'CANCELADO' ? '#ffebee' : 
                        t.estado === 'REPROGRAMADO' ? '#eef2ff' : '#eee',
                      color: 
                        t.estado === 'CONFIRMADO' ? '#2e7d32' : 
                        t.estado === 'CANCELADO' ? '#c62828' : 
                        t.estado === 'REPROGRAMADO' ? '#6366f1' : '#666'
                    }}>
                      {t.estado}
                    </span>
                    {/* Marca visual permanente si fue reprogramado alguna vez */}
                    {t.ya_reprogramado && <div style={styles.badgeReprog}>🔄 CAMBIO DE FECHA</div>}
                  </div>
                </div>

                <p style={styles.clienteInfo}>
                  <strong>Cliente:</strong> {t.cliente?.nombre} {t.cliente?.apellido || ''} <br/>
                  <small style={{ color: '#bfa38a', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    {t.servicios?.nombre}
                  </small>
                </p>
                
                {(t.estado === 'PENDIENTE' || t.estado === 'REPROGRAMADO') ? (
                  <div style={styles.acciones}>
                    <button style={styles.btnCheck} onClick={() => actualizarEstadoTurno(t.id, 'CONFIRMADO')}> ATENDIDO </button>
                    <button style={styles.btnCancel} onClick={() => actualizarEstadoTurno(t.id, 'CANCELADO')}> CANCELAR </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => archivarTurno(t.id)} style={styles.btnArchivar}>Archivar lista</button>
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
  // ... (tus estilos anteriores)
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 7000 },
  modal: { backgroundColor: '#fff', padding: '30px', borderRadius: '25px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  titulo: { textAlign: 'center', color: '#8c6d4f', marginBottom: '25px', fontSize: '1.4rem', fontFamily: 'serif' },
  contadoresContainer: { display: 'flex', gap: '15px', marginBottom: '25px' },
  cardContador: { flex: 1, padding: '15px', borderRadius: '15px', textAlign: 'center', display: 'flex', flexDirection: 'column' },
  numero: { fontSize: '1.5rem', fontWeight: 'bold' },
  labelContador: { fontSize: '0.65rem', fontWeight: 'bold', marginTop: '5px' },
  listaContainer: { maxHeight: '350px', overflowY: 'auto', marginBottom: '20px', paddingRight: '5px' },
  cardTurno: { border: '1px solid #f2e9e1', borderRadius: '15px', padding: '15px', marginBottom: '15px' },
  headerTurno: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  fechaHora: { color: '#a6835a', fontSize: '0.9rem', fontWeight: '500' },
  badgeEstado: { fontSize: '0.6rem', padding: '4px 10px', borderRadius: '10px', fontWeight: 'bold' },
  badgeReprog: { fontSize: '0.55rem', color: '#6366f1', fontWeight: 'bold', marginTop: '4px' },
  clienteInfo: { color: '#8c6d4f', fontSize: '0.95rem', marginBottom: '10px' },
  acciones: { display: 'flex', gap: '10px' },
  btnCheck: { flex: 1, backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' },
  btnCancel: { flex: 1, backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' },
  btnCerrar: { width: '100%', padding: '15px', border: 'none', borderRadius: '25px', backgroundColor: '#a6835a', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  btnArchivar: { backgroundColor: '#f5f5f5', color: '#8c6d4f', border: '1px solid #d1c4b9', padding: '5px 12px', borderRadius: '12px', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 'bold' }
};