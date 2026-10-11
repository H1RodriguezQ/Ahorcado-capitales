// app.js
// Punto de entrada del juego: conecta los botones y el teclado con la lógica.
// Se usa en las tres páginas; cada una se reconoce por <body data-pagina="...">.

let intervaloReloj = null;
let ultimaCapital = null;       // para no repetir la misma capital seguida
let partidaGuardada = false;    // evita guardar dos veces la misma partida

document.addEventListener('DOMContentLoaded', function () {
  configurarBotonesBarra();

  const pagina = document.body.dataset.pagina;
  if (pagina === 'juego') {
    iniciarApp();
  } else if (pagina === 'estadisticas') {
    iniciarPaginaEstadisticas();
  } else if (pagina === 'instrucciones') {
    renderTablaCapitales();
  }
});


// ---------------- Botones de la barra (tema, música y sonido) ----------------

function configurarBotonesBarra() {
  const botonTema = document.getElementById('btn-tema');
  botonTema.addEventListener('click', function () {
    let nuevoTema = 'oscuro';
    if (document.documentElement.dataset.tema === 'oscuro') {
      nuevoTema = 'claro';
    }
    guardarConfig({ tema: nuevoTema });
    aplicarTemaGuardado();
  });

  // Los botones de música y sonido solo están en index.html
  const botonMusica = document.getElementById('btn-musica');
  if (botonMusica !== null) {
    botonMusica.setAttribute('aria-pressed', leerConfig().musica);
    botonMusica.addEventListener('click', function () {
      const activa = !leerConfig().musica;
      guardarConfig({ musica: activa });
      botonMusica.setAttribute('aria-pressed', activa);
      if (activa) {
        iniciarMusica();
      } else {
        detenerMusica();
      }
    });
  }

  const botonSonido = document.getElementById('btn-sonido');
  if (botonSonido !== null) {
    botonSonido.setAttribute('aria-pressed', leerConfig().sonido);
    botonSonido.addEventListener('click', function () {
      const activo = !leerConfig().sonido;
      guardarConfig({ sonido: activo });
      botonSonido.setAttribute('aria-pressed', activo);
      if (!activo) {
        detenerTension();
      }
    });
  }
}


// ---------------- Menú principal ----------------

function iniciarApp() {
  const config = leerConfig();
  const inputNombre = document.getElementById('nombre');

  // Se carga lo último que eligió el jugador
  inputNombre.value = config.nombre;
  if (config.modo === 'progresivo') {
    document.getElementById('modo-progresivo').checked = true;
  }
  renderOpcionesRegion(config.region);
  renderOpcionesNivel(regionElegida(), config.nivel);
  actualizarCampoNivel();
  renderResumenMenu(leerEstadisticas());
  mostrarPantalla('menu');

  // La música arranca con el primer clic o tecla
  iniciarMusica();
  document.addEventListener('click', iniciarMusica, { once: true });
  document.addEventListener('keydown', iniciarMusica, { once: true });

  // En el modo progresivo no se elige nivel, siempre empieza en Fácil
  document.getElementById('modo-libre').addEventListener('change', actualizarCampoNivel);
  document.getElementById('modo-progresivo').addEventListener('change', actualizarCampoNivel);

  // Al cambiar de región se vuelven a calcular los niveles disponibles
  document.getElementById('opciones-region').addEventListener('change', function () {
    renderOpcionesNivel(regionElegida(), nivelElegido());
  });

  inputNombre.addEventListener('input', function () {
    document.getElementById('error-nombre').hidden = true;
  });

  document.getElementById('form-menu').addEventListener('submit', function (evento) {
    evento.preventDefault();  // para que el formulario no recargue la página

    const nombre = inputNombre.value.trim();
    if (nombre === '') {
      document.getElementById('error-nombre').hidden = false;
      inputNombre.focus();
      return;
    }

    const modo = modoElegido();
    guardarConfig({ nombre: nombre, region: regionElegida(), nivel: nivelElegido(), modo: modo });

    if (modo === 'progresivo') {
      comenzarRecorrido();
    } else {
      comenzarPartida();
    }
  });

  // Teclado físico
  document.addEventListener('keydown', alPresionarTecla);

  document.getElementById('btn-pista').addEventListener('click', pedirPista);
  document.getElementById('btn-abandonar').addEventListener('click', abandonarPartida);
  document.getElementById('btn-otra').addEventListener('click', botonPrincipalResultado);
  document.getElementById('btn-menu').addEventListener('click', botonSecundarioResultado);

  // Si cierran la ventana de resultado con Escape, es como darle al botón secundario
  document.getElementById('modal-resultado').addEventListener('cancel', function (evento) {
    evento.preventDefault();
    botonSecundarioResultado();
  });
}

