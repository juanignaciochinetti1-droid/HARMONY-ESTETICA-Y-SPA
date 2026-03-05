import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
// --- COMPONENTE INTERNO: CARTEL DE BIENVENIDA ---
const WelcomeModal = ({ nombre, rol }) => {
  return (
    <div style={styles.welcomeOverlay}>
      <div style={styles.welcomeCard}>
        <div style={styles.welcomeIconContainer}>
          <img src="/flor-logo.png" alt="Logo" style={styles.welcomeLogo} />
        </div>
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
};

// --- COMPONENTE PRINCIPAL: LOGIN ---
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false);
  const [datosUsuario, setDatosUsuario] = useState({ nombre: '', rol: '' });
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      // 1. Autenticación con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        // 2. Buscamos el perfil en la tabla pública
        const { data: perfiles, error: perfilError } = await supabase
          .from('users')
          .select('id, rol, nombre')
          .eq('id', data.user.id);

        if (perfilError || !perfiles || perfiles.length === 0) {
          throw new Error("Usuario autenticado pero sin perfil en la base de datos.");
        }

        const perfil = perfiles[0];

        // 3. Guardamos los datos en el LocalStorage
        localStorage.setItem('harmony_user_id', perfil.id);
        localStorage.setItem('harmony_rol', perfil.rol);
        localStorage.setItem('harmony_user', perfil.nombre);
        localStorage.setItem('harmony_admin', perfil.rol === 'ADMIN' ? 'true' : 'false');

        // 4. ACTIVAR BIENVENIDA Y ESPERAR PARA REDIRIGIR
        setDatosUsuario({ nombre: perfil.nombre, rol: perfil.rol });
        setMostrarBienvenida(true);

        setTimeout(() => {
          if (perfil.rol === 'ADMIN') {
            window.location.href = "/vouchers";
          } else {
            window.location.href = "/equipo";
          }
        }, 3000); // 3 segundos de lucidez para el modal
      }
    } catch (error) {
      alert("Error al iniciar sesión: " + error.message);
      setCargando(false);
    }
  };

  return (
    <div style={styles.overlay}>
      {/* CARD DE LOGIN ORIGINAL */}
      <div style={styles.card}>
        <h2 style={styles.titulo}>Harmony Spa</h2>
        <p style={styles.subtitulo}>Ingreso al Sistema</p>
        
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Tu email" 
            style={styles.input} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Tu contraseña" 
            style={styles.input} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            style={styles.btnEntrar}
            disabled={cargando || mostrarBienvenida}
          >
            {cargando ? 'INGRESANDO...' : 'ENTRAR'}
          </button>
        </form>
      </div>

      {/* RENDERIZADO DEL CARTEL DE BIENVENIDA */}
      {mostrarBienvenida && (
        <WelcomeModal nombre={datosUsuario.nombre} rol={datosUsuario.rol} />
      )}
    </div>
  );
}

// --- ESTILOS UNIFICADOS ---
const styles = {
  overlay: { padding: '100px', display: 'flex', justifyContent: 'center', backgroundColor: '#fcfaf7', minHeight: '100vh' },
  card: { padding: '40px', background: '#fff', borderRadius: '25px', border: '1px solid #f2e9e1', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%' },
  titulo: { color: '#8c6d4f', fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '5px' },
  subtitulo: { color: '#bfa38a', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '30px', textTransform: 'uppercase' },
  input: { display: 'block', width: '100%', margin: '15px 0', padding: '12px', borderRadius: '10px', border: '1px solid #f2e9e1', backgroundColor: '#fdfcfb', boxSizing: 'border-box' },
  btnEntrar: { width: '100%', background: '#1a1a1a', color: 'white', border: 'none', padding: '15px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px', transition: '0.3s' },
  
  // Estilos del Welcome Modal
  welcomeOverlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(252, 250, 247, 0.98)', backdropFilter: 'blur(10px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000,
    animation: 'fadeIn 0.5s ease'
  },
  welcomeCard: { textAlign: 'center', padding: '50px', maxWidth: '450px', width: '90%' },
  welcomeIconContainer: { marginBottom: '20px' },
  welcomeLogo: { width: '80px', height: 'auto' },
  welcomeSaludo: { fontFamily: "'Playfair Display', serif", color: '#8c6d4f', fontSize: '2.5rem', margin: '0 0 10px 0' },
  badgeRol: { display: 'inline-block', padding: '5px 15px', backgroundColor: '#f2e9e1', color: '#a6835a', borderRadius: '20px', fontSize: '0.65rem', letterSpacing: '2px', marginBottom: '20px', fontWeight: 'bold' },
  welcomeMensaje: { color: '#bfa38a', fontSize: '1rem', letterSpacing: '0.5px', lineHeight: '1.5' },
  loaderBarContainer: { marginTop: '40px', height: '3px', width: '100%', backgroundColor: '#f2e9e1', borderRadius: '10px', overflow: 'hidden' },
  loaderBarProgress: { height: '100%', backgroundColor: '#c5a37d', width: '100%', animation: 'loadingProgress 3s linear forwards' }
};