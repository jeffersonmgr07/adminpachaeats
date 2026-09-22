# Pacha Eats — Fase 2 · flujo operativo conectado

Esta versión continúa sobre el proyecto original de Pacha Eats y mantiene tres entradas separadas por rol:

- `index.html` — marketplace para clientes.
- `restaurantes/index.html` — portal de restaurantes/comercios.
- `repartidores/index.html` — portal de repartidores.
- `admin/index.html` — área administrativa existente.

## Qué se implementó en la Fase 2

### Cliente

- Modal profesional de producto.
- Variantes y complementos obligatorios u opcionales.
- Selección única o múltiple, límites máximos y recargos.
- Cantidad e indicaciones para el restaurante.
- Carrito persistente de un solo comercio.
- Resumen con subtotal, delivery y estimación de cashback.
- Checkout renovado.
- Creación de pedido demo con código `PE-XXXXXX`.
- PIN de entrega de 4 dígitos.
- Seguimiento dinámico del pedido.

### Restaurante

- Selección del restaurante demo al iniciar sesión.
- Dashboard conectado a pedidos creados desde la web del cliente.
- Flujo operativo:
  - Pendiente de restaurante.
  - Aceptado.
  - En preparación.
  - Listo para recojo.
- Visualización de productos, extras, notas, dirección, pago y total.
- Los pedidos listos quedan visibles para el repartidor.

### Repartidor

- Recepción de ofertas cuando el restaurante marca un pedido como listo.
- Aceptación de entrega.
- Confirmación de recojo.
- Cambio a `En camino`.
- Entrega validada con PIN del cliente.
- Historial demo de entregas completadas.
- Ganancia demo calculada por delivery.

## Persistencia de demostración

La Fase 2 usa `localStorage` para simular una operación compartida entre cliente, comercio y repartidor dentro del mismo navegador/origen.

Claves principales:

- `pe_cart`
- `pe_demo_orders_v2`
- `pe_last_order`
- `pe_restaurant_demo_id`

Esta capa está pensada como adaptador temporal. La siguiente integración sustituirá esta persistencia por Apps Script + Google Sheets sin cambiar el contrato visual del flujo.

## Cómo probar el circuito completo

1. Iniciar servidor local desde la raíz:

```bash
python3 -m http.server 8080
```

2. Abrir `http://localhost:8080/`.
3. Entrar a un restaurante, preferiblemente Qori Chicken.
4. Abrir un producto, seleccionar sus extras y agregarlo.
5. Ir al checkout y crear el pedido.
6. Copiar el código y observar su seguimiento.
7. Abrir `http://localhost:8080/restaurantes/` en otra pestaña.
8. Elegir el mismo restaurante utilizado en el pedido.
9. Aceptar → iniciar preparación → marcar listo.
10. Abrir `http://localhost:8080/repartidores/`.
11. Aceptar la oferta → confirmar recojo → iniciar entrega.
12. Usar el PIN mostrado en el seguimiento del cliente para confirmar la entrega.
13. Volver al seguimiento para ver el estado `Entregado`.

## Accesos demo

### Restaurante

- Correo: `restaurante@pachaeats.demo`
- Contraseña: `demo123`

### Repartidor

- Correo: `rider@pachaeats.demo`
- Contraseña: `demo123`

### Consola administrativa (v2.1.0)

Acceso en `admin/` (login por roles, contraseña `demo123`):

| Rol | Correo | Ve |
|-----|--------|----|
| Superadmin | `admin@pachaeats.demo` | Todo |
| Operaciones | `ops@pachaeats.demo` | Dashboard, Pedidos, Repartidores |
| Soporte | `soporte@pachaeats.demo` | Dashboard, Pedidos |
| Finanzas | `finanzas@pachaeats.demo` | Dashboard, Comisiones |
| Marketing | `marketing@pachaeats.demo` | Dashboard, Cupones |

Para probar la operación en vivo: crea un pedido desde la web del cliente y entra al admin (superadmin) → aparecerá en el dashboard y en Pedidos; ahí puedes ver el detalle, registrar una incidencia o cancelar con motivo. En Cupones puedes crear descuentos y en Comisiones ajustar la tasa.

Las credenciales son de demostración; la autenticación del restaurante/repartidor aún es visual y la del admin guarda la sesión solo en el navegador. No hay autenticación productiva todavía (llega en la Fase 3).

## GitHub Pages

No requiere Node ni compilación. Mantén `index.html` en la raíz del repositorio y publica desde `main / root`.

## Documentación viva

Consultar `docs/INDICE_DOCUMENTACION.md`.

La documentación incluye ficha técnica general, ficha de la Fase 2, notas de manual, material de capacitación por rol y registro de cambios.

## Próximo avance recomendado

La Fase 3 debe mover la operación de pedidos desde `localStorage` a Apps Script + Google Sheets e incorporar:

1. autenticación y sesiones por roles;
2. RBAC en backend;
3. creación de pedidos idempotente;
4. eventos históricos de estado;
5. bloqueo atómico al aceptar un reparto;
6. catálogo editable por comercio;
7. base de notificaciones;
8. preparación para Mercado Pago y Webhooks.
