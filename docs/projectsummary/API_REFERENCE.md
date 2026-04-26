# API Reference Documentation

## Overview
This document provides complete documentation of all API endpoints in the Estate Practice property management system. It covers request/response formats, authentication mechanisms, error handling, and pagination rules.

---

## Base URL

```
Production: https://api.yourdomain.com/api/v1
Development: http://localhost:8000/api/v1
```

> **Note**: All API endpoints are strictly versioned under `/api/v1/`. Unversioned routes (`/api/*`) are not registered.

---

## Authentication

### Token-Based Authentication (API)

All API endpoints (except login) require a Bearer token.

**Header**:
```
Authorization: Bearer <your_api_token>
Content-Type: application/json
Accept: application/json
```

### Obtaining Tokens

**POST /api/v1/auth/login**

Login and obtain access tokens.

**Request**:
```json
{
  "username": "user.name",
  "password": "your-password"
}
```

**Response** (200 OK):
```json
{
  "access_token": "1|ABC...",
  "token_type": "Bearer"
}
```



---

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  },
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Server Error |

### Common Error Codes

| Code | Description |
|------|-------------|
| invalid_credentials | Login credentials are incorrect |
| token_invalid | Access token is invalid or unauthorized |
| insufficient_permission | User doesn't have required permission |
| rate_limit_exceeded | Too many requests |
| resource_not_found | Requested resource doesn't exist |

---

## Pagination

All list endpoints support pagination with the following parameters:

| Parameter | Default | Max | Description |
|-----------|---------|-----|-------------|
| page | 1 | - | Page number |
| per_page | 15 | 100 | Items per page |

**Example**:
```
GET /api/landlord/tenants?page=2&per_page=25
```

**Response**:
```json
{
  "data": [...],
  "meta": {
    "current_page": 2,
    "from": 26,
    "last_page": 5,
    "per_page": 25,
    "to": 50,
    "total": 125
  }
}
```

---

## Rate Limiting

- **Session endpoints**: 30 requests per minute
- **General endpoints**: 60 requests per minute
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

---

## API Endpoints

---

### Authentication Endpoints

#### POST /api/v1/auth/login
**Description**: Authenticate user and obtain tokens

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | Yes | User username |
| password | string | Yes | User password |

**Response** (200):
```json
{
  "access_token": "1|ABC...",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "username": "john.doe",
    "email": "john@example.com",
    "role": "landlord"
  }
}
```

#### POST /api/v1/auth/register
**Description**: Register a new user and obtain tokens

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Full name |
| username | string | Yes | Unique login username |
| email | string | Yes | User email |
| password | string | Yes | Password (min 8 chars) |
| password_confirmation | string | Yes | Confirm password |

**Response** (200):
```json
{
  "access_token": "1|ABC...",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "landlord"
  }
}
```


#### POST /api/v1/auth/logout
**Description**: Invalidate current token
**Auth Required**: Yes

#### GET /api/v1/auth/me
**Description**: Get current authenticated user
**Auth Required**: Yes

**Response** (200):
```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "username": "john.doe",
    "email": "john@example.com",
    "role": "landlord",
    "phone": "+1234567890"
  }
}
```


---

### User Management Endpoints

#### GET /api/v1/users
**Description**: List all users (Landlords see their tenants, Admins see all)
**Auth Required**: Yes (admin or landlord)

#### POST /api/v1/users
**Description**: Create a new user manually
**Auth Required**: Yes (admin only)

