// palabras.js
// Banco de las 32 capitales de Colombia y funciones para filtrarlas.
// Cada capital tiene su departamento (para la pista), su región (para el filtro)
// y un dato que se muestra desde el inicio de la partida.

// Nombres que se muestran en pantalla para cada región
const REGIONES = {
  todo: 'Todo el país',
  andina: 'Andina',
  caribe: 'Caribe',
  pacifica: 'Pacífica',
  orinoquia: 'Orinoquía',
  amazonia: 'Amazonía',
  insular: 'Insular'
};

// Banco de capitales (sección 6.3 del enunciado)
const CAPITALES = [
  { capital: 'LETICIA', departamento: 'Amazonas', region: 'amazonia',
    dato: 'Está en la triple frontera con Brasil y Perú, a orillas del río Amazonas.' },
  { capital: 'MEDELLÍN', departamento: 'Antioquia', region: 'andina',
    dato: 'La llaman la ciudad de la eterna primavera y es famosa por su Feria de las Flores.' },
  { capital: 'ARAUCA', departamento: 'Arauca', region: 'orinoquia',
    dato: 'Ciudad llanera a orillas de un río que marca la frontera con Venezuela.' },
  { capital: 'BARRANQUILLA', departamento: 'Atlántico', region: 'caribe',
    dato: 'Allí se celebra uno de los carnavales más grandes del mundo, cerca de la desembocadura del río Magdalena.' },
  { capital: 'CARTAGENA', departamento: 'Bolívar', region: 'caribe',
    dato: 'Ciudad amurallada del Caribe, declarada Patrimonio de la Humanidad.' },
  { capital: 'TUNJA', departamento: 'Boyacá', region: 'andina',
    dato: 'Una de las capitales más frías del país; muy cerca se ganó la batalla que selló la independencia en 1819.' },
  { capital: 'MANIZALES', departamento: 'Caldas', region: 'andina',
    dato: 'Ciudad de montaña del Eje Cafetero, cerca del Nevado del Ruiz.' },
  { capital: 'FLORENCIA', departamento: 'Caquetá', region: 'amazonia',
    dato: 'La llaman la puerta de oro de la Amazonía colombiana.' },
  { capital: 'YOPAL', departamento: 'Casanare', region: 'orinoquia',
    dato: 'Ciudad del piedemonte llanero, conocida por la ganadería y el petróleo.' },
  { capital: 'POPAYÁN', departamento: 'Cauca', region: 'andina',
    dato: 'La ciudad blanca, famosa por sus procesiones de Semana Santa.' },
  { capital: 'VALLEDUPAR', departamento: 'Cesar', region: 'caribe',
    dato: 'Cuna del vallenato y sede del Festival de la Leyenda Vallenata.' },
  { capital: 'QUIBDÓ', departamento: 'Chocó', region: 'pacifica',
    dato: 'Está a orillas del río Atrato, en una de las zonas más lluviosas del planeta.' },
  { capital: 'MONTERÍA', departamento: 'Córdoba', region: 'caribe',
    dato: 'Capital ganadera a orillas del río Sinú.' },
  { capital: 'BOGOTÁ', departamento: 'Cundinamarca', region: 'andina',
    dato: 'Es la capital del país y está a unos 2.600 metros sobre el nivel del mar.' },
  { capital: 'INÍRIDA', departamento: 'Guainía', region: 'amazonia',
    dato: 'Cerca de ella están los cerros de Mavecure, y una flor de la región lleva su nombre.' },
  { capital: 'SAN JOSÉ DEL GUAVIARE', departamento: 'Guaviare', region: 'amazonia',
    dato: 'Es la puerta a la serranía de La Lindosa y sus pinturas rupestres.' },
  { capital: 'NEIVA', departamento: 'Huila', region: 'andina',
    dato: 'Ciudad calurosa a orillas del Magdalena, famosa por el Festival del Bambuco.' },
  { capital: 'RIOHACHA', departamento: 'La Guajira', region: 'caribe',
    dato: 'Ciudad costera de la península donde vive el pueblo wayuu.' },
  { capital: 'SANTA MARTA', departamento: 'Magdalena', region: 'caribe',
    dato: 'La ciudad más antigua del país, entre el mar Caribe y la Sierra Nevada.' },
  { capital: 'VILLAVICENCIO', departamento: 'Meta', region: 'orinoquia',
    dato: 'La llaman la puerta del Llano, a pocas horas de la capital del país.' },
  { capital: 'PASTO', departamento: 'Nariño', region: 'andina',
    dato: 'Está al pie del volcán Galeras y celebra el Carnaval de Negros y Blancos.' },
  { capital: 'CÚCUTA', departamento: 'Norte de Santander', region: 'andina',
    dato: 'Ciudad fronteriza con Venezuela; muy cerca se redactó la Constitución de 1821.' },
  { capital: 'MOCOA', departamento: 'Putumayo', region: 'amazonia',
    dato: 'Ciudad del piedemonte amazónico rodeada de cascadas, como la del Fin del Mundo.' },
  { capital: 'ARMENIA', departamento: 'Quindío', region: 'andina',
    dato: 'La llaman la ciudad milagro; cerca está el Parque del Café.' },
  { capital: 'PEREIRA', departamento: 'Risaralda', region: 'andina',
    dato: 'Ciudad del Eje Cafetero conocida por la estatua del Bolívar desnudo en su plaza principal.' },
  { capital: 'SAN ANDRÉS', departamento: 'San Andrés, Providencia y Santa Catalina', region: 'insular',
    dato: 'Una isla del Caribe famosa por el mar de los siete colores.' },
  { capital: 'BUCARAMANGA', departamento: 'Santander', region: 'andina',
    dato: 'La ciudad de los parques, cerca del cañón del Chicamocha.' },
  { capital: 'SINCELEJO', departamento: 'Sucre', region: 'caribe',
    dato: 'Ciudad sabanera del Caribe conocida por sus fiestas del 20 de enero.' },
  { capital: 'IBAGUÉ', departamento: 'Tolima', region: 'andina',
    dato: 'La llaman la capital musical de Colombia.' },
  { capital: 'CALI', departamento: 'Valle del Cauca', region: 'pacifica',
    dato: 'La capital mundial de la salsa, con su feria a finales de diciembre.' },
  { capital: 'MITÚ', departamento: 'Vaupés', region: 'amazonia',
    dato: 'Ciudad selvática cerca de la frontera con Brasil, a la que casi solo se llega en avión.' },
  { capital: 'PUERTO CARREÑO', departamento: 'Vichada', region: 'orinoquia',
    dato: 'Está donde el río Meta se une con el Orinoco, frente a Venezuela.' }
];

