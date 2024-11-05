const { fetchData: fetchData1 } = require('./apiService'); // Asegúrate de que la ruta sea correcta
const { fetchData: fetchData2 } = require('./apiService1'); // Asegúrate de que la ruta sea correcta
const fs = require('fs');
const cron = require('node-cron');

// Función para obtener las identificaciones de los profesores
const fetchProfessorIds = async () => {
  try {
    const requestBody = { "parametros": {} };
    const data = await fetchData1(requestBody);

    // Filtrar los datos para eliminar la facultad "VICERRECTORIA ACADEMICA"
    const datosFiltrados = data.filter(item => item.FACULTAD !== "VICERRECTORIA ACADEMICA");

    // Extraer las identificaciones únicas de los profesores
    const ids = Array.from(new Set(datosFiltrados.map(item => item.DOC_DOCENTE)));

    // Guardar las identificaciones en un archivo JSON
    fs.writeFileSync('../../../client/src/Data/profesorIdentificaciones.json', JSON.stringify(ids, null, 2), 'utf8');
    console.log('Identificaciones guardadas en profesorIdentificaciones.json');

  } catch (error) {
    console.error('Error al obtener identificaciones:', error.message);
  }
};

// Función para obtener los datos de la API y estructurarlos
const processFetchedData1 = async () => {
  try {
    const requestBody = { "parametros": {} };
    const data = await fetchData1(requestBody);

    // Filtrar los datos para eliminar la facultad "VICERRECTORIA ACADEMICA"
    const datosFiltrados = data.filter(item => item.FACULTAD !== "VICERRECTORIA ACADEMICA");

    const datosEstructurados = datosFiltrados.reduce((acc, item) => {
      if (!acc[item.FACULTAD]) {
        acc[item.FACULTAD] = {};
      }

      if (!acc[item.FACULTAD][item.CARRERA]) {
        acc[item.FACULTAD][item.CARRERA] = {};
      }

      if (!acc[item.FACULTAD][item.CARRERA][item.ASIGNATURA]) {
        acc[item.FACULTAD][item.CARRERA][item.ASIGNATURA] = [];
      }

      const grupoExistente = acc[item.FACULTAD][item.CARRERA][item.ASIGNATURA].find(grupo => grupo.grupo === item.GRUPO);

      if (grupoExistente) {
        // Verificar si el profesor ya está listado en el grupo por documento
        const profesorExistente = grupoExistente.profesor.find(prof => prof.documento === item.DOC_DOCENTE);

        if (!profesorExistente) {
          // Añadir un nuevo profesor si no está ya en la lista
          grupoExistente.profesor.push({
            documento: item.DOC_DOCENTE,
            nombre: item.DOCENTE
          });
        }
      } else {
        // Si el grupo no existe, añadir un nuevo grupo con el profesor
        acc[item.FACULTAD][item.CARRERA][item.ASIGNATURA].push({
          codigoAsig: item.CODIGO_SIGNATURA,
          grupo: item.GRUPO,
          profesor: [{
            documento: item.DOC_DOCENTE,
            nombre: item.DOCENTE
          }],
          clases: [{
            sede: item.SEDE,
            edificio: item.EDIFICIO,
            salon: item.SALON
          }],
          inscritos: item.INSCRITOS
        });
      }

      return acc;
    }, {});

    // Guardar los datos en un archivo JSON
    fs.writeFileSync('../../../client/src/Data/datosEstructurados.json', JSON.stringify(datosEstructurados, null, 2), 'utf8');
    console.log('Datos guardados en datosEstructurados.json');

  } catch (error) {
    console.error('Error al procesar los datos:', error.message);
  }
};



// Función para ejecutar las tareas de procesamiento en el orden correcto
const runDataProcessingTasks1 = async () => {
  try {
    await processFetchedData1(); // Ejecutar el procesamiento de datos
    await fetchProfessorIds(); // Luego obtener las identificaciones
    console.log('Todas las tareas de procesamiento han sido completadas.');
  } catch (error) {
    console.error('Error al ejecutar las tareas de procesamiento:', error.message);
  }
};

// Segundo grupo de tareas (dependiente del primero)

const processFetchedData2 = async (documento) => {
  try {
    documento = String(documento);
    const requestBody = { "parametros": { identificacion: documento } };
    const data = await fetchData2(requestBody);

    // No filtrar los datos por código de vinculación, incluir todos
    const organizedData = organizeDataByDocenteEspacioAndGrupo(data);

    return organizedData;
  } catch (error) {
    console.error(`Error al procesar los datos de ${documento}:`, error.message);
    return null;
  }
};

