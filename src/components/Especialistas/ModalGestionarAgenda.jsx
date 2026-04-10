import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const ModalGestionarAgenda = ({ especialista, alCerrar }) => {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [horariosCargados, setHorariosCargados] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Cargar horarios existentes para la fecha seleccionada
  useEffect(() => {
    if (fecha) {
      obtenerHorarios();
      setError(''); // Limpiamos error al cambiar de fecha
    }
  }, [fecha]);

  const obtenerHorarios = async () => {
    const { data, error } = await supabase
      .from('disponibilidad_empleado')
      .select('*')
      .eq('empleado_id', especialista.id)
      .eq('fecha', fecha)
      .order('hora_inicio', { ascending: true });

    if (!error) setHorariosCargados(data || []);
  };

  const agregarHorario = async () => {
    if (!fecha || !hora) {
      setError("Seleccioná fecha y hora antes de presionar (+)");
      return;
    }

    const hoy = new Date().toISOString().split('T')[0];
    if (fecha < hoy) {
      setError("No podés cargar disponibilidad en fechas pasadas");
      return;
    }

    // Validar si el horario ya existe en la lista visual para no duplicar
    const existe = horariosCargados.some(h => h.hora_inicio.substring(0, 5) === hora);
    if (existe) {
      setError("Este horario ya está cargado para este día");
      return;
    }

    const { data, error: err } = await supabase
      .from('disponibilidad_empleado')
      .insert([{ 
        empleado_id: especialista.id, 
        fecha: fecha, 
        hora_inicio: hora,
        hora_fin: hora 
      }])
      .select();

    if (err) {
      setError("Error: " + err.message);
    } else if (data) {
      setHorariosCargados([...horariosCargados, data[0]]);
      setHora(''); 
      setError('');
    }
  };

  // --- NUEVA FUNCIÓN: ELIMINAR HORARIO ---
  const eliminarHorario = async (id) => {
    const { error: err } = await supabase
      .from('disponibilidad_empleado')
      .delete()
      .eq('id', id);

    if (!err) {
      setHorariosCargados(horariosCargados.filter(h => h.id !== id));
    } else {
      setError("No se pudo eliminar el horario");
    }
  };

  const manejarGuardar = () => {
    if (!fecha) {
      setError("Debes seleccionar al menos una fecha");
      return;
    }
    if (horariosCargados.length === 0) {
      setError("Carga al menos un horario para esta fecha antes de guardar");
      return;
    }
    alCerrar(); // Si todo está bien, cerramos
  };

  return (
    <div style={styles.overlay} onClick={alCerrar}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.titulo}>Gestionar Agenda</h2>
        <p style={styles.especialistaNombre}>{especialista.nombre} {especialista.apellido}</p>
        
        {/* CARTEL DE ERROR */}
        {error && <div style={styles.bannerError}>{error}</div>}

        <div style={styles.seccion}>
          <label style={styles.label}>1. Seleccioná el día:</label>
          <input 
            type="date" 
            style={{...styles.input, borderColor: !fecha && error ? '#e74c3c' : '#d1c4b9'}} 
            value={fecha} 
            onChange={(e) => setFecha(e.target.value)} 
          />
        </div>

        <div style={styles.seccion}>
          <label style={styles.label}>2. Agregá horarios uno a uno:</label>
          <div style={styles.filaInput}>
            <input 
              type="time" 
              style={{...styles.input, flex: 1}} 
              value={hora} 
              onChange={(e) => setHora(e.target.value)} 
            />
            <button style={styles.btnMas} onClick={agregarHorario}>+</button>
          </div>
        </div>

        <div style={styles.listaHorarios}>
          <p style={styles.labelLista}>Horarios del día {fecha && <span>({fecha.split('-').reverse().join('/')})</span>}:</p>
          <div style={styles.containerTags}>
            {horariosCargados.length > 0 ? (
              horariosCargados.map((h) => (
                <div key={h.id} style={styles.itemHorario}>
                  {h.hora_inicio.substring(0, 5)} hs
                  <button onClick={() => eliminarHorario(h.id)} style={styles.btnBorrarTag}>×</button>
                </div>
              ))
            ) : (
              <p style={styles.vacio}>No hay horarios para este día.</p>
            )}
          </div>
        </div>

        <button style={styles.btnGuardar} onClick={manejarGuardar}>
          CONFIRMAR Y GUARDAR
        </button>
        <button style={styles.btnCancelar} onClick={alCerrar}>Cancelar</button>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(26, 26, 26, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(4px)' },
  modal: { background: '#fff', padding: '35px', borderRadius: '35px', width: '400px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' },
  titulo: { color: '#8c6d4f', fontSize: '1.8rem', marginBottom: '5px', fontWeight: '400', fontFamily: 'serif' },
  especialistaNombre: { color: '#bfa38a', fontSize: '0.8rem', marginBottom: '20px', letterSpacing: '1px', textTransform: 'uppercase' },
  
  bannerError: { backgroundColor: '#fdeaea', color: '#e74c3c', padding: '10px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #f5c6cb' },
  
  seccion: { textAlign: 'left', marginBottom: '20px' },
  label: { color: '#a6835a', fontSize: '0.75rem', marginBottom: '8px', display: 'block', fontWeight: 'bold' },
  input: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #d1c4b9', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fdfcfb', color: '#555' },
  filaInput: { display: 'flex', gap: '10px', alignItems: 'center' },
  btnMas: { background: '#a6835a', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '12px', cursor: 'pointer', fontSize: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.3s' },
  
  listaHorarios: { background: '#fdfbf9', padding: '15px', borderRadius: '20px', border: '1px solid #f2e9e1', minHeight: '80px', marginBottom: '25px', textAlign: 'left' },
  labelLista: { fontSize: '0.7rem', color: '#bfa38a', marginBottom: '10px', fontWeight: 'bold' },
  containerTags: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  itemHorario: { display: 'flex', alignItems: 'center', gap: '5px', background: '#fff', padding: '6px 12px', borderRadius: '10px', border: '1px solid #e5d9cd', fontSize: '0.85rem', color: '#8c6d4f', fontWeight: '500' },
  btnBorrarTag: { background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1.1rem', padding: 0, marginLeft: '5px', lineHeight: 1 },
  
  vacio: { color: '#d1c4b9', fontSize: '0.8rem', fontStyle: 'italic' },
  btnGuardar: { width: '100%', background: '#a6835a', color: 'white', border: 'none', padding: '16px', borderRadius: '30px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px', boxShadow: '0 4px 15px rgba(166, 131, 90, 0.3)' },
  btnCancelar: { background: 'none', border: 'none', color: '#bfa38a', cursor: 'pointer', fontSize: '0.8rem', marginTop: '15px', textDecoration: 'underline' }
};

export default ModalGestionarAgenda;