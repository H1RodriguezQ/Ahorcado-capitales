# Especificación · El Ahorcado

Este documento resume qué debe hacer el juego y dónde se cumple cada cosa en el código. Está basado en el enunciado del segundo parcial (Lenguajes de Programación, UDES).

## 1. Alcance

**Incluye:** un solo jugador, partida libre y modo progresivo, música de fondo, banco de 32 capitales con filtro por región y nivel, teclado virtual y físico, dibujo progresivo en SVG, pistas, puntaje, cronómetro, estadísticas y ranking en localStorage, instrucciones y diseño responsive.

**No incluye:** multijugador en línea, servidor, registro de usuarios ni base de datos externa.

## 2. Reglas del juego

| Regla | Detalle |
|---|---|
| Palabras | 32 capitales. Cada una guarda su departamento (pista) y su región (filtro) |
| Regiones | Andina, Caribe, Pacífica, Orinoquía, Amazonía, Insular o todo el país |
| Niveles | Fácil 4–6 letras · Medio 7–9 · Difícil 10 o más (sin contar espacios) |
| Errores | Máximo 6: cabeza, cuerpo, brazo izq., brazo der., pierna izq., pierna der. |
| Tildes | No cuentan como letra distinta (O revela Ó). La Ñ sí es una letra aparte |
| Espacios | Se muestran desde el inicio y no se adivinan |

| Nivel | Pistas | Tiempo | Multiplicador | Capitales |
|---|---|---|---|---|
| Fácil | 2 | Sin límite | x1 | 12 |
| Medio | 1 | Sin límite | x2 | 13 |
| Difícil | 0 | 90 s | x3 | 7 |

| Acción | Puntos |
|---|---|
| Letra correcta (por cada aparición) | +10 |
| Letra incorrecta | −5 |
| Usar una pista | −15 |
| Ganar | +50 + vidas restantes × 10 |
| Puntaje final | subtotal × multiplicador (mínimo 0) |

## 3. Requerimientos funcionales

| Código | Requerimiento | Criterio de aceptación | Dónde se cumple |
|---|---|---|---|
| RF-01 | Ingresar el nombre antes de jugar | Con el campo vacío no inicia y muestra un mensaje | `app.js` → evento `submit` del menú |
| RF-02 | Elegir región y nivel | Los niveles sin capitales en esa región quedan deshabilitados | `ui.js` → `renderOpcionesRegion()`, `renderOpcionesNivel()` |
| RF-03 | Elegir una capital al azar según región y nivel | No repite la capital de la partida anterior si hay otra opción | `palabras.js` → `obtenerCapital()` |
| RF-04 | Mostrar la palabra oculta con un guion por letra | La cantidad de casillas coincide con las letras | `ui.js` → `renderPalabra()` |
| RF-05 | Recibir letras del teclado virtual y del físico | Ambos llaman a la misma función | `app.js` → `jugarLetra()`, `alPresionarTecla()` |
| RF-06 | Validar la letra y revelarla en todas sus posiciones | Suma 10 puntos por cada aparición | `juego.js` → `procesarLetra()` |
| RF-07 | Impedir usar una letra dos veces | El botón queda deshabilitado y la tecla física no hace nada | `juego.js` → `procesarLetra()`; `ui.js` → `actualizarTeclado()` |
| RF-08 | Dibujar una parte del ahorcado por cada error | Con n errores se ven n partes | `ui.js` → `dibujarAhorcado()` |
| RF-09 | Detectar victoria o derrota | Gana con la palabra completa; pierde con 6 errores o al acabarse el tiempo | `juego.js` → `verificarEstado()` |
| RF-10 | Mostrar el puntaje en tiempo real | El marcador cambia después de cada jugada | `ui.js` → `actualizarMarcador()` |
| RF-11 | Ofrecer pistas según el nivel | Fácil 2, Medio 1, Difícil 0. Cada una resta 15 | `juego.js` → `usarPista()` |
| RF-12 | Cronómetro de 90 s en nivel difícil | Al llegar a 0 la partida termina en derrota | `app.js` → `iniciarReloj()`; `juego.js` → `restarSegundo()` |
| RF-13 | Guardar estadísticas y mejores puntajes | Se conservan al recargar la página | `almacenamiento.js` → `guardarEstadisticas()` |
| RF-14 | Reiniciar la partida o volver al menú | Botones «Jugar otra vez» y «Volver al menú» en el resultado | `app.js` → `comenzarPartida()`, `volverAlMenu()` |
| RF-15 | Tratar igual mayúsculas, minúsculas y letras con tilde | «o» revela la «Ó» de Quibdó | `juego.js` → `normalizar()` |
| RF-16 | Mostrar los espacios automáticamente | Santa Marta muestra dos grupos desde el inicio | `ui.js` → `renderPalabra()` |
| RF-17 | Mostrar la capital y su departamento al terminar | La ventana de resultado muestra capital, departamento y región | `ui.js` → `mostrarResultado()` |