// Función para organizar los datos por docente y grupo
// Función para organizar los datos por docente, espacio (nombre de asignatura) y grupo
const organizeDataByDocenteEspacioAndGrupo = (data) => {
  const organizedData = {};

  data.forEach(item => {
    const docenteKey = `${item.DOC_DOCENTE} - ${item.DOCENTE}`;
    const espacioKey = item.ESPACIO; // Clave de asignatura (nombre del espacio)
    const groupKey = item.GRUPO; // Clave del grupo

    // Si no existe el docente, inicializar el objeto
    if (!organizedData[docenteKey]) {
      organizedData[docenteKey] = {};
    }

    // Si no existe la asignatura bajo el docente, inicializar el objeto
    if (!organizedData[docenteKey][espacioKey]) {
      organizedData[docenteKey][espacioKey] = {};
    }

    // Si no existe el grupo bajo la asignatura, inicializar el objeto
    if (!organizedData[docenteKey][espacioKey][groupKey]) {
      organizedData[docenteKey][espacioKey][groupKey] = {
        ANIO: item.ANIO,
        PERIODO: item.PERIODO,
        COD_PROYECTO: item.COD_PROYECTO,
        PROYECTO: item.PROYECTO,
        COD_VINCULACION: item.COD_VINCULACION,
        TIPO_VINCULACION: item.TIPO_VINCULACION,
        COD_ESPACIO: item.COD_ESPACIO,
        ESPACIO: item.ESPACIO,
        ID_GRUPO: item.ID_GRUPO,
        HORARIO: [],
        ESTUDIANTES: []
      };
    }

    // Agregar hora al horario
    const dia = item.DIA;
    const hora = item.HORA;
    const existingDia = organizedData[docenteKey][espacioKey][groupKey].HORARIO.find(h => h.DIA === dia);
    if (existingDia) {
      const horaBloque = existingDia.HORA_BLOQUE.split('-');
      const start = parseInt(horaBloque[0], 10);
      const end = parseInt(horaBloque[1], 10);
      if (hora === end) {
        existingDia.HORA_BLOQUE = `${start}-${hora + 1}`;
      } else if (hora > end) {
        organizedData[docenteKey][espacioKey][groupKey].HORARIO.push({
          DIA: dia,
          HORA_BLOQUE: `${hora}-${hora + 1}`
        });
      }
    } else {
      organizedData[docenteKey][espacioKey][groupKey].HORARIO.push({
        DIA: dia,
        HORA_BLOQUE: `${hora}-${hora + 1}`
      });
    }

    // Añadir estudiante si no existe
    const existingEstudiante = organizedData[docenteKey][espacioKey][groupKey].ESTUDIANTES.find(e => e.COD_ESTUDIANTE === item.COD_ESTUDIANTE);
    if (!existingEstudiante) {
      organizedData[docenteKey][espacioKey][groupKey].ESTUDIANTES.push({
        COD_ESTUDIANTE: item.COD_ESTUDIANTE,
        ESTUDIANTE: item.ESTUDIANTE
      });
    }
  });

  return organizedData;
};

const isLastDayOfMonth = (date) => {
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  return nextDay.getDate() === 1;
};

// Función para procesar cada documento con retraso y mostrar progreso
const processDocumentosWithDelay = async (documentos, delay) => {
  const allData = {};
  let processedCount = 0;

  for (let i = 0; i < documentos.length; i++) {
    await new Promise(resolve => setTimeout(resolve, delay)); // Espera antes de procesar el siguiente documento
    const organizedData = await processFetchedData2(documentos[i]);
    if (organizedData) {
      Object.assign(allData, organizedData);
    }
    processedCount++;
    console.log(`Progreso: ${processedCount}/${documentos.length} documentos procesados.`);
  }

  // Guardar todos los datos organizados en un archivo JSON
  const filename = '../../../client/src/Data/allOrganizedData.json';
  fs.writeFileSync(filename, JSON.stringify(allData, null, 2));
  console.log(`Todos los datos organizados han sido guardados en ${filename}`);
};

// Función para cargar o actualizar el archivo JSON
const loadOrUpdateDataIfNecessary = async () => {
  const filename = '../../../client/src/Data/allOrganizedData.json';
  const today = new Date();

  if (!fs.existsSync(filename) || today.getDate() === 15 || isLastDayOfMonth(today)) {
    console.log('Iniciando carga o actualización de datos.');
    const documentos = JSON.parse(fs.readFileSync('../../../client/src/Data/profesorIdentificaciones.json', 'utf8'));
    await processDocumentosWithDelay(documentos, 10);
  } else {
    console.log('Archivo ya existe y hoy no es un día de actualización programada.');
  }
};

// Función para ejecutar ambas tareas secuencialmente
const runCompleteDataProcessing = async () => {
  try {
    await runDataProcessingTasks1(); // Ejecutar el primer conjunto de tareas
    console.log('Primer conjunto de tareas completado.');
    
    await loadOrUpdateDataIfNecessary(); // Luego, ejecutar el segundo conjunto de tareas
    console.log('Segundo conjunto de tareas completado.');
  } catch (error) {
    console.error('Error en el procesamiento de datos completo:', error.message);
  }
};

// Ejecutar la carga o actualización inicial
runCompleteDataProcessing();

// Programar actualizaciones automáticas cada 15 días
cron.schedule('0 0 */15 * *', async () => {
  console.log('Iniciando la actualización de datos programada.');
  await loadOrUpdateDataIfNecessary();
});
cron.schedule('0 0 28-31 * *', async () => {
  const today = new Date();
  if (isLastDayOfMonth(today)) {
    console.log('Iniciando actualización programada para el último día del mes.');
    await loadOrUpdateDataIfNecessary();
  }
});