import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import ModalFiltroEspecialistas from '../components/Servicios/ModalFiltroEspecialistas';

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // ESTADOS PARA EL FLUJO DE RESERVA
  const [servicioEnProceso, setServicioEnProceso] = useState(null);
  const [mostrarFiltro, setMostrarFiltro] = useState(false);

  // ESTADOS PARA GESTIÓN (EDITAR/ELIMINAR)
  const [menuAbierto, setMenuAbierto] = useState(null); // Controla qué menú de 3 puntitos está abierto
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formData, setFormData] = useState({ id: null, nombre: '', descripcion: '', precio: '', duracion_min: '' });

  const navigate = useNavigate();

  useEffect(() => {
    obtenerServicios();
  }, []);

  const obtenerServicios = async () => {
    // Quitamos el .eq('activo', true) si queremos que el admin vea todos, 
    // o lo dejamos si solo manejamos eliminaciones reales.
    const { data, error } = await supabase.from('servicios').select('*');
    if (!error) setServicios(data);
    setCargando(false);
  };

  const iniciarReserva = (servicio) => {
    setServicioEnProceso(servicio);
    setMostrarFiltro(true);
  };

  const finalizarSeleccion = (especialista) => {
    setMostrarFiltro(false);
    navigate('/equipo', { 
      state: { 
        servicioElegido: servicioEnProceso,
        especialistaElegido: especialista,
        abrirCalendario: true 
      } 
    });
  };

  // --- LÓGICA DE GESTIÓN ---

  const eliminarServicio = async (id) => {
    setMenuAbierto(null);
    if (window.confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
      try {
        const { error } = await supabase.from('servicios').delete().eq('id', id);
        if (error) throw error;
        setServicios(servicios.filter(s => s.id !== id));
        alert("Eliminado con éxito");
      } catch (err) {
        alert("Error: " + err.message);
      }
    }
  };

  const prepararEdicion = (servicio) => {
    setFormData({
      id: servicio.id,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio: servicio.precio,
      duracion_min: servicio.duracion_min
    });
    setMenuAbierto(null);
    setModalAbierto(true);
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    const payload = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: parseFloat(formData.precio),
      duracion_min: parseInt(formData.duracion_min)
    };

    if (formData.id) {
      // Actualizar
      await supabase.from('servicios').update(payload).eq('id', formData.id);
    } else {
      // Insertar nuevo
      await supabase.from('servicios').insert([payload]);
    }
    
    setModalAbierto(false);
    setFormData({ id: null, nombre: '', descripcion: '', precio: '', duracion_min: '' });
    obtenerServicios();
  };

  return (
    <main id="seccion-servicios" style={styles.container}> 
      <header style={styles.header}>
        <h1 style={styles.tituloHeader}>Nuestros Servicios</h1>
        <p style={styles.subtituloHeader}>RESERVA CON EL 30% DE SEÑA</p>
        <button 
          style={styles.btnNuevo} 
          onClick={() => { setFormData({id: null, nombre:'', descripcion:'', precio:'', duracion_min:''}); setModalAbierto(true); }}
        >
          + AGREGAR SERVICIO
        </button>
      </header>

      <div style={styles.grid}>
        {servicios.map((s) => (
          <div key={s.id} style={styles.card}>
            
            {/* MENÚ DE TRES PUNTITOS */}
            <div style={styles.menuContenedor}>
              <button 
                style={styles.optionsBadge} 
                onClick={() => setMenuAbierto(menuAbierto === s.id ? null : s.id)}
              >
                ⋮
              </button>
              {menuAbierto === s.id && (
                <div style={styles.dropdown}>
                  <button style={styles.dropdownItem} onClick={() => prepararEdicion(s)}>✏️ Editar</button>
                  <button style={{...styles.dropdownItem, color: '#e74c3c'}} onClick={() => eliminarServicio(s.id)}>🗑️ Eliminar</button>
                </div>
              )}
            </div>

            <h2 style={styles.servicioNombre}>{s.nombre}</h2>
            <p style={styles.servicioDescripcion}>{s.descripcion}</p>
            <div style={styles.infoContenedor}>
              <p style={styles.duracionTexto}>DURACIÓN: {s.duracion_min} MIN</p>
              <p style={styles.precioTexto}>${Number(s.precio).toLocaleString('es-AR')}</p>
            </div>
            <button style={styles.btnReservar} onClick={() => iniciarReserva(s)}>
              Reservar Turno
            </button>
          </div>
        ))}
      </div>

      {/* MODAL DE FORMULARIO (EDICIÓN/NUEVO) */}
      {modalAbierto && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={{color: '#8c6d4f', marginBottom: '20px'}}>{formData.id ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
            <form onSubmit={guardarCambios} style={styles.form}>
              <input 
                style={styles.input} 
                placeholder="Nombre del servicio" 
                value={formData.nombre} 
                onChange={e => setFormData({...formData, nombre: e.target.value})} 
                required 
              />
              <textarea 
                style={{...styles.input, minHeight: '80px'}} 
                placeholder="Descripción" 
                value={formData.descripcion} 
                onChange={e => setFormData({...formData, descripcion: e.target.value})} 
              />
              <input 
                style={styles.input} 
                type="number" 
                placeholder="Precio" 
                value={formData.precio} 
                onChange={e => setFormData({...formData, precio: e.target.value})} 
                required 
              />
              <input 
                style={styles.input} 
                type="number" 
                placeholder="Duración (minutos)" 
                value={formData.duracion_min} 
                onChange={e => setFormData({...formData, duracion_min: e.target.value})} 
                required 
              />
              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <button type="button" onClick={() => setModalAbierto(false)} style={styles.btnEliminar}>Cancelar</button>
                <button type="submit" style={styles.btnReservar}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE FILTRO ESPECIALISTAS */}
      {mostrarFiltro && (
        <ModalFiltroEspecialistas 
          servicio={servicioEnProceso}
          alCerrar={() => setMostrarFiltro(false)}
          alSeleccionar={finalizarSeleccion}
        />
      )}
    </main>
  );
}

