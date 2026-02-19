import React, { useState } from 'react';

// 1. Asegúrate de incluir alVerHistorialDashboard en la lista de props
const CardEspecialista = ({ 
  especialista, 
  alVerHistorial, 
  alBorrar, 
  alEditar, 
  alGestionarHorarios,
  alVerHistorialDashboard 
}) => {
  const { nombre, apellido, especialidad, activo, id } = especialista;
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div style={{
      ...styles.card,
      opacity: activo ? 1 : 0.7
    }}>
      {/* Menú lateral izquierdo */}
      <div style={styles.optionsContainer}>
        <div style={styles.optionsDot} onClick={() => setMenuAbierto(!menuAbierto)}>⋮</div>
        
        {menuAbierto && (
          <div style={styles.menuDesplegable}>
            <div style={styles.menuItem} onClick={() => { alEditar(); setMenuAbierto(false); }}>
              Editar Perfil
            </div>
            
            <div style={styles.menuItem} onClick={() => { alGestionarHorarios(); setMenuAbierto(false); }}>
              Gestionar Horarios
            </div>

            {/* Esta es la nueva opción para el Dashboard de turnos */}
            <div style={styles.menuItem} onClick={() => { alVerHistorialDashboard(); setMenuAbierto(false); }}>
              Ver historial/agenda
            </div>

            <div style={{ ...styles.menuItem, color: '#e57373' }} onClick={() => { alBorrar(id); setMenuAbierto(false); }}>
              Eliminar
            </div>
          </div>
        )}
      </div>

      <div style={styles.imageContainer}>
        <img 
          src={especialista.foto_url || "/avatar-placeholder.png"} 
          alt={nombre} 
          style={{ ...styles.image, filter: activo ? 'none' : 'grayscale(100%)' }} 
        />
      </div>

      <h3 style={styles.name}>{nombre} {apellido}</h3>
      <p style={styles.specialty}>{especialidad?.toUpperCase() || 'ESPECIALIDAD'}</p>

      {/* Botón Principal: Abre Calendario (alVerHistorial) */}
      <button 
        onClick={activo ? alVerHistorial : null}
        style={{
          ...styles.btnDisponibilidad,
          backgroundColor: activo ? '#a6835a' : '#ccc',
          cursor: activo ? 'pointer' : 'not-allowed'
        }}
      >
        {activo ? 'DISPONIBILIDAD' : 'NO DISPONIBLE'}
      </button>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '25px',
    padding: '30px 20px',
    width: '240px',
    textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    position: 'relative',
    border: '1px solid #f2e9e1',
    transition: 'transform 0.3s ease'
  },
  optionsContainer: { 
    position: 'absolute', 
    top: '15px', 
    left: '20px', 
    zIndex: 10 
  },  
  optionsDot: { color: '#d1c4b9', fontSize: '1.2rem', cursor: 'pointer', padding: '5px' },
  menuDesplegable: {
    position: 'absolute',
    top: '25px',
    left: '0',
    backgroundColor: '#fff',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    borderRadius: '10px',
    padding: '10px 0',
    width: '150px',
    textAlign: 'left',
    zIndex: 100,
    border: '1px solid #f2e9e1'
  },
  menuItem: {
    padding: '8px 15px',
    fontSize: '0.7rem',
    color: '#8c6d4f',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  imageContainer: {
    width: '110px',
    height: '110px',
    margin: '0 auto 15px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid #fdfbf9'
  },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  name: { color: '#8c6d4f', fontSize: '1.1rem', margin: '10px 0 5px 0', fontWeight: '500' },
  specialty: { color: '#bfa38a', fontSize: '0.65rem', letterSpacing: '2px', marginBottom: '20px' },
  btnDisponibilidad: {
    border: 'none',
    color: 'white',
    padding: '8px 20px',
    borderRadius: '15px',
    fontSize: '0.6rem',
    letterSpacing: '1px',
    fontWeight: 'bold'
  },
};

export default CardEspecialista;