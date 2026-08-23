# Notas para integración de pagos en Perú

La V1 deja el checkout simulado y el contrato listo para conectar una pasarela desde backend.

## Proveedores considerados
- Mercado Pago
- Niubiz
- EasyPay
- Pagos manuales iniciales: Yape, Plin, efectivo, transferencia.

## Recomendación de implementación
1. El frontend crea el pedido en `/api/v1/orders`.
2. El backend calcula total en soles (`PEN`).
3. El backend crea la intención/preferencia de pago con el proveedor.
4. El frontend redirige o muestra formulario del proveedor.
5. El proveedor llama al webhook.
6. El backend actualiza `payment_status` y libera el pedido al restaurante.

## Importante
Nunca colocar claves secretas de pasarela en JavaScript del navegador. Las credenciales deben vivir en variables de entorno del backend.
