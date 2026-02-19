// Este servicio reemplazará la lógica de búsqueda que tenías en menu.js
export const getEspecialistas = async () => {
    // Por ahora simulamos la llamada a la DB, 
    // pero aquí es donde usaremos fetch() hacia tu tabla 'users'
    return [
        { id: '1', nombre: 'Juan', apellido: 'Chinetti', telefono: '123456', activo: true },
        { id: '2', nombre: 'Mateo', apellido: 'Villarroel', telefono: '654321', activo: true },
    ];
};

export const archivarTurno = (id) => {
    // Aquí traeremos la lógica de archivado que tanto nos costó pulir
    console.log(`Turno ${id} archivado en la base de datos.`);
};