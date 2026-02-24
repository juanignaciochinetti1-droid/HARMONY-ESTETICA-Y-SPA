import React, { useState } from 'react';

const ModalCompraVoucher = ({ voucher, alCerrar }) => {
  const [datos, setDatos] = useState({ de: '', para: '', mensaje: '' });

  const enviarWhatsApp = (e) => {
    e.preventDefault();
    const numeroAdmin = "5493537650821";
    const texto = `¡Hola Harmony! ✨ Quisiera un Voucher de Regalo:\n🎁 *Plan:* ${voucher.nombre}\n✍️ *De:* ${datos.de}\n👤 *Para:* ${datos.para}\n💌 *Mensaje:* ${datos.mensaje || "Sin mensaje"}\n\n¿Me indican cómo pagar?`;
    window.open(`https://wa.me/${numeroAdmin}?text=${encodeURIComponent(texto)}`, '_blank');
    alCerrar();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.titulo}>Personalizar Regalo</h2>
        <p style={{textAlign: 'center', color: '#bfa38a', marginBottom: '20px', fontSize: '0.9rem'}}>Plan seleccionado: {voucher.nombre}</p>
        <form onSubmit={enviarWhatsApp}>
          <input style={styles.input} placeholder="De: (Tu nombre)" required value={datos.de} onChange={e => setDatos({...datos, de: e.target.value})} />
          <input style={styles.input} placeholder="Para: (Nombre del agasajado)" required value={datos.para} onChange={e => setDatos({...datos, para: e.target.value})} />
          <textarea style={{...styles.input, height: '80px'}} placeholder="Mensaje especial (opcional)" value={datos.mensaje} onChange={e => setDatos({...datos, mensaje: e.target.value})} />
          <button type="submit" style={styles.btnPrimario}>SOLICITAR POR WHATSAPP</button>
          <button type="button" onClick={alCerrar} style={styles.btnSecundario}>CANCELAR</button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(5px)' },
  modal: { backgroundColor: '#fff', padding: '35px', borderRadius: '20px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' },
  titulo: { color: '#8c6d4f', textAlign: 'center', fontFamily: 'Playfair Display', marginBottom: '10px' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #f2e9e1', backgroundColor: '#fdfcfb', boxSizing: 'border-box' },
  btnPrimario: { width: '100%', padding: '15px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px' },
  btnSecundario: { width: '100%', marginTop: '10px', padding: '10px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem' }
};

export default ModalCompraVoucher;