import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ModalReporteGlobal = ({ alCerrar }) => {
  const [turnos, setTurnos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  useEffect(() => {
    obtenerReporteCompleto();
  }, []);

  const obtenerReporteCompleto = async () => {
    const { data, error } = await supabase
      .from('turnos')
      .select(`
        id, fecha, hora, estado,
        cliente:cliente_id (nombre, apellido),
        especialista:empleado_id (nombre, apellido),
        servicios (nombre, precio)
      `)
      .order('fecha', { ascending: false });

    if (!error) setTurnos(data);
    setCargando(false);
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    const { error } = await supabase
      .from('turnos')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (!error) {
      setTurnos(turnos.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t));
    }
  };

  // --- LÓGICA DE FILTRADO ROBUSTA ---
  const turnosFiltrados = turnos.filter(t => {
    // 1. Limpiamos términos de búsqueda
    const terminos = busqueda.toLowerCase().trim().split(/\s+/);
    
    // 2. Extraemos datos con "Encadenamiento Opcional (?.)" y "Fallback (|| '')"
    // Esto evita que si un dato falta, la app se ponga en blanco.
    const nombreCli = `${t.cliente?.nombre || ''} ${t.cliente?.apellido || ''}`.toLowerCase();
    const nombreEsp = `${t.especialista?.nombre || ''} ${t.especialista?.apellido || ''}`.toLowerCase();
    const nombreSer = (t.servicios?.nombre || 'sin servicio').toLowerCase();

    // 3. Verificamos coincidencia de texto
    const coincideTexto = terminos.every(term => 
      nombreCli.includes(term) || 
      nombreEsp.includes(term) || 
      nombreSer.includes(term)
    );

    // 4. Verificamos coincidencia de fecha
    const fechaTurno = t.fecha;
    const coincideFecha = (!fechaDesde || fechaTurno >= fechaDesde) && 
                         (!fechaHasta || fechaTurno <= fechaHasta);

    return coincideTexto && coincideFecha;
  });

  const exportarPDF = () => {
    const doc = new jsPDF();
    const totalIngresos = turnosFiltrados
      .filter(t => t.estado === 'CONFIRMADO')
      .reduce((sum, t) => sum + (t.servicios?.precio || 0), 0);

    doc.setFontSize(18);
    doc.setTextColor(166, 131, 90); 
    doc.text('HARMONY SPA - REPORTE DE GESTIÓN', 14, 20);

    const filas = turnosFiltrados.map(t => [
      `${t.fecha} ${t.hora.substring(0,5)}hs`,
      `${t.cliente?.nombre || ''} ${t.cliente?.apellido || ''}`,
      `${t.especialista?.nombre || ''} ${t.especialista?.apellido || ''}`,
      t.servicios?.nombre || 'N/A',
      t.estado
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Fecha/Hora', 'Cliente', 'Especialista', 'Servicio', 'Estado']],
      body: filas,
      headStyles: { fillColor: [166, 131, 90] }
    });

    const finalY = doc.lastAutoTable.finalY;
    doc.text(`TOTAL: $${totalIngresos.toLocaleString()}`, 14, finalY + 15);
    doc.save(`Reporte_Harmony.pdf`);
  };

  // Validación: Nombre y apellido, teléfono largo y email con formato básico
const camposCompletos = 
  formData.nombre.trim().split(" ").length >= 2 && 
  formData.telefono.trim().length >= 8 && 
  formData.email.includes('@') && 
  formData.email.includes('.');

  return (
    <div style={styles.overlay} onClick={alCerrar}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        
        {/* HEADER CON FILTROS DE FECHA */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.titulo}>Panel de Control Global</h2>
            <div style={styles.rangoFechas}>
              <div style={styles.campoFecha}>
                <label style={styles.labelMini}>Desde</label>
                <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} style={styles.inputDate} />
              </div>
              <div style={styles.campoFecha}>
                <label style={styles.labelMini}>Hasta</label>
                <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} style={styles.inputDate} />
              </div>
            </div>
          </div>
          <div style={styles.flexRow}>
            <button style={styles.btnPDF} onClick={exportarPDF}>📄 PDF</button>
            <button style={styles.btnCloseX} onClick={alCerrar}>×</button>
          </div>
        </div>

        <input 
          type="text" 
          placeholder="Buscar cliente, especialista o servicio..." 
          style={styles.inputBusqueda}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {cargando ? (
          <div style={styles.loader}>Cargando...</div>
        ) : (
          <div style={styles.tablaContenedor}>
            <table style={styles.tabla}>
              <thead>
                <tr>
                  <th style={styles.th}>Fecha/Hora</th>
                  <th style={styles.th}>Cliente</th>
                  <th style={styles.th}>Especialista</th>
                  <th style={styles.th}>Servicio</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {turnosFiltrados.map((t) => (
                  <tr key={t.id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.fecha}>{t.fecha}</span><br/>
                      <span style={styles.hora}>{t.hora.substring(0,5)}hs</span>
                    </td>
                    <td style={styles.td}>
                      <strong>{t.cliente?.nombre || 'S/N'} {t.cliente?.apellido || ''}</strong>
                    </td>
                    <td style={styles.td}>
                      {t.especialista?.nombre || 'S/E'} {t.especialista?.apellido || ''}
                    </td>
                    <td style={styles.td}>{t.servicios?.nombre || 'N/A'}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: t.estado === 'COMPLETADO' ? '#e8f8f0' : (t.estado === 'CANCELADO' ? '#fdeaea' : '#f0f0f0'),
                        color: t.estado === 'COMPLETADO' ? '#2ecc71' : (t.estado === 'CANCELADO' ? '#e74c3c' : '#7f8c8d')
                      }}>
                        {t.estado}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <select 
                        value={t.estado} 
                        onChange={(e) => actualizarEstado(t.id, e.target.value)}
                        style={styles.select}
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="CONFIRMADO">Confirmado</option>
                        <option value="CANCELADO">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 6000, padding: '20px' },
  modal: { background: '#fff', padding: '30px', borderRadius: '30px', width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  titulo: { color: '#a6835a', fontSize: '1.4rem', fontFamily: 'serif', margin: '0 0 10px 0' },
  rangoFechas: { display: 'flex', gap: '15px' },
  campoFecha: { display: 'flex', flexDirection: 'column', gap: '2px' },
  labelMini: { fontSize: '0.6rem', color: '#bfa38a', fontWeight: 'bold', textTransform: 'uppercase' },
  inputDate: { border: '1px solid #eee', padding: '5px', borderRadius: '8px', fontSize: '0.8rem', color: '#8c6d4f' },
  flexRow: { display: 'flex', gap: '10px', alignItems: 'center' },
  btnPDF: { backgroundColor: '#fff', color: '#a6835a', border: '1px solid #a6835a', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' },
  btnCloseX: { background: '#f5f5f5', border: 'none', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer' },
  inputBusqueda: { width: '100%', padding: '12px 20px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '20px', outline: 'none' },
  tablaContenedor: { border: '1px solid #f2e9e1', borderRadius: '15px', overflow: 'hidden' },
  tabla: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' },
  th: { padding: '15px', backgroundColor: '#fdfbf9', color: '#a6835a', borderBottom: '1px solid #f2e9e1' },
  td: { padding: '15px', borderBottom: '1px solid #f2e9e1' },
  statusBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' },
  select: { padding: '5px', borderRadius: '6px', border: '1px solid #ddd' },
  loader: { textAlign: 'center', padding: '20px', color: '#a6835a' }
};

export default ModalReporteGlobal;