# Exámenes finales y autorizaciones — 22/09/2026

## Alcance

API compartida en Render y frontend de Render. No se publica el frontend en DreamHost.
El sitio de DreamHost conserva su interfaz anterior, pero comparte las nuevas validaciones de API. Para solicitar y administrar permisos de finales se debe usar el frontend de Render hasta autorizar su publicación en DreamHost.

## Uso

- Cuatro pestañas: Curso, Exámenes de clases, Exámenes finales, Alumnos.
- Un único final por módulo, incluso si está inactivo. Editar el existente; el selector y el servidor impiden duplicados.
- En Exámenes finales se configura módulo, título, publicación, porcentaje y 1–100 intentos por autorización (predeterminado: 3).
- El cupo incluye el primer intento: 3 significa primer intento más 2 reintentos. Los exámenes de clase conservan intentos ilimitados.
- Desde Gestionar preguntas se copian preguntas de exámenes de clase del mismo módulo y se agregan preguntas nuevas. Las copias son independientes; copiar de nuevo la misma pregunta no la duplica.
- Al completar los materiales obligatorios y exámenes de todas las clases del módulo, el alumno solicita autorización.
- En Alumnos, Autorizaciones de exámenes finales permite aprobar o revocar cada permiso alumno/examen. Se priorizan solicitudes pendientes; se muestran las últimas 1000.
- Cada aprobación abre un ciclo con el límite vigente. Cambiar la configuración no altera cupos ya otorgados. Al agotarlo sin aprobar, el alumno vuelve a solicitar autorización; no se borran intentos anteriores.
- Aprobar el final termina ese módulo y no desbloquea otros. Los módulos siguen siendo independientes.
- Continuar donde lo dejaste muestra el título del módulo y el título original de la clase, sin numeración añadida.

## Datos y concurrencia

Se agregan FinalAuthorization (índice único alumno/examen, estado, cupo, ciclo e historial), Exam.maxAttemptsPerAuthorization, ExamAttempt.authorizationCycle y Question.sourceQuestionId. No se reescriben títulos, preguntas, intentos ni progreso existentes.
Una transacción MongoDB consume el intento y guarda su resultado de forma atómica; envíos simultáneos no exceden el cupo. Requiere replica set, disponible en Atlas. Los finales aprobados previamente siguen aprobados.

## Corrección del índice lessonId_1

El índice único antiguo incluía null y por eso impedía tener varios exámenes sin clase asociada. Se sustituye por índices únicos parciales para asociaciones ObjectId reales de lessonId y moduleId.

Comando manual desde la raíz del repositorio (nunca se ejecuta al iniciar la aplicación):

```powershell
$env:MIGRATION_ENV_FILE='ruta/al/.env'
node scripts/migrations/exam-association-indexes.mjs
$env:INDEX_BACKUP_PATH='ruta/segura/exam-indexes-before.local'
node scripts/migrations/exam-association-indexes.mjs --apply
```

La simulación informa base, índices y cantidad de documentos. Aborta ante asociaciones reales duplicadas. La aplicación exige un respaldo nuevo de las definiciones de índices; crea los índices parciales antes de retirar únicamente el índice antiguo conocido. Modifica cero documentos. Es idempotente usando otro nombre de respaldo en cada ejecución.

Para revertir código, conservar los índices parciales. No recrear automáticamente lessonId_1: luego de crear varios finales/null volvería a fallar. El respaldo documenta la definición previa; restaurarla solo después de una revisión manual de compatibilidad, nunca borrando exámenes para satisfacer el índice antiguo.

## Verificación

- Ocho pruebas puras de correlatividad y materiales.
- Integración HTTP con MongoDB local replica set: módulos independientes, usuarios inactivos, solicitudes, autorización, revocación, cupos, carrera de envíos, renovación, historial y copia de preguntas restringida al módulo.
- Migración local: simulación sin cambios, dos ejecuciones idempotentes, conservación de documentos y unicidad de ambas asociaciones.
- Navegador local: creación de final, módulos ocupados deshabilitados, copia de preguntas, autorización, dos intentos fallidos, bloqueo y nueva solicitud. Revisión móvil, tablet y escritorio.
- Compilación de producción Vite.

Las pruebas son locales y desechables. No usar alumnos reales para consumir intentos o alterar su progreso durante verificaciones.
