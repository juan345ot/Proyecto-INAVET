# Módulos independientes y revisión de los paneles

## Alcance

- Frontend: publicar en Render, no copiar a DreamHost hasta nueva autorización.
- Backend: API actual de Render, compartida con DreamHost, autorizado por el titular después de cancelar el staging.
- Sin cambios de credenciales, almacenamiento, archivos ni cuentas reales durante las pruebas.

## Reglas

- Todos los módulos activos son independientes. No hay correlatividad global.
- Cada módulo ordena sus clases activas por `order`, fecha de creación y `_id` para resolver empates de forma determinista.
- Las clases inactivas no participan de la secuencia.
- La clase se completa con todos los materiales obligatorios vistos y su examen activo aprobado. Los materiales actuales son obligatorios.
- Sin examen activo, la clase permite estudiar pero no completar/desbloquear la siguiente.
- Las comprobaciones derivan del contenido actual y los intentos guardados, no de un antiguo `isCompleted` que pueda haber quedado desactualizado.
- GET de clase/examen, envío de respuestas y descargas mantienen autenticación, cuenta activa y correlatividad dentro del módulo.
- La validación final requiere todas las clases del mismo módulo completas. Aprobarla completa ese módulo, nunca desbloquea otro.
- Sin validación final publicada, el módulo no aparece como completado. El administrador debe configurar las evaluaciones reales y sus preguntas.
- Intentos ilimitados, corrección automática y porcentaje configurable. Se conserva el historial; el panel muestra los últimos 100 intentos por examen.
- El porcentaje de la portada mide las clases. El curso no figura finalizado hasta aprobar también las validaciones finales.

## Compatibilidad y datos

Única ampliación de esquema: `Exam.moduleId` opcional, con valor por defecto nulo. Los exámenes anteriores siguen asociados por `lessonId`. Un examen puede pertenecer a una clase o ser final de un módulo, no ambos.

No se requiere migración, renumeración ni modificación masiva. No se reescriben títulos ni progresos históricos. Las rutas conservan los campos usados por el frontend anterior. No se ejecutó ningún script destructivo ni se cargaron fixtures en Atlas.

Al cambiar materiales, estado u orden, el acceso se recalcula. Esto puede volver a bloquear clases posteriores hasta cumplir los requisitos actuales, sin borrar los intentos ya aprobados.

Para revertir código, revertir el commit de esta mejora mediante un nuevo commit y redeployar. No borrar `moduleId` ni intentos finales para volver atrás. El backend anterior no conoce evaluaciones finales y restaura la correlatividad anterior; no es una reversión académica neutra. Antes de una futura migración destructiva se requiere respaldo y prueba de restauración aparte.

## Revisión visual y editorial

- Tarjetas de módulo en slate claro con bordes suaves, clases sobre blanco.
- Textos secundarios oscurecidos, celeste de títulos pequeños sustituido por sky-700, porcentaje de progreso blanco sobre violeta más oscuro.
- Eliminados prefijos técnicos en módulos, clases y encabezado de examen de clase; títulos almacenados intactos.
- Porcentaje de aprobación de clase tomado del examen, no un 70% fijo.
- Pestañas cortas en móvil/tablet y acciones de alumnos visibles mediante tarjetas móviles.
- Formularios con desplazamiento vertical, acciones separadas de títulos largos, materiales y evaluaciones con distribución adaptable.
- Etiquetas de recursos traducidas, singular/plural corregido y diferencia explícita entre desactivar y eliminar alumno.
- "Clases creadas" describe correctamente el contador de clases totales, antes rotulado "Clases activas".
- Inspección visual en 390×844, 768×1024 y escritorio. Pruebas de escritura únicamente sobre MongoDB local descartable.

## Pruebas reproducibles

Desde la raíz del repositorio (Node 20.19+; recomendable Node 24):

```sh
npm ci
node --test tests/curriculum-rules.test.mjs
npm ci --prefix tests
node tests/modules-integration.mjs
npm run build
```

La dependencia de MongoDB de pruebas está aislada en `tests/package.json`; Render no necesita instalarla para funcionar. La primera ejecución descarga un binario de MongoDB y requiere espacio/conexión. No se carga `.env`; el test crea su propia instancia y JWT aleatorio, y los elimina al terminar.

`QA_KEEP_OPEN=true` conserva las cuentas ficticias localmente en el puerto 5000 hasta Ctrl+C para revisión con Vite. Nunca ejecutar fixtures apuntando a Atlas ni copiar sus datos a producción.

Ocho pruebas unitarias cubren independencia, materiales, exámenes, reordenamiento y finales. La integración usa rutas Express reales y MongoDB descartable para comprobar GET/POST, accesos denegados, intentos, historial, estados y controles administrativos.

## Fuera de alcance

Los títulos y textos académicos del cliente no se corrigen automáticamente: si el propio título contiene "Clase 1" se conserva literalmente. No se audita el contenido interno de PDFs, PowerPoint o videos. No se modifican los recursos de DreamHost ni se prueba una subida real de 400 MB en esta entrega.
