import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

// Componentes
import CardEspecialista from '../components/Especialistas/CardEspecialista';
import ModalFormulario from '../components/Especialistas/ModalFormulario';
import ModalGestionarAgenda from '../components/Especialistas/ModalGestionarAgenda';
import ModalCalendario from '../components/Especialistas/ModalCalendario';
import ModalReporteGlobal from '../components/Especialistas/ModalReporteGlobal';
import ModalHistorialEmpleado from '../components/Especialistas/ModalHistorialEmpleado';
import BookingModal from '../components/Modals/BookingModal';
// 1. IMPORTA EL MODAL DESDE LA CARPETA MODALS
import ModalPassword from '../components/Modals/ModalPassword';

const AlertaPersonalizada = ({ mensaje, alCerrar }) => (
  <div style={styles.alertOverlay}>
    <div style={styles.alertModal}>
      <div style={styles.alertIcon}>!</div>
      <h3 style={styles.alertTitle}>Atención</h3>
      <p style={styles.alertText}>{mensaje}</p>
      <button style={styles.alertBtn} onClick={alCerrar}>ENTENDIDO</button>
    </div>
  </div>
);

const ModalConfirmacionEliminar = ({ nombre, alConfirmar, alCancelar }) => (
  <div style={styles.alertOverlay}>
    <div style={styles.alertModal}>
      <div style={styles.alertIcon}>!</div>
      <h3 style={styles.alertTitle}>¿Estás seguro?</h3>
      <p style={styles.alertText}>Vas a eliminar a <strong>{nombre}</strong>. Esta acción no se puede deshacer.</p>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button style={styles.btnCancelarAlerta} onClick={alCancelar}>CANCELAR</button>
        <button style={styles.btnConfirmarAlerta} onClick={alConfirmar}>ELIMINAR</button>
      </div>
    </div>
  </div>
);

