import React, { useState } from 'react';

const CardEspecialista = ({ 
  especialista, 
  alVerHistorial, 
  alBorrar, 
  alEditar, 
  alGestionarHorarios,
  alVerHistorialDashboard,
  alCambiarPass, // <--- NUEVA PROP
  isAdmin 
}) => {
  const { nombre, apellido, especialidad, activo, id } = especialista;
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Verificamos el rol real y el ID del usuario logueado
  const esAdminReal = localStorage.getItem('harmony_rol') === 'ADMIN';
  const idLogueado = localStorage.getItem('harmony_user_id');
  const esMiPropioPerfil = id === idLogueado;

  return (
    <div style={{
      ...styles.card,
      opacity: activo ? 1 : 0.8
    }}>
      
      {/* --- BLOQUE DE SEGURIDAD: Control de Menú --- */}
      {isAdmin && (
        <div style={styles.optionsContainer}>
          <div 
            style={styles.optionsDot} 
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            ⋮
          </div>
          
          {menuAbierto && (
            <div style={styles.menuDesplegable}>
              {/* Opciones disponibles para el Empleado y el Admin */}
              <div style={styles.menuItem} onClick={() => { alGestionarHorarios(); setMenuAbierto(false); }}>
                📅 Gestionar Horarios
              </div>

              <div style={styles.menuItem} onClick={() => { alVerHistorialDashboard(); setMenuAbierto(false); }}>
                📋 Ver historial/agenda
              </div>

              {/* NUEVA OPCIÓN: Solo para el dueño del perfil */}
              {esMiPropioPerfil && (
                <div 
                  style={{ ...styles.menuItem, borderTop: '1px solid #f2e9e1', fontWeight: 'bold' }} 
                  onClick={() => { alCambiarPass(); setMenuAbierto(false); }}
                >
                  🔑 Cambiar mi clave
                </div>
              )}

              {/* Opciones EXCLUSIVAS para el Admin real */}
              {esAdminReal && (
                <>
                  <div 
                    style={{ ...styles.menuItem, borderTop: '1px solid #f2e9e1' }} 
                    onClick={() => { alEditar(); setMenuAbierto(false); }}
                  >
                    ✏️ Editar Perfil
                  </div>
                  
                  <div 
                    style={{ ...styles.menuItem, color: '#e74c3c' }} 
                    onClick={() => { alBorrar(id); setMenuAbierto(false); }}
                  >
                    🗑️ Eliminar
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Imagen del Especialista */}
      <div style={styles.imageContainer}>
        <img 
          src={especialista.foto_url || "/avatar-placeholder.png"} 
          alt={nombre} 
          style={{ ...styles.image, filter: activo ? 'none' : 'grayscale(100%)' }} 
        />
      </div>

      {/* Identidad Visual Harmony Spa */}
      <h3 style={styles.name}>{nombre} {apellido}</h3>
      <p style={styles.specialty}>{especialidad?.toUpperCase() || 'ESPECIALIDAD'}</p>

      {/* Botón Principal */}
      <button 
        onClick={activo ? alVerHistorial : null}
        style={{
          ...styles.btnDisponibilidad,
          backgroundColor: activo ? '#c5a37d' : '#ccc',
          cursor: activo ? 'pointer' : 'not-allowed'
        }}
      >
        {activo ? 'VER DISPONIBILIDAD' : 'NO DISPONIBLE'}
      </button>

      <p style={styles.footerTexto}>* Profesional verificado por Harmony Spa</p>
    </div>
  );
};

// ... estilos (se mantienen igual) ...

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    padding: '50px 30px 40px',
    width: '320px',
    textAlign: 'center',
    boxShadow: '0 15px 35px rgba(0,0,0,0.05)',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid #f0e6db',
    transition: 'transform 0.3s ease',
  },
  optionsContainer: { position: 'absolute', top: '20px', left: '20px', zIndex: 10 },  
  optionsDot: { color: '#bfa38a', fontSize: '1.4rem', cursor: 'pointer', padding: '5px' },
  menuDesplegable: {
    position: 'absolute',
    top: '35px',
    left: '0',
    backgroundColor: '#fff',
    boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
    borderRadius: '8px',
    padding: '8px 0',
    width: '180px',
    textAlign: 'left',
    zIndex: 100,
    border: '1px solid #f2e9e1'
  },
  menuItem: { padding: '12px 15px', fontSize: '0.85rem', color: '#8c6d4f', cursor: 'pointer', transition: 'background 0.2s' },
  imageContainer: { width: '130px', height: '130px', margin: '0 auto 25px', borderRadius: '50%', overflow: 'hidden', border: '4px solid #f0e6db', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  name: { color: '#1a1a1a', fontSize: '1.8rem', fontFamily: "'Playfair Display', serif", margin: '10px 0 5px 0', fontWeight: '400' },
  specialty: { color: '#bfa38a', fontSize: '0.75rem', letterSpacing: '2px', marginBottom: '35px', fontWeight: '600' },
  btnDisponibilidad: { backgroundColor: '#c5a37d', color: '#fff', border: 'none', padding: '16px', borderRadius: '50px', width: '100%', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', letterSpacing: '1px', transition: 'background 0.3s', boxShadow: '0 4px 10px rgba(197, 163, 125, 0.2)' },
  footerTexto: { marginTop: '25px', fontSize: '0.7rem', color: '#bfa38a', fontStyle: 'italic', letterSpacing: '0.5px' }
};

export default CardEspecialista;