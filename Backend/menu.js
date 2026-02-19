// Variables exclusivas para el flujo de reserva de turnos
let reserva_servicio = "Servicio Harmony";
let reserva_profesional = "";
let reserva_dia = "";
let reserva_hora = "";

let reserva_final_objeto = {
    servicio: "",
    profesional: "",
    dia: "",
    hora: ""
};

document.addEventListener('DOMContentLoaded', () => {
    const loginIcon = document.querySelector('.login-icon');
    const modalLogin = document.getElementById('modalLogin');
    const btnCerrarLogin = document.getElementById('btnCerrarLogin');
    const loginForm = document.getElementById('loginForm');
    const errorMsg = document.getElementById('errorLogin');

    // 1. Abrir modal
    if (loginIcon && modalLogin) {
        loginIcon.addEventListener('click', (e) => {
            e.preventDefault();
            modalLogin.style.display = "block";
        });
    }

    // 2. Cerrar modal
    if (btnCerrarLogin) {
        btnCerrarLogin.addEventListener('click', () => {
            modalLogin.style.display = "none";
            if (errorMsg) errorMsg.style.display = "none";
            loginForm.reset(); // Limpia los campos al cerrar
        });
    }

    // 3. Procesar Login con Normalización
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // NORMALIZACIÓN: trim() quita espacios accidentales al inicio/final
            // toLowerCase() evita problemas si el usuario escribe en Mayúsculas
            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            const pass = document.getElementById('loginPass').value.trim();

            // VALIDACIÓN BÁSICA
            if (!email || !pass) {
                alert("⚠️ Por favor, completa todos los campos.");
                return;
            }

            // SIMULACIÓN DE CREDENCIALES (En el futuro, esto consultará a MySQL)
            if (email === "cliente@harmony.com" && pass === "1234") {
                alert("✨ Bienvenido a Harmony Estética y Spa");
                
                // Guardamos un rastro del login para que el sistema sepa que somos admin
                localStorage.setItem('harmony_admin', 'true');
                
                modalLogin.style.display = "none";
                loginForm.reset();
                
                // Redirigir o refrescar para mostrar opciones de admin
                location.reload(); 
            } else {
                if (errorMsg) errorMsg.style.display = "block";
            }
        });
    }
});

function toggleSchedule(card) {
            const schedule = card.querySelector('.schedule');
            const allSchedules = document.querySelectorAll('.schedule');
            
            // Cerrar otros si se desea (opcional)
            allSchedules.forEach(s => {
                if (s !== schedule) s.style.display = 'none';
            });

            // Alternar el actual
            if (schedule.style.display === "block") {
                schedule.style.display = "none";
            } else {
                schedule.style.display = "block";
            }
        }
// Esperar a que cargue todo el HTML
document.addEventListener('DOMContentLoaded', () => {
    console.log("Harmony Script cargado correctamente");
});

// --- PROTECCIÓN PARA ELEMENTOS QUE NO EXISTEN ---
// Esto evita que el error "null (reading 'addEventListener')" rompa el sitio
const safeAddEventListener = (id, event, callback) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, callback);
};

// ==========================================
// 1. BASE DE DATOS Y PERSISTENCIA
// ==========================================
const datosPredeterminados = {
    'Juan': {
        nombre: "Juan Chinetti",
        especialidad: "Mesoterapia",
        servicios: ["Mesoterapia", "Limpieza Facial"],
        activo: true, // <--- Nuevo campo: true para trabajar, false para vacaciones/baja
        foto: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=400",
        disponibles: [1, 1, 1, 1, 1, 0, 0],
        turnos: [{ hora: "09:00", libre: true }, { hora: "14:00", libre: true }]
    },
    'Mateo': {
        nombre: "Mateo Villarroel",
        especialidad: "Estética Facial y Uñas",
        servicios: ["Esculpidas", "Semipermanente"],
        activo: true, // <--- Nuevo campo: true para trabajar, false para vacaciones/baja
        foto: "https://images.unsplash.com/photo-1559599101-f09722fb4948?q=80&w=400",
        disponibles: [0, 1, 1, 1, 1, 1, 0],
        turnos: [{ hora: "10:00", libre: true }, { hora: "18:30", libre: true }]
    }
};

// 2. INICIALIZAR LA VARIABLE Y CARGAR DESDE EL DISCO
let datosEquipo = {}; 

// Intentamos leer el almacenamiento local
try {
    const guardado = localStorage.getItem('harmony_equipo');
    if (guardado) {
        datosEquipo = JSON.parse(guardado);
        console.log("✅ Datos cargados desde localStorage");
    } else {
        // Si no hay nada en el disco, usamos los predeterminados
        datosEquipo = { ...datosPredeterminados };
        console.log("ℹ️ Usando datos predeterminados");
    }
} catch (error) {
    console.error("❌ Error al leer localStorage, restaurando predeterminados:", error);
    datosEquipo = { ...datosPredeterminados };
}

// Función para normalizar los datos y evitar errores de espacios/mayúsculas
function obtenerDatosEquipoNormalizados() {
    const datosNormalizados = {};
    Object.keys(datosEquipo).forEach(key => {
        const idLimpio = key.trim(); // "Juan " -> "Juan"
        const profesional = datosEquipo[key];
        
        // Limpiamos también la lista de servicios de cada uno
        const serviciosLimpios = profesional.servicios 
            ? profesional.servicios.map(s => s.toLowerCase().trim()) 
            : [];

        datosNormalizados[idLimpio] = {
            ...profesional,
            serviciosLimpios: serviciosLimpios
        };
    });
    return datosNormalizados;
}

let profesionalSeleccionado = "";
let servicioActual = "";

// --- SINCRONIZACIÓN AL CARGAR EQUIPO.HTML ---
window.addEventListener('load', () => {
    const data = localStorage.getItem('reservaEnProgreso');
    if (data) {
        const objetoReserva = JSON.parse(data);
        // 1. Despertamos la variable global
        window.servicioActual = objetoReserva.servicio;
        
        // 2. Opcional: Si el objeto final está vacío, lo pre-llenamos
        if (objetoReserva.servicio) {
            reserva_final_objeto.servicio = objetoReserva.servicio;
        }
        console.log("Sistema sincronizado con el servicio:", window.servicioActual);
    }
});

const guardarYRenderizar = () => {
    localStorage.setItem('harmony_equipo', JSON.stringify(datosEquipo));
    if (document.querySelector('.team-container')) renderizarEquipo();
};

// ==========================================
// 2. INICIALIZACIÓN Y EVENTOS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DE INDEX / POLÍTICAS ---
    const btnReserva = document.getElementById('btnReserva');
    if (btnReserva) btnReserva.onclick = () => document.getElementById('modalPoliticas').style.display = "block";

    // --- LÓGICA DE SERVICIOS (data-servicio) ---
    document.addEventListener('click', (e) => {
        if (e.target && e.target.getAttribute('data-servicio')) {
            servicioActual = e.target.getAttribute('data-servicio');
            abrirSeleccionEspecialista(servicioActual);
        }
    });

    // --- LÓGICA DE ADMIN (Login y Agregar) ---
    const loginBtn = document.querySelector('.login-icon');
    if (loginBtn) loginBtn.onclick = () => document.getElementById('modalLogin').style.display = "block";
    
    const adminAddBtn = document.getElementById('adminAddBtn');
    if (adminAddBtn) adminAddBtn.onclick = () => document.getElementById('modalNuevoEmpleado').style.display = "block";

    // --- CIERRE DE MENÚS AL CLICKEAR FUERA ---
    document.addEventListener('click', () => {
        document.querySelectorAll('.service-options').forEach(opt => opt.classList.remove('active'));
    });

    // --- RENDER INICIAL Y VERIFICACIÓN ---
    if (document.querySelector('.team-container')) renderizarEquipo();
    verificarReservaEnProgreso();
});

// ==========================================
// 3. FUNCIONES DE ADMINISTRACIÓN (CRUD)
// ==========================================

// Función para el menú desplegable de la tarjeta
window.toggleMenuEquipo = (event, element) => {
    event.stopPropagation();
    document.querySelectorAll('.service-options').forEach(opt => {
        if (opt !== element) opt.classList.remove('active');
    });
    element.classList.toggle('active');
};

// Formulario Nuevo Empleado - VERSION BLINDADA
const formNuevo = document.getElementById('formNuevoEmpleado');

