# Guía de Espaciado para Vistas con NavBar

## Estructura del NavBar
- **Altura fija**: 5rem (80px)
- **Posición**: fixed top
- **Z-index**: 1000
- **Presente en**: Todas las vistas excepto LandingView

## Espaciado Requerido

### Para Headers de Vista
```css
.view-header {
  padding: 7rem 0 4rem; /* 7rem = 5rem NavBar + 2rem espacio */
}
```

### Para Content Principal
```css
.view-content {
  padding-top: 7rem; /* 7rem = 5rem NavBar + 2rem espacio */
}
```

### Para Cards y Elementos Flotantes
```css
.floating-card {
  margin-top: 7rem; /* Para elementos que no son headers */
}
```

## Vistas Actuales - Estado del Espaciado

### ✅ Correctamente Configuradas
- **RegisterView**: `top: 5rem; height: calc(100vh - 5rem)`
- **LoginView**: `top: 5rem; height: calc(100vh - 5rem)`
- **VerifyTokenView**: `top: 5rem; height: calc(100vh - 5rem)`
- **ModelsView**: `padding: 10rem 0 4rem` (header)
- **ModelDetailView**: `padding: 10rem 0 4rem` (header)
- **HomeView**: `padding-top: 8rem` (content)
- **AboutView**: `padding-top: 8rem` (content)
- **DashboardView**: `margin-top: 7rem` (header)

### Patrones de Espaciado por Tipo de Vista

#### 1. Vistas de Autenticación (Centradas)
```css
.auth-container {
  position: fixed;
  top: 5rem; /* Debajo del NavBar */
  height: calc(100vh - 5rem); /* Altura disponible */
  display: flex;
  align-items: center;
  justify-content: center;
}
```

#### 2. Vistas con Header Grande
```css
.view-header {
  padding: 10rem 0 4rem; /* Extra espacio para efectos visuales */
}
```

#### 3. Vistas con Content Simple
```css
.view-content {
  padding-top: 7rem; /* Espaciado estándar */
}
```

#### 4. Vistas con Cards Flotantes
```css
.dashboard-header {
  margin-top: 7rem; /* Para elementos tipo card */
}
```

## Responsive Breakpoints

### Mobile (< 768px)
- Reducir espaciado a 6rem para ahorrar espacio vertical
- NavBar mantiene 5rem pero el contenido puede tener menos padding

### Tablet (768px - 1024px)
- Mantener espaciado estándar de 7rem

### Desktop (> 1024px)
- Puede aumentar a 8rem-10rem para mejor estética

## Checklist para Nuevas Vistas

1. **¿La vista tiene NavBar?** → Sí (todas excepto landing)
2. **¿Qué tipo de layout usa?**
   - Centrado → usar patrón auth
   - Header + Content → usar patrón header
   - Card flotante → usar patrón dashboard
3. **¿Aplicar espaciado base?** → 7rem mínimo
4. **¿Necesita responsive?** → Reducir en mobile
5. **¿Probar en todos los tamaños?** → Sí, siempre

## Clases Utility Disponibles

```css
/* En views-layout.css */
.navbar-spacing-top { padding-top: 5rem; }
.navbar-spacing-margin { margin-top: 5rem; }
.navbar-spacing-content { padding-top: 7rem; }
.view-header { padding: 7rem 0 4rem; }
.view-content { padding-top: 7rem; }
```

## Comandos de Verificación

```bash
# Buscar vistas sin espaciado
grep -r "padding-top" src/views/

# Buscar headers sin espaciado
grep -r "\..*-header" src/views/

# Verificar todas las vistas
find src/views/ -name "*.vue" | xargs grep -l "NavBar"
```
