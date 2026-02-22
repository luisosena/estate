# User Flow Logic: Post-Login Redirect and Dashboard Rendering

## Overview

This document provides a comprehensive analysis of how users are redirected after logging in and how dashboard data flows from the database through models, controllers, and middleware to render views in your Laravel + Inertia + React application.

---

## 1) Post-Login Redirect Flow

### Where the Redirect is Decided

Your application overrides Fortify's default login response to implement role-based redirects:

**File**: `app/Responses/LoginResponse.php`
**Registered in**: `app/Providers/FortifyServiceProvider.php`

```php
// In FortifyServiceProvider.php
$this->app->singleton(LoginResponseContract::class, LoginResponse::class);
```

### The Redirect Logic

1. **User submits login form** - Fortify handles credential verification
2. **Successful authentication** - Fortify calls your custom `LoginResponse::toResponse()`
3. **Role detection** - The method reads:
   - `$user = $request->user()`
   - `$user->role`
4. **URL computation** - Uses the shared `RoleRedirects::urlByRole()` helper:

```php
// app/Helpers/RoleRedirects.php
public static function urlByRole(string $role): string
{
    return match($role) {
        'admin' => '/admin/dashboard',
        'landlord' => '/landlord/dashboard',
        'tenant' => '/tenant/dashboard',
        default => '/dashboard',
    };
}
```

5. **Redirect execution** - Returns `redirect($redirectUrl)`

**Important**: After our recent change, the redirect is now `redirect($redirectUrl)` instead of `redirect()->intended($redirectUrl)`, ensuring users always go to their role-based dashboard regardless of any previously attempted URL.

---

## 2) Routes Involved (Entry Points After Login)

### Dashboard Routes

All dashboard routes are defined in `routes/web.php` and protected by the `auth` middleware:

```php
Route::middleware(['auth'])->group(function () {
    // Admin Routes
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])
        ->name('admin.dashboard');

    // Landlord Routes
    Route::get('/landlord/dashboard', [LandlordDashboardController::class, 'index'])
        ->name('landlord.dashboard');
    
    Route::get('/landlord/tenants/create', [LandlordDashboardController::class, 'create'])
        ->name('landlord.tenants.create');
        
    Route::post('/landlord/tenants', [LandlordDashboardController::class, 'store'])
        ->name('landlord.tenants.store');

    // Tenant Routes
    Route::get('/tenant/dashboard', [TenantDashboardController::class, 'index'])
        ->name('tenant.dashboard');

    Route::get('/tenant/payments', [TenantPaymentsController::class, 'index'])
        ->name('tenant.payments');

    Route::get('/tenant/utilities', [TenantUtilitiesController::class, 'index'])
        ->name('tenant.utilities');
});
```

### Generic Dashboard Fallback

```php
Route::get('/dashboard', function () {
    return Inertia::render('dashboard');
})->name('dashboard');
```

**Note**: The `/dashboard` route is currently outside the `auth` middleware group, making it accessible without authentication.

---

## 3) Middleware Stack

### A) Core Web Middleware

In `bootstrap/app.php`, the following middleware are appended to the web middleware group:

```php
$middleware->web(append: [
    HandleAppearance::class,
    HandleInertiaRequests::class,
    AddLinkHeadersForPreloadedAssets::class,
]);
```

#### HandleAppearance Middleware

**File**: `app/Http/Middleware/HandleAppearance.php`

```php
public function handle(Request $request, Closure $next): Response
{
    View::share('appearance', $request->cookie('appearance') ?? 'system');
    return $next($request);
}
```

- Reads the `appearance` cookie
- Shares it with all Blade views
- Used for theme switching (light/dark/system)

#### HandleInertiaRequests Middleware

**File**: `app/Http/Middleware/HandleInertiaRequests.php`

Key responsibilities:
- Sets root Inertia view to `resources/views/app.blade.php`
- Shares default props with every Inertia page:

```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'name' => config('app.name'),
        'auth' => [
            'user' => $request->user(),
        ],
        'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        'ziggy' => [
            'location' => $request->url(),
            'query' => $request->query(),
        ],
    ];
}
```

**Important**: The `auth.user` prop is always available to frontend components, even when controllers don't explicitly pass user data.

#### AddLinkHeadersForPreloadedAssets

- Adds HTTP `Link` headers for asset preloading
- Improves performance by allowing browsers to preload critical resources