if (formNuevo) {
    formNuevo.onsubmit = (e) => {
        e.preventDefault();
        
        // 1. CAPTURA Y NORMALIZACIÓN
        const nombre = document.getElementById('addNombre').value.trim();
        const serviciosRaw = document.getElementById('addServicios').value.trim(); 
        const email = document.getElementById('nuevoEmail').value.trim().toLowerCase();
        const telefono = document.getElementById('nuevoTelefono').value.trim();
        const file = document.getElementById('addImagen').files[0];

        // 2. VALIDACIONES CRÍTICAS
        
        // A. Campos obligatorios
        if (!nombre || !serviciosRaw || !email || !telefono) {
            alert("⚠️ Todos los campos son obligatorios (Nombre, Servicios, Email y Teléfono).");
            return;
        }

        // B. Evitar Duplicados (Vital para React)
        if (datosEquipo[nombre]) {
            alert(`❌ El profesional "${nombre}" ya existe. Por favor, usa un apellido para diferenciarlo.`);
            return;
        }

        // C. Validación de Formato de Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("📧 Por favor, ingresa un correo electrónico válido.");
            return;
        }

        // D. Validación de Teléfono (solo números y signos comunes)
        const telRegex = /^[0-9+\s-]{7,20}$/;
        if (!telRegex.test(telefono)) {
            alert("📞 El formato del teléfono no es válido.");
            return;
        }

        // 3. PROCESAMIENTO DE DATOS
        const listaServicios = serviciosRaw.split(',').map(s => s.trim()).filter(s => s !== "");
        const especialidadPrincipal = listaServicios[0] || "Especialista";

        const finalizarRegistro = (imgUrl) => {
            datosEquipo[nombre] = {
                nombre: nombre,
                especialidad: especialidadPrincipal,
                email: email,
                telefono: telefono,
                servicios: listaServicios,
                activo: true, // Siempre inicia activo por defecto
                foto: imgUrl,
                agenda: {}
            };

            guardarYRenderizar();
            document.getElementById('modalNuevoEmpleado').style.display = "none";
            formNuevo.reset();
            alert(`¡✅ ${nombre} se ha incorporado al equipo de Harmony!`);
        };

        // 4. MANEJO DE IMAGEN
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => finalizarRegistro(ev.target.result);
            reader.readAsDataURL(file);
        } else {
            // Imagen por defecto elegante
            finalizarRegistro("https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=400");
        }
    };
}

const formEditar = document.getElementById('formEditarEmpleado');
if (formEditar) {
    formEditar.onsubmit = (e) => {
        e.preventDefault();
        const originalKey = document.getElementById('editNombreOriginal').value;
        const nuevoNombre = document.getElementById('editNombre').value;
        const nuevaEsp = document.getElementById('editEspecialidad').value;
        
        // --- NUEVOS CAMPOS CAPTURADOS ---
        const nuevoEmail = document.getElementById('editEmail').value;
        const nuevoTelefono = document.getElementById('editTelefono').value;
        
        const nuevoEstado = document.getElementById('editEstado').value === "true";
        const file = document.getElementById('editImagen').files[0];

        const actualizar = (img) => {
            const backup = datosEquipo[originalKey];
            
            if (originalKey !== nuevoNombre) delete datosEquipo[originalKey];
            
            // Guardamos el nuevo objeto con TODA la información
            datosEquipo[nuevoNombre] = {
                ...backup, 
                nombre: nuevoNombre,
                especialidad: nuevaEsp,
                email: nuevoEmail,       // <--- SE GUARDA AQUÍ
                telefono: nuevoTelefono, // <--- SE GUARDA AQUÍ
                activo: nuevoEstado,
                foto: img || backup.foto
            };
            
            guardarYRenderizar();
            document.getElementById('modalEditarEmpleado').style.display = "none";
        };

        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => actualizar(ev.target.result);
            reader.readAsDataURL(file);
        } else { 
            actualizar(null); 
        }
    };
}

window.prepararEdicion = (key) => {
    const p = datosEquipo[key];
    if (!p) return; // Seguridad por si la key no existe

    // 1. Cargamos los datos básicos
    document.getElementById('editNombreOriginal').value = key;
    document.getElementById('editNombre').value = p.nombre;
    document.getElementById('editEspecialidad').value = p.especialidad;

    // 2. Cargamos los nuevos campos de contacto
    // El || "" evita que aparezca "undefined" si el profesional es antiguo
    document.getElementById('editEmail').value = p.email || ""; 
    document.getElementById('editTelefono').value = p.telefono || "";

    // 3. Cargamos el estado de actividad
    const selectEstado = document.getElementById('editEstado');
    if (selectEstado) {
        // Convertimos el booleano a string ("true" o "false") para el selector
        selectEstado.value = (p.activo !== false).toString();
    }

    // 4. Mostramos el modal
    document.getElementById('modalEditarEmpleado').style.display = "block";
};

window.eliminarEmpleado = (key) => {
    if (confirm(`¿Eliminar a ${key} del equipo?`)) {
        delete datosEquipo[key];
        guardarYRenderizar();
    }
};



// ==========================================
// 4. LÓGICA DE RENDERIZADO Y RESERVAS
// ==========================================

function renderizarEquipo(servicioFiltrado = "") {
    const container = document.querySelector('.team-container');
    if (!container) return;
    container.innerHTML = '';

    // 1. Limpiamos el filtro (quitamos espacios y pasamos a minúsculas)
    const filtroNormalizado = servicioFiltrado ? servicioFiltrado.toLowerCase().trim() : "";

    Object.keys(datosEquipo).forEach(key => {
    const p = datosEquipo[key];
    const estaActivo = p.activo !== false; // Si no existe, asumimos que está activo

    // 1. Filtro de servicios
    const cumpleFiltro = !filtroNormalizado || 
        (p.servicios && p.servicios.some(s => s.toLowerCase().trim() === filtroNormalizado));

    if (cumpleFiltro) {
        const div = document.createElement('div');
        div.className = 'team-card';
        div.style.position = 'relative';

        // --- EFECTO VISUAL DE INACTIVO ---
        if (!estaActivo) {
            div.style.filter = 'grayscale(0.8)'; // Casi blanco y negro
            div.style.opacity = '0.7';           // Un poco transparente
        }

        div.innerHTML = `
            <div class="options-menu" style="z-index: 10;">
                <span class="dots-icon">⋮</span>
                <div class="options-content">
                    <button onclick="prepararEdicion('${key}')">Editar Perfil</button>
                    <button onclick="abrirGestionHorarios('${key}')">Gestionar Horarios</button>
                    <button onclick="verHistorial('${p.nombre}')">Ver Agenda/Historial</button>
                    <button onclick="eliminarEmpleado('${key}')" style="color:red;">Eliminar</button>
                </div>
            </div>

            <img src="${p.foto}" class="team-img" style="${!estaActivo ? 'filter: blur(1px);' : ''}">
            
            <h3 style="${!estaActivo ? 'color: #888;' : ''}">
                ${p.nombre} ${!estaActivo ? '<br><span style="font-size:0.6rem; color:red;">(INACTIVO)</span>' : ''}
            </h3>
            
            <p class="specialty">${p.especialidad}</p>

            <button class="btn-luxury-dark" 
                    onclick="${estaActivo ? `abrirCalendario('${key}')` : ''}" 
                    style="${!estaActivo ? 'background: #555; cursor: not-allowed; opacity: 0.5;' : ''}"
                    ${!estaActivo ? 'disabled' : ''}>
                ${estaActivo ? 'DISPONIBILIDAD' : 'NO DISPONIBLE'}
            </button>
        `;
        container.appendChild(div);
    }
});
}

// Reemplaza tu función abrirSeleccionEspecialista por esta:
function abrirSeleccionEspecialista(servicio) {
    const modal = document.getElementById('modalEspecialistas');
    const contenedor = document.getElementById('contenedorEspecialistas');
    if (!modal || !contenedor) return;

    // Guardamos el servicio actual
    servicioActual = servicio; 

    document.getElementById('tituloServicioElegido').innerText = `Especialistas en ${servicio}`;
    contenedor.innerHTML = '';

    // Normalizamos el nombre del servicio para comparar
    const filtro = servicio.toLowerCase().trim();
    
    Object.keys(datosEquipo).forEach(key => {
        const p = datosEquipo[key];

        // 1. Verificamos si el profesional está ACTIVO (si p.activo no existe, asumimos true)
        const estaActivo = p.activo !== false; 
        
        // 2. Verificamos si realiza el servicio (Corregido: usamos la variable 'filtro')
        const haceElServicio = p.servicios && p.servicios.some(s => s.toLowerCase().trim() === filtro);

        // --- LA LLAVE DEL ÉXITO ---
        // Solo dibujamos si cumple AMBAS condiciones
        if (estaActivo && haceElServicio) {
            const div = document.createElement('div');
            div.className = 'especialista-opcion';
            div.style = "text-align:center; padding:15px; border: 1px solid var(--acento-soft); border-radius:10px; margin-bottom:10px;";
            div.innerHTML = `
                <img src="${p.foto}" style="width:70px; height:70px; border-radius:50%; object-fit:cover; border: 2px solid var(--dorado-mate);">
                <p style="margin: 10px 0 5px 0;"><strong>${p.nombre}</strong></p>
                <p style="font-size:0.7rem; color: #888; margin-bottom:10px;">${p.especialidad}</p>
                <button onclick="elegirProfesional('${key}')" class="btn-luxury-dark" style="padding:8px 15px; font-size:0.7rem; width:100%;">
                    SELECCIONAR
                </button>
            `;
            contenedor.appendChild(div);
        }
    });

    // 3. Si nadie quedó después del filtro de activos, mostramos el aviso
    if (contenedor.innerHTML === '') {
        contenedor.innerHTML = `<p style="grid-column: 1/-1; font-size: 0.8rem; color: #888; text-align: center; padding: 20px;">No hay especialistas disponibles para ${servicio} en este momento.</p>`;
    }

    modal.style.display = "flex";
}

