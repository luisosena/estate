# Implementation Plan: Mobile App User CRUD Functionality

## Overview

This document outlines a comprehensive implementation plan to add User CRUD (Create, Read, Update, Delete) functionality to the mobile app. The implementation follows the existing architectural patterns, API structure, and UI conventions of the Estate Practice application.

---

## 1. Project Analysis

### 1.1 Current State

**Backend** (`app/Http/Controllers/Api/`):
- `AuthController.php` - Handles login, token refresh, logout (registration via web/app)
- `Landlord/TenantController.php` - Manages tenants (CRUD already implemented for tenants)
- `Landlord/PropertyController.php`, `UnitController.php`, etc. - Domain-specific CRUD

**Mobile App** (`mobile/src/`):
- `api/auth.ts` - Authentication API client
- `api/landlord.ts` - Landlord API endpoints
- `api/tenant.ts` - Tenant API endpoints
- `screens/tenant/ProfileScreen.tsx` - Displays user info (read-only)
- `screens/landlord/ProfileScreen.tsx` - Displays user info (read-only)

**What's Missing**:
- ✗ Backend: User profile update endpoints
- ✗ Backend: User deletion endpoints  
- ✗ Backend: User listing endpoints (for admins/landlords)
- ✗ Mobile: User profile edit screens
- ✗ Mobile: User management screens
- ✗ Mobile: API client functions for user management

### 1.2 Reference from Web App

The web application already implements user management:

| Feature | Web Controller | Mobile Implementation |
|---------|---------------|----------------------|
| View Profile | [`ProfileController.php`](app/Http/Controllers/Web/Settings/ProfileController.php:1) | Need to create API + Screen |
| Update Profile | [`ProfileController.php@update`](app/Http/Controllers/Web/Settings/ProfileController.php:42) | Need to create API + Screen |
| Delete Account | [`ProfileController.php@destroy`](app/Http/Controllers/Web/Settings/ProfileController.php:69) | Need to create API + Screen |
| Password Update | [`PasswordController.php`](app/Http/Controllers/Web/Settings/PasswordController.php:1) | Need to create API + Screen |

### 1.3 Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 12, PHP 8.2 |
| Authentication | API Tokens (Bearer) |
| Mobile | React Native (Expo) |
| State Management | React Context (Auth) + API calls |
| UI Components | React Native Paper |
| Navigation | React Navigation |

---

## 2. Implementation Architecture

### 2.1 Backend API Structure

```
/api/
├── v1/                              (versioned routes - recommended)
│   ├── auth/
│   │   ├── login          → POST       (existing)
│   │   ├── register       → POST        (existing)
│   │   ├── logout         → POST        (existing)
│   │   ├── me             → GET         (existing)
│   │   └── refresh        → POST        (existing)
│   ├── users/                          (NEW)
│   │   ├── index         → GET         (list users - admin/landlord)
│   │   ├── show          → GET         (view user details)
│   │   ├── store         → POST        (create user)
│   │   ├── update        → PUT/PATCH   (update user)
│   │   └── destroy       → DELETE      (delete user)
│   ├── tenant/
│   │   ├── profile       → GET/PUT     (tenant's own profile)
│   │   └── ... (existing)
│   └── landlord/
│       └── ... (existing)
```

> **Note:** The existing API uses both unversioned and v1-prefixed routes. It is recommended to use the v1 prefix for new endpoints to maintain consistency with the versioned API structure.

### 2.2 Mobile Navigation Structure

```
Mobile App Navigation:
├── AuthStack
│   └── LoginScreen
├── LandlordTabs
│   ├── Dashboard
│   ├── Properties
│   ├── Tenants
│   ├── Payments
│   └── Profile (NEW - will have edit option)
└── TenantTabs
    ├── Dashboard
    ├── Payments
    ├── Utilities
    └── Profile (NEW - will have edit option)
```

---

## 3. Implementation Phases

### Phase 1: Backend API Development

#### 3.1.1 Create User Controller

**File**: `app/Http/Controllers/Api/UserController.php`

**Responsibilities**:
- List all users (with pagination, search) - **admin/landlord only**
- View single user details - **admin/landlord only**
- Create new users (admin only)
- Update user information
- Delete/deactivate users

> **Security Requirement:** All endpoints must verify user role before proceeding. Add authorization checks in each method.

