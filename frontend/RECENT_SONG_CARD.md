# 🎵 Nueva Funcionalidad: RecentSongCard en Dashboard

## 📋 Descripción General

Se ha implementado una nueva funcionalidad en el Dashboard que muestra:
- **Si el usuario NO ha publicado canciones**: Card de "Subir música" (original)
- **Si el usuario SÍ ha publicado canciones**: Componente `RecentSongCard` que muestra la última canción subida

### Similar a YouTube Studio
El diseño y funcionalidad están inspirados en YouTube Studio, mostrando:
- Portada de la canción
- Título de la canción
- Estadísticas (duración, estado)
- Botón para "Ver detalles"
- Botón para "Subir otra canción"

---

## 📁 Archivos Creados/Modificados

### ✨ NUEVO: `RecentSongCard.jsx`
**Ubicación**: `frontend/src/components/studio/RecentSongCard.jsx`

**Características**:
- 📥 Obtiene las canciones del endpoint `/api/songs`
- 🎵 Extrae la última canción publicada
- 📊 Muestra estadísticas (duración, estado)
- 🖼️ Renderiza la portada o un placeholder
- 🔘 Botones interactivos (Ver detalles, Subir otra)
- ✨ Modal integrado para subir nueva canción
- 📱 Responsive design (Desktop, Tablet, Mobile)
- ⏳ Loading state con animación shimmer

**Props**: Ninguna (obtiene todo internamente)

**Estructura**:
```jsx
<RecentSongCard />
```

### ✏️ MODIFICADO: `Dashboard.jsx`
**Ubicación**: `frontend/src/components/studio/Dashboard.jsx`

**Cambios**:
- ➕ Agregado import: `import { RecentSongCard } from "./RecentSongCard";`
- 📥 Agregado state para obtener canciones: `const [songs, setSongs] = useState([])`
- 🔄 Agregado useEffect para fetch de canciones
- 🔀 Lógica condicional:
  - Si `!hasSongs`: Mostrar Card de Upload (original)
  - Si `hasSongs`: Mostrar RecentSongCard

**Flujo de datos**:
```
Dashboard.jsx
├─ Fetch: GET /api/songs
├─ Estado: songs = []
├─ Condicional: hasSongs ? <RecentSongCard /> : <Card upload />
└─ Modal: <UploadMusicModal />
```

### 🎨 MODIFICADO: `Studio.css`
**Ubicación**: `frontend/src/assets/css/Studio.css`

**Nuevas clases BEM para `.recent-song-card`:

#### Card Principal
```css
.recent-song-card
  ├─ .recent-song-card__header
  │  ├─ .recent-song-card__title
  │  └─ .recent-song-card__badge
  ├─ .recent-song-card__container
  │  ├─ .recent-song-card__image-wrapper
  │  │  ├─ .recent-song-card__image
  │  │  └─ .recent-song-card__image-placeholder
  │  └─ .recent-song-card__info
  │     ├─ .recent-song-card__content
  │     │  ├─ .recent-song-card__song-title
  │     │  └─ .recent-song-card__stats
  │     │     ├─ .recent-song-card__stat
  │     │     │  ├─ .recent-song-card__stat-label
  │     │     │  └─ .recent-song-card__stat-value
  │     └─ .recent-song-card__actions
  │        ├─ .recent-song-card__btn--view
  │        └─ .recent-song-card__btn--upload
  └─ .recent-song-card__skeleton
```

**Estilos incluidos**:
- ✨ Gradientes y sombras mejoradas
- 🎨 Animación shimmer para loading
- 📱 Media queries para responsive
- 🖱️ Hover effects y transiciones suaves
- ♿ Focus states para accesibilidad

---

## 🔄 Flujo de Datos

### 1️⃣ Cuando el usuario entra al Dashboard

```
Dashboard.jsx
  ↓
useEffect(() => {
  GET /api/songs (con token de autorización)
})
  ↓
setSongs(data.songs)
  ↓
hasSongs = songs.length > 0
```

### 2️⃣ Renderizado condicional

**Opción A**: Si `hasSongs === false`
```jsx
<Card className="studio__upload">
  <UploadMusicModal />
</Card>
```

**Opción B**: Si `hasSongs === true`
```jsx
<RecentSongCard />
  ↓
RecentSongCard.jsx
  ↓
GET /api/songs (nuevamente, para garantizar datos frescos)
  ↓
Extrae: const lastSong = data.songs[data.songs.length - 1]
  ↓
Renderiza: Card con imagen, título, estadísticas, botones
```

### 3️⃣ Acciones del usuario

