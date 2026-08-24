# Capacitación — Clientes de Pacha Eats

## Objetivo

Enseñar al comprador a encontrar un comercio, configurar productos, finalizar un pedido y seguir su entrega.

## Módulo 1 · Explorar

El cliente puede:

1. revisar restaurantes y promociones;
2. usar búsqueda y categorías;
3. abrir la página de un comercio;
4. revisar precios y delivery antes de continuar.

**Mensaje clave:** cada pedido del MVP pertenece a un solo comercio.

## Módulo 2 · Configurar un producto

Al pulsar **Agregar**:

- se abre el detalle del producto;
- las opciones marcadas como **Requerido** deben completarse;
- algunas opciones pueden generar recargo;
- puede aumentar la cantidad;
- puede escribir una indicación breve para el restaurante.

El total mostrado en el botón cambia automáticamente.

## Módulo 3 · Carrito

El carrito permite:

- aumentar o disminuir cantidades;
- retirar una línea;
- revisar extras elegidos;
- revisar subtotal y delivery.

Si intenta agregar un producto de otro comercio, la plataforma pedirá autorización para iniciar un carrito nuevo.

## Módulo 4 · Checkout

El cliente registra:

- nombre;
- celular;
- dirección;
- referencia;
- instrucciones de entrega;
- comprobante;
- método de pago disponible.

En la demo no se procesa dinero real.

## Módulo 5 · Seguimiento

Después de crear el pedido se muestra:

- código del pedido;
- total;
- PIN de entrega;
- botón **Seguir pedido**.

Estados visibles:

1. Pedido recibido.
2. Pedido aceptado.
3. En preparación.
4. Listo para recojo.
5. Repartidor asignado.
6. Pedido recogido.
7. En camino.
8. Entregado.

## Seguridad del PIN

El PIN debe compartirse con el repartidor **solo cuando el pedido haya sido recibido físicamente**. No debe enviarse con anticipación por chat o llamada.

## Ejercicio de capacitación

Crear un pedido de prueba en Qori Chicken, seleccionar extras, finalizar checkout, abrir el seguimiento y observar cómo cambia mientras otra persona opera el portal del restaurante y del repartidor.
