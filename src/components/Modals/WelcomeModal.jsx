import React from 'react';

export default function WelcomeModal({ nombre, rol }) {
  return (
    <div style={styles.welcomeOverlay}>
      <div style={styles.welcomeCard}>
        <div style={styles.iconContainer}>
          {/* Usamos el logo que ya tienes */}
          <img src="/flor-logo.png" alt="Logo" style={styles.logo} />
        </div>
        
        <h2 style={styles.saludo}>¡Hola, {nombre}!</h2>
        
        <div style={styles.badgeRol}>
          {rol === 'ADMIN' ? 'PANEL DE CONTROL' : 'ACCESO PROFESIONAL'}
        </div>
        
        <p style={styles.mensaje}>
          {rol === 'ADMIN' 
            ? 'Bienvenida a la gestión de tu centro de estética.' 
            : 'Tu agenda y pacientes te están esperando.'}
        </p>

        <div style={styles.loaderContainer}>
          <div style={styles.loaderBar}></div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  welcomeOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(252, 250, 247, 0.98)', // Casi blanco hueso
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000, // Por encima de todo
    animation: 'fadeIn 0.5s ease'
  },
  welcomeCard: {
    textAlign: 'center',
    padding: '50px',
    maxWidth: '400px',
    width: '90%'
  },
  logo: { width: '70px', marginBottom: '20px' },
  saludo: { 
    fontFamily: "'Playfair Display', serif", 
    color: '#8c6d4f', 
    fontSize: '2.5rem', 
    margin: '0 0 10px 0',
    fontWeight: '400'
  },
  badgeRol: {
    display: 'inline-block',
    padding: '5px 15px',
    backgroundColor: '#f2e9e1',
    color: '#a6835a',
    borderRadius: '20px',
    fontSize: '0.65rem',
    letterSpacing: '2px',
    marginBottom: '20px',
    fontWeight: 'bold'
  },
  mensaje: { 
    color: '#bfa38a', 
    fontSize: '0.9rem', 
    lineHeight: '1.6',
    letterSpacing: '0.5px'
  },
  loaderContainer: {
    marginTop: '40px',
    width: '100%',
    height: '2px',
    backgroundColor: '#f2e9e1',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  loaderBar: {
    height: '100%',
    backgroundColor: '#c5a37d',
    width: '100%',
    animation: 'loadingProgress 3s linear forwards'
  }
};