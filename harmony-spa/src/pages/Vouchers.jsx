import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

import CardVoucher from '../components/Vouchers/CardVoucher';
import ModalFormularioVoucher from '../components/Vouchers/ModalFormularioVoucher';
import ModalCompraVoucher from '../components/Vouchers/ModalCompraVoucher';
import ModalReporteVouchers from '../components/Vouchers/ModalReporteVouchers';

export default function Vouchers() {
  const { profile, loading } = useAuth();
  const [listaVouchers, setListaVouchers] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  
  const [formAbierto, setFormAbierto] = useState(false);
  const [compraAbierta, setCompraAbierta] = useState(false);
  const [reporteAbierto, setReporteAbierto] = useState(false);
  const [voucherSeleccionado, setVoucherSeleccionado] = useState(null);
  const [voucherAEditar, setVoucherAEditar] = useState(null);

  const isAdmin = profile?.rol === 'ADMIN';

  const obtenerVouchers = async () => {
    try {
      const { data, error } = await supabase.from('vouchers_web').select('*').order('id', { ascending: true });
      if (error) throw error;
      setListaVouchers(data || []);
    } catch (error) {
      console.error("Error al obtener vouchers:", error.message);
    } finally {
      setCargandoDatos(false);
    }
  };

  useEffect(() => { obtenerVouchers(); }, []);

  // --- FUNCIÓN PARA GUARDAR / EDITAR VOUCHER ---
  const guardarVoucher = async (datos) => {
    try {
      const payload = {
        nombre: datos.nombre,
        precio: datos.precio,
        features: datos.features,
        footer: datos.footer
      };

      if (voucherAEditar) {
        const { error } = await supabase.from('vouchers_web').update(payload).eq('id', voucherAEditar.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('vouchers_web').insert([payload]);
        if (error) throw error;
      }

      setFormAbierto(false);
      setVoucherAEditar(null);
      obtenerVouchers();
    } catch (error) {
      alert("Error al guardar voucher: " + error.message);
    }
  };

  const borrarVoucher = async (id) => {
    const { error } = await supabase.from('vouchers_web').delete().eq('id', id);
    if (!error) setListaVouchers(listaVouchers.filter(voc => voc.id !== id));
  };

  if (loading) {
    return <div style={{ paddingTop: '100px', textAlign: 'center', color: '#8c6d4f' }}><p>Verificando identidad...</p></div>;
  }

  return (
    <main style={{ backgroundColor: '#f5eee6', minHeight: '100vh', padding: '100px 20px 80px' }}>
      <p style={styles.subtituloLabel}>REGALA BIENESTAR</p>
      <h2 style={styles.tituloPrincipal}>Vouchers de Regalo</h2>

      {cargandoDatos ? (
        <p style={{ textAlign: 'center', color: '#bfa38a' }}>Cargando catálogo...</p>
      ) : (
        <div style={styles.gridCards}>
          {listaVouchers.map(v => (
            <CardVoucher 
              key={v.id} 
              voucher={v} 
              isAdmin={isAdmin}
              alComprar={() => { setVoucherSeleccionado(v); setCompraAbierta(true); }}
              alEditar={() => { setVoucherAEditar(v); setFormAbierto(true); }}
              alBorrar={borrarVoucher}
            />
          ))}
        </div>
      )}

      {compraAbierta && <ModalCompraVoucher voucher={voucherSeleccionado} alCerrar={() => setCompraAbierta(false)} />}
      {formAbierto && (
        <ModalFormularioVoucher 
          alCerrar={() => { setFormAbierto(false); setVoucherAEditar(null); }} 
          alGuardar={guardarVoucher} 
          voucherAEditar={voucherAEditar} 
        />
      )}
      {reporteAbierto && <ModalReporteVouchers alCerrar={() => setReporteAbierto(false)} />}

      {isAdmin && (
        <div style={styles.fabContainer}>
          <button style={styles.btnReporte} onClick={() => setReporteAbierto(true)}>📊 REPORTE DE VENTAS</button>
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
  fabContainer: { position: 'fixed', bottom: '30px', left: '30px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '15px' },
  btnReporte: { backgroundColor: '#fff', color: '#8c6d4f', border: '1px solid #c5a37d', padding: '10px 20px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px' },
  btnAñadir: { backgroundColor: '#c5a37d', color: 'white', border: 'none', width: '55px', height: '55px', borderRadius: '50%', fontSize: '2rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }
};