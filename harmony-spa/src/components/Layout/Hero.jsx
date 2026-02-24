import React from 'react';

const Hero = () => {
  return (
    <div style={styles.heroContainer}>
      <div style={styles.overlay}>
        <h1 style={styles.title}>Tu momento de calma</h1>
        <p style={styles.subtitle}>Resaltamos tu belleza natural con excelencia profesional.</p>
        <button style={styles.button}>INFORMACIÓN</button>
      </div>
    </div>
  );
};

const styles = {
  heroContainer: {
    height: '100vh', 
    width: '100%',
    // Asegúrate de que el nombre del archivo en la carpeta public sea exactamente este
    backgroundImage: 'url("/toallas.jpg")',
    
    /* 1. ESTO EVITA EL PIXELADO EN PANTALLAS GRANDES */
    backgroundSize: 'cover', 
    backgroundPosition: 'center center', 
    backgroundRepeat: 'no-repeat',
    imageRendering: 'auto', // Permite que el navegador suavice los bordes
    
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    textAlign: 'center',
    marginTop: '0', 
  },
  overlay: {
    /* 2. EFECTO GLASSMORFISMO (DESENFOQUE) */
    // Esto hace que aunque la imagen sea un poco ruidosa, el fondo del texto se vea premium
    backgroundColor: 'rgba(0, 0, 0, 0.3)', 
    backdropFilter: 'blur(2px)', // Desenfoque sutil del fondo
    padding: '50px',
    borderRadius: '15px',
    maxWidth: '85%',
  },
  title: { 
    fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', 
    fontWeight: '300', 
    margin: '0 0 15px 0',
    fontFamily: "'Playfair Display', serif",
    textShadow: '0px 4px 10px rgba(0,0,0,0.3)' // Sombra para separar el texto del fondo
  },
  subtitle: { 
    fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', 
    marginBottom: '30px',
    letterSpacing: '1px',
    fontWeight: '300'
  },
  button: {
    padding: '14px 35px',
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.8)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    letterSpacing: '2px',
    transition: 'all 0.4s ease',
    textTransform: 'uppercase'
  }
};

export default Hero;