window.abrirSeleccionEspecialista = (nombreServicio) => {
    const modal = document.getElementById('modalEspecialistas');
    const contenedor = document.getElementById('contenedorEspecialistas');
    if (!modal || !contenedor) return;

    // --- EL CAMBIO CRUCIAL AQUÍ ---
    // Guardamos en el disco para que al cambiar de página no se borre
    localStorage.setItem('reservaEnProgreso', JSON.stringify({ servicio: nombreServicio }));

    // 1. Sincronizamos todas las variables con el nombre real
    servicioActual = nombreServicio; 
    reserva_final_objeto.servicio = nombreServicio; // <--- AGREGAR ESTA LÍNEA

    const filtro = nombreServicio.toLowerCase().trim();

    document.getElementById('tituloServicioElegido').innerText = `Especialistas para ${nombreServicio}`;
    contenedor.innerHTML = '';

    Object.keys(datosEquipo).forEach(key => {
        const p = datosEquipo[key];
        
        // NORMALIZACIÓN: Convertimos todo a minúsculas para comparar
        const especialidad = p.especialidad ? p.especialidad.toLowerCase() : "";
        const listaServicios = p.servicios ? p.servicios.map(s => s.toLowerCase()) : [];

        // CRITERIO DE BÚSQUEDA:
        // 1. ¿Está el nombre del servicio en su lista de servicios?
        // 2. ¿O su especialidad coincide con el servicio?
        const coincide = listaServicios.some(s => s.includes(filtro) || filtro.includes(s)) || 
                         especialidad.includes(filtro);

        if (coincide) {
            const div = document.createElement('div');
            div.className = 'especialista-opcion-card';
            div.innerHTML = `
                <div style="cursor:pointer; padding:15px; border:1px solid #eee; border-radius:12px; text-align:center;" 
                     onclick="elegirProfesional('${key}')">
                    <img src="${p.foto}" style="width:80px; height:80px; border-radius:50%; object-fit:cover; margin-bottom:10px; border: 2px solid var(--dorado-mate);">
                    <p style="margin:0; font-weight:bold;">${p.nombre}</p>
                    <p style="margin:0; font-size:0.75rem; color:#a6835a; text-transform: uppercase;">${p.especialidad}</p>
                </div>
            `;
            contenedor.appendChild(div);
        }
    });

    if (contenedor.innerHTML === '') {
        contenedor.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 20px;">
                <p style="font-size: 0.8rem; color: #888;">No hay especialistas asignados para este servicio.</p>
                <p style="font-size: 0.7rem; color: #a6835a; margin-top:5px;">Tip: Asegúrate que el nombre del servicio coincida con lo que escribiste en el perfil del profesional.</p>
            </div>`;
    }

    modal.style.display = "flex";
};

window.elegirProfesional = (key) => {
    const backup = JSON.parse(localStorage.getItem('reservaEnProgreso')) || {};
    const datosParaGuardar = {
        servicio: backup.servicio || window.servicioActual, 
        profesionalKey: key
    };
    
    console.log("📦 Empacando reserva completa:", datosParaGuardar);
    localStorage.setItem('reservaEnProgreso', JSON.stringify(datosParaGuardar));
    
    window.location.href = "equipo.html";
};



// ... (Aquí seguirían mostrarHorarios, abrirSeleccionEspecialista, etc., sin cambios)
// Iniciar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", iniciarAnimacion);

const frases = [
    "Sé atrevida", 
    "Tu momento de calma", 
    "Relaja tu mente", 
    "Brilla siempre",
    "Siente la armonía"
];
let indice = 0;

function iniciarAnimacion() {
    const elementoTexto = document.getElementById("typing-text");
    
    if (elementoTexto) {
        elementoTexto.style.transition = "opacity 0.6s ease-in-out, transform 0.6s ease-in-out";
        
        setInterval(() => {
            // 1. Salida
            elementoTexto.style.opacity = 0;
            elementoTexto.style.transform = "translateY(10px)";
            
            setTimeout(() => {
                // 2. Cambio
                indice = (indice + 1) % frases.length;
                elementoTexto.textContent = frases[indice];
                
                // 3. Entrada
                elementoTexto.style.opacity = 1;
                elementoTexto.style.transform = "translateY(0)";
            }, 600); 
        }, 4000); 
    }
}


const configurarNavegacion = () => {
    // Botón de Políticas (Imagen 1)
    const btnAceptar = document.getElementById('btnAceptarModal');
    if (btnAceptar) {
        btnAceptar.onclick = () => {
            window.location.href = "servicios.html";
        };
    }
};

// --- LÓGICA DE SELECCIÓN DE HORA (El efecto dorado) ---
function mostrarHorarios() {
    const grid = document.getElementById('gridHorarios');
    grid.innerHTML = '';
    
    datosEquipo[profesionalSeleccionado].turnos.forEach(t => {
        const btn = document.createElement('button');
        btn.className = t.libre ? 'btn-hora' : 'btn-hora hora-ocupada';
        btn.innerText = t.hora;
        
        if (t.libre) {
            btn.onclick = function() {
                // 1. Quitamos la clase 'selected' de todos los botones de hora
                document.querySelectorAll('.btn-hora').forEach(b => b.classList.remove('selected'));
                
                // 2. Agregamos 'selected' al que tocamos (esto activa tu CSS dorado)
                this.classList.add('selected');
                
                // 3. Mostramos el botón de confirmación
                horaSeleccionada = t.hora;
                const btnConfirmar = document.getElementById('btnConfirmarTurno');
                btnConfirmar.style.display = "block";
                btnConfirmar.innerText = `RESERVAR A LAS ${horaSeleccionada}`;
            };
        }
        grid.appendChild(btn);
    });
    document.getElementById('selectorHorarios').style.display = "block";
}

document.addEventListener('DOMContentLoaded', configurarNavegacion);

// Función para cerrar cualquier modal abierto
const cerrarTodosLosModales = () => {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
};

// 1. Cerrar con la tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") cerrarTodosLosModales();
});

// 2. Cerrar haciendo clic fuera del cuadro blanco
window.onclick = (event) => {
    if (event.target.classList.contains('modal')) {
        cerrarTodosLosModales();
    }
};

// 3. Asegurar que el botón "Volver atrás" funcione
document.addEventListener('DOMContentLoaded', () => {
    const btnVolver = document.getElementById('btnCerrarEspecialistas');
    if (btnVolver) {
        btnVolver.onclick = (e) => {
            e.preventDefault();
            cerrarTodosLosModales();
        };
    }
});

// --- 1. DATOS DE SERVICIOS ---
const serviciosPredeterminados = [
    { id: 1, nombre: "Uñas", desc: "Manicuría de alta gama con esmaltado semipermanente.", duracion: 75, precio: "15.000" },
    { id: 2, nombre: "Facial", desc: "Limpieza profunda con activos premium que hidratan.", duracion: 60, precio: "22.000" },
    { id: 3, nombre: "Mesoterapia", desc: "Tratamiento mínimamente invasivo para revitalizar.", duracion: 45, precio: "30.000" }
];

let servicios = JSON.parse(localStorage.getItem('harmony_servicios')) || serviciosPredeterminados;

// --- 2. RENDERIZADO ---
const renderizarServicios = () => {
    const container = document.querySelector('.services-container');
    if (!container) return;

    const isAdmin = localStorage.getItem('harmony_admin') === 'true';
    container.innerHTML = '';

    servicios.forEach(s => {
        const div = document.createElement('div');
        div.className = 'service-card';
        // Importante: position relative para que el menú absoluto se ubique bien
        div.style.position = 'relative'; 

        div.innerHTML = `
    ${isAdmin ? `
    <div class="options-menu" tabindex="0">
        ⋮
        <div class="options-content">
            <button onclick="prepararEdicionServicio(${s.id})">Editar</button>
            <button class="btn-delete" onclick="eliminarServicio(${s.id})">Eliminar</button>
        </div>
    </div>` : ''}
    <h3>${s.nombre}</h3>
    <p>${s.desc}</p>
    <span class="service-info"><strong>Duración:</strong> ${s.duracion} min</span>
    <span class="price">$${s.precio}</span>
    
  
<button class="btn-luxury-dark" onclick="irAReservar('${s.nombre}')">Reservar Turno</button>
`;
        container.appendChild(div);
    });

    // Mostrar/Ocultar el botón flotante
    const addBtn = document.getElementById('adminAddServiceBtn');
    if (addBtn) {
        addBtn.style.display = isAdmin ? 'flex' : 'none';
    }
};

// --- 3. ACCIONES CRUD ---
const formServicio = document.getElementById('formServicio');
if (formServicio) {
    formServicio.onsubmit = (e) => {
        e.preventDefault();
        
        // 1. Captura y Normalización
        const id = document.getElementById('serviceId').value;
        const nombre = document.getElementById('serviceName').value.trim();
        const desc = document.getElementById('serviceDesc').value.trim();
        const duracion = parseInt(document.getElementById('serviceDuration').value);
        const precioRaw = document.getElementById('servicePrice').value.trim();

        // 2. VALIDACIONES CRÍTICAS

        // A. Campos obligatorios
        if (!nombre || !duracion || !precioRaw) {
            alert("⚠️ Por favor, completa los campos obligatorios: Nombre, Duración y Precio.");
            return;
        }

        // B. Evitar duplicados (Solo si es un servicio nuevo)
        if (!id) {
            const existe = servicios.some(s => s.nombre.toLowerCase() === nombre.toLowerCase());
            if (existe) {
                alert(`❌ El servicio "${nombre}" ya existe. Intenta con otro nombre o edita el actual.`);
                return;
            }
        }

        // C. Validar números lógicos
        if (duracion <= 0) {
            alert("⏳ La duración debe ser mayor a 0 minutos.");
            return;
        }

        // Sanitizar precio (quitamos símbolos de moneda si el usuario los puso)
        const precioLimpio = precioRaw.replace(/[^0-9.]/g, '');
        if (parseFloat(precioLimpio) <= 0) {
            alert("💰 El precio debe ser un valor positivo.");
            return;
        }

        // 3. Crear el objeto
        const nuevoServicio = {
            id: id ? parseInt(id) : Date.now(),
            nombre: nombre,
            desc: desc,
            duracion: duracion,
            precio: precioLimpio // Guardamos el número limpio para cálculos futuros
        };

        // 4. Guardado y Persistencia
        if (id) {
            servicios = servicios.map(s => s.id === parseInt(id) ? nuevoServicio : s);
        } else {
            servicios.push(nuevoServicio);
        }

        localStorage.setItem('harmony_servicios', JSON.stringify(servicios));
        renderizarServicios();
        
        // 5. Cierre y Limpieza
        document.getElementById('modalServicio').style.display = 'none';
        formServicio.reset();
        console.log("✅ Servicio guardado correctamente:", nuevoServicio.nombre);
    };
}

window.prepararEdicionServicio = (id) => {
    const s = servicios.find(item => item.id === id);
    document.getElementById('serviceId').value = s.id;
    document.getElementById('serviceName').value = s.nombre;
    document.getElementById('serviceDesc').value = s.desc;
    document.getElementById('serviceDuration').value = s.duracion;
    document.getElementById('servicePrice').value = s.precio;
    document.getElementById('tituloModalServicio').innerText = "Editar Servicio";
    document.getElementById('modalServicio').style.display = 'block';
};

window.eliminarServicio = (id) => {
    if(confirm('¿Eliminar este servicio?')) {
        servicios = servicios.filter(s => s.id !== id);
        localStorage.setItem('harmony_servicios', JSON.stringify(servicios));
        renderizarServicios();
    }
};

// --- 4. INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    renderizarServicios();
    
    const addBtn = document.getElementById('adminAddServiceBtn');
    if (addBtn) {
        addBtn.onclick = () => {
            document.getElementById('serviceId').value = '';
            document.getElementById('formServicio').reset();
            document.getElementById('tituloModalServicio').innerText = "Nuevo Servicio";
            document.getElementById('modalServicio').style.display = 'block';
        };
    }
});

// 1. DATOS INICIALES
let vouchers = JSON.parse(localStorage.getItem('harmony_vouchers')) || [
    { id: 1, nombre: "Relajación", precio: "18.000", features: ["1 Sesión de Facial Profunda", "Tratamiento de Hidratación", "Validez por 30 días"], footer: "Requiere seña del 30% para activar" },
    { id: 2, nombre: "Belleza Total", precio: "28.000", features: ["Estética de Uñas Completa", "Limpieza Facial Express", "Validez por 45 días"], footer: "Sujeto a políticas de cancelación" },
    { id: 3, nombre: "Premium", precio: "45.000", features: ["Sesión de Mesoterapia", "Tratamiento Facial Premium", "Validez por 60 días"], footer: "Cambios hasta 24 hs antes" }
];

let voucherSeleccionado = { plan: "", precio: "" };

// 2. FUNCIÓN DE RENDERIZADO (Dibuja las tarjetas)
const renderizarVouchers = () => {
    const container = document.querySelector('.vouchers-container');
    if (!container) return;
    container.innerHTML = '';

    vouchers.forEach(v => {
        const div = document.createElement('div');
        div.className = 'voucher-card';
        div.style.position = 'relative'; 

        const featuresHtml = v.features.map(f => `<li>${f}</li>`).join('');

        div.innerHTML = `
            <div class="options-menu" onclick="event.stopPropagation()" style="position:absolute; top:15px; left:15px; cursor:pointer; z-index:100;">
                ⋮
                <div class="options-content" style="left: 0; right: auto;">
                    <button onclick="editarVoucher(${v.id})">Editar</button>
                    <button onclick="eliminarVoucher(${v.id})" style="color:red;">Eliminar</button>
                </div>
            </div>

            <h3 class="voucher-title">${v.nombre}</h3>
            <span class="voucher-price">$${v.precio}</span>
            <ul class="voucher-features">${featuresHtml}</ul>

            <button class="btn-luxury-dark btn-comprar-voucher" 
                    data-plan="${v.nombre}" 
                    data-precio="${v.precio}" 
                    style="width: 100%; margin-top: 10px;">
                COMPRAR VOUCHER
            </button>

            <p class="voucher-footer">${v.footer}</p>
        `;
        container.appendChild(div);
    });
};

// 3. LÓGICA DE COMPRA (Tu código de WhatsApp)
document.addEventListener('click', function(e) {
    // Verificamos si lo que se clickeó es el botón de compra
    if (e.target && e.target.classList.contains('btn-comprar-voucher')) {
        voucherSeleccionado.plan = e.target.getAttribute('data-plan');
        voucherSeleccionado.precio = e.target.getAttribute('data-precio');
        
        const modalV = document.getElementById('modalVoucher');
        const tituloV = document.getElementById('tituloVoucherModal');
        
        if (tituloV) tituloV.innerText = `Voucher ${voucherSeleccionado.plan}`;
        if (modalV) modalV.style.display = "flex"; // Usamos flex para centrar
    }
});

const formVoucher = document.getElementById('formVoucher');
if (formVoucher) {
    formVoucher.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const para = document.getElementById('voucherPara').value.trim();
        const de = document.getElementById('voucherDe').value.trim();
        const mensajeUsuario = document.getElementById('voucherMensaje').value.trim();

        // VALIDACIÓN: Evitar que falten nombres
        if (!para || !de) {
            alert("🎁 Por favor, completá para quién es el regalo y quién lo envía.");
            return;
        }

        // VALIDACIÓN: Verificar que haya un plan seleccionado
        if (!voucherSeleccionado || !voucherSeleccionado.plan) {
            alert("⚠️ Por favor, seleccioná un plan de voucher antes de continuar.");
            return;
        }

        enviarPedidoVoucher(para, de, mensajeUsuario);
    });
}

function enviarPedidoVoucher(para, de, mensajeUsuario) {
    const numeroWhatsApp = "5491122334455"; 
    const textoWhatsApp = 
        `¡Hola Harmony! 🌸 Quisiera adquirir un Voucher de Regalo.\n\n` +
        `🎁 *Plan:* ${voucherSeleccionado.plan} ($${voucherSeleccionado.precio})\n` +
        `👤 *Para:* ${para}\n` +
        `✍️ *De:* ${de}\n` +
        `💌 *Mensaje:* ${mensajeUsuario || "Sin mensaje"}\n\n` +
        `¿Me indican cómo proceder con el pago?`;

    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(textoWhatsApp)}`, '_blank');
    cerrarModalVoucher();
}

