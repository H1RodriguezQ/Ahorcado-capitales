// juego.js
// Aquí está la lógica del juego: el estado de la partida, las letras,
// las pistas, el tiempo y el puntaje. Este archivo no toca el HTML.

// Configuración de cada nivel (tabla 6.1 del enunciado)
const NIVELES = {
  facil:   { nombre: 'Fácil',   letras: '4 a 6 letras',    pistas: 2, tiempo: null, multiplicador: 1 },
  medio:   { nombre: 'Medio',   letras: '7 a 9 letras',    pistas: 1, tiempo: null, multiplicador: 2 },
  dificil: { nombre: 'Difícil', letras: '10 o más letras', pistas: 0, tiempo: 90,   multiplicador: 3 }
};

// Puntos (tabla 6.2 del enunciado)
const PUNTOS_ACIERTO = 10;   // por cada vez que aparece la letra
const PUNTOS_FALLO = -5;
const PUNTOS_PISTA = -15;
const PUNTOS_VICTORIA = 50;
const PUNTOS_POR_VIDA = 10;

const MAX_ERRORES = 6;

// Modo progresivo
const ORDEN_NIVELES = ['facil', 'medio', 'dificil'];
const VICTORIAS_PARA_SUBIR = 3;
const TIEMPO_PROGRESIVO = { facil: 120, medio: 100, dificil: 90 };  // en segundos
const SEGUNDOS_TENSION = 15;  // desde aquí suena la música de tensión

let estado = null;     // partida actual
let recorrido = null;  // datos del modo progresivo (null en partida libre)


// Pasa el texto a mayúsculas y le quita las tildes.
// La Ñ no se cambia porque es una letra distinta de la N.
function normalizar(texto) {
  texto = texto.toUpperCase();
  texto = texto.replace(/Á/g, 'A');
  texto = texto.replace(/É/g, 'E');
  texto = texto.replace(/Í/g, 'I');
  texto = texto.replace(/Ó/g, 'O');
  texto = texto.replace(/Ú/g, 'U');
  texto = texto.replace(/Ü/g, 'U');
  return texto;
}

// Crea el estado de una partida nueva con una capital al azar
function iniciarPartida(region, nivel, jugador, excluir) {
  const elegida = obtenerCapital(region, nivel, excluir);
  if (elegida === null) {
    return null;
  }

  estado = {
    jugador: jugador,
    region: region,
    nivel: nivel,
    modo: 'libre',
    palabra: elegida.capital,
    palabraNormalizada: normalizar(elegida.capital),
    departamento: elegida.departamento,
    regionCapital: elegida.region,
    dato: elegida.dato,
    letrasAcertadas: [],
    letrasFalladas: [],
    errores: 0,
    maxErrores: MAX_ERRORES,
    pistasDisponibles: NIVELES[nivel].pistas,
    pistasUsadas: 0,
    departamentoRevelado: false,
    puntaje: 0,
    tiempoRestante: NIVELES[nivel].tiempo,
    terminado: false,
    resultado: null
  };
  return estado;
}

// Devuelve las letras de la palabra que todavía no se han adivinado (sin repetir)
function letrasPendientes() {
  const pendientes = [];
  const palabra = estado.palabraNormalizada;

  for (let i = 0; i < palabra.length; i++) {
    const letra = palabra[i];
    if (letra === ' ') continue;
    if (!estado.letrasAcertadas.includes(letra) && !pendientes.includes(letra)) {
      pendientes.push(letra);
    }
  }
  return pendientes;
}

// Cuenta cuántas veces está una letra en la palabra
function contarApariciones(letra) {
  let cantidad = 0;
  for (let i = 0; i < estado.palabraNormalizada.length; i++) {
    if (estado.palabraNormalizada[i] === letra) {
      cantidad++;
    }
  }
  return cantidad;
}

// Revisa la letra que eligió el jugador y actualiza aciertos, errores y puntaje.
// Devuelve un objeto con lo que pasó para que la pantalla muestre el aviso correcto.
function procesarLetra(letra) {
  if (estado === null || estado.terminado) {
    return { tipo: 'ignorada' };
  }

  letra = normalizar(letra);
  const letrasValidas = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
  if (letra.length !== 1 || !letrasValidas.includes(letra)) {
    return { tipo: 'invalida' };
  }

  if (estado.letrasAcertadas.includes(letra) || estado.letrasFalladas.includes(letra)) {
    return { tipo: 'repetida', letra: letra };
  }

  const apariciones = contarApariciones(letra);

  if (apariciones > 0) {
    estado.letrasAcertadas.push(letra);
    estado.puntaje = estado.puntaje + PUNTOS_ACIERTO * apariciones;
    return { tipo: 'acierto', letra: letra, apariciones: apariciones };
  } else {
    estado.letrasFalladas.push(letra);
    estado.errores++;
    estado.puntaje = estado.puntaje + PUNTOS_FALLO;
    return { tipo: 'fallo', letra: letra };
  }
}

// Pistas: la primera muestra el departamento y la segunda revela una letra.
// Cada pista cuesta 15 puntos.
function usarPista() {
  if (estado === null || estado.terminado || estado.pistasDisponibles <= 0) {
    return null;
  }

  let pista;
  if (!estado.departamentoRevelado) {
    estado.departamentoRevelado = true;
    pista = { tipo: 'departamento', valor: estado.departamento };
  } else {
    const pendientes = letrasPendientes();
    if (pendientes.length === 0) {
      return null;
    }
    const posicion = Math.floor(Math.random() * pendientes.length);
    const letra = pendientes[posicion];
    estado.letrasAcertadas.push(letra);
    pista = { tipo: 'letra', valor: letra };
  }

  estado.pistasDisponibles--;
  estado.pistasUsadas++;
  estado.puntaje = estado.puntaje + PUNTOS_PISTA;
  return pista;
}

