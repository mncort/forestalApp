# Error Boundaries - Guía de Uso

Los Error Boundaries son componentes de React que capturan errores JavaScript en cualquier parte del árbol de componentes hijo, registran esos errores y muestran una UI de respaldo en lugar de colapsar toda la aplicación.

## 📦 Componentes Disponibles

### 1. ErrorBoundary (Base)

Componente base genérico para cualquier uso.

```jsx
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary>
  <ComponenteQuePuedeFallar />
</ErrorBoundary>
```

**Props:**
- `children`: Componentes hijo a proteger
- `fallback`: (opcional) Función que devuelve UI personalizada `(error, reset) => JSX`
- `message`: (opcional) Mensaje personalizado de error
- `onReset`: (opcional) Función a ejecutar cuando se resetea el error

### 2. PageErrorBoundary

Error Boundary optimizado para páginas completas.

```jsx
import PageErrorBoundary from '@/components/PageErrorBoundary';

<PageErrorBoundary pageName="Productos">
  <ProductosPage />
</PageErrorBoundary>
```

**Props:**
- `children`: Página a proteger
- `pageName`: (opcional) Nombre de la página para mostrar en el error

**Características:**
- UI centrada en pantalla completa
- Botones "Volver al inicio" y "Reintentar"
- Muestra detalles del error en desarrollo

### 3. ModalErrorBoundary

Error Boundary optimizado para modales y diálogos.

```jsx
import ModalErrorBoundary from '@/components/ModalErrorBoundary';

<ModalErrorBoundary
  onClose={handleClose}
  modalName="Crear Cliente"
>
  <ClienteModalContent />
</ModalErrorBoundary>
```

**Props:**
- `children`: Contenido del modal a proteger
- `onClose`: (opcional) Función para cerrar el modal
- `modalName`: (opcional) Nombre del modal para mostrar en el error

**Características:**
- UI compacta para espacios reducidos
- Botones "Cerrar" y "Reintentar"
- Integración con el flujo de cierre del modal

## 🎯 Casos de Uso

### Proteger una página completa

```jsx
// src/app/(protected)/productos/page.jsx
import PageErrorBoundary from '@/components/PageErrorBoundary';

export default function ProductosPage() {
  return (
    <PageErrorBoundary pageName="Productos">
      <div>
        {/* Contenido de la página */}
      </div>
    </PageErrorBoundary>
  );
}
```

### Proteger un modal

```jsx
// Dentro de un componente modal
export default function ProductModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <ModalErrorBoundary
          onClose={onClose}
          modalName="Producto"
        >
          {/* Contenido del modal que puede fallar */}
          <FormularioProducto />
        </ModalErrorBoundary>
      </div>
    </div>
  );
}
```

### Proteger un componente específico

```jsx
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Proteger solo el gráfico */}
      <ErrorBoundary
        message="Error al cargar el gráfico"
        onReset={() => refetchData()}
      >
        <GraficoComplejo />
      </ErrorBoundary>

      {/* El resto del dashboard seguirá funcionando si falla el gráfico */}
      <TarjetasResumen />
    </div>
  );
}
```

### UI de error personalizada

```jsx
import ErrorBoundary from '@/components/ErrorBoundary';

const customFallback = (error, reset) => (
  <div className="alert alert-error">
    <span>¡Oops! Algo salió mal.</span>
    <button onClick={reset} className="btn btn-sm">
      Reintentar
    </button>
  </div>
);

<ErrorBoundary fallback={customFallback}>
  <MiComponente />
</ErrorBoundary>
```

## ⚠️ Limitaciones

Los Error Boundaries **NO** capturan errores en:

1. **Event handlers** (onClick, onChange, etc.)
   ```jsx
   // ❌ No capturado
   <button onClick={() => { throw new Error('Error en handler'); }}>

   // ✅ Solución: Usar try/catch en el handler
   const handleClick = () => {
     try {
       // código que puede fallar
     } catch (error) {
       toast.error('Error al procesar');
     }
   };
   ```

2. **Código asíncrono** (setTimeout, promises)
   ```jsx
   // ❌ No capturado
   useEffect(() => {
     setTimeout(() => { throw new Error('Error async'); }, 1000);
   }, []);

   // ✅ Solución: Usar try/catch o .catch()
   useEffect(() => {
     const timer = setTimeout(async () => {
       try {
         await fetchData();
       } catch (error) {
         toast.error('Error al cargar datos');
       }
     }, 1000);
     return () => clearTimeout(timer);
   }, []);
   ```

3. **Server-side rendering**

4. **Errores en el propio Error Boundary**

## 🏗️ Arquitectura Actual

```
App Layout
└── PageErrorBoundary (nivel aplicación)
    ├── Header
    ├── Sidebar
    └── Main Content
        └── PageErrorBoundary (nivel página)
            └── Page Content
                └── ModalErrorBoundary (dentro de modales)
                    └── Modal Content
```

**Capas de protección:**
1. **Nivel 1**: Error Boundary principal (protege layout completo)
2. **Nivel 2**: Error Boundary por página (protege contenido específico)
3. **Nivel 3**: Error Boundary por modal (protege modales individuales)

## 📝 Mejores Prácticas

### ✅ DO

- **Envolver páginas completas** con `PageErrorBoundary`
- **Envolver modales** con `ModalErrorBoundary`
- **Envolver componentes complejos** que hacen fetching de datos
- **Usar múltiples Error Boundaries** para aislar errores
- **Proporcionar acciones de recuperación** (reset, retry)
- **Log errores en producción** (integrar con servicio de monitoring)

### ❌ DON'T

- **No envolver cada componente pequeño** (overhead innecesario)
- **No depender solo de Error Boundaries** para todos los errores
- **No olvidar manejar errores en event handlers** con try/catch
- **No mostrar stack traces en producción**

## 🔧 Integración con Logging

Para integrar con un servicio de logging como Sentry:

```jsx
// En ErrorBoundary.jsx
componentDidCatch(error, errorInfo) {
  console.error('Error capturado:', error, errorInfo);

  // Enviar a servicio de logging
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error, { extra: errorInfo });
  }
}
```

## 🧪 Testing

Para testear Error Boundaries:

```jsx
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '@/components/ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

test('muestra UI de error cuando un componente falla', () => {
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();
});
```

## 📚 Recursos

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Error Handling in React](https://react.dev/learn/error-boundaries)
