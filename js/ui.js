// ui.js
// Todo lo que se pinta en pantalla: menú, palabra, teclado, dibujo SVG,
// marcador, ventana de resultado, sonidos y la página de estadísticas.

const ALFABETO = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
let temporizadorAviso = null;


// ---------------- Pantallas ----------------

// Muestra el menú o el juego (las dos están en index.html)
function mostrarPantalla(nombre) {
  document.getElementById('pantalla-menu').hidden = (nombre !== 'menu');
  document.getElementById('pantalla-juego').hidden = (nombre !== 'juego');
  window.scrollTo(0, 0);
}


// ---------------- Menú ----------------

// Crea los botones de región con la cantidad de capitales de cada una
function renderOpcionesRegion(seleccionada) {
  const contenedor = document.getElementById('opciones-region');
  contenedor.innerHTML = '';

  for (const clave in REGIONES) {
    const total = capitalesDisponibles(clave).length;
    let marcado = '';
    if (clave === seleccionada) marcado = 'checked';

    contenedor.innerHTML +=
      '<label class="chip">' +
        '<input type="radio" name="region" value="' + clave + '" ' + marcado + '>' +
        '<span>' + REGIONES[clave] + ' <small>' + total + '</small></span>' +
      '</label>';
  }
}

// Crea las tarjetas de nivel. Si la región no tiene capitales de un nivel,
// ese nivel queda deshabilitado (por ejemplo, Insular solo tiene nivel medio).
function renderOpcionesNivel(region, preferido) {
  const contenedor = document.getElementById('opciones-nivel');
  contenedor.innerHTML = '';

  // Si el nivel preferido no tiene capitales en esta región, se marca el primero que sí tenga
  let elegido = preferido;
  if (capitalesDisponibles(region, preferido).length === 0) {
    for (const clave in NIVELES) {
      if (capitalesDisponibles(region, clave).length > 0) {
        elegido = clave;
        break;
      }
    }
  }

  for (const clave in NIVELES) {
    const nivel = NIVELES[clave];
    const cantidad = capitalesDisponibles(region, clave).length;

    let textoPistas = nivel.pistas + ' pistas';
    if (nivel.pistas === 1) textoPistas = '1 pista';
    if (nivel.pistas === 0) textoPistas = 'sin pistas';

    let textoTiempo = 'sin límite';
    if (nivel.tiempo !== null) textoTiempo = nivel.tiempo + ' s';

    let textoCantidad = cantidad + ' capitales';
    if (cantidad === 1) textoCantidad = '1 capital';
    if (cantidad === 0) textoCantidad = 'No hay capitales';

    let atributos = '';
    if (clave === elegido) atributos += ' checked';
    if (cantidad === 0) atributos += ' disabled';

    contenedor.innerHTML +=
      '<label class="nivel nivel-' + clave + '">' +
        '<input type="radio" name="nivel" value="' + clave + '"' + atributos + '>' +
        '<span class="nivel-cuerpo">' +
          '<span class="nivel-nombre">' + nivel.nombre + '<b>x' + nivel.multiplicador + '</b></span>' +
          '<span class="nivel-detalle">' + nivel.letras + '</span>' +
          '<span class="nivel-detalle">' + textoPistas + ' · ' + textoTiempo + '</span>' +
          '<span class="nivel-cantidad">' + textoCantidad + '</span>' +
        '</span>' +
      '</label>';
  }
}

// Muestra jugadas, ganadas y mejor racha en el menú
function renderResumenMenu(stats) {
  document.getElementById('resumen-jugadas').textContent = stats.jugadas;
  document.getElementById('resumen-ganadas').textContent = stats.ganadas;
  document.getElementById('resumen-racha').textContent = stats.mejorRacha;
}


// ---------------- Tablero ----------------

// Deja el tablero listo para una partida nueva
function prepararTablero(est) {
  document.getElementById('info-jugador').textContent = est.jugador;
  document.getElementById('info-region').textContent = REGIONES[est.region];

  const etiquetaNivel = document.getElementById('info-nivel');
  etiquetaNivel.textContent = NIVELES[est.nivel].nombre;
  etiquetaNivel.className = 'etiqueta-nivel nivel-' + est.nivel;

  document.getElementById('dato-texto').textContent = est.dato;

  // En el modo progresivo se muestra la ronda y el total acumulado
  const etiquetaRonda = document.getElementById('info-ronda');
  if (est.modo === 'progresivo') {
    etiquetaRonda.hidden = false;
    etiquetaRonda.textContent = 'Ronda ' + recorrido.ronda + ' · Total ' + recorrido.puntajeTotal;
  } else {
    etiquetaRonda.hidden = true;
  }

  document.getElementById('texto-pista').textContent = '';
  document.getElementById('aviso').textContent = '';

  dibujarAhorcado(0, false);
  renderPalabra(est, false, null);
  renderTeclado();
  actualizarTeclado(est);
  actualizarMarcador(est);
}

