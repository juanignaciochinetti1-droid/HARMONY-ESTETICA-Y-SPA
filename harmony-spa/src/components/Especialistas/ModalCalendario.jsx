import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

// Agregamos 'alSeleccionarHorario' a las props
const ModalCalendario = ({ especialista, servicio, alCerrar, alSeleccionarHorario }) => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [cargandoHoras, setCargandoHoras] = useState(false);

  const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];

  useEffect(() => {
    if (diaSeleccionado) {
      buscarHorariosEnBaseDeDatos();
    }
  }, [diaSeleccionado, fechaActual]);

  const buscarHorariosEnBaseDeDatos = async () => {
    setCargandoHoras(true);
    const fechaFormateada = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}-${String(diaSeleccionado).padStart(2, '0')}`;
    
    const { data: disponibilidad, error: errorDisp } = await supabase
      .from('disponibilidad_empleado')
      .select('hora_inicio')
      .eq('empleado_id', especialista.id)
      .eq('fecha', fechaFormateada);

    const { data: turnosOcupados, error: errorTurnos } = await supabase
      .from('turnos')
      .select('hora')
      .eq('empleado_id', especialista.id)
      .eq('fecha', fechaFormateada)
      .neq('estado', 'CANCELADO');

    if (!errorDisp && !errorTurnos) {
      const horasOcupadas = turnosOcupados.map(t => t.hora.substring(0, 5));
      const resultadoFinal = disponibilidad.map(d => ({
        hora: d.hora_inicio.substring(0, 5),
        estaOcupado: horasOcupadas.includes(d.hora_inicio.substring(0, 5))
      }));
      setHorariosDisponibles(resultadoFinal);
    }
    setCargandoHoras(false);
  };

  // ESTA FUNCIÓN AHORA SOLO PASA LOS DATOS AL PADRE (EQUIPO.JSX)
  const manejarConfirmacion = () => {
    if (!horaSeleccionada || !diaSeleccionado) return;
    
    const fechaFormateada = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}-${String(diaSeleccionado).padStart(2, '0')}`;
    
    // Llamamos a la función que abre el BookingModal
    alSeleccionarHorario(fechaFormateada, horaSeleccionada);
  };

  const esFechaPasada = (dia) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaComparar = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), dia);
    return fechaComparar < hoy;
  };

  const diasMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0).getDate();
  const shift = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).getDay() || 7;
  const espaciosVacios = shift - 1;

  return (
    <div style={styles.overlay} onClick={alCerrar}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.nombre}>{especialista.nombre} {especialista.apellido}</h2>
        <p style={styles.subtitulo}>{servicio?.nombre ? servicio.nombre.toUpperCase() : 'SELECCIONÁ UN DÍA'}</p>

        <div style={styles.headerMes}>
          <span style={styles.flecha} onClick={() => setFechaActual(new Date(fechaActual.setMonth(fechaActual.getMonth() - 1)))}>❮</span>
          <span style={styles.mesLabel}>{meses[fechaActual.getMonth()]} DE {fechaActual.getFullYear()}</span>
          <span style={styles.flecha} onClick={() => setFechaActual(new Date(fechaActual.setMonth(fechaActual.getMonth() + 1)))}>❯</span>
        </div>

        <div style={styles.gridDias}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, index) => (
            <div key={`header-${index}`} style={styles.headerDia}>{d}</div>
          ))}
          {[...Array(espaciosVacios)].map((_, i) => <div key={`empty-${i}`} />)}
          {[...Array(diasMes)].map((_, i) => {
            const dia = i + 1;
            const pasado = esFechaPasada(dia);
            const esSeleccionado = diaSeleccionado === dia;
            return (
              <div 
                key={dia} 
                style={{
                  ...styles.dia, 
                  color: pasado ? '#e0e0e0' : (esSeleccionado ? '#fff' : '#8c6d4f'),
                  backgroundColor: esSeleccionado ? '#d4af37' : 'transparent',
                  fontWeight: pasado ? '300' : '600',
                  cursor: pasado ? 'default' : 'pointer'
                }}
                onClick={() => !pasado && setDiaSeleccionado(dia)}
              >
                {dia}
              </div>
            );
          })}
        </div>

        {diaSeleccionado && (
          <div style={styles.seccionHorarios}>
            <p style={styles.textoTurnos}>Turnos disponibles:</p>
            {cargandoHoras ? (
                <p style={styles.sinHorario}>Buscando horarios...</p>
            ) : (
                <div style={styles.gridHoras}>
                {horariosDisponibles.length > 0 ? (
                    horariosDisponibles.map((h, i) => (
                    <div 
                        key={i} 
                        style={{
                        ...styles.horaItem, 
                        background: h.estaOcupado ? '#f0f0f0' : (horaSeleccionada === h.hora ? '#d4af37' : '#f7f2ed'),
                        color: h.estaOcupado ? '#bbb' : '#8c6d4f',
                        cursor: h.estaOcupado ? 'not-allowed' : 'pointer',
                        textDecoration: h.estaOcupado ? 'line-through' : 'none',
                        border: horaSeleccionada === h.hora ? '1px solid #d4af37' : '1px solid #eee'
                        }}
                        onClick={() => !h.estaOcupado && setHoraSeleccionada(h.hora)}
                    >
                        {h.hora}
                    </div>
                    ))
                ) : (
                    <p style={styles.sinHorario}>No hay horarios disponibles.</p>
                )}
                </div>
            )}
          </div>
        )}

        {horaSeleccionada && (
          <div style={styles.contenedorConfirmacion}>
            <button 
              style={styles.btnReservar}
              onClick={manejarConfirmacion}
            >
              CONTINUAR - {horaSeleccionada}hs
            </button>
          </div>
        )}

        <p style={styles.btnCerrar} onClick={alCerrar}>Cerrar</p>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 },
  modal: { background: '#fff', padding: '30px', borderRadius: '40px', width: '360px', textAlign: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' },
  nombre: { color: '#8c6d4f', fontSize: '1.6rem', fontWeight: '400', marginBottom: '5px', fontFamily: 'serif' },
  subtitulo: { color: '#bfa38a', fontSize: '0.6rem', letterSpacing: '2px', marginBottom: '20px' },
  headerMes: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#8c6d4f' },
  mesLabel: { fontSize: '0.85rem', fontWeight: 'bold' },
  flecha: { cursor: 'pointer', padding: '0 10px' },
  gridDias: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginBottom: '20px' },
  headerDia: { color: '#bfa38a', fontSize: '0.7rem', fontWeight: 'bold' },
  dia: { width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '0.9rem', transition: '0.3s' },
  seccionHorarios: { borderTop: '1px solid #f2e9e1', paddingTop: '15px' },
  textoTurnos: { color: '#bfa38a', fontSize: '0.75rem', marginBottom: '10px' },
  gridHoras: { display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' },
  horaItem: { padding: '8px 15px', borderRadius: '10px', fontSize: '0.8rem', color: '#8c6d4f', transition: '0.2s' },
  sinHorario: { color: '#ccc', fontSize: '0.75rem' },
  btnCerrar: { color: '#a6835a', textDecoration: 'underline', fontSize: '0.8rem', marginTop: '15px', cursor: 'pointer' },
  contenedorConfirmacion: { marginTop: '25px', borderTop: '1px solid #f2e9e1', paddingTop: '20px' },
  btnReservar: { width: '100%', color: 'white', border: 'none', padding: '15px', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#a6835a' }
};

export default ModalCalendario;