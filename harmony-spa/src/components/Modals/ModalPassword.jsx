const ModalPassword = ({ alCerrar }) => {
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleActualizar = async (e) => {
    e.preventDefault();
    if (password.length < 6) return alert("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirmar) return alert("Las contraseñas no coinciden.");

    setCargando(true);
    // update() de Supabase Auth actualiza la clave del usuario logueado
    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("¡Contraseña actualizada con éxito!");
      alCerrar();
    }
    setCargando(false);
  };

  return (
    <div style={styles.overlayModal}>
      <div style={styles.modalChico}>
        <h3 style={styles.tituloModal}>Seguridad</h3>
        <p style={styles.txtChico}>Ingresa tu nueva clave de acceso.</p>
        <form onSubmit={handleActualizar}>
          <input 
            type="password" 
            placeholder="Nueva contraseña" 
            style={styles.input} 
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Confirmar contraseña" 
            style={styles.input} 
            onChange={(e) => setConfirmar(e.target.value)}
            required 
          />
          <button type="submit" disabled={cargando} style={styles.btnEntrar}>
            {cargando ? 'ACTUALIZANDO...' : 'GUARDAR CLAVE'}
          </button>
          <button type="button" onClick={alCerrar} style={styles.btnCancelar}>Cancelar</button>
        </form>
      </div>
    </div>
  );
};