const styles = {
  container: {
    backgroundColor: '#f3ece4',
    minHeight: '100vh',
    padding: '80px 20px',
    fontFamily: "'Playfair Display', serif"
  },
  header: { textAlign: 'center', marginBottom: '60px' },
  tituloHeader: { color: '#8c6d4f', fontSize: '3.2rem', marginBottom: '10px' },
  subtituloHeader: { color: '#bfa38a', fontSize: '0.8rem', letterSpacing: '3px', fontWeight: '600' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center', maxWidth: '1200px', margin: '0 auto' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '45px 30px',
    width: '320px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
    position: 'relative',
    border: '1px solid #f2e9e1',
  },
  // ESTILOS DEL MENÚ 3 PUNTITOS
  menuContenedor: { position: 'absolute', top: '15px', right: '15px' },
  optionsBadge: {
    background: 'none', border: '1px solid #f2e9e1', borderRadius: '50%',
    width: '35px', height: '35px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#d1c4b9', fontSize: '1.2rem', cursor: 'pointer'
  },
  dropdown: {
    position: 'absolute', right: '0', top: '40px', backgroundColor: 'white',
    boxShadow: '0px 8px 16px rgba(0,0,0,0.1)', borderRadius: '8px', zIndex: 100,
    minWidth: '130px', border: '1px solid #eee'
  },
  dropdownItem: {
    width: '100%', background: 'none', border: 'none', padding: '10px 15px',
    textAlign: 'left', cursor: 'pointer', fontSize: '14px'
  },
  // ESTILOS CARD
  servicioNombre: { color: '#8c6d4f', fontSize: '2rem', marginBottom: '15px' },
  servicioDescripcion: { color: '#bfa38a', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '25px', minHeight: '50px' },
  infoContenedor: { marginBottom: '30px' },
  duracionTexto: { color: '#bfa38a', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1.5px', marginBottom: '10px' },
  precioTexto: { color: '#bfa38a', fontSize: '1.6rem', fontWeight: '500' },
  btnReservar: { backgroundColor: '#a6835a', color: '#fff', border: 'none', padding: '12px 35px', borderRadius: '25px', cursor: 'pointer' },
  btnNuevo: { backgroundColor: '#a6835a', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '25px', cursor: 'pointer', marginTop: '20px', letterSpacing: '1px' },
  // ESTILOS MODAL EDICIÓN
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', padding: '40px', borderRadius: '15px', width: '90%', maxWidth: '400px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'sans-serif' },
  btnEliminar: { backgroundColor: '#fdeaea', color: '#e74c3c', border: 'none', padding: '12px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', flex: 1 }
};