#### GET /api/v1/users/{id}
**Description**: Get specific user details
**Auth Required**: Yes (admin or landlord owning the user's property)

#### PUT /api/v1/users/{id}
**Description**: Update user
**Auth Required**: Yes (admin only)

#### DELETE /api/v1/users/{id}
**Description**: Delete user account
**Auth Required**: Yes (admin only)

---

### Landlord API Endpoints (`/api/v1/landlord/*`)

#### Dashboard

##### GET /api/v1/landlord/dashboard
**Description**: Get landlord dashboard data
**Auth Required**: Yes (landlord or admin)

**Response** (200):
```json
{
  "total_properties": 5,
  "total_units": 50,
  "occupied_units": 42,
  "vacant_units": 8,
  "total_tenants": 45,
  "pending_payments": 3,
  "recent_payments": [
    {
      "id": 1,
      "amount": 500.00,
      "paid_at": "2024-01-15T10:30:00Z",
      "status": "paid",
      "tenant_name": "John Doe",
      "unit_code": "101"
    }
  ],
  "expiring_leases": [...],
  "pending_rent_bills": 5,
  "overdue_rent_bills": 2,
  "total_rent_outstanding": 2500.00
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| total_properties | int | Number of properties owned by landlord |
| total_units | int | Total units across all properties |
| occupied_units | int | Units currently occupied |
| vacant_units | int | Units available for rent |
| occupancy_rate | int | Percentage of occupied units |
| total_tenants | int | Total active tenants |
| monthly_revenue | decimal | Expected monthly rent revenue |
| pending_payments | int | Number of payments awaiting confirmation |
| overdue_payments | int | Number of overdue payments (past due date) |
| pending_rent_bills | int | Number of pending rent bills |
| overdue_rent_bills | int | Number of overdue rent bills |
| total_rent_outstanding | decimal | Total outstanding rent amount |
| recent_payments | array | Latest payment records (flattened with tenant_name and unit_code) |
| expiring_leases | array | Tenancies expiring in next 30 days |

#### Properties

##### GET /api/landlord/properties
**Description**: List all properties
**Auth Required**: Yes
**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search by name |
| type | string | Filter by type |
| per_page | int | Items per page |

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "name": "Sunset Apartments",
      "address": "123 Main St",
      "type": "apartment",
      "total_units": 20,
      "occupied_units": 18,
      "created_at": "2024-01-01"
    }
  ],
  "meta": {...}
}
```

##### POST /api/landlord/properties
**Description**: Create a new property
**Auth Required**: Yes (landlord or admin)

**Request**:
```json
{
  "name": "Property Name",
  "address": "Full address",
  "type": "apartment",
  "description": "Property description"
}
```

##### GET /api/landlord/properties/{id}
**Description**: Get property details
**Auth Required**: Yes

##### PUT /api/landlord/properties/{id}
**Description**: Update property
**Auth Required**: Yes (owner or admin)

##### DELETE /api/landlord/properties/{id}
**Description**: Delete property
**Auth Required**: Yes (owner or admin)

---

#### Units

##### GET /api/landlord/units
**Description**: List all units
**Auth Required**: Yes
**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| property_id | int | Filter by property |
| status | string | Filter by status |
| per_page | int | Items per page |

##### POST /api/landlord/units
**Description**: Create a new unit
**Auth Required**: Yes

**Request**:
```json
{
  "property_id": 1,
  "unit_number": "101",
  "type": "2bedroom",
  "floor": 1,
  "size_sqm": 75.5,
  "bedrooms": 2,
  "bathrooms": 1.5,
  "rent_amount": 500.00,
  "description": "Spacious 2-bedroom"
}
```

##### GET /api/landlord/units/{id}
**Description**: Get unit details

##### PUT /api/landlord/units/{id}
**Description**: Update unit

##### DELETE /api/landlord/units/{id}
**Description**: Delete unit

---

#### Tenants

##### GET /api/landlord/tenants
**Description**: List all tenants
**Auth Required**: Yes

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search by name/email |
| per_page | int | Items per page |

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+255712345678",
      "active_tenancy": {
        "id": 1,
        "unit": {
          "id": 5,
          "unit_number": "101"
        },
        "rent_amount": 500.00,
        "start_date": "2024-01-01",
        "status": "active"
      }
    }
  ],
  "meta": {...}
}
```

##### POST /api/landlord/tenants
**Description**: Create a new tenant
**Auth Required**: Yes

**Request**:
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+255712345678",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+255700000000",
  "emergency_contact_relation": "Spouse",
  "unit_id": 1,
  "move_in_date": "2024-01-01",
  "monthly_rent": 500.00,
  "rent_due_day": 5,
  "security_deposit": 1000.00
}
```

##### GET /api/landlord/tenants/{identifier}
**Description**: Get tenant details with all tenancies
**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| identifier | integer | string | Tenant ID (numeric) or tenant_code (string) |

**Note**: The endpoint accepts both numeric IDs (e.g., `1`) and tenant codes (e.g., `TEN-ABC123`). Tenant codes follow the pattern `TEN-XXXXXX` (6 alphanumeric characters) or legacy format `TEN-XXXXX` (5 alphanumeric characters). Using tenant codes is recommended for security as they prevent tenant enumeration attacks.

