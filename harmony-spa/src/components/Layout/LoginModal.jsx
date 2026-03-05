import React, { useState } from 'react';
import { supabase } from "../../lib/supabaseClient";
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

const LoginModal = ({ alCerrar, alLoguear }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false); // <--- NUEVO
  const [datosUsuario, setDatosUsuario] = useState({ nombre: '', rol: '' }); // <--- NUEVO

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: perfiles, error: perfilError } = await supabase
        .from('users')
        .select('id, rol, nombre')
        .eq('id', data.user.id);

      if (perfilError || !perfiles || perfiles.length === 0) throw new Error("Perfil no encontrado");

      const perfil = perfiles[0];

      // Guardar en LocalStorage
      localStorage.setItem('harmony_user_id', perfil.id);
      localStorage.setItem('harmony_rol', perfil.rol);
      localStorage.setItem('harmony_user', perfil.nombre);
      localStorage.setItem('harmony_admin', perfil.rol === 'ADMIN' ? 'true' : 'false');

      if (alLoguear) alLoguear(perfil); 
      
      // --- PASO CLAVE: ACTIVAR BIENVENIDA ---
      setDatosUsuario({ nombre: perfil.nombre, rol: perfil.rol });
      setMostrarBienvenida(true);

      // Esperar 3 segundos para que luzca el cartel y luego redirigir
      setTimeout(() => {
        if (perfil.rol === 'ADMIN') {
          window.location.href = "/vouchers";
        } else {
          window.location.href = "/equipo";
        }
      }, 3000);

    } catch (error) {
      alert("Error al iniciar sesión: " + error.message);
      setCargando(false);
    }
  };

  return (
    <>
      {/* Si NO se está mostrando la bienvenida, mostramos el formulario de login */}
      {!mostrarBienvenida ? (
        <div style={styles.overlay} onClick={alCerrar}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.titulo}>Identificarse</h2>
            <p style={styles.subtitulo}>Accede a tu perfil de Harmony</p>
            
            <form onSubmit={handleLogin}>
              <input 
                type="email" 
                placeholder="Email" 
                style={styles.input} 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="Contraseña" 
                style={styles.input} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              <button type="submit" style={styles.btnEntrar} disabled={cargando}>
                {cargando ? 'ENTRANDO...' : 'ENTRAR'}
              </button>
              <button type="button" onClick={alCerrar} style={styles.btnCerrar}>Cancelar</button>
            </form>
          </div>
        </div>
      ) : (
        /* Si el login fue exitoso, mostramos el cartel de bienvenida */
        <WelcomeModal nombre={datosUsuario.nombre} rol={datosUsuario.rol} />
      )}
    </>
  );
};

const styles = {
  // ... Tus estilos de overlay y modal ...
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(26, 26, 26, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(5px)' },
  modal: { background: 'white', padding: '40px', borderRadius: '25px', width: '320px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
  titulo: { color: '#8c6d4f', margin: '0 0 5px 0', fontWeight: '400', fontFamily: 'Playfair Display' },
  subtitulo: { fontSize: '0.7rem', color: '#bfa38a', marginBottom: '25px', letterSpacing: '1px', textTransform: 'uppercase' },
  input: { width: '100%', padding: '14px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #f2e9e1', boxSizing: 'border-box', backgroundColor: '#fdfcfb' },
  btnEntrar: { width: '100%', padding: '15px', background: '#a6835a', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px', transition: '0.3s' },
  btnCerrar: { marginTop: '10px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.8rem' },

  // --- Estilos de la Bienvenida ---
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