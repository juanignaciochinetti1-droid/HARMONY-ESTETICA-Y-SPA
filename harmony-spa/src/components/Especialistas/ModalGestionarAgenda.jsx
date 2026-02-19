import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const ModalGestionarAgenda = ({ especialista, alCerrar }) => {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [horariosCargados, setHorariosCargados] = useState([]);

  // Cargar horarios existentes para la fecha seleccionada
  useEffect(() => {
    if (fecha) obtenerHorarios();
  }, [fecha]);

  // En ModalGestionarAgenda.jsx, corrige la función obtenerHorarios:
const obtenerHorarios = async () => {
  const { data, error } = await supabase
    .from('disponibilidad_empleado')
    .select('*') // <-- Te faltaba esta línea
    .eq('empleado_id', especialista.id)
    .eq('fecha', fecha)
    .order('hora_inicio', { ascending: true });

  if (!error) setHorariosCargados(data);
};

  const agregarHorario = async () => {
  if (!fecha || !hora) return alert("Seleccioná fecha y hora");

  // Validamos que no sea una fecha pasada antes de enviar
  const hoy = new Date().toISOString().split('T')[0];
  if (fecha < hoy) return alert("No podés cargar disponibilidad en fechas pasadas");

  const { data, error } = await supabase
    .from('disponibilidad_empleado')
    .insert([{ 
      empleado_id: especialista.id, 
      fecha: fecha, 
      hora_inicio: hora,
      hora_fin: hora 
    }])
    .select(); // El .select() es clave para obtener el dato recién creado

  if (error) {
    alert("Error al cargar: " + error.message);
  } else if (data) {
    // Actualizamos la lista visual inmediatamente
    setHorariosCargados([...horariosCargados, data[0]]);
    setHora(''); // Limpiamos el input de hora
  }
};

  return (
    <div style={styles.overlay} onClick={alCerrar}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.titulo}>Gestionar Agenda</h2>
        
        <div style={styles.seccion}>
          <label style={styles.label}>1. Seleccioná el día:</label>
          <input 
            type="date" 
            style={styles.input} 
            value={fecha} 
            onChange={(e) => setFecha(e.target.value)} 
          />
        </div>

        <div style={styles.seccion}>
          <label style={styles.label}>2. Escribí la hora (ej: 14:30):</label>
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
          {horariosCargados.length > 0 ? (
            horariosCargados.map((h, index) => (
              <div key={index} style={styles.itemHorario}>
                {h.hora_inicio.substring(0, 5)} hs
              </div>
            ))
          ) : (
            <p style={styles.vacio}>No hay horarios cargados para esta fecha.</p>
          )}
        </div>

        <button style={styles.btnGuardar} onClick={alCerrar}>GUARDAR CAMBIOS</button>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 },
  modal: { background: '#fff', padding: '40px', borderRadius: '35px', width: '380px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' },
  titulo: { color: '#b5926d', fontSize: '1.8rem', marginBottom: '25px', fontWeight: '300', fontFamily: 'serif' },
  seccion: { textAlign: 'left', marginBottom: '20px' },
  label: { color: '#a6835a', fontSize: '0.85rem', marginBottom: '8px', display: 'block' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1c4b9', outline: 'none', boxSizing: 'border-box' },
  filaInput: { display: 'flex', gap: '10px', alignItems: 'center' },
  btnMas: { background: '#a6835a', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', fontSize: '1.2rem' },
  listaHorarios: { background: '#fdfbf9', padding: '15px', borderRadius: '15px', border: '1px solid #f2e9e1', minHeight: '50px', marginBottom: '20px' },
  itemHorario: { display: 'inline-block', background: '#fff', padding: '5px 12px', borderRadius: '8px', border: '1px solid #e5d9cd', margin: '4px', fontSize: '0.8rem', color: '#8c6d4f' },
  vacio: { color: '#aaa', fontSize: '0.8rem', margin: '10px 0' },
  btnGuardar: { width: '100%', background: '#a6835a', color: 'white', border: 'none', padding: '15px', borderRadius: '30px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }
};

export default ModalGestionarAgenda;