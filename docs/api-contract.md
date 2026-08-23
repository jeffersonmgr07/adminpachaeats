# Contrato API inicial

La API MVP será una Web App de Google Apps Script. En la primera entrega existen solo endpoints de conectividad.

## GET
`?action=health`

Respuesta esperada:
```json
{
  "ok": true,
  "app": "Pacha Eats",
  "version": "0.1.0",
  "timestamp": "ISO-8601"
}
```

## POST
Body:
```json
{ "action": "ping" }
```

Respuesta:
```json
{ "ok": true, "data": { "message": "pong" } }
```

## Próximas acciones lógicas
- `auth.session`
- `catalog.home`
- `stores.list`
- `orders.create`
- `merchant.orders.list`
- `driver.offers.list`
- `admin.dashboard`
