# Project Architecture

## Overview
This is a Laravel 12 + React 19 full-stack property management application called "Estate Practice". It provides a multi-tenant property management system with three user roles: Admin, Landlord, and Tenant.

## Technology Stack

### Backend
- **Framework**: Laravel 12.x
- **PHP Version**: 8.2+
- **Authentication**: Laravel Fortify (web), Laravel Sanctum (API)
- **Server-Side Rendering**: Inertia.js with React 19

### Frontend (Web)
- **UI Framework**: React 19 with TypeScript
- **Styling**: TailwindCSS 4.0 with CSS variables
- **Component Library**: shadcn/ui (New York style, neutral base color, lucide icons)
- **Charts**: Recharts
- **Build Tool**: Vite 7.0.4

### Mobile (React Native/Expo)
- **Framework**: React Native with Expo
- **Target**: iOS and Android
- **State Management**: React Context for auth, React Query for server state
- **Navigation**: React Navigation with bottom tabs and nested stacks
- **UI Component Strategy**: Hybrid approach using `react-native-paper` for foundational elements and custom `react-native-reanimated` components (like Skeleton Loaders) for polished interfaces.

## Mobile App Screens

### Tenant Screens
```
mobile/src/screens/tenant/
├── DashboardScreen.tsx         # Tenant dashboard with tenancy overview
├── PaymentsScreen.tsx          # Payment history and status
├── MakePaymentScreen.tsx       # Make rent or utility payments
├── UtilitiesScreen.tsx         # List of assigned utilities
├── UtilityBillsScreen.tsx      # View utility bills with summary
├── RentBillsScreen.tsx         # View rent bills with summary (NEW)
├── RentBillDetailsScreen.tsx   # View rent bill details with payment history (NEW)
├── ProfileScreen.tsx          # Tenant profile management
├── EditProfileScreen.tsx      # Tenant profile and password update (NEW)
└── LoginScreen.tsx            # Authentication
```

### Landlord Screens
```
mobile/src/screens/landlord/
├── DashboardScreen.tsx         # Landlord dashboard with metrics
├── PropertiesScreen.tsx        # Property management
├── PropertyDetailsScreen.tsx  # Property details and units
├── UnitsScreen.tsx            # Unit management
├── TenantsScreen.tsx          # Tenant list
├── TenantDetailsScreen.tsx    # Tenant details with utilities button
├── TenancyUtilitiesScreen.tsx # Manage utilities for a tenancy
├── PaymentsScreen.tsx         # Payment history
├── UtilityBillsScreen.tsx     # View and manage tenant utility bills
├── RentBillsScreen.tsx        # View and manage rent bills (NEW)
├── RentBillDetailsScreen.tsx  # View/edit rent bill details (NEW)
├── AddTenantScreen.tsx        # Handle complex tenant creation
├── ProfileScreen.tsx         # Landlord profile management
├── EditProfileScreen.tsx     # Landlord profile and password update (NEW)
└── LoginScreen.tsx           # Authentication
```

### Navigation Structure
- Bottom tab navigation for main sections
- Nested stack navigators for detail screens
- Modal screens for forms (add/edit utilities, bills)

**New Navigation Routes (Rent Bills):**
- Tenant Payments Stack: `RentBills`, `RentBillDetails`
- Landlord Payments Stack: `RentBills`, `RentBillDetails`
- MakePayment Screen: Now accepts optional `rentBillId` parameter

**Splash Screen Logic:**
- `SplashScreen.tsx`: Custom animated entry screen with "Deep Teal & Gold" branding.
- **Background Loading Pattern**: The main app navigator mounts *behind* the splash overlay to pre-fetch data and pre-render components during the animation, ensuring a flicker-free transition.

### API Client Structure
```
mobile/src/
├── api/
│   ├── client.ts              # Axios instance with interceptors
│   ├── landlord.ts            # Landlord API endpoints
│   └── tenant.ts              # Tenant API endpoints
├── types/
│   └── index.ts               # TypeScript type definitions (Consolidated User Updates)
├── components/
│   ├── SplashScreen.tsx       # Elegant animated entry screen (NEW)
│   └── profile/
│       └── ChangePasswordForm.tsx # Reusable nested password update UI (NEW)
├── hooks/
│   └── useAddTenant.ts        # Custom abstraction hook for tenant additions (NEW)
└── utils/
    └── statusColors.ts        # Status color utility for bills/payments (NEW)
```

### Key API Endpoints Used by Mobile

