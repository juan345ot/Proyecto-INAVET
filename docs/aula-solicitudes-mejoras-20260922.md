# Aula, materiales y solicitudes

Alcance: API compartida y frontend en Render. No se publica en DreamHost. No hay migraciones ni modificaciones de documentos existentes.

## Cambios

- Los módulos del aula comienzan plegados. La cabecera accesible permite abrir/cerrar con ratón, toque o teclado. Las actualizaciones de datos no cambian qué módulos están abiertos.
- El examen de clase exige TODOS los materiales actuales marcados como vistos, incluidos los que tengan `required: false`. Se valida tanto en GET como en POST del examen, además del botón y contador de pendientes. Una clase sin materiales no queda bloqueada por esta condición. No se borran aprobaciones anteriores.
- Crear/editar exámenes de clase permite seleccionar primero módulo y luego únicamente clases de ese módulo. Se precarga la selección al editar. Cambiar el módulo limpia la selección anterior; el servidor verifica el vínculo enviado. El módulo de filtro no se almacena como asociación de examen final.
- El banco para finales agrupa por clase, siguiendo su orden académico interno, y luego el orden de preguntas dentro de cada clase. Copiar conserva ese orden, aunque se seleccionen casillas en orden inverso.
- Solicitudes: cinco registros por página, flechas anterior/siguiente, total de páginas y solicitudes. Pendientes primero, desempate estable por fecha e ID. El endpoint antiguo sin `page` se conserva por compatibilidad.
- Actualizar solicitudes evita caché, muestra estado de carga, fecha/hora de actualización y errores, y mantiene la página actual.
- El aula actualiza los datos cada 10 segundos mientras la pestaña esté visible y también cuando recupera el foco. No recarga el documento ni elimina el estado de los módulos. Evita peticiones superpuestas y cancela al desmontar.
- Final aprobado: solo etiqueta Aprobado, sin enlace a resultados. Final con intentos agotados: botón Solicitar autorización disponible; pasa a pendiente únicamente después de enviar la nueva solicitud.

## Pruebas

Integración HTTP/MongoDB desechable: bloqueo GET/POST antes de marcar material, bloqueo parcial y al desmarcar, material no obligatorio también exigido, módulo/clase incompatible rechazado, orden de preguntas independiente del número de pregunta, paginación de siete solicitudes en dos páginas sin duplicados, páginas inválidas/fuera de rango y pruebas anteriores de permisos e intentos.

Navegador local: plegado/desplegado, autorización reflejada sin recargar, agotamiento y nueva solicitud, final aprobado sin enlace, examen bloqueado y desbloqueado al marcar material, filtro módulo/clase al crear y editar, orden por clase, flechas y actualización manual con confirmación visible.

Compatibilidad: DreamHost conserva la interfaz anterior, pero su API compartida aplica el requisito de materiales. La nueva experiencia de solicitudes y navegación se prueba en Render hasta autorizar su publicación en el hosting.