**Response** (200):
```json
{
  "tenant": {
    "id": 1,
    "tenant_code": "TEN-ABC123",
    "full_name": "John Doe",
    "phone": "+255712345678",
    "email": "john@example.com",
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_phone": "+255700000000"
  },
  "unit": {
    "id": 5,
    "unit_name": "Unit 101",
    "unit_code": "U101",
    "status": "occupied",
    "property": {
      "id": 1,
      "name": "Sunset Apartments",
      "address": "123 Main Street"
    }
  },
  "tenancy": {
    "id": 1,
    "status": "active",
    "move_in_date": "2024-01-01",
    "monthly_rent": 500.00,
    "security_deposit": 1000.00,
    "rent_due_day": 5
  },
  "payments": [...]
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| id | int | Tenant's unique database ID |
| tenant_code | string | Unique tenant identifier (e.g., TEN-ABC123) |
| full_name | string | Tenant's full name |
| phone | string | Contact phone number |
| email | string | Contact email |
| tenancies | array | List of all tenancies (active and historical) |
| tenancies[].status | string | Tenancy status (active, completed, expired) |
| tenancies[].unit.unit_number | string | Unit's unit number |
| tenancies[].unit.property_name | string | Property name |
| tenancies[].unit.property_address | string | Property address |

##### PUT /api/landlord/tenants/{identifier}
**Description**: Update tenant
**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| identifier | integer | string | Tenant ID (numeric) or tenant_code (string) |

**Note**: The endpoint accepts both numeric IDs (e.g., `1`) and tenant codes (e.g., `TEN-ABC123`). Using tenant codes is recommended for security.

##### DELETE /api/landlord/tenants/{id}
**Description**: End tenant's tenancy
**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Tenancy ID (this endpoint uses the tenancy ID, not tenant ID) |

---

#### Payments

##### GET /api/landlord/payments
**Description**: List all payments
**Auth Required**: Yes
**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (pending, paid, partial, overdue, cancelled) |
| type | string | Filter by type (rent, utility, deposit, penalty, other) |
| tenant_id | int | Filter by tenant |
| start_date | date | Filter start date |
| end_date | date | Filter end date |
| per_page | int | Items per page |

##### POST /api/landlord/payments
**Description**: Record a new payment
**Auth Required**: Yes

**Request**:
```json
{
  "tenancy_id": 1,
  "amount": 500.00,
  "type": "rent",
  "method": "bank_transfer",
  "status": "paid",
  "payment_date": "2024-01-15",
  "due_date": "2024-01-01",
  "reference_number": "TXN123456",
  "notes": "January rent"
}
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tenancy_id | number | Yes | Related tenancy ID |
| amount | number | Yes | Payment amount |
| type | string | Yes | 'rent', 'deposit', 'utility', 'penalty', or 'other' |
| method | string | Yes | 'cash', 'bank_transfer', 'mobile_money', 'card', or 'other' |
| status | string | Yes | 'paid', 'partial', 'overdue', or 'pending' |
| payment_date | date | Yes | Date payment was made |
| due_date | date | Yes | Date payment was due |
| reference_number | string | No | External payment reference |
| notes | string | No | Payment notes |

**Note**: For utility payments, the status will be synced with the linked utility bill's status after creation.

**Payment Integration with Rent Bills**:
For rent payments, you can optionally link a payment to a specific rent bill using `rent_bill_id`. If not provided, the system will automatically link to the current month's rent bill if one exists.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rent_bill_id | number | No | ID of the rent bill to link this payment to |

##### GET /api/landlord/payments/{id}
**Description**: Get payment details

##### PUT /api/landlord/payments/{id}
**Description**: Update payment

**Request**:
```json
{
  "amount": 500.00,
  "status": "paid",
  "payment_date": "2024-01-15",
  "reference_number": "TXN123456",
  "notes": "January rent - updated"
}
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | number | No | Payment amount |
| status | string | No | 'paid', 'partial', 'overdue', 'pending', or 'cancelled' |
| payment_date | date | No | Date payment was made |
| reference_number | string | No | External payment reference |
| notes | string | No | Payment notes |

**Note**: For utility payments, updating the status will also affect the linked utility bill's status.

---

#### Utility Types

##### GET /api/landlord/utility-types
**Description**: List all utility types
**Auth Required**: Yes

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "name": "Water",
      "unit": "cubic metres",
      "description": "Water supply",
      "is_metered": true,
      "is_active": true
    }
  ]
}
```

