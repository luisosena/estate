# Sanctum Evolution Roadmap: From Pure Sanctum to Advanced Session Intelligence

## Phase 1: Pure Sanctum (Current State)
We have successfully transitioned from a custom, high-maintenance `ApiToken` system to a standard **Laravel Sanctum** implementation.

### Implementation Details:
- **Token Type**: Permanent Personal Access Tokens (Sanctum default).
- **Authentication Guard**: `auth:sanctum`.
- **Logic**:
    - `login`: Issues a standard Sanctum token and returns it along with user metadata.
    - `register`: Same as login, using the `CreateNewUser` action.
    - `logout`: Revokes the `currentAccessToken()` and clears the authentication state.
    - `me`: Returns current user details.
- **Security Strategy**:
    - **No Expiration**: Tokens do not expire by default, providing a "Login Once" experience for mobile users.
    - **App Lock**: Security is delegated to the mobile application via a Client-Side PIN/Biometric lock.
    - **Server-Side Control**: Admins can still revoke individual tokens manually if a device is reported lost.

### Cleanup Accomplished:
- Deleted `ApiToken` model and migrations.
- Removed `AuthenticateApiToken` custom middleware.
- Removed `SessionController` and legacy session management routes.
- Pruned redundant `refresh_token` logic and tests.

---

## Phase 2: Advanced Session Intelligence (Future Roadmap)
While "Pure Sanctum" provides stability, we plan to re-introduce advanced features using Sanctum's flexible metadata system.

### 1. Device & Activity Tracking
Instead of a custom table, we will utilize the `name` field or the `abilities` JSON in the `personal_access_tokens` table to store basic device info.
- **Modification**: Pass a device identifier string during `createToken()`.
- **Feature**: Allow users to see a "last used at" timestamp and device name in the app.

### 2. Location & IP Auditing
We will implement an `Event Listener` for `Laravel\Sanctum\Events\TokenAuthenticated`.
- **Mechanism**: When a token is used, log the IP and approximate location (via GeoIP) to a separate `audit_logs` table (keep `personal_access_tokens` clean).
- **Benefit**: Security alerts for "Login from new location."

### 3. Biometric Verification Metadata
If we decide to enforce server-side biometric verification (e.g., using WebAuthn or similar), we can store the "Biometric-verified" status in a `token_metadata` table linked to the Sanctum token ID.

### 4. Selective Session Termination (New Session UI)
We will re-implement a cleaner `SessionController` that scans `personal_access_tokens` for the current user and allows them to:
- See all active devices.
- Remotely revoke specific devices.

---

## Summary of Changes
| Feature | Legacy System | Pure Sanctum (Now) | Evolution (Next) |
| :--- | :--- | :--- | :--- |
| **Storage** | `api_tokens` (Custom) | `personal_access_tokens` | `personal_access_tokens` + Audit Table |
| **Logic** | Manual Hashing / Rotation | Standard Sanctum | Sanctum + Event Observers |
| **Security** | 8h Rotation / Refresh | Permanent + PIN Lock | Permanent + Biometric/IP Audits |
| **Maintenance** | High | Minimal | Moderate (Feature-rich) |

> [!IMPORTANT]
> The current implementation is fully compatible with standard Laravel tools and easy to maintain. Phase 2 should only be initiated when the extra security metadata becomes a business requirement.
