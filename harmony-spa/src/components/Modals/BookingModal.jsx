import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const BookingModal = ({ isOpen, onClose, selectedTurno, especialista, servicio }) => {
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
      // 1. Lógica de Cliente: Buscar o Crear
      let { data: cliente } = await supabase.from('users').select('id').eq('email', formData.email).single();
      let clienteId = cliente?.id;

      if (!clienteId) {
        const partes = formData.nombre.trim().split(" ");
        const nombreSolo = partes[0];
        const apellidoSolo = partes.slice(1).join(" ") || ".";

        const { data: nuevo, error: eC } = await supabase.from('users')
          .insert([{ 
            nombre: nombreSolo, 
            apellido: apellidoSolo, 
            email: formData.email, 
            telefono: formData.telefono, 
            rol: 'CLIENTE',
            password_hash: 'invitado_spa' // Para cumplir con el NOT NULL de tu BD
          }])
          .select().single();
        
        if (eC) throw eC;
        clienteId = nuevo.id;
      }

      // 2. Insertar el Turno
      const { error: eT } = await supabase.from('turnos').insert([{
        cliente_id: clienteId,
        empleado_id: especialista.id,
        servicio_id: servicio.id,
        fecha: selectedTurno.fecha,
        hora: selectedTurno.hora,
        estado: 'PENDIENTE'
      }]);

      if (eT) throw eT;
      setStep(3); 

    } catch (e) {
      console.error("Error completo:", e);
      alert("Error al procesar: " + e.message);
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
            <h2 style={styles.tituloDorado}>¡Reservado con Éxito!</h2>
            <p style={styles.subtitulo}>Tu momento Harmony Spa está confirmado.</p>
            <button style={styles.btnPrimario} onClick={onClose}>FINALIZAR</button>
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
  circuloExito: { width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#fdfbf9', border: '3px solid #a6835a', color: '#a6835a', fontSize: '2.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px' }
};

export default BookingModal;