> **Reuse Tip:** Leverage existing Form Request validation classes from [`app/Http/Requests/Settings/`](app/Http/Requests/Settings/) (e.g., `ProfileUpdateRequest`, `ProfileDeleteRequest`) to maintain consistency with the web app validation logic.

**Methods**:

```php
class UserController extends Controller
{
    // GET /api/users - List all users (paginated)
    // Role required: admin, landlord
    public function index(Request $request)
    {
        // Verify user has admin or landlord role
        if (!in_array($request->user()->role, ['admin', 'landlord'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        // ... implementation
    }
    
    // GET /api/users/{id} - Show user details
    // Role required: admin, landlord
    public function show(int $id)
    {
        if (!in_array(request()->user()->role, ['admin', 'landlord'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        // ... implementation
    }
    
    // POST /api/users - Create new user
    // Role required: admin only
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        // ... implementation
    }
    
    // PUT /api/users/{id} - Update user
    public function update(Request $request, int $id)
    {
        // Users can only update their own profile unless admin
        if ($request->user()->role !== 'admin' && $request->user()->id !== $id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        // ... implementation
    }
    
    // DELETE /api/users/{id} - Delete user
    // Role required: admin only
    public function destroy(int $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        // ... implementation
    }
}
```

#### 3.1.2 Create Tenant Profile Controller

**File**: `app/Http/Controllers/Api/Tenant/ProfileController.php`

**Responsibilities**:
- Get tenant's own profile
- Update tenant's own profile
- (Password update handled separately)

> **Authorization**: Handle authorization within controller methods. Ensure users can only access/update their own profile.

**Methods**:

```php
class ProfileController extends Controller
{
    // GET /api/tenant/profile - Get current tenant profile
    public function show(Request $request)
    {
        $user = $request->user();
        // Only tenants can access tenant profile
        if ($user->role !== 'tenant') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        
        $user->loadMissing('tenant');
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'tenant' => $user->tenant,
            ]
        ]);
    }
    
    // PUT /api/tenant/profile - Update tenant profile
    public function update(Request $request)
    {
        $user = $request->user();
        // Only tenants can update tenant profile
        if ($user->role !== 'tenant') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        
        // Validate and update
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'unique:users,email,' . $user->id],
            'phone' => ['sometimes', 'string', 'max:20'],
        ]);
        
        $user->forceFill($validated)->save();
        
        if ($user->tenant) {
            $user->tenant->update($request->only([
                'full_name', 'phone', 'email',
                'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation'
            ]));
        }
        
        return response()->json(['message' => 'Profile updated successfully']);
    }
}
```

#### 3.1.3 Create Landlord Profile Controller

**File**: `app/Http/Controllers/Api/Landlord/ProfileController.php`

**Responsibilities**:
- Get landlord's own profile
- Update landlord's own profile

> **Authorization**: Handle authorization within controller methods. Ensure users can only access/update their own profile.

**Methods**:

```php
class ProfileController extends Controller
{
    // GET /api/landlord/profile - Get current landlord profile
    public function show(Request $request)
    {
        $user = $request->user();
        // Only landlords can access landlord profile
        if ($user->role !== 'landlord') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        
        $user->loadMissing('landlord');
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'landlord' => $user->landlord,
            ]
        ]);
    }
    
    // PUT /api/landlord/profile - Update landlord profile
    public function update(Request $request)
    {
        $user = $request->user();
        // Only landlords can update landlord profile
        if ($user->role !== 'landlord') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        
        // Validate and update
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'unique:users,email,' . $user->id],
            'phone' => ['sometimes', 'string', 'max:20'],
        ]);
        
        $user->forceFill($validated)->save();
        
        if ($user->landlord) {
            $user->landlord->update($request->only(['business_name', 'phone']));
        }
        
        return response()->json(['message' => 'Profile updated successfully']);
    }
}
```

#### 3.1.5 Create Password Update Controllers

**Files**: 
- `app/Http/Controllers/Api/Tenant/PasswordController.php`
- `app/Http/Controllers/Api/Landlord/PasswordController.php`

**Responsibilities**:
- Allow users to change their own password
- Validate current password before updating

> **Security:** Always verify the user's current password before allowing changes.

**Tenant Password Controller Example**:

```php
class PasswordController extends Controller
{
    // PUT /api/tenant/password
    public function update(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'tenant') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);
        
        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'The current password is incorrect.'
            ], 422);
        }
        
        $user->forceFill([
            'password' => Hash::make($validated['password'])
        ])->save();
        
        return response()->json(['message' => 'Password updated successfully']);
    }
}
```

> **Note:** Use the same pattern for Landlord Password Controller, checking for `landlord` role instead.

#### 3.1.4 Update API Routes

**File**: `routes/api.php`

Add the following routes:

```php
// User Management (Admin/Landlord only - role check in controller)
Route::middleware('auth.api')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::patch('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});

// Tenant Profile - authorization handled in controller
Route::middleware('auth.api')->group(function () {
    Route::get('/tenant/profile', [Tenant\ProfileController::class, 'show']);
    Route::put('/tenant/profile', [Tenant\ProfileController::class, 'update']);
});

// Landlord Profile - authorization handled in controller
Route::middleware('auth.api')->group(function () {
    Route::get('/landlord/profile', [Landlord\ProfileController::class, 'show']);
    Route::put('/landlord/profile', [Landlord\ProfileController::class, 'update']);
});

// Password Update Routes (with rate limiting: 5 attempts per minute)
Route::middleware('auth.api')->group(function () {
    Route::put('/tenant/password', [Tenant\PasswordController::class, 'update'])->middleware('throttle:5,1');
    Route::put('/landlord/password', [Landlord\PasswordController::class, 'update'])->middleware('throttle:5,1');
});
```

> **Security Note:** All user management endpoints must include role-based authorization in controller methods. See Section 3.1.1 for implementation details.

---

### Phase 2: Mobile API Client Development

#### 3.2.1 Extend Types

**File**: `mobile/src/types/index.ts`

Add or update these types:

```typescript
// User Management Types (add to existing types)
export interface User {
  id: number;
  name: string;
  username?: string;
  email: string;
  role: 'tenant' | 'landlord' | 'admin';
  phone?: string;
  tenant_id?: number;
  landlord_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'tenant' | 'landlord' | 'admin';
  // Tenant-specific
  full_name?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  // Landlord-specific
  business_name?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'tenant' | 'landlord' | 'admin';
  phone?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'tenant' | 'landlord' | 'admin';
}

export interface TenantProfileUpdateData {
  full_name?: string;
  phone?: string;
  email?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
}

export interface LandlordProfileUpdateData {
  name?: string;
  phone?: string;
  email?: string;
}
```

#### 3.2.2 Create User API Client

**File**: `mobile/src/api/users.ts`

```typescript
import api from './client';
import type {
  User,
  UserProfile,
  CreateUserData,
  UpdateUserData,
  PaginatedResponse,
} from '../types';

export const userApi = {
  // List all users (admin/landlord only)
  getUsers: (params?: {
    page?: number;
    search?: string;
    role?: string;
  }): Promise<PaginatedResponse<User>> =>
    api.get<PaginatedResponse<User>>('/users', params),

  // Get single user
  getUser: (userId: number): Promise<User> =>
    api.get<User>(`/users/${userId}`),

  // Create new user
  createUser: (data: CreateUserData): Promise<User> =>
    api.post<User>('/users', data),

  // Update user
  updateUser: (userId: number, data: UpdateUserData): Promise<User> =>
    api.put<User>(`/users/${userId}`, data),

  // Delete user
  deleteUser: (userId: number): Promise<void> =>
    api.delete(`/users/${userId}`),
};

export default userApi;
```

#### 3.2.3 Extend Tenant API

**File**: `mobile/src/api/tenant.ts`

Add profile and password methods:

```typescript
// Add to existing tenantApi object
getProfile: (): Promise<{ user: UserProfile }> =>
  api.get<{ user: UserProfile }>('/tenant/profile'),

updateProfile: (data: Partial<TenantProfileUpdateData>): Promise<{ user: UserProfile }> =>
  api.put<{ user: UserProfile }>('/tenant/profile', data),

updatePassword: (data: { current_password: string; password: string; password_confirmation: string }): Promise<{ message: string }> =>
  api.put<{ message: string }>('/tenant/password', data),
```

#### 3.2.4 Extend Landlord API

**File**: `mobile/src/api/landlord.ts`

Add profile and password methods:

```typescript
// Add to existing landlordApi object
getProfile: (): Promise<{ user: UserProfile }> =>
  api.get<{ user: UserProfile }>('/landlord/profile'),

updateProfile: (data: Partial<LandlordProfileUpdateData>): Promise<{ user: UserProfile }> =>
  api.put<{ user: UserProfile }>('/landlord/profile', data),

updatePassword: (data: { current_password: string; password: string; password_confirmation: string }): Promise<{ message: string }> =>
  api.put<{ message: string }>('/landlord/password', data),
```

---

### Phase 3: Mobile Screen Development

#### 3.3.1 Tenant Profile Screen (Enhanced)

**File**: `mobile/src/screens/tenant/ProfileScreen.tsx`

**Features**:
- Display user information (name, email, phone, role)
- Display tenant-specific info (emergency contacts)
- Edit button to navigate to edit screen
- Logout button

**Implementation**:
- Create new `EditProfileScreen.tsx` with form fields
- Use existing API: `tenantApi.updateProfile()`
- Form validation with React Hook Form or manual validation

#### 3.3.2 Landlord Profile Screen (Enhanced)

**File**: `mobile/src/screens/landlord/ProfileScreen.tsx`

**Features**:
- Display user information (name, email, phone, role)
- Edit button to navigate to edit screen
- Logout button

**Implementation**:
- Create new `EditProfileScreen.tsx` with form fields
- Use existing API: `landlordApi.updateProfile()`

#### 3.3.3 User Management Screens (Admin/Landlord)

**New Files Needed**:

1. **`mobile/src/screens/landlord/UsersScreen.tsx`**
   - List all users (if landlord has admin access)
   - Search functionality
   - Pagination
   - Add user button

2. **`mobile/src/screens/landlord/UserDetailsScreen.tsx`**
   - View user details
   - Edit button
   - Delete button

3. **`mobile/src/screens/landlord/UserFormScreen.tsx`**
   - Create/Edit user form
   - Role selection (tenant/landlord)
   - Email, name, phone fields

---

### Phase 4: Navigation Update

#### 3.4.1 Update Navigation Structure

**Landlord Stack Navigation** - Add to existing navigation:

```typescript
// In landlord navigation setup
{
  name: 'Users',
  component: UsersScreen,
  options: { title: 'Users' }
},
{
  name: 'UserDetails',
  component: UserDetailsScreen,
  options: { title: 'User Details' }
},
{
  name: 'UserForm',
  component: UserFormScreen,
  options: { title: 'Add User' } // or 'Edit User'
},
```

#### 3.4.2 Update Tab Navigation

Profile screen already exists in bottom tabs - no change needed to navigation structure.

---

## 4. Detailed Implementation Tasks

### Task Breakdown by File

#### Backend Tasks

| # | File | Action | Description |
|---|------|--------|-------------|
| 1 | `app/Http/Controllers/Api/UserController.php` | Create | New controller for user CRUD with role checks |
| 2 | `app/Http/Controllers/Api/Tenant/ProfileController.php` | Create | Tenant profile management with authorization |
| 3 | `app/Http/Controllers/Api/Landlord/ProfileController.php` | Create | Landlord profile management with authorization |
| 4 | `app/Http/Controllers/Api/Tenant/PasswordController.php` | Create | Tenant password update |
| 5 | `app/Http/Controllers/Api/Landlord/PasswordController.php` | Create | Landlord password update |
| 6 | `routes/api.php` | Update | Add user, profile, and password routes |
| 7 | `app/Http/Middleware/*` | Check/Update | Ensure role middleware exists |

> **Refactoring Note:** Items #2 and #3 (Tenant/ProfileController and Landlord/ProfileController) share ~90% identical code. Consider creating a single controller with role-based logic or using a shared trait to reduce duplication during implementation.

#### Mobile Tasks

| # | File | Action | Description |
|---|------|--------|-------------|
| 1 | `mobile/src/types/index.ts` | Update | Add user management types |
| 2 | `mobile/src/api/users.ts` | Create | New user API client |
| 3 | `mobile/src/api/tenant.ts` | Update | Add profile methods |
| 4 | `mobile/src/api/landlord.ts` | Update | Add profile methods |
| 5 | `mobile/src/screens/tenant/ProfileScreen.tsx` | Enhance | Add edit capability |
| 6 | `mobile/src/screens/tenant/EditProfileScreen.tsx` | Create | Profile edit form |
| 7 | `mobile/src/screens/landlord/ProfileScreen.tsx` | Enhance | Add edit capability |
| 8 | `mobile/src/screens/landlord/EditProfileScreen.tsx` | Create | Profile edit form |
| 9 | `mobile/src/screens/landlord/UsersScreen.tsx` | Create | User list screen |
| 10 | `mobile/src/screens/landlord/UserDetailsScreen.tsx` | Create | User details screen |
| 11 | `mobile/src/screens/landlord/UserFormScreen.tsx` | Create | User create/edit form |

