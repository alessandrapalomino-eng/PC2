const form = document.getElementById('patientForm');
const selectGrado = document.getElementById('grado_academico_id');
const selectEnfermedad = document.getElementById('enfermedad_preexistente_id');
const checkboxSeguro = document.getElementById('cuenta_seguro');
const inputTipoSeguro = document.getElementById('tipo_seguro');
const statusMessage = document.getElementById('statusMessage');

checkboxSeguro.addEventListener('change', () => {
    inputTipoSeguro.disabled = !checkboxSeguro.checked;
    if (!checkboxSeguro.checked) inputTipoSeguro.value = "";
});

async function cargarCatalogos() {
    try {
        const { data: grados, error: errGrados } = await supabaseClient.from('grados_academicos').select('id, nombre').eq('activo', true);
        if (errGrados) throw errGrados;
        selectGrado.innerHTML = '<option value="">Seleccione Grado Académico...</option>';
        grados.forEach(g => { selectGrado.innerHTML += `<option value="${g.id}">${g.nombre}</option>`; });

        const { data: enfermedades, error: errEnfermedades } = await supabaseClient.from('enfermedades_preexistentes').select('id, nombre').eq('activo', true);
        if (errEnfermedades) throw errEnfermedades;
        selectEnfermedad.innerHTML = '<option value="">Seleccione Enfermedad...</option>';
        enfermedades.forEach(e => { selectEnfermedad.innerHTML += `<option value="${e.id}">${e.nombre}</option>`; });
    } catch (error) {
        mostrarMensaje("Error al conectar con la base de datos de catálogos.", "error");
    }
}

function mostrarMensaje(texto, tipo) {
    statusMessage.textContent = texto;
    statusMessage.className = `message ${tipo}`;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusMessage.className = "message hidden";

    const nombres = document.getElementById('nombres').value.trim();
    const apellidos = document.getElementById('apellidos').value.trim();
    const dni = document.getElementById('dni').value.trim();
    const fecha_nacimiento = document.getElementById('fecha_nacimiento').value;
    const edad = document.getElementById('edad').value;
    const sexo = document.getElementById('sexo').value;
    const celular = document.getElementById('celular').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const distrito = document.getElementById('distrito').value.trim();
    const estado_civil = document.getElementById('estado_civil').value;
    const grado_academico_id = selectGrado.value;
    const enfermedad_preexistente_id = selectEnfermedad.value;
    const cuenta_seguro = checkboxSeguro.checked;
    const tipo_seguro = inputTipoSeguro.value.trim();
    const observaciones = document.getElementById('observaciones').value.trim();

    // Validaciones
    if (!nombres || !apellidos || !dni || !fecha_nacimiento || !edad || !sexo || !celular || !correo || !direccion || !distrito || !estado_civil) {
        mostrarMensaje("No se puede enviar el formulario vacío o con campos obligatorios incompletos.", "error"); return;
    }
    if (dni.length !== 8 || isNaN(dni)) { mostrarMensaje("El DNI debe tener exactamente 8 dígitos numéricos.", "error"); return; }
    if (celular.length < 9) { mostrarMensaje("El celular debe tener como mínimo 9 dígitos.", "error"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) { mostrarMensaje("El correo electrónico no tiene un formato válido.", "error"); return; }
    if (!grado_academico_id) { mostrarMensaje("Debe seleccionar un grado académico válido.", "error"); return; }
    if (!enfermedad_preexistente_id) { mostrarMensaje("Debe seleccionar una opción de enfermedad preexistente.", "error"); return; }

    try {
        const { error } = await supabaseClient.from('pacientes').insert([{
            nombres, apellidos, dni, fecha_nacimiento, edad: parseInt(edad), sexo, celular, correo, direccion, distrito, estado_civil,
            grado_academico_id: parseInt(grado_academico_id), enfermedad_preexistente_id: parseInt(enfermedad_preexistente_id),
            cuenta_seguro, tipo_seguro: cuenta_seguro ? tipo_seguro : null, observaciones
        }]);

        if (error) {
            if (error.code === "23505") { mostrarMensaje("Usuario ya registrado", "error"); } 
            else { throw error; }
        } else {
            mostrarMensaje("Paciente registrado correctamente", "success");
            form.reset();
            inputTipoSeguro.disabled = true;
        }
    } catch (err) {
        mostrarMensaje("No se pudo registrar el paciente. Verifique los datos ingresados.", "error");
    }
});

cargarCatalogos();