### B) Route Middleware: `auth`

All dashboard routes are wrapped in `Route::middleware(['auth'])`, which:
- Redirects unauthenticated users to the login page
- Stores the attempted URL as the "intended" URL (though we now ignore this for role-based redirects)
- Allows authenticated requests to proceed to controllers

### C) Custom Authenticated User Redirect Middleware

**File**: `app/Http/Middleware/RedirectIfAuthenticatedWithRole.php`
**Alias**: `'auth.role'` (defined in `bootstrap/app.php`)

Purpose: Redirects already-authenticated users away from guest-only pages (like login) to their role-based dashboard.

Key logic:
```php
if (Auth::guard($guard)->check()) {
    $user = $request->user();
    $redirectUrl = RoleRedirects::urlByRole($user->role);
    return redirect($redirectUrl);
}
```

Special cases handled:
- Allows `POST /login` requests (form submissions)
- Allows logout routes
- Skips redirect for logout requests

---

## 4) Data Movement: Database → Models → Controllers → Inertia Pages

### Tenant Dashboard (Most Complete Example)

#### Route Definition
- **URL**: `GET /tenant/dashboard`
- **Middleware**: `auth`
- **Controller**: `TenantDashboardController@index`

#### Controller Data Loading Process

**File**: `app/Http/Controllers/Web/Tenant/TenantDashboardController.php`

```php
public function index(Request $request)
{
    try {
        // 1. Get authenticated user
        $user = $request->user();
        
        if (!$user) {
            return Inertia::render('tenant/dashboard', [
                'tenant' => ['id' => 0, 'full_name' => 'Guest'],
                'payments' => [],
            ]);
        }

        // 2. Get tenant profile linked to user
        $tenant = $user->tenant;

        if (!$tenant) {
            return Inertia::render('tenant/dashboard', [
                'tenant' => ['id' => 0, 'full_name' => 'No Tenant Found'],
                'payments' => [],
            ]);
        }

        // 3. Find active tenancy with related data
        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->with(['unit', 'payments', 'utilities'])
            ->first();

        // 4. Load recent notifications
        $notifications = $tenant->notifications()
            ->latest()
            ->take(5)
            ->get();

        // 5. Return Inertia response with props
        return Inertia::render('tenant/dashboard', [
            'tenant' => [
                'id' => $tenant->id,
                'full_name' => $tenant->full_name,
                'phone' => $tenant->phone,
                'email' => $tenant->email,
            ],
            'unit' => $activeTenancy?->unit,
            'tenancy' => $activeTenancy ? [
                'move_in_date' => $activeTenancy->move_in_date,
                'status' => $activeTenancy->status,
            ] : null,
            'payments' => $activeTenancy?->payments
                ->sortByDesc(function ($payment) {
                    return $payment->paid_at ?? $payment->created_at;
                })
                ->take(5)
                ->values() ?? [],
            'utilities' => $activeTenancy?->utilities,
            'notifications' => $notifications,
        ]);
    } catch (\Exception $e) {
        \Log::error('TenantDashboardController error: ' . $e->getMessage());
        
        return Inertia::render('tenant/dashboard', [
            'tenant' => ['id' => 0, 'full_name' => 'Error'],
            'payments' => [],
        ]);
    }
}
```

#### Model Relationships Used

**User Model** (`app/Models/User.php`):
```php
public function tenant()
{
    return $this->belongsTo(Tenant::class);
}
```

**Tenant Model** (`app/Models/Tenant.php`):
```php
public function user()
{
    return $this->hasOne(User::class);
}

public function tenancies()
{
    return $this->hasMany(Tenancy::class);
}

public function notifications()
{
    return $this->hasMany(Notification::class);
}
```

**Tenancy Model** (`app/Models/Tenancy.php`):
```php
public function tenant()
{
    return $this->belongsTo(Tenant::class);
}

public function unit()
{
    return $this->belongsTo(Unit::class);
}

public function payments()
{
    return $this->hasMany(Payment::class);
}

public function utilities()
{
    return $this->hasMany(Utility::class);
}
```

#### Data Flow Visualization

