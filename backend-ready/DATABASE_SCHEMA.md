# Esquema de base de datos sugerido

## users
- id
- role
- name
- email
- phone
- password_hash
- created_at

## restaurants
- id
- owner_user_id
- name
- ruc
- address
- latitude
- longitude
- schedule_json
- status
- commission_rate

## products
- id
- restaurant_id
- name
- description
- category
- price_pen
- image_url
- available
- prime_deal

## riders
- id
- user_id
- vehicle_type
- plate
- documents_json
- status
- current_latitude
- current_longitude

## orders
- id
- customer_id
- restaurant_id
- rider_id
- status
- subtotal_pen
- delivery_fee_pen
- discount_pen
- total_pen
- payment_status
- payment_provider
- created_at

## order_items
- id
- order_id
- product_id
- quantity
- unit_price_pen

## subscriptions
- id
- user_id
- plan
- price_pen
- status
- next_billing_at
