# INAVET — Instituto Nacional de Aprendizaje Veterinario
Plataforma Integral: Landing Page Pública y Aula Virtual Privada.

---

## 📌 Descripción del Proyecto
Este proyecto contiene la solución web completa de **INAVET**:
1. **Landing Page Pública Oficial:** Información del curso de Auxiliar Veterinario, cuerpo docente, planes, aranceles, preguntas frecuentes y contacto por WhatsApp.
2. **Aula Virtual Privada:** Plataforma de estudio protegida para alumnos y administradores con control de avance secuencial, correlatividades, materiales didácticos, exámenes con corrección automática y panel de gestión integral.

---

## 🚀 Arquitectura y Tecnologías
* **Frontend:** React 19, Vite, Tailwind CSS v4, React Router DOM v7, Lucide React.
* **Backend:** Node.js, Express (API REST modular en `/server`).
* **Base de Datos:** MongoDB Atlas mediante Mongoose.
* **Seguridad:** Autenticación JWT, contraseñas hasheadas con Bcrypt (`bcryptjs`), control de roles (`ADMIN` y `STUDENT`), validación estricta de correlatividades en servidor y contraseñas temporales con cambio obligatorio.

---

## ⚙️ Variables de Entorno (`.env`)
Crear un archivo `.env` en la raíz del proyecto basado en `.env.example`:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/inavet_aula?retryWrites=true&w=majority

# Secretos JWT
JWT_SECRET=super_secret_jwt_key_inavet_2026
JWT_EXPIRES_IN=7d

# Administrador Inicial (se crea automáticamente al iniciar el servidor)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=InavetAdmin2026!
ADMIN_EMAIL=admin@inavet.com.ar
```

---

## 💻 Instalación y Ejecución Local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar el Backend
```bash
npm run server
```
El servidor se iniciará en `http://localhost:5000`. Al conectarse por primera vez a MongoDB, inicializará automáticamente el usuario administrador y datos de prueba.

### 3. Iniciar el Frontend (Vite)
En una segunda terminal:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

---

## 🔐 Credenciales Iniciales por Defecto
* **Usuario:** `admin`
* **Contraseña:** `InavetAdmin2026!`

---

## 🎓 Funcionamiento del Aula Virtual
1. **Acceso:** Desde el botón **INGRESAR** en la barra de navegación de la landing o ingresando a `/login`.
2. **Primer Ingreso:** Todo nuevo alumno creado por el administrador posee una contraseña temporal y el indicador `mustChangePassword = true`. Al ingresar por primera vez, el sistema exige establecer una contraseña personal.
3. **Regla de Avance:** Ningún alumno puede ingresar a una clase posterior sin haber marcado como vistos todos los materiales de la clase previa y haber aprobado su examen ($\ge 70\%$). La validación se realiza en el backend mediante el servicio `canAccessLesson`.
4. **Exámenes:** Tienen corrección automática en el servidor, intentos ilimitados e historial de intentos.
5. **Panel Administrador (`/admin`):** Métricas en tiempo real, creación y edición de alumnos, reseteo de contraseñas, activación/desactivación y gestión de módulos, clases, materiales y preguntas.

---

## 🖼️ Guía de Gestión de Contenido de la Landing
El archivo principal para editar textos o imágenes de la landing es: **`src/constants/data.js`**.
* **Imágenes de carrusel:** Ubicadas en `src/assets/auxiliares/`.
* **Foto del Director:** Ubicada en `src/assets/` e importada en `src/constants/data.js`.
