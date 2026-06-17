# Knowledge Map: Estate Practice Project

This document breaks down the fundamental concepts and implementations in the Estate Practice project to fill knowledge gaps. Each area is digested to its lowest, most essential form.

## Table of Contents

- [1. Authentication Architecture](#1-authentication-architecture)
  - [1.1 Mobile App Authentication Architecture](#11-mobile-app-authentication-architecture)
- [2. Inertia.js Data Flow Patterns](#2-inertiajs-data-flow-patterns)
- [3. Database Models and Relationships](#3-database-models-and-relationships)
- [4. Routing Patterns](#4-routing-patterns)
- [5. React/Inertia Component Patterns](#5-reactinertia-component-patterns)
- [6. Testing Patterns](#6-testing-patterns)
- [7. Business Logic Workflows](#7-business-logic-workflows)
- [8. Mobile App Architecture](#8-mobile-app-architecture)
- [Summary of Key Architectural Decisions](#summary-of-key-architectural-decisions)
- [Current Issues & Known Problems](#current-issues--known-problems)
- [Knowledge Gap Areas to Deepen](#knowledge-gap-areas-to-deepen)

---

## 1. Authentication Architecture

### Core Concept
Authentication is the process of verifying user identity. This project uses **Laravel Fortify** - a frontend-agnostic authentication backend that provides pre-built authentication controllers and routes.

### Fundamental Implementation

**Fortify Configuration** (`config/fortify.php`)
- Uses `web` guard (session-based authentication)
- Username field: `username` (not email)
- Features enabled: registration, password reset, email verification, 2FA
- Middleware: `web` (session-based)
- Rate limiting: login (5/min), two-factor (5/min)
- Fortify version: 1.36.2

**Auth Configuration** (`config/auth.php`)
- Default guard: `web` (session driver)
- User provider: `eloquent` (uses User model)
- Password reset tokens: 60-minute expiry
- Password timeout: 3 hours (10800 seconds)

**User Model** (`app/Models/User.php`)
- Extends `Authenticatable` (Laravel base)
- Implements `MustVerifyEmail`
- Uses traits: `HasApiTokens`, `Notifiable`, `TwoFactorAuthenticatable`
- Fillable: name, username, email, password, role, tenant_id
- Relationships: belongsTo Tenant, hasMany Properties

**Fortify Actions** (`app/Actions/Fortify/`)
- `CreateNewUser`: Validates and creates users (role defaults to 'tenant')
- `PasswordValidationRules`: Trait for password validation rules
- `ResetUserPassword`: Handles password reset with validation

### Key Patterns
- **Session-based auth**: No API tokens for web authentication
- **Role-based access**: Users have roles (admin, landlord, tenant)
- **2FA support**: Two-factor authentication with confirmation
- **Email verification**: Required for new users
- **Rate limiting**: Prevents brute force attacks

### Flow
1. User submits login form → Fortify controller validates credentials
2. Session created → User authenticated via `web` guard
3. Middleware checks `auth.user` → Routes protected by `auth` middleware
4. Role-based redirects → `RoleRedirects` helper determines dashboard

---

## 1.1 Mobile App Authentication Architecture

### Core Concept
The mobile app uses **token-based authentication** via Laravel Sanctum, which is fundamentally different from the web app's session-based approach. This enables stateless API authentication suitable for mobile clients.

### Fundamental Implementation

**Backend - Sanctum Token Authentication** (`app/Http/Controllers/Api/Auth/AuthController.php`)
```php
public function login(Request $request)
{
    $validated = $request->validate([
        'username' => ['required', 'string'],
        'password' => ['required', 'string'],
    ]);

    $user = User::query()->where('username', $validated['username'])->first();

    if (! $user || ! Hash::check($validated['password'], $user->password)) {
        throw ValidationException::withMessages([
            'username' => ['The provided credentials are incorrect.'],
        ]);
    }

    // Create Sanctum token for mobile
    $token = $user->createToken($request->input('device_name', 'mobile-app'))->plainTextToken;

    return response()->json([
        'token' => $token,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'tenant' => $user->tenant ? [...] : null,
        ],
    ]);
}
```

**Key Backend Components:**
- **User Model** (`app/Models/User.php`): Uses `HasApiTokens` trait from Laravel Sanctum
- **API Routes** (`routes/api.php`): Protected by `auth:sanctum` middleware
- **Token Creation**: `$user->createToken('device-name')->plainTextToken`
- **Token Revocation**: `$user->currentAccessToken()->delete()` on logout
- **Auth Guard**: API uses `auth:sanctum`, not the `web` guard

**API Route Protection** (`routes/api.php`)
```php
$defineApiRoutes = function (): void {
    Route::middleware('auth:sanctum')->group(function () {
        // All protected API routes
        Route::prefix('auth')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
        });
        // ... tenant and landlord routes
    });

    // Public authentication routes
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('register', [AuthController::class, 'register']);
    });
};
```

**Frontend - Mobile Auth Context** (`mobile/src/context/AuthContext.tsx`)
```typescript
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
  refreshUser: () => Promise<void>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getItem('auth_token');
      if (token) {
        const userData = await authApi.me();
        setUser(userData);
      }
    } catch (error) {
      await clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    await saveTokens(response);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Logout failure usually due to expired token
    } finally {
      await clearTokens();
      setUser(null);
    }
  };
}
```

**Secure Token Storage** (`mobile/src/utils/storage.ts`)
```typescript
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key); // Fallback for web
  }
  return SecureStore.getItemAsync(key); // Secure for mobile
}

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
```

**API Client with Token Injection** (`mobile/src/api/client.ts`)
```typescript
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL, // /api/v1
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token automatically
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // Response interceptor - Handle 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          await this.clearTokens(); // Clear invalid token
        }
        return Promise.reject(error);
      }
    );
  }
}
```

**Session Management with Device Fingerprinting** (`mobile/src/services/SessionManager.ts`)
```typescript
export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: 'phone' | 'tablet' | 'desktop' | 'unknown';
  deviceFingerprint: string;
}

export interface Session {
  token: string;
  deviceInfo: DeviceInfo;
  lastActivityAt: number;
  userId?: number;
  userEmail?: string;
}

class SessionManager {
  private async generateFingerprint(data: string): Promise<string> {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data
    );
    return hash;
  }

  private async collectDeviceData(): Promise<string> {
    const deviceId = await this.getOrCreateDeviceId();
    const deviceName = Device.deviceName ?? 'Unknown Device';
    const deviceType = this.getDeviceType();
    const modelName = Device.modelName ?? 'Unknown';
    const brand = Device.brand ?? 'Unknown';
    const osVersion = Device.osVersion ?? 'Unknown';
    
    return `${deviceId}|${deviceName}|${deviceType}|${modelName}|${brand}|${osVersion}|${Platform.OS}`;
  }

  async createSession(token: string, userId?: number, userEmail?: string): Promise<Session> {
    const deviceInfo = await this.initialize();
    const now = Date.now();
    
    const session: Session = {
      token,
      deviceInfo,
      lastActivityAt: now,
      userId,
      userEmail,
    };

    // Store token securely
    await SecureStore.setItemAsync('auth_token', token);
    await setItem(STORAGE_KEYS.LAST_ACTIVITY_AT, now.toString());

    return session;
  }

  async isSessionValid(): Promise<boolean> {
    const session = await this.getSession();
    if (!session) return false;

    const now = Date.now();
    const lastActivity = session.lastActivityAt;
    
    // 30-day sliding window for session expiry
    if (now - lastActivity > this.config.sessionExpiryMs) {
      return false;
    }

    return true;
  }
}
```

**Auth API Layer** (`mobile/src/api/auth.ts`)
```typescript
export const authApi = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    api.post<AuthResponse>('/auth/login', credentials),

  register: (data: RegisterData): Promise<AuthResponse> =>
    api.post<AuthResponse>('/auth/register', data),

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    await api.clearTokens();
  },

  me: (): Promise<AuthUser> =>
    api.get<AuthUser>('/auth/me'),

  refreshToken: (): Promise<{ token: string }> =>
    api.post<{ token: string }>('/auth/refresh'),

  forgotPassword: (email: string): Promise<{ message: string }> =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (data: {...}): Promise<{ message: string }> =>
    api.post<{ message: string }>('/auth/reset-password', data),
};
```

**Login Screen Implementation** (`mobile/src/screens/auth/LoginScreen.tsx`)
```typescript
export function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      await login({ username: username.trim(), password });
      // Navigation handled by AppNavigator based on isAuthenticated
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable withKeyboard>
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoComplete="username"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
      />
      <Button onPress={handleLogin} loading={loading}>
        Sign In
      </Button>
    </ScreenContainer>
  );
}
```

### Key Patterns
- **Token-based auth**: Sanctum tokens instead of sessions
- **Secure storage**: Expo SecureStore for token persistence
- **Automatic token injection**: Axios interceptors add Bearer token
- **Device fingerprinting**: SHA256 hash of device info for security
- **Session timeout**: 30-day sliding window inactivity timeout
- **Role-based navigation**: Different screens for tenant vs landlord
- **Silent auth check**: Token validation on app launch
- **401 handling**: Automatic logout on token expiration

### Flow
1. **App Launch** → AuthContext checks for stored token in SecureStore
2. **Token Found** → Calls `/auth/me` to validate and get user data
3. **Token Valid** → User state set, navigate to role-based dashboard
4. **Token Invalid/Missing** → Navigate to Login screen
5. **User Logs In** → API returns token → Stored in SecureStore
6. **Session Created** → Device fingerprint generated, activity tracked
7. **API Requests** → Interceptor adds `Authorization: Bearer {token}` header
8. **Server Validates** → Sanctum guard verifies token, returns data
9. **User Logs Out** → Token deleted from SecureStore, session cleared
10. **Session Expiry** → 30 days inactivity triggers re-authentication

### Security Features
- **Expo SecureStore**: iOS Keychain / Android Keystore encryption
- **Device fingerprinting**: Unique device identifier with SHA256 hash
- **Token expiry**: Server-side token invalidation on logout
- **Activity tracking**: Last activity timestamp for session validation
- **Cross-platform storage**: SecureStore for mobile, localStorage fallback for web
- **Automatic cleanup**: 401 responses trigger token clearing

### Differences from Web Authentication

| Aspect | Web (Inertia) | Mobile (API) |
|--------|---------------|--------------|
| **Auth Method** | Session-based (cookies) | Token-based (Bearer) |
| **Backend** | Laravel Fortify | Laravel Sanctum |
| **Guard** | `web` | `sanctum` |
| **Token Storage** | Server-side session | Expo SecureStore (client-side) |
| **Middleware** | `auth` (session) | `auth:sanctum` (token) |
| **User Traits** | `MustVerifyEmail` | `HasApiTokens` |
| **Communication** | Inertia visits | Axios HTTP requests |
| **Redirects** | Server-side | React Navigation |

### Mobile-Specific Dependencies
```json
{
  "expo-secure-store": "~55.0.13",  // Secure token storage
  "expo-crypto": "~55.0.14",        // SHA256 fingerprinting
  "expo-device": "~55.0.15",        // Device information
  "expo-local-authentication": "~55.0.13",  // Biometric auth support
  "axios": "^1.12.2",               // HTTP client
  "@react-navigation/native": "^7.1.18",  // Navigation
  "uuid": "^9.0.1"                  // Device ID generation
}
```

---

## 2. Inertia.js Data Flow Patterns

### Core Concept
Inertia.js allows building single-page applications (SPAs) without modern SPA complexity. It replaces traditional API calls with server-side rendering while maintaining SPA-like navigation.

### Fundamental Implementation

**Data Flow Architecture**
```
Controller → Inertia::render() → Page Component → Props
```

**Backend** (`app/Http/Controllers/Web/Landlord/LandlordTenantController.php`)
```php
return Inertia::render('landlord/tenants/show', [
    'tenant' => new TenantResource($tenant),
    'tenancy' => new TenancyResource($activeTenancy),
    'unit' => new UnitResource($activeTenancy?->unit),
    // ... more props
]);
```

**Middleware** (`app/Http/Middleware/HandleInertiaRequests.php`)
- Root view: `app`
- Shared props: `auth.user`, `name`, `sidebarOpen`, `ziggy` (routes)
- Asset versioning for cache busting

**Frontend** (`resources/js/pages/landlord/tenants/show.tsx`)
```typescript
interface Props {
  tenant: Tenant;
  tenancy?: Tenancy;
  unit?: Unit;
  // ... typed props
}

export default function TenantShow({ tenant, tenancy, unit }: Props) {
  // Component uses props directly - no API calls
}
```

**App Entry** (`resources/js/app.tsx`)
- Resolves page components via `resolvePageComponent`
- Uses Laravel Vite plugin for Inertia helpers
- Initializes theme on load

### Key Patterns
- **No API calls**: Data loaded server-side during page load
- **Type safety**: TypeScript interfaces match backend props
- **Shared props**: Auth user, routes available globally
- **Resource transformation**: API Resources format data for frontend
- **Navigation**: `router.visit()`, `router.reload()`, `Link` component

### Flow
1. Browser requests page → Laravel route matches
2. Controller fetches data → Transforms with Resources
3. Inertia renders → Returns JSON + page component name
4. Frontend receives props → React component renders
5. Navigation → Inertia makes XHR request → Server returns new props

---

## 3. Database Models and Relationships

### Core Concept
Eloquent ORM provides an elegant ActiveRecord implementation for working with databases. Relationships define how models connect to each other.

### Fundamental Implementation

**Property Model** (`app/Models/Property.php`)
- **Table:** `properties`
- **Columns:** id, owner_id, name, total_units, property_type (enum), status (enum), description, amenities (json), policies (json), address, city, state, postal_code, country, created_at, updated_at
- **Indexes:** Primary (id), owner_id (FK), unique constraints
- **Foreign Keys:** owner_id → users.id (on delete: cascade)
- **BelongsTo:** `owner()` → User (landlord)
- **HasMany:** `units()` → Unit
- **HasManyThrough:** `tenancies()` → Tenancy (via Unit)
- **Casts:** amenities, policies to arrays
- **Scope:** `active()` filters by status

**Unit Model** (`app/Models/Unit.php`)
- **Table:** `units`
- **Columns:** id, unit_code (unique), unit_name, status (enum: available/occupied), created_at, updated_at, property_id
- **Indexes:** Primary (id), property_id (FK), unique unit_code
- **Foreign Keys:** property_id → properties.id (on delete: cascade)
- **BelongsTo:** `property()` → Property
- **HasMany:** `tenancies()` → Tenancy
- **HasOneThrough:** `tenant()` → Tenant (via active Tenancy)

**Tenant Model** (`app/Models/Tenant.php`)
- **Table:** `tenants`
- **Columns:** id, tenant_code (unique), full_name, phone, email, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, created_at, updated_at, deleted_at (soft deletes)
- **Indexes:** Primary (id), unique tenant_code, tenant_code index
- **HasOne:** `user()` → User
- **HasMany:** `tenancies()` → Tenancy
- **HasMany:** `identifications()` → TenantIdentification
- **HasMany:** `payments()` → Payment
- **MorphMany:** `notifications()` → DatabaseNotification
- **Route key:** `tenant_code` (not ID)
- **Auto-generates tenant_code:** `TEN-00001`
- **Soft deletes enabled**

**Tenancy Model** (`app/Models/Tenancy.php`)
- **Table:** `tenancies`
- **Columns:** id, tenant_id, unit_id, move_in_date, move_out_date, end_reason, deposit_return_status, final_meter_readings, monthly_rent (decimal), rent_due_day, security_deposit (decimal), tenancy_agreement_path, status (enum: active/ended), created_at, updated_at
- **Indexes:** Primary (id), tenant_id (FK), unit_id (FK), status
- **Foreign Keys:** 
  - tenant_id → tenants.id (on delete: cascade)
  - unit_id → units.id (on delete: restrict)
- **BelongsTo:** `tenant()`, `unit()`
- **HasMany:** `payments()`, `tenancyUtilities()`, `rentBills()`
- **Appends:** `tenant_code` (from relationship)
- **Casts:** dates, decimals, arrays
- **Scope:** `active()` filters by status

**Payment Model** (`app/Models/Payment.php`)
- **Table:** `payments`
- **Columns:** id, tenant_id, tenancy_id, rent_bill_id (nullable), utility_bill_id (nullable), amount (decimal 10,2), payment_type (enum: rent/utility), payment_method, gateway, checkout_request_id, gateway_reference, gateway_status, gateway_metadata (json), gateway_confirmed_at, status (enum: paid/partial/overdue/cancelled/pending), reference_number, notes, paid_at, due_date, receipt_path, created_at, updated_at, deleted_at (soft deletes)
- **Indexes:** Primary (id), tenant_id (FK), tenancy_id (FK), rent_bill_id (FK), utility_bill_id (FK), status, paid_at
- **Foreign Keys:**
  - tenant_id → tenants.id (on delete: cascade)
  - tenancy_id → tenancies.id (on delete: cascade)
  - rent_bill_id → rent_bills.id (on delete: set null)
  - utility_bill_id → utility_bills.id (on delete: set null)
- **BelongsTo:** `tenant()`, `tenancy()`, `utilityBill()`, `rentBill()`
- **Boot validation:** Ensures bill tenancy matches payment tenancy
- **Appends:** `tenant_code`
- **Casts:** decimal amounts, dates, json
- **Methods:** `calculateStatus()`, `calculatePendingAmount()`

**RentBill Model** (`app/Models/RentBill.php`)
- **Table:** `rent_bills`
- **Columns:** id, tenancy_id, billing_month (date), amount_due (decimal 12,2), amount_paid (decimal 12,2), due_date, status (enum: pending/paid/partial/overdue/waived), notes, created_at, updated_at
- **Indexes:** Primary (id), tenancy_id (FK), billing_month, due_date, status, unique(tenancy_id, billing_month)
- **Foreign Keys:** tenancy_id → tenancies.id (on delete: cascade)
- **BelongsTo:** `tenancy()`
- **HasMany:** `payments()`
- **Accessors:** `outstandingAmount`, `tenant`, `unit`, `property`
- **Scopes:** `pending()`, `overdue()`
- **Method:** `markPaid()` updates status

**UtilityBill Model** (`app/Models/UtilityBill.php`)
- **Table:** `utility_bills`
- **Columns:** id, tenancy_utility_id, billing_month (date), units_consumed (decimal 10,3), amount_due (decimal 12,2), amount_paid (decimal 12,2), due_date, status (enum: pending/paid/partial/overdue/waived), notes, created_at, updated_at
- **Indexes:** Primary (id), tenancy_utility_id (FK), billing_month, due_date, status, unique(tenancy_utility_id, billing_month)
- **Foreign Keys:** tenancy_utility_id → tenancy_utilities.id (on delete: cascade)
- **BelongsTo:** `tenancyUtility()`
- **HasMany:** `payments()`
- **Accessor:** `outstandingAmount`
- **Scopes:** `pending()`, `overdue()`
- **Method:** `markPaid()` updates status

**UtilityType Model** (`app/Models/UtilityType.php`)
- **Table:** `utility_types`
- **Columns:** id, name, unit, description, is_metered (tinyint), is_active (tinyint), created_at, updated_at
- **Indexes:** Primary (id)
- **Fillable:** name, unit, description, is_metered, is_active
- **Casts:** is_metered, is_active to boolean
- **HasMany:** `tenancyUtilities()` → TenancyUtility
- **Scope:** `active()` filters by is_active

**TenancyUtility Model** (`app/Models/TenancyUtility.php`)
- **Table:** `tenancy_utilities`
- **Columns:** id, tenancy_id, utility_type_id, amount (decimal 12,2), billing_cycle (enum: monthly/quarterly/annual), provider, account_number, meter_number, status (enum: active/suspended/disconnected), notes, created_at, updated_at
- **Indexes:** Primary (id), tenancy_id (FK), utility_type_id (FK), status, unique(tenancy_id, utility_type_id)
- **Foreign Keys:**
  - tenancy_id → tenancies.id (on delete: cascade)
  - utility_type_id → utility_types.id (on delete: restrict)
- **Fillable:** tenancy_id, utility_type_id, amount, billing_cycle, provider, account_number, meter_number, status, notes
- **Casts:** amount to decimal:2
- **BelongsTo:** `tenancy()`, `utilityType()`
- **HasMany:** `bills()` → UtilityBill
- **Scope:** `active()` filters by status

**TenantIdentification Model** (`app/Models/TenantIdentification.php`)
- **Table:** `tenant_identifications`
- **Columns:** id, tenant_id, id_type, id_number, document_path, verified_at (timestamp), created_at, updated_at
- **Indexes:** Primary (id), tenant_id (FK)
- **Foreign Keys:** tenant_id → tenants.id (on delete: cascade)
- **Fillable:** tenant_id, id_type, id_number, document_path, verified_at
- **BelongsTo:** `tenant()` → Tenant
- **Stores:** tenant identification documents (ID cards, passports, etc.)

**SecurityEvent Model** (`app/Models/SecurityEvent.php`)
- **Table:** `security_events`
- **Columns:** id, user_id, event_type (enum: password_changed, password_reset_requested, suspicious_activity, unusual_location, multiple_failed_attempts, token_revoked, session_terminated, biometric_enabled, biometric_disabled, device_added, device_removed), ip_address, user_agent, device_id, location, metadata (json), severity (enum: low/medium/high/critical), created_at, updated_at
- **Indexes:** Primary (id), user_id, event_type, created_at
- **Logs:** security-related events (login attempts, suspicious activity)
- **Used for:** audit trail and security monitoring

**Notification Model** (`app/Models/Notification.php`)
- **Table:** `notifications` (Laravel's polymorphic notification table)
- **Columns:** id (char 36), type, notifiable_type, notifiable_id, data (text), read_at (timestamp), created_at, updated_at
- **Indexes:** Primary (id), notifiable_type + notifiable_id, read_at, created_at
- **Polymorphic:** notifiable_type/notifiable_id (can be User, Tenant, etc.)
- **Custom notification system for tenants and landlords**
- **Extends Laravel's notification system**

**Message Model** (`app/Models/Message.php`)
- **Table:** `messages`
- **Columns:** id, sender_id, receiver_id, message (text), created_at, updated_at
- **Indexes:** Primary (id), sender_id (FK), receiver_id (FK)
- **Foreign Keys:**
  - sender_id → users.id (on delete: cascade)
  - receiver_id → users.id (on delete: cascade)
- **Messaging system between landlords and tenants**
- **Supports in-app communication**

### Relationship Diagram
```
User (landlord) → hasMany → Property
Property → hasMany → Unit
Unit → hasMany → Tenancy
Tenancy → belongsTo → Tenant, Unit
Tenant → hasMany → Tenancy, Payment, TenantIdentification
Tenancy → hasMany → Payment, RentBill, TenancyUtility
Payment → belongsTo → Tenancy, RentBill, UtilityBill
TenancyUtility → belongsTo → Tenancy, UtilityType
UtilityType → hasMany → TenancyUtility
UtilityBill → belongsTo → TenancyUtility
TenantIdentification → belongsTo → Tenant
SecurityEvent → tracks → User activities
Notification → polymorphic → User, Tenant, Landlord
Message → between → Landlord, Tenant
```

### Key Patterns
- **Route model binding**: Custom route keys (tenant_code)
- **Eager loading**: `with()` prevents N+1 queries
- **Accessors**: Computed properties on models
- **Mutators**: Transform data before save
- **Casts**: Automatic type conversion
- **Scopes**: Reusable query filters
- **Boot methods**: Model lifecycle events

### Database Schema (Active)
**Current State:** Database is now migrated and active with MySQL engine.

**Total Tables:** 24 tables including Laravel system tables and application tables.

**Application Tables:**
| Table | Records | Purpose |
|-------|---------|---------|
| `users` | Auth accounts | Landlords, tenants, admins |
| `tenants` | Tenant profiles | Personal info, emergency contacts |
| `properties` | Property listings | Owned by landlords |
| `units` | Property units | Available/occupied status |
| `tenancies` | Rental agreements | Links tenant to unit |
| `payments` | Payment records | Rent and utility payments |
| `rent_bills` | Monthly rent bills | Billing cycle tracking |
| `utility_bills` | Utility charges | Water, electricity, etc. |
| `utility_types` | Utility categories | Metered/non-metered |
| `tenancy_utilities` | Tenancy utilities | Assigned utilities per tenancy |
| `tenant_identifications` | ID documents | Verification documents |
| `security_events` | Security logs | Audit trail |
| `messages` | Communications | Landlord-tenant messaging |
| `notifications` | System alerts | Polymorphic notifications |

**System Tables:** cache, cache_locks, failed_jobs, job_batches, jobs, migrations, password_reset_tokens, personal_access_tokens, sessions

**Key Foreign Key Constraints:**
- `users.tenant_id` → `tenants.id` (nullable)
- `properties.owner_id` → `users.id`
- `units.property_id` → `properties.id`
- `tenancies.tenant_id` → `tenants.id`
- `tenancies.unit_id` → `units.id`
- `payments.tenant_id` → `tenants.id`
- `payments.tenancy_id` → `tenancies.id`
- `payments.rent_bill_id` → `rent_bills.id` (nullable)
- `payments.utility_bill_id` → `utility_bills.id` (nullable)
- `rent_bills.tenancy_id` → `tenancies.id`
- `utility_bills.tenancy_utility_id` → `tenancy_utilities.id`
- `tenancy_utilities.tenancy_id` → `tenancies.id`
- `tenancy_utilities.utility_type_id` → `utility_types.id`
- `tenant_identifications.tenant_id` → `tenants.id`
- `messages.sender_id` → `users.id`
- `messages.receiver_id` → `users.id`

---

## 4. Routing Patterns

### Core Concept
Routes define URL patterns and map them to controller actions. Laravel supports both web routes (session-based) and API routes (token-based).

### Fundamental Implementation

**Web Routes** (`routes/web.php`)
- Protected by `auth` middleware (session-based)
- Role-based grouping: admin, landlord, tenant
- Resource routes for CRUD operations
- Custom routes for specific actions
- Route model binding with custom keys

**API Routes** (`routes/api.php`)
- Protected by `auth:sanctum` middleware (token-based)
- Versioned: `/api/v1/` and unversioned `/api/`
- Prefix grouping: `auth`, `users`, `tenant`, `landlord`
- Rate limiting on sensitive endpoints
- For mobile app consumption

**Middleware** (`app/Http/Middleware/`)
- `HandleInertiaRequests`: Shares props, sets root view
- `RedirectIfAuthenticatedWithRole`: Role-based redirects
  - Skips logout route
  - Allows POST login
  - Uses `RoleRedirects::urlByRole()` helper

**Route Model Binding**
- Custom route keys: `tenant_code` instead of `id`
- Implicit binding in controller methods
- Route constraints: `->where('tenant', '[A-Z0-9\-]+')`

### Key Patterns
- **Middleware grouping**: Apply auth to route groups
- **Route naming**: `route('name')` for URL generation
- **Resource controllers**: Standard CRUD routes
- **API versioning**: Backwards compatibility
- **Rate limiting**: `throttle:5,1` (5 requests per minute)
- **Route caching**: Improve performance (not currently used)

### Flow
1. Request enters → Middleware stack executes
2. Route matched → Controller method invoked
3. Model binding → Parameter automatically resolved
4. Action executes → Response returned
5. Web: Inertia response | API: JSON response

---

## 5. React/Inertia Component Patterns

### Core Concept
React components receive data as props from Inertia and manage local state. Shadcn/ui provides pre-built UI components for consistent design.

### Fundamental Implementation

**Component Structure** (`resources/js/components/tenant-edit-modal.tsx`)
```typescript
interface Props {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  // ... typed props
}

export default function TenantEditModal({ isOpen, onClose, tenant }: Props) {
  const [formData, setFormData] = useState<any>({...});
  const [isLoading, setIsLoading] = useState(false);

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Dynamic form rendering based on editType
  const renderFormFields = () => {
    switch (editType) {
      case 'personal': return <PersonalForm />;
      case 'emergency': return <EmergencyForm />;
      // ... more cases
    }
  };
}
```

**State Management**
- Local state with `useState` for form data, loading states
- Props passed from parent (page component)
- No global state management (Redux/Zustand not used)
- Inertia handles server state via page visits

**Form Patterns**
- Controlled inputs with `value` and `onChange`
- Select components from shadcn/ui
- Form validation handled server-side (Laravel validation)
- Error handling via Inertia `onError` callback

**Modal Pattern**
- Dialog component from shadcn/ui
- Controlled by `isOpen` prop
- Form submission closes modal
- Loading state prevents double submission

**Shadcn/ui Components**
- Import from `@/components/ui/`
- Pre-built: Button, Input, Select, Dialog, Card, Table, etc.
- Tailwind CSS for styling
- Radix UI primitives for accessibility

### Key Patterns
- **TypeScript interfaces**: Type safety for props
- **Controlled components**: React manages form state
- **Conditional rendering**: Dynamic form fields
- **Composition**: Small components composed into larger ones
- **Server-side validation**: Laravel validates, React displays errors
- **Inertia navigation**: `router.visit()`, `router.post()`, `router.reload()`

### Flow
1. Page component receives props from Inertia
2. Component renders with initial state
3. User interacts → Local state updates
4. Form submission → Inertia makes request
5. Server validates → Returns errors or success
6. Component updates → Shows errors or redirects

---

## 6. Testing Patterns

### Core Concept
Pest is a testing framework with a focus on simplicity. It provides a clean syntax for writing tests and integrates with Laravel's testing tools.

### Fundamental Implementation

**Pest Configuration** (`tests/Pest.php`)
- Extends `TestCase` class
- Uses `RefreshDatabase` trait for Feature tests
- Custom expectations can be added
- Helper functions can be defined globally

**Test Structure** (`tests/Feature/Landlord/TenantTest.php`)
```php
uses(RefreshDatabase::class);

beforeEach(function () {
    $this->landlord = User::factory()->create(['role' => 'landlord']);
    $this->property = Property::factory()->create(['owner_id' => $this->landlord->id]);
    $this->unit = Unit::factory()->create(['property_id' => $this->property->id]);
});

test('landlord can view tenant index', function () {
    actingAs($this->landlord)
        ->get(route('landlord.tenants.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('landlord/tenants/index'));
});
```

**Service Testing** (`tests/Feature/Services/OnboardingServiceTest.php`)
```php
it('onboards a new tenant and relates them to an occupied unit', function () {
    $property = Property::factory()->create(['total_units' => 1]);
    $unit = Unit::factory()->create(['property_id' => $property->id, 'status' => 'available']);

    $data = [...];

    $service = new OnboardingService();
    $result = $service->onboard($data);

    expect(Tenant::count())->toBe(1)
        ->and($result['tenant']->email)->toBe($data['email']);
});
```

**Authentication Testing** (`tests/Feature/Auth/AuthenticationTest.php`)
```php
test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'username' => $user->username,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect();
});
```

### Key Patterns
- **Factories**: Create test data with `Model::factory()->create()`
- **Acting as**: Authenticate as user with `actingAs($user)`
- **Assertions**: `assertSuccessful()`, `assertRedirect()`, `assertInertia()`
- **Expectations**: Pest's `expect()` syntax
- **RefreshDatabase**: Clean database for each test
- **Data providers**: Test with multiple datasets using `->with([])`

### Test Categories
- **Feature tests**: Full request/response cycle
- **Unit tests**: Individual methods/classes
- **Service tests**: Business logic isolation
- **Model tests**: Relationships and scopes
- **API tests**: API endpoint validation

### Flow
1. Test runs → Database refreshed
2. Setup runs (beforeEach) → Test data created
3. Test executes → Assertions made
4. Assertions pass/fail → Test result reported
5. Database cleaned → Next test runs

---

## 7. Business Logic Workflows

### Core Concept
Business logic is encapsulated in Service classes that handle complex operations, ensuring controllers remain thin and logic is reusable.

### Fundamental Implementation

**Onboarding Service** (`app/Services/Landlord/OnboardingService.php`)
```php
public function onboard(array $data): array
{
    return DB::transaction(function () use ($data) {
        // 1. Create or Find Tenant
        $tenant = Tenant::updateOrCreate(
            ['email' => $data['email'], 'phone' => $data['phone']],
            ['full_name' => $data['full_name']]
        );

        // 2. Create Tenancy
        $tenancy = Tenancy::create([...]);

        // 3. Mark unit as occupied
        Unit::where('id', $data['unit_id'])->update(['status' => 'occupied']);

        return ['tenant' => $tenant, 'tenancy' => $tenancy];
    });
}
```

**Payment Service** (`app/Services/PaymentService.php`)
```php
public function processPayment(array $validated, Tenancy $activeTenancy, ?Payment $existingPayment = null): array
{
    return DB::transaction(function () use ($validated, $activeTenancy, $existingPayment) {
        // 1. Duplicate prevention
        if (!$existingPayment) {
            $recentDuplicate = $activeTenancy->payments()
                ->where('amount', $validated['amount'])
                ->where('created_at', '>=', now()->subSeconds(30))
                ->exists();
        }

        // 2. Business Logic for Rent vs Utility
        if ($validated['payment_type'] === 'utility' && $utilityBillId) {
            $bill = UtilityBill::find($utilityBillId);
            $utilityService->processUtilityPayment($bill, $validated['amount']);
        }

        // 3. Create or update payment record
        $payment = Payment::create($paymentData);

        return ['success' => true, 'payment' => $payment];
    });
}
```

**Tenant Service** (`app/Services/Landlord/TenantService.php`)
- Handles tenant CRUD operations
- Manages unit changes
- Calculates pending amounts
- Filters and paginates tenant lists

**Utility Service** (`app/Services/UtilityService.php`)
- Manages utility types and bills
- Processes utility payments
- Calculates consumption
- Waives bills when needed

### Key Patterns
- **Database transactions**: Ensure data consistency
- **Service layer**: Controllers delegate to services
- **Duplicate prevention**: Check recent submissions
- **Business rules**: Encapsulated in service methods
- **Return arrays**: Structured responses for controllers

### Workflow Examples

**Tenant Onboarding**
1. Landlord submits form → Controller validates request
2. Controller calls `OnboardingService::onboard()`
3. Service creates/updates tenant
4. Service creates tenancy
5. Service updates unit status
6. Transaction commits
7. Controller redirects with success message

**Payment Processing**
1. Tenant submits payment → Controller validates
2. Controller calls `PaymentService::processPayment()`
3. Service checks for duplicates
4. Service determines payment type (rent/utility)
5. Service updates bill status (if utility)
6. Service creates payment record
7. Transaction commits
8. Controller reloads page with updated data

**Unit Change**
1. Landlord selects new unit → Controller validates
2. Controller calls `TenantService::changeUnit()`
3. Service updates tenancy unit_id
4. Service marks old unit as available
5. Service marks new unit as occupied
6. Transaction commits
7. Controller redirects with success message

---

## 8. Mobile App Architecture

### Core Concept
The mobile app is a React Native application that consumes the Laravel API. It uses Expo for development and React Navigation for routing.

### Fundamental Implementation

**App Structure** (`mobile/App.tsx`)
```typescript
export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
      {isSplashVisible && <SplashScreen />}
    </GestureHandlerRootView>
  );
}
```

**Auth Context** (`mobile/src/context/AuthContext.tsx`)
- Provides auth state globally
- Methods: `login()`, `register()`, `logout()`, `refreshUser()`
- Stores token in secure storage
- Checks auth on app load

**Session Manager** (`mobile/src/services/SessionManager.ts`)
- Device fingerprinting for security
- Session creation and validation
- Activity tracking for timeout
- Secure token storage with Expo SecureStore
- Device info: deviceId, deviceName, deviceType, fingerprint

**API Integration**
- API client configured with base URL
- Token injection in headers
- Error handling and retry logic
- Type definitions for requests/responses

**Navigation** (`mobile/src/navigation/AppNavigator.tsx`)
- Stack navigation for screens
- Tab navigation for main sections
- Auth flow: Login → Dashboard
- Role-based screen access

### Key Patterns
- **Context API**: Global state for auth
- **Secure storage**: Tokens stored securely
- **Device fingerprinting**: Security measure
- **Session timeout**: Inactivity detection
- **TypeScript**: Type-safe API calls
- **React Navigation**: Screen routing
- **Expo**: Development tooling

### Flow
1. App launches → Splash screen shows
2. Auth context initializes → Checks for token
3. Session manager validates → Checks fingerprint
4. If valid → Navigate to dashboard
5. If invalid → Navigate to login
6. User logs in → Token stored
7. Session created → Device fingerprint stored
8. API calls include token → Server validates

### Security Features
- Secure token storage (Expo SecureStore)
- Device fingerprinting (SHA256 hash)
- Session timeout (30 days inactivity)
- Activity tracking (last activity timestamp)
- Token refresh on app resume

---

## Summary of Key Architectural Decisions

1. **Authentication**: Session-based (Fortify) for web, token-based (Sanctum) for mobile
2. **Data Flow**: Server-side rendering via Inertia (no API calls for web)
3. **Database**: Eloquent ORM with relationships and scopes
4. **Routing**: Web routes for Inertia, API routes (`auth:sanctum` guarded) for mobile
5. **Frontend**: React with TypeScript, shadcn/ui components
6. **Testing**: Pest with factories and refresh database
7. **Business Logic**: Service layer with transactions
8. **Mobile**: React Native with Expo, secure token storage (SecureStore), device fingerprinting

### Package Versions (from Laravel Boost)
- **PHP**: 8.5
- **Laravel**: 12.56.0
- **Inertia Laravel**: 2.0.22
- **Fortify**: 1.36.2
- **Sanctum**: 4.3.1
- **Wayfinder**: 0.1.15
- **Ziggy**: 2.6.2
- **Laravel Boost**: 2.4.4
- **Pest**: 4.4.3
- **React**: 19.2.3
- **TailwindCSS**: 4.1.18
- **Database Engine**: MySQL

---

## Current Issues & Known Problems

### Lazy Loading Violations
**Issue:** Payment model attempts to lazy load the `tenant` relationship without eager loading, causing `Illuminate\Database\LazyLoadingViolationException`.

**Location:** `app/Models/Payment.php` - The `getTenantCodeAttribute()` accessor calls `$this->tenant` without eager loading.

**Impact:** API endpoints that serialize Payment models (e.g., `TenantController@show`, `UtilityBillController@index`) throw exceptions.

**Solution:** Add eager loading in controllers:
```php
Payment::with('tenant')->get();
```


## Knowledge Gap Areas to Deepen

Based on this analysis, consider deepening knowledge in:

1. **Inertia.js advanced features**: Deferred props, polling, infinite scroll
2. **Eloquent relationships**: Polymorphic relationships, many-to-many
3. **Laravel policies**: Authorization logic beyond middleware
4. **Service layer patterns**: Dependency injection, interfaces
5. **Testing strategies**: Browser testing, API testing contracts
6. **Mobile security**: Certificate pinning, biometric auth
7. **Performance optimization**: Caching, query optimization, lazy loading prevention
8. **Error handling**: Exception handling, logging strategies, eager loading best practices
9. **Database migrations**: Understanding migration order, rollback strategies
10. **Utility billing system**: Meter reading, consumption calculation, billing cycles