// Pinta la palabra: una casilla por letra y los espacios visibles desde el inicio.
// Si revelarTodo es true (cuando pierde) muestra en rojo las letras que faltaban.
// letraNueva es la letra que se acaba de acertar, para animarla.
function renderPalabra(est, revelarTodo, letraNueva) {
  const contenedor = document.getElementById('palabra');
  contenedor.innerHTML = '';

  const palabras = est.palabra.split(' ');  // ej: SANTA MARTA -> ['SANTA', 'MARTA']

  for (let p = 0; p < palabras.length; p++) {
    const grupo = document.createElement('span');
    grupo.className = 'palabra-grupo';

    for (let i = 0; i < palabras[p].length; i++) {
      const letra = palabras[p][i];          // con tilde, para mostrarla (Ó)
      const letraNormal = normalizar(letra); // sin tilde, para comparar (O)

      const casilla = document.createElement('span');
      casilla.className = 'casilla';

      if (est.letrasAcertadas.includes(letraNormal)) {
        casilla.textContent = letra;
        casilla.classList.add('revelada');
        if (letraNormal === letraNueva) {
          casilla.classList.add('nueva');
        }
      } else if (revelarTodo) {
        casilla.textContent = letra;
        casilla.classList.add('faltante');
      }

      grupo.appendChild(casilla);
    }
    contenedor.appendChild(grupo);
  }
}

// Crea los 27 botones del teclado (A-Z con Ñ). Solo se crean una vez.
function renderTeclado() {
  const teclado = document.getElementById('teclado');
  if (teclado.children.length > 0) return;

  for (let i = 0; i < ALFABETO.length; i++) {
    const letra = ALFABETO[i];
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'tecla';
    boton.textContent = letra;
    boton.dataset.letra = letra;
    boton.setAttribute('aria-label', 'Letra ' + letra);

    boton.addEventListener('click', function () {
      jugarLetra(letra);
    });

    teclado.appendChild(boton);
  }
}

// Pone en verde las letras acertadas, en rojo las falladas y las deshabilita
function actualizarTeclado(est) {
  const botones = document.querySelectorAll('.tecla');

  for (let i = 0; i < botones.length; i++) {
    const boton = botones[i];
    const letra = boton.dataset.letra;
    const acertada = est.letrasAcertadas.includes(letra);
    const fallada = est.letrasFalladas.includes(letra);

    boton.classList.remove('acierto', 'fallo');
    if (acertada) boton.classList.add('acierto');
    if (fallada) boton.classList.add('fallo');

    boton.disabled = acertada || fallada || est.terminado;
  }
}

// Muestra las partes del SVG según los errores (1 = cabeza, 2 = cuerpo, ...)
function dibujarAhorcado(errores, perdio) {
  const partes = document.querySelectorAll('#ahorcado .parte');

  for (let i = 0; i < partes.length; i++) {
    const numeroParte = Number(partes[i].dataset.parte);
    if (numeroParte <= errores) {
      partes[i].classList.add('visible');
    } else {
      partes[i].classList.remove('visible');
    }
  }

  // Si perdió, el muñeco se pone rojo y le aparece la cara
  const svg = document.getElementById('ahorcado');
  if (perdio) {
    svg.classList.add('derrota');
  } else {
    svg.classList.remove('derrota');
  }

  document.getElementById('errores-texto').textContent = errores;
}

// Convierte segundos a formato m:ss (por ejemplo 90 -> 1:30)
function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60);
  let resto = segundos % 60;
  if (resto < 10) resto = '0' + resto;
  return minutos + ':' + resto;
}

