import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const Navbar = ({ onLoginClick, userRole }) => { 
  const navigate = useNavigate();
  
  // Obtenemos el nombre guardado (asegúrate de guardarlo en el Login)
  const nombreUsuario = localStorage.getItem('harmony_user');

  const cerrarSesion = async () => {
    // 1. Cerramos sesión en Supabase (opcional pero recomendado)
    await supabase.auth.signOut();
    
    // 2. Limpiamos TODO el localStorage (Rol, ID, Nombre)
    localStorage.clear();
    
    // 3. Redirigimos al inicio y forzamos recarga para resetear los estados de Admin en toda la app
    window.location.href = "/"; 
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
        
        {/* --- VISTAS POR ROL (Dinámicas) --- */}
        {userRole === 'EMPLEADO' && (
          <li style={styles.menuItem}><Link to="/agenda" style={styles.linkEspecial}>AGENDA</Link></li>
        )}

        {/* --- SECCIÓN DE USUARIO --- */}
        <li style={styles.iconItem}>
          {nombreUsuario ? (
            <div style={styles.userFlex}>
              <div style={styles.userInfo}>
                <span style={styles.userName}>Hola, {nombreUsuario}</span>
                {userRole && <span style={styles.roleBadge}>{userRole}</span>}
              </div>
              <button onClick={cerrarSesion} style={styles.btnSalir}>SALIR</button>
            </div>
          ) : (
            <div onClick={onLoginClick} style={styles.loginTrigger}>
              <span role="img" aria-label="user" style={{ fontSize: '1.2rem' }}>👤</span>
            </div>
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
  logoContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoImg: { width: '40px', height: 'auto' },
  logoText: { margin: 0, fontSize: '1.2rem', letterSpacing: '2px', color: '#8c6d4f', fontWeight: '400' },
  logoSubtext: { margin: 0, fontSize: '0.5rem', letterSpacing: '3px', color: '#bfa38a', textAlign: 'center' },
  menu: { display: 'flex', listStyle: 'none', gap: '25px', margin: 0, alignItems: 'center' },
  menuItem: { fontSize: '0.7rem', color: '#a6835a', cursor: 'pointer', letterSpacing: '1px', fontWeight: '500' },
  iconItem: { color: '#a6835a', cursor: 'pointer', marginLeft: '10px' },
  linkStyle: { textDecoration: 'none', color: 'inherit' },
  linkEspecial: { 
    textDecoration: 'none', 
    color: '#8c6d4f', 
    fontWeight: 'bold', 
    borderBottom: '1px solid #8c6d4f',
    paddingBottom: '2px'
  },
  userFlex: { display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid #f2e9e1', paddingLeft: '20px' },
  userInfo: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  userName: { fontSize: '0.7rem', color: '#8c6d4f', fontWeight: 'bold', textTransform: 'uppercase' },
  roleBadge: { fontSize: '0.5rem', color: '#bfa38a', letterSpacing: '1px' },
  loginTrigger: { display: 'flex', alignItems: 'center', cursor: 'pointer' },
  btnSalir: { 
    background: '#fdfcfb', 
    border: '1px solid #f2e9e1', 
    color: '#8c6d4f', 
    fontSize: '0.6rem', 
    padding: '5px 10px', 
    borderRadius: '20px', 
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: '0.3s'
  }
};

export default Navbar;