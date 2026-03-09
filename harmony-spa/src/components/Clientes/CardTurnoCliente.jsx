import React from 'react';
import { useNavigate } from 'react-router-dom';

const CardTurnoCliente = ({ turno }) => {
  const navigate = useNavigate();
  
  // Desestructuramos para facilitar el uso
  const { id, fecha, hora, estado, servicios, empleado } = turno;

  const manejarReprogramacion = () => {
    const hoy = new Date();
    const fechaTurno = new Date(fecha);
    
    // 1. Calculamos la diferencia en días
    const diffTime = fechaTurno - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 2. Validación de los 15 días
    if (diffDays > 15) {
      alert("Por políticas de Harmony, la reprogramación solo está disponible dentro de los 15 días previos a la fecha original del turno.");
      return;
    }

    // 3. Redirigimos al flujo de calendario con los datos del turno para actualizar
    navigate('/equipo', { 
      state: { 
        reprogramandoId: id, 
        servicioElegido: servicios,
        especialistaElegido: empleado,
        abrirCalendario: true 
      } 
    });
  };

  // Color dinámico según el estado
  const colorEstado = estado === 'CONFIRMADO' ? '#27ae60' : '#e67e22';

  return (
    <div style={styles.card}>
      <div style={styles.cuerpo}>
        <div style={styles.seccionInfo}>
          <span style={{...styles.badge, color: colorEstado, borderColor: colorEstado}}>
            {estado}
          </span>
          <h4 style={styles.servicioNombre}>{servicios?.nombre?.toUpperCase()}</h4>
          <p style={styles.profesional}>Especialista: {empleado?.nombre} {empleado?.apellido}</p>
        </div>

        <div style={styles.seccionFecha}>
          <div style={styles.datoFecha}>
            <span style={styles.label}>FECHA</span>
            <span style={styles.valor}>{fecha}</span>
          </div>
          <div style={styles.datoFecha}>
            <span style={styles.label}>HORA</span>
            <span style={styles.valor}>{hora} hs</span>
          </div>
        </div>

        <div style={styles.seccionAccion}>
          <button style={styles.btnReprogramar} onClick={manejarReprogramacion}>
            REPROGRAMAR TURNO
          </button>
          <p style={styles.aclaracion}>* Sujeto a disponibilidad (Máx. 15 días)</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    border: '1px solid #f2e9e1',
    textAlign: 'left'
  },
  cuerpo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  },
  seccionInfo: { flex: '1 1 250px' },
  badge: { 
    fontSize: '0.6rem', 
    padding: '4px 10px', 
    borderRadius: '50px', 
    border: '1px solid', 
    fontWeight: 'bold',
    letterSpacing: '1px'
  },
  servicioNombre: { color: '#8c6d4f', fontSize: '1.4rem', margin: '10px 0 5px', fontFamily: 'serif' },
  profesional: { color: '#bfa38a', fontSize: '0.85rem', margin: 0 },
  seccionFecha: { 
    display: 'flex', 
    gap: '30px', 
    backgroundColor: '#fdfcfb', 
    padding: '15px 25px', 
    borderRadius: '15px',
    border: '1px solid #f9f6f3'
  },
  datoFecha: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.6rem', color: '#d1c4b9', fontWeight: 'bold', marginBottom: '5px' },
  valor: { fontSize: '1.1rem', color: '#8c6d4f', fontWeight: '600' },
  seccionAccion: { textAlign: 'center' },
  btnReprogramar: {
    backgroundColor: '#a6835a',
    color: '#fff',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '50px',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: '0.3s ease',
    boxShadow: '0 4px 15px rgba(166, 131, 90, 0.2)'
  },
  aclaracion: { fontSize: '0.65rem', color: '#bfa38a', marginTop: '10px', fontStyle: 'italic' }
};

export default CardTurnoCliente;