function cerrarModalVoucher() {
    const modal = document.getElementById('modalVoucher');
    if (modal) modal.style.display = "none";
}

// 4. LÓGICA DE GESTIÓN (Editar/Eliminar/Agregar)
window.editarVoucher = (id) => {
    const v = vouchers.find(x => x.id === id);
    document.getElementById('gestionId').value = v.id;
    document.getElementById('gestNombre').value = v.nombre;
    document.getElementById('gestPrecio').value = v.precio;
    document.getElementById('gestFeatures').value = v.features.join(', ');
    document.getElementById('gestFooter').value = v.footer;
    document.getElementById('modalGestionVoucher').style.display = 'flex';
};

window.eliminarVoucher = (id) => {
    if(confirm('¿Borrar este voucher?')) {
        vouchers = vouchers.filter(v => v.id !== id);
        localStorage.setItem('harmony_vouchers', JSON.stringify(vouchers));
        renderizarVouchers();
    }
};

const formGest = document.getElementById('formGestionVoucher');
if(formGest) {
    formGest.onsubmit = (e) => {
        e.preventDefault();
        
        // 1. Captura y Normalización de datos
        const id = document.getElementById('gestionId').value;
        const nombre = document.getElementById('gestNombre').value.trim();
        const precioRaw = document.getElementById('gestPrecio').value.trim();
        const featuresRaw = document.getElementById('gestFeatures').value.trim();
        const footer = document.getElementById('gestFooter').value.trim() || "Sujeto a políticas";

        // 2. VALIDACIONES DE SEGURIDAD

        // A. Campos obligatorios
        if (!nombre || !precioRaw || !featuresRaw) {
            alert("⚠️ El nombre, el precio y las características son obligatorios para crear el voucher.");
            return;
        }

        // B. Sanitización de Precio (Eliminar '$', ',' o espacios para MySQL)
        const precioLimpio = precioRaw.replace(/[^0-9.]/g, '');
        if (isNaN(parseFloat(precioLimpio)) || parseFloat(precioLimpio) <= 0) {
            alert("💰 Por favor, ingresá un precio válido mayor a 0.");
            return;
        }

        // C. Limpieza de Features (Evitar elementos vacíos si el usuario pone comas de más)
        const listaFeatures = featuresRaw.split(',')
            .map(i => i.trim())
            .filter(i => i !== "");

        const nuevoVoucher = {
            id: id ? parseInt(id) : Date.now(),
            nombre: nombre,
            precio: precioLimpio, // Guardado como número limpio
            features: listaFeatures,
            footer: footer
        };

        // 3. Persistencia en LocalStorage
        if(id) {
            vouchers = vouchers.map(v => v.id === parseInt(id) ? nuevoVoucher : v);
        } else {
            vouchers.push(nuevoVoucher);
        }

        localStorage.setItem('harmony_vouchers', JSON.stringify(vouchers));
        
        // 4. Interfaz y Cierre
        renderizarVouchers();
        document.getElementById('modalGestionVoucher').style.display = 'none';
        formGest.reset(); // Limpieza del formulario
        console.log("✅ Voucher guardado con éxito:", nombre);
    };
}

