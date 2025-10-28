# Análisis de Consumo de API NocoDB

## Estado Actual

### ✅ Aspectos Positivos

1. **Uso de Promise.all para cargas paralelas**
   ```javascript
   const [catsData, subcatsData, costosData] = await Promise.all([
     getCategorias(),
     getSubcategorias(),
     getCostos()
   ]);
   ```
   - ✅ Las categorías, subcategorías y costos se cargan en paralelo
   - ✅ Reduce el tiempo de espera total

2. **Debounce en la búsqueda de productos**
   ```javascript
   const timeoutId = setTimeout(() => {
     buscarProductos(searchTerm);
   }, 300);
   ```
   - ✅ Evita llamadas excesivas a la API mientras el usuario escribe
   - ✅ Solo busca después de 300ms de inactividad

3. **Límite de resultados**
   ```javascript
   let opciones = { limit: 25 };
   ```
   - ✅ Solo trae 25 productos por búsqueda
   - ✅ Reduce el payload de datos

4. **Guardado en lote (Batch)**
   - ✅ Los cambios se acumulan en memoria
   - ✅ Se guardan todos de una vez al presionar "Guardar"
   - ✅ Evita múltiples llamadas a la API

5. **Hook personalizado useNocoDB**
   - ✅ Centraliza la lógica de loading/error
   - ✅ Reutilizable en toda la aplicación

---

## ⚠️ Problemas Identificados

### 1. **Carga repetida de datos estáticos**

**Problema:**
```javascript
// Cada vez que se abre el modal, se cargan de nuevo
useEffect(() => {
  if (show && presupuesto) {
    cargarDatos(); // ← Carga categorías, subcategorías, costos
    cargarItems();
  }
}, [show, presupuesto]);
```

**Impacto:**
- Categorías, subcategorías y costos NO cambian frecuentemente
- Se recargan cada vez que abres el modal
- Desperdicio de ancho de banda
- Tiempo de espera innecesario

**Solución:** Implementar caché o contexto global

---

### 2. **Búsqueda de productos y count en cada búsqueda**

**Problema:**
```javascript
const [prods, count] = await Promise.all([
  getProductos(opciones),
  countProductos(opciones.where ? { where: opciones.where } : {})
]);
```

**Impacto:**
- 2 llamadas a la API por cada búsqueda
- El count puede ser costoso en tablas grandes

**Solución:**
- NocoDB devuelve el count en el header `X-Pagination-Count`
- Podemos usar solo una llamada

---

### 3. **Cálculos repetidos en el render**

**Problema:**
```javascript
{productos.map(prod => {
  const subcategoria = subcategorias.find(s => s.id === prod.fields.Subcategoria?.id);
  const categoria = subcategoria ? categorias.find(c => c.id === subcategoria.fields.nc_1g29__Categorias_id) : null;
  const precioCalc = calcularPrecioProducto(prod, subcategoria, categoria, costos);
  // ...
})}
```

**Impacto:**
- Se ejecuta en cada render
- Búsquedas repetidas con `.find()`

**Solución:** Usar `useMemo` para cachear los cálculos

---

### 4. **No hay caché de productos ya buscados**

**Problema:**
- Si buscas "MOLDURA", luego "CINCEL" y vuelves a "MOLDURA"
- Se hace otra llamada a la API

**Solución:** Implementar caché local de búsquedas

---

### 5. **Datos relacionados traídos por separado**

**Problema:**
```javascript
const producto = productos.find(p => p.id === item.fields.Productos?.id);
```

**Impacto:**
- Los items vienen sin el objeto completo del producto
- Requiere hacer match manual
- Puede haber inconsistencias si el producto no está en la lista

**Solución:** Usar `nested` en la API de NocoDB para traer relaciones

---

## 📊 Recomendaciones Prioritarias

### 🔴 Alta Prioridad

#### 1. Implementar Context para datos estáticos
```javascript
// src/context/CatalogContext.jsx
export const CatalogProvider = ({ children }) => {
  const { data: categorias } = useNocoDB(getCategorias);
  const { data: subcategorias } = useNocoDB(getSubcategorias);
  const { data: costos } = useNocoDB(getCostos);

  return (
    <CatalogContext.Provider value={{ categorias, subcategorias, costos }}>
      {children}
    </CatalogContext.Provider>
  );
};
```

**Beneficios:**
- ✅ Cargan una sola vez al iniciar la app
- ✅ Disponibles en todos los componentes
- ✅ Reduce ~3 llamadas API por cada apertura de modal

---

#### 2. Optimizar llamadas a getItems con relaciones

```javascript
// En lugar de:
const itemsData = await getItemsByPresupuesto(presupuesto.id);

// Usar nested para traer el producto relacionado:
const itemsData = await getItemsByPresupuesto(presupuesto.id, {
  fields: 'Cantidad,PrecioUnitario,Moneda',
  nested: {
    Productos: {
      fields: 'Nombre,SKU'
    }
  }
});
```

