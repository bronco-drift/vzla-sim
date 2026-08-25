# vzla-sim — Backlog

Simulación 3D low-poly: llevar el PIB per cápita de Venezuela a niveles de primer mundo.
Una "guía jugable para arreglar un país": las medidas hacen efecto a corto, mediano y largo
plazo, y el mapa lo va reflejando visualmente.

## Decisiones de diseño tomadas
- **Win condition: nivel de los mejores países del mundo**, por sistema de hitos/eras
  (ver MODELO.md). $1.000 de salario mínimo real es el Hito 3, no la meta.
- Cada era desbloquea medidas nuevas (sin luz no hay polo tecnológico).
- **Score = año en que alcanzás cada hito**: no hay game over, hay velocidad.
- Petróleo como motor de arranque en 3 fases; la Fase 3 se desbloquea con seguridad jurídica.
- Mapa 3D low-poly con relieve (no plano), tipo diorama.
- Sin avatar: cámara libre — flechas/mouse en escritorio, drag/pinch en móvil.
- Tiempo continuo con pausa y aceleración (x1 / x2 / x4...).
- Medidas por ciudad, con fases: anuncio → obra → efecto en rampa → efecto pleno.
- Edificios y obras de cada ciudad se actualizan visualmente cuando las medidas avanzan.
- Look: flat shading + paleta de colores, sin texturas descargadas.

## Medidas por ciudad (de Marcel)
- **Caracas** — quita/rebaja de impuestos.
- **Bolívar (El Guri)** — reparar la represa hidroeléctrica.
- **San Cristóbal** — trenes de carga y pasajeros.
- **Maracaibo** — nueva refinería + workover de pozos del Lago (Fase 1 petrolera).
- **Faja del Orinoco (Anzoátegui/Monagas)** — zona propia: taladros, pozos en racimo,
  mejoradores, terminal de Jose. Las 3 fases petroleras viven acá y en Maracaibo.
- **Valencia** — inversión en industria automotriz.

## Candidatas (propuestas de Claude, sin aprobar)
- **Ciudad Guayana** — reactivar SIDOR (hierro / acero / aluminio).
- **Puerto Cabello** — modernizar el puerto (comercio exterior).
- **Margarita / Canaima** — turismo internacional.
- **Los Llanos** — agroindustria (ganadería, arroz, maíz).
- **Mérida** — polo universitario / tecnológico.
- **Nacional** — estabilización monetaria.
- **Nacional** — seguridad jurídica para atraer inversión extranjera.

## Medidas nacionales (de Marcel, 2da tanda)
- **Retorno de la diáspora** — campaña + empleos para que vuelvan venezolanos del
  exterior; traen conocimiento y experiencia mundial → capital humano rápido (2–3 años,
  vs educación 15–20). Su efectividad escala con cada hito: nadie vuelve sin luz ni salario.
- **Modernización del estado y trámites** — gobierno digital; baja fricción para
  empresas, sube instituciones.
- **Luz, agua y servicios plenos** — El Guri + obras por ciudad; condición del Hito 1.
- **Educación pública y privada de calidad** — capital humano a largo plazo; lo que
  plantás temprano define el late game.
- **Salud top pública y privada** — capital humano + imán del retorno de la diáspora.

## Indicadores (propuesta en revisión)
- **Meta**: PIB per cápita (el número grande del juego; PIB total en panel de detalle).
- **Recurso**: caja / presupuesto (con esto se pagan las medidas).
- **Salud**: salario mínimo real (USD o % canasta), inflación, población (la diáspora
  vuelve si el país mejora — premio narrativo y mecánico), capital humano (alimentado
  por educación, salud y retorno de diáspora).
- Fase 2 si hacen falta: pobreza %, empleo, aprobación popular.

