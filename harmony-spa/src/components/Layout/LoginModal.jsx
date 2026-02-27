import React, { useState } from 'react';
import { supabase } from "../../lib/supabaseClient";
const LoginModal = ({ alCerrar, alLoguear }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      // 1. Autenticación en Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 2. Buscamos el ROL del usuario en nuestra tabla pública 'users'
      const { data: perfil, error: perfilError } = await supabase
        .from('users')
        .select('rol, nombre')
        .eq('id', data.user.id)
        .single();

      if (perfilError) throw perfilError;

      // 3. Guardamos el rol en localStorage (para que la web sepa qué mostrar)
      localStorage.setItem('harmony_rol', perfil.rol);
      localStorage.setItem('harmony_user', perfil.nombre);
      
      // Si es admin, activamos la marca que ya veníamos usando
      if (perfil.rol === 'ADMIN') {
        localStorage.setItem('harmony_admin', 'true');
      } else {
        localStorage.removeItem('harmony_admin');
      }

      alert(`¡Bienvenido/a ${perfil.nombre}!`);
      if (alLoguear) alLoguear(perfil); // Avisamos al componente padre
      alCerrar();
      window.location.reload(); // Recargamos para que se apliquen los permisos

    } catch (error) {
      alert("Error al iniciar sesión: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
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
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(26, 26, 26, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(5px)' },
  modal: { background: 'white', padding: '40px', borderRadius: '25px', width: '320px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
  titulo: { color: '#8c6d4f', margin: '0 0 5px 0', fontWeight: '400', fontFamily: 'Playfair Display' },
  subtitulo: { fontSize: '0.7rem', color: '#bfa38a', marginBottom: '25px', letterSpacing: '1px', textTransform: 'uppercase' },
  input: { width: '100%', padding: '14px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #f2e9e1', boxSizing: 'border-box', backgroundColor: '#fdfcfb' },
  btnEntrar: { width: '100%', padding: '15px', background: '#a6835a', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px', transition: '0.3s' },
  btnCerrar: { marginTop: '10px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.8rem' }
};

export default LoginModal;