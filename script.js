// ==========================================
// CONTROLADOR DE INTERFAZ DE USUARIO (UI)
// ==========================================
let simulador = null;

// ELEMENTOS DEL DOM COMPARTIDOS
const pantallaInicio = document.getElementById("pantalla-inicio");
const pantallaJuego = document.getElementById("pantalla-juego");
const pantallaResultados = document.getElementById("pantalla-resultados");

const preguntaHTML = document.getElementById("pregunta");
const opcionesHTML = document.getElementById("opciones");
const puntajeHTML = document.getElementById("puntaje");
const numeroPreguntaHTML = document.getElementById("numeroPregunta");
const contenedorImagenHTML = document.getElementById("contenedorImagen");
const materiaActualHTML = document.getElementById("materiaActual");

const btnAnterior = document.getElementById("btnAnterior");
const btnOmitir = document.getElementById("btnOmitir");
const btnSiguiente = document.getElementById("btnSiguiente");

// ==========================================
// INICIAR SIMULACIÓN
// ==========================================
function iniciarConExamen(nombreExamen) {
    let preguntasSeleccionadas = [];
    let tituloSimulacion = "";

    // Cargar preguntas según la selección del usuario
    if (nombreExamen === '2026_I_A') {
        preguntasSeleccionadas = exam2026_I_A;
        tituloSimulacion = "Examen Ordinario 2026-I";
    } else if (nombreExamen === '2025_II_A') {
        preguntasSeleccionadas = exam2025_II_A;
        tituloSimulacion = "Examen Ordinario 2025-II";
    }

    if (!preguntasSeleccionadas || preguntasSeleccionadas.length === 0) {
        alert("Error: Examen no encontrado o sin preguntas.");
        return;
    }

    // Instanciar el motor lógico (Puntaje Oficial UNASAM: +4.00 correcta, -0.50 incorrecta)
    simulador = new SimuladorEngine(preguntasSeleccionadas, { correcta: 4.0, incorrecta: -0.5 });

    // Actualizar Subtítulo
    document.getElementById('subtituloExamen').innerHTML = tituloSimulacion;
    
    // Resetear marcador visual
    puntajeHTML.innerHTML = "0.00";

    // Cambiar pantallas
    pantallaInicio.style.display = 'none';
    pantallaResultados.style.display = 'none';
    pantallaJuego.style.display = 'flex';

    // Cargar primera pregunta
    cargarPreguntaActual();
}

// ==========================================
// RENDERIZAR PREGUNTA ACTUAL
// ==========================================
function cargarPreguntaActual() {
    if (!simulador) return;

    const pregunta = simulador.obtenerPreguntaActual();
    const progreso = simulador.obtenerProgreso();

    // 1. Controlar visibilidad del botón Anterior
    btnAnterior.style.display = (progreso.actual === 1) ? "none" : "block";

    // 2. Actualizar contador de pregunta
    numeroPreguntaHTML.innerHTML = pregunta.numero;

    // 3. Curso / Materia y Colores de la Etiqueta
    const curso = pregunta.curso;
    materiaActualHTML.innerHTML = curso.toUpperCase();

    const listaCiencias = ["Razonamiento Matemático", "Matemática", "Física", "Química"];
    const esCiencia = listaCiencias.includes(curso);
    materiaActualHTML.className = esCiencia ? "etiqueta-materia mate" : "etiqueta-materia verbal";

    // 4. Manejo de Imágenes
    if (contenedorImagenHTML) {
        contenedorImagenHTML.innerHTML = "";
        if (pregunta.imagen) {
            let img = document.createElement("img");
            img.src = pregunta.imagen;
            img.classList.add("imagen-pregunta");
            contenedorImagenHTML.appendChild(img);
        }
    }

    // 5. Texto de Contexto (Lecturas de Verbal) y Enunciado
    if (pregunta.texto_contexto) {
        preguntaHTML.innerHTML = `
            <div style="background:#eef4ff; color:#222; padding:15px; border-radius:10px; margin-bottom:20px; font-size:15px; line-height:1.4; border-left:5px solid #00509e; text-align:left;">
                ${pregunta.texto_contexto}
            </div>
            <div>${pregunta.enunciado}</div>`;
    } else {
        preguntaHTML.innerHTML = pregunta.enunciado;
    }

    // 6. Cargar Opciones
    opcionesHTML.innerHTML = "";
    const yaRespondida = pregunta.respuestaUsuario !== undefined;

    if (yaRespondida) {
        // Bloquear botón omitir porque ya fue respondida
        btnOmitir.disabled = true;
        btnOmitir.style.opacity = "0.3";

        // Habilitar siguiente
        btnSiguiente.disabled = false;
        btnSiguiente.style.opacity = "1";

        const correcta = pregunta.correcta;
        const seleccionada = pregunta.respuestaUsuario;

        Object.entries(pregunta.opciones).forEach(([letra, texto]) => {
            let boton = document.createElement("button");
            boton.innerHTML = `<span style="font-weight:bold; color:#00509e; margin-right:8px;">${letra.toUpperCase()})</span> ${texto}`;
            boton.classList.add("opcion");
            boton.disabled = true;
            boton.setAttribute("data-opcion", letra);

            if (letra === correcta) {
                boton.classList.add("correcta");
            } else if (letra === seleccionada) {
                boton.classList.add("incorrecta");
            }

            opcionesHTML.appendChild(boton);
        });
    } else {
        // Habilitar botón omitir
        btnOmitir.disabled = false;
        btnOmitir.style.opacity = "1";

        // Bloquear siguiente hasta responder u omitir
        btnSiguiente.disabled = true;
        btnSiguiente.style.opacity = "0.5";

        Object.entries(pregunta.opciones).forEach(([letra, texto]) => {
            let boton = document.createElement("button");
            boton.innerHTML = `<span style="font-weight:bold; color:#00509e; margin-right:8px;">${letra.toUpperCase()})</span> ${texto}`;
            boton.classList.add("opcion");
            boton.setAttribute("data-opcion", letra);
            boton.onclick = () => verificarRespuesta(boton, letra);
            opcionesHTML.appendChild(boton);
        });
    }

    // Scroll automático al inicio del bloque de pregunta
    document.querySelector(".caja-pregunta").scrollTop = 0;
}

