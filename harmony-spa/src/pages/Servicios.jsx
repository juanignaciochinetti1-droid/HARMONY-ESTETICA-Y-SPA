import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ModalFiltroEspecialistas from '../components/Servicios/ModalFiltroEspecialistas';

const SkeletonCard = () => (
  <div style={styles.skeletonCard}>
    <div style={styles.skeletonImg}></div>
    <div style={styles.skeletonTitle}></div>
    <div style={styles.skeletonText}></div>
    <div style={styles.skeletonBtn}></div>
  </div>
);

const ModalConfirmacion = ({ titulo = "¿Estás seguro?", mensaje, icono = "!", alConfirmar, alCancelar, soloAviso = false }) => (
  <div style={styles.alertOverlay}>
    <div style={styles.alertModal}>
      <div style={{...styles.alertIcon, borderColor: icono === 'i' ? '#bfa38a' : '#c5a37d', color: icono === 'i' ? '#bfa38a' : '#c5a37d'}}>{icono}</div>
      <h3 style={styles.alertTitle}>{titulo}</h3>
      <p style={styles.alertText}>{mensaje}</p>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        {!soloAviso && <button style={styles.btnCancelarAlerta} onClick={alCancelar}>CANCELAR</button>}
        <button style={styles.btnConfirmarAlerta} onClick={alConfirmar}>{soloAviso ? 'ENTENDIDO' : 'ELIMINAR'}</button>
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
  const [hoverId, setHoverId] = useState(null);
  const [errores, setErrores] = useState({});
  const [servicioOriginal, setServicioOriginal] = useState(null);
  const [avisoSinCambios, setAvisoSinCambios] = useState(false);

  const [formData, setFormData] = useState({ id: null, nombre: '', descripcion: '', precio: '', duracion_min: '', foto_url: '' });
  const [confirmacion, setConfirmacion] = useState({ visible: false, id: null });

  const navigate = useNavigate();
  const domRef = useRef();

  useEffect(() => { 
    if (!loading) obtenerServicios(); 
  }, [loading, isAdmin]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    if (domRef.current) observer.observe(domRef.current);
    return () => { if (domRef.current) observer.unobserve(domRef.current); };
  }, [cargando]);

  const obtenerServicios = async () => {
    let query = supabase.from('servicios').select('*');
    if (!isAdmin) query = query.eq('activo', true);
    const { data, error } = await query.order('nombre', { ascending: true });
    if (!error) setServicios(data);
    setCargando(false);
  };

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

  const validarFormulario = () => {
    let nuevosErrores = {};
    if (!formData.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio.";
    if (formData.descripcion.length < 10) nuevosErrores.descripcion = "La descripción debe tener al menos 10 caracteres.";
    if (!formData.precio || formData.precio <= 0) nuevosErrores.precio = "El precio debe ser mayor a 0.";
    if (!formData.duracion_min || formData.duracion_min < 15) nuevosErrores.duracion = "La duración mínima es de 15 min.";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    if (formData.id && servicioOriginal) {
      const huboCambios = 
        formData.nombre.trim() !== servicioOriginal.nombre ||
        formData.descripcion.trim() !== servicioOriginal.descripcion ||
        parseFloat(formData.precio) !== parseFloat(servicioOriginal.precio) ||
        parseInt(formData.duracion_min) !== parseInt(servicioOriginal.duracion_min) ||
        formData.foto_url !== servicioOriginal.foto_url;
      if (!huboCambios) {
        setAvisoSinCambios(true);
        return; 
      }
    }
    const payload = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion,
      precio: parseFloat(formData.precio),
      duracion_min: parseInt(formData.duracion_min),
      foto_url: formData.foto_url,
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
      setServicioOriginal(null);
      setErrores({});
    } catch (error) {
      alert("No se pudo guardar: " + error.message);
    }
  };

  const prepararEdicion = (s) => {
    const datosIniciales = { id: s.id, nombre: s.nombre, descripcion: s.descripcion, precio: s.precio, duracion_min: s.duracion_min, foto_url: s.foto_url || '' };
    setFormData(datosIniciales);
    setServicioOriginal(datosIniciales);
    setErrores({});
    setMenuAbierto(null);
    setModalAbierto(true);
  };

  const dispararEliminacion = (id) => {
    setMenuAbierto(null);
    setConfirmacion({ visible: true, id: id });
  };

  const ejecutarEliminacion = async () => {
    const { error } = await supabase.from('servicios').delete().eq('id', confirmacion.id);
    if (!error) {
      obtenerServicios();
      setConfirmacion({ visible: false, id: null });
    } else {
      alert("Error: " + error.message);
    }
  };

  return (
    <div style={styles.container}> 
      {/* 1. ENVOLTORIO ANIMADO (Solo para el contenido) */}
      <div ref={domRef} className="fade-up">
        <header style={styles.header}>
          <h1 style={styles.tituloHeader}>Nuestros Servicios</h1>
          <p style={styles.subtituloHeader}>RESERVA CON EL 30% DE SEÑA</p>
          {isAdmin && (
            <button style={styles.btnNuevo} onClick={() => { setFormData({id: null, nombre:'', descripcion:'', precio:'', duracion_min:'', foto_url: ''}); setServicioOriginal(null); setErrores({}); setModalAbierto(true); }}>
              + AGREGAR SERVICIO
            </button>
          )}
        </header>

        <div style={styles.grid}>
          {cargando ? (
            [1, 2, 3].map(n => <SkeletonCard key={n} />)
          ) : (
            servicios.map((s) => {
              const estaEnHover = hoverId === s.id;
              return (
                <div 
                  key={s.id} 
                  onMouseEnter={() => setHoverId(s.id)}
                  onMouseLeave={() => setHoverId(null)}
                  style={{ 
                    ...styles.card, 
                    backgroundImage: s.foto_url ? `url(${s.foto_url})` : 'none', 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    ...styles.cardOverlay,
                    opacity: estaEnHover ? 1 : 0,
                    visibility: estaEnHover ? 'visible' : 'hidden',
                    transform: estaEnHover ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.4s ease-in-out'
                  }}>
                      <h2 style={{...styles.servicioNombre, textTransform: 'capitalize'}}>{s.nombre.toLowerCase()}</h2>
                      <p style={styles.servicioDescripcion}>{s.descripcion}</p>
                      <div style={styles.infoContenedor}>
                        <p style={styles.duracionTexto}>DURACIÓN: {s.duracion_min} MIN</p>
                        <p style={styles.precioTexto}>${Number(s.precio).toLocaleString('es-AR')}</p>
                      </div>
                      <button style={styles.btnReservar} onClick={(e) => { e.stopPropagation(); iniciarReserva(s); }}>
                        Reservar Turno
                      </button>
                  </div>

                  {isAdmin && (
                    <div style={styles.menuContenedor}>
                      <button style={styles.optionsBadge} onClick={(e) => { e.stopPropagation(); setMenuAbierto(menuAbierto === s.id ? null : s.id); }}>⋮</button>
                      {menuAbierto === s.id && (
                        <div style={styles.dropdown}>
                          <button style={styles.dropdownItem} onClick={() => prepararEdicion(s)}>✏️ Editar</button>
                          <button style={{...styles.dropdownItem, color: '#e74c3c'}} onClick={() => dispararEliminacion(s.id)}>🗑️ Eliminar</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. MODALES FUERA DEL FADE-UP (Para que el position: fixed funcione) */}
      {modalAbierto && (
        <div style={styles.overlay} onClick={() => setModalAbierto(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{color: '#8c6d4f', marginBottom: '10px'}}>{formData.id ? 'Editar' : 'Nuevo'} Servicio</h2>
            {Object.keys(errores).length > 0 && (
              <div style={styles.bannerError}>⚠️ Revisa los campos marcados.</div>
            )}
            <form onSubmit={guardarCambios} style={styles.form}>
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.7rem', color: '#8c6d4f', fontWeight: 'bold' }}>IMAGEN DE FONDO</label>
                <input type="file" accept="image/*" onChange={manejarSubidaFoto} style={{ ...styles.input, marginTop: '5px' }} />
              </div>
              <input style={{...styles.input, borderColor: errores.nombre ? '#e74c3c' : '#ddd'}} placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              <textarea style={{...styles.input, minHeight: '80px', borderColor: errores.descripcion ? '#e74c3c' : '#ddd'}} placeholder="Descripción" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input style={{...styles.input, flex: 1, borderColor: errores.precio ? '#e74c3c' : '#ddd'}} type="number" placeholder="Precio" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} />
                <input style={{...styles.input, flex: 1, borderColor: errores.duracion ? '#e74c3c' : '#ddd'}} type="number" placeholder="Duración (min)" value={formData.duracion_min} onChange={e => setFormData({...formData, duracion_min: e.target.value})} />
              </div>
              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <button type="button" onClick={() => setModalAbierto(false)} style={styles.btnEliminarForm}>Cancelar</button>
                <button type="submit" disabled={subiendoFoto} style={styles.btnReservar}>{subiendoFoto ? 'PROCESANDO...' : 'GUARDAR'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {avisoSinCambios && (
        <ModalConfirmacion titulo="Sin cambios" mensaje="Modifica al menos un dato para actualizar." icono="i" soloAviso={true} alConfirmar={() => setAvisoSinCambios(false)} />
      )}

      {confirmacion.visible && (
        <ModalConfirmacion mensaje="Se eliminará permanentemente." alConfirmar={ejecutarEliminacion} alCancelar={() => setConfirmacion({ visible: false, id: null })} />
      )}

      {mostrarFiltro && (
        <ModalFiltroEspecialistas servicio={servicioEnProceso} alCerrar={() => setMostrarFiltro(false)} alSeleccionar={finalizarSeleccion} />
      )}

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
          .fade-up {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s ease-out;
          }
          .fade-up.visible {
            opacity: 1;
            transform: translateY(0);
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#f3ece4', minHeight: '100vh', padding: '80px 20px', fontFamily: "'Playfair Display', serif" },
  header: { textAlign: 'center', marginBottom: '60px' },
  tituloHeader: { color: '#8c6d4f', fontSize: '3.2rem', marginBottom: '10px' },
  subtituloHeader: { color: '#bfa38a', fontSize: '0.8rem', letterSpacing: '3px', fontWeight: '600' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center', maxWidth: '1200px', margin: '0 auto' },
  
  skeletonCard: { width: '350px', height: '500px', backgroundColor: '#fff', borderRadius: '20px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', border: '1px solid #f2e9e1', boxSizing: 'border-box' },
  skeletonImg: { width: '100%', height: '180px', backgroundColor: '#f5f0eb', borderRadius: '15px', animation: 'pulse 1.5s infinite' },
  skeletonTitle: { width: '70%', height: '30px', backgroundColor: '#f5f0eb', borderRadius: '10px', animation: 'pulse 1.5s infinite' },
  skeletonText: { width: '90%', height: '80px', backgroundColor: '#f5f0eb', borderRadius: '10px', animation: 'pulse 1.5s infinite' },
  skeletonBtn: { width: '150px', height: '45px', backgroundColor: '#f5f0eb', borderRadius: '30px', marginTop: 'auto', animation: 'pulse 1.5s infinite' },

  card: { backgroundColor: '#ffffff', borderRadius: '20px', width: '350px', height: '500px', textAlign: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.08)', position: 'relative', border: '1px solid #f2e9e1', overflow: 'hidden' },
  cardOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(243, 236, 228, 0.96)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '45px 30px', zIndex: 2 },
  menuContenedor: { position: 'absolute', top: '15px', right: '15px', zIndex: 10 },
  optionsBadge: { background: 'white', border: '1px solid #f2e9e1', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1c4b9', fontSize: '1.2rem', cursor: 'pointer' },
  dropdown: { position: 'absolute', right: '0', top: '40px', backgroundColor: 'white', boxShadow: '0px 8px 16px rgba(0,0,0,0.1)', borderRadius: '8px', zIndex: 100, minWidth: '130px', border: '1px solid #eee' },
  dropdownItem: { width: '100%', background: 'none', border: 'none', padding: '10px 15px', textAlign: 'left', cursor: 'pointer', fontSize: '14px' },
  servicioNombre: { color: '#8c6d4f', fontSize: '1.8rem', marginBottom: '5px' },
  servicioDescripcion: { color: '#5d4d3d', fontSize: '1rem', lineHeight: '1.6', margin: '15px 0', minHeight: '80px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical' },
  infoContenedor: { marginBottom: '15px' },
  duracionTexto: { color: '#a6835a', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' },
  precioTexto: { color: '#8c6d4f', fontSize: '1.7rem', fontWeight: '600' },
  btnReservar: { backgroundColor: '#a6835a', color: '#fff', border: 'none', padding: '16px 45px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' },
  btnNuevo: { backgroundColor: '#a6835a', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '25px', cursor: 'pointer', marginTop: '20px' },
  
  overlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20000, overflowY: 'auto' },
  modal: { backgroundColor: 'white', padding: '40px', borderRadius: '25px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', boxSizing: 'border-box' },
  btnEliminarForm: { backgroundColor: '#fdeaea', color: '#e74c3c', border: 'none', padding: '12px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', flex: 1 },
  bannerError: { backgroundColor: '#fdeaea', color: '#e74c3c', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.85rem', fontWeight: 'bold' },
  alertOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 30000, backdropFilter: 'blur(5px)' },
  alertModal: { backgroundColor: '#fff', padding: '45px 40px', borderRadius: '40px', width: '420px', textAlign: 'center' },
  alertIcon: { width: '65px', height: '65px', borderRadius: '50%', border: '2px solid', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', margin: '0 auto 25px' },
  alertTitle: { color: '#8c6d4f', fontSize: '1.8rem' },
  alertText: { color: '#bfa38a', fontSize: '1.05rem', marginBottom: '35px' },
  btnCancelarAlerta: { backgroundColor: '#f5f5f5', color: '#777', border: 'none', padding: '14px 30px', borderRadius: '30px', cursor: 'pointer' },
  btnConfirmarAlerta: { backgroundColor: '#a6835a', color: 'white', border: 'none', padding: '14px 30px', borderRadius: '30px', cursor: 'pointer' }
};