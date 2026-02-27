import React, { useState, useEffect } from 'react';
import Hero from '../components/Layout/Hero';
import Servicios from './Servicios';

export default function Home() {
  // Inicializamos el estado basado en si ya existe el hash en la URL
  const [seccionActual, setSeccionActual] = useState(
    window.location.hash === '#servicios' ? 'servicios' : 'hero'
  );

  // Escuchamos cambios en la URL para permitir volver al inicio desde el Navbar
  useEffect(() => {
    const monitorearRuta = () => {
      if (window.location.hash === '#servicios') {
        setSeccionActual('servicios');
      } else {
        setSeccionActual('hero');
      }
    };

    window.addEventListener('hashchange', monitorearRuta);
    return () => window.removeEventListener('hashchange', monitorearRuta);
  }, []);

  const ejecutarCambio = () => {
    // Al cambiar el hash, el useEffect de arriba se dispara solo
    window.location.hash = 'servicios';
  };

  return (
    <>
      {seccionActual === 'hero' ? (
        <Hero alAceptarPoliticas={ejecutarCambio} />
      ) : (
        <Servicios />
      )}
      {/* Aquí podrías poner una bienvenida breve */}
    </>
  );
}