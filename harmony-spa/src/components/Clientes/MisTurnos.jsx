import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; 
import CardTurnoCliente from './CardTurnoCliente'; 

export default function MisTurnos() {
  const [busqueda, setBusqueda] = useState({ dni: '', email: '' });
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(false);

  const buscarTurnos = async (e) => {
    e.preventDefault();
    
    if (!busqueda.dni && !busqueda.email) {
      alert("Por favor, ingresa tu DNI o tu Email para buscar.");
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

      if (!cliente) {
        alert("No encontramos ningún registro con esos datos.");
        setTurnos([]);
        return;
      }

      // CAMBIO CLAVE AQUÍ: Agregamos "id" en servicios y empleado
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
      alert("Error: " + err.message);
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
    </main>
  );
}

const styles = {
  container: { padding: '120px 20px 80px', maxWidth: '800px', margin: '0 auto', textAlign: 'center', minHeight: '80vh' },
  titulo: { color: '#8c6d4f', fontFamily: 'serif', fontSize: '2.5rem', marginBottom: '10px' },
  instrucciones: { color: '#bfa38a', fontSize: '0.9rem', marginBottom: '20px' },
  separador: { color: '#d1c4b9', alignSelf: 'center', fontWeight: 'bold', fontSize: '0.8rem' },
  formBusqueda: { display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '50px', flexWrap: 'wrap', marginTop: '30px' },
  input: { padding: '15px 25px', borderRadius: '30px', border: '1px solid #f2e9e1', outline: 'none', width: '250px', backgroundColor: '#fdfcfb' },
  btnBuscar: { backgroundColor: '#a6835a', color: 'white', border: 'none', padding: '15px 35px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' },
  listaTurnos: { display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' },
  mensaje: { color: '#bfa38a', fontStyle: 'italic', marginTop: '20px' }
};