// Actualiza vidas, puntaje, tiempo, botón de pista y letras falladas
function actualizarMarcador(est) {
  // Vidas: un círculo por cada vida
  const vidasRestantes = est.maxErrores - est.errores;
  const vidas = document.getElementById('vidas');
  vidas.innerHTML = '';
  for (let i = 0; i < est.maxErrores; i++) {
    if (i < vidasRestantes) {
      vidas.innerHTML += '<span class="vida"></span>';
    } else {
      vidas.innerHTML += '<span class="vida perdida"></span>';
    }
  }
  vidas.setAttribute('aria-label', vidasRestantes + ' de 6 vidas');

  document.getElementById('puntaje').textContent = est.puntaje;

  // Cronómetro
  const tiempo = document.getElementById('tiempo');
  if (est.tiempoRestante === null) {
    tiempo.textContent = 'Sin límite';
    tiempo.className = 'apagado';
  } else {
    tiempo.textContent = formatearTiempo(est.tiempoRestante);
    if (est.tiempoRestante <= SEGUNDOS_TENSION) {
      tiempo.className = 'urgente';
    } else {
      tiempo.className = '';
    }
  }

  // Botón de pista
  const botonPista = document.getElementById('btn-pista');
  if (NIVELES[est.nivel].pistas === 0) {
    botonPista.textContent = 'Sin pistas en Difícil';
    botonPista.disabled = true;
  } else {
    botonPista.textContent = 'Pedir pista (' + est.pistasDisponibles + ') · −15';
    botonPista.disabled = est.pistasDisponibles === 0 || est.terminado;
  }

  // Letras falladas
  const falladas = document.getElementById('letras-falladas');
  if (est.letrasFalladas.length === 0) {
    falladas.textContent = 'ninguna';
  } else {
    falladas.textContent = est.letrasFalladas.join(' ');
  }
}

function mostrarPista(pista) {
  if (pista.tipo === 'departamento') {
    document.getElementById('texto-pista').innerHTML = 'Departamento: <strong>' + pista.valor + '</strong>';
    mostrarAviso('Pista: ya sabes el departamento.', 'info');
  } else {
    mostrarAviso('Pista: se reveló la letra ' + pista.valor + '.', 'info');
  }
}

// Mensaje corto debajo del tablero que se borra solo después de unos segundos
function mostrarAviso(texto, tipo) {
  const aviso = document.getElementById('aviso');
  aviso.textContent = texto;
  aviso.dataset.tipo = tipo;

  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(function () {
    aviso.textContent = '';
  }, 2600);
}

// Animación en la tecla presionada: rebote si acierta, sacudida si falla
function animarTecla(letra, tipo) {
  const boton = document.querySelector('.tecla[data-letra="' + letra + '"]');
  if (boton === null) return;

  let clase = 'rebote';
  if (tipo === 'fallo') clase = 'sacudida';

  boton.classList.add(clase);
  setTimeout(function () {
    boton.classList.remove(clase);
  }, 400);
}


// ---------------- Ventana de resultado ----------------

const MOTIVOS = {
  completa: 'Descubriste la capital completa.',
  errores: 'Se completó el dibujo con 6 errores.',
  tiempo: 'Se acabó el tiempo.'
};

function filaTabla(texto, valor) {
  return '<tr><th scope="row">' + texto + '</th><td>' + valor + '</td></tr>';
}

