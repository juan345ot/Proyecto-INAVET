# Registro de Cambios (CHANGELOG) — INAVET

## [1.0.0] - 2026-09-03

### Agregado
- **Integración de Aula Virtual Completa** sin modificar ni alterar la landing page aprobada en producción.
- **Backend Node.js + Express** en la carpeta `/server` con arquitectura modular (rutas, controladores, modelos, middlewares y servicios).
- **Modelos Mongoose para MongoDB Atlas:**
  - `User`: soporte para roles `ADMIN` y `STUDENT`, estado `ACTIVE`/`INACTIVE`, `mustChangePassword`, `lastLogin` y contraseñas seguras con bcrypt.
  - `Module`, `Lesson`, `Material`, `Exam`, `Question`: estructura jerárquica del curso.
  - `StudentProgress`: control individual de progreso por clase y alumno.
  - `ExamAttempt`: historial de intentos con intentos ilimitados.
- **Lógica de Bloqueo y Correlatividad en Backend (`canAccessLesson`):**
  - Validación de clases bloqueadas directamente en servidor para evitar omisiones por manipulación de URL.
  - Condición de clase completada: Todos los materiales vistos + Examen aprobado ($\ge 70\%$).
- **Corrección Automática de Exámenes:**
  - Envío de preguntas protegidas (sin revelar la respuesta correcta al cliente).
  - Cálculo de aciertos y porcentaje en servidor.
  - Desbloqueo inmediato de la clase siguiente tras aprobar.
- **Frontend Educativo:**
  - Vistas de `Login`, `ChangePassword`, `StudentHome` ("Continuar donde lo dejaste", porcentaje de avance, módulos y clases bloqueadas/disponibles), `StudentLesson` (video embebido y checks persistentes) y `StudentExam`.
  - Panel de Administración (`/admin`): Dashboard de métricas, ABM de alumnos, reset de contraseñas temporales y monitoreo de módulos, clases y exámenes.
  - Protección de rutas en frontend con `ProtectedRoute` y estado global con `AuthContext`.
- **Integración con la Landing:**
  - Agregado del botón **INGRESAR** al Navbar desktop y mobile con la estética institucional de INAVET.
- **Documentación Completa:**
  - `.env.example`, `README.md`, `CHANGELOG.md` y `PROJECT_REPORT.md`.
