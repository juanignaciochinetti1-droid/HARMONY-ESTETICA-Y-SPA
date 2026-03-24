import React, { useState } from 'react';
import Hero from '../components/Layout/Hero';
import Servicios from './Servicios';

export default function Home() {
  // Manejamos la vista por estado de React para no romper el AuthContext
  const [seccionActual, setSeccionActual] = useState('hero');

  const ejecutarCambio = () => {
    // Cambiamos de Hero a Servicios sin recargar ni tocar la URL
    setSeccionActual('servicios');
    // Scroll suave hacia arriba para empezar a ver los servicios cómodamente
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main>
      {seccionActual === 'hero' ? (
        <Hero alAceptarPoliticas={ejecutarCambio} />
      ) : (
        <Servicios />
      )}
    </main>
  );
}