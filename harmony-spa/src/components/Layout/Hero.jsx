import React, { useState, useEffect } from 'react';

// Se agrega la prop 'alAceptarPoliticas' para manejar el scroll desde el componente padre
const Hero = ({ alAceptarPoliticas }) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [indice, setIndice] = useState(0);
  const [fade, setFade] = useState(true);

  const frases = [
    "Resaltamos tu belleza natural con excelencia profesional.",
    "Invertir en vos es tu mejor decisión del día.",
    "El cuidado de tu piel es el reflejo de tu amor propio.",
    "Regalate un respiro, te mereces un momento de calma.",
    "Belleza es sentirte cómoda en tu propia piel.",
    "Tu bienestar es la prioridad; nosotros, el camino.",
    "Potenciamos lo que te hace única."
  ];

  useEffect(() => {
    const intervalo = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndice((prevIndice) => (prevIndice + 1) % frases.length);
        setFade(true);
      }, 500);
    }, 2500);
    return () => clearInterval(intervalo);
  }, [frases.length]);

  // Función interna para cerrar modal y ejecutar el scroll
  const manejarAceptar = () => {
    setMostrarModal(false);
    
    // Cambiamos el hash para que el Home.js reaccione
    window.location.hash = "servicios";

    if (alAceptarPoliticas) {
      alAceptarPoliticas();
    }
  };

  return (
    <div style={styles.heroContainer}>
      <div style={styles.overlay}>
        <h1 style={styles.title}>Tu momento de calma</h1>
        
        <p style={{
          ...styles.subtitle, 
          opacity: fade ? 1 : 0, 
          transition: 'opacity 0.6s ease-in-out' 
        }}>
          {frases[indice]}
        </p>

        <button 
          style={styles.button}
          onClick={() => setMostrarModal(true)}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.color = '#a67c52'; // Marrón Harmony
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = 'white';
          }}
        >
          INFORMACIÓN
        </button>
      </div>

      {/* --- MODAL CON ESTÉTICA HARMONY PREMIUM --- */}
      {mostrarModal && (
        <div style={styles.modalPoliticasOverlay} onClick={() => setMostrarModal(false)}>
          <div style={styles.modalPoliticasCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalDecor}></span>
              <h3 style={styles.modalPoliticasTitle}>Reserva de Turno</h3>
              <span style={styles.modalDecor}></span>
            </div>
            
            <p style={styles.modalPoliticasIntro}>
              Para garantizar una experiencia de excelencia en <strong>Harmony</strong>, te informamos nuestras políticas vigentes:
            </p>
            
            <div style={styles.listaPoliticasResaltada}>
              <div style={styles.itemPoliticaAccesible}>
                <span style={styles.bulletDorado}></span>
                <p><strong>Seña:</strong> Confirmación mediante seña del <strong>30%</strong>.</p>
              </div>
              <div style={styles.itemPoliticaAccesible}>
                <span style={styles.bulletDorado}></span>
                <p><strong>Cambios:</strong> Reprogramaciones con <strong>24 hs</strong> de antelación.</p>
              </div>
              <div style={styles.itemPoliticaAccesible}>
                <span style={styles.bulletDorado}></span>
                <p><strong>Pagos:</strong> Disponemos de cuentas bancarias y medios electrónicos.</p>
              </div>
              <div style={styles.itemPoliticaAccesible}>
                <span style={styles.bulletDorado}></span>
                <p><strong>Reembolsos:</strong> La seña no es reembolsable fuera del plazo estipulado.</p>
              </div>
            </div>

            <button 
              onClick={manejarAceptar} 
              style={styles.btnAceptarPoliticas}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              ENTIENDO, IR A SERVICIOS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- OBJETO DE ESTILOS UNIFICADO ---
const styles = {
  heroContainer: {
    height: '100vh', width: '100%',
    backgroundImage: 'url("/toallas.jpg")',
    backgroundSize: 'cover', backgroundPosition: 'center',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', textAlign: 'center', position: 'relative'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
    padding: '60px 40px', borderRadius: '20px', maxWidth: '800px', width: '90%',
  },
  title: { 
    fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: '300', margin: '0 0 20px 0',
    fontFamily: "'Playfair Display', serif", textShadow: '0px 4px 15px rgba(0,0,0,0.4)'
  },
  subtitle: { 
    fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)', minHeight: '3.5em', 
    marginBottom: '40px', letterSpacing: '1.2px', fontWeight: '300', fontStyle: 'italic'
  },
  button: {
    padding: '16px 45px', backgroundColor: 'transparent', color: 'white',
    border: '1px solid white', borderRadius: '50px', cursor: 'pointer',
    fontSize: '0.85rem', letterSpacing: '3px', transition: 'all 0.5s ease', textTransform: 'uppercase'
  },

  /* --- ESTILOS DEL MODAL --- */
  modalPoliticasOverlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(26, 26, 26, 0.85)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 3000,
    backdropFilter: 'blur(8px)'
  },
  modalPoliticasCard: {
    backgroundColor: '#f2ede4',
    padding: '45px 50px', borderRadius: '15px', 
    maxWidth: '520px', width: '95%', textAlign: 'center', 
    boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
    border: '1px solid #e9c4a6',
  },
  modalHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '25px'
  },
  modalDecor: {
    height: '1px', width: '30px', backgroundColor: '#c5bc8a'
  },
  modalPoliticasTitle: { 
    fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', 
    color: '#a67c52', margin: 0, fontWeight: '400', letterSpacing: '1px'
  },
  modalPoliticasIntro: { 
    fontSize: '1.15rem', marginBottom: '35px', color: '#444', 
    lineHeight: '1.6', maxWidth: '450px', marginInline: 'auto'
  },
  listaPoliticasResaltada: { 
    textAlign: 'left', marginBottom: '40px'
  },
  itemPoliticaAccesible: { 
    display: 'flex', alignItems: 'flex-start', gap: '15px',
    marginBottom: '20px', fontSize: '1.2rem', color: '#1a1a1a', 
    lineHeight: '1.5'
  },
  bulletDorado: {
    minWidth: '10px', height: '10px', borderRadius: '50%', 
    backgroundColor: '#c5bc8a', marginTop: '10px'
  },
  btnAceptarPoliticas: {
    backgroundColor: '#a67c52', color: '#ffffff', border: 'none',
    padding: '14px 35px', cursor: 'pointer',
    fontWeight: '600', fontSize: '0.9rem', letterSpacing: '1.5px', 
    transition: 'all 0.4s ease', textTransform: 'uppercase',
    borderRadius: '50px', display: 'inline-block'
  }
};

export default Hero;