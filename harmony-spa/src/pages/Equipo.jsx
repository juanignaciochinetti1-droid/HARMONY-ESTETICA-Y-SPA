import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// Componentes
import CardEspecialista from '../components/Especialistas/CardEspecialista';
import ModalAgenda from '../components/Especialistas/ModalAgenda';
import ModalFormulario from '../components/Especialistas/ModalFormulario';
import ModalGestionarAgenda from '../components/Especialistas/ModalGestionarAgenda';
import ModalCalendario from '../components/Especialistas/ModalCalendario';
import ModalServicios from '../components/Servicios/ModalServicios';
import ModalReporteGlobal from '../components/Especialistas/ModalReporteGlobal';
import BookingModal from '../components/Modals/BookingModal';
import ModalHistorialEmpleado from '../components/Especialistas/ModalHistorialEmpleado';

// --- COMPONENTE DE ALERTA INTERNO ---
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

// --- NUEVO COMPONENTE: MODAL DE CAMBIO DE CONTRASEÑA ---
const ModalPassword = ({ alCerrar, mostrarError }) => {
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleActualizar = async (e) => {
    e.preventDefault();
    if (password.length < 6) return mostrarError("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirmar) return mostrarError("Las contraseñas no coinciden.");

    setCargando(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      mostrarError("Error: " + error.message);
    } else {
      mostrarError("¡Contraseña actualizada con éxito!");
      alCerrar();
    }
    setCargando(false);
  };

  return (
    <div style={styles.alertOverlay}>
      <div style={styles.alertModal}>
        <div style={styles.alertIcon}>🔑</div>
        <h3 style={styles.alertTitle}>Seguridad</h3>
        <p style={styles.alertText}>Actualiza tu clave de acceso al sistema.</p>
        <form onSubmit={handleActualizar}>
          <input 
            type="password" 
            placeholder="Nueva contraseña" 
            style={styles.inputPass} 
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Confirmar contraseña" 
            style={styles.inputPass} 
            onChange={(e) => setConfirmar(e.target.value)}
            required 
          />
          <button type="submit" disabled={cargando} style={styles.alertBtn}>
            {cargando ? 'ACTUALIZANDO...' : 'GUARDAR CAMBIOS'}
          </button>
          <button type="button" onClick={alCerrar} style={styles.btnCerrarPass}>Cancelar</button>
        </form>
      </div>
    </div>
  );
};

export default function Equipo() {
  const location = useLocation();
  const LIMITE_EMPLEADOS = 20;

  // 1. Estados de Modales
  const [formAbierto, setFormAbierto] = useState(false);
  const [gestionAbierta, setGestionAbierta] = useState(false);
  const [calendarioAbierto, setCalendarioAbierto] = useState(false);
  const [mostrarServicios, setMostrarServicios] = useState(false);
  const [reporteAbierto, setReporteAbierto] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historialAbierto, setHistorialAbierto] = useState(false);
  const [passwordModalAbierto, setPasswordModalAbierto] = useState(false);
  const [alerta, setAlerta] = useState({ visible: false, mensaje: "" });

  // 2. Estados de Datos
  const [listaEspecialistas, setListaEspecialistas] = useState([]);
  const [especialistaSeleccionado, setEspecialistaSeleccionado] = useState(null);
  const [especialistaAEditar, setEspecialistaAEditar] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [datosReservaTemporal, setDatosReservaTemporal] = useState(null);

  // 3. SEGURIDAD
  const rolGuardado = localStorage.getItem('harmony_rol');
  const idLogueado = localStorage.getItem('harmony_user_id'); 
  const isAdmin = rolGuardado === 'ADMIN';
  const esEmpleado = rolGuardado === 'EMPLEADO';

  const mostrarError = (msg) => setAlerta({ visible: true, mensaje: msg });

  const obtenerEspecialistas = async () => {
    const { data, error } = await supabase.from('users').select('*').eq('rol', 'EMPLEADO');
    if (error) console.error("Error al obtener especialistas:", error.message);
    else setListaEspecialistas(data);
  };

  useEffect(() => {
    obtenerEspecialistas();
    if (location.state?.abrirCalendario) {
      setServicioSeleccionado(location.state.servicioElegido);
      setEspecialistaSeleccionado(location.state.especialistaElegido);
      setCalendarioAbierto(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const especialistasAMostrar = useMemo(() => {
    if (isAdmin || esEmpleado) return listaEspecialistas;
    return listaEspecialistas.filter(esp => esp.activo !== false);
  }, [isAdmin, esEmpleado, listaEspecialistas]);

  // --- FUNCIONES DE NEGOCIO ---
  const abrirFlujoReserva = (esp) => { setEspecialistaSeleccionado(esp); setCalendarioAbierto(true); };
  const verHistorialEmpleado = (esp) => { setEspecialistaSeleccionado(esp); setHistorialAbierto(true); };
  const manejarServicioElegido = (ser) => { setServicioSeleccionado(ser); setMostrarServicios(false); setCalendarioAbierto(true); };

  const borrarEspecialista = async (id) => {
    if (window.confirm("¿Deseas eliminar este especialista?")) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (!error) setListaEspecialistas(listaEspecialistas.filter(esp => esp.id !== id));
      else mostrarError("Error al borrar: " + error.message);
    }
  };

  // --- DENTRO DE Equipo.jsx ---

const guardarCambios = async (datos) => {
  try {
    // 1. Normalización de datos
    const nombreNormalizado = datos.nombre.trim();
    const apellidoNormalizado = datos.apellido.trim();
    const dniNormalizado = datos.dni?.trim();
    const emailNormalizado = datos.email.trim().toLowerCase();

    // 2. VERIFICACIÓN DE DUPLICADOS (Local para respuesta rápida)
    
    // Duplicado de Identidad (Nombre + Apellido)
    const existeNombreApellido = listaEspecialistas.some(esp => 
      esp.id !== especialistaAEditar?.id && 
      esp.nombre.toLowerCase() === nombreNormalizado.toLowerCase() &&
      esp.apellido.toLowerCase() === apellidoNormalizado.toLowerCase()
    );

    if (existeNombreApellido) {
      return mostrarError(`Ya existe un profesional registrado como ${nombreNormalizado} ${apellidoNormalizado}.`);
    }

    // Duplicado de DNI
    const existeDNI = listaEspecialistas.some(esp => 
      esp.id !== especialistaAEditar?.id && 
      esp.dni === dniNormalizado
    );

    if (existeDNI) {
      return mostrarError(`El DNI ${dniNormalizado} ya se encuentra en nuestra base de datos.`);
    }

    // Duplicado de Email
    const existeEmail = listaEspecialistas.some(esp => 
      esp.id !== especialistaAEditar?.id && 
      esp.email.toLowerCase() === emailNormalizado
    );

    if (existeEmail) {
      return mostrarError(`El correo ${emailNormalizado} ya está asignado a otro perfil.`);
    }

    // 3. PREPARACIÓN DEL PAYLOAD (Nombres exactos de tus columnas SQL)
    const payload = {
      nombre: nombreNormalizado,
      apellido: apellidoNormalizado,
      email: emailNormalizado,
      telefono: datos.telefono,
      especialidad: datos.especialidad, // Aquí se guarda lo que saldrá en la Card
      activo: datos.activo,
      foto_url: datos.foto, // React usa 'foto', Supabase usa 'foto_url'
      dni: dniNormalizado 
    };

    if (especialistaAEditar) {
      // --- LÓGICA DE EDICIÓN ---
      const { data, error } = await supabase
        .from('users')
        .update(payload)
        .eq('id', especialistaAEditar.id)
        .select();

      if (error) throw error;
      
      // Actualizamos el estado local para que la Card cambie al instante
      setListaEspecialistas(listaEspecialistas.map(esp => 
        esp.id === especialistaAEditar.id ? data[0] : esp
      ));
      
      mostrarError("Perfil actualizado con éxito.");

    } else {
      // --- LÓGICA DE CREACIÓN (NUEVO EMPLEADO) ---
      if (listaEspecialistas.length >= LIMITE_EMPLEADOS) {
        return mostrarError("Límite de staff alcanzado.");
      }

      // ... dentro de guardarCambios en el bloque 'else' (nuevo empleado)
// Dentro de tu función guardarCambios...
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: emailNormalizado,
  password: datos.password,
  options: { 
    data: { 
      nombre: nombreNormalizado, 
      apellido: apellidoNormalizado,
      especialidad: datos.especialidad,
      dni: dniNormalizado,
      telefono: datos.telefono, // <--- DEBE COINCIDIR CON EL ->>'telefono' DEL SQL
      rol: 'EMPLEADO' 
    } 
  }
});

      if (authError) throw authError;

      // El trigger 'handle_new_user' de tu SQL se encargará de insertar en public.users
      // pero como a veces tarda un segundo, refrescamos la lista
      setTimeout(() => obtenerEspecialistas(), 1500);
      mostrarError("¡Acceso creado! El empleado ya puede loguearse.");
    }

    // Limpieza de estados y cierre de modal
    setFormAbierto(false);
    setEspecialistaAEditar(null);

  } catch (error) { 
    mostrarError("No se pudo completar la operación: " + error.message); 
  }
};

  return (
    <main style={{ backgroundColor: '#f5eee6', minHeight: '100vh', padding: '60px 20px' }}>
      <p style={styles.subtituloLabel}>PROFESIONALES A TU SERVICIO</p>
      <h2 style={styles.tituloPrincipal}>{esEmpleado ? 'Nuestro Equipo Profesional' : 'Nuestro Equipo'}</h2>
      
      {isAdmin && (
        <p style={styles.contadorCupos}>Cupos ocupados: <strong>{listaEspecialistas.length} de {LIMITE_EMPLEADOS}</strong></p>
      )}

      <div style={styles.gridCards}>
        {especialistasAMostrar.map(esp => (
          <CardEspecialista 
            key={esp.id} 
            especialista={esp} 
            isAdmin={isAdmin || (esEmpleado && esp.id === idLogueado)}
            alVerHistorial={() => abrirFlujoReserva(esp)} 
            alGestionarHorarios={() => { setEspecialistaSeleccionado(esp); setGestionAbierta(true); }}
            alVerHistorialDashboard={() => verHistorialEmpleado(esp)} 
            alBorrar={borrarEspecialista}
            alEditar={() => { setEspecialistaAEditar(esp); setFormAbierto(true); }}
            alCambiarPass={() => setPasswordModalAbierto(true)} 
          />
        ))}
      </div>

      {/* MODALES */}
      {mostrarServicios && <ModalServicios alCerrar={() => setMostrarServicios(false)} alSeleccionar={manejarServicioElegido} />}
      
      {calendarioAbierto && (
        <ModalCalendario 
          especialista={especialistaSeleccionado} servicio={servicioSeleccionado}
          alCerrar={() => setCalendarioAbierto(false)} 
          alSeleccionarHorario={(fecha, hora) => {
            if (!servicioSeleccionado) {
              mostrarError("Selecciona un servicio primero.");
              setCalendarioAbierto(false); setMostrarServicios(true); return;
            }
            setDatosReservaTemporal({ fecha, hora }); setIsModalOpen(true);
          }}
        />
      )}

      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} selectedTurno={datosReservaTemporal} especialista={especialistaSeleccionado} servicio={servicioSeleccionado} onSuccess={() => { setIsModalOpen(false); setCalendarioAbierto(false); }} />

      {formAbierto && <ModalFormulario alCerrar={() => {setFormAbierto(false); setEspecialistaAEditar(null);}} alGuardar={guardarCambios} especialistaAEditar={especialistaAEditar} />}
      
      {gestionAbierta && <ModalGestionarAgenda especialista={especialistaSeleccionado} alCerrar={() => setGestionAbierta(false)} />}

      {/* MODAL CAMBIO PASSWORD */}
      {passwordModalAbierto && <ModalPassword alCerrar={() => setPasswordModalAbierto(false)} mostrarError={mostrarError} />}

      {/* ALERTA PERSONALIZADA */}
      {alerta.visible && <AlertaPersonalizada mensaje={alerta.mensaje} alCerrar={() => setAlerta({ visible: false, mensaje: "" })} />}

      {isAdmin && (
        <div style={styles.fabContainer}>
          <button style={styles.btnReporte} onClick={() => setReporteAbierto(true)}>REPORTE GLOBAL</button>
          <button style={{...styles.btnAñadir, backgroundColor: listaEspecialistas.length >= LIMITE_EMPLEADOS ? '#ccc' : '#c5a37d', cursor: listaEspecialistas.length >= LIMITE_EMPLEADOS ? 'not-allowed' : 'pointer'}} onClick={() => { if (listaEspecialistas.length < LIMITE_EMPLEADOS) { setEspecialistaAEditar(null); setFormAbierto(true); } else { mostrarError("Límite alcanzado."); } }}>+</button>
        </div>
      )}

      {reporteAbierto && <ModalReporteGlobal alCerrar={() => setReporteAbierto(false)} />}
      {historialAbierto && <ModalHistorialEmpleado especialista={especialistaSeleccionado} alCerrar={() => setHistorialAbierto(false)} />}
    </main>
  );
}

