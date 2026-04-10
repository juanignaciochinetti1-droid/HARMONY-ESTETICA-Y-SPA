import React, { useState } from 'react';
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from 'react-router-dom'; // Importamos el navegador
import '../../App.css';

// --- COMPONENTE INTERNO: CARTEL DE BIENVENIDA ---
const WelcomeModal = ({ nombre, rol }) => (
  <div style={styles.welcomeOverlay}>
    <div style={styles.welcomeCard}>
      <img src="/flor-logo.png" alt="Logo" style={styles.welcomeLogo} />
      <h2 style={styles.welcomeSaludo}>¡Hola, {nombre}!</h2>
      <div style={styles.badgeRol}>
        {rol === 'ADMIN' ? 'PANEL DE CONTROL' : 'ACCESO PROFESIONAL'}
      </div>
      <p style={styles.welcomeMensaje}>
        {rol === 'ADMIN' 
          ? 'Bienvenida a la gestión de tu centro de estética.' 
          : 'Tu agenda y pacientes te están esperando.'}
      </p>
      <div style={styles.loaderBarContainer}>
        <div style={styles.loaderBarProgress}></div>
      </div>
    </div>
  </div>
);

// --- COMPONENTE INTERNO: ICONOS SVG ---
const IconoOjoAbierto = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a6835a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const IconoOjoCerrado = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a6835a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const LoginModal = ({ alCerrar }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorLogin, setErrorLogin] = useState(false);
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false);
  const [datosUsuario, setDatosUsuario] = useState({ nombre: '', rol: '' });
  const [verPassword, setVerPassword] = useState(false);
  
  const navigate = useNavigate(); // Hook para navegar sin refrescar

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setErrorLogin(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setErrorLogin(true);
        throw error;
      }

      const { data: perfiles, error: perfilError } = await supabase
        .from('users')
        .select('id, rol, nombre, activo')
        .eq('id', data.user.id)
        .single();

      if (perfilError || !perfiles) throw new Error("Perfil no encontrado");

      // Validación de usuario activo
      if (perfiles.activo === false) {
        await supabase.auth.signOut();
        throw new Error("Tu cuenta está desactivada.");
      }

      const perfil = perfiles;

      setDatosUsuario({ nombre: perfil.nombre, rol: perfil.rol });
      setMostrarBienvenida(true);

      // El AuthContext ya detectó el login, así que solo esperamos la animación
      setTimeout(() => {
        setMostrarBienvenida(false);
        alCerrar(); // Cerramos el modal
        
        // Navegación interna (No usa window.location.href para evitar refrescos)
        if (perfil.rol === 'ADMIN') {
          navigate("/vouchers");
        } else {
          // Si es empleado o cliente, lo dejamos donde estaba
          navigate("/"); 
        }
      }, 3000);

    } catch (error) {
      console.error("Login fallido:", error.message);
      setCargando(false);
    }
  };

  return (
    <>
      {!mostrarBienvenida ? (
        <div style={styles.overlay} onClick={alCerrar}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.titulo}>Identificarse</h2>
            <p style={styles.subtitulo}>Accede a tu perfil de Harmony</p>
            
            {errorLogin && (
              <div style={styles.errorBanner}>
                Credenciales inválidas o cuenta desactivada.
              </div>
            )}

            <form onSubmit={handleLogin}>
              <input 
                type="email" 
                placeholder="Email" 
                style={styles.input} 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div style={styles.passwordContainer}>
                <input 
                  type={verPassword ? "text" : "password"} 
                  placeholder="Contraseña" 
                  style={styles.inputPassword} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setVerPassword(!verPassword)} 
                  style={styles.btnOjo}
                >
                  {verPassword ? <IconoOjoCerrado /> : <IconoOjoAbierto />}
                </button>
              </div>
              
              <button type="submit" style={styles.btnEntrar} disabled={cargando}>
                {cargando ? 'ENTRANDO...' : 'ENTRAR'}
              </button>
              <button type="button" onClick={alCerrar} style={styles.btnCerrar}>Cancelar</button>
            </form>
          </div>
        </div>
      ) : (
        <WelcomeModal nombre={datosUsuario.nombre} rol={datosUsuario.rol} />
      )}
    </>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(26, 26, 26, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(5px)' },
  modal: { background: 'white', padding: '40px', borderRadius: '25px', width: '320px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
  titulo: { color: '#8c6d4f', margin: '0 0 5px 0', fontWeight: '400', fontFamily: 'Playfair Display' },
  subtitulo: { fontSize: '0.7rem', color: '#bfa38a', marginBottom: '25px', letterSpacing: '1px', textTransform: 'uppercase' },
  errorBanner: { backgroundColor: '#fdeaea', color: '#e74c3c', padding: '10px', borderRadius: '10px', fontSize: '0.8rem', marginBottom: '15px', border: '1px solid #f9d6d6' },
  input: { width: '100%', padding: '14px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #f2e9e1', boxSizing: 'border-box', backgroundColor: '#fdfcfb' },
  passwordContainer: { position: 'relative', width: '100%', marginBottom: '15px' },
  inputPassword: { width: '100%', padding: '14px', paddingRight: '45px', borderRadius: '12px', border: '1px solid #f2e9e1', boxSizing: 'border-box', backgroundColor: '#fdfcfb' },
  btnOjo: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, opacity: 0.8 },
  btnEntrar: { width: '100%', padding: '15px', background: '#a6835a', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px' },
  btnCerrar: { marginTop: '10px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.8rem' },
  welcomeOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(252, 250, 247, 0.98)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  welcomeCard: { textAlign: 'center', padding: '50px', maxWidth: '450px', width: '90%' },
  welcomeLogo: { width: '80px', height: 'auto', marginBottom: '20px' },
  welcomeSaludo: { fontFamily: "'Playfair Display', serif", color: '#8c6d4f', fontSize: '2.5rem', margin: '0 0 10px 0' },
  badgeRol: { display: 'inline-block', padding: '5px 15px', backgroundColor: '#f2e9e1', color: '#a6835a', borderRadius: '20px', fontSize: '0.65rem', letterSpacing: '2px', marginBottom: '20px', fontWeight: 'bold' },
  welcomeMensaje: { color: '#bfa38a', fontSize: '1rem', letterSpacing: '0.5px', lineHeight: '1.5' },
  loaderBarContainer: { marginTop: '40px', height: '3px', width: '100%', backgroundColor: '#f2e9e1', borderRadius: '10px', overflow: 'hidden' },
  loaderBarProgress: { height: '100%', backgroundColor: '#c5a37d', width: '100%', animation: 'loadingProgress 3s linear forwards' }
};

export default LoginModal;