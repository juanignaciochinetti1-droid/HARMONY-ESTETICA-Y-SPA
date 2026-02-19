import React, { useState, useEffect } from 'react';

const ModalFormulario = ({ alCerrar, alGuardar, especialistaAEditar }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    especialidad: '',
    email: '',
    telefono: '',
    activo: true,
    foto: ''
  });

  useEffect(() => {
    if (especialistaAEditar) {
      setFormData({
        nombre: `${especialistaAEditar.nombre} ${especialistaAEditar.apellido || ''}`.trim(),
        especialidad: especialistaAEditar.especialidad || '',
        email: especialistaAEditar.email || '',
        telefono: especialistaAEditar.telefono || '',
        activo: especialistaAEditar.activo ?? true,
        foto: especialistaAEditar.foto_url || ''
      });
    }
  }, [especialistaAEditar]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alGuardar(formData);
    alCerrar();
  };

  return (
    <div style={styles.overlay} onClick={alCerrar}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.titulo}>Editar Profesional</h2>
        <p style={styles.subtitulo}>ACTUALIZAR DATOS</p>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.campo}>
            <label style={styles.label}>NOMBRE COMPLETO</label>
            <input 
              style={styles.input} 
              type="text" 
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            />
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>ESPECIALIDAD</label>
            <input 
              style={styles.input} 
              type="text" 
              value={formData.especialidad}
              onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
            />
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>EMAIL:</label>
            <input 
              style={styles.input} 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>TELÉFONO:</label>
            <input 
              style={styles.input} 
              type="text" 
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
            />
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>ESTADO DISPONIBILIDAD</label>
            <select 
              style={styles.input}
              value={formData.activo}
              onChange={(e) => setFormData({...formData, activo: e.target.value === 'true'})}
            >
              <option value="true">✅ ACTIVO (Disponible)</option>
              <option value="false">❌ INACTIVO (No disponible)</option>
            </select>
          </div>

          <button type="submit" style={styles.btnGuardar}>GUARDAR CAMBIOS</button>
          <p onClick={alCerrar} style={styles.btnCancelar}>Cancelar</p>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modal: { background: '#fff', padding: '40px', borderRadius: '40px', width: '400px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' },
  titulo: { color: '#b5926d', fontSize: '2rem', marginBottom: '5px', fontWeight: '300' },
  subtitulo: { color: '#d1c4b9', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '30px' },
  campo: { marginBottom: '20px', textAlign: 'left' },
  label: { display: 'block', fontSize: '0.8rem', color: '#b5926d', marginBottom: '8px' },
  input: { width: '100%', padding: '12px', borderRadius: '15px', border: '1px solid #d1c4b9', outline: 'none', color: '#555' },
  btnGuardar: { width: '100%', background: '#a6835a', color: 'white', border: 'none', padding: '15px', borderRadius: '30px', cursor: 'pointer', fontSize: '1rem', marginTop: '20px', fontWeight: 'bold' },
  btnCancelar: { color: '#a6835a', cursor: 'pointer', fontSize: '0.9rem', marginTop: '15px', textDecoration: 'underline' }
};

export default ModalFormulario;