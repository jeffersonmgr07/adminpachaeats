# Reglas de negocio iniciales

1. Un carrito corresponde a un solo comercio por pedido en el MVP.
2. La comisión se congela como snapshot al crear el pedido.
3. El cashback base previsto es 1% sobre subtotal elegible.
4. Pago contra entrega se habilitará tras el umbral configurable de pedidos online exitosos; valor inicial: 3.
5. Pedido, pago y delivery tendrán estados separados.
6. La aceptación futura de una oferta por repartidor será atómica con `LockService`.
7. Los valores financieros se recalcularán en backend.
8. Todo evento financiero o administrativo crítico deberá quedar auditado.