// Abre la ventana con el resultado. En el modo progresivo, "progreso"
// trae { subioA, completo, esRecord } para mostrar el mensaje extra.
function mostrarResultado(gano, est, progreso) {
  const r = est.resultado;
  const modal = document.getElementById('modal-resultado');
  const esProgresivo = est.modo === 'progresivo';

  if (gano) {
    modal.className = 'modal gano';
  } else {
    modal.className = 'modal perdio';
  }

  // Textos de arriba
  let etiqueta = 'Victoria';
  let titulo = '¡La adivinaste!';
  if (!gano) {
    etiqueta = 'Derrota';
    titulo = 'Esta vez no fue';
  }
  if (esProgresivo) {
    if (gano) {
      etiqueta = 'Ronda ' + recorrido.ronda + ' superada';
    } else {
      etiqueta = 'Fin del recorrido';
    }
    if (progreso.completo) {
      titulo = '¡Completaste todas las capitales!';
    }
  }
  document.getElementById('modal-etiqueta').textContent = etiqueta;
  document.getElementById('modal-titulo').textContent = titulo;
  document.getElementById('modal-palabra').textContent = est.palabra;
  document.getElementById('modal-dato').textContent =
    'Capital de ' + est.departamento + ' · Región ' + REGIONES[est.regionCapital] + '. ' + MOTIVOS[r.motivo];

  // Tabla con el cálculo del puntaje
  let filas = filaTabla('Puntos de la partida', r.puntosJuego);
  if (gano) {
    filas += filaTabla('Bono de victoria (50 + ' + r.vidas + ' × 10)', '+' + r.bono);
  }
  filas += filaTabla('Subtotal', r.subtotal);
  filas += filaTabla('Multiplicador ' + NIVELES[est.nivel].nombre, '× ' + r.multiplicador);

  if (esProgresivo) {
    filas += filaTabla('Puntaje de la ronda', r.puntajeFinal);
    filas += '<tr class="total"><th scope="row">Total del recorrido</th><td>' + recorrido.puntajeTotal + '</td></tr>';
  } else {
    filas += '<tr class="total"><th scope="row">Puntaje final</th><td>' + r.puntajeFinal + '</td></tr>';
  }
  document.getElementById('modal-desglose').innerHTML = filas;

  // Mensaje extra y botones (cambian en el modo progresivo)
  const extra = document.getElementById('modal-extra');
  const botonPrincipal = document.getElementById('btn-otra');
  const botonSecundario = document.getElementById('btn-menu');
  extra.hidden = true;
  botonPrincipal.textContent = 'Jugar otra vez';
  botonSecundario.textContent = 'Volver al menú';

  if (esProgresivo) {
    let mensaje = '';

    if (gano && progreso.subioA !== null) {
      const nuevoNivel = NIVELES[progreso.subioA];
      mensaje = '¡Subes a nivel ' + nuevoNivel.nombre + '! Ahora el puntaje se multiplica x' +
        nuevoNivel.multiplicador + ' y tienes ' + formatearTiempo(TIEMPO_PROGRESIVO[progreso.subioA]) + ' por capital.';
    }

    if (!gano || progreso.completo) {
      let palabraCapital = 'capitales';
      if (recorrido.acertadas === 1) palabraCapital = 'capital';
      mensaje = 'Acertaste ' + recorrido.acertadas + ' ' + palabraCapital +
        ' y sumaste ' + recorrido.puntajeTotal + ' puntos.';
      if (progreso.esRecord) {
        mensaje += ' ¡Es tu mejor recorrido!';
      }
    }

    if (mensaje !== '') {
      extra.textContent = mensaje;
      extra.hidden = false;
    }

    if (gano && !progreso.completo) {
      botonPrincipal.textContent = 'Siguiente capital →';
      botonSecundario.textContent = 'Terminar aquí';
    } else {
      botonPrincipal.textContent = 'Empezar de nuevo';
    }
  }

  modal.showModal();
  botonPrincipal.focus();
}

function cerrarResultado() {
  const modal = document.getElementById('modal-resultado');
  if (modal.open) {
    modal.close();
  }
}


// ---------------- Música y sonidos ----------------

let musica = null;
let tension = null;

// Música de fondo. Los navegadores no dejan que suene sola al abrir la página,
// por eso también se llama después del primer clic o tecla (ver app.js).
function iniciarMusica() {
  if (!leerConfig().musica) return;

  if (musica === null) {
    musica = new Audio('assets/sonidos/musica.mp3');
    musica.loop = true;
    musica.volume = 0.25;
  }
  if (musica.paused) {
    musica.play().catch(function () {
      // todavía no hubo un clic, no pasa nada
    });
  }
}

function detenerMusica() {
  if (musica !== null) {
    musica.pause();
  }
}

// Música de tensión para los últimos segundos: baja la música de fondo y pone el tic-tac
function iniciarTension() {
  if (!leerConfig().sonido) return;

  if (tension === null) {
    tension = new Audio('assets/sonidos/tension.mp3');
    tension.loop = true;
    tension.volume = 0.55;
  }
  if (tension.paused) {
    tension.currentTime = 0;
    tension.play().catch(function () {});
  }
  if (musica !== null) {
    musica.volume = 0.07;
  }
}

function detenerTension() {
  if (tension !== null) {
    tension.pause();
  }
  if (musica !== null) {
    musica.volume = 0.25;
  }
}

function tensionSonando() {
  return tension !== null && !tension.paused;
}

// Efectos cortos: acierto, error, victoria y derrota
function reproducirSonido(nombre) {
  if (!leerConfig().sonido) return;

  const sonido = new Audio('assets/sonidos/' + nombre + '.wav');
  sonido.volume = 0.5;
  sonido.play().catch(function () {});
}


// ---------------- Páginas de instrucciones y estadísticas ----------------

const NOMBRE_NIVEL = { facil: 'Fácil', medio: 'Medio', dificil: 'Difícil' };

