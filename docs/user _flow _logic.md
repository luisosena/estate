# Approach

I’ll trace the **post-login redirect + dashboard render flow** directly from your codebase:

- **Routes** that receive the request after login (and the dashboard routes)
- **Middleware stack** applied to those routes (auth/tenant/admin, etc.)
- **Controllers** that decide where to redirect and what data to load
- **Models / relationships** used to pull data from DB and pass it to the view / Inertia page

I’ll keep the **authentication internals** (Fortify/Breeze details) high-level as requested, and focus on what happens **after** the user is authenticated.

I’m going to scan `routes/`, dashboard controllers, and the relevant middleware.



I’ve located the **role-based post-login redirect** (custom Fortify `LoginResponse`) and the **dashboard routes/controllers**. Next I’ll pull in the **middleware stack** (global + web group + auth + your custom redirect middleware) and then trace the **tenant dashboard data flow** (User -> Tenant -> Tenancies -> Unit/Payments/Utilities -> Notifications) by reading the relevant models and related controllers.








# 1) Post-login redirect flow (high level)

## Where the redirect is decided
Your app overrides Fortify’s default login response:

- **File**: `app/Responses/LoginResponse.php`
- **Registered in**: `app/Providers/FortifyServiceProvider.php` via:
  - `LoginResponseContract::class` bound to `App\Responses\LoginResponse`

