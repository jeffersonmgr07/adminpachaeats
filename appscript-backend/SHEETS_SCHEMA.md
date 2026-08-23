# Estructura de Google Sheets para Pacha Eats

Crear un Google Sheet llamado `PachaEats_DB` con estas hojas:

## Users
| user_id | role | full_name | email | phone | password_hash | salt | status | prime_status | cashback_balance | created_at | updated_at |
|---|---|---|---|---|---|---|---|---|---:|---|---|

Roles: `CLIENT`, `RESTAURANT`, `RIDER`, `ADMIN`.
Estados: `PENDING`, `ACTIVE`, `SUSPENDED`, `REJECTED`.

## Restaurants
| restaurant_id | owner_user_id | name | slug | category | phone | address | lat | lng | status | open_now | schedule_json | commission_rate | rating | created_at | updated_at |

## Products
| product_id | restaurant_id | name | description | category | price | image_url | available | prep_minutes | promo_price | created_at | updated_at |

## Riders
| rider_id | user_id | vehicle_type | vehicle_plate | vehicle_brand | vehicle_model | document_number | lat | lng | active | status | delivery_fee_base | commission_rate | created_at | updated_at |

## Orders
| order_id | client_user_id | restaurant_id | rider_id | status | subtotal | delivery_fee | discount | total | payment_method | payment_status | customer_name | customer_phone | delivery_address | delivery_lat | delivery_lng | restaurant_eta_minutes | distance_km | rider_earning | platform_commission | cashback_earned | created_at | updated_at |

Estados sugeridos:

- `PENDING_RESTAURANT`
- `ACCEPTED_BY_RESTAURANT`
- `REJECTED_BY_RESTAURANT`
- `READY_FOR_RIDER_SEARCH`
- `RIDER_ASSIGNED`
- `PICKED_UP`
- `DELIVERED`
- `CANCELLED`

## OrderItems
| item_id | order_id | product_id | product_name | quantity | unit_price | line_total | notes |

## Rewards
| reward_id | user_id | order_id | type | amount | status | created_at |

Tipos: `CASHBACK`, `COUPON`, `PRIME_BENEFIT`.

## Notifications
| notification_id | target_role | target_id | order_id | type | title | message | status | created_at | read_at |

## Sessions
| token | user_id | role | expires_at | created_at |

## AuditLog
| audit_id | actor_user_id | action | entity | entity_id | payload_json | created_at |
