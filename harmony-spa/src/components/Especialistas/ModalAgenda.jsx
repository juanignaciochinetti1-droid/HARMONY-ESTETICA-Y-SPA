import React, { useState } from 'react';

const ModalCalendario = ({ especialista, alCerrar }) => {
  const [fechaActual, setFechaActual] = useState(new Date());

  const meses = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
  ];

  const diasMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0).getDate();
  const primerDiaSemana = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).getDay();

  // Ajuste para que la semana empiece en Lunes (0: Dom -> 6: Sab a 0: Lun -> 6: Dom)
  const shift = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

  return (
    <div style={styles.overlay} onClick={alCerrar}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.nombre}>{especialista.nombre} {especialista.apellido}</h2>
        <p style={styles.instruccion}>SELECCIONÁ UN DÍA</p>

        <div style={styles.headerMes}>
          <span style={styles.flecha} onClick={() => setFechaActual(new Date(fechaActual.setMonth(fechaActual.getMonth() - 1)))}>❮</span>
          <span style={styles.mesLabel}>{meses[fechaActual.getMonth()]} DE {fechaActual.getFullYear()}</span>
          <span style={styles.flecha} onClick={() => setFechaActual(new Date(fechaActual.setMonth(fechaActual.getMonth() + 1)))}>❯</span>
        </div>

        <div style={styles.gridDias}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => <div key={d} style={styles.headerDia}>{d}</div>)}
          
          {[...Array(shift)].map((_, i) => <div key={`empty-${i}`} />)}
          
          {[...Array(diasMes)].map((_, i) => {
            const dia = i + 1;
            const esHoy = dia === new Date().getDate() && fechaActual.getMonth() === new Date().getMonth();
            return (
              <div 
                key={dia} 
                style={{...styles.dia, color: esHoy ? '#a6835a' : '#d1c4b9', fontWeight: esHoy ? 'bold' : 'normal'}}
                onClick={() => console.log("Día seleccionado:", dia)}
              >
                {dia}
              </div>
            );
          })}
        </div>

        <p style={styles.btnCerrar} onClick={alCerrar}>Cerrar</p>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 },
  modal: { background: '#fff', padding: '40px', borderRadius: '40px', width: '380px', textAlign: 'center' },
  nombre: { color: '#a6835a', fontSize: '1.8rem', fontWeight: '300', marginBottom: '5px', fontFamily: 'serif' },
  instruccion: { color: '#d1c4b9', fontSize: '0.65rem', letterSpacing: '2px', marginBottom: '30px' },
  headerMes: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 20px' },
  mesLabel: { color: '#a6835a', fontSize: '0.9rem', letterSpacing: '1px' },
  flecha: { cursor: 'pointer', color: '#000', fontSize: '1rem' },
  gridDias: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '15px' },
  headerDia: { color: '#d1c4b9', fontSize: '0.7rem', fontWeight: 'bold' },
  dia: { color: '#d1c4b9', fontSize: '0.9rem', padding: '5px', cursor: 'pointer' },
  btnCerrar: { color: '#a6835a', textDecoration: 'underline', fontSize: '0.85rem', marginTop: '30px', cursor: 'pointer' }
};

export default ModalCalendario;