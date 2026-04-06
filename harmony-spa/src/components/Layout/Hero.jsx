import React, { useState, useEffect } from 'react';

const Hero = ({ alAceptarPoliticas }) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [indice, setIndice] = useState(0);
  const [fade, setFade] = useState(true);

  // --- NUEVO: ESTADO PARA RESPONSIVE ---
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    
    const intervalo = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndice((prevIndice) => (prevIndice + 1) % frases.length);
        setFade(true);
      }, 500);
    }, 2500);

    return () => {
      clearInterval(intervalo);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const frases = [
    "Resaltamos tu belleza natural con excelencia profesional.",
    "Invertir en vos es tu mejor decisión del día.",
    "El cuidado de tu piel es el reflejo de tu amor propio.",
    "Regalate un respiro, te mereces un momento de calma.",
    "Belleza es sentirte cómoda en tu propia piel.",
    "Tu bienestar es la prioridad; nosotros, el camino.",
    "Potenciamos lo que te hace única."
  ];

  const manejarAceptar = () => {
    setMostrarModal(false);
    if (alAceptarPoliticas) {
      alAceptarPoliticas();
    }
  };

  return (
    <div style={styles.heroContainer}>
      <div style={{
        ...styles.overlay,
        padding: isMobile ? '40px 20px' : '60px 40px',
        width: isMobile ? '85%' : '90%'
      }}>
        <h1 style={styles.title}>Tu momento de calma</h1>
        
        <p style={{
          ...styles.subtitle, 
          opacity: fade ? 1 : 0, 
          transition: 'opacity 0.6s ease-in-out',
          minHeight: isMobile ? '4.5em' : '3.5em' // Un poco más de espacio en móvil
        }}>
          {frases[indice]}
        </p>

        <button 
          style={styles.button}
          onClick={() => setMostrarModal(true)}
        >
          INFORMACIÓN
        </button>
      </div>

      {/* --- MODAL DE POLÍTICAS --- */}
      {mostrarModal && (
        <div style={styles.modalPoliticasOverlay} onClick={() => setMostrarModal(false)}>
          <div style={{
            ...styles.modalPoliticasCard,
            padding: isMobile ? '30px 20px' : '45px 50px',
            maxHeight: isMobile ? '90vh' : 'auto',
            overflowY: isMobile ? 'auto' : 'visible'
          }} onClick={(e) => e.stopPropagation()}>
            
            <div style={styles.modalHeader}>
              {!isMobile && <span style={styles.modalDecor}></span>}
              <h3 style={{
                ...styles.modalPoliticasTitle,
                fontSize: isMobile ? '1.6rem' : '2.2rem'
              }}>Reserva de Turno</h3>
              {!isMobile && <span style={styles.modalDecor}></span>}
            </div>
            
            <p style={{
              ...styles.modalPoliticasIntro,
              fontSize: isMobile ? '1rem' : '1.15rem',
              marginBottom: isMobile ? '20px' : '35px'
            }}>
              Para garantizar una excelencia en <strong>Harmony</strong>, nuestras políticas:
            </p>
            
            <div style={styles.listaPoliticasResaltada}>
              <div style={styles.itemPoliticaAccesible}>
                <span style={styles.bulletDorado}></span>
                <p style={{ fontSize: isMobile ? '0.9rem' : '1.1rem' }}><strong>Seña:</strong> Confirmación mediante seña del <strong>30%</strong>.</p>
              </div>
              <div style={styles.itemPoliticaAccesible}>
                <span style={styles.bulletDorado}></span>
                <p style={{ fontSize: isMobile ? '0.9rem' : '1.1rem' }}><strong>Cambios:</strong> Reprogramar con <strong>24 hs</strong> de antelación.</p>
              </div>
              <div style={styles.itemPoliticaAccesible}>
                <span style={styles.bulletDorado}></span>
                <p style={{ fontSize: isMobile ? '0.9rem' : '1.1rem' }}><strong>Pagos:</strong> Cuentas bancarias y medios electrónicos.</p>
              </div>
              <div style={styles.itemPoliticaAccesible}>
                <span style={styles.bulletDorado}></span>
                <p style={{ fontSize: isMobile ? '0.9rem' : '1.1rem' }}><strong>Reembolsos:</strong> La seña no es reembolsable fuera de plazo.</p>
              </div>
            </div>

            <button onClick={manejarAceptar} style={styles.btnAceptarPoliticas}>
              ENTIENDO, IR A SERVICIOS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  heroContainer: { 
    height: '100vh', 
    width: '100%', 
    backgroundImage: 'url("/toallas.jpg")', 
    backgroundSize: 'cover', 
    backgroundPosition: 'center', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: 'white', 
    textAlign: 'center', 
    position: 'relative' 
  },
  overlay: { 
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    backdropFilter: 'blur(4px)', 
    borderRadius: '20px', 
    maxWidth: '800px' 
  },
  title: { 
    fontSize: 'clamp(2.2rem, 8vw, 5rem)', 
    fontWeight: '300', 
    margin: '0 0 20px 0', 
    fontFamily: "'Playfair Display', serif", 
    textShadow: '0px 4px 15px rgba(0,0,0,0.4)' 
  },
  subtitle: { 
    fontSize: 'clamp(1rem, 3vw, 1.6rem)', 
    marginBottom: '40px', 
    letterSpacing: '1.2px', 
    fontWeight: '300', 
    fontStyle: 'italic',
    lineHeight: '1.4'
  },
  button: { 
    padding: '16px 45px', 
    backgroundColor: 'transparent', 
    color: 'white', 
    border: '1px solid white', 
    borderRadius: '50px', 
    cursor: 'pointer', 
    fontSize: '0.8rem', 
    letterSpacing: '3px', 
    transition: 'all 0.3s ease', 
    textTransform: 'uppercase' 
  },
  modalPoliticasOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    backgroundColor: 'rgba(26, 26, 26, 0.85)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 3000, 
    backdropFilter: 'blur(8px)' 
  },
  modalPoliticasCard: { 
    backgroundColor: '#f2ede4', 
    borderRadius: '15px', 
    maxWidth: '520px', 
    width: '90%', 
    textAlign: 'center', 
    boxShadow: '0 30px 60px rgba(0,0,0,0.6)', 
    border: '1px solid #e9c4a6' 
  },
  modalHeader: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '15px', 
    marginBottom: '20px' 
  },
  modalDecor: { height: '1px', width: '30px', backgroundColor: '#c5bc8a' },
  modalPoliticasTitle: { 
    fontFamily: "'Playfair Display', serif", 
    color: '#a67c52', 
    margin: 0, 
    fontWeight: '400', 
    letterSpacing: '1px' 
  },
  modalPoliticasIntro: { 
    color: '#444', 
    lineHeight: '1.4', 
    maxWidth: '450px', 
    marginInline: 'auto' 
  },
  listaPoliticasResaltada: { textAlign: 'left', marginBottom: '30px' },
  itemPoliticaAccesible: { 
    display: 'flex', 
    alignItems: 'flex-start', 
    gap: '12px', 
    marginBottom: '15px', 
    color: '#1a1a1a', 
    lineHeight: '1.4' 
  },
  bulletDorado: { 
    minWidth: '8px', 
    height: '8px', 
    borderRadius: '50%', 
    backgroundColor: '#c5bc8a', 
    marginTop: '6px' 
  },
  btnAceptarPoliticas: { 
    backgroundColor: '#a67c52', 
    color: '#ffffff', 
    border: 'none', 
    padding: '14px 30px', 
    cursor: 'pointer', 
    fontWeight: '600', 
    fontSize: '0.85rem', 
    letterSpacing: '1px', 
    transition: 'all 0.4s ease', 
    textTransform: 'uppercase', 
    borderRadius: '50px', 
    display: 'inline-block' 
  }
};

export default Hero;