##### GET /api/landlord/utility-types/{id}
**Description**: Get utility type details

---

#### Tenancy Utilities (New Three-Table System)

##### GET /api/landlord/tenancies/{tenancy}/utilities
**Description**: List utilities for a tenancy
**Auth Required**: Yes

##### POST /api/landlord/tenancies/{tenancy}/utilities
**Description**: Create a new utility for a tenancy

##### GET /api/landlord/tenancy-utilities/{id}
**Description**: Get tenancy utility details

##### PUT /api/landlord/tenancy-utilities/{id}
**Description**: Update tenancy utility

##### DELETE /api/landlord/tenancy-utilities/{id}
**Description**: Delete/remove utility from tenancy

---

#### Utility Bills

##### GET /api/landlord/utility-bills
**Description**: List all utility bills with pagination and filtering
**Auth Required**: Yes

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | int | Page number (default: 1) |
| status | string | Filter by status (pending, paid, partial, overdue, cancelled) |
| property_id | int | Filter by property |
| billing_month | string | Filter by billing month (YYYY-MM) |
| from_month | string | Filter from month (YYYY-MM) |
| to_month | string | Filter to month (YYYY-MM) |
| per_page | int | Items per page (default: 15) |

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "tenancy_utility_id": 1,
      "tenancy_utility": {
        "id": 1,
        "utility_type": {
          "id": 1,
          "name": "Water",
          "unit": "cubic metres"
        },
        "tenancy": {
          "id": 1,
          "unit": {
            "unit_number": "101"
          },
          "tenant": {
            "first_name": "John",
            "last_name": "Doe"
          }
        }
      },
      "billing_month": "2026-03-01",
      "units_consumed": 25.5,
      "amount_due": 150.00,
      "amount_paid": 0,
      "due_date": "2026-03-25",
      "status": "pending",
      "notes": null,
      "created_at": "2026-03-01T00:00:00Z",
      "updated_at": "2026-03-01T00:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 50,
    "total_pages": 4
  }
}
```

##### GET /api/landlord/utility-bills/{id}
**Description**: Get utility bill details

##### PUT /api/landlord/utility-bills/{id}
**Description**: Update utility bill (e.g., record units consumed)

##### POST /api/landlord/utility-bills/{id}/waive
**Description**: Waive a utility bill

**Response** (200):
```json
{
  "message": "Utility bill waived successfully",
  "data": {
    "id": 1,
    "status": "waived",
    ...
  }
}
```

---

#### Utility Types

##### GET /api/landlord/utility-types
**Description**: List all available utility types
**Auth Required**: Yes

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "name": "Water",
      "unit": "cubic metres",
      "description": "Water supply and sewage",
      "is_metered": true,
      "is_active": true
    },
    {
      "id": 2,
      "name": "Electricity",
      "unit": "kWh",
      "description": "Electricity supply",
      "is_metered": true,
      "is_active": true
    },
    {
      "id": 3,
      "name": "Security",
      "unit": "flat rate",
      "description": "Security services",
      "is_metered": false,
      "is_active": true
    }
  ]
}
```

##### GET /api/landlord/utility-types/{id}
**Description**: Get utility type details

---

#### Rent Bills

