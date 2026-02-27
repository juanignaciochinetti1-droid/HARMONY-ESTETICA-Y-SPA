import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Componentes externos
import CardVoucher from '../components/Vouchers/CardVoucher';
import ModalFormularioVoucher from '../components/Vouchers/ModalFormularioVoucher';
import ModalCompraVoucher from '../components/Vouchers/ModalCompraVoucher';
import ModalReporteVouchers from '../components/Vouchers/ModalReporteVouchers';
export default function Vouchers() {
  // 1. Estados
  const [formAbierto, setFormAbierto] = useState(false);
  const [compraAbierta, setCompraAbierta] = useState(false);
  const [reporteAbierto, setReporteAbierto] = useState(false); // NUEVO
  const [listaVouchers, setListaVouchers] = useState([]);
  const [voucherSeleccionado, setVoucherSeleccionado] = useState(null);
  const [voucherAEditar, setVoucherAEditar] = useState(null);

  // Verificamos si es admin (usando la lógica de rol que veníamos manejando)
  const isAdmin = true;

  // 2. Cargar datos
  const obtenerVouchers = async () => {
    try {
      const { data, error } = await supabase
        .from('vouchers_web')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setListaVouchers(data || []);
    } catch (error) {
      console.error("Error al obtener vouchers:", error.message);
    }
  };

  useEffect(() => {
    obtenerVouchers();
  }, []);

  // 3. Lógica Admin (Borrar y Guardar)
  const borrarVoucher = async (id) => {
    if (window.confirm("¿Deseas eliminar este voucher permanentemente?")) {
      const { error } = await supabase.from('vouchers_web').delete().eq('id', id);
      if (!error) setListaVouchers(listaVouchers.filter(v => v.id !== id));
    }
  };

  const guardarCambios = async (datos) => {
    try {
      if (voucherAEditar) {
        const { data, error } = await supabase
          .from('vouchers_web')
          .update(datos)
          .eq('id', voucherAEditar.id)
          .select();
        if (error) throw error;
        setListaVouchers(listaVouchers.map(v => v.id === voucherAEditar.id ? data[0] : v));
      } else {
        const { data, error } = await supabase
          .from('vouchers_web')
          .insert([datos])
          .select();
        if (error) throw error;
        setListaVouchers([...listaVouchers, data[0]]);
      }
      setFormAbierto(false);
      setVoucherAEditar(null);
    } catch (error) {
      alert("Error al guardar: " + error.message);
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

      {/* MODALES DE CLIENTE */}
      {compraAbierta && (
        <ModalCompraVoucher 
          voucher={voucherSeleccionado}
          alCerrar={() => setCompraAbierta(false)}
        />
      )}

      {/* MODALES DE ADMIN */}
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

      {/* NUEVO: Modal de Reporte de Ventas */}
      {reporteAbierto && (
        <ModalReporteVouchers alCerrar={() => setReporteAbierto(false)} />
      )}

      {/* Botones flotantes Admin (Abajo a la izquierda) */}
      {isAdmin && (
        <div style={styles.fabContainer}>
          <button 
            style={styles.btnReporte} 
            onClick={() => setReporteAbierto(true)}
          >
            REPORTE DE VENTAS
          </button>
          <button 
            style={styles.btnAñadir} 
            onClick={() => setFormAbierto(true)}
          >
            +
          </button>
        </div>
      )}
    </main>
  );
}

const styles = {
  subtituloLabel: { textAlign: 'center', color: '#bfa38a', letterSpacing: '3px', fontSize: '0.7rem', marginBottom: '10px', textTransform: 'uppercase' },
  tituloPrincipal: { textAlign: 'center', color: '#1a1a1a', marginBottom: '50px', fontWeight: '300', fontSize: '2.5rem', fontFamily: "'Playfair Display', serif" },
  gridCards: { display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' },
  fabContainer: { 
    position: 'fixed', 
    bottom: '30px', 
    left: '30px', 
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '15px' 
  },
  btnReporte: {
    backgroundColor: '#fff',
    color: '#8c6d4f',
    border: '1px solid #c5a37d',
    padding: '10px 20px',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    letterSpacing: '1px'
  },
  btnAñadir: { 
    backgroundColor: '#c5a37d', 
    color: 'white', 
    border: 'none', 
    width: '55px', 
    height: '55px', 
    borderRadius: '50%', 
    fontSize: '2rem', 
    cursor: 'pointer', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    boxShadow: '0 6px 20px rgba(197, 163, 125, 0.4)' 
  }
};