// Cuenta las letras de una capital sin contar los espacios
function contarLetras(capital) {
  return capital.replace(/ /g, '').length;
}

// Según la cantidad de letras, dice si la capital es fácil, media o difícil
function nivelDeCapital(capital) {
  const letras = contarLetras(capital);
  if (letras <= 6) {
    return 'facil';
  } else if (letras <= 9) {
    return 'medio';
  } else {
    return 'dificil';
  }
}

// Devuelve las capitales de una región y un nivel.
// Si la región es 'todo' no se filtra por región; si no se pasa nivel, no se filtra por nivel.
function capitalesDisponibles(region, nivel) {
  const resultado = [];
  for (let i = 0; i < CAPITALES.length; i++) {
    const c = CAPITALES[i];
    const cumpleRegion = region === 'todo' || c.region === region;
    const cumpleNivel = !nivel || nivelDeCapital(c.capital) === nivel;
    if (cumpleRegion && cumpleNivel) {
      resultado.push(c);
    }
  }
  return resultado;
}

// Elige una capital al azar de la región y el nivel.
// "excluir" puede ser la capital anterior (para no repetirla en la partida libre)
// o una lista de capitales ya jugadas (en el modo progresivo).
function obtenerCapital(region, nivel, excluir) {
  const todas = capitalesDisponibles(region, nivel);
  let opciones = [];

  for (let i = 0; i < todas.length; i++) {
    let saltar = false;
    if (Array.isArray(excluir)) {
      saltar = excluir.includes(todas[i].capital);
    } else {
      saltar = todas[i].capital === excluir;
    }
    if (!saltar) {
      opciones.push(todas[i]);
    }
  }

  // En partida libre, si solo hay una capital (como San Andrés) se puede repetir
  if (opciones.length === 0 && !Array.isArray(excluir)) {
    opciones = todas;
  }
  if (opciones.length === 0) {
    return null;
  }

  const posicion = Math.floor(Math.random() * opciones.length);
  return opciones[posicion];
}