// 5. INICIO
document.addEventListener('DOMContentLoaded', () => {
    renderizarVouchers();
    const btnAdd = document.getElementById('adminAddVoucherBtn');
    if(btnAdd) {
        btnAdd.onclick = () => {
            formGest.reset();
            document.getElementById('gestionId').value = '';
            document.getElementById('modalGestionVoucher').style.display = 'flex';
        };
    }
});


let fechaVisual = new Date(); // Fecha que controla qué mes se ve

function renderizarDiasCalendario() {
    const contenedor = document.getElementById('contenedorDias');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    const año = fechaVisual.getFullYear();
    const mes = fechaVisual.getMonth();

    // 1. Cabecera del Mes
    const header = document.createElement('div');
    header.className = 'calendar-header-reserva';
    const nombreMes = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(fechaVisual);
    
    header.innerHTML = `
        <button onclick="moverMes(-1)" style="cursor:pointer; background:none; border:none;">❮</button>
        <span style="text-transform: uppercase; letter-spacing: 1px;">${nombreMes}</span>
        <button onclick="moverMes(1)" style="cursor:pointer; background:none; border:none;">❯</button>
    `;
    contenedor.appendChild(header);

    // 2. Cabecera de días (L M M J V S D)
    ['L','M','M','J','V','S','D'].forEach(d => {
        const dDiv = document.createElement('div');
        dDiv.className = 'day-header';
        dDiv.innerText = d;
        contenedor.appendChild(dDiv);
    });

    // 3. Lógica de fechas para validación
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Seteamos a medianoche para comparar solo fechas

    const primerDiaMes = new Date(año, mes, 1).getDay();
    const ajusteInicio = primerDiaMes === 0 ? 6 : primerDiaMes - 1;
    const totalDias = new Date(año, mes + 1, 0).getDate();

    // Espacios vacíos
    for (let i = 0; i < ajusteInicio; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        contenedor.appendChild(empty);
    }

    // 4. Renderizado de días con Validación
    for (let dia = 1; dia <= totalDias; dia++) {
        const diaDiv = document.createElement('div');
        diaDiv.className = 'calendar-day';
        diaDiv.innerText = dia;
        
        // Creamos objeto fecha para este día específico
        const fechaDia = new Date(año, mes, dia);
        const fechaFormateada = `${año}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        
        // VALIDACIÓN: ¿Es una fecha pasada?
        if (fechaDia < hoy) {
            diaDiv.classList.add('fecha-pasada');
            diaDiv.style.opacity = "0.3";
            diaDiv.style.cursor = "not-allowed";
            diaDiv.title = "No puedes elegir una fecha pasada";
        } else {
            // Día disponible
            diaDiv.onclick = (e) => {
                document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                diaDiv.classList.add('selected');
                seleccionarFechaReserva(fechaFormateada);
            };
        }
        
        contenedor.appendChild(diaDiv);
    }
}

function moverMes(delta) {
    fechaVisual.setMonth(fechaVisual.getMonth() + delta);
    renderizarDiasCalendario();
}

function seleccionarFechaReserva(fecha) {
    reserva_dia = fecha; // Guardamos la fecha elegida (ej: "2026-01-28")
    
    const pro = datosEquipo[profesionalSeleccionado];
    const grid = document.getElementById('gridHorarios');
    const contenedorHorarios = document.getElementById('selectorHorarios');
    
    grid.innerHTML = ''; // Limpiamos lo anterior

    // Verificamos si existen turnos para esa fecha exacta
    if (pro.agenda && pro.agenda[fecha] && pro.agenda[fecha].length > 0) {
        
        pro.agenda[fecha].forEach(t => {
            const btn = document.createElement('button');
            btn.className = 'btn-hora'; // Tu clase de los botones dorados
            btn.innerText = t.hora;
            
            btn.onclick = function() {
                // Efecto visual de selección
                document.querySelectorAll('.btn-hora').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                
                // Guardamos la hora elegida
                reserva_hora = t.hora;
                
                // Mostramos el botón final de reserva
                document.getElementById('btnConfirmarTurno').style.display = "block";
            };
            grid.appendChild(btn);
        });

        contenedorHorarios.style.display = "block"; // Mostramos el contenedor
    } else {
        // Si no hay turnos, avisamos al cliente
        grid.innerHTML = '<p style="font-size: 0.8rem; color: #888; grid-column: 1/-1;">No hay turnos disponibles para esta fecha.</p>';
        contenedorHorarios.style.display = "block";
        document.getElementById('btnConfirmarTurno').style.display = "none";
    }
}

window.agregarHorarioAProfesional = (proKey, fecha, hora) => {
    if (!datosEquipo[proKey].agenda) datosEquipo[proKey].agenda = {};
    if (!datosEquipo[proKey].agenda[fecha]) datosEquipo[proKey].agenda[fecha] = [];
    
    // Agregamos el nuevo horario
    datosEquipo[proKey].agenda[fecha].push({ hora: hora, libre: true });
    
    // Guardamos en LocalStorage
    localStorage.setItem('harmony_equipo', JSON.stringify(datosEquipo));
    alert(`Horario ${hora} agregado a ${proKey} para el día ${fecha}`);
};

// Variable para saber a quién le estamos editando las horas
let proEnEdicion = "";

window.abrirGestionHorarios = (key) => {
    proEnEdicion = key; // Seteamos la variable que usa tu función agregarHoraLista
    const modal = document.getElementById('modalGestionHorarios');
    
    // Actualizar título del modal
    const titulo = modal.querySelector('h2') || document.getElementById('tituloGestion');
    if (titulo) titulo.innerText = `Agenda de ${datosEquipo[key].nombre}`;
    
    modal.style.display = "flex";
    
    // Si ya hay una fecha seleccionada en el input, renderizamos sus horas
    const fechaInput = document.getElementById('fechaGestion');
    if (fechaInput.value) renderizarHorasEnGestion(fechaInput.value);
};

// Escuchador para que cuando cambies la fecha en el modal de admin, se actualice la lista automáticamente
document.getElementById('fechaGestion')?.addEventListener('change', (e) => {
    renderizarHorasEnGestion(e.target.value);
});

function agregarHoraLista() {
    const fecha = document.getElementById('fechaGestion').value;
    const hora = document.getElementById('horaGestion').value;

    if (!fecha || !hora) {
        alert("Por favor, seleccioná fecha y hora.");
        return;
    }

    // Si el profesional no tiene agenda, la creamos
    if (!datosEquipo[proEnEdicion].agenda) datosEquipo[proEnEdicion].agenda = {};
    // Si la fecha no tiene turnos, creamos el array
    if (!datosEquipo[proEnEdicion].agenda[fecha]) datosEquipo[proEnEdicion].agenda[fecha] = [];

    // Verificamos si la hora ya existe para no duplicar
    const existe = datosEquipo[proEnEdicion].agenda[fecha].some(t => t.hora === hora);
    if (existe) {
        alert("Este horario ya existe para este día.");
        return;
    }

    // Agregamos el turno
    datosEquipo[proEnEdicion].agenda[fecha].push({ hora: hora, libre: true });
    
    // Ordenar los horarios automáticamente (de menor a mayor)
    datosEquipo[proEnEdicion].agenda[fecha].sort((a, b) => a.hora.localeCompare(b.hora));

    guardarYRenderizar(); // Tu función que guarda en LocalStorage
    renderizarHorasEnGestion(fecha);
}

function renderizarHorasEnGestion(fecha) {
    const contenedor = document.getElementById('listaHorariosDia');
    contenedor.innerHTML = '';
    
    const turnos = (datosEquipo[proEnEdicion].agenda && datosEquipo[proEnEdicion].agenda[fecha]) 
                   ? datosEquipo[proEnEdicion].agenda[fecha] 
                   : [];

    if (turnos.length === 0) {
        contenedor.innerHTML = '<p style="font-size: 0.7rem; color: #888;">Sin turnos para esta fecha.</p>';
        return;
    }

    turnos.forEach((t, index) => {
        const item = document.createElement('div');
        item.style = "display: flex; justify-content: space-between; align-items: center; padding: 5px; border-bottom: 1px solid #f9f9f9; font-size: 0.8rem;";
        item.innerHTML = `
            <span>${t.hora} hs</span>
            <button onclick="eliminarHoraGestion('${fecha}', ${index})" style="background:none; border:none; color:red; cursor:pointer;">✕</button>
        `;
        contenedor.appendChild(item);
    });
}

function eliminarHoraGestion(fecha, index) {
    datosEquipo[proEnEdicion].agenda[fecha].splice(index, 1);
    guardarYRenderizar();
    renderizarHorasEnGestion(fecha);
}

function cerrarGestionHorarios() {
    document.getElementById('modalGestionHorarios').style.display = "none";
    document.getElementById('fechaGestion').value = "";
    document.getElementById('horaGestion').value = "";
}

// --- 1. FUNCIÓN ABRIR CALENDARIO (CORREGIDA) ---
window.abrirCalendario = (key) => {
    // Limpiamos la 'key' de espacios en blanco por si viene con errores
    const keyLimpia = key.trim();
    const p = datosEquipo[key];
    
    // Si el profesional no existe o está inactivo, abortamos la misión
    if (!p || p.activo === false) {
        console.warn("Acceso denegado: El especialista está inactivo.");
        return; 
    }
    
    // Buscamos si existe de forma exacta o buscando coincidencias sin espacios
    const idReal = Object.keys(datosEquipo).find(k => k.trim() === keyLimpia);

    if (!idReal) {
        console.error("ERROR: No existe '" + keyLimpia + "' en datosEquipo.");
        console.log("IDs actuales en DB:", Object.keys(datosEquipo));
        alert("Lo sentimos, hubo un error al cargar la agenda de este especialista.");
        return;
    }

    // Usamos el ID real encontrado en la base de datos
    profesionalSeleccionado = idReal; 
    reserva_profesional = idReal; 

    document.getElementById('nombreProfesional').innerText = datosEquipo[idReal].nombre;
    
    if (typeof renderizarDiasCalendario === "function") {
        renderizarDiasCalendario(); 
    }
    
    document.getElementById('modalCalendario').style.display = "block";
    document.getElementById('selectorHorarios').style.display = "none";
    document.getElementById('btnConfirmarTurno').style.display = "none";
};

// --- 2. FILTRO DE ESPECIALISTAS (PARA EL MODAL) ---
function abrirSeleccionEspecialista(servicio) {
    const modal = document.getElementById('modalEspecialistas');
    const contenedor = document.getElementById('contenedorEspecialistas');
    if (!modal || !contenedor) return;

    servicioActual = servicio; 
    const filtro = servicio.toLowerCase().trim();

    document.getElementById('tituloServicioElegido').innerText = `Elegir Especialista para ${servicio}`;
    contenedor.innerHTML = '';

    Object.keys(datosEquipo).forEach(key => {
        const p = datosEquipo[key];
        
        // Comparamos los servicios ignorando mayúsculas y espacios
        const haceElServicio = p.servicios && p.servicios.some(s => s.toLowerCase().trim() === filtro);

        if (haceElServicio) {
            const div = document.createElement('div');
            div.className = 'especialista-opcion-card'; // Asegúrate que tu CSS use esta clase
            div.innerHTML = `
                <div class="card-content" onclick="elegirProfesional('${key}')">
                    <img src="${p.foto}" class="img-mini">
                    <p><strong>${p.nombre}</strong></p>
                    <small>${p.especialidad}</small>
                </div>
            `;
            contenedor.appendChild(div);
        }
    });

    modal.style.display = "flex";
}

// 2. Esta función reemplaza a la tuya para buscar en la AGENDA
function seleccionarFechaReserva(fecha) {
    reserva_dia = fecha; 
    const pro = datosEquipo[reserva_profesional];
    const grid = document.getElementById('gridHorarios');
    
    // 1. Cargamos el historial de todas las reservas hechas en Harmony
    const todasLasReservas = JSON.parse(localStorage.getItem('harmony_reservas')) || [];
    
    grid.innerHTML = ''; 

    if (pro.agenda && pro.agenda[fecha] && pro.agenda[fecha].length > 0) {
        pro.agenda[fecha].forEach(t => {
            const btn = document.createElement('button');
            btn.className = 'btn-hora';
            btn.innerText = t.hora;

            // --- EL BLOQUEO MÁGICO ---
            // Buscamos si ya hay una reserva para este profesional, este día y esta hora
            const estaOcupado = todasLasReservas.some(reserva => 
                reserva.fecha === fecha && 
                reserva.hora === t.hora && 
                reserva.profesional === pro.nombre &&
                reserva.estado !== "Cancelado" // Si está cancelado, el lugar se libera
            );

            if (estaOcupado) {
                // Si está ocupado: deshabilitamos el botón y cambiamos el estilo
                btn.classList.add('hora-ocupada');
                btn.disabled = true;
                btn.style.opacity = "0.4";
                btn.style.cursor = "not-allowed";
                btn.innerText = `${t.hora} (Ocupado)`;
            } else {
                // Si está libre: funciona normalmente
                btn.onclick = function() {
                    document.querySelectorAll('.btn-hora').forEach(b => b.classList.remove('selected'));
                    this.classList.add('selected');
                    reserva_hora = t.hora; 
                    
                    const btnRes = document.getElementById('btnConfirmarTurno');
                    btnRes.style.display = "block";
                    btnRes.innerText = `RESERVAR A LAS ${reserva_hora}`;
                };
            }
            grid.appendChild(btn);
        });
        document.getElementById('selectorHorarios').style.display = "block";
    } else {
        grid.innerHTML = '<p style="font-size:0.8rem; color:#888;">No hay turnos para esta fecha.</p>';
        document.getElementById('selectorHorarios').style.display = "block";
        document.getElementById('btnConfirmarTurno').style.display = "none";
    }
}

window.confirmarYReservar = (event) => {
    if (event) event.preventDefault();
    
    // 1. Guardamos los datos en el objeto global
    reserva_final_objeto.servicio = window.servicioActual || "Servicio Harmony";
    reserva_final_objeto.profesional = datosEquipo[reserva_profesional] ? datosEquipo[reserva_profesional].nombre : "Especialista";
    reserva_final_objeto.dia = reserva_dia;
    reserva_final_objeto.hora = reserva_hora;

    // 2. Preparamos el resumen visual para el nuevo modal
    const fechaLimpia = reserva_dia.split('-').reverse().join('/');
    
    document.getElementById('resumenVerificacion').innerHTML = `
        <p style="margin: 5px 0;"><strong>✨ Servicio:</strong> ${reserva_final_objeto.servicio}</p>
        <p style="margin: 5px 0;"><strong>👤 Especialista:</strong> ${reserva_final_objeto.profesional}</p>
        <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${fechaLimpia}</p>
        <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${reserva_final_objeto.hora} hs</p>
    `;

    // 3. Saltamos al modal de verificación
    document.getElementById('modalCalendario').style.display = "none";
    document.getElementById('modalPreConfirmacion').style.display = "flex";
};

// Acción: El cliente quiere cambiar algo
window.cerrarPreConfirmacion = () => {
    document.getElementById('modalPreConfirmacion').style.display = "none";
    document.getElementById('modalCalendario').style.display = "block"; // Reabre el calendario
};

// Acción: El cliente confirma que todo está OK
window.procederAlPago = () => {
    // 1. Cerramos el resumen
    document.getElementById('modalPreConfirmacion').style.display = "none";
    
    // 2. Abrimos el nuevo modal de datos personales
    document.getElementById('modalDatosCliente').style.display = "flex";
};

window.validarYPasarAlPago = () => {
    const nombre = document.getElementById('inputNombreCliente').value.trim();
    const tel = document.getElementById('inputTelCliente').value.trim();

    if (!nombre || !tel) {
        alert("⚠️ Por favor, completa tu nombre y teléfono.");
        return;
    }

    // Si están OK, cerramos este modal y abrimos el de pago
    document.getElementById('modalDatosCliente').style.display = "none";
    document.getElementById('modalPagoSena').style.display = "flex";
};

window.confirmarYEnviarWhatsApp = () => {
    const numeroAdmin = "5493537650821";

    // Formateamos la fecha de AAAA-MM-DD a DD/MM/AAAA para que sea legible
    const fechaFormateada = reserva_final_objeto.dia.split('-').reverse().join('/');

    const mensaje = `¡Hola Harmony! ✨ Realicé el pago de seña:

*Servicio:* ${reserva_final_objeto.servicio}
*Profesional:* ${reserva_final_objeto.profesional}
*Fecha:* ${fechaFormateada}
*Hora:* ${reserva_final_objeto.hora} hs

Adjunto el comprobante del pago.`;

    const url = `https://wa.me/${numeroAdmin}?text=${encodeURIComponent(mensaje)}`;
    
    // Abrir WhatsApp
    window.open(url, '_blank');

    // AHORA SÍ: Limpiamos porque la reserva ya se envió
    localStorage.removeItem('reservaEnProgreso');

    // Mostrar resumen final
    if (typeof window.mostrarResumenFinal === 'function') {
        window.mostrarResumenFinal();
    }
};

window.mostrarResumenFinal = () => {
    // Buscamos el modal de resumen (debe existir en tu HTML)
    const modalFinal = document.getElementById('modalResumenTurno');
    const detalle = document.getElementById('detalleResumen');

    if (detalle) {
        detalle.innerHTML = `
            <div style="border: 1px solid var(--dorado-mate); padding: 15px; border-radius: 8px; background: #fffcf9;">
                <p style="margin-bottom: 8px;">✅ <strong>Servicio:</strong> ${reserva_final_objeto.servicio}</p>
                <p style="margin-bottom: 8px;">✅ <strong>Profesional:</strong> ${reserva_final_objeto.profesional}</p>
                <p style="margin-bottom: 8px;">✅ <strong>Fecha:</strong> ${reserva_final_objeto.dia}</p>
                <p style="margin-bottom: 0;">✅ <strong>Hora:</strong> ${reserva_final_objeto.hora} hs</p>
            </div>
            <p style="font-size: 0.8rem; color: #888; margin-top: 15px;">
                Hemos abierto una ventana de WhatsApp. Por favor, enviá el comprobante para validar tu turno.
            </p>
        `;
    }

    if (modalFinal) modalFinal.style.display = 'flex';
};

const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.onclick = (e) => {
        e.preventDefault();
        document.getElementById('modalLogin').style.display = 'block';
    };
}



