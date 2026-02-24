import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Componentes externos
import CardVoucher from '../components/Vouchers/CardVoucher';
import ModalFormularioVoucher from '../components/Vouchers/ModalFormularioVoucher';
import ModalCompraVoucher from '../components/Vouchers/ModalCompraVoucher';

export default function Vouchers() {
  // 1. Estados
  const [formAbierto, setFormAbierto] = useState(false);
  const [compraAbierta, setCompraAbierta] = useState(false);
  const [listaVouchers, setListaVouchers] = useState([]);
  const [voucherSeleccionado, setVoucherSeleccionado] = useState(null);
  const [voucherAEditar, setVoucherAEditar] = useState(null);

  const isAdmin = localStorage.getItem('harmony_admin') === 'true';

  // 2. Cargar datos desde Supabase
  const obtenerVouchers = async () => {
    const { data, error } = await supabase
      .from('vouchers') // Asegúrate que tu tabla en Supabase se llame 'vouchers'
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error("Error al obtener vouchers:", error.message);
    } else {
      setListaVouchers(data);
    }
  };

  useEffect(() => {
    obtenerVouchers();
  }, []);

  // 3. Lógica Admin (Borrar y Guardar)
  const borrarVoucher = async (id) => {
    if (window.confirm("¿Deseas eliminar este voucher permanentemente?")) {
      const { error } = await supabase.from('vouchers').delete().eq('id', id);
      if (!error) setListaVouchers(listaVouchers.filter(v => v.id !== id));
    }
  };

  const guardarCambios = async (datos) => {
    // Los datos vienen procesados desde el ModalFormularioVoucher
    if (voucherAEditar) {
      const { data, error } = await supabase
        .from('vouchers')
        .update(datos)
        .eq('id', voucherAEditar.id)
        .select();
      
      if (!error) {
        setListaVouchers(listaVouchers.map(v => v.id === voucherAEditar.id ? data[0] : v));
        setFormAbierto(false);
        setVoucherAEditar(null);
      }
    } else {
      const { data, error } = await supabase.from('vouchers').insert([datos]).select();
      if (!error) {
        setListaVouchers([...listaVouchers, data[0]]);
        setFormAbierto(false);
      }
    }
  };

  return (
    <main style={{ backgroundColor: '#fcfaf7', minHeight: '100vh', padding: '80px 20px' }}>
      <p style={styles.subtituloLabel}>REGALA BIENESTAR</p>
      <h2 style={styles.tituloPrincipal}>Vouchers de Regalo</h2>

      <div style={styles.gridCards}>
        {listaVouchers.map(v => (
          <CardVoucher 
            key={v.id} 
            voucher={v} 
            alComprar={() => {
              setVoucherSeleccionado(v);
              setCompraAbierta(true);
            }}
            alBorrar={borrarVoucher}
            alEditar={() => {
              setVoucherAEditar(v);
              setFormAbierto(true);
            }}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {/* Modal para que el cliente compre */}
      {compraAbierta && (
        <ModalCompraVoucher 
          voucher={voucherSeleccionado}
          alCerrar={() => setCompraAbierta(false)}
        />
      )}

      {/* Modal para que el admin cree/edite */}
      {formAbierto && (
        <ModalFormularioVoucher 
          alCerrar={() => {
            setFormAbierto(false);
            setVoucherAEditar(null);
          }} 
          alGuardar={guardarCambios} 
          voucherAEditar={voucherAEditar} 
        />
      )}

      {/* Botón flotante Admin (Abajo a la izquierda como en Equipo) */}
      {isAdmin && (
        <div style={styles.fabContainer}>
          <button style={styles.btnAñadir} onClick={() => setFormAbierto(true)}>+</button>
        </div>
      )}
    </main>
  );
}

const styles = {
  subtituloLabel: { textAlign: 'center', color: '#bfa38a', letterSpacing: '3px', fontSize: '0.7rem', marginBottom: '10px', textTransform: 'uppercase' },
  tituloPrincipal: { textAlign: 'center', color: '#1a1a1a', marginBottom: '50px', fontWeight: '300', fontSize: '2.5rem', fontFamily: "'Playfair Display', serif" },
  gridCards: { display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' },
  fabContainer: { position: 'fixed', bottom: '30px', left: '30px', zIndex: 1000 },
  btnAñadir: { 
    backgroundColor: '#c5a37d', 
    color: 'white', 
    border: 'none', 
    width: '60px', 
    height: '60px', 
    borderRadius: '50%', 
    fontSize: '2rem', 
    cursor: 'pointer', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    boxShadow: '0 6px 20px rgba(197, 163, 125, 0.4)' 
  }
};