##### GET /api/landlord/rent-bills
**Description**: List all rent bills with pagination and filtering
**Auth Required**: Yes

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | int | Page number (default: 1) |
| status | string | Filter by status (pending, paid, partial, overdue, waived) |
| property_id | int | Filter by property |
| tenant_id | int | Filter by tenant |
| per_page | int | Items per page (default: 15) |

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "billing_month": "2026-03",
      "amount_due": 500.00,
      "amount_paid": 0,
      "outstanding_amount": 500.00,
      "due_date": "2026-03-05",
      "status": "pending",
      "notes": null,
      "tenant": {
        "id": 1,
        "full_name": "John Doe",
        "tenant_code": "TNT001",
        "phone": "+255712345678",
        "email": "john@example.com"
      },
      "unit": {
        "id": 5,
        "unit_code": "101"
      },
      "property": {
        "id": 1,
        "name": "Sunset Apartments"
      },
      "created_at": "2026-03-01T00:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 50,
    "total_pages": 4
  }
}
```

##### GET /api/landlord/rent-bills/overdue
**Description**: List overdue rent bills

##### GET /api/landlord/rent-bills/pending
**Description**: List pending rent bills

##### GET /api/landlord/rent-bills/{id}
**Description**: Get rent bill details with payments
**Auth Required**: Yes

**Response** (200):
```json
{
  "data": {
    "id": 1,
    "billing_month": "2026-03",
    "amount_due": 500.00,
    "amount_paid": 0,
    "outstanding_amount": 500.00,
    "due_date": "2026-03-05",
    "status": "pending",
    "notes": null,
    "tenant": {
      "id": 1,
      "full_name": "John Doe",
      "tenant_code": "TNT001",
      "phone": "+255712345678",
      "email": "john@example.com"
    },
    "unit": {
      "id": 5,
      "unit_code": "101"
    },
    "property": {
      "id": 1,
      "name": "Sunset Apartments"
    },
    "payments": [],
    "created_at": "2026-03-01T00:00:00Z"
  }
}
```

##### POST /api/landlord/rent-bills/{id}/waive
**Description**: Waive a rent bill
**Auth Required**: Yes

**Request**:
```json
{
  "notes": "Waived due to property issues"
}
```

**Response** (200):
```json
{
  "message": "Rent bill waived successfully",
  "rent_bill": {
    "id": 1,
    "billing_month": "2026-03",
    "amount_due": 500.00,
    "amount_paid": 500.00,
    "status": "waived",
    "notes": "Waived due to property issues"
  }
}
```

---

#### Notifications

##### GET /api/landlord/notifications
**Description**: List all notifications
**Auth Required**: Yes

##### PUT /api/landlord/notifications/{id}/read
**Description**: Mark notification as read

##### PUT /api/landlord/notifications/read-all
**Description**: Mark all notifications as read

---

#### Profile & Settings

##### GET /api/landlord/profile
**Description**: Get authenticated landlord profile details
**Auth Required**: Yes (landlord role)

##### PUT /api/landlord/profile
**Description**: Update landlord's profile information
**Auth Required**: Yes (landlord role)

##### PUT /api/landlord/password
**Description**: Update landlord's password (Rate Limited: 5/min)
**Auth Required**: Yes (landlord role)

---

### Tenant API Endpoints

#### Dashboard

##### GET /api/tenant/dashboard
**Description**: Get tenant dashboard data
**Auth Required**: Yes (tenant role)

**Response** (200):
```json
{
  "tenant": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe"
  },
  "active_tenancy": {
    "id": 1,
    "unit": {
      "id": 5,
      "unit_number": "101",
      "property": {
        "name": "Sunset Apartments"
      }
    },
    "rent_amount": 500.00,
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "status": "active"
  },
  "payments": {
    "total_paid": 1500.00,
    "pending": 0,
    "recent": [...]
  },
  "rent_bills": [...],
  "current_month_bill": {...}
```

---

#### Payments

##### GET /api/tenant/payments
**Description**: Get tenant's payment history
**Auth Required**: Yes (tenant role)

**Response** (200):
```json
{
  "payments": [...],
  "tenant": {...},
  "tenancy": {
    "id": 1,
    "monthly_rent": 500.00
  },
  "pendingAmount": 0,
  "meta": {...}
}
```

##### POST /api/tenant/payments
**Description**: Create a new payment (rent or utility)
**Auth Required**: Yes (tenant role)

**Request**:
```json
{
  "amount": 150.00,
  "payment_type": "utility",
  "payment_method": "mobile_money",
  "utility_bill_id": 1,
  "reference_number": "TXN123456",
  "notes": "Water bill payment"
}
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | number | Yes | Payment amount |
| payment_type | string | Yes | 'rent' or 'utility' |
| payment_method | string | Yes | 'mobile_money' or 'bank_transfer' |
| utility_bill_id | number | No* | Required when payment_type is 'utility' |
| reference_number | string | No | External payment reference |
| notes | string | No | Payment notes |

*When payment_type is 'utility', utility_bill_id is required to link the payment to a specific utility bill.

