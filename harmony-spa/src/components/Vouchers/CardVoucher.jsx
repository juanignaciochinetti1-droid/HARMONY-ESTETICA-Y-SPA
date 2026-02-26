import React, { useState } from 'react';

const CardVoucher = ({ voucher, alComprar, alBorrar, alEditar, isAdmin }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Seguridad: Si features no existe o no es array, evitamos que rompa el código
  const listaFeatures = Array.isArray(voucher.features) 
    ? voucher.features 
    : (voucher.descripcion ? voucher.descripcion.split(',') : []);

  return (
    <div className="voucher-card" style={styles.card}>
      
      {/* Menú de Opciones (Solo Admin) */}
      {isAdmin && (
        <div style={styles.adminMenuContainer}>
          <div 
            onClick={() => setMenuAbierto(!menuAbierto)} 
            style={styles.dots}
          >
            ⋮
          </div>
          {menuAbierto && (
            <div style={styles.dropdown}>
              <button onClick={() => { alEditar(); setMenuAbierto(false); }} style={styles.dropdownBtn}>Editar</button>
              <button onClick={() => { alBorrar(voucher.id); setMenuAbierto(false); }} style={{ ...styles.dropdownBtn, color: '#e74c3c' }}>Eliminar</button>
            </div>
          )}
        </div>
      )}

      {/* Cinta de Gift Card */}
      <div style={styles.badgeGift}>GIFT CARD</div>
      
      <h3 style={styles.titulo}>{voucher.nombre || 'Voucher de Bienestar'}</h3>
      <div style={styles.precio}>${Number(voucher.precio || 0).toLocaleString('es-AR')}</div>
      
      <ul style={styles.lista}>
        {listaFeatures.length > 0 ? (
          listaFeatures.map((f, i) => <li key={i}>• {f.trim()}</li>)
        ) : (
          <li>• Válido para todos los servicios</li>
        )}
      </ul>

      <button onClick={alComprar} style={styles.btnComprar}>
        COMPRAR VOUCHER
      </button>
      
      <p style={styles.footerTexto}>{voucher.footer || '* Válido por 30 días'}</p>
    </div>
  );
};

const styles = {
  card: { 
    backgroundColor: '#fff', padding: '50px 30px 40px', borderRadius: '15px', width: '320px', 
    boxShadow: '0 15px 35px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden', border: '1px solid #f0e6db',
    textAlign: 'center'
  },
  adminMenuContainer: { position: 'absolute', top: '15px', left: '15px', zIndex: 10 },
  dots: { cursor: 'pointer', color: '#bfa38a', fontSize: '1.4rem', padding: '5px' },
  dropdown: { 
    position: 'absolute', top: '35px', left: 0, backgroundColor: '#fff', 
    boxShadow: '0 5px 20px rgba(0,0,0,0.15)', borderRadius: '8px', padding: '8px 0', minWidth: '140px', zIndex: 20 
  },
  dropdownBtn: { 
    display: 'block', width: '100%', padding: '10px 20px', border: 'none', 
    background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' 
  },
  badgeGift: { 
    position: 'absolute', top: '25px', right: '-35px', backgroundColor: '#c5a37d', 
    color: '#fff', padding: '5px 40px', transform: 'rotate(45deg)', 
    fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '1px' 
  },
  titulo: { fontSize: '1.8rem', color: '#1a1a1a', marginBottom: '10px', fontFamily: "'Playfair Display', serif", fontWeight: '400' },
  precio: { fontSize: '2.4rem', color: '#c5a37d', fontWeight: '500', marginBottom: '20px' },
  lista: { listStyle: 'none', padding: 0, marginBottom: '30px', color: '#777', fontSize: '0.9rem', lineHeight: '2.2' },
  btnComprar: { 
    backgroundColor: '#1a1a1a', color: '#fff', border: 'none', padding: '16px', 
    borderRadius: '50px', width: '100%', fontWeight: '600', cursor: 'pointer', 
    letterSpacing: '1px', transition: 'background 0.3s' 
  },
  footerTexto: { marginTop: '20px', fontSize: '0.7rem', color: '#bfa38a', fontStyle: 'italic', letterSpacing: '0.5px' }
};

export default CardVoucher;