window.irAReservar = (nombreServicio) => {
    console.log("Guardando servicio:", nombreServicio);

    // 1. Creamos el objeto con la estructura que espera la otra página
    const datosReserva = {
        servicio: nombreServicio,
        timestamp: new Date().getTime()
    };

    // 2. Guardamos en el 'cajón' del navegador
    localStorage.setItem('reservaEnProgreso', JSON.stringify(datosReserva));

    // 3. Verificamos que se guardó antes de seguir
    console.log("Contenido guardado:", localStorage.getItem('reservaEnProgreso'));

    // 4. Abrimos el modal de especialistas (o navegamos si es necesario)
    if (typeof window.abrirSeleccionEspecialista === 'function') {
        window.abrirSeleccionEspecialista(nombreServicio);
    } else {
        // Solo si usas páginas separadas, descomenta la siguiente línea:
        // window.location.href = "equipo.html";
    }
};


// Función para cerrar este modal
const btnCerrar = document.getElementById('btnCerrarEspecialistas');
if (btnCerrar) {
    btnCerrar.onclick = () => {
        document.getElementById('modalEspecialistas').style.display = 'none';
    };
}

window.renderizarEspecialistasEnModal = (servicioElegido) => {
    const contenedor = document.getElementById('contenedorEspecialistas');
    if (!contenedor) return;

    contenedor.innerHTML = ''; 

    // Dentro de renderizarEspecialistasEnModal...
const especialistasEncontrados = Object.keys(datosPredeterminados).filter(key => {
    const pro = datosPredeterminados[key];
    
    // Convertimos ambos a minúsculas antes de comparar
    return pro.servicios.some(s => s.toLowerCase() === servicioElegido.toLowerCase());
});

    if (especialistasEncontrados.length === 0) {
        contenedor.innerHTML = `<p style="grid-column: 1/-1; color: #888;">No hay especialistas asignados para ${servicioElegido}.</p>`;
        return;
    }

    especialistasEncontrados.forEach(key => {
        const pro = datosPredeterminados[key];
        contenedor.innerHTML += `
            <div class="especialista-card" onclick="irAEquipoConEspecialista('${key}', '${servicioElegido}')" style="cursor:pointer; padding:15px; border:1px solid #eee; border-radius:12px; text-align:center;">
                <img src="${pro.foto}" alt="${pro.nombre}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border: 2px solid var(--dorado-mate);">
                <h4 style="margin:10px 0 5px; font-family: 'Playfair Display', serif;">${pro.nombre}</h4>
                <p style="font-size:0.7rem; color:var(--dorado-mate); text-transform: uppercase;">${pro.especialidad}</p>
            </div>
        `;
    });
};