// ==========================================
// VALIDAR RESPUESTA DEL USUARIO
// ==========================================
function verificarRespuesta(botonSeleccionado, letraElegida) {
    if (!simulador) return;

    const pregunta = simulador.obtenerPreguntaActual();
    const correcta = pregunta.correcta;

    // Guardar respuesta en el motor
    simulador.responderPregunta(letraElegida);

    // Desactivar botones de opciones y deshabilitar botón Omitir
    const botones = opcionesHTML.querySelectorAll(".opcion");
    botones.forEach(btn => btn.disabled = true);

    btnOmitir.disabled = true;
    btnOmitir.style.opacity = "0.3";

    // Habilitar botón siguiente
    btnSiguiente.disabled = false;
    btnSiguiente.style.opacity = "1";

    // Resaltar visualmente aciertos/errores de forma robusta por atributo
    if (letraElegida === correcta) {
        botonSeleccionado.classList.add("correcta"); // Verde
    } else {
        botonSeleccionado.classList.add("incorrecta"); // Rojo
        
        // Resaltar la opción que era correcta sin buscar por texto
        const botonCorrecto = opcionesHTML.querySelector(`[data-opcion="${correcta}"]`);
        if (botonCorrecto) {
            botonCorrecto.classList.add("correcta");
        }
    }

    // Actualizar puntaje con formato decimal premium
    puntajeHTML.innerHTML = simulador.obtenerPuntaje().toFixed(2);
}

// ==========================================
// OMITIR PREGUNTA (DEJAR EN BLANCO)
// ==========================================
function omitirPregunta() {
    if (!simulador) return;

    // Omitir (se queda como undefined)
    simulador.omitirPregunta();

    // Avanzar a la siguiente
    siguientePregunta();
}

// ==========================================
// PASAR DE PREGUNTA
// ==========================================
function siguientePregunta() {
    if (!simulador) return;

    const hayMas = simulador.siguientePregunta();

    if (hayMas) {
        cargarPreguntaActual();
    } else {
        // Examen Finalizado: mostrar pantalla de resultados limpia
        finalizarExamen();
    }
}

// ==========================================
// RETROCEDER PREGUNTA
// ==========================================
function anteriorPregunta() {
    if (!simulador) return;

    const hayMenos = simulador.anteriorPregunta();
    if (hayMenos) {
        cargarPreguntaActual();
    }
}

// ==========================================
// MOSTRAR PANTALLA DE RESULTADOS
// ==========================================
function finalizarExamen() {
    if (!simulador) return;

    const resumen = simulador.obtenerResumenResultados();

    // Actualizar datos de resultados
    document.getElementById("resultadoPuntaje").innerHTML = resumen.puntaje.toFixed(2);
    document.getElementById("numCorrectas").innerHTML = resumen.correctas;
    document.getElementById("numIncorrectas").innerHTML = resumen.incorrectas;
    document.getElementById("numBlancas").innerHTML = resumen.omitidas;

    // Cambiar visibilidad de pantallas sin destruir nada
    pantallaJuego.style.display = "none";
    pantallaResultados.style.display = "flex";
}

// ==========================================
// REGRESAR AL MENÚ PRINCIPAL
// ==========================================
function regresarAlMenu() {
    // Resetear estado del simulador
    simulador = null;

    // Cambiar pantallas
    pantallaResultados.style.display = "none";
    pantallaJuego.style.display = "none";
    pantallaInicio.style.display = "flex";
}

// ==========================================
// SALIR DURANTE LA SIMULACIÓN
// ==========================================
function salirSimulacion() {
    if (confirm("¿Estás seguro de que deseas salir de la simulación? Perderás tu progreso actual.")) {
        regresarAlMenu();
    }
}