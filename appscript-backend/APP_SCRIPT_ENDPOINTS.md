# Endpoints de API Apps Script

El Web App recibe POST JSON con esta forma:

```json
{
  "action": "nombreAccion",
  "payload": {}
}
```

## Auth

### registerClient
Registra cliente final.

### registerRestaurantOwner
Registra usuario restaurante en estado pendiente.

### registerRider
Registra repartidor en estado pendiente.

### login
Devuelve token y rol.

## Catálogo

### listRestaurants
Devuelve restaurantes activos.

### listProducts
Recibe `restaurant_id` y devuelve platos disponibles.

## Restaurantes

### createProduct
Crea plato del restaurante autenticado.

### updateProductAvailability
Activa o desactiva plato.

### restaurantOrders
Lista pedidos del restaurante.

### restaurantAcceptOrder
Acepta pedido y define minutos de preparación.

## Repartidores

### riderSetActive
Actualiza lat/lng y disponibilidad.

### riderNearbyOrders
Lista pedidos cercanos esperando repartidor.

### riderAcceptOrder
Asigna pedido con control de bloqueo.

### riderUpdateOrderStatus
Actualiza a recogido o entregado.

## Cliente

### createOrder
Crea pedido.

### clientOrders
Historial.

### clientRewards
Cashback y recompensas.

## Admin

### adminApproveRestaurant
Aprueba restaurante.

### adminApproveRider
Aprueba repartidor.

### adminOrders
Todos los pedidos.

### adminSetCommission
Configura comisión por restaurante o repartidor.