// Lo que pasa cuando elegís a la chica
window.seleccionarProfesional = (staff, servicio) => {
    alert(`Elegiste a ${staff} para el servicio de ${servicio}. Aquí abriríamos el calendario.`);
    // Aquí podrías cerrar este modal y abrir el del calendario
    document.getElementById('modalEspecialistas').style.display = 'none';
};

window.irAEquipoConEspecialista = (key, servicio) => {
    const reserva = {
        profesionalKey: key, // 'Juan' o 'Mateo'
        servicio: servicio
    };
    localStorage.setItem('reservaEnProgreso', JSON.stringify(reserva));
    window.location.href = "equipo.html";
};

window.cerrarCalendario = () => {
    const modal = document.getElementById('modalCalendario');
    if (modal) modal.style.display = "none";
};

function verificarReservaEnProgreso() {
    const data = localStorage.getItem('reservaEnProgreso');
    if (data) {
        const reserva = JSON.parse(data);
        
        // 1. Recuperamos el servicio para que no se pierda
        window.servicioActual = reserva.servicio;
        if (typeof reserva_final_objeto !== 'undefined') {
            reserva_final_objeto.servicio = reserva.servicio;
        }

        setTimeout(() => {
            if (typeof window.abrirCalendario === 'function') {
                window.abrirCalendario(reserva.profesionalKey);
            }
            // --- LÍNEA ELIMINADA: localStorage.removeItem('reservaEnProgreso'); ---
            // No borramos aquí, borramos al final del mensaje de WhatsApp.
        }, 800);
    }
}

// --- ÚNICO SINCRONIZADOR DE FLUJO ---
document.addEventListener('DOMContentLoaded', () => {
    const backup = localStorage.getItem('reservaEnProgreso');
    
    if (backup) {
        try {
            const datos = JSON.parse(backup);
            
            // 1. Recuperamos el servicio y lo inyectamos en todas partes
            if (datos.servicio) {
                window.servicioActual = datos.servicio;
                if (typeof reserva_final_objeto !== 'undefined') {
                    reserva_final_objeto.servicio = datos.servicio;
                }
                
                // Actualizamos títulos si existen en la página actual
                const titulo = document.getElementById('tituloServicioElegido');
                if (titulo) titulo.innerText = `Especialistas para ${datos.servicio}`;
            }

            // 2. Recuperamos el profesional si ya fue seleccionado
            if (datos.profesionalKey) {
                window.reserva_profesional = datos.profesionalKey;
                
                // Si entramos a equipo.html, abrimos el calendario automáticamente
                if (window.location.pathname.includes("equipo.html")) {
                    setTimeout(() => {
                        if (typeof abrirCalendario === 'function') {
                            abrirCalendario(datos.profesionalKey);
                        }
                    }, 400); 
                }
            }
            console.log("✅ Sistema Harmony sincronizado:", datos.servicio);
        } catch (e) {
            console.error("Error al leer storage", e);
        }
    }
});

