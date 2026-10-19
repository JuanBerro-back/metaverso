/**
 * Registros de objetos 3D interactivos.
 *
 * Se usan desde `useFrame` (fuera del ciclo de render de React) para hacer
 * el rayo de selección sin provocar re-renderizados.
 */
export const REGISTRY = new Map() // carteles del museo (EXHIBITS)
export const STATION_REGISTRY = new Map() // estaciones M1..M4