function regionElegida() {
  return document.querySelector('input[name="region"]:checked').value;
}

function nivelElegido() {
  return document.querySelector('input[name="nivel"]:checked').value;
}

function modoElegido() {
  return document.querySelector('input[name="modo"]:checked').value;
}

// Oculta la parte de "Nivel" cuando se elige el modo progresivo
function actualizarCampoNivel() {
  document.getElementById('campo-nivel').hidden = (modoElegido() === 'progresivo');
}


// ---------------- Partida libre ----------------

function comenzarPartida() {
  const config = leerConfig();
  detenerReloj();

  const partida = iniciarPartida(config.region, config.nivel, config.nombre, ultimaCapital);
  if (partida === null) return;

  ultimaCapital = partida.palabra;
  partidaGuardada = false;
  prepararTablero(partida);
  mostrarPantalla('juego');

  if (partida.tiempoRestante !== null) {
    iniciarReloj();
  }
}


// ---------------- Modo progresivo ----------------

function comenzarRecorrido() {
  const config = leerConfig();
  iniciarRecorrido(config.region, config.nombre);
  siguienteCapital();
}

function siguienteCapital() {
  detenerReloj();

  const partida = siguienteRonda();
  if (partida === null) {
    volverAlMenu();
    return;
  }

  partidaGuardada = false;
  prepararTablero(partida);
  mostrarPantalla('juego');
  iniciarReloj();
}

// Cierra el recorrido y lo guarda si acertó por lo menos una capital.
// Devuelve true si fue récord.
function finalizarRecorrido() {
  recorrido.terminado = true;
  if (recorrido.acertadas === 0) {
    return false;
  }
  return guardarRecorrido({
    nombre: recorrido.jugador,
    acertadas: recorrido.acertadas,
    puntaje: recorrido.puntajeTotal,
    nivel: recorrido.nivel
  });
}


// ---------------- Jugadas ----------------

// Teclado físico: solo funciona en la pantalla de juego y con la ventana cerrada
function alPresionarTecla(evento) {
  const enJuego = !document.getElementById('pantalla-juego').hidden;
  const ventanaAbierta = document.getElementById('modal-resultado').open;
  if (!enJuego || ventanaAbierta) return;
  if (evento.ctrlKey || evento.altKey || evento.metaKey) return;
  if (evento.key.length !== 1) return;  // ignora teclas como Enter o Shift

  const letra = normalizar(evento.key);
  if (ALFABETO.includes(letra)) {
    evento.preventDefault();
    jugarLetra(letra);
  }
}

// Un turno: procesa la letra, actualiza la pantalla y revisa si terminó
function jugarLetra(letra) {
  const jugada = procesarLetra(letra);

  if (jugada.tipo === 'repetida') {
    mostrarAviso('Ya usaste la ' + jugada.letra + '.', 'info');
    return;
  }
  if (jugada.tipo !== 'acierto' && jugada.tipo !== 'fallo') {
    return;
  }

  animarTecla(jugada.letra, jugada.tipo);

  if (jugada.tipo === 'acierto') {
    let veces = '';
    if (jugada.apariciones > 1) veces = ' (' + jugada.apariciones + ' veces)';
    mostrarAviso('¡Bien! La ' + jugada.letra + ' está' + veces + '. +' + (jugada.apariciones * PUNTOS_ACIERTO), 'acierto');
    reproducirSonido('acierto');
  } else {
    mostrarAviso('La ' + jugada.letra + ' no está. −5', 'fallo');
    reproducirSonido('error');
  }

  actualizarPantalla(jugada.letra);
  comprobarFin();
}

function pedirPista() {
  const pista = usarPista();
  if (pista === null) return;

  mostrarPista(pista);
  if (pista.tipo === 'letra') {
    actualizarPantalla(pista.valor);
  } else {
    actualizarPantalla(null);
  }
  comprobarFin();
}

