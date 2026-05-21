# Postman Workflow Guide - Events API

This guide demonstrates how to test the complete checkout workflow using Postman.

## Prerequisites

1. **Postman** installed ([download here](https://www.postman.com/downloads/))
2. API server running on `http://localhost:3001`
3. Database seeded with test data

## Environment Setup in Postman

Create a new Postman **Environment** with these variables:

### For Authenticated Users (with token):

```
base_url: http://localhost:3001
token: (will be populated after login)
user_id: (will be populated after login)
```

### For Guest Users (with session):

```
base_url: http://localhost:3001
session_id: guest-session-abc123
```

---

## Complete Checkout Workflow

### **Step 1: Sign Up**

**Request:**

```
POST {{base_url}}/api/auth/signup
Headers > Content-Type: application/json

Body
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

Save the responses values for token and user_id in the Environment variables

---

### **Step 2: Get All Events**

**Request:**

```
GET {{base_url}}/api/events
Authorization: Bearer {{token}}
```

---

### **Step 3: View Current Cart (items empty initially)**

**Request:**

```
GET {{base_url}}/api/cart
Authorization: Bearer {{token}}
```


---

### **Step 4: Add First Item to Cart**

**Request:**

```
POST {{base_url}}/api/cart/items
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "eventId": 1,
  "quantity": 2
}
```

### **Step 5: Add Second Item to Cart**

**Request:**

```
POST {{base_url}}/api/cart/items
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "eventId": 2,
  "quantity": 1
}
```

---

### **Step 6: View Cart Before Checkout**

**Request:**

```
GET {{base_url}}/api/cart
Authorization: Bearer {{token}}
```

---

### **Step 7: Checkout (Create Order)**

**Request:**

```
POST {{base_url}}/api/orders/checkout
Authorization: Bearer {{token}}
Content-Type: application/json

Body (empty - no payload required)
```


**What happens:**
- ✅ Current cart marked as inactive
- ✅ Order created with all cart items
- ✅ Prices locked at time of purchase
- ✅ New empty cart auto-created for future shopping

---

### **Step 8: Verify - View All Orders**

**Request:**

```
GET {{base_url}}/api/orders
Authorization: Bearer {{token}}
```

---

### **Step 9: Get Specific Order Details**

**Request:**

```
GET {{base_url}}/api/orders/<id>
Authorization: Bearer {{token}}
```

---

## Key Workflow Features

✅ **Cart Deactivation** - Old cart is marked `is_active: false` after checkout  
✅ **New Cart Creation** - Fresh empty cart auto-created for future shopping  
✅ **Price Snapshotting** - Prices locked at `price_at_purchase` for historical integrity  
✅ **Atomic Transaction** - All operations succeed or fail together (no partial orders)  
✅ **User Authorization** - All endpoints require valid Bearer token

---
