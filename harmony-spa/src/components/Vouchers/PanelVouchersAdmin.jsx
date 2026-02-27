import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function PanelVouchersAdmin() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p style={{ textAlign: 'center', padding: '50px' }}>Cargando solicitudes...</p>;

  return (
    <div style={styles.contenedor}>
      <h2 style={styles.titulo}>Gestión de Vouchers de Regalo</h2>
      
      <table style={styles.tabla}>
        <thead>
          <tr style={styles.headerTabla}>
            <th>Fecha</th>
            <th>Remitente (De)</th>
            <th>Destinatario (Para)</th>
            <th>WhatsApp Dest.</th>
            <th>Voucher</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.map((s) => (
            <tr key={s.id} style={styles.fila}>
              <td>{new Date(s.created_at).toLocaleDateString()}</td>
              <td>{s.remitente}</td>
              <td>{s.destinatario}</td>
              <td>
                <a 
                  href={`https://wa.me/${s.telefono_destinatario}?text=Hola%20${s.destinatario}!%20Tenés%20un%20regalo%20de%20Harmony%20Spa%20esperándote.`}
                  target="_blank"
                  style={styles.linkWap}
                >
                  {s.telefono_destinatario} 📱
                </a>
              </td>
              <td>
                <strong>{s.vouchers_web?.nombre}</strong> <br/>
                <span style={{ fontSize: '0.8rem' }}>${s.vouchers_web?.precio}</span>
              </td>
              <td>
                <span style={s.estado === 'PAGADO' ? styles.badgePagado : styles.badgePendiente}>
                  {s.estado}
                </span>
              </td>
              <td>
                {s.estado === 'PENDIENTE_PAGO' && (
                  <button 
                    onClick={() => cambiarEstado(s.id, 'PAGADO')}
                    style={styles.btnAccion}
                  >
                    Marcar Pagado
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  contenedor: { padding: '40px', backgroundColor: '#fdfcfb', minHeight: '100vh' },
  titulo: { color: '#8c6d4f', fontFamily: "'Playfair Display', serif", marginBottom: '30px' },
  tabla: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
  headerTabla: { backgroundColor: '#f2e9e1', color: '#8c6d4f', textAlign: 'left', fontSize: '0.85rem' },
  fila: { borderBottom: '1px solid #f9f6f3', fontSize: '0.9rem', color: '#555' },
  linkWap: { color: '#25D366', textDecoration: 'none', fontWeight: 'bold' },
  badgePendiente: { backgroundColor: '#fff3e0', color: '#ef6c00', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' },
  badgePagado: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' },
  btnAccion: { backgroundColor: '#c5a37d', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem' }
};