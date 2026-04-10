import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn("Perfil no encontrado.");
        setProfile({ rol: 'CLIENTE', nombre: 'Usuario' });
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Error en fetchProfile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // 1. Función para inicializar
  const initialize = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await fetchProfile(session.user.id);
    } else {
      setLoading(false);
    }
  };

  initialize();

  // 2. Escuchar cambios (con filtro de seguridad)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Evento Auth:", event);

    if (session?.user) {
      // IMPORTANTE: Solo buscamos el perfil si el usuario cambió o si NO tenemos perfil aún.
      // Esto detiene el bucle infinito y el error de recursos.
      setUser(prevUser => {
        if (prevUser?.id !== session.user.id) {
          fetchProfile(session.user.id);
        }
        return session.user;
      });
    } else {
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  });

  return () => {
    subscription?.unsubscribe();
  };
}, []); // <--- VOLVEMOS A CORCHETES VACÍOS. Es vital para no entrar en bucle.

  const signOut = async () => {
    try {
      setLoading(true);

      await supabase.auth.signOut();

      // Limpiamos estados
      setUser(null);
      setProfile(null);

      // Limpieza opcional (no siempre necesario, pero lo dejamos)
      localStorage.removeItem('sb-prpszvevpurpchhhsywl-auth-token');

      setLoading(false);

      // Redirección para limpiar UI
      window.location.href = "/";
    } catch (error) {
      console.error("Error al salir:", error);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);