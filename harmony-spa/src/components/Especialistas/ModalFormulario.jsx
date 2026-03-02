import React, { useState, useEffect } from 'react';

const ModalFormulario = ({ alCerrar, alGuardar, especialistaAEditar }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    especialidad: '',
    email: '',
    telefono: '',
    password: '', // Nuevo campo para la clave inicial
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
        password: '', // No cargamos la contraseña al editar por seguridad
        activo: especialistaAEditar.activo ?? true,
        foto: especialistaAEditar.foto_url || ''
      });
    } else {
      // Limpieza total si es un nuevo empleado
      setFormData({
        nombre: '',
        especialidad: '',
        email: '',
        telefono: '',
        password: '',
        activo: true,
        foto: ''
      });
    }
  }, [especialistaAEditar]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alGuardar(formData);
  };

  return (
    <div style={styles.overlay} onClick={alCerrar}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* TÍTULO DINÁMICO */}
        <h2 style={styles.titulo}>
          {especialistaAEditar ? 'Editar Perfil' : 'Nuevo Especialista'}
        </h2>
        <p style={styles.subtitulo}>
          {especialistaAEditar ? 'ACTUALIZAR DATOS' : 'REGISTRO DE STAFF'}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.campo}>
            <label style={styles.label}>NOMBRE COMPLETO</label>
            <input 
              style={styles.input} 
              type="text" 
              placeholder="Ej: Juan Pérez"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              required
            />
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>ESPECIALIDAD</label>
            <input 
              style={styles.input} 
              type="text" 
              placeholder="Ej: Masajista / Esteticista"
              value={formData.especialidad}
              onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
              required
            />
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>EMAIL LABORAL</label>
            <input 
              style={styles.input} 
              type="email" 
              placeholder="empleado@harmony.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          {/* CAMPO DE CONTRASEÑA: Solo visible/obligatorio para nuevos empleados */}
          {!especialistaAEditar && (
            <div style={styles.campo}>
              <label style={styles.label}>CONTRASEÑA TEMPORAL</label>
              <input 
                style={styles.input} 
                type="password" 
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required={!especialistaAEditar}
              />
              <p style={{fontSize: '0.6rem', color: '#bfa38a', marginTop: '5px'}}>
                * El empleado usará esta clave para su primer ingreso.
              </p>
            </div>
          )}

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
            <label style={styles.label}>ESTADO EN SISTEMA</label>
            <select 
              style={styles.input}
              value={formData.activo}
              onChange={(e) => setFormData({...formData, activo: e.target.value === 'true'})}
            >
              <option value="true">✅ ACTIVO (Aparece en reservas)</option>
              <option value="false">❌ INACTIVO (Oculto)</option>
            </select>
          </div>

          <button type="submit" style={styles.btnGuardar}>
            {especialistaAEditar ? 'GUARDAR CAMBIOS' : 'CREAR ACCESO'}
          </button>
          
          <button type="button" onClick={alCerrar} style={styles.btnNoLink}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(26, 26, 26, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' },
  modal: { background: '#fff', padding: '40px', borderRadius: '40px', width: '400px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', overflowY: 'auto', maxHeight: '90vh' },
  titulo: { color: '#8c6d4f', fontSize: '1.8rem', marginBottom: '5px', fontWeight: '400', fontFamily: 'Playfair Display' },
  subtitulo: { color: '#d1c4b9', fontSize: '0.6rem', letterSpacing: '2px', marginBottom: '30px', textTransform: 'uppercase' },
  campo: { marginBottom: '18px', textAlign: 'left' },
  label: { display: 'block', fontSize: '0.65rem', color: '#b5926d', marginBottom: '8px', fontWeight: 'bold' },
  input: { width: '100%', padding: '12px', borderRadius: '15px', border: '1px solid #f2e9e1', outline: 'none', color: '#555', boxSizing: 'border-box', backgroundColor: '#fdfcfb' },
  btnGuardar: { width: '100%', background: '#a6835a', color: 'white', border: 'none', padding: '15px', borderRadius: '30px', cursor: 'pointer', fontSize: '0.9rem', marginTop: '10px', fontWeight: 'bold', letterSpacing: '1px' },
  btnNoLink: { background: 'none', border: 'none', color: '#a6835a', cursor: 'pointer', fontSize: '0.8rem', marginTop: '15px', textDecoration: 'underline' }
};

export default ModalFormulario;