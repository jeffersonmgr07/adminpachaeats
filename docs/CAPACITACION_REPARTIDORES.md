# Capacitación — Repartidores Pacha Eats

## Objetivo

Enseñar a aceptar una oferta, recoger correctamente el pedido, iniciar la entrega y cerrarla mediante PIN.

## Módulo 1 · Disponibilidad

El repartidor debe estar disponible para recibir ofertas. En la Fase 2 esta condición se representa visualmente; posteriormente se validará desde backend con ubicación y documentos vigentes.

## Módulo 2 · Evaluar una oferta

La oferta muestra:

- restaurante;
- zona de recojo;
- dirección/zona de entrega demo;
- estimado;
- valor del pedido;
- ganancia de reparto demo.

Aceptar solamente si puede realizar la entrega.

## Módulo 3 · Confirmar recojo

Después de llegar al comercio:

1. verificar el código del pedido;
2. recibir el paquete correcto;
3. usar **Confirmar recojo**.

No debe marcar recogido antes de tener físicamente el pedido.

## Módulo 4 · Iniciar entrega

Al salir hacia el cliente, usar **Iniciar entrega**. El cliente verá el estado **En camino**.

## Módulo 5 · PIN de entrega

Al llegar:

1. entregar el pedido al cliente correcto;
2. solicitar el PIN de cuatro dígitos;
3. ingresarlo en el portal;
4. pulsar **Confirmar entrega**.

Un PIN incorrecto no completa el pedido.

## Buenas prácticas

- No pedir el PIN antes de la entrega.
- No compartir datos del cliente fuera de la operación.
- No marcar estados falsos para acelerar métricas.
- Reportar incidencias de dirección, seguridad o comercio.
- Mantener documentación y vehículo vigentes.

## Ejercicio de capacitación

1. Pedir al restaurante demo que marque una orden como lista.
2. Verificar que aparece como oferta.
3. Aceptar.
4. Confirmar recojo.
5. Iniciar entrega.
6. Solicitar al operador de cliente el PIN visible en tracking.
7. Confirmar la entrega.
