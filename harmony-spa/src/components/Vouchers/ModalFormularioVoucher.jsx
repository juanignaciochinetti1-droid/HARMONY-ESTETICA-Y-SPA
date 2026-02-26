import React, { useState, useEffect } from 'react';

const ModalFormularioVoucher = ({ alCerrar, alGuardar, voucherAEditar }) => {
  const [form, setForm] = useState({ nombre: '', precio: '', features: '', footer: '' });

  useEffect(() => {
    if (voucherAEditar) {
      setForm({
        nombre: voucherAEditar.nombre || '',
        precio: voucherAEditar.precio || '',
        // BLINDAJE: Verificamos que sea array antes de hacer .join
        features: Array.isArray(voucherAEditar.features) 
          ? voucherAEditar.features.join(', ') 
          : (voucherAEditar.features || ''),
        footer: voucherAEditar.footer || ''
      });
    }
  }, [voucherAEditar]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Procesamos el string de la descripción para convertirlo en un array limpio
    const datosProcesados = {
      ...form,
      precio: parseFloat(form.precio), // Aseguramos que el precio sea número
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
          <input 
            style={styles.input} 
            required 
            value={form.nombre} 
            onChange={e => setForm({...form, nombre: e.target.value})} 
            placeholder="Ej: Relajación Total" 
          />
          
          <label style={styles.label}>Precio (Solo números)</label>
          <input 
            style={styles.input} 
            required 
            type="number"
            value={form.precio} 
            onChange={e => setForm({...form, precio: e.target.value})} 
            placeholder="Ej: 25000" 
          />
          
          <label style={styles.label}>Beneficios (separados por coma)</label>
          <textarea 
            style={{...styles.input, height: '80px', resize: 'none'}} 
            required 
            value={form.features} 
            onChange={e => setForm({...form, features: e.target.value})} 
            placeholder="Masaje facial, Té de hierbas, Exfoliación..." 
          />
          
          <label style={styles.label}>Texto al pie</label>
          <input 
            style={styles.input} 
            value={form.footer} 
            onChange={e => setForm({...form, footer: e.target.value})} 
            placeholder="Ej: Validez 30 días o Transferencia disponible" 
          />
          
          <div style={styles.containerBotones}>
            <button type="submit" style={styles.btnGuardar}>
              {voucherAEditar ? 'ACTUALIZAR VOUCHER' : 'CREAR VOUCHER'}
            </button>
            <button type="button" onClick={alCerrar} style={styles.btnSecundario}>
              CANCELAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: { 
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
    backgroundColor: 'rgba(26, 26, 26, 0.4)', display: 'flex', 
    justifyContent: 'center', alignItems: 'center', zIndex: 3000, 
    backdropFilter: 'blur(8px)' 
  },
  modal: { 
    backgroundColor: '#fff', padding: '40px', borderRadius: '25px', 
    width: '90%', maxWidth: '450px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', 
    border: '1px solid #f2e9e1' 
  },
  titulo: { 
    color: '#8c6d4f', textAlign: 'center', fontFamily: "'Playfair Display', serif", 
    marginBottom: '30px', fontWeight: '400', fontSize: '1.8rem' 
  },
  label: { 
    display: 'block', fontSize: '0.65rem', color: '#bfa38a', 
    marginBottom: '8px', marginLeft: '5px', textTransform: 'uppercase', 
    letterSpacing: '1.5px', fontWeight: 'bold' 
  },
  input: { 
    width: '100%', padding: '14px', marginBottom: '20px', borderRadius: '12px', 
    border: '1px solid #f2e9e1', boxSizing: 'border-box', fontFamily: 'inherit',
    backgroundColor: '#fdfcfb', fontSize: '0.9rem'
  },
  containerBotones: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' },
  btnGuardar: { 
    width: '100%', padding: '16px', backgroundColor: '#8c6d4f', color: '#fff', 
    border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', 
    boxShadow: '0 4px 15px rgba(140, 109, 79, 0.2)', letterSpacing: '1px' 
  },
  btnSecundario: { 
    width: '100%', background: 'none', border: 'none', color: '#bfa38a', 
    cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '1px' 
  }
};

export default ModalFormularioVoucher;