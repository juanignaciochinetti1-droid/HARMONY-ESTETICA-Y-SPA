import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const ModalPassword = ({ alCerrar, setAlertaPadre }) => {
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleActualizar = async (e) => {
    e.preventDefault();

    // Validaciones con el estilo de alertas del proyecto
    if (password.length < 6) {
      setAlertaPadre({ visible: true, mensaje: "La contraseña debe tener al menos 6 caracteres para ser segura." });
      return;
    }
    if (password !== confirmar) {
      setAlertaPadre({ visible: true, mensaje: "Las contraseñas ingresadas no coinciden. Por favor, verifica." });
      return;
    }

    setCargando(true);
    
    // update() de Supabase Auth actualiza la clave del usuario logueado actualmente
    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      setAlertaPadre({ visible: true, mensaje: "Error al actualizar: " + error.message });
    } else {
      setAlertaPadre({ visible: true, mensaje: "✨ Tu contraseña ha sido actualizada con éxito." });
      alCerrar();
    }
    setCargando(false);
  };

  return (
    <div style={styles.overlayModal}>
      <div style={styles.modalChico}>
        <h3 style={styles.tituloModal}>Seguridad</h3>
        <p style={styles.subtitulo}>ACTUALIZACIÓN DE CLAVE</p>
        <p style={styles.txtChico}>Por seguridad, ingresa una nueva clave de acceso que solo tú conozcas.</p>
        
        <form onSubmit={handleActualizar}>
          <div style={styles.campo}>
            <label style={styles.label}>NUEVA CONTRASEÑA</label>
            <input 
              type="password" 
              placeholder="Mínimo 6 caracteres" 
              style={styles.input} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>CONFIRMAR CONTRASEÑA</label>
            <input 
              type="password" 
              placeholder="Repite tu contraseña" 
              style={styles.input} 
              onChange={(e) => setConfirmar(e.target.value)}
              required 
            />
          </div>

          <button type="submit" disabled={cargando} style={{...styles.btnGuardar, opacity: cargando ? 0.7 : 1}}>
            {cargando ? 'PROCESANDO...' : 'GUARDAR CAMBIOS'}
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
  overlayModal: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(26, 26, 26, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(4px)' },
  modalChico: { background: '#fff', padding: '40px', borderRadius: '40px', width: '380px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' },
  tituloModal: { color: '#8c6d4f', fontSize: '1.6rem', marginBottom: '5px', fontWeight: '400', fontFamily: 'Playfair Display' },
  subtitulo: { color: '#d1c4b9', fontSize: '0.6rem', letterSpacing: '2px', marginBottom: '20px', textTransform: 'uppercase' },
  txtChico: { color: '#bfa38a', fontSize: '0.85rem', marginBottom: '25px', lineHeight: '1.4' },
  campo: { marginBottom: '20px', textAlign: 'left' },
  label: { display: 'block', fontSize: '0.65rem', color: '#b5926d', marginBottom: '8px', fontWeight: 'bold' },
  input: { width: '100%', padding: '12px', borderRadius: '15px', border: '1px solid #f2e9e1', outline: 'none', color: '#555', boxSizing: 'border-box', backgroundColor: '#fdfcfb' },
  btnGuardar: { width: '100%', background: '#a6835a', color: 'white', border: 'none', padding: '14px', borderRadius: '30px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', marginTop: '10px' },
  btnNoLink: { background: 'none', border: 'none', color: '#a6835a', cursor: 'pointer', fontSize: '0.8rem', marginTop: '15px', textDecoration: 'underline' }
};

export default ModalPassword;