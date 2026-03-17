import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Componentes externos
import CardVoucher from '../components/Vouchers/CardVoucher';
import ModalFormularioVoucher from '../components/Vouchers/ModalFormularioVoucher';
import ModalCompraVoucher from '../components/Vouchers/ModalCompraVoucher';
import ModalReporteVouchers from '../components/Vouchers/ModalReporteVouchers';

// --- COMPONENTE INTERNO: CARTEL DE SIN CONEXIÓN ---
const AlertaConexion = () => (
  <div style={styles.connectionOverlay}>
    <div style={styles.alertModal}>
      <div style={{...styles.alertIcon, borderColor: '#c5a37d', color: '#c5a37d'}}>🌐</div>
      <h3 style={styles.alertTitle}>Sin conexión</h3>
      <p style={styles.alertText}>
        Parece que has perdido la conexión a internet. 
        Verifica tu red para seguir gestionando los vouchers de Harmony.
      </p>
      <div style={styles.loaderBarContainer}>
        <div style={styles.loaderBarProgress}></div>
      </div>
    </div>
  </div>
);

// --- COMPONENTE INTERNO: CONFIRMACIÓN DE ELIMINACIÓN ---
const ModalConfirmacion = ({ mensaje, alConfirmar, alCancelar }) => (
  <div style={styles.alertOverlay}>
    <div style={styles.alertModal}>
      <div style={styles.alertIcon}>!</div>
      <h3 style={styles.alertTitle}>¿Estás seguro?</h3>
      <p style={styles.alertText}>{mensaje}</p>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button style={styles.btnCancelarAlerta} onClick={alCancelar}>CANCELAR</button>
        <button style={styles.btnConfirmarAlerta} onClick={alConfirmar}>ELIMINAR</button>
      </div>
    </div>
  </div>
);

export default function Vouchers() {
  // 1. Estados
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [formAbierto, setFormAbierto] = useState(false);
  const [compraAbierta, setCompraAbierta] = useState(false);
  const [reporteAbierto, setReporteAbierto] = useState(false);
  const [listaVouchers, setListaVouchers] = useState([]);
  const [voucherSeleccionado, setVoucherSeleccionado] = useState(null);
  const [voucherAEditar, setVoucherAEditar] = useState(null);
  
  // Estado para el cartel de eliminación
  const [confirmacion, setConfirmacion] = useState({ visible: false, id: null });

  const rolGuardado = localStorage.getItem('harmony_rol');
  const isAdmin = rolGuardado !== null && rolGuardado === 'ADMIN';

  // 2. Cargar datos y listeners de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    obtenerVouchers();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  // 3. Lógica Admin (Borrar y Guardar)
  const dispararEliminacion = (id) => {
    setConfirmacion({ visible: true, id: id });
  };

  const ejecutarEliminacion = async () => {
    const { error } = await supabase.from('vouchers_web').delete().eq('id', confirmacion.id);
    if (!error) {
      setListaVouchers(listaVouchers.filter(v => v.id !== confirmacion.id));
      setConfirmacion({ visible: false, id: null });
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
    <main style={{ backgroundColor: '#f5eee6', minHeight: '100vh', padding: '80px 20px' }}>
      {/* CARTEL DE DESCONEXIÓN */}
      {!isOnline && <AlertaConexion />}

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
            alBorrar={() => dispararEliminacion(v.id)}
            alEditar={() => {
              setVoucherAEditar(v);
              setFormAbierto(true);
            }}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {/* MODAL DE CONFIRMACIÓN ELIMINAR */}
      {confirmacion.visible && (
        <ModalConfirmacion 
          mensaje="Esta acción eliminará el voucher de regalo permanentemente del catálogo."
          alConfirmar={ejecutarEliminacion}
          alCancelar={() => setConfirmacion({ visible: false, id: null })}
        />
      )}

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

      {reporteAbierto && (
        <ModalReporteVouchers alCerrar={() => setReporteAbierto(false)} />
      )}

      {/* Botones flotantes Admin */}
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
            onClick={() => {
                setVoucherAEditar(null);
                setFormAbierto(true);
            }}
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
  tituloPrincipal: { textAlign: 'center', color: '#8c6d4f', marginBottom: '50px', fontWeight: '300', fontSize: '2.5rem', fontFamily: "'Playfair Display', serif" },
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
    padding: '12px 20px',
    borderRadius: '25px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    letterSpacing: '1px',
    fontFamily: "'Playfair Display', serif"
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
    boxShadow: '0 6px 20px rgba(197, 163, 125, 0.4)',
    fontFamily: "'Playfair Display', serif"
  },

  // --- Estilos de Alerta y Conexión Unificados ---
  connectionOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(252, 250, 247, 0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20000, backdropFilter: 'blur(8px)' },
  loaderBarContainer: { marginTop: '20px', height: '3px', width: '100%', backgroundColor: '#f2e9e1', borderRadius: '10px', overflow: 'hidden' },
  loaderBarProgress: { height: '100%', backgroundColor: '#c5a37d', width: '100%', animation: 'loadingProgress 3s linear forwards' },
  
  alertOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(5px)' },
  alertModal: { backgroundColor: '#fff', padding: '45px 40px', borderRadius: '40px', width: '420px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', border: '1px solid #f2e9e1' },
  alertIcon: { width: '65px', height: '65px', borderRadius: '50%', border: '2px solid #c5a37d', color: '#c5a37d', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', margin: '0 auto 25px', fontWeight: 'bold' },
  alertTitle: { color: '#8c6d4f', fontFamily: "'Playfair Display', serif", marginBottom: '15px', fontSize: '1.8rem', fontWeight: '400' },
  alertText: { color: '#bfa38a', fontSize: '1.05rem', marginBottom: '35px', lineHeight: '1.6', letterSpacing: '0.3px' },
  btnCancelarAlerta: { backgroundColor: '#f5f5f5', color: '#777', border: 'none', padding: '14px 30px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px', fontFamily: "'Playfair Display', serif" },
  btnConfirmarAlerta: { backgroundColor: '#a6835a', color: 'white', border: 'none', padding: '14px 30px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px', fontFamily: "'Playfair Display', serif" }
};