# Almacenamiento privado INAVET

Implementación: 14 de septiembre de 2026.

## Arquitectura

- Nuevos archivos: DreamHost, fuera de la raíz pública, `/home/inavetadmin/inavet-storage/files`.
- Receptor HTTP: `/material-storage.php`; código y configuración privados en `/home/inavetadmin/inavet-storage`.
- Render autoriza y registra metadatos; MongoDB conserva referencias y materiales GridFS antiguos.
- Límite: **500.000.000 bytes (500 MB decimales)**. Fragmentos: **1.000.000 bytes**. No se cargan 500 MB en memoria.
- Presupuesto conservador del almacenamiento: 15 GB reservados por tamaños declarados; deja margen dentro del plan de 25 GB. No es una medición del consumo agregado del plan.
- Una subida pendiente por administrador durante la validez del permiso (1 hora). Reintentos dentro de la misma pestaña con el mismo archivo son idempotentes. Mantener abierta la página; no se promete reanudación después de recargar ni subida móvil en segundo plano.

## Seguridad y compatibilidad

- `STORAGE_SECRET` es una clave independiente. No publicar configuración privada ni credenciales.
- Permisos firmados acotados a operación, archivo, usuario y caducidad.
- DreamHost no transmitió Authorization a PHP durante las pruebas: se usa `X-Storage-Token`.
- Validación de extensión, tamaño, firma de contenido y hash. No sustituye un antivirus ni valida semánticamente todos los documentos Office/PDF.
- Descargas en streaming con Range, attachment y nosniff; enlace de cinco minutos. Cada nueva petición vuelve a consultar estado de cuenta y acceso a clase/módulo en Render. Una copia ya descargada no puede revocarse.
- Cancelación elimina únicamente la subida no sellada. Si ya está en finalización, reintentar Guardar.
- Al iniciar una subida se limpian temporales incompletos vencidos hace más de 24 horas. Archivos sellados o publicados nunca se eliminan por esa limpieza; fallos entre MongoDB y confirmación se recuperan repitiendo Guardar.
- Los archivos antiguos no se migraron. El borrado de materiales también elimina sus bytes; no se hizo limpieza masiva de huérfanos anteriores.

## Configuración

Render: `STORAGE_URL=https://inavet.com.ar/material-storage.php`, `STORAGE_SECRET` y `STORAGE_ENABLED=true` una vez verificadas las pruebas.

DreamHost: `config.json` privado, permisos 600; carpeta de almacenamiento 700. Contiene `secret`, `root` y `authorizeUrl`. Copia local de trabajo en `.env.storage.local` excluida de Git. Este archivo es JSON, no se carga automáticamente como dotenv.

## Pruebas realizadas

- Node: límite exacto y rechazo de exceso, nombres, rangos de fragmentos, firma, caducidad y manipulación.
- PHP CLI en DreamHost: 10 comprobaciones de integridad, tamaño, orden, reintentos y sellado.
- HTTPS desde la computadora: 10 MB en fragmentos, hash SHA256 coincidente, reintento sin duplicación; temporal eliminado.
- HTTPS desde DreamHost contra su endpoint público: 500 MB, 500 fragmentos, hash coincidente; temporal eliminado. Esto valida servidor/protocolo, no la velocidad de la conexión del cliente.
- Integración API con módulo y clase temporales INACTIVOS: registro único, finish repetido, descarga exacta, Range 206, denegación anónima. Fixtures eliminados al terminar.
- La primera prueba de 5 MB/fragmento recibió solo ~2,6 MB; por eso se redujo el tamaño a 1 MB y se repitieron las pruebas.

Pendiente de validación con el cliente: sus PowerPoint reales (especialmente el de 400 MB), dispositivos Android/iOS reales y concurrencia de muchos alumnos. No se hizo una prueba de estrés en el hosting compartido.

## Desactivación segura

Poner `STORAGE_ENABLED=false` en Render y desplegar: las nuevas cargas vuelven al límite anterior de GridFS; las descargas de materiales ya alojados en DreamHost deben mantener URL y clave configuradas. No eliminar el receptor ni la carpeta privada como mecanismo de rollback.

Respaldo visual previo al cambio: `/home/inavetadmin/inavet-backup-20260914.tar.gz`. Conservar además copias de los materiales originales fuera del hosting. El respaldo anterior no incluye materiales nuevos.
