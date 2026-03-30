import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from "../../lib/supabaseClient";

const ModalFormulario = ({ alCerrar, alGuardar, especialistaAEditar }) => {
  const estadoInicial = {
    nombre: '', 
    apellido: '', 
    dni: '', 
    especialidad: '',
    email: '', 
    telefono: '', 
    password: '', 
    activo: true, 
    foto_url: '' 
  };

  const [formData, setFormData] = useState(estadoInicial);
  const [enviando, setEnviando] = useState(false);
  const [archivoFoto, setArchivoFoto] = useState(null);

  useEffect(() => {
    if (especialistaAEditar) {
      setFormData({
        nombre: especialistaAEditar.nombre || '',
        apellido: especialistaAEditar.apellido || '',
        dni: especialistaAEditar.dni || '', 
        especialidad: especialistaAEditar.especialidad || '',
        email: especialistaAEditar.email || '',
        telefono: especialistaAEditar.telefono || '',
        password: '', 
        activo: especialistaAEditar.activo ?? true,
        foto_url: especialistaAEditar.foto_url || ''
      });
    }
  }, [especialistaAEditar]);

  const subirFoto = async (archivo) => {
    const nombreArchivo = `${Date.now()}_${archivo.name}`;
    const { data, error } = await supabase.storage
      .from('fotos-empleados')
      .upload(nombreArchivo, archivo);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('fotos-empleados')
      .getPublicUrl(nombreArchivo);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    
    // Validación de DNI para evitar el error de "Falta DNI"
    if (!formData.dni) {
      alert("Atención: El DNI es obligatorio para guardar el perfil.");
      return;
    }

    setEnviando(true);

    try {
      let urlFinal = formData.foto_url;

      if (archivoFoto) {
        urlFinal = await subirFoto(archivoFoto);
      }

      const datosParaGuardar = { ...formData, foto_url: urlFinal };

      if (especialistaAEditar) {
        await alGuardar(datosParaGuardar);
        alCerrar();
      } else {
        const supabaseUrl = supabase.supabaseUrl;
        const supabaseKey = supabase.supabaseKey;

        const authInvisible = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
        });

        const { error } = await authInvisible.auth.signUp({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          options: {
            data: { ...datosParaGuardar, rol: 'EMPLEADO', activo: true }
          }
        });

        if (error) throw error;
        
        await alGuardar(datosParaGuardar);
        alCerrar();
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={alCerrar}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.titulo}>{especialistaAEditar ? 'Editar Perfil' : 'Nuevo Especialista'}</h2>
        <p style={styles.subtitulo}>REGISTRO DE STAFF</p>
        
        <form onSubmit={handleSubmit}>
          
          <div style={styles.seccionFoto}>
            <div style={styles.previewCirculo}>
              {archivoFoto ? (
                <img src={URL.createObjectURL(archivoFoto)} style={styles.imgPreview} alt="Preview" />
              ) : formData.foto_url ? (
                <img src={formData.foto_url} style={styles.imgPreview} alt="Foto" />
              ) : (
                <span style={{color: '#d1c4b9', fontSize: '2rem'}}>👤</span>
              )}
            </div>
            <label style={styles.labelFoto}>
              {especialistaAEditar ? 'CAMBIAR FOTO' : 'SUBIR FOTO'}
              <input 
                type="file" 
                accept="image/*" 
                hidden 
                onChange={(e) => setArchivoFoto(e.target.files[0])} 
              />
            </label>
          </div>

          <div style={styles.row}>
            <div style={styles.campo}>
              <label style={styles.label}>NOMBRE</label>
              <input style={styles.input} type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} required />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>APELLIDO</label>
              <input style={styles.input} type="text" value={formData.apellido} onChange={(e) => setFormData({...formData, apellido: e.target.value})} required />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.campo}>
              <label style={styles.label}>DNI</label>
              <input 
                style={{
                  ...styles.input, 
                  // Si tiene DNI previo lo bloqueamos, si no, dejamos que lo complete
                  backgroundColor: (especialistaAEditar && formData.dni) ? '#f5f5f5' : '#fdfcfb',
                  color: (especialistaAEditar && formData.dni) ? '#999' : '#555',
                  border: !formData.dni ? '1px solid #e74c3c' : '1px solid #f2e9e1'
                }} 
                type="text" 
                placeholder="Ingresar DNI"
                value={formData.dni} 
                // Solo es de lectura si ya existe un DNI y estamos editando
                readOnly={!!(especialistaAEditar && formData.dni)}
                onChange={(e) => setFormData({...formData, dni: e.target.value.replace(/\D/g, '')})} 
              />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>TELÉFONO</label>
              <input style={styles.input} type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value.replace(/\D/g, '')})} />
            </div>
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>ESPECIALIDAD</label>
            <input style={styles.input} type="text" value={formData.especialidad} onChange={(e) => setFormData({...formData, especialidad: e.target.value})} required />
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>EMAIL LABORAL</label>
            <input style={styles.input} type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>

          {!especialistaAEditar && (
            <div style={styles.campo}>
              <label style={styles.label}>CONTRASEÑA TEMPORAL</label>
              <input style={styles.input} type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            </div>
          )}

          <div style={styles.campo}>
            <label style={styles.label}>ESTADO</label>
            <select style={styles.input} value={String(formData.activo)} onChange={(e) => setFormData({...formData, activo: e.target.value === 'true'})}>
              <option value="true">✅ ACTIVO</option>
              <option value="false">❌ INACTIVO</option>
            </select>
          </div>

          <button type="submit" style={{...styles.btnGuardar, opacity: enviando ? 0.7 : 1}} disabled={enviando}>
            {enviando ? 'PROCESANDO...' : (especialistaAEditar ? 'GUARDAR CAMBIOS' : 'CREAR ACCESO')}
          </button>
          <button type="button" onClick={alCerrar} style={styles.btnNoLink}>Cancelar</button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(26, 26, 26, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' },
  modal: { background: '#fff', padding: '40px', borderRadius: '40px', width: '450px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', overflowY: 'auto', maxHeight: '90vh' },
  titulo: { color: '#8c6d4f', fontSize: '1.8rem', marginBottom: '5px', fontWeight: '400', fontFamily: 'Playfair Display' },
  subtitulo: { color: '#d1c4b9', fontSize: '0.6rem', letterSpacing: '2px', marginBottom: '30px', textTransform: 'uppercase' },
  row: { display: 'flex', gap: '15px', marginBottom: '18px' },
  campo: { marginBottom: '18px', textAlign: 'left', flex: 1 },
  label: { display: 'block', fontSize: '0.65rem', color: '#b5926d', marginBottom: '8px', fontWeight: 'bold' },
  input: { width: '100%', padding: '12px', borderRadius: '15px', border: '1px solid #f2e9e1', outline: 'none', color: '#555', boxSizing: 'border-box', backgroundColor: '#fdfcfb' },
  btnGuardar: { width: '100%', background: '#a6835a', color: 'white', border: 'none', padding: '15px', borderRadius: '30px', cursor: 'pointer', fontSize: '0.9rem', marginTop: '10px', fontWeight: 'bold' },
  btnNoLink: { background: 'none', border: 'none', color: '#a6835a', cursor: 'pointer', fontSize: '0.8rem', marginTop: '15px', textDecoration: 'underline' },
  seccionFoto: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '25px' },
  previewCirculo: { width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#fdfcfb', border: '2px solid #f2e9e1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '10px' },
  imgPreview: { width: '100%', height: '100%', objectFit: 'cover' },
  labelFoto: { fontSize: '0.6rem', color: '#a6835a', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline', letterSpacing: '1px' }
};

export default ModalFormulario;