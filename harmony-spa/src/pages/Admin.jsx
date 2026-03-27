import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const Admin = () => {
  const [turnosMañana, setTurnosMañana] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerTurnosMañana();
  }, []);

  const obtenerTurnosMañana = async () => {
    setLoading(true);
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    const fechaMañana = mañana.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('turnos')
      .select(`
        id, fecha, hora, estado,
        users:cliente_id (nombre, telefono),
        servicios:servicio_id (nombre)
      `)
      .eq('fecha', fechaMañana)
      .eq('estado', 'CONFIRMADO');

    if (!error) setTurnosMañana(data || []);
    setLoading(false);
  };

  const enviarWhatsApp = (turno) => {
    const telefono = turno.users?.telefono?.replace(/\D/g, '');
    if (!telefono) return alert("El cliente no tiene teléfono.");

    const mensaje = `✨ *RECORDATORIO HARMONY SPA* ✨%0A%0AHola *${turno.users.nombre}*! 👋 Te recordamos tu momento de relax para mañana:%0A%0A🌿 *Servicio:* ${turno.servicios.nombre}%0A⏰ *Hora:* ${turno.hora.substring(0, 5)} hs%0A%0A¡Te esperamos! 🧘‍♀️`;
    
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
  };

  if (loading) return (
    <div style={styles.loadingScreen}>
      <h2 style={{color: '#8c6d4f', fontFamily: 'serif'}}>Buscando turnos...</h2>
    </div>
  );

  return (
    <main style={styles.mainContainer}>
      <header style={styles.header}>
        <p style={styles.subtituloHeader}>SISTEMA DE GESTIÓN</p>
        <h1 style={styles.tituloHeader}>Recordatorios de Turnos</h1>
      </header>
      
      <div style={styles.grid}>
        <div style={styles.cardPrincipal}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitulo}>Citas para Mañana</h2>
            <span style={styles.badge}>{turnosMañana.length} Pendientes</span>
          </div>

          {turnosMañana.length === 0 ? (
            <div style={styles.vacioContenedor}>
              <p style={styles.textoVacio}>No hay turnos confirmados para mañana.</p>
            </div>
          ) : (
            <div style={styles.lista}>
              {turnosMañana.map(t => (
                <div key={t.id} style={styles.fila}>
                  <div style={styles.info}>
                    <strong style={styles.clienteNombre}>{t.users.nombre}</strong>
                    <span style={styles.turnoDetalle}>{t.servicios.nombre} — {t.hora.substring(0, 5)}hs</span>
                  </div>
                  <button onClick={() => enviarWhatsApp(t)} style={styles.btnWhatsApp}>
                    AVISAR 📱
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button onClick={obtenerTurnosMañana} style={styles.btnRefrescar}>
        ACTUALIZAR LISTA 🔄
      </button>
    </main>
  );
};

const styles = {
  // FONDO UNIFICADO CON TUS OTRAS PÁGINAS
  mainContainer: { 
    backgroundColor: '#f3ece4', 
    minHeight: '100vh', 
    padding: '100px 20px', 
    fontFamily: "'Playfair Display', serif" 
  },
  header: { textAlign: 'center', marginBottom: '50px' },
  tituloHeader: { color: '#8c6d4f', fontSize: '2.8rem', marginBottom: '5px' },
  subtituloHeader: { color: '#bfa38a', fontSize: '0.75rem', letterSpacing: '3px', fontWeight: '600' },
  
  grid: { maxWidth: '800px', margin: '0 auto' },
  cardPrincipal: { 
    backgroundColor: '#ffffff', 
    borderRadius: '15px', 
    padding: '40px', 
    boxShadow: '0 10px 30px rgba(0,0,0,0.03)', 
    border: '1px solid #f2e9e1' 
  },
  cardHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '30px', 
    borderBottom: '1px solid #fcfaf7', 
    paddingBottom: '20px' 
  },
  cardTitulo: { color: '#8c6d4f', fontSize: '1.4rem', margin: 0 },
  badge: { 
    backgroundColor: '#a6835a', 
    color: 'white', 
    padding: '5px 15px', 
    borderRadius: '20px', 
    fontSize: '0.7rem', 
    fontWeight: 'bold' 
  },
  lista: { display: 'flex', flexDirection: 'column', gap: '12px' },
  fila: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '18px', 
    borderRadius: '12px', 
    backgroundColor: '#fdfcfb',
    border: '1px solid #f9f6f3'
  },
  info: { display: 'flex', flexDirection: 'column', gap: '4px' },
  clienteNombre: { color: '#8c6d4f', fontSize: '1rem', fontWeight: '600' },
  turnoDetalle: { color: '#bfa38a', fontSize: '0.85rem' },
  btnWhatsApp: { 
    backgroundColor: '#25D366', 
    color: 'white', 
    border: 'none', 
    padding: '10px 20px', 
    borderRadius: '30px', 
    fontWeight: 'bold', 
    fontSize: '0.75rem', 
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(37, 211, 102, 0.2)'
  },
  btnRefrescar: { 
    display: 'block', 
    margin: '40px auto', 
    background: 'none', 
    border: 'none', 
    color: '#a6835a', 
    cursor: 'pointer', 
    fontSize: '0.8rem', 
    fontWeight: 'bold',
    letterSpacing: '1px'
  },
  vacioContenedor: { textAlign: 'center', padding: '40px' },
  textoVacio: { color: '#bfa38a', fontStyle: 'italic' },
  loadingScreen: { 
    height: '100vh', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f3ece4' 
  }
};

export default Admin;