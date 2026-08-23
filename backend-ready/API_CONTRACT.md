# API Contract propuesto

Base futura: `/api/v1`

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- Roles: `customer`, `restaurant`, `rider`, `admin`.

## Restaurantes
- `GET /restaurants`
- `GET /restaurants/:id`
- `POST /restaurants` admin/registro
- `PATCH /restaurants/:id`
- `PATCH /restaurants/:id/schedule`

## Productos
- `GET /products?restaurantId=`
- `POST /products`
- `PATCH /products/:id`
- `PATCH /products/:id/availability`

## Pedidos
- `POST /orders`
- `GET /orders/:id`
- `PATCH /orders/:id/status`
- Estados: `received`, `accepted`, `preparing`, `ready`, `assigned`, `delivering`, `delivered`, `cancelled`.

## Repartidores
- `POST /riders/register`
- `PATCH /riders/:id/availability`
- `POST /orders/:id/assign-rider`

## Pagos
- `POST /payments/create-preference`
- `POST /payments/webhook/mercadopago`
- `POST /payments/webhook/niubiz`
- `POST /payments/webhook/easypay`

Moneda por defecto: `PEN`.
