export const REPO_URL = 'https://github.com/JuanBerro-back/xupply-D'
export const AUTHOR = 'Juan Berro'

export const EXHIBITS = [
  {
    id: 'intro',
    num: '01',
    title: '¿Qué es Xupply?',
    subtitle: 'B2B ERP · Ecosistema logístico',
    accent: '#5aa9ff',
    body: [
      'Plataforma web que conecta restaurantes',
      'con proveedores mayoristas de gastronomía',
      'en Bucaramanga · Colombia',
    ],
    details: {
      lead: 'Xupply es un sistema ERP B2B y ecosistema logístico orientado al sector gastronómico.',
      paragraphs: [
        'Conecta restaurantes y proveedores mayoristas de gastronomía en Bucaramanga, Colombia, digitalizando el abastecimiento de principio a fin.',
        'Reúne módulos de ventas, inventario, facturación, contabilidad, logística con seguimiento GPS e inteligencia artificial.',
        'Es un proyecto en construcción: el código avanza por fases mediante ramas y Pull Requests (github.com/JuanBerro-back/xupply-D).',
      ],
    },
  },
  {
    id: 'modulos',
    num: '02',
    title: 'Módulos del sistema',
    subtitle: 'Todo en una sola plataforma',
    accent: '#6ee7b7',
    body: ['Ventas · Inventario', 'Facturación · Contabilidad', 'Logística GPS · Inteligencia artificial'],
    details: {
      lead: 'Seis módulos integran el ecosistema Xupply.',
      paragraphs: [
        'Ventas y pedidos entre restaurantes y proveedores, con estados y seguimiento completo.',
        'Inventario en tiempo real y predicciones de stock para evitar faltantes.',
        'Facturación y contabilidad para cuidar la salud financiera del negocio.',
        'Logística GPS para el seguimiento de entregas y domiciliarios.',
        'Inteligencia artificial: asistente de inventario, costeo y detección de clientes potenciales.',
      ],
    },
  },
  {
    id: 'fase1',
    num: '03',
    title: 'Fase 1 · Landing',
    subtitle: 'Presentación pública del proyecto',
    accent: '#f6c453',
    body: ['Página web demostrativa', 'Vite · React · TypeScript · Tailwind'],
    details: {
      lead: 'Una landing moderna que presenta Xupply al público y a inversionistas.',
      paragraphs: [
        'Página única con hero, beneficios, sección "cómo funciona", planes, CTA y footer.',
        'Diseño responsive para móvil, tablet y escritorio, con modo claro y oscuro.',
        'Checklist de accesibilidad: contraste, ARIA y navegación por teclado.',
        'Stack: Vite + React + TypeScript + Tailwind CSS.',
      ],
    },
  },
  {
    id: 'fase2',
    num: '04',
    title: 'Fase 2 · Backend',
    subtitle: 'API REST express',
    accent: '#8f7bff',
    body: ['API Express + TypeScript', 'Autenticación JWT + bcrypt', 'Con PostgreSQL'],
    details: {
      lead: 'Backend que expone la API REST de Xupply con autenticación segura.',
      paragraphs: [
        'Servidor Express + TypeScript con endpoint /health.',
        'Registro y login con JWT, contraseñas hasheadas con bcrypt.',
        'Middlewares authRequired y roleRequired para proteger rutas.',
        'Pool de conexión a PostgreSQL mediante DATABASE_URL.',
        'Esquema mínimo inicial: roles, users, restaurants y suppliers.',
      ],
    },
  },
  {
    id: 'fase3',
    num: '05',
    title: 'Fase 3 · Base de datos',
    subtitle: 'Modelo de datos completo',
    accent: '#ff8fb1',
    body: ['Esquema PostgreSQL completo', 'Datos demo · Vistas analíticas'],
    details: {
      lead: 'El modelo de datos completo de la plataforma sobre PostgreSQL 16.',
      paragraphs: [
        'Tablas, ENUMs, relaciones e índices para catálogos, pedidos, inventario, facturación, contabilidad y logística.',
        'Datos de prueba: usuarios demo1234, restaurantes, inventario y menú.',
        'Vistas analíticas para el dashboard y predicciones de stock.',
        'Documentación del modelo entidad-relación.',
      ],
    },
  },
  {
    id: 'futuro',
    num: '06',
    title: 'Fases futuras',
    subtitle: 'Roadmap · fases 4 a 7',
    accent: '#57d0f0',
    body: ['Escritorio · Móvil', 'Asistente IA · Despliegue'],
    details: {
      lead: 'Lo que viene después de las tres fases en construcción.',
      paragraphs: [
        'Fase 4 · Aplicación de escritorio: empaquetar con Electron en versión mono-archivo.',
        'Fase 5 · App móvil: proyecto Android con Capacitor + GPS para domiciliarios.',
        'Fase 6 · Asistente IA: chat inteligente de inventario, costeo y clientes potenciales.',
        'Fase 7 · Despliegue: Docker Compose, Caddy HTTPS, Render y DigitalOcean.',
      ],
    },
  },
  {
    id: 'equipo',
    num: '07',
    title: 'Trabajo en equipo',
    subtitle: 'Colaboración por fases',
    accent: '#73d97a',
    body: ['Una fase = una rama = un PR', 'Revisión antes de mergear'],
    details: {
      lead: 'Cómo se construye Xupply de forma incremental y colaborativa.',
      paragraphs: [
        'Cada fase se desarrolla en una rama propia y se integra mediante Pull Requests contra main.',
        'Reglas: no mezclar fases en el mismo PR y ejecutar npm run typecheck antes de mergear.',
        'Una persona revisa el cambio antes de aprobar el merge.',
        'Nunca subir .env ni secretos al repositorio; documentar cambios en el ROADMAP.',
      ],
    },
  },
  {
    id: 'museo',
    num: '08',
    title: 'Lo mejor para el final',
    subtitle: 'Cierre · Video del proyecto',
    accent: '#ffb860',
    body: ['El cierre del recorrido', 'Reproduce el video con sonido'],
    details: {
      lead: 'El gran final del museo: el video de presentación de Xupply.',
      paragraphs: [
        'Selecciona la pantalla y pulsa reproducir para verlo con sonido.',
        'Para poner tu propio video, añade el archivo en public/media/presentacion.mp4 (o cualquier formato soportado) y recarga.',
        'Construido con React, Three.js y React Three Fiber. ¿Qué expondrás tú aquí a continuación?',
      ],
    },
    video: {
      src: '/media/presentacion.mp4',
      caption: 'Video de presentación de Xupply',
    },
  },
]

export const EXHIBIT_MAP = Object.fromEntries(EXHIBITS.map((e) => [e.id, e]))