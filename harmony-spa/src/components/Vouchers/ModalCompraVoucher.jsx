import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Asegúrate de que la ruta sea correcta

const ModalCompraVoucher = ({ voucher, alCerrar }) => {
  const [datos, setDatos] = useState({ de: '', para: '', telefonoPara: '', mensaje: '' });
  const [cargando, setCargando] = useState(false);

  const enviarSolicitud = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      // 1. Registro en la base de datos (Tabla: vouchers_solicitudes)
      // Esto permite que el Admin vea la intención de compra en su reporte global
      const { error: dbError } = await supabase
        .from('vouchers_solicitudes')
        .insert([{
          voucher_id: voucher.id,
          remitente: datos.de,
          destinatario: datos.para,
          telefono_destinatario: datos.telefonoPara,
          mensaje: datos.mensaje,
          estado: 'PENDIENTE_PAGO'
        }]);

      if (dbError) throw dbError;

      // 2. Preparación del mensaje de WhatsApp
      const numeroAdmin = "5493537650821";
      const texto = `¡Hola Harmony! ✨ 
Quisiera un *Voucher de Regalo*:
------------------------------
🎁 *Plan:* ${voucher.nombre}
💰 *Valor:* $${Number(voucher.precio).toLocaleString('es-AR')}
✍️ *De:* ${datos.de}
👤 *Para:* ${datos.para}
📱 *Tel. Recibe:* ${datos.telefonoPara}
💌 *Mensaje:* ${datos.mensaje || "Sin mensaje especial"}
------------------------------
¿Me podrían indicar los pasos para realizar el pago? ¡Gracias!`;

      const url = `https://wa.me/${numeroAdmin}?text=${encodeURIComponent(texto)}`;
      
      // 3. Abrir WhatsApp y cerrar modal
      window.open(url, '_blank');
      alCerrar();

    } catch (error) {
      console.error("Error al procesar solicitud:", error.message);
      alert("Hubo un error al registrar tu pedido. Por favor, intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.decoracionSuperior}></div>
        <h2 style={styles.titulo}>Personalizar Regalo</h2>
        <p style={styles.infoPlan}>
          Estás regalando: <strong>{voucher.nombre}</strong>
        </p>
        
        <form onSubmit={enviarSolicitud}>
          <label style={styles.label}>TU NOMBRE</label>
          <input 
            style={styles.input} 
            placeholder="Ej: María García" 
            required 
            value={datos.de} 
            onChange={e => setDatos({...datos, de: e.target.value})} 
          />

          <label style={styles.label}>PARA QUIÉN ES</label>
          <input 
            style={styles.input} 
            placeholder="Ej: Juan Pérez" 
            required 
            value={datos.para} 
            onChange={e => setDatos({...datos, para: e.target.value})} 
          />

          <label style={styles.label}>TELÉFONO DE QUIEN RECIBE (WHATSAPP)</label>
          <input 
            type="tel"
            style={styles.input} 
            placeholder="Ej: 3537123456" 
            required 
            value={datos.telefonoPara} 
            onChange={e => setDatos({...datos, telefonoPara: e.target.value})} 
          />

          <label style={styles.label}>MENSAJE (OPCIONAL)</label>
          <textarea 
            style={{...styles.input, height: '80px', resize: 'none'}} 
            placeholder="Escribe una dedicatoria..." 
            value={datos.mensaje} 
            onChange={e => setDatos({...datos, mensaje: e.target.value})} 
          />

          <button type="submit" style={styles.btnPrimario} disabled={cargando}>
            {cargando ? 'PROCESANDO...' : 'SOLICITAR POR WHATSAPP'}
          </button>
          
          <button type="button" onClick={alCerrar} style={styles.btnSecundario}>
            VOLVER ATRÁS
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: { 
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
    backgroundColor: 'rgba(26, 26, 26, 0.6)', display: 'flex', 
    justifyContent: 'center', alignItems: 'center', zIndex: 3000, 
    backdropFilter: 'blur(8px)' 
  },
  modal: { 
    backgroundColor: '#fff', padding: '40px 30px', borderRadius: '25px', 
    width: '90%', maxWidth: '420px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
    position: 'relative', overflow: 'hidden' 
  },
  decoracionSuperior: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '5px',
    backgroundColor: '#c5a37d'
  },
  titulo: { 
    color: '#1a1a1a', textAlign: 'center', fontFamily: "'Playfair Display', serif", 
    fontSize: '1.8rem', marginBottom: '8px', fontWeight: '400' 
  },
  infoPlan: { 
    textAlign: 'center', color: '#bfa38a', marginBottom: '25px', 
    fontSize: '0.95rem', letterSpacing: '0.5px' 
  },
  label: {
    display: 'block', fontSize: '0.7rem', color: '#bfa38a', 
    fontWeight: 'bold', letterSpacing: '1px', marginBottom: '5px', marginLeft: '5px'
  },
  input: { 
    width: '100%', padding: '14px', marginBottom: '20px', borderRadius: '12px', 
    border: '1px solid #f2e9e1', backgroundColor: '#fdfcfb', boxSizing: 'border-box',
    fontFamily: 'inherit', fontSize: '0.9rem'
  },
  btnPrimario: { 
    width: '100%', padding: '16px', backgroundColor: '#1a1a1a', color: '#fff', 
    border: 'none', borderRadius: '50px', fontWeight: '600', cursor: 'pointer', 
    letterSpacing: '1px', fontSize: '0.9rem', transition: 'transform 0.2s' 
  },
  btnSecundario: { 
    width: '100%', marginTop: '15px', padding: '10px', background: 'none', 
    border: 'none', color: '#999', cursor: 'pointer', fontSize: '0.8rem', 
    letterSpacing: '1px' 
  }
};

export default ModalCompraVoucher;