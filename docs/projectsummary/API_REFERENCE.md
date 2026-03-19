# API Reference Documentation

## Overview
This document provides complete documentation of all API endpoints in the Estate Practice property management system. It covers request/response formats, authentication mechanisms, error handling, and pagination rules.

---

## Base URL

```
Production: https://api.yourdomain.com
Development: http://localhost:8000/api
```

---

## Authentication

### Token-Based Authentication (API)

All API endpoints (except login/refresh) require a Bearer token.

**Header**:
```
Authorization: Bearer <your_api_token>
Content-Type: application/json
Accept: application/json
```

### Obtaining Tokens

**POST /api/auth/login**

Login and obtain access tokens.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**POST /api/auth/refresh**

Refresh an expired access token.

**Request**:
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
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
| token_expired | Access token has expired |
| token_invalid | Access token is invalid |
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

#### POST /api/auth/login
**Description**: Authenticate user and obtain tokens

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User email |
| password | string | Yes | User password |

**Response** (200):
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "landlord"
  }
}
```

#### POST /api/auth/refresh
**Description**: Refresh access token

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| refresh_token | string | Yes | Valid refresh token |

#### POST /api/auth/logout
**Description**: Invalidate current token
**Auth Required**: Yes

#### GET /api/auth/me
**Description**: Get current authenticated user
**Auth Required**: Yes

**Response** (200):
```json
{
  "id": 1,
  "name": "John Doe",
  "username": "john.doe",
  "email": "john@example.com",
  "role": "landlord",
  "tenant_id": null,
  "last_login_at": "2024-01-15T10:30:00Z"
}
```

#### GET /api/auth/sessions
**Description**: List all active sessions
**Auth Required**: Yes

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "name": "iPhone 14",
      "device_info": {
        "ip": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "device": "iPhone 14"
      },
      "last_used_at": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T08:00:00Z"
    }
  ]
}
```

#### DELETE /api/auth/sessions/{id}
**Description**: Revoke a specific session
**Auth Required**: Yes

---

### Landlord API Endpoints

#### Dashboard

##### GET /api/landlord/dashboard
**Description**: Get landlord dashboard data
**Auth Required**: Yes (landlord or admin)

**Response** (200):
```json
{
  "total_properties": 5,
  "total_units": 50,
  "occupied_units": 42,
  "vacant_units": 8,
  "occupancy_rate": 84,
  "total_tenants": 45,
  "monthly_revenue": 25000.00,
  "pending_payments": 3,
  "recent_payments": [...],
  "expiring_tenancies": [...]
}
```

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
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+255712345678",
  "emergency_contact": "+255700000000"
}
```

##### GET /api/landlord/tenants/{id}
**Description**: Get tenant details with all tenancies

##### PUT /api/landlord/tenants/{id}
**Description**: Update tenant

##### DELETE /api/landlord/tenants/{id}
**Description**: End tenant's tenancy

---

#### Payments

##### GET /api/landlord/payments
**Description**: List all payments
**Auth Required**: Yes
**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status |
| type | string | Filter by type |
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
  "payment_date": "2024-01-15",
  "due_date": "2024-01-01",
  "reference_number": "TXN123456",
  "notes": "January rent"
}
```

##### GET /api/landlord/payments/{id}
**Description**: Get payment details

##### PUT /api/landlord/payments/{id}
**Description**: Update payment

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
| status | string | Filter by status (pending, paid, partial, overdue) |
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

#### Notifications

##### GET /api/landlord/notifications
**Description**: List all notifications
**Auth Required**: Yes

##### PUT /api/landlord/notifications/{id}/read
**Description**: Mark notification as read

##### PUT /api/landlord/notifications/read-all
**Description**: Mark all notifications as read

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
  }
}
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
| status | string | Filter by status (pending, paid, partial, overdue) |

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
| GET | /landlord/tenants/{id} | LandlordTenantController | View tenant |
| PUT | /landlord/tenants/{id} | LandlordTenantController | Update tenant |
| DELETE | /landlord/tenants/{id} | LandlordTenantController | End tenancy |
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
| GET | /landlord/notifications | LandlordNotificationController | Notifications |

### Tenant Routes
| Method | Path | Controller | Description |
|--------|------|------------|-------------|
| GET | /tenant/dashboard | TenantDashboardController | Tenant dashboard |
| GET | /tenant/payments | TenantPaymentsController | Payment history |
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
  "amount": 500.00,
  "type": "rent",
  "method": "bank_transfer",
  "status": "completed",
  "payment_date": "2024-01-15",
  "due_date": "2024-01-01",
  "reference_number": "TXN123456",
  "notes": "January rent"
}
```
