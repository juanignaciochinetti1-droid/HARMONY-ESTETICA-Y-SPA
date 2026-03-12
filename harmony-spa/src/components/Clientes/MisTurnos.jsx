import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; 
import CardTurnoCliente from './CardTurnoCliente'; 

// --- COMPONENTE DE ALERTA INTERNO (Color #a6835a) ---
const AlertaPersonalizada = ({ mensaje, alCerrar }) => (
  <div style={styles.alertOverlay}>
    <div style={styles.alertModal}>
      {/* Icono de exclamación con el círculo dorado suave */}
      <div style={styles.alertIcon}>!</div>
      <h3 style={styles.alertTitle}>Atención</h3>
      <p style={styles.alertText}>{mensaje}</p>
      {/* Botón con la tipografía serif unificada */}
      <button style={styles.alertBtn} onClick={alCerrar}>ENTENDIDO</button>
    </div>
  </div>
);

export default function MisTurnos() {
  const [busqueda, setBusqueda] = useState({ dni: '', email: '' });
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(false);

  // ESTADO PARA EL CARTEL PERSONALIZADO
  const [alerta, setAlerta] = useState({ visible: false, mensaje: "" });

  const buscarTurnos = async (e) => {
    e.preventDefault();
    
    // REEMPLAZO DE ALERT NATIVO
    if (!busqueda.dni && !busqueda.email) {
      setAlerta({ visible: true, mensaje: "Por favor, ingresa tu DNI o tu Email para buscar." });
      return;
    }

    setCargando(true);
    try {
      let query = supabase.from('users').select('id');

      if (busqueda.dni && busqueda.email) {
        query = query.eq('dni', busqueda.dni).eq('email', busqueda.email.toLowerCase().trim());
      } else if (busqueda.dni) {
        query = query.eq('dni', busqueda.dni);
      } else {
        query = query.eq('email', busqueda.email.toLowerCase().trim());
      }

      const { data: cliente, error: errorCliente } = await query.maybeSingle();

      // REEMPLAZO DE ALERT NATIVO
      if (!cliente) {
        setAlerta({ visible: true, mensaje: "No encontramos ningún registro con esos datos." });
        setTurnos([]);
        return;
      }

      const { data: turnosData, error: errorTurnos } = await supabase
        .from('turnos')
        .select(`
          id, 
          fecha, 
          hora, 
          estado,
          servicios ( id, nombre, duracion_min ),
          empleado:users!empleado_id ( id, nombre, apellido )
        `)
        .eq('cliente_id', cliente.id)
        .gte('fecha', new Date().toISOString().split('T')[0]) 
        .order('fecha', { ascending: true });

      if (errorTurnos) throw errorTurnos;
      setTurnos(turnosData);

    } catch (err) {
      // REEMPLAZO DE ALERT NATIVO
      setAlerta({ visible: true, mensaje: "Error: " + err.message });
    } finally {
      setCargando(false);
    }
  };

  return (
    <main style={styles.container}>
      <h2 style={styles.titulo}>Mis Turnos en Harmony</h2>
      <p style={styles.instrucciones}>Busca tu turno usando uno de tus datos registrados:</p>
      
      <form onSubmit={buscarTurnos} style={styles.formBusqueda}>
        <input 
          style={styles.input} 
          placeholder="Tu DNI" 
          value={busqueda.dni}
          onChange={(e) => setBusqueda({...busqueda, dni: e.target.value.replace(/\D/g, '')})}
        />
        
        <span style={styles.separador}>o</span>

        <input 
          style={styles.input} 
          type="email"
          placeholder="Tu Email" 
          value={busqueda.email}
          onChange={(e) => setBusqueda({...busqueda, email: e.target.value})}
        />
        
        <div style={{ width: '100%', marginTop: '10px' }}>
          <button type="submit" style={styles.btnBuscar} disabled={cargando}>
            {cargando ? 'BUSCANDO...' : 'VER MIS TURNOS'}
          </button>
        </div>
      </form>

      <div style={styles.listaTurnos}>
        {turnos.map(turno => (
          <CardTurnoCliente key={turno.id} turno={turno} />
        ))}
        {turnos.length === 0 && !cargando && (
          <p style={styles.mensaje}>Ingresa tus datos para gestionar tus turnos.</p>
        )}
      </div>

      {/* RENDER DEL CARTEL PERSONALIZADO */}
      {alerta.visible && (
        <AlertaPersonalizada 
          mensaje={alerta.mensaje} 
          alCerrar={() => setAlerta({ visible: false, mensaje: "" })} 
        />
      )}
    </main>
  );
}

const styles = {
  container: { backgroundColor: '#f5eee6', padding: '120px 20px 80px', maxWidth: '100%', margin: '0 auto', textAlign: 'center', minHeight: '100vh' },
  titulo: { color: '#8c6d4f', fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', marginBottom: '10px', fontWeight: '300' },
  instrucciones: { color: '#bfa38a', fontSize: '0.9rem', marginBottom: '20px' },
  separador: { color: '#d1c4b9', alignSelf: 'center', fontWeight: 'bold', fontSize: '0.8rem' },
  formBusqueda: { display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '800px', margin: '30px auto 50px' },
  input: { padding: '15px 25px', borderRadius: '30px', border: '1px solid #f2e9e1', outline: 'none', width: '250px', backgroundColor: '#fdfcfb' },
  btnBuscar: { backgroundColor: '#a6835a', color: 'white', border: 'none', padding: '15px 35px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s', fontFamily: "'Playfair Display', serif", letterSpacing: '1px' },
  listaTurnos: { display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' },
  mensaje: { color: '#bfa38a', fontStyle: 'italic', marginTop: '20px' },

  // --- Estilos del Cartel Personalizado (Color #a6835a) ---
  alertOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)', // Fondo oscuro traslúcido
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Por encima de todo
    backdropFilter: 'blur(5px)' // Efecto de desenfoque de fondo
  },
  alertModal: {
    backgroundColor: '#fff',
    padding: '45px 40px',
    borderRadius: '40px',
    width: '420px',
    textAlign: 'center',
    boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
    border: '1px solid #f2e9e1',
    animation: 'fadeIn 0.3s ease' // Pequeña animación de entrada
  },
  alertIcon: {
    width: '65px',
    height: '65px',
    borderRadius: '50%',
    border: '2px solid #c5a37d', // Dorado suave
    color: '#c5a37d',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '32px',
    margin: '0 auto 25px',
    fontWeight: 'bold'
  },
  alertTitle: {
    color: '#8c6d4f',
    fontFamily: "'Playfair Display', serif",
    marginBottom: '15px',
    fontSize: '1.8rem',
    fontWeight: '400'
  },
  alertText: {
    color: '#bfa38a',
    fontSize: '1.05rem',
    marginBottom: '35px',
    lineHeight: '1.6',
    letterSpacing: '0.3px'
  },
  alertBtn: {
    backgroundColor: '#a6835a', // Dorado suave de marca
    color: 'white',
    border: 'none',
    padding: '14px 45px',
    borderRadius: '30px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: '1px',
    fontFamily: "'Playfair Display', serif", // Serif unificada
    boxShadow: '0 4px 15px rgba(166, 131, 90, 0.3)'
  }
};