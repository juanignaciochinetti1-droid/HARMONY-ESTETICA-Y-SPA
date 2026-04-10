import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // <--- Importamos el contexto

const CardEspecialista = ({ 
  especialista, 
  alVerHistorial, 
  alBorrar, 
  alEditar, 
  alGestionarHorarios,
  alVerHistorialDashboard,
  alCambiarPass, 
  isAdmin 
}) => {
  const { profile } = useAuth(); // <--- Obtenemos el perfil real
  
  const { nombre, apellido, especialidad, activo, id, foto_url } = especialista;
  const [menuAbierto, setMenuAbierto] = useState(false);

  // --- NUEVA LÓGICA DE PERMISOS BASADA EN EL CONTEXTO ---
  const esAdminReal = profile?.rol === 'ADMIN';
  const idLogueado = profile?.id;
  const esMiPropioPerfil = id === idLogueado;

  return (
    <div style={{ ...styles.card, opacity: activo ? 1 : 0.8 }}>
      
      {/* Menú de Opciones */}
      {isAdmin && (
        <div style={styles.optionsContainer}>
          <div style={styles.optionsDot} onClick={() => setMenuAbierto(!menuAbierto)}>⋮</div>
          {menuAbierto && (
            <div style={styles.menuDesplegable}>
              <div style={styles.menuItem} onClick={() => { alGestionarHorarios(); setMenuAbierto(false); }}>📅 Gestionar Horarios</div>
              <div style={styles.menuItem} onClick={() => { alVerHistorialDashboard(); setMenuAbierto(false); }}>📋 Ver historial/agenda</div>
              
              {/* Solo el dueño del perfil puede cambiar su clave */}
              {esMiPropioPerfil && (
                <div style={{ ...styles.menuItem, borderTop: '1px solid #f2e9e1', fontWeight: 'bold' }} onClick={() => { alCambiarPass(); setMenuAbierto(false); }}>🔑 Cambiar mi clave</div>
              )}
              
              {/* Solo el Admin puede editar o borrar a otros */}
              {esAdminReal && (
                <>
                  <div style={{ ...styles.menuItem, borderTop: '1px solid #f2e9e1' }} onClick={() => { alEditar(); setMenuAbierto(false); }}>✏️ Editar Perfil</div>
                  <div style={{ ...styles.menuItem, color: '#e74c3c' }} onClick={() => { alBorrar(id); setMenuAbierto(false); }}>🗑️ Eliminar</div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Imagen */}
      <div style={styles.imageContainer}>
        <img 
  src={especialista.foto_url || '/avatar-default.png'} 
  alt={especialista.nombre} 
  style={styles.foto} 
/>
      </div>

      <h3 style={styles.name}>{nombre} {apellido}</h3>
      <p style={styles.specialty}>
        {especialidad ? especialidad.toUpperCase() : "PROFESIONAL"}
      </p>

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

// ... Los estilos se mantienen exactamente igual
const styles = {
  card: { backgroundColor: '#fff', borderRadius: '15px', padding: '50px 30px 40px', width: '320px', textAlign: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', position: 'relative', border: '1px solid #f0e6db' },
  optionsContainer: { position: 'absolute', top: '20px', left: '20px', zIndex: 10 },
  optionsDot: { color: '#bfa38a', fontSize: '1.4rem', cursor: 'pointer' },
  menuDesplegable: { position: 'absolute', top: '35px', left: '0', backgroundColor: '#fff', boxShadow: '0 5px 20px rgba(0,0,0,0.15)', borderRadius: '8px', padding: '8px 0', width: '180px', textAlign: 'left', zIndex: 100, border: '1px solid #f2e9e1' },
  menuItem: { padding: '12px 15px', fontSize: '0.85rem', color: '#8c6d4f', cursor: 'pointer' },
  imageContainer: { 
    width: '130px', 
    height: '130px', 
    margin: '0 auto 25px', 
    borderRadius: '50%', 
    overflow: 'hidden', 
    border: '4px solid #f0e6db',
    display: 'flex', // Añadí esto para centrar bien
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdfcfb'
  },
  foto: { // <--- Cambiado de "image" a "foto"
    width: '100%', 
    height: '100%', 
    objectFit: 'cover' 
  },
  name: { color: '#1a1a1a', fontSize: '1.8rem', fontFamily: "'Playfair Display', serif", margin: '10px 0 5px 0' },
  specialty: { color: '#bfa38a', fontSize: '0.75rem', letterSpacing: '2px', marginBottom: '35px', fontWeight: '600' },
  btnDisponibilidad: { color: '#fff', border: 'none', padding: '16px', borderRadius: '50px', width: '100%', fontWeight: '600' },
  footerTexto: { marginTop: '25px', fontSize: '0.7rem', color: '#bfa38a', fontStyle: 'italic' }
};

export default CardEspecialista;