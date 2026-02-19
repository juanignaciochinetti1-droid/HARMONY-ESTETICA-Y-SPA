import React, { useState, useEffect } from 'react';
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
  
  // 1. Estados
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formAbierto, setFormAbierto] = useState(false);
  const [gestionAbierta, setGestionAbierta] = useState(false);
  const [calendarioAbierto, setCalendarioAbierto] = useState(false);
  const [mostrarServicios, setMostrarServicios] = useState(false);
  const [reporteAbierto, setReporteAbierto] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [datosReservaTemporal, setDatosReservaTemporal] = useState(null);
  const [historialAbierto, setHistorialAbierto] = useState(false);

  const [listaEspecialistas, setListaEspecialistas] = useState([]);
  const [especialistaSeleccionado, setEspecialistaSeleccionado] = useState(null);
  const [especialistaAEditar, setEspecialistaAEditar] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

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
    if (window.confirm("¿Deseas eliminar este especialista?")) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (!error) setListaEspecialistas(listaEspecialistas.filter(esp => esp.id !== id));
    }
  };

  const guardarCambios = async (datos) => {
    const partes = datos.nombre.split(' ');
    const nombre = partes[0];
    const apellido = partes.slice(1).join(' ') || '';
    
    const payload = {
      nombre, apellido, email: datos.email, telefono: datos.telefono,
      especialidad: datos.especialidad, activo: datos.activo, foto_url: datos.foto
    };

    if (especialistaAEditar) {
      const { data, error } = await supabase.from('users').update(payload).eq('id', especialistaAEditar.id).select();
      if (!error) {
        setListaEspecialistas(listaEspecialistas.map(esp => esp.id === especialistaAEditar.id ? data[0] : esp));
        setFormAbierto(false);
        setEspecialistaAEditar(null);
      }
    } else {
      const { data, error } = await supabase.from('users').insert([{...payload, rol: 'EMPLEADO', password_hash: '123456'}]).select();
      if (!error) {
        setListaEspecialistas([...listaEspecialistas, data[0]]);
        setFormAbierto(false);
      }
    }
  };

  return (
    <main style={{ backgroundColor: '#f5eee6', minHeight: '100vh', padding: '60px 20px' }}>
      <p style={styles.subtituloLabel}>PROFESIONALES A TU SERVICIO</p>
      <h2 style={styles.tituloPrincipal}>Nuestro Equipo</h2>
      
      <div style={styles.gridCards}>
        {listaEspecialistas.map(esp => (
          <CardEspecialista 
            key={esp.id} 
            especialista={esp} 
            alVerHistorial={() => abrirFlujoReserva(esp)} 
            alGestionarHorarios={() => { setEspecialistaSeleccionado(esp); setGestionAbierta(true); }}
            alVerHistorialDashboard={() => verHistorialEmpleado(esp)} 
            alBorrar={borrarEspecialista}
            alEditar={() => { setEspecialistaAEditar(esp); setFormAbierto(true); }}
          />
        ))}
      </div>

      {mostrarServicios && (
        <ModalServicios 
          alCerrar={() => setMostrarServicios(false)}
          alSeleccionar={manejarServicioElegido}
        />
      )}

      {/* MODAL CALENDARIO: Ahora no se cierra al pasar al siguiente paso */}
      {calendarioAbierto && (
        <ModalCalendario 
          especialista={especialistaSeleccionado} 
          servicio={servicioSeleccionado}
          alCerrar={() => setCalendarioAbierto(false)} 
          alSeleccionarHorario={(fecha, hora) => {
            if (!servicioSeleccionado) {
              alert("¡Espera! Primero debes elegir un servicio.");
              setCalendarioAbierto(false);
              setMostrarServicios(true);
              return;
            }
            setDatosReservaTemporal({ fecha, hora });
            // MODIFICACIÓN: Ya no cerramos el calendario aquí.
            // Así, si el usuario cierra el BookingModal para "Modificar", el calendario sigue abierto.
            setIsModalOpen(true);
          }}
        />
      )}

      {/* MODAL DE RESERVA */}
      <BookingModal 
        key={datosReservaTemporal ? `${datosReservaTemporal.fecha}-${datosReservaTemporal.hora}` : 'booking-cerrado'}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} // Si cierra aquí para modificar, vuelve al calendario que quedó abierto atrás
        selectedTurno={datosReservaTemporal}
        especialista={especialistaSeleccionado}
        servicio={servicioSeleccionado}
        onSuccess={() => { 
          // Solo cerramos todo cuando la reserva es exitosa
          setIsModalOpen(false);
          setCalendarioAbierto(false);
        }}
      />

      {modalAbierto && <ModalAgenda especialista={especialistaSeleccionado} alCerrar={() => setModalAbierto(false)} />}
      {formAbierto && <ModalFormulario alCerrar={() => {setFormAbierto(false); setEspecialistaAEditar(null);}} alGuardar={guardarCambios} especialistaAEditar={especialistaAEditar} />}
      {gestionAbierta && <ModalGestionarAgenda especialista={especialistaSeleccionado} alCerrar={() => setGestionAbierta(false)} />}

      <div style={styles.fabContainer}>
        <button style={styles.btnReporte} onClick={() => setReporteAbierto(true)}>
          REPORTE GLOBAL
        </button>
        <button style={styles.btnAñadir} onClick={() => setFormAbierto(true)}>+</button>
      </div>

      {reporteAbierto && (
        <ModalReporteGlobal alCerrar={() => setReporteAbierto(false)} />
      )}

      {historialAbierto && (
        <ModalHistorialEmpleado 
          especialista={especialistaSeleccionado} 
          alCerrar={() => setHistorialAbierto(false)} 
        />
      )}
    </main>
  );
}

const styles = {
  subtituloLabel: { textAlign: 'center', color: '#bfa38a', letterSpacing: '3px', fontSize: '0.7rem', marginBottom: '10px' },
  tituloPrincipal: { textAlign: 'center', color: '#8c6d4f', marginBottom: '40px', fontWeight: '300', fontSize: '2rem' },
  gridCards: { display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' },
  fabContainer: { position: 'fixed', bottom: '30px', left: '30px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 1000 },
  btnReporte: { backgroundColor: '#fff', color: '#8c6d4f', border: '1px solid #f2e9e1', padding: '8px 18px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  btnAñadir: { backgroundColor: '#8c6d4f', color: 'white', border: 'none', width: '50px', height: '50px', borderRadius: '50%', fontSize: '1.8rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 6px 20px rgba(140, 109, 79, 0.3)' }
};