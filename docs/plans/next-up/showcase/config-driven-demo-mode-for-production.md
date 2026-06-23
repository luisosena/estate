# Walkthrough: Config-Driven Demo Mode

We have successfully implemented the safe, config-driven demo mode for landlords and tenants with automatic session expiry.

## Changes Made

### 1. Configuration
- **[config/demo.php](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate/config/demo.php)**: Added a new configuration file defining the emails for demo landlord (`wanjiku.kamau@estatemanager.co.tz`) and demo tenant (`amina.salim@gmail.com`) accounts.

### 2. Models
- **[User.php](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate/app/Models/User.php)**:
  - Appended `'is_demo'` to `$appends` for automatic serialization to Inertia.
  - Implemented the `getIsDemoAttribute()` accessor, dynamically evaluating if a user's email matches the configured demo emails or if the database `is_demo` flag is set.

### 3. Controllers
- **[DemoController.php](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate/app/Http/Controllers/Web/DemoController.php)**:
  - Modified `login()` to resolve demo accounts by their config-defined emails instead of the database flag.
  - Logs the user in, regenerates the session, and records `demo_started_at` in the session.
  - Redirects to the respective landlord or tenant dashboard.

### 4. Middleware & Sharing
- **[HandleInertiaRequests.php](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate/app/Http/Middleware/HandleInertiaRequests.php)**:
  - Shared the `flash` object (success & error) with the Inertia frontend to display error/success alerts when actions are blocked.
- **[app-header-layout.tsx](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate/resources/js/layouts/app/app-header-layout.tsx)**:
  - Mounted `<DemoBanner />` in the header layout to ensure it displays everywhere a demo session is active.

### 5. Existing Infrastructure Verified
- **Middlewares**: `EnsureNotDemoUser.php` (blocks write actions and settings pages) and `DemoSessionTimeout.php` (logs out users after 30 minutes) were verified as active and correctly configured in `bootstrap/app.php` and `routes/web.php`.
- **Frontend Components**: `TryDemoButton.tsx` (role picker popover), `DemoBanner.tsx` (expiration timer banner), and nav sidebar settings hiding logic are fully operational.

---

## Validation & Testing

### Automated Tests
- Renamed the test suite to **[DemoModeTest.php](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate/tests/Feature/DemoModeTest.php)** to adhere to the Pest naming convention and ensure it is executed during test runs.
- Updated the test suite's `beforeEach` block to use the configured demo emails so that the tests accurately simulate real-world config-driven login.
- **Test execution result**: All 20 tests in `DemoModeTest` and the full suite of 547 tests passed successfully.

```bash
php artisan test --filter=DemoMode --compact
```
Output:
```
   PASS  Tests\Feature\DemoModeTest
  ✓ DemoController → it logs in as demo landlord when role=landlord
  ✓ DemoController → it logs in as demo tenant when role=tenant
  ✓ DemoController → it defaults to landlord when no role provided
  ...
  ✓ Demo user shared data via Inertia → it shares isDemoUser and demoExpiresAt when demo user logged in
  ✓ Demo user shared data via Inertia → it shares isDemoUser as false for regular users

  Tests:    20 passed (57 assertions)
  Duration: 4.09s
```

### Formatting
- Ran Laravel Pint to format all dirty/modified PHP files.
