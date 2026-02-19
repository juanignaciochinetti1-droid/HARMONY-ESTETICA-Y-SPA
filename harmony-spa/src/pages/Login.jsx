import React from 'react';
export default function Login() {
  return (
    <div style={{ padding: '100px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ padding: '40px', background: '#fff', borderRadius: '15px', border: '1px solid #f2e9e1', textAlign: 'center' }}>
        <h2 style={{ color: '#8c6d4f' }}>Iniciar Sesión</h2>
        <input type="email" placeholder="Email" style={{ display: 'block', margin: '10px auto', padding: '10px' }} />
        <input type="password" placeholder="Contraseña" style={{ display: 'block', margin: '10px auto', padding: '10px' }} />
        <button style={{ background: '#a6835a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px' }}>ENTRAR</button>
      </div>
    </div>
  );
}