## Interfaz (draft)
- Barra superior: fecha + velocidad (pausa / ×1 / ×2 / ×4) + los 5 números.
- Mapa 3D ocupa todo el resto; sin adornos.
- Click/tap en ciudad → escritorio: panel lateral derecho · móvil vertical: bottom sheet.
  Mismo contenido: medidas de la ciudad con costo, duración y efecto esperado.
- Toasts discretos cuando una medida madura ("El Guri reparado — fin de los apagones").
- Tocar un indicador → gráfico de su evolución histórica.

## Shell de juego (básicos de juego actual — de Marcel)
- **Pantalla de bienvenida** (título del juego).
- **Comenzar partida** + **selección de nivel** (definir qué es "nivel": ¿dificultad
  —presupuesto inicial, precio del petróleo— o escenario de arranque?).
- **Partida guardada**: auto-save + botón "Continuar". El GameState es JSON puro →
  guardar/cargar a localStorage es trivial. Incluir `schemaVersion` en el save para
  poder migrar partidas viejas cuando el motor cambie.
- **Menú de pausa**: reanudar, guardar, opciones, salir al menú.
- El shell es **común a las 3 maquetas** (vive en `app/`, no en `maquetas/`):
  flujo Bienvenida → (Continuar | Nueva → nivel) → Partida (maqueta activa) → Pausa.

## Estado de las fases
- [x] **Fase 1 — Esqueleto** (24-ago-2026): Vite+React+R3F andando en puerto **4250**.
  Motor con tiempo (pausa/×1/×2/×4), 5 indicadores moviéndose, hitos detectándose,
  bienvenida → partida, maqueta A con plano 3D + MapControls y 3 ciudades placeholder.
  La economía es v0 placeholder — se calibra con MODELO.md en la Fase 4.
- [x] **Fase 2 — Mundo** (24-ago-2026): terreno real desde `public/data/venezuela-adm0.geojson`
  (copiado de mapitas) extruido low-poly + mar; proyección compartida derivada del bbox
  (`mundo/proyeccion.js`); 10 lugares reales clickeables (`data/lugares.js`) con etiquetas;
  panel de lugar (lateral desktop / bottom sheet móvil); **sol que orbita 1 vuelta = 1 año**
  (pedido de Marcel para ver la velocidad) con amanecer/atardecer y noche tipo luna, nunca
  negra. Relieve fino (montañas) pendiente para una pasada visual posterior.
- [x] **Fase 3 — Editor** (24-ago-2026): en `/?editor` (link en la bienvenida). Paleta de
  5 tipos (`data/objetos.js`: casa, edificio, torre, fábrica, árbol — geometría low-poly
  por código en `mundo/ObjetoMesh.jsx`, compartida juego/editor). Click coloca, click
  selecciona (gizmo de drei + panel leva con rotación/escala/borrar), Supr borra,
  "Exportar mundo.json" descarga el archivo para reemplazar `public/data/mundo.json`.
  Auto-save en localStorage: el juego lee localStorage primero, así los cambios del
  editor aparecen en el juego sin exportar. Verificado punta a punta.
- [x] **Fase 4 — Loop jugable** (24-ago-2026): 16 medidas en `data/medidas.js` calibradas
  con MODELO.md (3 fases petroleras encadenadas: Fase 2 requiere El Guri, Fase 3 requiere
  seguridad jurídica); motor con efectos agregados (`core/medidas.js`), caja con ingresos
  (3% PIB + petróleo base + medidas), capital humano que empuja crecimiento, castigo por
  inflación alta; panel de ciudad con costo/duración/estado/progreso/bloqueos; toasts
  (obra iniciada/terminada, efecto pleno, hito); edificios que aparecen en el mapa al
  llegar a pleno; historia mensual para gráficos; auto-save cada 5s + Continuar.
- [x] **Fase 5 — Maquetas B y C** (24-ago-2026): **B "Tablero"** = cenital ortográfica
  pan/zoom sin rotación (etiquetas en px fijos — distanceFactor se rompe en ortho);
  **C "Datos"** = sala de datos sin 3D: 6 gráficos SVG de evolución + lista de lugares.
  Selector de maqueta en la bienvenida + `?maqueta=a|b|c`.