// Fecha corta en español, por ejemplo "11 oct 2026"
function formatearFecha(textoFecha) {
  const fecha = new Date(textoFecha);
  return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Evita que un nombre con símbolos como < o > se interprete como HTML
function escaparHTML(texto) {
  return String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Convierte "SAN JOSÉ DEL GUAVIARE" en "San José Del Guaviare"
function nombreBonito(capital) {
  const palabras = capital.toLowerCase().split(' ');
  for (let i = 0; i < palabras.length; i++) {
    palabras[i] = palabras[i].charAt(0).toUpperCase() + palabras[i].slice(1);
  }
  return palabras.join(' ');
}

// Tabla de las 32 capitales en la página de instrucciones
function renderTablaCapitales() {
  const ordenadas = CAPITALES.slice();  // copia para no cambiar el orden original
  ordenadas.sort(function (a, b) {
    return a.capital.localeCompare(b.capital, 'es');
  });

  let html = '';
  for (let i = 0; i < ordenadas.length; i++) {
    const c = ordenadas[i];
    html += '<tr>' +
      '<td><strong>' + nombreBonito(c.capital) + '</strong></td>' +
      '<td>' + c.departamento + '</td>' +
      '<td>' + REGIONES[c.region] + '</td>' +
      '<td class="num opcional">' + contarLetras(c.capital) + '</td>' +
      '<td>' + NOMBRE_NIVEL[nivelDeCapital(c.capital)] + '</td>' +
    '</tr>';
  }
  document.getElementById('tabla-capitales').innerHTML = html;
}

function renderEstadisticas(stats) {
  let porcentaje = 0;
  if (stats.jugadas > 0) {
    porcentaje = Math.round(stats.ganadas / stats.jugadas * 100);
  }

  document.getElementById('stat-jugadas').textContent = stats.jugadas;
  document.getElementById('stat-ganadas').textContent = stats.ganadas;
  document.getElementById('stat-perdidas').textContent = stats.perdidas;
  document.getElementById('stat-porcentaje').textContent = porcentaje + '%';
  document.getElementById('stat-racha').textContent = stats.rachaActual;
  document.getElementById('stat-mejor-racha').textContent = stats.mejorRacha;

  // Mejor recorrido del modo progresivo
  const mejor = stats.mejorRecorrido;
  const textoRecorrido = document.getElementById('mejor-recorrido');
  if (mejor === null) {
    textoRecorrido.textContent = 'Todavía no has jugado el modo progresivo.';
  } else {
    textoRecorrido.innerHTML = '<strong>' + mejor.puntaje + ' puntos</strong> · ' +
      mejor.acertadas + ' capitales · llegó a ' + NOMBRE_NIVEL[mejor.nivel] + ' · ' +
      escaparHTML(mejor.nombre) + ', ' + formatearFecha(mejor.fecha);
  }

  // Ranking
  let filasRanking = '';
  for (let i = 0; i < stats.ranking.length; i++) {
    const r = stats.ranking[i];
    filasRanking += '<tr>' +
      '<td class="puesto">' + (i + 1) + '</td>' +
      '<td>' + escaparHTML(r.nombre) + '</td>' +
      '<td>' + NOMBRE_NIVEL[r.nivel] + '</td>' +
      '<td class="num">' + r.puntaje + '</td>' +
      '<td class="opcional">' + formatearFecha(r.fecha) + '</td>' +
    '</tr>';
  }
  if (filasRanking === '') {
    filasRanking = '<tr><td colspan="5" class="vacio">Todavía no hay partidas. ¡Juega la primera!</td></tr>';
  }
  document.getElementById('tabla-ranking').innerHTML = filasRanking;

  // Últimas partidas
  let filasHistorial = '';
  for (let i = 0; i < stats.historial.length; i++) {
    const h = stats.historial[i];
    let resultado = '<span class="resultado no">Perdió</span>';
    if (h.gano) resultado = '<span class="resultado si">Ganó</span>';

    filasHistorial += '<tr>' +
      '<td>' + h.capital + '</td>' +
      '<td>' + NOMBRE_NIVEL[h.nivel] + '</td>' +
      '<td>' + resultado + '</td>' +
      '<td class="num">' + h.puntaje + '</td>' +
      '<td class="opcional">' + escaparHTML(h.nombre) + '</td>' +
    '</tr>';
  }
  if (filasHistorial === '') {
    filasHistorial = '<tr><td colspan="5" class="vacio">Sin partidas registradas.</td></tr>';
  }
  document.getElementById('tabla-historial').innerHTML = filasHistorial;
}
