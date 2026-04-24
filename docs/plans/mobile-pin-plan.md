# Mobile PIN Lock Implementation Plan

This plan details the addition of a "Minimalist Luxury" PIN lock feature to the React Native/Expo mobile application. This feature ensures that the persistent Sanctum session is protected locally whenever the app is opened or resumed from the background.

## User Review Required
> [!IMPORTANT]
> **PIN Storage Strategy**: As discussed, the PIN will be stored **locally** in the device's `SecureStore`. The server will not manage the PIN. If the user clears the app data, they will need to log in again with their full credentials to set a new PIN.
> **Biometrics**: I will include **FaceID/TouchID** support alongside the PIN as a "Premium" luxury feature. Please confirm if you want this enabled by default.

## Proposed Changes

### 1. Context & Global State
- **[MODIFY] [AuthContext.tsx](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/mobile/src/context/AuthContext.tsx)**:
  - Add `isLocked` (boolean) state.
  - Add `hasPinSet` (boolean) state.
  - Implement `lockApp()`, `unlockApp(pin)`, and `setupPin(pin)` methods.
  - integrate `AppState` listener to set `isLocked = true` when app returns from background.

### 2. UI Components (The "Wow" Factor)
- **[NEW] [PinScreen.tsx](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/mobile/src/screens/auth/PinScreen.tsx)**:
  - A sophisticated, minimalist PIN entry screen.
  - Colors: Deep Teal (`#0f4c4c`) and Rich Gold (`#d4a853`).
  - Animated number pad with subtle haptic-like animations using `Reanimated`.
  - Secure indicators (dots) that pulse or glow when a digit is entered.
- **[NEW] [PinSetupScreen.tsx](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/mobile/src/screens/auth/PinSetupScreen.tsx)**:
  - A screen to set up a 4 or 6-digit PIN during the first-time login process.

### 3. Navigation Guard
- **[MODIFY] [AppNavigator.tsx](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/mobile/src/navigation/AppNavigator.tsx)**:
  - Wrap the `Main` stack in a condition that checks `isLocked`.
  - If `isAuthenticated` is true AND `isLocked` is true, show the `PinScreen` modally on top of everything.

### 4. Utilities
- **[MODIFY] [storage.ts](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/mobile/src/utils/storage.ts)**:
  - Add specific getters/setters for `api_pin_hash` to ensure it is always handled via `SecureStore`.

## Open Questions
> [!WARNING]
> 1. **PIN Length**: Should we go with a **4-digit** (faster) or **6-digit** (more secure) PIN? 
> 2. **Auto-Lock Timeout**: Should the app lock *instantly* upon minimization, or should there be a short grace period (e.g., 30 seconds) before the PIN is required again?
> 3. **Biometrics**: Should we include FaceID/TouchID support as a premium feature?

## Verification Plan

### Manual Verification
- **Cold Start**: Close the app entirely and open it. Verify PIN screen appears.
- **Backgrounding**: Open the app, switch to another app, and return. Verify PIN screen appears.
- **First Login**: Log in as a new user. Verify the "Setup PIN" flow triggers immediately after successful authentication.
- **Biometrics**: Test FaceID/TouchID (if available on simulator/device) as a bypass for the PIN.