```
Database Tables:
├── users (id, email, role, tenant_id)
├── tenants (id, tenant_code, full_name, phone, email)
├── tenancies (id, tenant_id, unit_id, status, move_in_date)
├── units (id, property_id, unit_number)
├── payments (id, tenancy_id, amount, paid_at)
├── utilities (id, tenancy_id, type, amount)
└── notifications (id, tenant_id, message, created_at)

Query Flow:
1. $request->user() → users table
2. $user->tenant → tenants table (via tenant_id)
3. $tenant->tenancies()->where('status', 'active') → tenancies table
4. ->with(['unit', 'payments', 'utilities']) → eager loads related tables
5. $tenant->notifications() → notifications table

Props Sent to Frontend:
{
  tenant: { id, full_name, phone, email },
  unit: { unit data or null },
  tenancy: { move_in_date, status } or null,
  payments: [sorted array of up to 5 payments],
  utilities: [utilities array] or null,
  notifications: [latest 5 notifications]
}
```

### Other Dashboard Pages

#### Tenant Payments Page

**Route**: `GET /tenant/payments`
**Controller**: `TenantPaymentsController@index`

Data loading:
```php
$user = $request->user();
$tenant = $user->tenant;
$activeTenancy = $tenant->tenancies()
    ->where('status', 'active')
    ->with(['payments'])
    ->first();
$payments = $activeTenancy?->payments
    ->sortByDesc('paid_at')
    ->values() ?? collect();
```

#### Tenant Utilities Page

**Route**: `GET /tenant/utilities`
**Controller**: `TenantUtilitiesController@index`

Currently only passes basic tenant info:
```php
$tenant = $request->user()->tenant;
return Inertia::render('tenant/utilities', [
    'tenant' => [
        'id' => $tenant->id,
        'full_name' => $tenant->full_name
    ]
]);
```

#### Admin Dashboard

**Route**: `GET /admin/dashboard`
**Controller**: `AdminDashboardController@index`

Minimal implementation:
```php
$user = $request->user();
if (!$user) {
    return redirect()->route('login');
}
return Inertia::render('admin/dashboard');
```

#### Landlord Dashboard

**Route**: `GET /landlord/dashboard`
**Controller**: `LandlordDashboardController@index`

Simple implementation:
```php
return Inertia::render('landlord/dashboard');
```

---

## 5) Frontend Rendering Process

### Inertia to React Flow

1. **Base HTML**: Inertia renders `resources/views/app.blade.php`
2. **JavaScript Boot**: `resources/js/app.tsx` initializes
3. **Component Resolution**: React loads the page component matching the route
4. **Props Injection**: Controller props + shared props are passed to the component
5. **Rendering**: React component renders with the provided data

### Shared Props Available to All Pages

From `HandleInertiaRequests` middleware:
```javascript
{
  name: "App Name",
  auth: {
    user: { user data or null }
  },
  sidebarOpen: boolean,
  ziggy: {
    location: "current URL",
    query: { query parameters }
  }
}
```

---

## 6) Complete End-to-End Flow Examples

### Example A: Tenant Login and Dashboard Access

1. **Login Attempt**: User submits credentials to `/login`
2. **Authentication**: Fortify validates credentials
3. **Redirect Decision**: `LoginResponse::toResponse()` runs
4. **Role-Based Redirect**: User redirected to `/tenant/dashboard`
5. **Middleware Check**: `auth` middleware allows request
6. **Controller Execution**: `TenantDashboardController@index` runs
7. **Database Queries**: Eloquent loads user → tenant → tenancy → related data
8. **Inertia Response**: Controller returns `Inertia::render('tenant/dashboard', props)`
9. **Shared Props**: `HandleInertiaRequests` adds `auth.user` and other shared data
10. **Frontend Rendering**: React component receives all props and renders dashboard

### Example B: Already Authenticated User Visiting Login Page

1. **Request**: Authenticated user visits `/login`
2. **Middleware**: `auth.role` middleware runs (if applied to login route)
3. **User Detection**: Middleware detects authenticated user
4. **Role-Based Redirect**: Uses `RoleRedirects::urlByRole()` to determine target
5. **Redirect**: User sent to their role-based dashboard
6. **Dashboard Flow**: Same as steps 5-10 in Example A

---

## 7) Security Considerations

### Authentication Guards

- All dashboard routes use the default `web` guard
- The `auth` middleware ensures only authenticated users can access dashboards
- `RedirectIfAuthenticatedWithRole` prevents authenticated users from accessing guest pages

### Data Access Control

