import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
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
        // 2. Buscamos el ROL en tu tabla pública 'users'
        // NUEVA LÓGICA MÁS SEGURA:
const { data: perfiles, error: perfilError } = await supabase
  .from('users')
  .select('rol, nombre')
  .eq('id', data.user.id);

if (perfilError || !perfiles || perfiles.length === 0) {
  // Si llegás acá, es porque el ID de Auth no existe en la tabla public.users
  console.error("ID no encontrado en public.users:", data.user.id);
  alert("Error: Usuario autenticado pero sin perfil en la base de datos.");
  return;
}

const perfil = perfiles[0];

// Guardamos TODO para que el Navbar y las páginas se enteren
localStorage.setItem('harmony_rol', perfil.rol);
localStorage.setItem('harmony_user', perfil.nombre);
localStorage.setItem('harmony_admin', perfil.rol === 'ADMIN' ? 'true' : 'false');

alert(`¡Bienvenido/a ${perfil.nombre}!`);
window.location.href = "/vouchers"; // Recarga total para activar botones
        
        // Redirigimos al inicio o a vouchers
        alert(`¡Bienvenido! Rol: ${perfil.rol}`);
        navigate('/vouchers'); 
      }
    } catch (error) {
      alert("Error al iniciar sesión: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.overlay}>
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
            disabled={cargando}
          >
            {cargando ? 'INGRESANDO...' : 'ENTRAR'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { padding: '100px', display: 'flex', justifyContent: 'center', backgroundColor: '#fcfaf7', minHeight: '100vh' },
  card: { padding: '40px', background: '#fff', borderRadius: '25px', border: '1px solid #f2e9e1', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%' },
  titulo: { color: '#8c6d4f', fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '5px' },
  subtitulo: { color: '#bfa38a', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '30px', textTransform: 'uppercase' },
  input: { display: 'block', width: '100%', margin: '15px 0', padding: '12px', borderRadius: '10px', border: '1px solid #f2e9e1', backgroundColor: '#fdfcfb', boxSizing: 'border-box' },
  btnEntrar: { width: '100%', background: '#1a1a1a', color: 'white', border: 'none', padding: '15px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px', transition: '0.3s' }
};