### Mejoras propias (no están en el enunciado)

| Código | Requerimiento | Criterio de aceptación | Dónde se cumple |
|---|---|---|---|
| RF-18 | Mostrar un dato de la capital desde el inicio de la partida | Debajo de la palabra aparece una frase que da contexto sin decir la capital ni el departamento | `palabras.js` → campo `dato`; `ui.js` → `prepararTablero()` |
| RF-19 | Modo progresivo | Empieza en Fácil, sube de nivel cada 3 capitales acertadas, no repite capitales, suma un total y termina al perder o al completar la región | `juego.js` → `iniciarRecorrido()`, `siguienteRonda()`, `registrarRonda()` |
| RF-20 | Guardar el mejor recorrido | La página de estadísticas muestra el mejor recorrido aunque se recargue | `almacenamiento.js` → `guardarRecorrido()` |
| RF-21 | Música de fondo que se puede apagar | Suena desde la primera interacción; el botón de la nota la apaga y la preferencia se guarda | `ui.js` → `iniciarMusica()`; `app.js` → botón `btn-musica` |
| RF-22 | Tiempo límite en el modo progresivo y música de tensión | En el modo progresivo hay reloj en todos los niveles (Fácil 2:00, Medio 1:40, Difícil 1:30). En cualquier partida con reloj, a los 15 s finales baja la música y suena el tic-tac; se detiene al terminar o salir | `juego.js` → `TIEMPO_PROGRESIVO`; `ui.js` → `iniciarTension()`; `app.js` → `iniciarReloj()` |

## 4. Requerimientos no funcionales

| Código | Categoría | Requerimiento | Cómo se cumple |
|---|---|---|---|
| RNF-01 | Usabilidad | Navegación intuitiva, sin necesidad de leer instrucciones | Menú en una sola pantalla, avisos después de cada jugada |
| RNF-02 | Responsive | Se adapta desde 360 px de ancho | `responsive.css`; casillas con ancho calculado para palabras largas |
| RNF-03 | Rendimiento | Respuesta inmediata a cada letra | Todo corre en el navegador, sin peticiones |
| RNF-04 | Compatibilidad | Chrome, Firefox, Edge y Safari | Solo HTML, CSS y JavaScript estándar |
| RNF-05 | Accesibilidad | Contraste, textos alternativos, uso con teclado | `aria-label`, `aria-live`, foco visible, enlace «Saltar al contenido» |
| RNF-06 | Mantenibilidad | Código modular y comentado en español | Un archivo por responsabilidad (sección 6) |
| RNF-07 | Portabilidad | No requiere instalación ni servidor | Se abre `index.html` directamente; scripts clásicos sin módulos |

## 5. Historias de usuario

| ID | Como… | Quiero… | Para… | RF |
|---|---|---|---|---|
| HU-01 | estudiante | elegir una región de Colombia | practicar las capitales que menos conozco | RF-02 |
| HU-02 | jugador | escoger el nivel de dificultad | ajustar el reto a mi habilidad | RF-02 |
| HU-03 | jugador | usar el teclado de mi computador | jugar más rápido | RF-05 |
| HU-04 | jugador | ver las letras que ya usé | no repetir intentos | RF-07 |
| HU-05 | jugador | pedir una pista cuando esté atascado | no perder la partida | RF-11 |
| HU-06 | jugador | ver mis estadísticas y récords | medir mi progreso | RF-13 |
| HU-07 | docente | usar el juego en clase de ciencias sociales | reforzar la geografía de Colombia de forma lúdica | RF-17 |