const styles = {
  // ... (Tus estilos anteriores se mantienen igual)
  subtituloLabel: { textAlign: 'center', color: '#bfa38a', letterSpacing: '3px', fontSize: '0.7rem', marginBottom: '10px' },
  tituloPrincipal: { textAlign: 'center', color: '#8c6d4f', marginBottom: '10px', fontWeight: '300', fontSize: '2rem', fontFamily: "'Playfair Display', serif" },
  contadorCupos: { textAlign: 'center', color: '#a6835a', fontSize: '0.75rem', marginBottom: '30px', letterSpacing: '1px' },
  gridCards: { display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' },
  fabContainer: { position: 'fixed', bottom: '30px', left: '30px', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 1000 },
  btnReporte: { backgroundColor: '#fff', color: '#8c6d4f', border: '1px solid #f2e9e1', padding: '12px 20px', borderRadius: '25px', fontSize: '0.65rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', letterSpacing: '1px' },
  btnAñadir: { color: 'white', border: 'none', width: '55px', height: '55px', borderRadius: '50%', fontSize: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 6px 20px rgba(197, 163, 125, 0.4)', transition: 'all 0.3s ease' },
  
  // ESTILOS ALERTA Y PASS
  alertOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(5px)' },
  alertModal: { backgroundColor: '#fff', padding: '45px 40px', borderRadius: '40px', width: '420px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', border: '1px solid #f2e9e1' },
  alertIcon: { width: '65px', height: '65px', borderRadius: '50%', border: '2px solid #c5a37d', color: '#c5a37d', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', margin: '0 auto 25px', fontWeight: 'bold' },
  alertTitle: { color: '#8c6d4f', fontFamily: "'Playfair Display', serif", marginBottom: '15px', fontSize: '1.8rem' },
  alertText: { color: '#bfa38a', fontSize: '1.05rem', marginBottom: '35px', lineHeight: '1.6' },
  alertBtn: { backgroundColor: '#a6835a', color: 'white', border: 'none', padding: '14px 45px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px' },
  
  // ESTILOS ESPECÍFICOS PARA PASS
  inputPass: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #f2e9e1', boxSizing: 'border-box' },
  btnCerrarPass: { background: 'none', border: 'none', color: '#bfa38a', marginTop: '15px', cursor: 'pointer', display: 'block', width: '100%', fontSize: '0.8rem' }
};