**Tenant API** (`/api/tenant/*`):
- `GET /tenant/dashboard` - Dashboard data with rent bill summary
- `GET /tenant/payments` - Payment history with pending amount
- `POST /tenant/payments` - Create payment (rent/utility) with optional rent_bill_id
- `GET /tenant/utilities` - List assigned utilities with tenancy info
- `GET /tenant/utility-bills` - List utility bills with summary
- `GET /tenant/rent-bills` - List tenant's rent bills with summary (NEW)
- `GET /tenant/rent-bills/current` - Get current month's rent bill (NEW)
- `GET /tenant/rent-bills/{id}` - Get rent bill details (NEW)
- `GET /tenant/profile` - Get authenticated tenant profile
- `PUT /tenant/profile` - Update profile particulars
- `PUT /password` - Update password (Shared Universal Controller)

**Landlord API** (`/api/landlord/*`):
- `GET /landlord/dashboard` - Dashboard metrics with rent bill stats
- `GET /landlord/utility-types` - List all utility types
- `GET /landlord/utility-bills` - List all utility bills (paginated)
- `PUT /landlord/utility-bills/{id}` - Update utility bill
- `POST /landlord/utility-bills/{id}/waive` - Waive a bill
- `GET /landlord/tenancies/{id}/utilities` - List tenancy utilities
- `POST /landlord/tenancies/{id}/utilities` - Add utility to tenancy
- `PUT /landlord/tenancy-utilities/{id}` - Update tenancy utility
- `DELETE /landlord/tenancy-utilities/{id}` - Remove utility from tenancy
- `GET /landlord/rent-bills` - List all rent bills with filtering (NEW)
- `GET /landlord/rent-bills/{id}` - Get rent bill details with payments (NEW)
- `POST /landlord/rent-bills/{id}/waive` - Waive a rent bill (NEW)
- `GET /landlord/rent-bills/overdue` - List overdue rent bills (NEW)
- `GET /landlord/rent-bills/pending` - List pending rent bills (NEW)
- `GET /landlord/profile` - Get authenticated landlord profile
- `PUT /landlord/profile` - Update landlord details
- `PUT /password` - Update password (Shared Universal Controller)

### Mobile TypeScript Types

Key types defined in `mobile/src/types/index.ts`:

```typescript
// Utility Bill - represents a monthly charge for a utility
interface UtilityBill {
  id: number;
  tenancy_utility_id: number;
  billing_month: string;
  units_consumed: number | null;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'waived';
  notes: string | null;
  tenancy_utility?: {
    id: number;
    utility_type: UtilityType | null;
    // ... other tenancy utility fields
  };
}

// Utility Bill Summary - aggregated statistics for tenant
interface UtilityBillSummary {
  total_due: number;
  total_paid: number;
  total_outstanding: number;
  bill_count: number;
}

// Rent Bill - represents a monthly rent charge (NEW)
type RentBillStatus = 'pending' | 'paid' | 'partial' | 'overdue' | 'waived';

interface RentBill {
  id: number;
  tenancy_id: number;
  billing_month: string; // YYYY-MM-01
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: RentBillStatus;
  notes: string | null;
  tenant?: {
    id: number;
    full_name: string;
    email: string;
  };
  unit?: {
    id: number;
    unit_number: string;
  };
  property?: {
    id: number;
    name: string;
  };
  payments?: Payment[];
}

// Rent Bill Summary - aggregated statistics for tenant
interface RentBillSummary {
  total_outstanding: number;
  pending_count: number;
  overdue_count: number;
  paid_count: number;
}

// Payment Form Data - with rent bill linking (NEW)
interface PaymentFormData {
  amount: number;
  payment_type: 'rent' | 'utility';
  payment_method: 'mobile_money' | 'bank_transfer';
  utility_bill_id?: number;
  rent_bill_id?: number; // Link payment to specific rent bill
  reference_number?: string;
  notes?: string;
}
```

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Application<br/>React 19 + Inertia]
        Mobile[Mobile App<br/>React Native/Expo]
    end
    
    subgraph "Load Balancer / Web Server"
        Nginx[Nginx]
    end
    
    subgraph "Application Layer"
        Laravel[Laravel 12 Application]
        Fortify[ Laravel Fortify<br/>Authentication]
    end
    
    subgraph "Database Layer"
        MySQL[MySQL Database]
        Cache[Redis Cache]
    end
    
    Web --> Nginx
    Mobile --> Laravel
    Nginx --> Laravel
    Laravel --> Fortify
    Laravel --> MySQL
    Laravel --> Cache
