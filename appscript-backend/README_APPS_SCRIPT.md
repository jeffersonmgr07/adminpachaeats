# Pacha Eats V3 - Backend MVP con Google Apps Script + Google Sheets

Esta carpeta prepara Pacha Eats para operar una primera etapa tipo marketplace con Google Apps Script como API y Google Sheets como base de datos temporal.

## Alcance recomendado

Apps Script puede servir para un MVP controlado con aproximadamente:

- 30 restaurantes.
- 300 a 600 clientes registrados.
- Registro y aprobación de restaurantes.
- Registro y aprobación de repartidores.
- Menús y platos por restaurante.
- Pedidos con estados.
- Cashback/recompensas.
- Panel admin básico.
- Alertas por polling, no por push real.

No es recomendable como arquitectura final para alto volumen, mapas en tiempo real o pagos masivos. Para crecimiento real se debe migrar a Node.js/Express, Supabase, Firebase o PostgreSQL.

## Flujo operativo

1. Cliente entra a Pacha Eats, selecciona productos y confirma pedido.
2. Frontend envía `createOrder` al Web App de Apps Script.
3. Apps Script guarda pedido en Sheets con estado `PENDING_RESTAURANT`.
4. Restaurante consulta/polleará sus pedidos nuevos desde su panel.
5. Restaurante acepta y define tiempo estimado.
6. Pedido cambia a `READY_FOR_RIDER_SEARCH`.
7. Apps Script calcula repartidores activos cercanos usando lat/lng.
8. Repartidores cercanos ven el pedido en su panel.
9. Primer repartidor que acepta queda asignado.
10. Pedido avanza: `RIDER_ASSIGNED`, `PICKED_UP`, `DELIVERED`.
11. Al entregar, se calcula cashback del cliente y ganancias del repartidor.

## Limitaciones importantes

- Apps Script no envía notificaciones push reales. Para MVP se usa polling cada 10 a 20 segundos.
- Google Sheets no es una base relacional. Se usa como base temporal.
- Se debe usar `LockService` para evitar que dos repartidores acepten el mismo pedido.
- Contraseñas: nunca guardar texto plano. Este ejemplo usa hash SHA-256 con salt, pero para producción conviene usar Firebase Auth, Supabase Auth o backend propio.
- Los pagos se dejan preparados para Mercado Pago, Niubiz o EasyPay, pero no se procesan directamente en esta V3.

## Archivos

- `Code.gs`: API principal.
- `Schema.gs`: creación de hojas/tablas.
- `Seed.gs`: datos iniciales de prueba.
- `APP_SCRIPT_ENDPOINTS.md`: rutas y payloads.
- `SHEETS_SCHEMA.md`: estructura de hojas.
- `DEPLOYMENT_GUIDE.md`: pasos de despliegue.

