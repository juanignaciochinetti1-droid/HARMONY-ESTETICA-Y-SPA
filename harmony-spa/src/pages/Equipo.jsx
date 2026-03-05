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

export default function Equipo() {
  const location = useLocation();
  
  // --- CONFIGURACIÓN DE NEGOCIO ---
  const LIMITE_EMPLEADOS = 20;

  // 1. Estados de Modales
  const [formAbierto, setFormAbierto] = useState(false);
  const [gestionAbierta, setGestionAbierta] = useState(false);
  const [calendarioAbierto, setCalendarioAbierto] = useState(false);
  const [mostrarServicios, setMostrarServicios] = useState(false);
  const [reporteAbierto, setReporteAbierto] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historialAbierto, setHistorialAbierto] = useState(false);

  // 2. Estados de Datos
  const [listaEspecialistas, setListaEspecialistas] = useState([]);
  const [especialistaSeleccionado, setEspecialistaSeleccionado] = useState(null);
  const [especialistaAEditar, setEspecialistaAEditar] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [datosReservaTemporal, setDatosReservaTemporal] = useState(null);

  // 3. SEGURIDAD: Lógica de Rol e Identidad
  const rolGuardado = localStorage.getItem('harmony_rol');
  const idLogueado = localStorage.getItem('harmony_user_id'); 
  const isAdmin = rolGuardado !== null && rolGuardado === 'ADMIN';
  const esEmpleado = rolGuardado === 'EMPLEADO';

  const obtenerEspecialistas = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('rol', 'EMPLEADO');

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

  // --- FILTRADO DE VISTA ---
