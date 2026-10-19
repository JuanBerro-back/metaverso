import { STATION_MAP } from '../museum/stations.js'

/**
 * Recorrido guiado ("modo presentación").
 *
 * Es una secuencia de pasos con narración breve. Los pasos de tipo `station`
 * teletransportan al visitante frente a la estación y abren su ficha.
 * Los personajes kawaii (Xuppy el gato-ovni y Burgy la hamburguesa) hacen de
 * guías mediante la burbuja de diálogo existente.
 */
export const TOUR_STEPS = [
  {
    id: 'bienvenida',
    kind: 'intro',
    title: 'Bienvenida al Museo Xuppy',
    text:
      'Recorrido guiado por los cuatro módulos que explican qué es Xupply.D Usa "Siguiente" para avanzar, "Saltar a módulo" para ir directo a uno o "Salir del recorrido" para explorar por tu cuenta.',
    guide: '¡Hola! Soy Xuppy. Te acompaño por el museo: son cuatro estaciones, una por módulo. ¡Vamos!',
    metrica: 'Demostración local · sin backend',
  },
  {
    id: 'catalogo',
    kind: 'station',
    station: 'catalogo',
    title: 'M1 · Catálogo mayorista',
    text:
      'Primera parada: el catálogo donde el restaurante compara productos, precios y disponibilidad de cada proveedor mayorista.',
    guide: 'Mira la pantalla: aquí el restaurante ya no compra a ciegas.',
  },
  {
    id: 'pedidos',
    kind: 'station',
    station: 'pedidos',
    title: 'M2 · Pedidos y seguimiento GPS',
    text:
      'Segunda parada: el pedido se crea, cambia de estado y se sigue sobre el mapa hasta la puerta del restaurante.',
    guide: 'Del carrito a la puerta: cada pedido tiene estado y hora estimada.',
  },
  {
    id: 'inventario',
    kind: 'station',
    station: 'inventario',
    title: 'M3 · Inventario y contabilidad',
    text:
      'Tercera parada: stock, alertas de reposición y el registro contable que sale de cada factura.',
    guide: 'Aquí el negocio sabe qué le queda y qué le cuesta, antes de que falte.',
  },
  {
    id: 'copiloto',
    kind: 'station',
    station: 'copiloto',
    title: 'M4 · Copiloto de IA',
    text:
      'Cuarta parada: el copiloto responde preguntas de food cost y logística en lenguaje natural.',
    guide: 'Pregúntale al copiloto y te responde con datos… de demostración, eso sí.',
  },
  {
    id: 'cierre',
    kind: 'outro',
    title: 'Fin del recorrido',
    text:
      'Eso es el museo completo. Puedes volver a cualquier estación, probar el minijuego de la banda logística o salir al inicio. Todos los datos que has visto son DEMO.',
    guide: '¡Recorrido terminado! Ahora explora el museo o juega en la banda logística. ¡Ñam!',
    metrica: 'Xupply.D · ecosistema logístico B2B',
  },
]

export const TOUR_TOTAL = TOUR_STEPS.length

/** Estación asociada al paso, o null si es un paso de introducción/cierre. */
export function stepStation(step) {
  if (!step || step.kind !== 'station') return null
  return STATION_MAP[step.station] || null
}

/** Pasos que apuntan a una estación (para el menú "Saltar a módulo"). */
export const TOUR_MODULOS = TOUR_STEPS.filter((s) => s.kind === 'station')

/** Índice dentro de TOUR_STEPS del paso que abre la estación `id` (o -1). */
export function tourStepIndex(stationId) {
  return TOUR_STEPS.findIndex((s) => s.station === stationId)
}