```

## Application Layers

### 1. Presentation Layer (React + Inertia)
Located in the root (not resources/js), using Inertia.js for SSR:
- **Web Controllers**: `app/Http/Controllers/Web/`
- **Pages**: Inertia page components rendered server-side
- **Persistent Layouts**: Inertia continuous layouts mapping (`AdminLayout`, `LandlordLayout`) resolving toggle-state resets and visual flashing globally.
- **Middleware**: HandleInertiaRequests, HandleAppearance

### 2. API Layer (REST)
Located in `app/Http/Controllers/Api/`:
- **Authentication API**: `app/Http/Controllers/Api/Auth/`
- **Tenant API**: `app/Http/Controllers/Api/Tenant/`
- **Landlord API**: `app/Http/Controllers/Api/Landlord/`

### 3. Business Logic Layer
Located in:
- **Services**: `app/Services/` containing exhaustive business rules divorced from controllers (e.g. `PaymentService`, `TenantService`, `UtilityService`, `OnboardingService`, `DashboardServices`).
- **Models**: `app/Models/` (User, Property, Unit, Tenant, Tenancy, Payment, etc.)
- **Actions**: `app/Actions/Fortify/` (User creation, password validation)

### 4. Data Access Layer
- **Eloquent Models**: `app/Models/`
- **Migrations**: `database/migrations/`
- **Seeders**: `database/seeders/`

## Module Structure

### User Management Module
```
app/Models/User.php
app/Http/Controllers/Web/Settings/
app/Actions/Fortify/
```
- **Roles**: admin, landlord, tenant
- **Features**: Profile management, password changes, two-factor authentication

### Property Management Module
```
app/Http/Controllers/Web/Admin/AdminPropertyController.php
app/Http/Controllers/Web/Landlord/LandlordPropertyController.php
app/Models/Property.php
```
- **Features**: CRUD operations, property details, images

### Unit Management Module
```
app/Http/Controllers/Web/Landlord/LandlordUnitController.php
app/Models/Unit.php
```
- **Features**: Unit CRUD, property association, availability status

### Tenant Management Module
```
app/Http/Controllers/Web/Landlord/LandlordTenantController.php
app/Models/Tenant.php
app/Models/Tenancy.php
app/Services/TenantService.php
```
- **Features**: Tenant registration, tenancy creation, tenant identification

### Payment Module
```
app/Http/Controllers/Web/Landlord/LandlordPaymentController.php
app/Models/Payment.php
app/Services/PaymentService.php
```
- **Features**: Payment tracking, payment history

### Notification Module
```
app/Http/Controllers/Web/*/NotificationController.php
app/Models/Notification.php
app/Notifications/
```
- **Features**: In-app notifications, email notifications, tenancy expiry alerts

### Utility Module
```
app/Http/Controllers/Web/Landlord/LandlordUtilityController.php
app/Http/Controllers/Web/Landlord/LandlordUtilityBillController.php
app/Http/Controllers/Web/Tenant/TenantUtilitiesController.php
app/Http/Controllers/Api/Landlord/TenancyUtilityController.php
app/Http/Controllers/Api/Landlord/UtilityBillController.php
app/Http/Controllers/Api/Landlord/UtilityTypeController.php
app/Models/UtilityType.php
app/Models/TenancyUtility.php
app/Models/UtilityBill.php
app/Services/UtilityService.php
```
- **Features**: Utility tracking (water, electricity, etc.), utility bill management, utility type catalog
- **New Three-Table System**: Replaced the old single `utilities` table with:
  - `UtilityType` - Catalog of utility categories (admin-managed)
  - `TenancyUtility` - Links tenancies to utility types with billing details
  - `UtilityBill` - Individual monthly charge records

### Security Module
```
app/Models/SecurityEvent.php
```
- **Features**: Security event logging and auditing.

## Data Flow

### Web Authentication Flow
```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Laravel
    participant Fortify
    participant Database
    
    User->>Browser: Enter credentials
    Browser->>Laravel: POST /login
    Laravel->>Fortify: Validate credentials
    Fortify->>Database: Verify user
    Database->>Fortify: User data
    Fortify->>Laravel: Authentication result
    Laravel->>Browser: Set session cookie, redirect to role-based dashboard
```

### API Authentication Flow
```mermaid
sequenceDiagram
    participant Mobile
    participant Laravel
    participant Database
    
    Mobile->>Laravel: POST /api/auth/login
    Laravel->>Database: Verify credentials
    Database->>Laravel: User data + generate Sanctum token
    Laravel->>Mobile: Plain text access token
    
    Mobile->>Laravel: GET /api/tenant/dashboard (with Bearer token)
    Laravel->>Laravel: Validate via auth:sanctum
    Laravel->>Mobile: Dashboard data
```

### Tenant Creation Flow
```mermaid
sequenceDiagram
    participant Landlord
    participant Laravel
    participant Database
    
    Landlord->>Laravel: POST /landlord/tenants (with tenant + tenancy data)
    Laravel->>Laravel: Validate request (StoreTenantWithTenancyRequest)
    Laravel->>Database: Begin Transaction
    Database->>Database: Create Tenant record
    Database->>Database: Create User account (tenant role)
    Database->>Database: Create Tenancy record
    Database->>Database: Update Unit status to occupied
    Database->>Laravel: Commit Transaction
    Laravel->>Landlord: Redirect with success message
```

## Route Structure

### Web Routes (Session-based)
```
/admin/dashboard        -> AdminDashboardController
/admin/users           -> AdminUserController
/admin/properties      -> AdminPropertyController

/landlord/dashboard    -> LandlordDashboardController
/landlord/properties   -> LandlordPropertyController
/landlord/units       -> LandlordUnitController
/landlord/tenants     -> LandlordTenantController
/landlord/payments       -> LandlordPaymentController
/landlord/utilities      -> LandlordUtilityController
/landlord/utility-bills  -> LandlordUtilityBillController
/landlord/notifications  -> LandlordNotificationController

/tenant/dashboard      -> TenantDashboardController
/tenant/payments      -> TenantPaymentsController
/tenant/utilities     -> TenantUtilitiesController
/tenant/utilities/bills -> TenantUtilitiesController (bills)
/tenant/notifications  -> TenantNotificationController

/settings/profile     -> ProfileController
/settings/password   -> PasswordController
```

### API Routes (Token-based)
```
/api/auth/login       -> AuthController@login
/api/auth/logout      -> AuthController@logout
/api/auth/me          -> AuthController@me

/api/tenant/dashboard    -> Tenant\DashboardController
/api/tenant/payments     -> Tenant\PaymentsController
/api/tenant/utilities    -> Tenant\UtilitiesController
/api/tenant/utility-bills -> Tenant\UtilitiesController (bills)

/api/landlord/dashboard        -> Landlord\DashboardController
/api/landlord/properties       -> Landlord\PropertyController
/api/landlord/units            -> Landlord\UnitController
/api/landlord/tenants         -> Landlord\TenantController
/api/landlord/payments        -> Landlord\PaymentController
/api/landlord/utility-types   -> Landlord\UtilityTypeController
/api/landlord/tenancy-utilities -> Landlord\TenancyUtilityController
/api/landlord/utility-bills   -> Landlord\UtilityBillController
/api/landlord/notifications    -> Landlord\NotificationController
```

## Middleware Stack

1. **web** - Session encryption, cookie signing, CSRF protection
2. **auth** - User authentication verification
3. **auth.role** - Role-based redirect after login
4. **auth:sanctum** - API token authentication
5. **throttle** - Rate limiting
6. **HandleAppearance** - Inertia theme handling
7. **HandleInertiaRequests** - Inertia share data, version checking

## Database Connections

- **MySQL**: Primary database for application data
- **Redis**: Caching, session storage, queue management
- **File Storage**: Laravel filesystem for property images, documents

## Environment Configuration

The application uses environment variables for configuration:
- Database credentials
- Application key
- Session driver
- Cache driver
- Mail configuration
- API URLs for mobile

## Command Scheduler

Laravel scheduler handles:
- `EndExpiredTenancies` - Automatically ends expired tenancies
- `TestTenancyNotifications` - Tests expiry notifications
- `MarkOverdueUtilityBills` - Marks pending/partial bills as overdue (daily)
- `GenerateMonthlyUtilityBills` - Creates monthly bills for active utilities (monthly)

## Quality Assurance & Testing Architecture

The project maintains a rigorous, phased testing approach powered by **Pest**. 
The test footprints are completely isolated, ensuring reliable test environments, preventing data leaks across partitions, and validating correct API behavior via Sanctum.

Testing is divided into core phases:
1. **Core Service Testing**: Isolated behavior-driven tests validating business logic inside the `app/Services` directory (e.g. `RentBillService`, `PaymentService`).
2. **Tenant Data Isolation**: Assertions guaranteeing that Tenant accounts cannot fetch data cross-tenancy on Web views.
3. **API Contracts**: Exhaustive feature testing providing nearly 100% test density specifically targeting the Mobile API endpoints securely bridging `Sanctum::actingAs`.
4. **Architectural Guardrails**: Enforcing global layout restrictions using `arch()` tests (e.g., prohibiting `dd()` traces, enforcing `FormRequest` extensions).

## Summary

This architecture follows:
- **MVC pattern** with Laravel
- **Repository pattern** through Eloquent
- **Service layer** for complex business logic
- **Middleware pattern** for cross-cutting concerns
- **Role-based access control** (RBAC)
- **API-first design** supporting both web and mobile clients
- **Test-Driven Architecture** supported by Pest
- **Server-side rendering** with Inertia.js for optimal performance