// Le quita un segundo al cronómetro
function restarSegundo() {
  if (estado === null || estado.terminado || estado.tiempoRestante === null) {
    return;
  }
  if (estado.tiempoRestante > 0) {
    estado.tiempoRestante--;
  }
}

// Revisa si el jugador ganó, perdió o si la partida sigue
function verificarEstado() {
  if (estado === null) {
    return 'sin-partida';
  }
  if (estado.terminado) {
    if (estado.resultado.gano) return 'victoria';
    return 'derrota';
  }

  if (letrasPendientes().length === 0) {
    return terminarPartida(true, 'completa');
  }
  if (estado.errores >= estado.maxErrores) {
    return terminarPartida(false, 'errores');
  }
  if (estado.tiempoRestante !== null && estado.tiempoRestante <= 0) {
    return terminarPartida(false, 'tiempo');
  }
  return 'jugando';
}

// Termina la partida y calcula el puntaje final (subtotal x multiplicador)
function terminarPartida(gano, motivo) {
  const vidas = estado.maxErrores - estado.errores;

  let bono = 0;
  if (gano) {
    bono = PUNTOS_VICTORIA + vidas * PUNTOS_POR_VIDA;
  }

  const subtotal = estado.puntaje + bono;
  const multiplicador = NIVELES[estado.nivel].multiplicador;

  let puntajeFinal = subtotal * multiplicador;
  if (puntajeFinal < 0) {
    puntajeFinal = 0;  // el puntaje final no puede ser negativo
  }

  estado.terminado = true;
  estado.resultado = {
    gano: gano,
    motivo: motivo,
    vidas: vidas,
    puntosJuego: estado.puntaje,
    bono: bono,
    subtotal: subtotal,
    multiplicador: multiplicador,
    puntajeFinal: puntajeFinal
  };

  if (gano) return 'victoria';
  return 'derrota';
}


// ---------------- Modo progresivo ----------------

// Empieza un recorrido nuevo desde nivel fácil
function iniciarRecorrido(region, jugador) {
  recorrido = {
    region: region,
    jugador: jugador,
    nivel: 'facil',
    ronda: 0,
    victoriasEnNivel: 0,
    usadas: [],        // capitales que ya salieron, para no repetirlas
    acertadas: 0,
    puntajeTotal: 0,
    terminado: false
  };
  return recorrido;
}

// Cuántas capitales de un nivel quedan sin jugar
function capitalesRestantes(nivel) {
  const lista = capitalesDisponibles(recorrido.region, nivel);
  let cantidad = 0;
  for (let i = 0; i < lista.length; i++) {
    if (!recorrido.usadas.includes(lista[i].capital)) {
      cantidad++;
    }
  }
  return cantidad;
}

// Busca un nivel que todavía tenga capitales. Primero mira desde el nivel
// actual hacia arriba; si ya no quedan, usa las que sobraron de los niveles anteriores.
function nivelConCapitales(desde) {
  const inicio = ORDEN_NIVELES.indexOf(desde);

  for (let i = inicio; i < ORDEN_NIVELES.length; i++) {
    if (capitalesRestantes(ORDEN_NIVELES[i]) > 0) {
      return ORDEN_NIVELES[i];
    }
  }
  for (let i = inicio - 1; i >= 0; i--) {
    if (capitalesRestantes(ORDEN_NIVELES[i]) > 0) {
      return ORDEN_NIVELES[i];
    }
  }
  return null;  // ya no quedan capitales
}

// Arranca la siguiente ronda sin repetir capitales.
// Devuelve null cuando ya se jugaron todas.
function siguienteRonda() {
  const nivel = nivelConCapitales(recorrido.nivel);
  if (nivel === null) {
    return null;
  }

  if (nivel !== recorrido.nivel) {
    recorrido.victoriasEnNivel = 0;
  }
  recorrido.nivel = nivel;
  recorrido.ronda++;

  const nuevaPartida = iniciarPartida(recorrido.region, nivel, recorrido.jugador, recorrido.usadas);
  nuevaPartida.modo = 'progresivo';
  nuevaPartida.tiempoRestante = TIEMPO_PROGRESIVO[nivel];  // en este modo todos los niveles tienen tiempo
  recorrido.usadas.push(nuevaPartida.palabra);
  return nuevaPartida;
}

// Suma el resultado de la ronda al recorrido y revisa si sube de nivel.
// Devuelve { subioA, completo } para mostrarlo en la ventana de resultado.
function registrarRonda() {
  recorrido.puntajeTotal = recorrido.puntajeTotal + estado.resultado.puntajeFinal;

  if (!estado.resultado.gano) {
    recorrido.terminado = true;
    return { subioA: null, completo: false };
  }

  recorrido.acertadas++;
  recorrido.victoriasEnNivel++;

  const nivelAnterior = ORDEN_NIVELES.indexOf(recorrido.nivel);

  // Cada 3 capitales acertadas sube un nivel (hasta difícil)
  if (recorrido.victoriasEnNivel >= VICTORIAS_PARA_SUBIR && nivelAnterior < 2) {
    recorrido.nivel = ORDEN_NIVELES[nivelAnterior + 1];
    recorrido.victoriasEnNivel = 0;
  }

  // También puede subir si al nivel actual ya no le quedan capitales
  const proximo = nivelConCapitales(recorrido.nivel);
  if (proximo === null) {
    recorrido.terminado = true;
    return { subioA: null, completo: true };
  }

  let subioA = null;
  if (ORDEN_NIVELES.indexOf(proximo) > nivelAnterior) {
    subioA = proximo;
  }
  return { subioA: subioA, completo: false };
}
