import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CardTurnoCliente = ({ turno, alCancelar }) => {
  const navigate = useNavigate();
  
  // --- LÓGICA DE RESPONSIVE ---
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { id, fecha, hora, estado, servicios, empleado, ya_reprogramado } = turno;

  const hoy = new Date();
  const fechaTurno = new Date(fecha);
  const diffTime = fechaTurno - hoy;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const puedeReprogramar = (estado === 'CONFIRMADO' || estado === 'REPROGRAMADO') && !ya_reprogramado && diffDays <= 15;
  const puedeCancelar = estado !== 'CANCELADO';

  const manejarReprogramacion = () => {
    if (diffDays > 15) {
      alert("Por políticas de Harmony, la reprogramación solo está disponible dentro de los 15 días previos a la fecha original del turno.");
      return;
    }

    navigate('/equipo', { 
      state: { 
        reprogramandoId: id, 
        servicioElegido: servicios,
        especialistaElegido: empleado,
        abrirCalendario: true 
      } 
    });
  };

  const colorEstado = 
    estado === 'CONFIRMADO' ? '#27ae60' : 
    estado === 'CANCELADO' ? '#e74c3c' : 
    estado === 'REPROGRAMADO' ? '#6366f1' : '#e67e22';

  return (
    <div style={styles.card}>
      {/* El cuerpo ahora cambia de row a column en móvil */}
      <div style={{
        ...styles.cuerpo,
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center'
      }}>
        
        <div style={styles.seccionInfo}>
          <span style={{
            ...styles.badge, 
            color: colorEstado, 
            borderColor: colorEstado,
            display: 'inline-block'
          }}>
            {estado}
          </span>
          <h4 style={styles.servicioNombre}>{servicios?.nombre?.toUpperCase()}</h4>
          <p style={styles.profesional}>Especialista: {empleado?.nombre} {empleado?.apellido}</p>
        </div>

        {/* La sección de fecha ahora ocupa todo el ancho en móvil */}
        <div style={{
          ...styles.seccionFecha,
          width: isMobile ? '100%' : 'auto',
          boxSizing: 'border-box',
          justifyContent: isMobile ? 'space-between' : 'flex-start',
          margin: isMobile ? '15px 0' : '0'
        }}>
          <div style={styles.datoFecha}>
            <span style={styles.label}>FECHA</span>
            <span style={styles.valor}>{fecha}</span>
          </div>
          <div style={styles.datoFecha}>
            <span style={styles.label}>HORA</span>
            <span style={styles.valor}>{hora.substring(0, 5)} hs</span>
          </div>
        </div>

        <div style={{
          ...styles.seccionAccion,
          width: isMobile ? '100%' : '180px'
        }}>
          <button 
            style={{
              ...styles.btnReprogramar,
              backgroundColor: puedeReprogramar ? '#a6835a' : '#ccc',
              cursor: puedeReprogramar ? 'pointer' : 'not-allowed',
              opacity: puedeReprogramar ? 1 : 0.7,
              width: '100%'
            }} 
            onClick={() => puedeReprogramar && manejarReprogramacion()}
            disabled={!puedeReprogramar}
          >
            {estado === 'PENDIENTE' ? 'ESPERANDO SEÑA' : ya_reprogramado ? 'CAMBIO YA USADO' : 'REPROGRAMAR'}
          </button>
          
          {puedeCancelar && (
            <button style={{...styles.btnCancelar, width: '100%'}} onClick={alCancelar}>
              CANCELAR TURNO
            </button>
          )}

          <p style={styles.aclaracion}>
            {estado === 'PENDIENTE' 
              ? '* Una vez confirmada tu seña, podrás reprogramar.'
              : ya_reprogramado 
                ? '* Ya has realizado un cambio autónomo.' 
                : diffDays > 15 
                  ? '* Reprogramación habilitada 15 días antes de la cita.' 
                  : '* Sujeto a disponibilidad (Máx. 1 cambio)'}
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: { backgroundColor: '#fff', borderRadius: '20px', padding: '25px', marginBottom: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #f2e9e1', textAlign: 'left', width: '100%', maxWidth: '800px', boxSizing: 'border-box' },
  cuerpo: { display: 'flex', flexWrap: 'wrap', gap: '15px' },
  seccionInfo: { flex: '1 1 200px' },
  badge: { fontSize: '0.6rem', padding: '4px 10px', borderRadius: '50px', border: '1px solid', fontWeight: 'bold', letterSpacing: '1px' },
  servicioNombre: { color: '#8c6d4f', fontSize: '1.4rem', margin: '10px 0 5px', fontFamily: 'serif' },
  profesional: { color: '#bfa38a', fontSize: '0.85rem', margin: 0 },
  seccionFecha: { display: 'flex', gap: '30px', backgroundColor: '#fdfcfb', padding: '15px 25px', borderRadius: '15px', border: '1px solid #f9f6f3' },
  datoFecha: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.6rem', color: '#d1c4b9', fontWeight: 'bold', marginBottom: '5px' },
  valor: { fontSize: '1.1rem', color: '#8c6d4f', fontWeight: '600' },
  seccionAccion: { textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' },
  btnReprogramar: { backgroundColor: '#a6835a', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '50px', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer', transition: '0.3s' },
  btnCancelar: { backgroundColor: 'transparent', color: '#8e443d', border: '1px solid #8e443d', padding: '12px 20px', borderRadius: '50px', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer', transition: '0.3s' },
  aclaracion: { fontSize: '0.6rem', color: '#bfa38a', marginTop: '5px', fontStyle: 'italic' }
};

export default CardTurnoCliente;