**Botón "Subir otra"**:
```
RecentSongCard → setOpenModal(true)
  ↓
<UploadMusicModal isOpen={true} />
  ↓
Modal se abre en pantalla completa (con React Portal)
  ↓
Usuario sube nueva canción
  ↓
Modal cierra automáticamente
```

---

## 🎨 Diseño Visual

### RecentSongCard - Layout

```
┌─────────────────────────────────────────┐
│ Última canción subida      ✓ Publicado  │
├─────────────────────────────────────────┤
│  ┌─────────┐  ┌────────────────────┐   │
│  │         │  │ Título Canción     │   │
│  │ Imagen  │  ├────────────────────┤   │
│  │ 180px   │  │ Duración | Estado  │   │
│  │         │  ├────────────────────┤   │
│  └─────────┘  │ [Ver] [Subir otra] │   │
│               └────────────────────┘   │
└─────────────────────────────────────────┘
```

### Responsive Breakpoints

| Pantalla | Cambios |
|----------|---------|
| **Desktop** (1024px+) | Layout horizontal imagen-info |
| **Tablet** (768px-1024px) | Layout cambia a vertical |
| **Mobile** (480px-768px) | Imagen 150px, botones en fila |
| **Small Mobile** (<480px) | Botones en columna |

---

## 🔌 API Endpoints Utilizados

### Dashboard.jsx
```javascript
GET /api/songs
Headers: Authorization: Bearer {token}

Response: {
  songs: [
    {
      id: number,
      title: string,
      url: string,
      img: string (opcional),
      duration: number (segundos)
    },
    ...
  ]
}
```

### RecentSongCard.jsx
```javascript
// Mismo endpoint, extrae la última canción
const lastSong = data.songs[data.songs.length - 1];
```

---

## 🚀 Cómo Usar

### 1. Verificar que los componentes están importados
✅ Dashboard.jsx importa `RecentSongCard`
✅ RecentSongCard.jsx importa `UploadMusicModal`

### 2. El flujo es automático
- Dashboard obtiene canciones al montar
- Renderiza condicionalmente según `hasSongs`
- No requiere props adicionales

### 3. States internos
```javascript
// Dashboard.jsx
const [songs, setSongs] = useState([]); // Almacena canciones
const [loading, setLoading] = useState(true);
const [openModal, setOpenModal] = useState(false);

// RecentSongCard.jsx
const [recentSong, setRecentSong] = useState(null);
const [openModal, setOpenModal] = useState(false); // Modal propio
```

---

## ✨ Características Adicionales

### Loading State
- Muestra animación shimmer mientras carga
- "Cargando..." como texto temporal

### Error Handling
- Si hay error al obtener canciones, devuelve null
- Logs en consola para debugging

### Duración Formateada
```javascript
const formatDuration = (seconds) => {
  // 180 segundos → "3:00"
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

### Animaciones
- 🎵 Shimmer en loading
- 📸 Zoom suave en hover de imagen
- ⬆️ Transform en hover de card
- ⏱️ Transiciones smooth (150-250ms)

---

## 🧪 Testing Manual

### Caso 1: Usuario sin canciones
1. Crear usuario nuevo sin canciones
2. Ir al Dashboard
3. ✅ Debe mostrar "Subir música" card

### Caso 2: Usuario con 1+ canciones
1. Subir una canción desde el modal
2. Ver Dashboard
3. ✅ Debe mostrar RecentSongCard con la última canción
4. ✅ Botón "Subir otra" abre el modal

### Caso 3: Responsive
1. Abrir en Desktop → Layout horizontal
2. Reducir a Tablet → Layout vertical
3. Reducir a Mobile → Botones en fila o columna

---

## 📊 Estructura de Carpetas

```
frontend/src/
├── components/
│   └── studio/
│       ├── Dashboard.jsx (✏️ Modificado)
│       ├── RecentSongCard.jsx (✨ NUEVO)
│       ├── Content.jsx
│       ├── Card.jsx
│       ├── StatsCard.jsx
│       └── UploadMusicModal.jsx
├── Pages/
│   └── artista/
│       └── artist.jsx
└── assets/css/
    └── Studio.css (✏️ Modificado - estilos agregados)
```

---

## 🎯 Mejoras Futuras (Opcional)

- [ ] Botón "Ver detalles" → Modal con más estadísticas
- [ ] Click en la imagen → Ampliar imagen
- [ ] Botón de eliminar canción
- [ ] Botón de editar información de canción
- [ ] Mostraar cantidad de reproducciones
- [ ] Gráfico de estadísticas en el modal

---

**Estado**: ✅ Completado y Listo para Usar

