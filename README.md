# Forestal App

Aplicación de gestión para Forestal Tigre.

## Documentación

Toda la documentación del proyecto está en la carpeta `/docs`:

- [Índice de Documentación](./docs/README.md)
- [Análisis Inicial](./docs/ANALISIS.md)
- [Plan de Refactorización](./docs/PLAN_REFACTORIZACION.md)
- [Fase 1 Completada](./docs/FASE1_COMPLETADA.md)
- [Fase 2 Completada](./docs/FASE2_COMPLETADA.md)

## Estructura del Proyecto

```
src/
├── app/              # Next.js App Router
│   ├── (protected)/  # Rutas protegidas con autenticación
│   └── (auth)/       # Rutas de autenticación
├── components/       # Componentes React
│   ├── modals/       # Modales de formularios
│   └── tables/       # Componentes de tablas
├── hooks/            # Custom hooks
│   ├── useFormModal.js   # Hook para gestión de formularios modales
│   └── useToast.js       # Hook para notificaciones
├── lib/              # Utilidades y lógica de negocio
│   ├── api/          # API de NocoDB
│   ├── calculations/ # Lógica de cálculos
│   └── utils/        # Utilidades (validaciones, formateo)
└── context/          # Context providers
```

## Stack Tecnológico

- **Framework:** Next.js 15.5.4
- **Base de Datos:** NocoDB
- **UI:** DaisyUI + Tailwind CSS
- **Iconos:** Lucide React
- **Notificaciones:** React Hot Toast

## Desarrollo

```bash
npm install
npm run dev
```

La aplicación estará disponible en http://localhost:3000

## Estado del Proyecto

El proyecto ha completado dos fases de refactorización:

- **Fase 1:** Separación de responsabilidades (API, cálculos, formateo)
- **Fase 2:** Hooks reutilizables y validaciones centralizadas

Para más detalles, consulta la [documentación completa](./docs/README.md).