**Beneficios:**
- ✅ Elimina la necesidad de hacer match manual
- ✅ Datos siempre consistentes
- ✅ Menos código en el componente

---

#### 3. Usar useMemo para cálculos pesados

```javascript
const itemsConPrecios = useMemo(() => {
  return items.map(item => {
    const producto = productos.find(p => p.id === item.fields.Productos?.id);
    const precioUnitario = parseFloat(item.fields.PrecioUnitario) || 0;
    const cantidad = parseFloat(item.fields.Cantidad) || 0;
    const subtotal = precioUnitario * cantidad;

    return {
      ...item,
      producto,
      precioUnitario,
      cantidad,
      subtotal
    };
  });
}, [items, productos]);
```

**Beneficios:**
- ✅ Solo se recalcula cuando items o productos cambian
- ✅ Mejora performance del render

---

### 🟡 Media Prioridad

#### 4. Implementar caché de búsquedas

```javascript
const [searchCache, setSearchCache] = useState({});

const buscarProductos = async (termino) => {
  // Revisar caché primero
  if (searchCache[termino]) {
    setProductos(searchCache[termino].productos);
    setTotalProductos(searchCache[termino].total);
    return;
  }

  // Si no está en caché, buscar
  const [prods, count] = await Promise.all([...]);

  // Guardar en caché
  setSearchCache(prev => ({
    ...prev,
    [termino]: { productos: prods, total: count }
  }));
};
```

---

#### 5. Usar React Query o SWR

**Mejor alternativa moderna:**
```javascript
import { useQuery } from '@tanstack/react-query';

const { data: categorias } = useQuery({
  queryKey: ['categorias'],
  queryFn: getCategorias,
  staleTime: 1000 * 60 * 5, // 5 minutos
  cacheTime: 1000 * 60 * 30 // 30 minutos
});
```

**Beneficios:**
- ✅ Caché automático
- ✅ Revalidación en background
- ✅ Menos código
- ✅ Estado de loading/error manejado
- ✅ Deduplicación automática de requests

---

### 🟢 Baja Prioridad (Optimizaciones futuras)

#### 6. Paginación infinita para productos
- Cargar más productos al hacer scroll
- Mejor UX para catálogos grandes

#### 7. Prefetching
- Precargar datos que probablemente se necesiten
- Ejemplo: precargar productos al abrir el presupuesto

#### 8. IndexedDB para caché persistente
- Guardar categorías/productos en el navegador
- Funcionar offline

---

## 🎯 Plan de Acción Sugerido

### Fase 1 (Impacto Inmediato - 2-3 horas)
1. ✅ Implementar `useMemo` para `itemsConPrecios`
2. ✅ Crear `CatalogContext` para categorías/subcategorías/costos
3. ✅ Optimizar queries con `nested` para relaciones

### Fase 2 (Mejora Considerable - 4-6 horas)
4. ✅ Implementar React Query
5. ✅ Caché de búsquedas de productos
6. ✅ Optimizar count de productos (usar headers)

### Fase 3 (Nice to Have - Futuro)
7. Paginación infinita
8. Prefetching inteligente
9. IndexedDB para offline

---

## 📈 Métricas Esperadas

### Antes de optimizaciones:
- **Tiempo de carga del modal:** ~2-3 segundos
- **Llamadas API por apertura:** 5-6 requests
- **Re-renders:** Alto (sin memoization)

### Después de Fase 1:
- **Tiempo de carga del modal:** ~0.5-1 segundo
- **Llamadas API por apertura:** 1-2 requests
- **Re-renders:** Reducido significativamente

### Después de Fase 2:
- **Tiempo de carga del modal:** ~0.2-0.5 segundos
- **Llamadas API por apertura:** 0-1 requests (caché)
- **Experiencia:** Instantánea

---

## 🔍 Herramientas de Monitoreo Recomendadas

1. **React DevTools Profiler**
   - Identificar componentes lentos
   - Ver re-renders innecesarios

2. **Network Tab (Chrome DevTools)**
   - Monitorear todas las llamadas API
   - Identificar duplicados

3. **React Query DevTools**
   - Si implementas React Query
   - Ver estado del caché

---

## 💡 Conclusión

El código actual está **bien estructurado** y usa algunas buenas prácticas como:
- Promise.all para paralelización
- Debounce en búsquedas
- Guardado en lote

Sin embargo, hay **oportunidades significativas de optimización**:
- ⚡ Caché de datos estáticos (categorías, subcategorías, costos)
- ⚡ Memoization de cálculos
- ⚡ Reducción de llamadas API redundantes

**Implementando solo la Fase 1 podrías reducir el tiempo de carga en un 60-70%.**