- [x] **Fase 6 — Shell completo** (24-ago-2026): selección de nivel (Fácil/Realista/
  Pesadilla — caja, inflación y capital humano iniciales), menú de pausa (reanudar/
  guardar/salir, congela la sim), click en indicador → modal con gráfico de su historia.
  Pulido responsive fino queda como tarea continua.

## Tiempo y ciclo día/noche (decisión final, 24-ago)
- **×1 = 1 mes por segundo** (~12s por año). Velocidades: ⏸ ×1 ×2 ×4.
  (Se probó "×1 = 1 día/minuto" con velocidades hasta ×100 y Marcel lo descartó:
  el juego se sentía quieto. No volver a esa escala.)
- **El sol da 1 vuelta por año**: a ×4 gira visiblemente más rápido — el sol muestra
  la velocidad. Luna en el lado opuesto con luz azul tenue; el sol no da luz bajo el
  horizonte. Movimiento interpolado a 60fps (la sim tickea a 10/s).
- **Filtro de amanecer/atardecer**: cielo y niebla se tiñen en vivo (navy noche →
  azul día → naranja cálido en los cruces del horizonte).

## Stack y arquitectura (decidido)
- **Vite + React 19 + Zustand + Three.js vía react-three-fiber + drei.**
- Patrón: **motor + maquetas**. El motor (`core/` + `store/` + `data/`) es uno solo y
  compartido; cada maqueta es una carpeta en `maquetas/` con su propia vista e
  interacción completa. Se harán **3 maquetas en paralelo** sobre el mismo motor.
- Contrato: las maquetas solo hablan con el store (leen estado, disparan acciones);
  nunca tocan el motor. Si una maqueta necesita algo nuevo, se agrega al motor una vez
  y las 3 lo heredan.
- Cambio de maqueta en runtime (selector al inicio o `?maqueta=a|b|c`) — permite
  compararlas lado a lado en dos ventanas del navegador.
- Un solo repo Vite, NO tres copias físicas: el motor va a iterar constantemente y
  con copias habría que repetir cada fix tres veces.
- Medidas y ciudades como datos (`data/medidas.js`), no como código — patrón catalogo.js.
- JS con JSDoc (no TS); gráficos en SVG propio, sin librería de charts.
- La sim corre sin navegador: se puede testear 30 años simulados en Node.
- **Materiales centralizados** (`materiales.js`): todo arranca con colores planos, pero
  cualquier material puede volverse textura después sin refactor. Si hacen falta
  texturas: atlas de paleta (una imagen chica, UVs por bloque de color, 1 draw call)
  y `CanvasTexture` procedural para agua/terreno. Carpeta `public/textures/`.

## Editor de mundo (decidido)
- El mundo es datos: `data/mundo.json` (ciudades, edificios, props, posiciones).
  El juego renderiza ese JSON; el editor lo modifica en vivo.
- Editor = vista hermana de las maquetas, comparte los componentes 3D de la escena.
- Herramientas MVP: paleta de objetos → click para colocar; seleccionar →
  mover/rotar/escalar con TransformControls de drei; borrar; exportar JSON
  (+ respaldo en localStorage mientras se edita).
- Panel de tweaking en vivo con **leva** (sliders de propiedades, luz, niebla, cámara).
- Futuro si molesta el exportar/pegar: plugin de Vite que escribe el JSON a disco.
- Fuera del MVP del editor: undo/redo, snapping.

## Fuentes internas (proyectos de Marcel para usar como inspo/datos)
- **Mapitas** (`Desktop/Proyecto Mapitas`) — GeoJSON de Venezuela + CSVs territoriales:
  la base técnica del terreno 3D y datos por estado.
- **Auditoría Ciudadana / estado-abierto-ve** (`Desktop/estado-abierto-ve`) — estructura
  del Estado venezolano con grados A–E por organismo y San Cristóbal barrio por barrio:
  inspo directa para las medidas de "modernización del estado" y para calibrar el punto
  de partida institucional.
