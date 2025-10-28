# Plan de Limpieza del Proyecto

**Fecha:** 28 de Octubre, 2025

---

## 📋 Auditoría Realizada

### Archivos Temporales/Duplicados Encontrados

1. ✅ **page_old.jsx** en presupuestos
   - Ubicación: `src/app/(protected)/presupuestos/page_old.jsx`
   - Razón: Backup del archivo original antes de refactorización
   - **Acción: ELIMINAR** ✅

2. ✅ **usePresupuestoItems.js.backup**
   - Ubicación: `src/components/modals/presupuestos/hooks/usePresupuestoItems.js.backup`
   - Razón: Backup del hook antes de dividirlo
   - **Acción: ELIMINAR** ✅

### Documentación en Raíz (7 archivos .md)

| Archivo | Tamaño | Estado | Acción |
|---------|--------|--------|--------|
| ANALISIS.md | 23KB | 📝 Actual | ✅ MOVER a /docs |
| ANALISIS_API_NOCODB.md | 8.5KB | 📝 Útil pero antiguo | ✅ MOVER a /docs/archive |
| FASE1_COMPLETADA.md | 12KB | 📝 Actual | ✅ MOVER a /docs |
| FASE2_COMPLETADA.md | 15KB | 📝 Actual | ✅ MOVER a /docs |
| FASE2_PROGRESO.md | 7.1KB | 📝 Intermedio | ✅ MOVER a /docs/archive |
| PLAN_REFACTORIZACION.md | 81KB | 📝 Actual | ✅ MOVER a /docs |
| README.md | 1.5KB | 📝 Crítico | ✅ MANTENER en raíz |

---

## 📁 Nueva Estructura Propuesta

```
forestal-app/
├── README.md                          # Mantener en raíz
├── docs/                              # Nueva carpeta de documentación
│   ├── README.md                      # Índice de documentación
│   ├── ANALISIS.md                    # Análisis inicial
│   ├── PLAN_REFACTORIZACION.md        # Plan de 3 fases
│   ├── FASE1_COMPLETADA.md            # Resumen Fase 1
│   ├── FASE2_COMPLETADA.md            # Resumen Fase 2
│   └── archive/                       # Documentos históricos
│       ├── ANALISIS_API_NOCODB.md     # Análisis antiguo de API
│       └── FASE2_PROGRESO.md          # Progreso intermedio Fase 2
├── src/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   └── lib/
└── ...
```

---

## 🗑️ Archivos a Eliminar

### 1. Backups de Código
- ❌ `src/app/(protected)/presupuestos/page_old.jsx`
- ❌ `src/components/modals/presupuestos/hooks/usePresupuestoItems.js.backup`

**Razón:** Ya tenemos la versión refactorizada funcionando y git mantiene historial.

---

## 📦 Archivos a Mover

### A /docs/ (Documentación Activa)
- ✅ ANALISIS.md
- ✅ PLAN_REFACTORIZACION.md
- ✅ FASE1_COMPLETADA.md
- ✅ FASE2_COMPLETADA.md

### A /docs/archive/ (Documentación Histórica)
- ✅ ANALISIS_API_NOCODB.md (útil pero desactualizado)
- ✅ FASE2_PROGRESO.md (documento intermedio, ya tenemos FASE2_COMPLETADA.md)

---

## ✅ Acciones Ejecutadas

1. ✅ Crear carpeta `/docs`
2. ✅ Crear carpeta `/docs/archive`
3. ✅ Eliminar `page_old.jsx`
4. ✅ Eliminar `usePresupuestoItems.js.backup`
5. ✅ Mover documentación activa a `/docs`
6. ✅ Mover documentación histórica a `/docs/archive`
7. ✅ Crear `/docs/README.md` con índice

---

## 📝 Actualización de README.md Principal

El README.md principal debe apuntar a la documentación en `/docs`:

```markdown
# Forestal App

Aplicación de gestión para Forestal Tigre.

## Documentación

Toda la documentación del proyecto está en la carpeta `/docs`:

- [Análisis Inicial](./docs/ANALISIS.md)
- [Plan de Refactorización](./docs/PLAN_REFACTORIZACION.md)
- [Fase 1 Completada](./docs/FASE1_COMPLETADA.md)
- [Fase 2 Completada](./docs/FASE2_COMPLETADA.md)

## Estructura del Proyecto

\`\`\`
src/
├── app/              # Next.js App Router
├── components/       # Componentes React
│   ├── modals/      # Modales de formularios
│   └── tables/      # Componentes de tablas
├── hooks/           # Custom hooks
├── lib/             # Utilidades y lógica de negocio
│   ├── api/         # API de NocoDB
│   ├── calculations/# Lógica de cálculos
│   └── utils/       # Utilidades (validaciones, formateo)
└── context/         # Context providers
\`\`\`

## Stack Tecnológico

- **Framework:** Next.js 15.5.4
- **Base de Datos:** NocoDB
- **UI:** DaisyUI + Tailwind CSS
- **Iconos:** Lucide React
- **Notificaciones:** React Hot Toast

## Desarrollo

\`\`\`bash
npm install
npm run dev
\`\`\`

La aplicación estará disponible en http://localhost:3000
```

---

## 🎯 Resultado Esperado

### Antes
```
forestal-app/
├── ANALISIS.md
├── ANALISIS_API_NOCODB.md
├── FASE1_COMPLETADA.md
├── FASE2_COMPLETADA.md
├── FASE2_PROGRESO.md
├── PLAN_REFACTORIZACION.md
├── README.md
├── LIMPIEZA_PROYECTO.md (este archivo)
└── src/
    └── app/(protected)/presupuestos/
        ├── page.jsx
        └── page_old.jsx  ❌
```

### Después
```
forestal-app/
├── README.md  ✨ Actualizado
├── docs/
│   ├── README.md  ✨ Nuevo índice
│   ├── ANALISIS.md
│   ├── PLAN_REFACTORIZACION.md
│   ├── FASE1_COMPLETADA.md
│   ├── FASE2_COMPLETADA.md
│   └── archive/
│       ├── ANALISIS_API_NOCODB.md
│       └── FASE2_PROGRESO.md
└── src/
    └── app/(protected)/presupuestos/
        └── page.jsx  ✅
```

**Archivos eliminados:** 2
**Archivos organizados:** 6
**Carpeta nueva:** /docs (con subcarpeta /archive)

---

## ✨ Beneficios

1. ✅ **Raíz más limpia** - Solo README.md y configuración
2. ✅ **Documentación organizada** - Toda en `/docs`
3. ✅ **Sin archivos temporales** - Backups eliminados (git mantiene historial)
4. ✅ **Histórico preservado** - Documentos antiguos en `/archive`
5. ✅ **Fácil navegación** - README.md en `/docs` como índice

---

## 📚 Documentos Finales

### Documentación Activa (/docs)
- **ANALISIS.md** - Análisis inicial del proyecto (10 problemas identificados)
- **PLAN_REFACTORIZACION.md** - Plan completo de 3 fases
- **FASE1_COMPLETADA.md** - Resumen ejecutivo Fase 1
- **FASE2_COMPLETADA.md** - Resumen ejecutivo Fase 2

### Documentación Histórica (/docs/archive)
- **ANALISIS_API_NOCODB.md** - Análisis de consumo de API (útil para referencia)
- **FASE2_PROGRESO.md** - Documento intermedio de progreso Fase 2

---

**Estado:** ✅ COMPLETADO