### Flow
1. User submits login form (Fortify handles credential verification; skipping deep auth details as requested).
2. On successful auth, Fortify calls your custom `LoginResponse::toResponse()`.
3. That method reads:
   - **[$user = $request->user()](cci:1://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/Tenant.php:21:4-25:5)**
   - **`$user->role`**
4. It computes a role-based redirect target:

- **admin** -> `/admin/dashboard`
- **landlord** -> `/landlord/dashboard`
- **tenant** -> `/tenant/dashboard`
- **default** -> `/dashboard`

5. It returns:
- `return redirect()->intended($redirectUrl);`

## What `redirect()->intended()` means for navigation
- If the user originally tried to access a protected route (ex: `/tenant/dashboard`) and got intercepted by `auth`, Laravel stores that as the **intended URL**.
- After login:
  - If an intended URL exists, user goes there.
  - Otherwise, user goes to the role-based `$redirectUrl`.

So the **final redirect** is:
- **intended URL (if any)**, else **role dashboard URL**.

---

# 2) Routes involved (entry points after login)

## Dashboard routes
Defined in [routes/web.php](cci:7://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/routes/web.php:0:0-0:0):

- `GET /admin/dashboard` -> `AdminDashboardController@index`
- `GET /landlord/dashboard` -> `LandlordDashboardController@index`
- `GET /tenant/dashboard` -> `TenantDashboardController@index`
- `GET /tenant/payments` -> `TenantPaymentsController@index`
- `GET /tenant/utilities` -> `TenantUtilitiesController@index`

All of those are inside:

```php
Route::middleware(['auth'])->group(function () { ... });
```

So they are **protected by `auth`**.

## Generic dashboard fallback
Also present:

- `GET /dashboard` -> renders `Inertia::render('dashboard')`

Note: in your current [web.php](cci:7://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/routes/web.php:0:0-0:0), `/dashboard` is **not** inside the `auth` group (so it’s accessible without auth unless something else protects it elsewhere).

---

# 3) Middleware involved (what runs around these requests)

## A) Core middleware for web requests
You’re on Laravel’s newer bootstrap configuration style. In [bootstrap/app.php](cci:7://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/bootstrap/app.php:0:0-0:0) you append to the **web middleware group**:

- `HandleAppearance::class`
- `HandleInertiaRequests::class`
- `AddLinkHeadersForPreloadedAssets::class`

### What these do in your app

#### [HandleAppearance](cci:2://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Http/Middleware/HandleAppearance.php:9:0-22:1)
- **File**: [app/Http/Middleware/HandleAppearance.php](cci:7://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Http/Middleware/HandleAppearance.php:0:0-0:0)
- Reads `appearance` cookie and shares it with Blade views:
  - [View::share('appearance', $request->cookie('appearance') ?? 'system');](cci:1://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Http/Middleware/HandleInertiaRequests.php:28:4-49:5)

#### [HandleInertiaRequests](cci:2://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Http/Middleware/HandleInertiaRequests.php:7:0-50:1)
- **File**: [app/Http/Middleware/HandleInertiaRequests.php](cci:7://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Http/Middleware/HandleInertiaRequests.php:0:0-0:0)
- Sets root Inertia view to `resources/views/app.blade.php` via:
  - `protected $rootView = 'app';`
- Shares default props to every Inertia page:
  - **`name`** = `config('app.name')`
  - **[auth.user](cci:1://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/Tenant.php:21:4-25:5)** = [$request->user()](cci:1://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/Tenant.php:21:4-25:5)
  - **`sidebarOpen`** derived from `sidebar_state` cookie
  - **`ziggy`** routing info (`location`, `query`)

This is important: even if a controller returns `Inertia::render(...)` with no props, your frontend still receives [auth.user](cci:1://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/Tenant.php:21:4-25:5) as a shared prop.

#### `AddLinkHeadersForPreloadedAssets`
- Adds HTTP `Link` headers for asset preloading (performance/UX).

## B) Route middleware: `auth`
In [routes/web.php](cci:7://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/routes/web.php:0:0-0:0), dashboard routes are wrapped in `Route::middleware(['auth'])`.
So request flow is:

- If not authenticated -> redirect to login (and store intended URL)
- If authenticated -> controller action runs

## C) Your custom “already-authenticated” redirect middleware (used mainly for auth pages)
- **File**: `app/Http/Middleware/RedirectIfAuthenticatedWithRole.php`
- Aliased in [bootstrap/app.php](cci:7://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/bootstrap/app.php:0:0-0:0) as:
  - `'auth.role' => RedirectIfAuthenticatedWithRole::class`

What it does:
- If user is already logged in and tries to hit certain pages, it redirects them based on role (same mapping as `LoginResponse`)
- It explicitly allows:
  - `POST /login` (so login submissions work)
  - `logout` routes

This middleware is typically applied to “guest-only” routes (like the login page) so authenticated users don’t see the login screen again.

---

# 4) Data movement: Database -> Models -> Controllers -> Inertia pages

## Tenant dashboard (most complete data example)

### Route
- `GET /tenant/dashboard`
- **Middleware**: `auth`
- **Controller**: `TenantDashboardController@index`

### Controller logic (data loading path)
In `TenantDashboardController@index`:

1. Get logged-in user:
- [$user = $request->user();](cci:1://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/Tenant.php:21:4-25:5)

2. Get the tenant profile linked to that user:
- `$tenant = $user->tenant;`

This uses the relationship in [app/Models/User.php](cci:7://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/User.php:0:0-0:0):
- [User::tenant()](cci:1://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/User.php:48:4-51:5) -> `belongsTo(Tenant::class)`
And the user table stores `tenant_id`.

3. Find the active tenancy for that tenant:
```php
$activeTenancy = $tenant->tenancies()
  ->where('status', 'active')
  ->with(['unit', 'payments', 'utilities'])
  ->first();
```

This uses [app/Models/Tenant.php](cci:7://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/Tenant.php:0:0-0:0):
- [Tenant::tenancies()](cci:1://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/Tenant.php:27:4-30:5) -> `hasMany(Tenancy::class)`

And [app/Models/Tenancy.php](cci:7://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/Tenancy.php:0:0-0:0):
- [Tenancy::unit()](cci:1://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/Tenancy.php:29:4-32:5) -> `belongsTo(Unit::class)`
- [Tenancy::payments()](cci:1://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/Tenant.php:37:4-40:5) -> `hasMany(Payment::class)`
- [Tenancy::utilities()](cci:1://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/Tenancy.php:39:4-42:5) -> `hasMany(Utility::class)`

4. Load notifications:
```php
$tenant->notifications()
  ->latest()
  ->take(5)
  ->get();
```
From [Tenant::notifications()](cci:1://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/Tenant.php:42:4-45:5) -> `hasMany(Notification::class)`

5. Return an Inertia response to the frontend page:
- `Inertia::render('tenant/dashboard', [...props])`

Props passed include:
- **tenant**: id, full_name, phone, email
- **unit**: the loaded unit model (if active tenancy exists)
- **tenancy**: move_in_date, status
- **payments**: top 5, sorted by `paid_at` (fallback `created_at`)
- **utilities**: utilities collection (if loaded)
- **notifications**: latest 5 notifications

### How it becomes UI
Inertia will:
1. Render `resources/views/app.blade.php` as the base HTML.
2. Boot `resources/js/app.tsx` on the client.
3. Load the React page component matching `tenant/dashboard` (under `resources/js/...`).
4. Provide it the props from:
   - Controller props
   - Plus shared props from [HandleInertiaRequests](cci:2://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Http/Middleware/HandleInertiaRequests.php:7:0-50:1) (notably [auth.user](cci:1://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/Tenant.php:21:4-25:5))

So your “data movement” is:

- **DB**
  -> **Eloquent relationships** (`User -> tenant -> tenancies -> unit/payments/utilities`, plus notifications)
  -> **Controller** builds props array
  -> **Inertia response**
  -> **React page renders props**

## Tenant payments page
- **Route**: `GET /tenant/payments` (auth-protected)
- **Controller**: `TenantPaymentsController@index`
- Loads:
  - [$tenant = $request->user()->tenant](cci:1://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/Tenant.php:21:4-25:5)
  - [$activeTenancy = $tenant->tenancies()->where('status','active')->with(['payments'])->first()](cci:1://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/Tenant.php:27:4-30:5)
  - Sorts payments and returns `Inertia::render('tenant/payments', [...])`

## Tenant utilities page
- **Route**: `GET /tenant/utilities` (auth-protected)
- **Controller**: `TenantUtilitiesController@index`
- Currently only passes basic tenant identity to:
  - `Inertia::render('tenant/utilities', ['tenant' => ...])`
  - (No utilities loaded here yet, unlike the dashboard)

## Admin dashboard
- **Route**: `GET /admin/dashboard` (auth-protected)
- **Controller**: `AdminDashboardController@index`
- Currently:
  - Fetches [$request->user()](cci:1://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/Tenant.php:21:4-25:5)
  - If missing, redirects to `login`
  - Renders: `Inertia::render('admin/dashboard')`
- There isn’t DB aggregation here yet (at least in this controller).

## Landlord dashboard
- **Route**: `GET /landlord/dashboard` (auth-protected)
- **Controller**: `LandlordDashboardController@index`
- Simply returns `Inertia::render('landlord/dashboard')` (no DB data loaded yet in controller).

---

# 5) Quick end-to-end narratives

## A) User logs in as Tenant and lands on tenant dashboard
1. Login succeeds.
2. `App\Responses\LoginResponse` runs.
3. Redirects to `/tenant/dashboard` (or intended URL).
4. Request hits route `GET /tenant/dashboard` with `auth` middleware.
5. `auth` allows request (user is logged in).
6. `TenantDashboardController@index` queries relationships:
   - `user -> tenant -> activeTenancy (+ unit/payments/utilities)`, `tenant -> notifications`
7. Controller returns `Inertia::render('tenant/dashboard', props)`
8. Inertia middleware shares [auth.user](cci:1://file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/Tenant.php:21:4-25:5) and other shared props.
9. React page renders dashboard using received props.

## B) User visits `/login` while already authenticated
1. Route uses guest-type logic (where you apply `auth.role`).
2. `RedirectIfAuthenticatedWithRole` sees authenticated user.
3. Redirects based on role to the correct dashboard.

---

# Status / What I covered
- **Covered**: post-login redirect (`LoginResponse`), dashboard routes, middleware involved, and full tenant dashboard data flow DB->models->controller->Inertia->frontend.
- **Not overly detailed**: login credential verification internals (Fortify pipeline), per your request.

If you want, I can also draw a **diagram-style flow** (boxes/arrows) for tenant vs admin vs landlord, and/or confirm exactly **where `auth.role` is applied** (which routes/group) by searching for its usage in the project.