---

## 5. Implementation Steps

### Step 1: Backend User Controller
- [ ] Create `UserController.php` with index, show, store, update, destroy methods
- [ ] Implement proper authorization checks
- [ ] Add validation rules for create/update

### Step 2: Backend Profile Controllers
- [ ] Create `Tenant/ProfileController.php`
- [ ] Create `Landlord/ProfileController.php`
- [ ] Add proper validation and authorization

### Step 3: Backend Routes
- [ ] Add user management routes
- [ ] Add tenant profile routes
- [ ] Add landlord profile routes
- [ ] Test routes with Postman/cURL

### Step 4: Mobile Types
- [ ] Add User, UserProfile, CreateUserData, UpdateUserData types
- [ ] Add TenantProfileUpdateData, LandlordProfileUpdateData types

### Step 5: Mobile API Clients
- [ ] Create `users.ts` API module
- [ ] Update `tenant.ts` with profile methods
- [ ] Update `landlord.ts` with profile methods

### Step 6: Mobile Tenant Screens
- [ ] Enhance ProfileScreen to show edit button
- [ ] Create EditProfileScreen with form
- [ ] Connect to API

### Step 7: Mobile Landlord Screens
- [ ] Enhance ProfileScreen to show edit button
- [ ] Create EditProfileScreen with form
- [ ] Connect to API

### Step 8: Mobile User Management (Optional - Admin only)
- [ ] Create UsersScreen
- [ ] Create UserDetailsScreen
- [ ] Create UserFormScreen
- [ ] Add navigation routes

---

## 6. Code Style Guidelines

### Backend (Laravel/PHP)
- Follow Laravel naming conventions
- Use existing traits and helpers
- Implement proper validation with Form Requests
- Return JSON responses consistently
- Use proper HTTP status codes:
  - 200 for successful updates
  - 201 for successful creates
  - 400 for bad requests
  - 401 for unauthorized
  - 403 for forbidden
  - 404 for not found
  - 422 for validation errors

### Mobile (React Native/TypeScript)
- Follow existing component patterns
- Use React Native Paper components
- Implement proper TypeScript types
- Handle loading and error states
- Use existing styling constants:
  - `screenStyles` from `constants/styles`
  - `colors` from `constants/colors`
- Use the existing API client pattern

---

## 7. API Response Formats

### Success Response (GET)
```json
{
  "data": { ... },
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 100,
    "total_pages": 7
  }
}
```

### Success Response (POST/PUT/DELETE)
```json
{
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error description",
  "errors": {
    "field": ["Error message"]
  }
}
```

---

## 8. Security Considerations

### Backend
- All user endpoints must check authentication
- User management endpoints should be restricted to admin/landlord roles
- Profile update should only allow users to update their own profile
- Implement proper input validation
- Use parameterized queries (Eloquent handles this automatically)

### Mobile
- Store tokens securely (already implemented)
- Clear tokens on logout
- Handle token refresh (already implemented)
- Validate form inputs before submission
- Show appropriate error messages to users

---

## 9. Testing Plan

### Backend Tests
- Test each endpoint with valid/invalid data
- Test authentication requirements
- Test role-based access
- Test validation rules
- Test pagination

### Mobile Tests
- Test profile viewing
- Test profile updating
- Test form validation
- Test error handling
- Test loading states

---

## 10. Dependencies

### Backend
- No new dependencies required
- Uses existing Laravel Fortify, API token authentication

### Mobile
- React Native Paper (already installed)
- React Hook Form (optional, for form validation)
- Existing API client infrastructure

---

## 11. Summary

This implementation plan adds User CRUD functionality to the mobile app by:

1. **Extending the Laravel API** with new endpoints for user management and profile updates
2. **Updating the mobile API client** with new methods for user operations
3. **Enhancing mobile screens** with edit capabilities and user management views
4. **Following existing architectural patterns** for consistency

The implementation maintains backward compatibility and follows all existing code conventions.