window.verHistorial = (nombreProfesional) => {
    const contenedor = document.getElementById('listaTurnosEspecialista');
    const titulo = document.getElementById('tituloHistorial');
    if (!contenedor) return;

    titulo.innerText = `Agenda de ${nombreProfesional}`;
    contenedor.innerHTML = '';

    const todasLasReservas = JSON.parse(localStorage.getItem('harmony_reservas')) || [];

    // --- FILTRO DE ARCHIVADO ---
    // El especialista solo ve lo que NO está marcado como archivado
    const turnosFiltrados = todasLasReservas.filter(reserva => 
        reserva.profesional && 
        reserva.profesional.trim() === nombreProfesional.trim() &&
        !reserva.archivado
    );

    const completados = turnosFiltrados.filter(t => t.estado === "Completado").length;
    const pendientes = turnosFiltrados.filter(t => t.estado !== "Completado" && t.estado !== "Cancelado").length;

    // 1. Resumen y Botón de Limpieza (Archivado)
    let headerHTML = `
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <div style="flex: 1; background: #d4edda; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #c3e6cb;">
                <span style="display: block; font-size: 1.2rem; font-weight: bold; color: #155724;">${completados}</span>
                <span style="font-size: 0.6rem; color: #155724; text-transform: uppercase;">Realizados</span>
            </div>
            <div style="flex: 1; background: #fff3cd; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #ffeeba;">
                <span style="display: block; font-size: 1.2rem; font-weight: bold; color: #856404;">${pendientes}</span>
                <span style="font-size: 0.6rem; color: #856404; text-transform: uppercase;">Pendientes</span>
            </div>
        </div>
    `;

    // Solo mostramos el botón de limpiar si hay algo que archivar (Completados o Cancelados)
    const hayParaArchivar = turnosFiltrados.some(t => t.estado === "Completado" || t.estado === "Cancelado");
    
    if (hayParaArchivar) {
        headerHTML += `
            <button onclick="archivarTurnosProfesional('${nombreProfesional}')" 
                    style="width: 100%; margin-bottom: 20px; font-size: 0.7rem; background: #f8f5f2; border: 1px solid #e0d1bc; color: #a6835a; padding: 8px; cursor: pointer; border-radius: 8px; font-weight: bold; transition: 0.3s;">
                📦 LIMPIAR HISTORIAL (ARCHIVAR FINALIZADOS)
            </button>
        `;
    }

    contenedor.innerHTML = headerHTML;

    if (turnosFiltrados.length === 0) {
        contenedor.innerHTML += '<p style="text-align:center; color:#888; margin-top:20px;">No hay turnos activos.</p>';
    } else {
        turnosFiltrados.forEach((turno) => {
            const idSeguro = turno.id || "viejo-" + Math.random();
            const estadoSeguro = turno.estado || "PENDIENTE";
            
            // Unificamos formato de fecha para la vista
            const fechaMostrar = (turno.fecha && turno.fecha.includes('-')) 
                ? turno.fecha.split('-').reverse().join('/') 
                : (turno.fecha || 'Sin fecha');

            let colorEstado = "#e0d1bc"; 
            if (estadoSeguro === "Completado") colorEstado = "#d4edda";
            if (estadoSeguro === "Cancelado") colorEstado = "#f8d7da";

            const div = document.createElement('div');
            div.style = `padding: 12px; border-bottom: 1px solid #eee; margin-bottom: 10px; border-radius: 8px; background: #fafafa; border-left: 5px solid ${colorEstado};`;
            
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.8rem; font-weight: bold; color: #a6835a;">${fechaMostrar} - ${turno.hora || 'Sin hora'}hs</span>
                    <span style="font-size: 0.6rem; padding: 2px 6px; border-radius: 10px; background: ${colorEstado}; color: #333; font-weight: bold;">
                        ${estadoSeguro}
                    </span>
                </div>
                <p style="margin: 5px 0 0 0; font-size: 0.9rem;"><strong>Cliente:</strong> ${turno.cliente || 'Anónimo'}</p>
                
                <div style="margin-top: 10px; display: flex; gap: 5px;">
                    ${estadoSeguro === "PENDIENTE" ? `
                        <button onclick="cambiarEstadoTurno('${idSeguro}', 'Completado')" style="flex:1; background:#28a745; color:white; border:none; padding:5px; border-radius:5px; font-size:0.7rem; cursor:pointer;">✓</button>
                        <button onclick="cambiarEstadoTurno('${idSeguro}', 'Cancelado')" style="flex:1; background:#dc3545; color:white; border:none; padding:5px; border-radius:5px; font-size:0.7rem; cursor:pointer;">✕</button>
                    ` : ''}
                </div>
            `;
            contenedor.appendChild(div);
        });
    }

    document.getElementById('modalHistorial').style.display = 'flex';
};

window.archivarTurnosProfesional = (nombrePro) => {
    if (!confirm("¿Deseas archivar los turnos finalizados?")) return;

    let reservas = JSON.parse(localStorage.getItem('harmony_reservas')) || [];
    
    // Normalizamos el nombre para la comparación
    const nombreNormalizado = nombrePro.trim().toLowerCase();

    reservas = reservas.map(r => {
        const proReserva = (r.profesional || "").trim().toLowerCase();
        
        // Si es el profesional correcto Y el turno ya no está PENDIENTE
        if (proReserva === nombreNormalizado && (r.estado === "Completado" || r.estado === "Cancelado")) {
            return { ...r, archivado: true };
        }
        return r;
    });

    localStorage.setItem('harmony_reservas', JSON.stringify(reservas));
    verHistorial(nombrePro); 
};

// --- Lógica de Gestión de Turnos ---

window.cambiarEstadoTurno = (idTurno, nuevoEstado) => {
    let reservas = JSON.parse(localStorage.getItem('harmony_reservas')) || [];
    const index = reservas.findIndex(r => r.id === idTurno);
    
    if (index !== -1) {
        if (nuevoEstado === "Cancelado") {
            if (!confirm("¿Estás seguro de que deseas cancelar este turno?")) return;
        }
        
        // Actualizamos el estado en el objeto
        reservas[index].estado = nuevoEstado;
        
        // Guardamos en el "disco duro" del navegador
        localStorage.setItem('harmony_reservas', JSON.stringify(reservas));
        
        // REFRESCO DINÁMICO: Volvemos a mostrar la agenda actualizada
        verHistorial(reservas[index].profesional);
    }
};


window.cerrarHistorial = () => {
    document.getElementById('modalHistorial').style.display = 'none';
};

window.guardarReservaFinal = () => {
    // 1. Obtenemos lo que ya hay en el "disco"
    let reservasPrevias = JSON.parse(localStorage.getItem('harmony_reservas')) || [];

    // 2. Capturamos y normalizamos los datos del cliente
    const nombreCliente = document.getElementById('inputNombreCliente').value.trim();
    const telCliente = document.getElementById('inputTelCliente').value.trim();

    // --- VALIDACIONES DE SEGURIDAD ---

    // A. Validar que los campos del cliente no estén vacíos
    if (!nombreCliente || !telCliente) {
        alert("⚠️ Por favor, completa tu nombre y teléfono para poder agendar el turno.");
        return; // Detenemos el guardado
    }

    // B. Validar que los datos del turno existan (evitar objetos vacíos por error de flujo)
    if (!reserva_final_objeto.servicio || !reserva_final_objeto.dia || !reserva_final_objeto.hora) {
        alert("❌ Hubo un error al procesar los datos del turno. Por favor, selecciona la fecha y hora nuevamente.");
        return;
    }

    // 3. CREAMOS EL OBJETO COMPLETO PARA EL HISTORIAL
    const nuevaReserva = {
        id: Date.now().toString(), 
        cliente: nombreCliente,
        telefono: telCliente,
        servicio: reserva_final_objeto.servicio,
        profesional: reserva_final_objeto.profesional, 
        fecha: reserva_final_objeto.dia,
        hora: reserva_final_objeto.hora,
        estado: "PENDIENTE",
        fechaCreacion: new Date().toISOString() // Añadimos una marca de tiempo para auditoría
    };

    // 4. Guardamos de forma segura
    try {
        reservasPrevias.push(nuevaReserva);
        localStorage.setItem('harmony_reservas', JSON.stringify(reservasPrevias));

        alert(`¡Gracias ${nombreCliente}! ✨ Turno confirmado para el ${reserva_final_objeto.dia} a las ${reserva_final_objeto.hora} hs.`);
        
        // En lugar de reload, podemos llamar a la limpieza de variables
        localStorage.removeItem('reservaEnProgreso');
        location.reload(); 
    } catch (error) {
        console.error("Error al guardar en LocalStorage:", error);
        alert("Hubo un problema al guardar tu reserva. Inténtalo de nuevo.");
    }
};

window.abrirAdminHistorial = () => {
    document.getElementById('modalAdminHistorial').style.display = 'flex';
    renderizarAdminHistorial();
};

window.renderizarAdminHistorial = () => {
    const tabla = document.getElementById('tablaAdminReservas');
    const filtro = document.getElementById('filtroAdminBusqueda').value.toLowerCase();
    const todasLasReservas = JSON.parse(localStorage.getItem('harmony_reservas')) || [];
    
    tabla.innerHTML = '';

    // Ordenar por fecha (más recientes primero)
    todasLasReservas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    todasLasReservas.forEach(reserva => {
        // Buscador básico
        const coincide = reserva.cliente.toLowerCase().includes(filtro) || 
                         reserva.profesional.toLowerCase().includes(filtro);
        
        if (!coincide) return;

        // Lógica de colores para el estado
        let colorEstado = "#888"; // Pendiente
        if (reserva.estado === "Completado") colorEstado = "#28a745";
        if (reserva.estado === "Cancelado") colorEstado = "#dc3545";

        const tr = document.createElement('tr');
        tr.style.borderBottom = "1px solid #eee";
        
        tr.innerHTML = `
            <td style="padding: 12px;"><strong>${reserva.fecha}</strong><br><small>${reserva.hora}hs</small></td>
            <td style="padding: 12px;">${reserva.cliente}<br><small>${reserva.telefono}</small></td>
            <td style="padding: 12px;">${reserva.profesional}</td>
            <td style="padding: 12px;">${reserva.servicio}</td>
            <td style="padding: 12px;">
                <span style="color: ${colorEstado}; font-weight: bold; font-size: 0.7rem;">
                    ● ${reserva.estado || 'PENDIENTE'}
                </span>
            </td>
            <td style="padding: 12px;">
                <select onchange="actualizarEstadoAdmin('${reserva.id}', this.value)" style="font-size: 0.7rem; padding: 3px;">
                    <option value="PENDIENTE" ${reserva.estado === 'PENDIENTE' ? 'selected' : ''}>Pendiente</option>
                    <option value="Completado" ${reserva.estado === 'Completado' ? 'selected' : ''}>Completado</option>
                    <option value="Cancelado" ${reserva.estado === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
            </td>
        `;
        tabla.appendChild(tr);
    });
};

window.actualizarEstadoAdmin = (id, nuevoEstado) => {
    let reservas = JSON.parse(localStorage.getItem('harmony_reservas')) || [];
    const idx = reservas.findIndex(r => r.id === id);
    if (idx !== -1) {
        reservas[idx].estado = nuevoEstado;
        localStorage.setItem('harmony_reservas', JSON.stringify(reservas));
        renderizarAdminHistorial(); // Refrescar tabla
        alert(`Estado actualizado a ${nuevoEstado}`);
    }
};

window.cerrarAdminHistorial = () => {
    document.getElementById('modalAdminHistorial').style.display = 'none';
};