- **TMF_SC** (`Desktop/TMF_SC`) — transformación del medio físico de San Cristóbal,
  con doctrina urbanística propia (mediterráneo/andaluz, restaurar art déco, zona 30):
  inspo para cómo se VE la mejora de una ciudad — el antes/después que vzla-sim hace en 3D.
- **reforma-lab** (`Desktop/reforma-lab`) — cuaderno de estabilización económica
  (tesis Egipto/Nigeria): hermano conceptual del MODELO.md.

## Referencias
- **Tropico** — tema y tono: país caribeño, decretos, edificios que se levantan.
- **Plague Inc** — layout, sobre todo móvil: mapa protagonista, número clave arriba,
  velocidad de tiempo, panel inferior desplegable.
- **Democracy 4** — modelo de políticas (costo + delay + efectos encadenados); su UI no.
- Anti-referencia: **Victoria 3** — profundidad enterrada en menús. Acá: 5 números y un mapa.

## Ideas visuales
- [x] **Escritorio + lámpara gigante** (24-ago): mesa de madera bajo el mapa, el mar es
  la "bandeja de agua" del diorama, y una lámpara de escritorio low-poly al NE que se
  prende sola (spotlight cálido + bombillo que brilla) cuando el sol baja. Se oculta en
  modo mundo. Pendiente fino: objetos de escritorio de fondo (lápices, taza...).
- [x] **Mundo completo con Venezuela resaltada** (24-ago, pedido de Marcel): botón
  flotante 🌎 en la partida alterna en vivo — 175 países planos en color apagado
  (1 draw call, `mundo-paises.geojson` de mapitas), Venezuela sigue extruida y verde;
  el mar se agranda a océano, fog y zoom de cámara se adaptan. Marcel decide cuál
  fantasía queda (escritorio vs planeta) — por ahora conviven con el toggle.
- ~~Relieve estilizado con conos/tepuyes~~ **DESCARTADO** (24-ago): se probó y Marcel
  lo rechazó — "se ve feo". Si algún día se retoma el relieve, que sea con otra técnica
  (desplazamiento suave del terreno, no primitivas sueltas encima).

## Fin de partida (decidido 24-ago, sin implementar)
- El juego termina al alcanzar el **Hito 5** (salario real $3.000): pantalla de victoria
  con scorecard — año en que se alcanzó cada hito, gráficos de la partida completa,
  años totales. Botón "Seguir jugando" (no te echa, estilo Civilization).
- **Sin derrota**: nunca perdés, solo variás en velocidad. La caja no puede quebrar.
- Implementación pendiente: registrar el año de cada hito en el estado (hoy solo se
  guarda el último alcanzado) + pantalla de victoria + scorecard parcial en pausa.
- Referencia: partida bien jugada ≈ 35-45 años simulados (~15-30 min reales).

## Eventos especiales
- [x] **Sistema de eventos + El Esequibo se vuelve estado** (24-ago): eventos únicos por
  hito en `data/eventos.js` — modal que pausa la sim, se registra en el save. Al Hito 4
  (salario $2.000) el Esequibo se confirma como estado: modal narrativo + aparece el
  lugar "Esequibo" (Tumeremo) con 2 medidas (Integración territorial → Recursos del
  Esequibo). Pendiente visual: dibujar el polígono del territorio en el mapa (el adm0
  actual no lo trae; mapitas tiene el dato de Guayana Esequiba para integrarlo).
- Sistema listo para más eventos: crisis petrolera, sequía en El Guri, boom migratorio...

## Abierto / por definir
- Escala del tiempo (¿1 tick = 1 semana? ¿partida completa = 30–40 años?).
- Cómo se financia el jugador (presupuesto, deuda, ingreso petrolero).
- Extensión del mapa: ¿todo el territorio con relieve real o zona por zona?