## 6. Diseño técnico

| Archivo | Responsabilidad |
|---|---|
| `palabras.js` | Banco de capitales, `REGIONES`, `obtenerCapital()` |
| `juego.js` | Estado de la partida y reglas. No toca el DOM |
| `ui.js` | Pinta la interfaz y el SVG |
| `almacenamiento.js` | localStorage (`ahorcado_stats` y `ahorcado_config`) |
| `app.js` | Punto de entrada: conecta eventos, cronómetro, modo progresivo, música y páginas |

Estado de la partida:

```js
{
  jugador, region, nivel,
  palabra, palabraNormalizada, departamento, regionCapital,
  letrasAcertadas: [], letrasFalladas: [],
  errores, maxErrores: 6,
  pistasDisponibles, pistasUsadas, departamentoRevelado,
  puntaje, tiempoRestante, terminado, resultado
}
```

Recorrido del modo progresivo:

```js
{ region, jugador, nivel, ronda, victoriasEnNivel, usadas: [], acertadas, puntajeTotal, terminado }
```

Estadísticas (`ahorcado_stats`):

```js
{ jugadas, ganadas, perdidas, rachaActual, mejorRacha,
  ranking: [{ nombre, puntaje, fecha, nivel }],      // top 10
  historial: [{ nombre, capital, nivel, region, gano, puntaje, fecha }],  // últimas 20
  mejorRecorrido: { nombre, acertadas, puntaje, nivel, fecha } }
```

## 7. Plan de pruebas

| ID | Caso | Resultado esperado | Estado |
|---|---|---|---|
| CP-01 | Iniciar partida con región y nivel | Palabra oculta con la cantidad correcta de guiones | ✅ |
| CP-02 | Letra que existe | Aparece en todas sus posiciones y suben los puntos | ✅ |
| CP-03 | Letra que no existe | Se dibuja una parte y baja una vida | ✅ |
| CP-04 | Letra ya usada | No pasa nada; el botón está deshabilitado | ✅ |
| CP-05 | Teclado físico | Se procesa igual que el virtual | ✅ |
| CP-06 | Adivinar la palabra | Mensaje de victoria y se guardan estadísticas | ✅ |
| CP-07 | Cometer 6 errores | Mensaje de derrota con la palabra correcta | ✅ |
| CP-08 | Pista en nivel fácil | Se restan 15 puntos y queda una pista menos | ✅ (ver nota) |
| CP-09 | Agotar el tiempo en difícil | Derrota | ✅ |
| CP-10 | «o» con QUIBDÓ | Se revela la Ó | ✅ |
| CP-11 | Recargar después de jugar | Las estadísticas se conservan | ✅ |
| CP-12 | Celular de 360 px | Sin desplazamiento horizontal | ✅ |
| CP-13 | SANTA MARTA | El espacio aparece desde el inicio | ✅ |
| CP-14 | Región Insular | Solo aparece San Andrés | ✅ |
| CP-15 | Iniciar cualquier partida | Se ve el dato de la capital desde el inicio | ✅ |
| CP-16 | Ganar 3 rondas en modo progresivo | La cuarta ronda es de nivel Medio y aparece el aviso de subida | ✅ |
| CP-17 | Perder una ronda en modo progresivo | Termina el recorrido, muestra el total y lo guarda si es récord | ✅ |
| CP-18 | Jugar varias rondas seguidas | Ninguna capital se repite en el recorrido | ✅ |
| CP-19 | Botón de música | Apaga y prende la música y recuerda la preferencia | ✅ |
| CP-20 | Ronda Fácil en modo progresivo | El reloj empieza en 2:00 (la partida libre en Fácil sigue sin límite) | ✅ |
| CP-21 | Llegar a 15 s en una partida con reloj | Suena la música de tensión y se detiene al terminar la partida | ✅ |

**Nota sobre CP-08:** la regla 8 del enunciado dice que la primera pista muestra el departamento y la segunda revela una letra, mientras que CP-08 espera que se revele una letra. Se siguió la regla 8: en Fácil, la primera pista da el departamento y la segunda una letra. Para cambiarlo basta con invertir el orden en `usarPista()`.
