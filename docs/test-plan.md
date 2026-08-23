# Plan de pruebas — Fase 1

## Frontend
- Revisar home de cliente en móvil, tablet y escritorio.
- Cambiar entre Cliente, Comercio, Repartidor y Superadmin desde "Vista demo".
- Verificar que las rutas hash funcionen al recargar en GitHub Pages.
- Verificar que botones y tarjetas no se desborden en anchos móviles.
- Verificar manifest y registro de service worker en HTTPS/localhost.

## Apps Script
- Ejecutar `setupPachaEats()` dos veces y confirmar que no duplique hojas ni configuración.
- Publicar Web App y comprobar `?action=health`.
- Enviar POST `{ "action": "ping" }` y comprobar respuesta JSON.
