import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

// Antes: const BookingModal = ({ isOpen, onClose, selectedTurno, especialista, servicio }) => {
// Después:
const BookingModal = ({ isOpen, onClose, selectedTurno, especialista, servicio, onSuccess }) => {
  // 1. Hooks siempre arriba
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', telefono: '', email: '' });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  // 2. Condición de renderizado (DESPUÉS de los hooks)
  if (!isOpen) return null;

  const handleFinalizarReserva = async () => {
  setLoading(true);
  try {
    // 1. Lógica de Cliente: Buscar
    // Usamos maybeSingle() para que no dé error 406 si no existe
    let { data: cliente, error: errorBusqueda } = await supabase
      .from('users')
      .select('id')
      .eq('email', formData.email)
      .maybeSingle();

    let clienteId = cliente?.id;

    // 2. Si el cliente NO existe, lo creamos
    if (!clienteId) {
      const partes = formData.nombre.trim().split(" ");
      const nombreSolo = partes[0] || "Cliente";
      const apellidoSolo = partes.slice(1).join(" ") || "Nuevo";

      const { data: nuevo, error: errorCreacion } = await supabase
        .from('users')
        .insert([{ 
          nombre: nombreSolo, 
          apellido: apellidoSolo, 
          email: formData.email, 
          telefono: formData.telefono, 
          rol: 'CLIENTE',
          password_hash: 'invitado_spa', // Valor por defecto para el NOT NULL
          activo: true 
        }])
        .select()
        .single();
      
      if (errorCreacion) throw errorCreacion;
      clienteId = nuevo.id;
    }

    // 3. Insertar el Turno (ahora que tenemos el clienteId sí o sí)
    const { error: errorTurno } = await supabase.from('turnos').insert([{
      cliente_id: clienteId,
      empleado_id: especialista.id,
      servicio_id: servicio.id,
      fecha: selectedTurno.fecha,
      hora: selectedTurno.hora,
      estado: 'PENDIENTE'
    }]);

    if (errorTurno) throw errorTurno;

    // 4. Pasar al paso de éxito
    setStep(3); 

  } catch (e) {
    console.error("Error completo:", e);
    alert("No pudimos agendar tu turno: " + (e.message || "Error desconocido"));
  } finally {
    setLoading(false);
  }
};

  // --- CAMBIO AQUÍ: Función para cerrar todo al final ---
  const cerrarTodoAlFinalizar = () => {
    if (onSuccess) {
      onSuccess(); // Esto cerrará el BookingModal Y el Calendario en Equipo.jsx
    } else {
      onClose();
    }
  }

  const generarLinkWhatsApp = () => {
  const numeroTelefono = "543537XXXXXX"; // Tu número real aquí
  const mensaje = `¡Hola Harmony! Soy ${formData.nombre}. Acabo de transferir la seña para mi turno de ${servicio?.nombre} (${selectedTurno?.fecha} a las ${selectedTurno?.hora}hs). ¡Adjunto el comprobante! ✨`;
  
  return `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`;
};

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        
        {/* PASO 1: VERIFICA TU TURNO */}
        {step === 1 && (
          <div style={styles.container}>
            <h2 style={styles.tituloDorado}>Verifica tu Turno</h2>
            <p style={styles.subtitulo}>Confirma que los detalles sean correctos.</p>
            
            <div style={styles.cajaDatos}>
              <p style={styles.dato}>✨ <strong>Servicio:</strong> {servicio?.nombre}</p>
              <p style={styles.dato}>👤 <strong>Especialista:</strong> {especialista?.nombre}</p>
              <p style={styles.dato}>📅 <strong>Fecha:</strong> {selectedTurno?.fecha}</p>
              <p style={styles.dato}>⏰ <strong>Hora:</strong> {selectedTurno?.hora} hs</p>
            </div>

            <div style={styles.flexButtons}>
              <button style={styles.btnSecundario} onClick={onClose}>MODIFICAR</button>
              <button style={styles.btnPrimario} onClick={() => setStep(2)}>ES CORRECTO</button>
            </div>
          </div>
        )}

        {/* PASO 2: FORMULARIO DE DATOS */}
        {step === 2 && (
          <div style={styles.container}>
            <h2 style={styles.tituloDorado}>Tus Datos</h2>
            <p style={styles.subtitulo}>Necesitamos estos datos para agendarte.</p>
            <div style={styles.form}>
              <input style={styles.input} placeholder="Nombre completo" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              <input style={styles.input} placeholder="Teléfono" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
              <input style={styles.input} placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div style={styles.flexButtons}>
              <button style={styles.btnSecundario} onClick={() => setStep(1)}>ATRÁS</button>
              <button style={styles.btnPrimario} onClick={handleFinalizarReserva} disabled={loading}>
                {loading ? 'PROCESANDO...' : 'CONFIRMAR'}
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: ÉXITO TOTAL */}
{step === 3 && (
  <div style={{ ...styles.container, textAlign: 'center' }}>
    <div style={styles.circuloExito}>✓</div>
    <h2 style={styles.tituloDorado}>¡Reserva Registrada!</h2>
    <p style={styles.subtitulo}>Para confirmar tu turno, por favor realiza la transferencia de la seña:</p>

    {/* CAJA DE DATOS BANCARIOS */}
    <div style={styles.cajaBanco}>
      <p style={styles.datoBanco}><strong>Alias:</strong> HARMONY.SPA.SPA</p>
      <p style={styles.datoBanco}><strong>CBU:</strong> 00000031000XXXXXXXXX</p>
      <p style={styles.datoBanco}><strong>Titular:</strong> Nombre del Administrador</p>
      <div style={styles.montoSeña}>Monto seña: $5.000</div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
      <a 
        href={generarLinkWhatsApp()} 
        target="_blank" 
        rel="noopener noreferrer" 
        style={styles.btnWhatsApp}
      >
        📱 ENVIAR COMPROBANTE POR WHATSAPP
      </a>

      <button style={styles.btnFinalizarSimple} onClick={cerrarTodoAlFinalizar}>
        Ya envié el comprobante / Salir
      </button>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modal: { backgroundColor: '#fff', padding: '40px', borderRadius: '30px', width: '90%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
  tituloDorado: { color: '#a6835a', fontFamily: 'serif', fontSize: '1.8rem', marginBottom: '10px', textAlign: 'center' },
  subtitulo: { color: '#888', fontSize: '0.85rem', marginBottom: '25px', textAlign: 'center' },
  cajaDatos: { backgroundColor: '#fdfbf9', padding: '20px', borderRadius: '20px', border: '1px solid #f2e9e1', marginBottom: '25px' },
  dato: { margin: '10px 0', color: '#8c6d4f', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #eee', fontSize: '0.9rem' },
  flexButtons: { display: 'flex', gap: '15px' },
  btnPrimario: { flex: 1, backgroundColor: '#a6835a', color: '#fff', border: 'none', padding: '14px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' },
  btnSecundario: { flex: 1, backgroundColor: '#f5f5f5', color: '#666', border: 'none', padding: '14px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' },
  circuloExito: { width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#fdfbf9', border: '3px solid #a6835a', color: '#a6835a', fontSize: '2.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px' },circuloExito: {
    width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e8f5e9',
    color: '#2e7d32', fontSize: '2rem', display: 'flex', alignItems: 'center',
    justifyContent: 'center', margin: '0 auto 20px auto'
  },
  btnWhatsApp: {
    backgroundColor: '#25D366', color: 'white', textDecoration: 'none',
    padding: '15px 20px', borderRadius: '50px', fontWeight: 'bold',
    fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)',
    display: 'block', transition: '0.3s'
  },
  btnFinalizarSimple: {
    background: 'none', border: 'none', color: '#8c6d4f', cursor: 'pointer',
    fontSize: '0.8rem', textDecoration: 'underline'
  }
};

export default BookingModal;