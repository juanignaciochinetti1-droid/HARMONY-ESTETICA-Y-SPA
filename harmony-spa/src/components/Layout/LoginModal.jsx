import React from 'react';

const LoginModal = ({ alCerrar }) => {
  return (
    <div style={styles.overlay} onClick={alCerrar}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.titulo}>Identificarse</h2>
        <p style={styles.subtitulo}>Accede a tu perfil de Harmony</p>
        
        <input type="email" placeholder="Email" style={styles.input} />
        <input type="password" placeholder="Contraseña" style={styles.input} />
        
        <button style={styles.btnEntrar}>ENTRAR</button>
        <button onClick={alCerrar} style={styles.btnCerrar}>Cancelar</button>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 },
  modal: { background: 'white', padding: '40px', borderRadius: '20px', width: '320px', textAlign: 'center', border: '1px solid #f2e9e1' },
  titulo: { color: '#8c6d4f', margin: '0 0 5px 0', fontWeight: '400' },
  subtitulo: { fontSize: '0.7rem', color: '#bfa38a', marginBottom: '25px', letterSpacing: '1px' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #eee', boxSizing: 'border-box' },
  btnEntrar: { width: '100%', padding: '12px', background: '#a6835a', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' },
  btnCerrar: { background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.8rem' }
};

export default LoginModal;