/**
 * Museo Xupply · las 4 estaciones interactivas.
 *
 * Cada estación explica UN módulo del ecosistema Xupply tal y como lo describe
 * el proyecto https://github.com/JuanBerro-back/xupply-D
 *
 * IMPORTANTE: todos los datos de `demo` son FICTICIOS y sirven solo para
 * ilustrar. No son datos reales de ningún restaurante, proveedor ni persona.
 */

export const STATIONS = [
  {
    id: 'catalogo',
    num: 'M1',
    title: 'Catálogo mayorista',
    subtitle: 'Proveedores, precios y disponibilidad en un solo lugar',
    accent: '#5aa9ff',
    pitch:
      'El catálogo conecta al restaurante con proveedores mayoristas de gastronomía: qué hay, a qué precio y con qué disponibilidad.',
    bullets: [
      'Un catálogo único con productos, unidades de compra y precios por proveedor.',
      'Buscador y filtros por categoría (carnes, verduras, bebidas, desechables…).',
      'Cada restaurante ve su propio precio negociado, no un precio global.',
      'Base para comparar alternativas y decidir la compra sin llamadas ni mensajes.',
    ],
    how: 'Reglas de negocio: un producto puede pertenecer a varios proveedores; cada relación proveedor-producto guarda precio, presentación y stock disponible.',
    demo: {
      note: 'Datos DEMO ficticios (no son precios reales)',
      columns: ['SKU', 'Producto', 'Proveedor', 'Precio', 'Disp.'],
      rows: [
        ['DEMO-0142', 'Pechuga de pollo x 5 kg', 'DistriAndina', '$ 96.400', '24'],
        ['DEMO-0088', 'Tomate chonto x caja 20 kg', 'Verduras del Sur', '$ 61.200', '11'],
        ['DEMO-0311', 'Aceite vegetal 1 L x 12', 'Mayorista Oriente', '$ 118.900', '38'],
        ['DEMO-0455', 'Vaso 9 oz x 1000', 'Empaques Colombia', '$ 132.500', '7'],
      ],
      metrics: [
        { label: 'Productos publicados', value: '1.248' },
        { label: 'Proveedores activos', value: '37' },
        { label: 'Categorías', value: '12' },
      ],
    },
    guide: [
      'Estación 1: el catálogo mayorista. Aquí empieza todo el abastecimiento.',
      'El restaurante compara productos y precios sin llamar a nadie.',
    ],
  },
  {
    id: 'pedidos',
    num: 'M2',
    title: 'Pedidos y seguimiento GPS',
    subtitle: 'Del carrito a la puerta del restaurante',
    accent: '#6ee7b7',
    pitch:
      'El módulo de pedidos convierte el catálogo en órdenes de compra con estados claros y seguimiento de la entrega sobre el mapa.',
    bullets: [
      'Carrito por restaurante y confirmación del pedido con número de orden.',
      'Estados: creado → confirmado → en preparación → en camino → entregado.',
      'Seguimiento GPS del domiciliario sobre el mapa, con hora estimada.',
      'Historial de pedidos y comprobante para contabilidad.',
    ],
    how: 'Cada pedido guarda su detalle (productos, cantidades, precios), su historial de estados y las posiciones reportadas durante la entrega.',
    demo: {
      note: 'Datos DEMO ficticios (seguimiento simulado)',
      columns: ['Pedido', 'Restaurante', 'Estado', 'Repartidor', 'ETA'],
      rows: [
        ['DEMO-P-8841', 'Sazón de la 27', 'En camino', 'Repartidor A', '12 min'],
        ['DEMO-P-8839', 'Cocina La Candelaria', 'En preparación', 'Repartidor B', '34 min'],
        ['DEMO-P-8836', 'Asadero El Fogón', 'Entregado', 'Repartidor C', '—'],
        ['DEMO-P-8830', 'Café Bucarica', 'Confirmado', 'Sin asignar', '55 min'],
      ],
      metrics: [
        { label: 'Pedidos hoy', value: '86' },
        { label: 'Entregados a tiempo', value: '92%' },
        { label: 'Tiempo medio', value: '41 min' },
      ],
    },
    guide: [
      'Estación 2: pedidos y seguimiento GPS. Aquí el pedido se vuelve entrega.',
      'Mira el estado y la hora estimada: el restaurante deja de adivinar.',
    ],
  },
  {
    id: 'inventario',
    num: 'M3',
    title: 'Inventario y contabilidad',
    subtitle: 'Saber qué hay, qué falta y cuánto cuesta',
    accent: '#f6c453',
    pitch:
      'El inventario se descuenta con cada pedido y la contabilidad registra ingresos, costos y facturación del negocio.',
    bullets: [
      'Stock por producto y bodega con alertas de mínimos.',
      'Predicción de faltantes a partir del consumo histórico.',
      'Facturación del pedido y registro contable asociado.',
      'Indicadores para decidir compras antes de que falte el insumo.',
    ],
    how: 'Movimientos de inventario (entradas por compra, salidas por consumo) y asientos contables derivados de cada factura.',
    demo: {
      note: 'Datos DEMO ficticios (cifras ilustrativas)',
      columns: ['Producto', 'Stock', 'Mínimo', 'Consumo/sem.', 'Alerta'],
      rows: [
        ['Pechuga de pollo', '18 kg', '30 kg', '46 kg', 'Reponer'],
        ['Tomate chonto', '42 kg', '25 kg', '38 kg', 'OK'],
        ['Aceite vegetal', '9 cajas', '12 cajas', '11 cajas', 'Reponer'],
        ['Vaso 9 oz', '26 mill.', '10 mill.', '14 mill.', 'OK'],
      ],
      metrics: [
        { label: 'Ítems en inventario', value: '312' },
        { label: 'Alertas de reposición', value: '14' },
        { label: 'Margen bruto demo', value: '31%' },
      ],
    },
    guide: [
      'Estación 3: inventario y contabilidad. Aquí el negocio sabe qué le queda.',
      'Las alertas avisan antes de que un insumo se acabe.',
    ],
  },
  {
    id: 'copiloto',
    num: 'M4',
    title: 'Copiloto de IA',
    subtitle: 'Food cost y logística explicados en lenguaje natural',
    accent: '#c084fc',
    pitch:
      'El copiloto responde preguntas del negocio: cuánto cuesta un plato, cómo va la logística y qué conviene comprar.',
    bullets: [
      'Food cost por plato: receta, ingredientes y precio de venta.',
      'Sugerencias de compra a partir de inventario y consumo.',
      'Lectura de logística: pedidos retrasados, rutas y capacidad.',
      'Detección de clientes potenciales y oportunidades comerciales.',
    ],
    how: 'Capa de consulta en lenguaje natural sobre los datos de los otros módulos: catálogo, pedidos, inventario y contabilidad.',
    demo: {
      note: 'Conversación DEMO ficticia (la IA real exigiría backend)',
      columns: ['Pregunta', 'Respuesta del copiloto'],
      rows: [
        ['¿Cuál es mi food cost del plato estrella?', '34% (DEMO) con el precio actual de la pechuga.'],
        ['¿Qué insumo pide reposición esta semana?', 'Pechuga de pollo y aceite vegetal (DEMO).'],
        ['¿Cuántos pedidos van con retraso?', '2 de 86 pedidos (DEMO).'],
        ['¿A quién le puedo vender más?', '3 restaurantes con consumo creciente (DEMO).'],
      ],
      metrics: [
        { label: 'Platos costeados', value: '48' },
        { label: 'Consultas resueltas', value: '126' },
        { label: 'Ahorro detectado', value: '$ 1,8 M (DEMO)' },
      ],
    },
    guide: [
      'Estación 4: el copiloto de IA. Aquí los datos se vuelven decisiones.',
      'Recuerda: en este museo la IA responde con datos DEMO, no con datos reales.',
    ],
  },
]

export const STATION_MAP = Object.fromEntries(STATIONS.map((s) => [s.id, s]))

/** Índice de la estación por id (para el recorrido guiado). */
export function stationIndex(id) {
  return STATIONS.findIndex((s) => s.id === id)
}

export const DEMO_DISCLAIMER =
  'Modo demostración: todos los datos mostrados son ficticios y se usan solo para explicar cómo funcionaría cada módulo.'
