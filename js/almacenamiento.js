// almacenamiento.js
// Guarda y lee datos en localStorage: estadísticas, ranking y preferencias.
// Se carga en el <head> para poner el tema antes de que se vea la página.

const CLAVE_STATS = 'ahorcado_stats';
const CLAVE_CONFIG = 'ahorcado_config';

// Lee un objeto guardado en localStorage. Si no existe o falla, devuelve null.
// (localStorage puede fallar, por ejemplo en modo incógnito)
function leerGuardado(clave) {
  try {
    const texto = localStorage.getItem(clave);
    if (texto === null) return null;
    return JSON.parse(texto);
  } catch (error) {
    return null;
  }
}

function guardar(clave, objeto) {
  try {
    localStorage.setItem(clave, JSON.stringify(objeto));
  } catch (error) {
    console.log('No se pudo guardar en localStorage');
  }
}


// ---------------- Estadísticas ----------------

function leerEstadisticas() {
  const stats = {
    jugadas: 0,
    ganadas: 0,
    perdidas: 0,
    rachaActual: 0,
    mejorRacha: 0,
    ranking: [],
    historial: [],
    mejorRecorrido: null
  };

  // Si hay algo guardado, se copian esos valores encima de los de arriba
  const guardado = leerGuardado(CLAVE_STATS);
  if (guardado !== null) {
    for (const campo in guardado) {
      stats[campo] = guardado[campo];
    }
  }
  return stats;
}

// Actualiza las estadísticas con el resultado de una partida.
// resultado = { nombre, gano, puntaje, capital, nivel, region }
function guardarEstadisticas(resultado) {
  const stats = leerEstadisticas();
  const fecha = new Date().toISOString();

  stats.jugadas++;
  if (resultado.gano) {
    stats.ganadas++;
    stats.rachaActual++;
    if (stats.rachaActual > stats.mejorRacha) {
      stats.mejorRacha = stats.rachaActual;
    }
  } else {
    stats.perdidas++;
    stats.rachaActual = 0;
  }

  // Ranking: se agrega el puntaje, se ordena de mayor a menor y se dejan los 10 mejores
  stats.ranking.push({
    nombre: resultado.nombre,
    puntaje: resultado.puntaje,
    nivel: resultado.nivel,
    fecha: fecha
  });
  stats.ranking.sort(function (a, b) {
    return b.puntaje - a.puntaje;
  });
  stats.ranking = stats.ranking.slice(0, 10);

  // Historial: la partida más reciente va primero y se guardan las últimas 20
  stats.historial.unshift({
    nombre: resultado.nombre,
    capital: resultado.capital,
    nivel: resultado.nivel,
    region: resultado.region,
    gano: resultado.gano,
    puntaje: resultado.puntaje,
    fecha: fecha
  });
  stats.historial = stats.historial.slice(0, 20);

  guardar(CLAVE_STATS, stats);
  return stats;
}

// Guarda el recorrido del modo progresivo solo si es el mejor hasta ahora.
// Devuelve true si es un récord nuevo.
function guardarRecorrido(datos) {
  const stats = leerEstadisticas();

  if (stats.mejorRecorrido === null || datos.puntaje > stats.mejorRecorrido.puntaje) {
    stats.mejorRecorrido = {
      nombre: datos.nombre,
      acertadas: datos.acertadas,
      puntaje: datos.puntaje,
      nivel: datos.nivel,
      fecha: new Date().toISOString()
    };
    guardar(CLAVE_STATS, stats);
    return true;
  }
  return false;
}

function borrarEstadisticas() {
  try {
    localStorage.removeItem(CLAVE_STATS);
  } catch (error) {
    console.log('No se pudo borrar');
  }
}


// ---------------- Preferencias (tema, sonido, música y último menú) ----------------

function leerConfig() {
  const config = {
    tema: null,
    sonido: true,
    musica: true,
    nombre: '',
    region: 'todo',
    nivel: 'facil',
    modo: 'libre'
  };

  const guardado = leerGuardado(CLAVE_CONFIG);
  if (guardado !== null) {
    for (const campo in guardado) {
      config[campo] = guardado[campo];
    }
  }
  return config;
}

// Cambia solo los campos que se pasan, por ejemplo guardarConfig({ tema: 'oscuro' })
function guardarConfig(cambios) {
  const config = leerConfig();
  for (const campo in cambios) {
    config[campo] = cambios[campo];
  }
  guardar(CLAVE_CONFIG, config);
  return config;
}

// Pone el tema guardado. Si nunca se ha elegido, usa el del sistema operativo.
function aplicarTemaGuardado() {
  let tema = leerConfig().tema;
  if (tema === null) {
    const sistemaOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (sistemaOscuro) {
      tema = 'oscuro';
    } else {
      tema = 'claro';
    }
  }
  document.documentElement.dataset.tema = tema;
}

aplicarTemaGuardado();