**Payment Status Behavior**:
- For **rent payments**: Status is calculated based on amount vs. monthly rent
  - If amount >= monthly rent → 'paid'
  - If amount < monthly rent → 'partial'
  - If no payments → 'pending'
- For **utility payments**: Status is automatically synced from the linked utility bill's status after creation
  - The payment status will match the utility bill status ('pending', 'partial', 'paid', or 'overdue')

**Payment Integration with Rent Bills**:
For rent payments, you can optionally link a payment to a specific rent bill using `rent_bill_id`. If not provided, the system will automatically link to the current month's rent bill if one exists.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rent_bill_id | number | No | ID of the rent bill to link this payment to |

**Response** (201):
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "payment": {
    "id": 1,
    "amount": 150.00,
    "type": "utility",
    "status": "completed",
    "payment_date": "2026-03-19",
    "utility_bill_id": 1
  }
}
```

---

#### Utilities

##### GET /api/tenant/utilities
**Description**: Get tenant's utilities (from new tenancy_utilities table)
**Auth Required**: Yes (tenant role)

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "tenancy_id": 1,
      "utility_type_id": 1,
      "utility_type": {
        "id": 1,
        "name": "Water",
        "unit": "cubic metres",
        "is_metered": true
      },
      "amount": 50.00,
      "billing_cycle": "monthly",
      "provider": "DAWASCO",
      "account_number": "WATER123",
      "meter_number": "M12345",
      "status": "active",
      "notes": null
    }
  ],
  "tenancy": {
    "id": 1,
    "monthly_rent": 500.00
  }
}
```

##### GET /api/tenant/utility-bills
**Description**: Get tenant's utility bills with summary
**Auth Required**: Yes (tenant role)

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (pending, paid, partial, overdue, waived) |

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "tenancy_utility_id": 1,
      "tenancy_utility": {
        "id": 1,
        "utility_type": {
          "id": 1,
          "name": "Water",
          "unit": "cubic metres"
        }
      },
      "billing_month": "2026-03-01",
      "units_consumed": 25.5,
      "amount_due": 150.00,
      "amount_paid": 100.00,
      "due_date": "2026-03-25",
      "status": "partial",
      "notes": null,
      "created_at": "2026-03-01T00:00:00Z",
      "updated_at": "2026-03-15T00:00:00Z"
    }
  ],
  "summary": {
    "total_due": 450.00,
    "total_paid": 200.00,
    "total_outstanding": 250.00,
    "bill_count": 3,
    "pending_count": 2,
    "overdue_count": 1,
    "paid_count": 0
  }
}
```

---

#### Rent Bills

##### GET /api/tenant/rent-bills
**Description**: List tenant's rent bills
**Auth Required**: Yes (tenant role)

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | int | Page number (default: 1) |
| status | string | Filter by status (pending, paid, partial, overdue, waived) |
| per_page | int | Items per page (default: 15) |

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "billing_month": "2026-03",
      "amount_due": 500.00,
      "amount_paid": 0,
      "outstanding_amount": 500.00,
      "due_date": "2026-03-05",
      "status": "pending",
      "notes": null,
      "tenant": {
        "id": 1,
        "full_name": "John Doe",
        "tenant_code": "TNT001"
      },
      "unit": {
        "id": 5,
        "unit_code": "101"
      },
      "property": {
        "id": 1,
        "name": "Sunset Apartments"
      },
      "created_at": "2026-03-01T00:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 12,
    "total_pages": 1
  }
}
```

##### GET /api/tenant/rent-bills/current
**Description**: Get current month's rent bill
**Auth Required**: Yes (tenant role)

**Response** (200):
```json
{
  "data": {
    "id": 1,
    "billing_month": "2026-03",
    "amount_due": 500.00,
    "amount_paid": 0,
    "outstanding_amount": 500.00,
    "due_date": "2026-03-05",
    "status": "pending",
    "notes": null,
    "tenant": {
      "id": 1,
      "full_name": "John Doe",
      "tenant_code": "TNT001"
    },
    "unit": {
      "id": 5,
      "unit_code": "101"
    },
    "property": {
      "id": 1,
      "name": "Sunset Apartments"
    },
    "payments": []
  }
}
```

##### GET /api/tenant/rent-bills/{id}
**Description**: Get rent bill details
**Auth Required**: Yes (tenant role)

