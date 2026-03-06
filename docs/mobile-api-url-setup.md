# Mobile App — API URL Configuration

## Problem

When testing the Expo mobile app on a **physical Android device** via Expo Go, all API calls fail (login, database reads/writes, etc.) while the app works perfectly on **web**.

### Root Cause

| Platform | What `localhost` resolves to | Works? |
|---|---|---|
| Web browser (on PC) | The PC itself | ✅ |
| Android emulator | The emulator VM (use `10.0.2.2` to reach the PC) | ✅ |
| Physical phone (Expo Go) | The phone itself | ❌ |

A physical phone has no way to reach `localhost` or `10.0.2.2` on your PC. It needs your PC's **actual Wi-Fi IP address**.

Additionally, Laravel's `php artisan serve` binds to `127.0.0.1` by default, rejecting connections from other devices on the network.

---

## Changes Made

### 1. `mobile/src/api/client.ts`

Updated `getApiBaseUrl()` to:
- Prioritize the `EXPO_PUBLIC_API_URL` environment variable (from `.env`)
- Add separate fallbacks for web, Android emulator, and iOS simulator
- Log a `console.warn` on Android when no env var is set, reminding developers to configure `.env` for physical devices

### 2. `mobile/.env` (new, gitignored)

Created a `.env` file with:
```env
EXPO_PUBLIC_API_URL=http://<YOUR_PC_WIFI_IP>:8000/api/v1
```

Expo automatically loads this file and exposes variables prefixed with `EXPO_PUBLIC_`. **Restart Expo after any changes** (`npx expo start --clear`).

---

## Usage

### Starting the Backend (for physical device access)

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

`--host=0.0.0.0` makes Laravel accept connections from any device on the network, not just localhost.

### Finding Your PC's Wi-Fi IP

**PowerShell:**
```powershell
(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi").IPAddress
```

**Or via `ipconfig`:** look under "Wireless LAN adapter Wi-Fi" → "IPv4 Address".

### Updating After IP Change

Edit `mobile/.env` and replace the IP, then restart Expo:
```env
EXPO_PUBLIC_API_URL=http://<NEW_IP>:8000/api/v1
```

---

## Future Enhancement

> **TODO:** Implement an IP auto-detect script that automatically discovers the PC's Wi-Fi IP and writes it to `mobile/.env` before starting Expo, eliminating the need to manually update the IP after each network reconnect.
