import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

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

const BookingModal = ({ isOpen, onClose, selectedTurno, especialista, servicio, onSuccess }) => {
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  // Agregamos DNI al estado inicial
  const [formData, setFormData] = useState({ nombre: '', dni: '', telefono: '', email: '' });
  const [alerta, setAlerta] = useState({ visible: false, mensaje: "" });

  const reprogramandoId = location.state?.reprogramandoId;

  useEffect(() => {
    if (isOpen) { setStep(1); }
  }, [isOpen]);

  if (!isOpen) return null;

  const validarPaso2 = () => {
    const { nombre, dni, telefono, email } = formData;
    if (!nombre.trim()) { setAlerta({ visible: true, mensaje: "Por favor, ingresa tu nombre completo." }); return false; }
    if (dni.length < 7) { setAlerta({ visible: true, mensaje: "Por favor, ingresa un DNI válido." }); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { setAlerta({ visible: true, mensaje: "Por favor, ingresa un correo electrónico válido." }); return false; }
    if (telefono.length < 8) { setAlerta({ visible: true, mensaje: "El teléfono debe tener al menos 8 números." }); return false; }
    return true;
  };

  const handleFinalizarReserva = async () => {
    if (!reprogramandoId && !validarPaso2()) return;

    setLoading(true);
    try {
      if (reprogramandoId) {
        const { error: errorUpdate } = await supabase
          .from('turnos')
          .update({
            fecha: selectedTurno.fecha,
            hora: selectedTurno.hora,
            estado: 'REPROGRAMADO',
            ya_reprogramado: true 
          })
          .eq('id', reprogramandoId);

        if (errorUpdate) throw errorUpdate;
      } else {
        const emailLimpio = formData.email.trim().toLowerCase();
        
        // BUSCAMOS POR DNI (Más seguro que por email)
        let { data: cliente } = await supabase.from('users').select('id').eq('dni', formData.dni).maybeSingle();
        let clienteId = cliente?.id;

        if (!clienteId) {
          const partes = formData.nombre.trim().split(" ");
          const { data: nuevo, error: errorCreacion } = await supabase.from('users').insert([{ 
            nombre: partes[0] || "Cliente", 
            apellido: partes.slice(1).join(" ") || "Nuevo", 
            dni: formData.dni,
            email: emailLimpio, 
            telefono: formData.telefono, 
            rol: 'CLIENTE',
            activo: true 
          }]).select().single();
          if (errorCreacion) throw errorCreacion;
          clienteId = nuevo.id;
        }

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
      setAlerta({ visible: true, mensaje: "No pudimos procesar tu solicitud: " + e.message });
    } finally {
      setLoading(false);
    }
  };

  const copiarDato = (texto) => {
    navigator.clipboard.writeText(texto);
    setAlerta({ visible: true, mensaje: "✨ Dato copiado al portapapeles." });
  };

  // ... (generarLinkWhatsApp se mantiene igual)
  const generarLinkWhatsApp = () => {
    const numeroTelefono = "543537XXXXXX"; 
    let texto = "";
    if (reprogramandoId) {
      texto = `*SOLICITUD DE REPROGRAMACIÓN* ✨\nHola Harmony! 👋 \nHe realizado la reprogramación de mi turno:\n🗓️ *Nueva Fecha:* ${selectedTurno?.fecha}\n⏰ *Nueva Hora:* ${selectedTurno?.hora.substring(0, 5)} hs\n🌿 *Servicio:* ${servicio?.nombre}\n👤 *Especialista:* ${especialista?.nombre}\n\n¡Muchas gracias!`;
    } else {
      texto = `*NUEVA RESERVA* ✨\nHola Harmony! Soy ${formData.nombre}.\nAcabo de reservar un turno para:\n🌿 *Servicio:* ${servicio?.nombre}\n🗓️ *Día:* ${selectedTurno?.fecha}\n⏰ *Hora:* ${selectedTurno?.hora.substring(0, 5)} hs\nAdjunto el comprobante de la seña abajo. 👇`;
    }
    return `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(texto)}`;
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {step === 1 && (
          <div style={styles.container}>
            <h2 style={styles.tituloDorado}>{reprogramandoId ? 'Confirmar Cambio' : 'Verifica tu Turno'}</h2>
            <p style={styles.subtitulo}>{reprogramandoId ? '¿Deseas mover tu turno a esta nueva fecha?' : 'Confirma los detalles de tu cita.'}</p>
            <div style={styles.cajaDatos}>
              <p style={styles.dato}>✨ <strong>Servicio:</strong> {servicio?.nombre}</p>
              <p style={styles.dato}>👤 <strong>Especialista:</strong> {especialista?.nombre}</p>
              <p style={styles.dato}>📅 <strong>Fecha:</strong> {selectedTurno?.fecha}</p>
              <p style={styles.dato}>⏰ <strong>Hora:</strong> {selectedTurno?.hora.substring(0, 5)} hs</p>
            </div>
            <div style={styles.flexButtons}>
              <button style={styles.btnSecundario} onClick={onClose}>MODIFICAR</button>
              <button style={styles.btnPrimario} onClick={() => reprogramandoId ? handleFinalizarReserva() : setStep(2)} disabled={loading}>
                {loading ? 'PROCESANDO...' : (reprogramandoId ? 'CONFIRMAR CAMBIO' : 'ES CORRECTO')}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={styles.container}>
            <h2 style={styles.tituloDorado}>Tus Datos</h2>
            <p style={styles.subtitulo}>Ingresa tus datos para finalizar la reserva.</p>
            <div style={styles.form}>
              <input style={styles.input} placeholder="Nombre completo" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              <input style={styles.input} placeholder="DNI (Sin puntos)" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value.replace(/\D/g, '')})} />
              <input style={styles.input} placeholder="Teléfono" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value.replace(/\D/g, '')})} />
              <input style={styles.input} placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div style={styles.flexButtons}>
              <button style={styles.btnSecundario} onClick={() => setStep(1)}>ATRÁS</button>
              <button style={styles.btnPrimario} onClick={handleFinalizarReserva} disabled={loading}>
                {loading ? 'PROCESANDO...' : 'CONFIRMAR RESERVA'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ ...styles.container, textAlign: 'center' }}>
            <div style={styles.circuloExito}>✓</div>
            <h2 style={styles.tituloDorado}>{reprogramandoId ? '¡Cambio Realizado!' : '¡Reserva Registrada!'}</h2>
            <p style={styles.subtitulo}>{reprogramandoId ? 'Tu turno ha sido actualizado. El spa ha sido notificado.' : 'Realiza la transferencia para confirmar tu turno:'}</p>
            {!reprogramandoId && (
              <div style={styles.cajaBanco}>
                <div style={styles.filaBanco}>
                  <p style={styles.datoBanco}><strong>Alias:</strong> HARMONY.SPA.SPA</p>
                  <button style={styles.btnCopiarMini} onClick={() => copiarDato("HARMONY.SPA.SPA")}>COPIAR</button>
                </div>
                <div style={styles.filaBanco}>
                  <p style={styles.datoBanco}><strong>CBU:</strong> 00000031000XXXXXXXXX</p>
                  <button style={styles.btnCopiarMini} onClick={() => copiarDato("00000031000XXXXXXXXX")}>COPIAR</button>
                </div>
                <div style={styles.montoSeña}>Monto seña: $5.000</div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <a href={generarLinkWhatsApp()} target="_blank" rel="noopener noreferrer" style={styles.btnWhatsApp}>
                {reprogramandoId ? 'AVISAR CAMBIO POR WHATSAPP' : 'ENVIAR COMPROBANTE'}
              </a>
              <button style={styles.btnFinalizarSimple} onClick={onSuccess || onClose}>Salir</button>
            </div>
          </div>
        )}

        {alerta.visible && <AlertaPersonalizada mensaje={alerta.mensaje} alCerrar={() => setAlerta({visible: false, mensaje: ""})} />}
      </div>
    </div>
  );
};
const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' },
  modal: { backgroundColor: '#fff', padding: '40px', borderRadius: '30px', width: '90%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' },
  container: { display: 'flex', flexDirection: 'column', gap: '5px' },
  tituloDorado: { color: '#a6835a', fontFamily: 'serif', fontSize: '1.8rem', marginBottom: '10px', textAlign: 'center' },
  subtitulo: { color: '#888', fontSize: '0.85rem', marginBottom: '25px', textAlign: 'center' },
  cajaDatos: { backgroundColor: '#fdfbf9', padding: '20px', borderRadius: '20px', border: '1px solid #f2e9e1', marginBottom: '25px' },
  dato: { margin: '10px 0', color: '#8c6d4f', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #eee', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fdfcfb' },
  flexButtons: { display: 'flex', gap: '15px' },
  btnPrimario: { flex: 1, backgroundColor: '#a6835a', color: '#fff', border: 'none', padding: '14px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' },
  btnSecundario: { flex: 1, backgroundColor: '#f5f5f5', color: '#666', border: 'none', padding: '14px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' },
  circuloExito: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e8f5e9', color: '#2e7d32', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' },
  btnWhatsApp: { backgroundColor: '#25D366', color: 'white', textDecoration: 'none', padding: '15px 20px', borderRadius: '50px', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', marginTop: '10px' },
  btnFinalizarSimple: { background: 'none', border: 'none', color: '#8c6d4f', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' },
  cajaBanco: { backgroundColor: '#f9f6f3', padding: '15px', borderRadius: '15px', textAlign: 'left' },
  filaBanco: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  datoBanco: { margin: 0, fontSize: '0.85rem', color: '#555' },
  btnCopiarMini: { backgroundColor: '#f2e9e1', color: '#8c6d4f', border: 'none', padding: '4px 8px', borderRadius: '5px', fontSize: '0.6rem', cursor: 'pointer' },
  montoSeña: { marginTop: '10px', fontWeight: 'bold', color: '#a6835a', textAlign: 'center', fontSize: '1.1rem' },

  // --- Estilos de la Alerta de Harmony ---
  alertOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
  alertModal: { backgroundColor: '#fff', padding: '35px', borderRadius: '30px', width: '320px', textAlign: 'center', border: '1px solid #f2e9e1', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  alertIcon: { width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #a6835a', color: '#a6835a', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 15px', fontSize: '20px', fontWeight: 'bold' },
  alertTitle: { color: '#8c6d4f', fontFamily: 'serif', fontSize: '1.4rem', marginBottom: '10px' },
  alertText: { color: '#bfa38a', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.4' },
  alertBtn: { backgroundColor: '#a6835a', color: 'white', border: 'none', padding: '10px 30px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }
};
export default BookingModal;