**Response** (200):
{
  "data": {
    "id": 1,
    "billing_month": "2026-03",
    "amount_due": 500.00,
    "amount_paid": 0,
    "outstanding_amount": 500.00,
    "due_date": "2026-03-05",
    "status": "pending",
    "notes": null,
    "tenant": {
      "id": 1,
      "full_name": "John Doe",
      "tenant_code": "TNT001"
    },
    "unit": {
      "id": 5,
      "unit_code": "101"
    },
    "property": {
      "id": 1,
      "name": "Sunset Apartments"
    },
    "payments": []
  }
}

---

#### Profile & Settings

##### GET /api/tenant/profile
**Description**: Get authenticated tenant's external profile details
**Auth Required**: Yes (tenant role)

##### PUT /api/tenant/profile
**Description**: Update tenant's profile information
**Auth Required**: Yes (tenant role)

##### PUT /api/tenant/password
**Description**: Update tenant's password (Rate Limited: 5/min)
**Auth Required**: Yes (tenant role)

---

## Web Routes (Inertia/Session-Based)

The web application uses Inertia.js for server-side rendering. Routes return full HTML pages.

### Authentication Routes
| Method | Path | Controller | Description |
|--------|------|------------|-------------|
| GET | /login | Laravel Fortify | Login page |
| POST | /login | Laravel Fortify | Handle login |
| POST | /logout | Laravel Fortify | Handle logout |
| GET | /register | Laravel Fortify | Registration page |
| POST | /register | Laravel Fortify | Handle registration |
| GET | /forgot-password | Laravel Fortify | Password reset request |
| POST | /forgot-password | Laravel Fortify | Send reset link |
| GET | /reset-password/{token} | Laravel Fortify | Reset password page |
| POST | /reset-password | Laravel Fortify | Handle password reset |

### Admin Routes
| Method | Path | Controller | Description |
|--------|------|------------|-------------|
| GET | /admin/dashboard | AdminDashboardController | Admin dashboard |
| GET | /admin/users | AdminUserController | User management |
| POST | /admin/users | AdminUserController | Create user |
| GET | /admin/users/{id} | AdminUserController | View user |
| PUT | /admin/users/{id} | AdminUserController | Update user |
| DELETE | /admin/users/{id} | AdminUserController | Delete user |
| POST | /admin/users/{id}/toggle-status | AdminUserController | Toggle user status |
| GET | /admin/properties | AdminPropertyController | Property management |
| POST | /admin/properties | AdminPropertyController | Create property |
| GET | /admin/properties/{id} | AdminPropertyController | View property |
| PUT | /admin/properties/{id} | AdminPropertyController | Update property |
| DELETE | /admin/properties/{id} | AdminPropertyController | Delete property |

### Landlord Routes
| Method | Path | Controller | Description |
|--------|------|------------|-------------|
| GET | /landlord/dashboard | LandlordDashboardController | Landlord dashboard |
| GET | /landlord/properties | LandlordPropertyController | Property list |
| POST | /landlord/properties | LandlordPropertyController | Create property |
| GET | /landlord/properties/{id} | LandlordPropertyController | View property |
| PUT | /landlord/properties/{id} | LandlordPropertyController | Update property |
| DELETE | /landlord/properties/{id} | LandlordPropertyController | Delete property |
| GET | /landlord/units | LandlordUnitController | Unit list |
| POST | /landlord/units | LandlordUnitController | Create unit |
| GET | /landlord/units/{id} | LandlordUnitController | View unit |
| PUT | /landlord/units/{id} | LandlordUnitController | Update unit |
| DELETE | /landlord/units/{id} | LandlordUnitController | Delete unit |
| GET | /landlord/tenants | LandlordTenantController | Tenant list |
| POST | /landlord/tenants | LandlordTenantController | Create tenant |
| GET | /landlord/tenants/{id} | LandlordTenantController | View tenant (accepts ID or tenant_code) |
| PUT | /landlord/tenants/{id} | LandlordTenantController | Update tenant (accepts ID or tenant_code) |
| DELETE | /landlord/tenants/{id} | LandlordTenantController | End tenancy (tenancy ID) |
| GET | /landlord/payments | LandlordPaymentController | Payment list |
| POST | /landlord/payments | LandlordPaymentController | Create payment |
| GET | /landlord/utilities | LandlordUtilityController | Utility list |
| GET | /landlord/utilities/{tenancy} | LandlordUtilityController | View tenancy utilities |
| GET | /landlord/tenancies/{tenancy}/utilities/create | LandlordUtilityController | Create utility form |
| POST | /landlord/tenancies/{tenancy}/utilities | LandlordUtilityController | Create utility |
| GET | /landlord/tenancy-utilities/{id}/edit | LandlordUtilityController | Edit utility form |
| PUT | /landlord/tenancy-utilities/{id} | LandlordUtilityController | Update utility |
| DELETE | /landlord/tenancy-utilities/{id} | LandlordUtilityController | Delete utility |
| GET | /landlord/utility-bills | LandlordUtilityBillController | Utility bill list |
| GET | /landlord/utility-bills/{id} | LandlordUtilityBillController | View utility bill |
| POST | /landlord/utility-bills/{id}/waive | LandlordUtilityBillController | Waive utility bill |
| GET | /landlord/rent-bills | LandlordRentBillController | Rent bill list |
| GET | /landlord/rent-bills/{id} | LandlordRentBillController | View rent bill |
| POST | /landlord/rent-bills/{id}/waive | LandlordRentBillController | Waive rent bill |
| GET | /landlord/notifications | LandlordNotificationController | Notifications |

