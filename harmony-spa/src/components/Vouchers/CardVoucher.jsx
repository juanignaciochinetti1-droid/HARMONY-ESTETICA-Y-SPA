import React, { useState } from 'react';

const CardVoucher = ({ voucher, alComprar, alBorrar, alEditar, isAdmin }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="voucher-card" style={{ 
      backgroundColor: '#fff', padding: '40px 30px', borderRadius: '15px', width: '320px', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)', position: 'relative', overflow: 'visible', border: '1px solid #f0e6db' 
    }}>
      {/* Menú de Opciones (Solo Admin) */}
      {isAdmin && (
        <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 10 }}>
          <div onClick={() => setMenuAbierto(!menuAbierto)} style={{ cursor: 'pointer', color: '#bfa38a', fontSize: '1.2rem' }}>⋮</div>
          {menuAbierto && (
            <div style={{ position: 'absolute', top: '25px', left: 0, backgroundColor: '#fff', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', borderRadius: '8px', padding: '10px 0', minWidth: '120px' }}>
              <button onClick={() => { alEditar(); setMenuAbierto(false); }} style={{ display: 'block', width: '100%', padding: '8px 20px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}>Editar</button>
              <button onClick={() => { alBorrar(voucher.id); setMenuAbierto(false); }} style={{ display: 'block', width: '100%', padding: '8px 20px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: 'red' }}>Eliminar</button>
            </div>
          )}
        </div>
      )}

      <div className="badge-gift" style={{ position: 'absolute', top: '20px', right: '-35px', backgroundColor: '#c5a37d', color: '#fff', padding: '5px 40px', transform: 'rotate(45deg)', fontSize: '0.7rem', fontWeight: 'bold' }}>GIFT CARD</div>
      
      <h3 style={{ fontSize: '1.8rem', color: '#1a1a1a', marginBottom: '15px', fontFamily: 'Playfair Display' }}>{voucher.nombre}</h3>
      <div style={{ fontSize: '2.2rem', color: '#c5a37d', fontWeight: '600', marginBottom: '25px' }}>${voucher.precio}</div>
      
      <ul style={{ listStyle: 'none', padding: 0, marginBottom: '30px', color: '#666', fontSize: '0.95rem', lineHeight: '2' }}>
        {voucher.features?.map((f, i) => <li key={i}>{f}</li>)}
      </ul>

      <button onClick={alComprar} style={{ backgroundColor: '#1a1a1a', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '50px', width: '100%', fontWeight: 'bold', cursor: 'pointer' }}>
        COMPRAR VOUCHER
      </button>
      
      <p style={{ marginTop: '20px', fontSize: '0.75rem', color: '#bfa38a', fontStyle: 'italic' }}>{voucher.footer}</p>
    </div>
  );
};

export default CardVoucher;