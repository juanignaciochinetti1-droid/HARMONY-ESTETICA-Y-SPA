import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ onLoginClick, userRole }) => { 
  // Obtenemos el nombre para mostrar el saludo
  const nombreUsuario = localStorage.getItem('harmony_user');

  const cerrarSesion = () => {
    localStorage.clear();
    window.location.href = "/"; // Recarga limpia
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logoContainer}>
        <img src="/flor-logo.png" alt="Harmony Logo" style={styles.logoImg} />
        <div>
          <h1 style={styles.logoText}>HARMONY</h1>
          <p style={styles.logoSubtext}>ESTÉTICA Y SPA</p>
        </div>
      </div>

      <ul style={styles.menu}>
        <li style={styles.menuItem}><Link to="/" style={styles.linkStyle}>INICIO</Link></li>
        <li style={styles.menuItem}><Link to="/servicios" style={styles.linkStyle}>SERVICIOS</Link></li>
        <li style={styles.menuItem}><Link to="/equipo" style={styles.linkStyle}>EQUIPO</Link></li>
        <li style={styles.menuItem}><Link to="/vouchers" style={styles.linkStyle}>VOUCHERS</Link></li>

        <li style={styles.menuItem}>
          <a href="https://www.instagram.com/harmony.maguiveron" target="_blank" rel="noopener noreferrer" style={styles.linkStyle}>
            INSTAGRAM
          </a>
        </li>
        
        {/* --- VISTAS POR ROL --- */}
        {userRole === 'EMPLEADO' && (
          <li style={styles.menuItem}><Link to="/agenda" style={styles.linkEspecial}>AGENDA</Link></li>
        )}

        {userRole === 'ADMIN' && (
          <li style={styles.menuItem}><Link to="/admin" style={styles.linkEspecial}>ADMIN</Link></li>
        )}

        {/* --- SECCIÓN DE USUARIO --- */}
        <li style={styles.iconItem}>
          {nombreUsuario ? (
            <div style={styles.userFlex}>
              <span style={styles.userName}>Hola, {nombreUsuario}</span>
              <button onClick={cerrarSesion} style={styles.btnSalir}>SALIR</button>
            </div>
          ) : (
            <span role="img" aria-label="user" style={{ cursor: 'pointer' }} onClick={onLoginClick}>
              👤
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 50px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #f2e9e1',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoImg: {
    width: '40px',
    height: 'auto',
  },
  logoText: {
    margin: 0,
    fontSize: '1.2rem',
    letterSpacing: '2px',
    color: '#8c6d4f',
    fontWeight: '400',
  },
  logoSubtext: {
    margin: 0,
    fontSize: '0.5rem',
    letterSpacing: '3px',
    color: '#bfa38a',
    textAlign: 'center',
  },
  menu: {
    display: 'flex',
    listStyle: 'none',
    gap: '25px',
    margin: 0,
    alignItems: 'center',
  },
  menuItem: {
    fontSize: '0.7rem',
    color: '#a6835a',
    cursor: 'pointer',
    letterSpacing: '1px',
    fontWeight: '500',
  },
  iconItem: {
    fontSize: '1rem',
    color: '#a6835a',
    cursor: 'pointer',
    marginLeft: '10px'
  },
  linkStyle: { textDecoration: 'none', color: 'inherit' },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 50px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #f2e9e1',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoImg: { width: '40px', height: 'auto' },
  logoText: { margin: 0, fontSize: '1.2rem', letterSpacing: '2px', color: '#8c6d4f', fontWeight: '400' },
  logoSubtext: { margin: 0, fontSize: '0.5rem', letterSpacing: '3px', color: '#bfa38a', textAlign: 'center' },
  menu: { display: 'flex', listStyle: 'none', gap: '25px', margin: 0, alignItems: 'center' },
  menuItem: { fontSize: '0.7rem', color: '#a6835a', cursor: 'pointer', letterSpacing: '1px', fontWeight: '500' },
  iconItem: { fontSize: '1rem', color: '#a6835a', cursor: 'pointer', marginLeft: '10px' },
  linkStyle: { textDecoration: 'none', color: 'inherit' },
  
  // NUEVOS ESTILOS PARA ROLES:
  linkEspecial: { 
    textDecoration: 'none', 
    color: '#8c6d4f', 
    fontWeight: 'bold', 
    borderBottom: '1px solid #8c6d4f' 
  },
  userFlex: { display: 'flex', alignItems: 'center', gap: '10px' },
  userName: { fontSize: '0.65rem', color: '#8c6d4f', textTransform: 'uppercase' },
  btnSalir: { 
    background: 'none', 
    border: '1px solid #f2e9e1', 
    color: '#aaa', 
    fontSize: '0.6rem', 
    padding: '3px 8px', 
    borderRadius: '10px', 
    cursor: 'pointer'}
};

export default Navbar;