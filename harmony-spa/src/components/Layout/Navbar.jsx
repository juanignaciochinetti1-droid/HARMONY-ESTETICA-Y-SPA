import React, { useEffect } from 'react'; // <--- Una sola línea para todo
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 

const Navbar = ({ onLoginClick }) => { 
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  useEffect(() => {
    // Solo logueamos si el perfil existe, así evitamos el 'null' al cargar
    if (profile) {
      console.log("✅ SESIÓN ACTIVA:", profile.nombre, "| ROL:", profile.rol);
    } else {
      console.log("ℹ️ NAVEGANDO COMO INVITADO");
    }
  }, [profile]); // Se mantiene en tamaño 1 siempre.

  // El rol y el nombre ahora vienen del perfil de la base de datos de Supabase
  const nombreUsuario = profile?.nombre;
  const userRole = profile?.rol;

  return (
    <nav style={styles.nav}>
      {/* Logo con link al inicio */}
      <div 
        style={{...styles.logoContainer, cursor: 'pointer'}} 
        onClick={() => navigate('/')}
      >
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
        <li style={styles.menuItem}><Link to="/mis-turnos" style={styles.linkStyle}>MIS TURNOS</Link></li>

        <li style={styles.menuItem}>
          <a href="https://www.instagram.com/harmony.maguiveron" target="_blank" rel="noopener noreferrer" style={styles.linkStyle}>
            INSTAGRAM
          </a>
        </li>
        
        {/* --- SECCIÓN DE USUARIO --- */}
        <li style={styles.iconItem}>
          {profile ? (
            <div style={styles.userFlex}>
              <div style={styles.userInfo}>
                <span style={styles.userName}>Hola, {nombreUsuario}</span>
                {userRole && <span style={styles.roleBadge}>{userRole}</span>}
              </div>
              {/* Usamos el signOut del AuthContext */}
              <button onClick={signOut} style={styles.btnSalir}>SALIR</button>
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