- Controllers use `$request->user()` to ensure data is scoped to the authenticated user
- Tenant dashboard only shows data belonging to the authenticated user's tenant profile
- No direct database access from frontend - all data passes through controllers

### Middleware Order

The middleware stack for dashboard requests is:
1. Global middleware (encryption, cookies, etc.)
2. Web middleware group (`HandleAppearance`, `HandleInertiaRequests`, `AddLinkHeadersForPreloadedAssets`)
3. Route middleware (`auth`)
4. Controller action

---

## 8) Performance Optimizations

### Eager Loading

The tenant dashboard uses `with(['unit', 'payments', 'utilities'])` to prevent N+1 queries:
```php
$activeTenancy = $tenant->tenancies()
    ->where('status', 'active')
    ->with(['unit', 'payments', 'utilities'])
    ->first();
```

### Data Limiting

- Payments limited to 5 most recent records
- Notifications limited to 5 most recent records
- Only active tenancies are loaded

### Shared Props

`HandleInertiaRequests` middleware shares commonly needed data once, avoiding duplicate queries across multiple controllers.

---

## 9) Error Handling

### Controller-Level Error Handling

The tenant dashboard controller includes comprehensive error handling:
```php
try {
    // Main logic
} catch (\Exception $e) {
    \Log::error('TenantDashboardController error: ' . $e->getMessage());
    
    return Inertia::render('tenant/dashboard', [
        'tenant' => ['id' => 0, 'full_name' => 'Error'],
        'payments' => [],
    ]);
}
```

### Graceful Degradation

- If no user is found, renders dashboard with "Guest" data
- If no tenant profile exists, renders with "No Tenant Found" message
- If no active tenancy exists, renders with null unit/tenancy data

---

## 10) Future Enhancement Opportunities

### Admin Dashboard Data Loading

Currently minimal - could add:
- Total tenants count
- Total properties count
- Recent activity feed
- Revenue statistics

### Landlord Dashboard Enhancement

Could add:
- Landlord-specific properties
- Tenant management overview
- Payment collection status
- Maintenance requests

### Real-Time Updates

Consider implementing:
- WebSocket connections for real-time notifications
- Live payment status updates
- Real-time maintenance request status

### Caching Strategy

Implement caching for:
- Dashboard statistics
- Frequently accessed reference data
- User permissions/roles

---

## 11) File Structure Summary

```
app/
├── Helpers/
│   └── RoleRedirects.php           # Shared redirect logic
├── Http/
│   ├── Controllers/
│   │   ├── Web/
│   │   │   ├── Admin/
│   │   │   │   └── AdminDashboardController.php
│   │   │   ├── Landlord/
│   │   │   │   └── LandlordDashboardController.php
│   │   │   └── Tenant/
│   │   │       ├── TenantDashboardController.php
│   │   │       ├── TenantPaymentsController.php
│   │   │       └── TenantUtilitiesController.php
│   │   └── Middleware/
│   │       ├── HandleAppearance.php
│   │       ├── HandleInertiaRequests.php
│   │       └── RedirectIfAuthenticatedWithRole.php
│   ├── Middleware/
│   └── Responses/
│       └── LoginResponse.php
├── Models/
│   ├── User.php
│   ├── Tenant.php
│   ├── Tenancy.php
│   ├── Unit.php
│   ├── Payment.php
│   ├── Utility.php
│   └── Notification.php
└── Providers/
    └── FortifyServiceProvider.php

bootstrap/
└── app.php                         # Middleware registration

routes/
└── web.php                         # Route definitions

resources/
├── js/
│   ├── app.tsx                     # Main Inertia app
│   └── pages/                      # React page components
└── views/
    └── app.blade.php               # Inertia root template
```

---

## 12) Key Takeaways

1. **Role-Based Architecture**: Clear separation between admin, landlord, and tenant dashboards
2. **Centralized Redirect Logic**: `RoleRedirects` helper eliminates code duplication
3. **Secure Data Access**: All data access is scoped to the authenticated user
4. **Graceful Error Handling**: Comprehensive error handling ensures good UX even when things go wrong
5. **Performance Conscious**: Eager loading and data limiting prevent performance issues
6. **Maintainable Structure**: Clear separation of concerns between routes, controllers, and models
7. **Modern Frontend**: Inertia + React provides SPA-like experience with server-side routing benefits

This architecture provides a solid foundation for a multi-role property management application with excellent user experience and maintainable code structure.