### Tenant Routes
| Method | Path | Controller | Description |
|--------|------|------------|-------------|
| GET | /tenant/dashboard | TenantDashboardController | Tenant dashboard |
| GET | /tenant/payments | TenantPaymentsController | Payment history |
| GET | /tenant/rent-bills | TenantRentBillController | Rent bills |
| GET | /tenant/rent-bills/{id} | TenantRentBillController | View rent bill |
| GET | /tenant/utilities | TenantUtilitiesController | Utility list |
| GET | /tenant/utilities/bills | TenantUtilitiesController | Utility bills |
| GET | /tenant/notifications | TenantNotificationController | Notifications |

### Settings Routes
| Method | Path | Controller | Description |
|--------|------|------------|-------------|
| GET | /settings/profile | ProfileController | Profile settings |
| PUT | /settings/profile | ProfileController | Update profile |
| PUT | /settings/password | PasswordController | Change password |
| GET | /settings/two-factor | TwoFactorAuthenticationController | 2FA settings |
| POST | /settings/two-factor/enable | TwoFactorAuthenticationController | Enable 2FA |
| POST | /settings/two-factor/disable | TwoFactorAuthenticationController | Disable 2FA |
| DELETE | /settings/profile | ProfileController | Delete account |

---

## Data Models (API Responses)

### User Object
```json
{
  "id": 1,
  "name": "John Doe",
  "username": "john.doe",
  "email": "john@example.com",
  "role": "landlord",
  "tenant_id": null,
  "last_login_at": "2024-01-15T10:30:00Z",
  "created_at": "2023-06-01T08:00:00Z"
}
```

### Property Object
```json
{
  "id": 1,
  "owner_id": 1,
  "name": "Sunset Apartments",
  "address": "123 Main Street, City",
  "type": "apartment",
  "description": "Modern apartment complex",
  "total_units": 20,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Unit Object
```json
{
  "id": 1,
  "property_id": 1,
  "unit_number": "101",
  "type": "2bedroom",
  "floor": 1,
  "size_sqm": 75.5,
  "bedrooms": 2,
  "bathrooms": 1.5,
  "rent_amount": 500.00,
  "status": "available",
  "description": "Spacious unit with balcony",
  "features": ["parking", "balcony"]
}
```

### Tenant Object
```json
{
  "id": 1,
  "user_id": 2,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+255712345678",
  "emergency_contact": "+255700000000"
}
```

### Tenancy Object
```json
{
  "id": 1,
  "tenant_id": 1,
  "unit_id": 5,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "rent_amount": 500.00,
  "security_deposit": 1000.00,
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Payment Object
```json
{
  "id": 1,
  "tenancy_id": 1,
  "tenant_id": 1,
  "rent_bill_id": 1,
  "utility_bill_id": null,
  "amount": 500.00,
  "payment_type": "rent",
  "payment_method": "bank_transfer",
  "status": "completed",
  "payment_date": "2024-01-15",
  "due_date": "2024-01-01",
  "reference_number": "TXN123456",
  "notes": "January rent"
}
```
