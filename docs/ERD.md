# ERD

## Scope

This v2 ERD includes:

- user
- event (domain item)
- cart (supports authenticated and unauthenticated users)
- cart_item
- order
- order_item

## Design Decisions

- `cart.user_id` is **nullable** — a cart can be created without a logged-in user (guest/session cart)
- `cart.session_id` is **nullable** — populated for unauthenticated carts to track the guest session; cleared when the cart is claimed by a user
- `cart.is_active` enforces the **one active cart per authenticated user** rule (unique constraint on `user_id` where `is_active = true`)
- `cart_item` uses a **simple single primary key** (`id PK`) — the project default
- `order.user_id` is **required** — orders can only be placed by authenticated users

## Project Diagram

```mermaid
erDiagram
    USER ||--o{ EVENT : creates
    USER ||--o{ "ORDER" : places
    USER |o--o| CART : has_active_cart

    USER {
        int id PK
        string name
        string email
    }

    EVENT {
        int id PK
        int created_by_user_id FK
        decimal price
        string currency
        string title
        text description
        datetime created_at
        datetime updated_at
    }

    CART ||--|{ CART_ITEM : contains
    CART_ITEM }o--|| EVENT : references
    CART {
        int id PK
        int user_id FK
        string session_id
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    CART_ITEM {
        int id PK
        int cart_id FK
        int event_id FK
        int quantity
        decimal price_at_addition
        string currency
        datetime added_at
    }

    "ORDER" ||--|{ ORDER_ITEM : contains
    ORDER_ITEM }o--|| EVENT : references
    "ORDER" {
        int id PK
        int user_id FK
        decimal total_price
        string currency
        datetime created_at
        datetime updated_at
    }

    ORDER_ITEM {
        int id PK
        int order_id FK
        int event_id FK
        int quantity
        decimal price_at_purchase
        string currency
    }
```
