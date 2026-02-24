import React, { useState, useEffect } from 'react';

const ModalFormularioVoucher = ({ alCerrar, alGuardar, voucherAEditar }) => {
  const [form, setForm] = useState({ nombre: '', precio: '', features: '', footer: '' });

  useEffect(() => {
    if (voucherAEditar) {
      setForm({
        nombre: voucherAEditar.nombre,
        precio: voucherAEditar.precio,
        features: voucherAEditar.features.join(', '),
        footer: voucherAEditar.footer
      });
    }
  }, [voucherAEditar]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const datosProcesados = {
      ...form,
      features: form.features.split(',').map(f => f.trim()).filter(f => f !== "")
    };
    alGuardar(datosProcesados);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.titulo}>{voucherAEditar ? 'Editar Voucher' : 'Nuevo Voucher'}</h2>
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Nombre del Plan</label>
          <input style={styles.input} required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej: Relajación Total" />
          
          <label style={styles.label}>Precio</label>
          <input style={styles.input} required value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} placeholder="Ej: 25.000" />
          
          <label style={styles.label}>Beneficios (separados por coma)</label>
          <textarea style={{...styles.input, height: '70px'}} required value={form.features} onChange={e => setForm({...form, features: e.target.value})} placeholder="Masaje facial, Té de hierbas..." />
          
          <label style={styles.label}>Texto al pie</label>
          <input style={styles.input} value={form.footer} onChange={e => setForm({...form, footer: e.target.value})} placeholder="Validez 30 días..." />
          
          <button type="submit" style={styles.btnGuardar}>GUARDAR CAMBIOS</button>
          <button type="button" onClick={alCerrar} style={styles.btnSecundario}>Cerrar</button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(10px)' },
  modal: { backgroundColor: '#fff', padding: '35px', borderRadius: '25px', width: '90%', maxWidth: '450px', boxShadow: '0 20px 50px rgba(140, 109, 79, 0.15)', border: '1px solid #f2e9e1' },
  titulo: { color: '#8c6d4f', textAlign: 'center', fontFamily: 'Playfair Display', marginBottom: '25px', fontWeight: '300' },
  label: { display: 'block', fontSize: '0.7rem', color: '#bfa38a', marginBottom: '5px', marginLeft: '5px', textTransform: 'uppercase', letterSpacing: '1px' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #f2e9e1', boxSizing: 'border-box', fontFamily: 'sans-serif' },
  btnGuardar: { width: '100%', padding: '15px', backgroundColor: '#8c6d4f', color: '#white', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(140, 109, 79, 0.2)' },
  btnSecundario: { width: '100%', marginTop: '10px', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }
};

export default ModalFormularioVoucher;