function actualizarPantalla(letraNueva) {
  renderPalabra(estado, false, letraNueva);
  actualizarTeclado(estado);
  dibujarAhorcado(estado.errores, false);
  actualizarMarcador(estado);
}

// Si la partida terminó: guarda estadísticas y abre la ventana de resultado
function comprobarFin() {
  const situacion = verificarEstado();
  if (situacion === 'jugando' || partidaGuardada) return;

  partidaGuardada = true;
  detenerReloj();
  const gano = (situacion === 'victoria');

  // Si perdió, se muestran las letras que faltaban
  renderPalabra(estado, !gano, null);
  actualizarTeclado(estado);
  dibujarAhorcado(estado.errores, !gano);
  actualizarMarcador(estado);

  guardarEstadisticas({
    nombre: estado.jugador,
    gano: gano,
    puntaje: estado.resultado.puntajeFinal,
    capital: estado.palabra,
    nivel: estado.nivel,
    region: estado.regionCapital
  });

  // En el modo progresivo se suma la ronda y se revisa si sube de nivel
  let progreso = null;
  if (estado.modo === 'progresivo') {
    progreso = registrarRonda();
    progreso.esRecord = false;
    if (recorrido.terminado) {
      progreso.esRecord = finalizarRecorrido();
    }
  }

  if (gano) {
    reproducirSonido('victoria');
  } else {
    reproducirSonido('derrota');
  }

  // Pequeña espera para que se alcance a ver la última letra o parte del dibujo
  setTimeout(function () {
    mostrarResultado(gano, estado, progreso);
  }, 700);
}


// ---------------- Botones de la ventana de resultado ----------------

// "Jugar otra vez", "Siguiente capital" o "Empezar de nuevo"
function botonPrincipalResultado() {
  cerrarResultado();

  if (estado.modo === 'progresivo') {
    if (recorrido.terminado) {
      comenzarRecorrido();
    } else {
      siguienteCapital();
    }
  } else {
    comenzarPartida();
  }
}

// "Volver al menú" o "Terminar aquí"
function botonSecundarioResultado() {
  if (estado.modo === 'progresivo' && !recorrido.terminado) {
    finalizarRecorrido();
  }
  volverAlMenu();
}


// ---------------- Cronómetro ----------------

function iniciarReloj() {
  intervaloReloj = setInterval(function () {
    restarSegundo();
    actualizarMarcador(estado);

    if (estado.tiempoRestante > 0 && estado.tiempoRestante <= SEGUNDOS_TENSION) {
      iniciarTension();
    }
    if (estado.tiempoRestante <= 0) {
      comprobarFin();
    }
  }, 1000);
}

function detenerReloj() {
  clearInterval(intervaloReloj);
  intervaloReloj = null;
  detenerTension();
}


// ---------------- Salir de la partida ----------------

function abandonarPartida() {
  // En el modo progresivo se guarda lo que lleve
  if (estado !== null && estado.modo === 'progresivo' && !recorrido.terminado) {
    if (recorrido.acertadas > 0) {
      const seguro = confirm('¿Terminar el recorrido? Se guardan las ' + recorrido.acertadas + ' capitales que llevas.');
      if (!seguro) return;
    }
    finalizarRecorrido();
    volverAlMenu();
    return;
  }

  // En la partida libre solo se pregunta si ya había jugado alguna letra
  if (estado !== null && !estado.terminado) {
    const jugadas = estado.letrasAcertadas.length + estado.letrasFalladas.length + estado.pistasUsadas;
    if (jugadas > 0) {
      const seguro = confirm('¿Salir de la partida? No se guardará en las estadísticas.');
      if (!seguro) return;
    }
  }
  volverAlMenu();
}

function volverAlMenu() {
  detenerReloj();
  cerrarResultado();
  renderResumenMenu(leerEstadisticas());
  mostrarPantalla('menu');
}


// ---------------- Página de estadísticas ----------------

function iniciarPaginaEstadisticas() {
  renderEstadisticas(leerEstadisticas());

  document.getElementById('btn-borrar').addEventListener('click', function () {
    const seguro = confirm('¿Borrar todas las estadísticas y el ranking? No se puede deshacer.');
    if (seguro) {
      borrarEstadisticas();
      renderEstadisticas(leerEstadisticas());
    }
  });
}
