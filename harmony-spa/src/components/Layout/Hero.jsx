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
    height: '60vh',
    backgroundImage: 'url("/toallaycrema.jpg")', // Asegúrate que el nombre coincida
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    textAlign: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Un oscurecido suave para que se lea el texto
    padding: '40px',
    borderRadius: '10px',
  },
  title: { fontSize: '3rem', fontWeight: '300', margin: '0 0 10px 0' },
  subtitle: { fontSize: '1rem', marginBottom: '20px' },
  button: {
    padding: '10px 25px',
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid white',
    cursor: 'pointer',
    fontSize: '0.8rem',
    letterSpacing: '2px'
  }
};

export default Hero;