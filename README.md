# Guía de Gestión de Contenido - INAVET

El archivo principal para realizar cambios es: **`src/constants/data.js`**.

## 🖼️ Cómo cambiar imágenes del carrusel

Para cambiar las imágenes del carrusel , tenés dos opciones:

1.  **Imágenes externas (URLs):**
    Simplemente reemplazá el texto entre comillas por el enlace de la imagen (por ejemplo, de Unsplash o de tu propio servidor).
    _Ejemplo:_ `image: "https://ejemplo.com/tu-foto.jpg"`

2.  **Imágenes locales (en el proyecto):**
    Las fotos del carrusel están en la carpeta `src/assets/auxiliares/`.
    Si querés reemplazarlas, poné la foto nueva en esa carpeta y asegurate de que el nombre coincida en las primeras líneas de `data.js` donde dice:
    `import auxiliar1 from '../assets/auxiliares/nombre-de-tu-foto.jpg';`

---

### 👨‍⚕️ Foto del Director (Dirección Académica)

Para cambiar la foto de la sección de Dirección Académica por una foto propia:

1. **Guardá la foto** nueva en la carpeta `src/assets/`.
2. **Importala** en las primeras líneas del archivo `data.js` junto a las otras imágenes:
   `import fotoDirector from '../assets/tu-nueva-foto.jpg';`
3. **Buscá** el bloque `ACADEMIC_DIRECTION_DATA` hacia el final del archivo y reemplazá el valor de `image` por el nombre del import:
   `image: fotoDirector,`

---