export default function Equipo() {
  const location = useLocation();
  const { profile, loading } = useAuth();
  
  const isAdmin = profile?.rol === 'ADMIN';
  const esEmpleado = profile?.rol === 'EMPLEADO';
  const idLogueado = profile?.id;

  const [listaEspecialistas, setListaEspecialistas] = useState([]);
  const [especialistaSeleccionado, setEspecialistaSeleccionado] = useState(null);
  const [especialistaAEditar, setEspecialistaAEditar] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  const [formAbierto, setFormAbierto] = useState(false);
  const [gestionAbierta, setGestionAbierta] = useState(false);
  const [calendarioAbierto, setCalendarioAbierto] = useState(false);
  const [reporteAbierto, setReporteAbierto] = useState(false);
  const [historialAbierto, setHistorialAbierto] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [datosReservaTemporal, setDatosReservaTemporal] = useState(null);
  const [alerta, setAlerta] = useState({ visible: false, mensaje: "" });
  const [confirmarEliminar, setConfirmarEliminar] = useState({ visible: false, empleado: null });
  const [passwordModalAbierto, setPasswordModalAbierto] = useState(false);

  const obtenerEspecialistas = async () => {
    const { data, error } = await supabase.from('users').select('*').eq('rol', 'EMPLEADO');
    if (!error) setListaEspecialistas(data || []);
  };

  useEffect(() => {
    obtenerEspecialistas();
    if (location.state?.abrirCalendario) {
      setServicioSeleccionado(location.state.servicioElegido);
      setEspecialistaSeleccionado(location.state.especialistaElegido);
      setCalendarioAbierto(true);
    }
  }, [location, loading]);

  const guardarEmpleado = async (datos) => {
    try {
      const payload = {
        nombre: datos.nombre,
        apellido: datos.apellido,
        dni: datos.dni,
        especialidad: datos.especialidad,
        email: datos.email.trim().toLowerCase(),
        telefono: datos.telefono,
        activo: datos.activo,
        foto_url: datos.foto_url, // <--- CORREGIDO: Usar foto_url que viene del modal
        rol: 'EMPLEADO'
      };

      if (especialistaAEditar) {
        const { error } = await supabase.from('users').update(payload).eq('id', especialistaAEditar.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('users').insert([payload]);
        if (error && error.code !== '23505' && error.status !== 409) throw error;
      }

      await obtenerEspecialistas(); 
      setAlerta({ 
        visible: true, 
        mensaje: especialistaAEditar ? "✨ Perfil actualizado." : "✨ Especialista registrado." 
      });
    } catch (error) {
      console.error("Error guardando:", error);
      await obtenerEspecialistas();
    
    setAlerta({ 
      visible: true, 
      mensaje: especialistaAEditar 
        ? "✨ Perfil actualizado correctamente." 
        : "✨ Especialista registrado exitosamente en el staff."
    });
  }
};

  const ejecutarEliminacion = async () => {
    const id = confirmarEliminar.empleado.id;
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (!error) {
      setListaEspecialistas(listaEspecialistas.filter(esp => esp.id !== id));
      setConfirmarEliminar({ visible: false, empleado: null });
    } else {
      setAlerta({ visible: true, mensaje: "No se pudo eliminar: El empleado tiene turnos o no tienes permisos." });
    }
  };

  const especialistasAMostrar = useMemo(() => {
    let filtrados = [...listaEspecialistas];
    if (!isAdmin && !esEmpleado) {
      filtrados = filtrados.filter(esp => esp.activo !== false);
    }
    return filtrados;
  }, [listaEspecialistas, isAdmin, esEmpleado]);

  return (
    <main style={{ backgroundColor: '#fcfaf7', minHeight: '100vh', padding: '100px 20px 60px' }}>
      <p style={styles.subtituloLabel}>PROFESIONALES A TU SERVICIO</p>
      <h2 style={styles.tituloPrincipal}>Nuestro Equipo</h2>
      
      <div style={styles.gridCards}>
        {especialistasAMostrar.map(esp => (
          <CardEspecialista 
            key={esp.id} 
            especialista={esp} 
            isAdmin={isAdmin || (esEmpleado && esp.id === idLogueado)}
            alVerHistorial={() => { setEspecialistaSeleccionado(esp); setCalendarioAbierto(true); }}
            alGestionarHorarios={() => { setEspecialistaSeleccionado(esp); setGestionAbierta(true); }}
            alVerHistorialDashboard={() => { setEspecialistaSeleccionado(esp); setHistorialAbierto(true); }}
            alEditar={() => { setEspecialistaAEditar(esp); setFormAbierto(true); }}
            alBorrar={() => setConfirmarEliminar({ visible: true, empleado: esp })}
            alCambiarPass={() => setPasswordModalAbierto(true)}
          />
        ))}
      </div>

      {formAbierto && (
        <ModalFormulario 
          alCerrar={() => {setFormAbierto(false); setEspecialistaAEditar(null);}} 
          alGuardar={guardarEmpleado} 
          especialistaAEditar={especialistaAEditar} 
        />
      )}

      {gestionAbierta && <ModalGestionarAgenda especialista={especialistaSeleccionado} alCerrar={() => setGestionAbierta(false)} />}

      {calendarioAbierto && (
        <ModalCalendario 
          especialista={especialistaSeleccionado} 
          servicio={servicioSeleccionado} 
          alCerrar={() => setCalendarioAbierto(false)} 
          alSeleccionarHorario={(fecha, hora) => {
            setDatosReservaTemporal({ fecha, hora });
            setIsBookingOpen(true);
          }}
        />
      )}

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        selectedTurno={datosReservaTemporal} 
        especialista={especialistaSeleccionado} 
        servicio={servicioSeleccionado} 
        onSuccess={() => { setIsBookingOpen(false); setCalendarioAbierto(false); }} 
      />

      {reporteAbierto && <ModalReporteGlobal alCerrar={() => setReporteAbierto(false)} />}
      {historialAbierto && <ModalHistorialEmpleado especialista={especialistaSeleccionado} alCerrar={() => setHistorialAbierto(false)} />}
      
      {confirmarEliminar.visible && (
        <ModalConfirmacionEliminar 
          nombre={confirmarEliminar.empleado.nombre} 
          alConfirmar={ejecutarEliminacion} 
          alCancelar={() => setConfirmarEliminar({ visible: false, empleado: null })} 
        />
      )}

      {/* 4. RENDERIZA EL MODAL DE PASSWORD AL FINAL */}
      {passwordModalAbierto && (
        <ModalPassword 
          alCerrar={() => setPasswordModalAbierto(false)} 
          setAlertaPadre={setAlerta} 
        />
      )}

      {alerta.visible && <AlertaPersonalizada mensaje={alerta.mensaje} alCerrar={() => setAlerta({visible: false, mensaje: ""})} />}
      
      {isAdmin && (
        <div style={styles.fabContainer}>
          <button style={styles.btnReporte} onClick={() => setReporteAbierto(true)}>📊 REPORTE GLOBAL</button>
          <button style={styles.btnAñadir} onClick={() => setFormAbierto(true)}>+</button>
        </div>
      )}
    </main>
  );
}

const styles = {
  subtituloLabel: { textAlign: 'center', color: '#bfa38a', letterSpacing: '3px', fontSize: '0.7rem', marginBottom: '10px', textTransform: 'uppercase' },
  tituloPrincipal: { textAlign: 'center', color: '#8c6d4f', marginBottom: '40px', fontSize: '2.5rem', fontFamily: "'Playfair Display', serif" },
  gridCards: { display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' },
  fabContainer: { position: 'fixed', bottom: '30px', left: '30px', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 1000 },
  btnReporte: { backgroundColor: '#fff', color: '#8c6d4f', border: '1px solid #f2e9e1', padding: '12px 20px', borderRadius: '25px', fontSize: '0.65rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  btnAñadir: { backgroundColor: '#c5a37d', color: 'white', border: 'none', width: '55px', height: '55px', borderRadius: '50%', fontSize: '2rem', cursor: 'pointer', boxShadow: '0 6px 20px rgba(197, 163, 125, 0.4)' },
  alertOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(5px)' },
  alertModal: { backgroundColor: '#fff', padding: '40px', borderRadius: '30px', width: '380px', textAlign: 'center', border: '1px solid #f2e9e1', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' },
  alertIcon: { width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #c5a37d', color: '#c5a37d', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', fontSize: '24px' },
  alertTitle: { color: '#8c6d4f', fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', marginBottom: '10px' },
  alertText: { color: '#bfa38a', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.5' },
  alertBtn: { backgroundColor: '#8c6d4f', color: 'white', border: 'none', padding: '12px 40px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '1px', marginTop: '10px' },
  btnCancelarAlerta: { backgroundColor: '#f5f5f5', color: '#777', border: 'none', padding: '12px 25px', borderRadius: '25px', cursor: 'pointer', marginRight: '10px' },
  btnConfirmarAlerta: { backgroundColor: '#a6835a', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '25px', cursor: 'pointer' }
};