const especialistasAMostrar = useMemo(() => {
  if (isAdmin || esEmpleado) {
    // Tanto el Admin como el Empleado ven a todo el equipo
    return listaEspecialistas;
  } else {
    // El CLIENTE ve solo a los que están activos
    return listaEspecialistas.filter(esp => esp.activo !== false);
  }
}, [isAdmin, esEmpleado, listaEspecialistas]);
  // --- FUNCIONES DE NEGOCIO ---

  const abrirFlujoReserva = (especialista) => {
    setEspecialistaSeleccionado(especialista);
    setCalendarioAbierto(true);
  };

  const verHistorialEmpleado = (especialista) => {
    setEspecialistaSeleccionado(especialista);
    setHistorialAbierto(true);
  };

  const manejarServicioElegido = (servicio) => {
    setServicioSeleccionado(servicio);
    setMostrarServicios(false);
    setCalendarioAbierto(true);
  };

  const borrarEspecialista = async (id) => {
    if (window.confirm("¿Deseas eliminar este especialista? Esto borrará su acceso al sistema.")) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (!error) setListaEspecialistas(listaEspecialistas.filter(esp => esp.id !== id));
      else alert("Error al borrar: " + error.message);
    }
  };

  const guardarCambios = async (datos) => {
    try {
      const partes = datos.nombre.split(' ');
      const nombre = partes[0];
      const apellido = partes.slice(1).join(' ') || '';
      
      const payload = {
        nombre, apellido, email: datos.email, telefono: datos.telefono,
        especialidad: datos.especialidad, activo: datos.activo, foto_url: datos.foto
      };

      if (especialistaAEditar) {
        const { data, error } = await supabase
          .from('users')
          .update(payload)
          .eq('id', especialistaAEditar.id)
          .select();

        if (error) throw error;
        setListaEspecialistas(listaEspecialistas.map(esp => esp.id === especialistaAEditar.id ? data[0] : esp));
      } else {
        if (listaEspecialistas.length >= LIMITE_EMPLEADOS) {
          alert(`Límite alcanzado. Solo puedes tener ${LIMITE_EMPLEADOS} empleados.`);
          return;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: datos.email,
          password: datos.password,
          options: { data: { nombre, rol: 'EMPLEADO' } }
        });

        if (authError) throw authError;

        setTimeout(() => obtenerEspecialistas(), 1000);
        alert("¡Empleado creado con éxito!");
      }

      setFormAbierto(false);
      setEspecialistaAEditar(null);
    } catch (error) {
      alert("Error en la operación: " + error.message);
    }
  };

  const cerrarModalForm = () => {
    setFormAbierto(false);
    setEspecialistaAEditar(null);
  };

  return (
    <main style={{ backgroundColor: '#f5eee6', minHeight: '100vh', padding: '60px 20px' }}>
      <p style={styles.subtituloLabel}>PROFESIONALES A TU SERVICIO</p>
      <h2 style={styles.tituloPrincipal}>
  {esEmpleado ? 'Nuestro Equipo Profesional' : 'Nuestro Equipo'}
</h2>
      
      {isAdmin && (
        <p style={styles.contadorCupos}>
          Cupos ocupados: <strong>{listaEspecialistas.length} de {LIMITE_EMPLEADOS}</strong>
        </p>
      )}

      <div style={styles.gridCards}>
  {especialistasAMostrar.map(esp => (
    <CardEspecialista 
      key={esp.id} 
      especialista={esp} 
      // LÓGICA DE PERMISOS:
      // Es admin si tiene el rol ADMIN 
      // O si es EMPLEADO y el ID de la card coincide con su ID de login
      isAdmin={isAdmin || (esEmpleado && esp.id === idLogueado)}
      
      alVerHistorial={() => abrirFlujoReserva(esp)} 
      alGestionarHorarios={() => { setEspecialistaSeleccionado(esp); setGestionAbierta(true); }}
      alVerHistorialDashboard={() => verHistorialEmpleado(esp)} 
      alBorrar={borrarEspecialista}
      alEditar={() => { setEspecialistaAEditar(esp); setFormAbierto(true); }}
    />
  ))}
</div>

      {/* --- MODALES --- */}
      {mostrarServicios && (
        <ModalServicios alCerrar={() => setMostrarServicios(false)} alSeleccionar={manejarServicioElegido} />
      )}

      {calendarioAbierto && (
        <ModalCalendario 
          especialista={especialistaSeleccionado} 
          servicio={servicioSeleccionado}
          alCerrar={() => setCalendarioAbierto(false)} 
          alSeleccionarHorario={(fecha, hora) => {
            if (!servicioSeleccionado) {
              alert("Por favor, selecciona un servicio primero.");
              setCalendarioAbierto(false);
              setMostrarServicios(true);
              return;
            }
            setDatosReservaTemporal({ fecha, hora });
            setIsModalOpen(true);
          }}
        />
      )}

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedTurno={datosReservaTemporal}
        especialista={especialistaSeleccionado}
        servicio={servicioSeleccionado}
        onSuccess={() => { 
          setIsModalOpen(false);
          setCalendarioAbierto(false);
        }}
      />

      {formAbierto && (
        <ModalFormulario 
          alCerrar={cerrarModalForm} 
          alGuardar={guardarCambios} 
          especialistaAEditar={especialistaAEditar} 
        />
      )}
      
      {gestionAbierta && (
        <ModalGestionarAgenda especialista={especialistaSeleccionado} alCerrar={() => setGestionAbierta(false)} />
      )}

      {/* --- ACCIONES ADMIN --- */}
      {isAdmin && (
        <div style={styles.fabContainer}>
          <button style={styles.btnReporte} onClick={() => setReporteAbierto(true)}>
            REPORTE GLOBAL
          </button>
          
          <button 
            style={{
              ...styles.btnAñadir,
              backgroundColor: listaEspecialistas.length >= LIMITE_EMPLEADOS ? '#ccc' : '#c5a37d',
              cursor: listaEspecialistas.length >= LIMITE_EMPLEADOS ? 'not-allowed' : 'pointer'
            }} 
            onClick={() => {
              if (listaEspecialistas.length < LIMITE_EMPLEADOS) {
                setEspecialistaAEditar(null);
                setFormAbierto(true);
              } else {
                alert("Has alcanzado el límite de empleados permitido.");
              }
            }}
          >
            +
          </button>
        </div>
      )}

      {reporteAbierto && <ModalReporteGlobal alCerrar={() => setReporteAbierto(false)} />}
      {historialAbierto && (
        <ModalHistorialEmpleado especialista={especialistaSeleccionado} alCerrar={() => setHistorialAbierto(false)} />
      )}
    </main>
  );
}

const styles = {
  subtituloLabel: { textAlign: 'center', color: '#bfa38a', letterSpacing: '3px', fontSize: '0.7rem', marginBottom: '10px' },
  tituloPrincipal: { textAlign: 'center', color: '#8c6d4f', marginBottom: '10px', fontWeight: '300', fontSize: '2rem', fontFamily: "'Playfair Display', serif" },
  contadorCupos: { textAlign: 'center', color: '#a6835a', fontSize: '0.75rem', marginBottom: '30px', letterSpacing: '1px' },
  gridCards: { display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' },
  fabContainer: { position: 'fixed', bottom: '30px', left: '30px', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 1000 },
  btnReporte: { backgroundColor: '#fff', color: '#8c6d4f', border: '1px solid #f2e9e1', padding: '12px 20px', borderRadius: '25px', fontSize: '0.65rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', letterSpacing: '1px' },
  btnAñadir: { 
    color: 'white', 
    border: 'none', 
    width: '55px', 
    height: '55px', 
    borderRadius: '50%', 
    fontSize: '2rem', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    boxShadow: '0 6px 20px rgba(197, 163, 125, 0.4)', 
    transition: 'all 0.3s ease' 
  }
};