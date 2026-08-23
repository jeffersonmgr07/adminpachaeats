# Plan técnico: Pacha Eats con Google Apps Script

## Veredicto

Sí puede funcionar para la primera etapa con 30 restaurantes y 300 a 600 clientes, siempre que se trabaje como MVP controlado y no como app de alto tráfico en tiempo real.

## Arquitectura V3

- Frontend: GitHub Pages, HTML, CSS y JavaScript.
- Backend temporal: Google Apps Script Web App.
- Base temporal: Google Sheets.
- Autenticación: login propio básico por email/password hasheado.
- Alertas: polling cada 10 a 20 segundos.
- Geolocalización: navegador obtiene lat/lng y Apps Script calcula cercanía.
- Pagos: preparado para Mercado Pago, Niubiz o EasyPay.

## Qué sí hacer con Apps Script

- Registro de clientes, restaurantes y repartidores.
- Aprobación manual desde admin.
- Menús y platos.
- Pedidos.
- Estados de pedido.
- Cashback simple.
- Reportes básicos.
- Cupones.
- Asignación semi-automática de repartidor cercano.

## Qué no conviene exigirle

- Tracking en vivo segundo a segundo.
- Notificaciones push nativas tipo app.
- Alto volumen de pedidos simultáneos.
- Motor complejo de rutas.
- Pagos críticos sin backend seguro adicional.

## Estrategia recomendada

### Etapa 1
Apps Script + Sheets + pagos manuales Yape/Plin/efectivo.

### Etapa 2
Apps Script + pasarela de pago y webhooks controlados.

### Etapa 3
Migrar a backend real: Node.js + PostgreSQL/Supabase/Firebase.
