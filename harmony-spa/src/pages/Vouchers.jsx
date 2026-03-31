import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

import CardVoucher from '../components/Vouchers/CardVoucher';
import ModalFormularioVoucher from '../components/Vouchers/ModalFormularioVoucher';
import ModalCompraVoucher from '../components/Vouchers/ModalCompraVoucher';
import ModalReporteVouchers from '../components/Vouchers/ModalReporteVouchers';

// --- COMPONENTE INTERNO: MODAL DE AVISOS (GENÉRICO) ---
const ModalAviso = ({ icono, titulo, texto, botonTexto, alCerrar, esConfirmacion, alConfirmar }) => (
  <div style={styles.alertOverlay}>
    <div style={styles.alertModal}>
      <div style={styles.alertIcon}>{icono}</div>
      <h3 style={styles.alertTitle}>{titulo}</h3>
      <p style={styles.alertText}>{texto}</p>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        {esConfirmacion ? (
          <>
            <button style={styles.btnCancelarAlerta} onClick={alCerrar}>VOLVER</button>
            <button style={styles.btnConfirmarAlerta} onClick={alConfirmar}>{botonTexto}</button>
          </>
        ) : (
          <button style={styles.btnConfirmarAlerta} onClick={alCerrar}>{botonTexto}</button>
        )}
      </div>
    </div>
  </div>
);

export default function Vouchers() {
  const { profile, loading } = useAuth();
  const [listaVouchers, setListaVouchers] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  
  const [formAbierto, setFormAbierto] = useState(false);
  const [compraAbierta, setCompraAbierta] = useState(false);
  const [reporteAbierto, setReporteAbierto] = useState(false);
  const [voucherSeleccionado, setVoucherSeleccionado] = useState(null);
  const [voucherAEditar, setVoucherAEditar] = useState(null);

  // --- ESTADOS PARA ALERTAS ---
  const [confirmarEliminar, setConfirmarEliminar] = useState({ visible: false, voucher: null });
  const [avisoSinCambios, setAvisoSinCambios] = useState(false);

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

  // --- GUARDAR / EDITAR CON VALIDACIÓN ---
  const guardarVoucher = async (datos) => {
    try {
      const payload = {
        nombre: datos.nombre.trim(),
        precio: Number(datos.precio),
        features: datos.features,
        footer: datos.footer.trim()
      };

      if (voucherAEditar) {
        // Validación: ¿Son los mismos datos?
        const noHuboCambios = 
          voucherAEditar.nombre === payload.nombre &&
          Number(voucherAEditar.precio) === payload.precio &&
          voucherAEditar.footer === payload.footer &&
          JSON.stringify(voucherAEditar.features) === JSON.stringify(payload.features);

        if (noHuboCambios) {
          setAvisoSinCambios(true);
          return; // No hace el update
        }

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
      alert("Error al guardar: " + error.message);
    }
  };

  // --- ELIMINACIÓN ---
  const borrarVoucherReal = async () => {
    const id = confirmarEliminar.voucher.id;
    const { error } = await supabase.from('vouchers_web').delete().eq('id', id);
    if (!error) {
        setListaVouchers(listaVouchers.filter(voc => voc.id !== id));
        setConfirmarEliminar({ visible: false, voucher: null });
    }
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
              alBorrar={() => setConfirmarEliminar({ visible: true, voucher: v })}
            />
          ))}
        </div>
      )}

      {/* --- MODAL: CONFIRMACIÓN DE ELIMINACIÓN --- */}
      {confirmarEliminar.visible && (
        <ModalAviso 
          icono="!"
          titulo="¿Estás seguro?"
          texto={`Estás por eliminar "${confirmarEliminar.voucher.nombre}". Esta acción no se puede deshacer.`}
          botonTexto="ELIMINAR"
          esConfirmacion={true}
          alCerrar={() => setConfirmarEliminar({ visible: false, voucher: null })}
          alConfirmar={borrarVoucherReal}
        />
      )}

      {/* --- MODAL: AVISO SIN CAMBIOS --- */}
      {avisoSinCambios && (
        <ModalAviso 
          icono="i"
          titulo="Sin cambios"
          texto="Para actualizar este voucher, debes modificar al menos un dato (nombre, precio, beneficios o pie de página)."
          botonTexto="ENTENDIDO"
          esConfirmacion={false}
          alCerrar={() => setAvisoSinCambios(false)}
        />
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
  btnAñadir: { backgroundColor: '#c5a37d', color: 'white', border: 'none', width: '55px', height: '55px', borderRadius: '50%', fontSize: '2rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  
  // --- Estilos de Alerta Unificados ---
  alertOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(5px)' },
  alertModal: { backgroundColor: '#fff', padding: '35px', borderRadius: '40px', width: '380px', textAlign: 'center', border: '1px solid #f2e9e1', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' },
  alertIcon: { width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #c5a37d', color: '#c5a37d', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', fontSize: '30px', fontWeight: 'bold' },
  alertTitle: { color: '#8c6d4f', fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', marginBottom: '10px' },
  alertText: { color: '#bfa38a', fontSize: '0.95rem', marginBottom: '30px', lineHeight: '1.5' },
  btnCancelarAlerta: { backgroundColor: '#f5f5f5', color: '#777', border: 'none', padding: '12px 25px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '1px' },
  btnConfirmarAlerta: { backgroundColor: '#a6835a', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '1px' }
};