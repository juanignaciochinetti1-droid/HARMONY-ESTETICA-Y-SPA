import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const ModalReporteVouchers = ({ alCerrar }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS PARA PAGINACIÓN ---
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 8;

  const obtenerSolicitudes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vouchers_solicitudes')
      .select(`
        *,
        vouchers_web (nombre, precio)
      `)
      .order('created_at', { ascending: false });

    if (!error) setSolicitudes(data);
    setLoading(false);
  };

  useEffect(() => {
    obtenerSolicitudes();
  }, []);

  const cambiarEstado = async (id, nuevoEstado) => {
    const { error } = await supabase
      .from('vouchers_solicitudes')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (!error) obtenerSolicitudes();
  };

  // --- LÓGICA DE PAGINACIÓN ---
  const indiceUltimo = paginaActual * filasPorPagina;
  const indicePrimero = indiceUltimo - filasPorPagina;
  const solicitudesPaginadas = solicitudes.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(solicitudes.length / filasPorPagina);

  return (
    <div style={styles.overlay} onClick={alCerrar}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.titulo}>Gestión de Vouchers</h2>
          <button onClick={alCerrar} style={styles.btnClose}>×</button>
        </div>
        
        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>Cargando datos...</p>
        ) : (
          <>
            <div style={styles.tablaContainer}>
              <table style={styles.tabla}>
                <thead>
                  <tr style={styles.headerTabla}>
                    <th style={styles.th}>Fecha</th>
                    <th style={styles.th}>De / Para</th>
                    <th style={styles.th}>WhatsApp Dest.</th>
                    <th style={styles.th}>Plan</th>
                    <th style={styles.th}>Estado</th>
                    <th style={styles.th}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesPaginadas.map((s) => (
                    <tr key={s.id} style={styles.fila}>
                      <td style={styles.td}>{new Date(s.created_at).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        <strong>{s.remitente}</strong> <br/>
                        <small style={{color: '#bfa38a'}}>para</small> <br/>
                        <strong>{s.destinatario}</strong>
                      </td>
                      <td style={styles.td}>
                        <a 
                          href={`https://wa.me/${s.telefono_destinatario}?text=Hola%20${s.destinatario}!%20Tenés%20un%20regalo%20de%20Harmony%20Spa.`}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.linkWap}
                        >
                          {s.telefono_destinatario} 📱
                        </a>
                      </td>
                      <td style={styles.td}>
                        {s.vouchers_web?.nombre} <br/>
                        <span style={{color: '#8c6d4f'}}>${s.vouchers_web?.precio}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={s.estado === 'PAGADO' ? styles.badgePagado : styles.badgePendiente}>
                          {s.estado}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {s.estado === 'PENDIENTE_PAGO' && (
                          <button 
                            onClick={() => cambiarEstado(s.id, 'PAGADO')}
                            style={styles.btnAccion}
                          >
                            Confirmar Pago
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- CONTROLES DE PAGINACIÓN --- */}
            <div style={styles.paginacionContainer}>
              <button 
                style={{...styles.btnPagina, opacity: paginaActual === 1 ? 0.4 : 1}} 
                onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
              >
                Anterior
              </button>
              
              <span style={styles.textoPagina}>
                Página <strong>{paginaActual}</strong> de {totalPaginas || 1}
              </span>
              
              <button 
                style={{...styles.btnPagina, opacity: paginaActual === totalPaginas ? 0.4 : 1}} 
                onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                disabled={paginaActual === totalPaginas}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 4000, backdropFilter: 'blur(4px)' },
  modal: { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', width: '95%', maxWidth: '1000px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f2e9e1', paddingBottom: '15px' },
  titulo: { color: '#8c6d4f', margin: 0, fontFamily: "'Playfair Display', serif" },
  btnClose: { background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: '#aaa' },
  tablaContainer: { overflowY: 'auto', flex: 1, minHeight: '440px' }, // minHeight para mantener espacio de 8 filas
  tabla: { width: '100%', borderCollapse: 'collapse' },
  headerTabla: { backgroundColor: '#fdfcfb', color: '#a6835a', fontSize: '0.8rem', position: 'sticky', top: 0, zIndex: 10 },
  th: { padding: '12px', textAlign: 'left', borderBottom: '2px solid #f2e9e1' },
  td: { padding: '12px', borderBottom: '1px solid #f9f6f3', fontSize: '0.85rem' },
  fila: { height: '55px' },
  linkWap: { color: '#25D366', textDecoration: 'none', fontWeight: 'bold' },
  badgePendiente: { backgroundColor: '#fff3e0', color: '#ef6c00', padding: '4px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' },
  badgePagado: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '4px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' },
  btnAccion: { backgroundColor: '#c5a37d', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem' },
  
  // --- ESTILOS DE PAGINACIÓN ---
  paginacionContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    padding: '20px 0 10px',
    borderTop: '1px solid #f2e9e1',
    marginTop: '10px'
  },
  btnPagina: {
    backgroundColor: '#fff',
    color: '#8c6d4f',
    border: '1px solid #c5a37d',
    padding: '8px 25px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontFamily: "'Playfair Display', serif",
    transition: 'all 0.3s ease'
  },
  textoPagina: {
    color: '#8c6d4f',
    fontFamily: "'Playfair Display', serif",
    fontSize: '0.95rem'
  }
};

export default ModalReporteVouchers;