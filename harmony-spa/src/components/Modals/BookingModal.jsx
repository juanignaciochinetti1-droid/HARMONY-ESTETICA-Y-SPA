import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Importante para recibir el ID
import { supabase } from '../../lib/supabaseClient';

const BookingModal = ({ isOpen, onClose, selectedTurno, especialista, servicio, onSuccess }) => {
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', telefono: '', email: '' });

  // Capturamos si viene de una reprogramación desde el estado de la ruta
  const reprogramandoId = location.state?.reprogramandoId;

  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validarPaso2 = () => {
    const { nombre, telefono, email } = formData;
    if (!nombre.trim()) {
      alert("Por favor, ingresa tu nombre completo.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      alert("Por favor, ingresa un correo electrónico válido.");
      return false;
    }
    if (telefono.length < 8) {
      alert("El teléfono debe tener al menos 8 números.");
      return false;
    }
    return true;
  };

  const handleFinalizarReserva = async () => {
    if (!validarPaso2()) return;

    setLoading(true);
    try {
      const emailLimpio = formData.email.trim().toLowerCase();
      
      // 1. Lógica de Cliente (Buscar o Crear)
      let { data: cliente } = await supabase
        .from('users')
        .select('id')
        .eq('email', emailLimpio)
        .maybeSingle();

      let clienteId = cliente?.id;

      if (!clienteId) {
        const partes = formData.nombre.trim().split(" ");
        const nombreSolo = partes[0] || "Cliente";
        const apellidoSolo = partes.slice(1).join(" ") || "Nuevo";

        const { data: nuevo, error: errorCreacion } = await supabase
          .from('users')
          .insert([{ 
            nombre: nombreSolo, 
            apellido: apellidoSolo, 
            email: emailLimpio, 
            telefono: formData.telefono, 
            rol: 'CLIENTE',
            password_hash: 'invitado_spa', 
            activo: true 
          }])
          .select()
          .single();
        
        if (errorCreacion) throw errorCreacion;
        clienteId = nuevo.id;
      }

      // 2. Lógica de Turno (¿Es nuevo o es cambio de fecha?)
      if (reprogramandoId) {
        // ESCENARIO: Actualizar turno existente
        const { error: errorUpdate } = await supabase
          .from('turnos')
          .update({
            fecha: selectedTurno.fecha,
            hora: selectedTurno.hora,
            estado: 'PENDIENTE' // Vuelve a pendiente para validación de Admin
          })
          .eq('id', reprogramandoId);

        if (errorUpdate) throw errorUpdate;
      } else {
        // ESCENARIO: Insertar turno nuevo
        const { error: errorTurno } = await supabase.from('turnos').insert([{
          cliente_id: clienteId,
          empleado_id: especialista.id,
          servicio_id: servicio.id,
          fecha: selectedTurno.fecha,
          hora: selectedTurno.hora,
          estado: 'PENDIENTE'
        }]);

        if (errorTurno) throw errorTurno;
      }

      setStep(3); 
    } catch (e) {
      alert("No pudimos procesar tu solicitud: " + (e.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  const cerrarTodoAlFinalizar = () => {
    if (onSuccess) onSuccess();
    else onClose();
  }

  const generarLinkWhatsApp = () => {
    const numeroTelefono = "543537XXXXXX"; 
    const texto = reprogramandoId 
      ? `¡Hola Harmony! Soy ${formData.nombre}. Acabo de *reprogramar* mi turno de ${servicio?.nombre} para el ${selectedTurno?.fecha} a las ${selectedTurno?.hora}hs.`
      : `¡Hola Harmony! Soy ${formData.nombre}. Acabo de transferir la seña para mi turno de ${servicio?.nombre} (${selectedTurno?.fecha} a las ${selectedTurno?.hora}hs). ¡Adjunto el comprobante! ✨`;
    
    return `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(texto)}`;
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        
        {step === 1 && (
          <div style={styles.container}>
            <h2 style={styles.tituloDorado}>{reprogramandoId ? 'Nueva Fecha' : 'Verifica tu Turno'}</h2>
            <p style={styles.subtitulo}>Confirma los nuevos detalles de tu cita.</p>
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

        {step === 2 && (
          <div style={styles.container}>
            <h2 style={styles.tituloDorado}>Tus Datos</h2>
            <p style={styles.subtitulo}>Confirma tu identidad para finalizar.</p>
            <div style={styles.form}>
              <input style={styles.input} placeholder="Nombre completo" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              <input style={styles.input} placeholder="Teléfono" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value.replace(/\D/g, '')})} />
              <input style={styles.input} placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div style={styles.flexButtons}>
              <button style={styles.btnSecundario} onClick={() => setStep(1)}>ATRÁS</button>
              <button style={styles.btnPrimario} onClick={handleFinalizarReserva} disabled={loading}>
                {loading ? 'PROCESANDO...' : 'CONFIRMAR CAMBIO'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ ...styles.container, textAlign: 'center' }}>
            <div style={styles.circuloExito}>✓</div>
            <h2 style={styles.tituloDorado}>{reprogramandoId ? '¡Cambio Exitoso!' : '¡Reserva Registrada!'}</h2>
            <p style={styles.subtitulo}>
              {reprogramandoId 
                ? 'Tu nueva fecha ha sido registrada. Por favor, avísanos por WhatsApp.'
                : 'Realiza la transferencia para confirmar tu turno:'}
            </p>
            
            {!reprogramandoId && (
              <div style={styles.cajaBanco}>
                <div style={styles.filaBanco}>
                  <p style={styles.datoBanco}><strong>Alias:</strong> HARMONY.SPA.SPA</p>
                  <button style={styles.btnCopiarMini} onClick={() => { navigator.clipboard.writeText("HARMONY.SPA.SPA"); alert("Alias copiado"); }}>COPIAR</button>
                </div>
                <div style={styles.filaBanco}>
                  <p style={styles.datoBanco}><strong>CBU:</strong> 00000031000XXXXXXXXX</p>
                  <button style={styles.btnCopiarMini} onClick={() => { navigator.clipboard.writeText("00000031000XXXXXXXXX"); alert("CBU copiado"); }}>COPIAR</button>
                </div>
                <p style={styles.datoBanco}><strong>Titular:</strong> Harmony Spa</p>
                <div style={styles.montoSeña}>Monto seña: $5.000</div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <a href={generarLinkWhatsApp()} target="_blank" rel="noopener noreferrer" style={styles.btnWhatsApp}>
                {reprogramandoId ? 'NOTIFICAR CAMBIO POR WHATSAPP' : 'ENVIAR COMPROBANTE POR WHATSAPP'}
              </a>
              <button style={styles.btnFinalizarSimple} onClick={cerrarTodoAlFinalizar}>Salir</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ... (Los estilos se mantienen iguales)
const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modal: { backgroundColor: '#fff', padding: '40px', borderRadius: '30px', width: '90%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
  tituloDorado: { color: '#a6835a', fontFamily: 'serif', fontSize: '1.8rem', marginBottom: '10px', textAlign: 'center' },
  subtitulo: { color: '#888', fontSize: '0.85rem', marginBottom: '25px', textAlign: 'center' },
  cajaDatos: { backgroundColor: '#fdfbf9', padding: '20px', borderRadius: '20px', border: '1px solid #f2e9e1', marginBottom: '25px' },
  dato: { margin: '10px 0', color: '#8c6d4f', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #eee', fontSize: '0.9rem', outline: 'none' },
  flexButtons: { display: 'flex', gap: '15px' },
  btnPrimario: { flex: 1, backgroundColor: '#a6835a', color: '#fff', border: 'none', padding: '14px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' },
  btnSecundario: { flex: 1, backgroundColor: '#f5f5f5', color: '#666', border: 'none', padding: '14px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' },
  circuloExito: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e8f5e9', color: '#2e7d32', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' },
  btnWhatsApp: { backgroundColor: '#25D366', color: 'white', textDecoration: 'none', padding: '15px 20px', borderRadius: '50px', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' },
  btnFinalizarSimple: { background: 'none', border: 'none', color: '#8c6d4f', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' },
  cajaBanco: { backgroundColor: '#f9f6f3', padding: '15px', borderRadius: '15px', textAlign: 'left' },
  filaBanco: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  datoBanco: { margin: 0, fontSize: '0.85rem', color: '#555' },
  btnCopiarMini: { backgroundColor: '#f2e9e1', color: '#8c6d4f', border: 'none', padding: '4px 8px', borderRadius: '5px', fontSize: '0.6rem', cursor: 'pointer' },
  montoSeña: { marginTop: '10px', fontWeight: 'bold', color: '#a6835a', textAlign: 'center', fontSize: '1.1rem' }
};

export default BookingModal;