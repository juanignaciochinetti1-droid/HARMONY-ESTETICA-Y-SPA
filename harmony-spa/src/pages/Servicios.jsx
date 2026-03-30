import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ModalFiltroEspecialistas from '../components/Servicios/ModalFiltroEspecialistas';

// --- MODAL DE CONFIRMACIÓN ---
const ModalConfirmacion = ({ mensaje, alConfirmar, alCancelar }) => (
  <div style={styles.alertOverlay}>
    <div style={styles.alertModal}>
      <div style={styles.alertIcon}>!</div>
      <h3 style={styles.alertTitle}>¿Estás seguro?</h3>
      <p style={styles.alertText}>{mensaje}</p>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button style={styles.btnCancelarAlerta} onClick={alCancelar}>CANCELAR</button>
        <button style={styles.btnConfirmarAlerta} onClick={alConfirmar}>ELIMINAR</button>
      </div>
    </div>
  </div>
);

export default function Servicios() {
  const { profile, loading } = useAuth();
  const isAdmin = profile?.rol === 'ADMIN';

  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [servicioEnProceso, setServicioEnProceso] = useState(null);
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(null); 
  const [modalAbierto, setModalAbierto] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const [formData, setFormData] = useState({ id: null, nombre: '', descripcion: '', precio: '', duracion_min: '', foto_url: '' });
  const [confirmacion, setConfirmacion] = useState({ visible: false, id: null });

  const navigate = useNavigate();

  useEffect(() => { 
    if (!loading) obtenerServicios(); 
  }, [loading, isAdmin]);

  const obtenerServicios = async () => {
    let query = supabase.from('servicios').select('*');
    if (!isAdmin) query = query.eq('activo', true);
    const { data, error } = await query.order('nombre', { ascending: true });
    if (!error) setServicios(data);
    setCargando(false);
  };

  // --- SUBIDA DE FOTO ---
  const manejarSubidaFoto = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setSubiendoFoto(true);
    try {
      const nombreArchivo = `${Date.now()}_${archivo.name}`;
      const { data, error } = await supabase.storage.from('fotos-servicios').upload(nombreArchivo, archivo);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('fotos-servicios').getPublicUrl(nombreArchivo);
      setFormData({ ...formData, foto_url: urlData.publicUrl });
    } catch (error) {
      alert("Error en foto: " + error.message);
    } finally {
      setSubiendoFoto(false);
    }
  };

  const iniciarReserva = (servicio) => {
    setServicioEnProceso(servicio);
    setMostrarFiltro(true);
  };

  // --- AQUÍ REINSTALAMOS LA FUNCIÓN QUE SE HABÍA BORRADO ---
  const finalizarSeleccion = (especialista) => {
    setMostrarFiltro(false);
    // Enviamos al usuario a la página de Equipo con los datos necesarios para abrir el calendario
    navigate('/equipo', { 
      state: { 
        servicioElegido: servicioEnProceso, 
        especialistaElegido: especialista, 
        abrirCalendario: true 
      } 
    });
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    const payload = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion,
      precio: parseFloat(formData.precio),
      duracion_min: parseInt(formData.duracion_min),
      foto_url: formData.foto_url, // IMPORTANTE: Creá esta columna en Supabase
      activo: true
    };

    try {
      let resultado;
      if (formData.id) {
        resultado = await supabase.from('servicios').update(payload).eq('id', formData.id).select();
      } else {
        resultado = await supabase.from('servicios').insert([payload]).select();
      }
      if (resultado.error) throw resultado.error;
      obtenerServicios();
      setModalAbierto(false);
      setFormData({ id: null, nombre: '', descripcion: '', precio: '', duracion_min: '', foto_url: '' });
    } catch (error) {
      alert("No se pudo guardar: " + error.message);
    }
  };

  const prepararEdicion = (s) => {
    setFormData({ id: s.id, nombre: s.nombre, descripcion: s.descripcion, precio: s.precio, duracion_min: s.duracion_min, foto_url: s.foto_url || '' });
    setMenuAbierto(null);
    setModalAbierto(true);
  };

  return (
    <main id="seccion-servicios" style={styles.container}> 
      <header style={styles.header}>
        <h1 style={styles.tituloHeader}>Nuestros Servicios</h1>
        <p style={styles.subtituloHeader}>RESERVA CON EL 30% DE SEÑA</p>
        {isAdmin && (
          <button style={styles.btnNuevo} onClick={() => { setFormData({id: null, nombre:'', descripcion:'', precio:'', duracion_min:'', foto_url: ''}); setModalAbierto(true); }}>
            + AGREGAR SERVICIO
          </button>
        )}
      </header>

      <div style={styles.grid}>
        {servicios.map((s) => (
          <div key={s.id} style={{ ...styles.card, backgroundImage: s.foto_url ? `url(${s.foto_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            {s.foto_url && <div style={styles.cardOverlay}></div>}

            {isAdmin && (
              <div style={styles.menuContenedor}>
                <button style={styles.optionsBadge} onClick={() => setMenuAbierto(menuAbierto === s.id ? null : s.id)}>⋮</button>
                {menuAbierto === s.id && (
                  <div style={styles.dropdown}>
                    <button style={styles.dropdownItem} onClick={() => prepararEdicion(s)}>✏️ Editar</button>
                    <button style={{...styles.dropdownItem, color: '#e74c3c'}} onClick={() => {setConfirmacion({visible:true, id:s.id}); setMenuAbierto(null);}}>🗑️ Eliminar</button>
                  </div>
                )}
              </div>
            )}

            <div style={{ position: 'relative', zIndex: 2 }}>
                <h2 style={{...styles.servicioNombre, textTransform: 'capitalize'}}>{s.nombre.toLowerCase()}</h2>
                <p style={styles.servicioDescripcion}>{s.descripcion}</p>
                <div style={styles.infoContenedor}>
                  <p style={styles.duracionTexto}>DURACIÓN: {s.duracion_min} MIN</p>
                  <p style={styles.precioTexto}>${Number(s.precio).toLocaleString('es-AR')}</p>
                </div>
                <button style={styles.btnReservar} onClick={() => iniciarReserva(s)}>Reservar Turno</button>
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={{color: '#8c6d4f', marginBottom: '20px'}}>{formData.id ? 'Editar' : 'Nuevo'} Servicio</h2>
            <form onSubmit={guardarCambios} style={styles.form}>
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.7rem', color: '#8c6d4f', fontWeight: 'bold' }}>IMAGEN DE FONDO</label>
                <input type="file" accept="image/*" onChange={manejarSubidaFoto} style={{ ...styles.input, marginTop: '5px' }} />
              </div>
              <input style={styles.input} placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
              <textarea style={{...styles.input, minHeight: '80px'}} placeholder="Descripción" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
              <input style={styles.input} type="number" placeholder="Precio" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} required />
              <input style={styles.input} type="number" placeholder="Duración (min)" value={formData.duracion_min} onChange={e => setFormData({...formData, duracion_min: e.target.value})} required />
              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <button type="button" onClick={() => setModalAbierto(false)} style={styles.btnEliminarForm}>Cancelar</button>
                <button type="submit" disabled={subiendoFoto} style={styles.btnReservar}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmacion.visible && (
        <ModalConfirmacion 
          mensaje="Se eliminará permanentemente."
          alConfirmar={async () => {
             await supabase.from('servicios').delete().eq('id', confirmacion.id);
             obtenerServicios();
             setConfirmacion({visible:false, id:null});
          }}
          alCancelar={() => setConfirmacion({ visible: false, id: null })}
        />
      )}

      {mostrarFiltro && (
        <ModalFiltroEspecialistas 
          servicio={servicioEnProceso} 
          alCerrar={() => setMostrarFiltro(false)} 
          alSeleccionar={finalizarSeleccion} // <--- RECONECTADO
        />
      )}
    </main>
  );
}

const styles = {
  container: { backgroundColor: '#f3ece4', minHeight: '100vh', padding: '80px 20px', fontFamily: "'Playfair Display', serif" },
  header: { textAlign: 'center', marginBottom: '60px' },
  tituloHeader: { color: '#8c6d4f', fontSize: '3.2rem', marginBottom: '10px' },
  subtituloHeader: { color: '#bfa38a', fontSize: '0.8rem', letterSpacing: '3px', fontWeight: '600' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center', maxWidth: '1200px', margin: '0 auto' },
  
  // Card modificada para posicionamiento relativo
  card: { 
    backgroundColor: '#ffffff', 
    borderRadius: '12px', 
    padding: '45px 30px', 
    width: '320px', 
    textAlign: 'center', 
    boxShadow: '0 10px 30px rgba(0,0,0,0.03)', 
    position: 'relative', 
    border: '1px solid #f2e9e1',
    overflow: 'hidden' 
  },

  // Capa para leer texto (Overlay)
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.82)', // Blanco semi-transparente
    zIndex: 1
  },

  menuContenedor: { position: 'absolute', top: '15px', right: '15px', zIndex: 10 },
  optionsBadge: { background: 'white', border: '1px solid #f2e9e1', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1c4b9', fontSize: '1.2rem', cursor: 'pointer' },
  dropdown: { position: 'absolute', right: '0', top: '40px', backgroundColor: 'white', boxShadow: '0px 8px 16px rgba(0,0,0,0.1)', borderRadius: '8px', zIndex: 100, minWidth: '130px', border: '1px solid #eee' },
  dropdownItem: { width: '100%', background: 'none', border: 'none', padding: '10px 15px', textAlign: 'left', cursor: 'pointer', fontSize: '14px' },
  servicioNombre: { color: '#8c6d4f', fontSize: '2rem', marginBottom: '15px' },
  servicioDescripcion: { color: '#5d4d3d', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '25px', minHeight: '50px', fontWeight: '500' },
  infoContenedor: { marginBottom: '30px' },
  duracionTexto: { color: '#a6835a', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1.5px', marginBottom: '10px' },
  precioTexto: { color: '#8c6d4f', fontSize: '1.6rem', fontWeight: '500' },
  btnReservar: { backgroundColor: '#a6835a', color: '#fff', border: 'none', padding: '12px 35px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' },
  btnNuevo: { backgroundColor: '#a6835a', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '25px', cursor: 'pointer', marginTop: '20px', letterSpacing: '1px' },
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', padding: '40px', borderRadius: '15px', width: '90%', maxWidth: '400px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'sans-serif' },
  btnEliminarForm: { backgroundColor: '#fdeaea', color: '#e74c3c', border: 'none', padding: '12px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', flex: 1 },

  // --- Estilos de la Alerta ---
  alertOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(5px)' },
  alertModal: { backgroundColor: '#fff', padding: '45px 40px', borderRadius: '40px', width: '420px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', border: '1px solid #f2e9e1' },
  alertIcon: { width: '65px', height: '65px', borderRadius: '50%', border: '2px solid #c5a37d', color: '#c5a37d', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', margin: '0 auto 25px', fontWeight: 'bold' },
  alertTitle: { color: '#8c6d4f', fontFamily: "'Playfair Display', serif", marginBottom: '15px', fontSize: '1.8rem', fontWeight: '400' },
  alertText: { color: '#bfa38a', fontSize: '1.05rem', marginBottom: '35px', lineHeight: '1.6', letterSpacing: '0.3px' },
  btnCancelarAlerta: { backgroundColor: '#f5f5f5', color: '#777', border: 'none', padding: '14px 30px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px' },
  btnConfirmarAlerta: { backgroundColor: '#a6835a', color: 'white', border: 'none', padding: '14px 30px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px' }
};