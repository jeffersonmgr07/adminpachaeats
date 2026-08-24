# Capacitación — Dueños y personal de restaurantes

## Objetivo

Enseñar a operar pedidos de Pacha Eats sin saltarse estados y mantener información clara para cliente y repartidor.

## Roles previstos

- Dueño/administrador del comercio.
- Encargado de local.
- Empleado autorizado para pedidos.

La Fase 2 usa un acceso demo; los permisos reales se implementarán con RBAC en backend.

## Módulo 1 · Ingreso

En `restaurantes/index.html`:

1. elegir el restaurante demo;
2. ingresar con las credenciales de prueba;
3. acceder al dashboard.

## Módulo 2 · Recepción del pedido

Un pedido nuevo aparece como **Pendiente de restaurante**.

Antes de aceptarlo verificar:

- productos;
- cantidades;
- extras;
- observaciones;
- dirección;
- método de pago;
- total.

## Módulo 3 · Estados operativos

### Aceptar pedido

Usar cuando el comercio confirma que puede prepararlo.

### Iniciar preparación

Usar cuando cocina/producción comienza realmente el pedido.

### Marcar listo

Usar únicamente cuando el pedido está empaquetado y puede entregarse al repartidor.

**Importante:** marcarlo listo demasiado pronto aumenta tiempos falsos de espera para el repartidor.

## Módulo 4 · Entrega al repartidor

Cuando un repartidor acepta:

- el pedido mostrará repartidor asignado;
- preparar el paquete con identificación del pedido;
- entregar solamente al repartidor correspondiente;
- el repartidor confirmará el recojo desde su portal.

## Módulo 5 · Buenas prácticas

- Mantener productos agotados como no disponibles.
- No sustituir productos sin autorización del cliente.
- Respetar notas y modificadores.
- No cambiar manualmente importes de una orden ya creada.
- Mantener el estado lo más cercano posible a la realidad.

## Ejercicio de capacitación

1. Crear un pedido desde la web del cliente.
2. Abrir el portal del mismo restaurante.
3. Revisar extras y nota.
4. Aceptar.
5. Iniciar preparación.
6. Marcar listo.
7. Confirmar que aparece en el portal del repartidor.
