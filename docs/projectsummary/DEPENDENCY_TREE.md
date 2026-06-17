# Dependency Tree Documentation

> Last updated: 2026-05-20

## Overview
This document provides a complete inventory of all dependencies, their exact versions, transitive dependencies, and any known conflicts or compatibility issues in the Estate Practice application.

> **Note**: All packages below reflect versions installed on `port/payment-architecture` branch. Actual locked versions can be read from `composer.lock` and `package-lock.json`.

---

## PHP Dependencies

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| laravel/framework | ^12.0 (12.59.0) | Core Laravel framework |
| laravel/fortify | ^1.37 (1.37.1) | Authentication backend (Web) |
| laravel/sanctum | ^4.3 (4.3.2) | Authentication backend (API) |
| laravel/tinker | ^2.10.1 | REPL for Laravel |
| laravel/wayfinder | ^0.1.20 | Routing helpers |
| laravel/reverb | ^1.10 (1.10.2) | WebSocket server for real-time events |
| twilio/sdk | ^8.x (8.11.6) | WhatsApp notification channel via Twilio API |
| barryvdh/laravel-dompdf | ^3.x (3.1.2) | PDF generation for payment receipts (DomPDF) |

### Server-Side Rendering

| Package | Version | Purpose |
|---------|---------|---------|
| inertiajs/inertia-laravel | ^2.0 (2.0.24) | Inertia.js server-side adapter |
| tightenco/ziggy | ^2.6 (2.6.2) | Route helpers for JavaScript |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| laravel/sail | ^1.59 (1.59.0) | Docker development environment |
| laravel/pint | ^1.29 (1.29.1) | Code formatter |
| laravel/pail | ^1.2 (1.2.6) | Log tailing |
| mockery/mockery | ^1.6 | Mocking library |
| nunomaduro/collision | ^8.6 | Error handling |
| pestphp/pest | ^4.7 (4.7.0) | Testing framework |
| pestphp/pest-plugin-laravel | ^4.0 | Laravel Pest integration |
| fakerphp/faker | ^1.23 | Fake data generation |

---

## Node.js Dependencies

### Production Dependencies

#### React & DOM

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.3 | React library |
| react-dom | ^19.2.3 | React DOM rendering |

#### Inertia.js

| Package | Version | Purpose |
|---------|---------|---------|
| @inertiajs/react | ^2.3.10 | Inertia.js React adapter |
| @inertiajs/server | ^2.3.10 | Inertia.js SSR |

#### UI Components (Radix + shadcn/ui)

| Package | Version | Purpose |
|---------|---------|---------|
| @radix-ui/react-accordion | ^1.2.11 | Accordion component |
| @radix-ui/react-alert-dialog | ^1.1.10 | Alert dialog |
| @radix-ui/react-avatar | ^1.1.7 | Avatar component |
| @radix-ui/react-badge | ^1.1.10 | Badge component |
| @radix-ui/react-checkbox | ^1.3.1 | Checkbox component |
| @radix-ui/react-dialog | ^1.1.10 | Dialog/modal |
| @radix-ui/react-dropdown-menu | ^1.1.11 | Dropdown menu |
| @radix-ui/react-label | ^2.1.4 | Form labels |
| @radix-ui/react-popover | ^1.1.10 | Popover component |
| @radix-ui/react-progress | ^1.1.4 | Progress bar |
| @radix-ui/react-radio-group | ^1.2.10 | Radio buttons |
| @radix-ui/react-scroll-area | ^1.2.8 | Scrollable area |
| @radix-ui/react-select | ^1.2.12 | Select dropdown |
| @radix-ui/react-separator | ^1.1.6 | Divider |
| @radix-ui/react-slider | ^1.2.8 | Slider component |
| @radix-ui/react-slot | ^1.1.6 | Slot component |
| @radix-ui/react-switch | ^1.1.8 | Toggle switch |
| @radix-ui/react-tabs | ^1.1.7 | Tabs component |
| @radix-ui/react-toast | ^1.2.10 | Toast notifications |
| @radix-ui/react-tooltip | ^1.1.11 | Tooltip component |
| @radix-ui/react-navigation-menu | ^1.2.12 | Navigation menu |

#### Icons & Media

| Package | Version | Purpose |
|---------|---------|---------|
| lucide-react | ^0.475.0 | Icon library |

#### Real-time (WebSockets)

| Package | Version | Purpose |
|---------|---------|---------|
| laravel-echo | ^2.3.4 | Client-side WebSocket event listening |

#### Form Handling & Validation

| Package | Version | Purpose |
|---------|---------|---------|
| zod | ^4.3.6 | Schema validation |
| react-hook-form | ^7.56.3 | Form handling |
| @hookform/resolvers | ^2.10.5 | Hook form resolvers |

#### Charts & Visualization

| Package | Version | Purpose |
|---------|---------|---------|
| recharts | ^2.15.4 | Chart library |

#### Routing

| Package | Version | Purpose |
|---------|---------|---------|
| ziggy-js | ^2.6.0 | Route helpers for JS |

#### Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| clsx | ^2.1.1 | Class name utility |
| tailwind-merge | ^2.7.0 | Tailwind class merging |
| class-variance-authority | ^0.7.1 | CVA utility |

---

### Development Dependencies

#### Build Tools

| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^7.0.4 | Build tool |
| @vitejs/plugin-react | ^4.3.4 | Vite React plugin |
| tailwindcss | ^4.1.18 | CSS framework |
| tailwindcss-animate | ^1.0.7 | Tailwind animations |
| @tailwindcss/vite | ^4.0.0 | Tailwind Vite plugin |

#### TypeScript

| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5.7.2 | TypeScript compiler |
| @types/react | ^19.0.8 | React types |
| @types/react-dom | ^19.0.3 | React DOM types |
| @types/node | ^22.13.1 | Node.js types |

#### Linting & Formatting

| Package | Version | Purpose |
|---------|---------|---------|
| eslint | ^9.39.2 | Linter |
| @eslint/js | ^9.17.0 | ESLint JS support |
| @eslint/eslintrc | ^3.2.0 | ESLint config |
| globals | ^15.14.0 | Global variables |
| eslint-plugin-react | ^7.37.4 | React ESLint plugin |
| eslint-plugin-react-hooks | ^5.2.0 | React hooks linting |
| eslint-plugin-react-refresh | ^0.4.17 | React refresh linting |
| prettier | ^3.8.0 | Code formatter |
| eslint-config-prettier | ^10.0.1 | Prettier ESLint config |

#### shadcn/ui

| Package | Version | Purpose |
|---------|---------|---------|
| shadcn | ^3.7.0 | UI component CLI |

---

## Mobile Dependencies

### React Native / Expo

| Package | Version | Purpose |
|---------|---------|---------|
| expo | ~52.0.0 | Expo SDK |
| react | 18.3.1 | React library |
| react-native | 0.76.9 | React Native |
| expo-status-bar | ~2.0.0 | Status bar |
| @react-navigation/native | ^7.0.0 | Navigation |
| @react-navigation/native-stack | ^7.0.0 | Stack navigator |
| react-native-screens | ~4.4.0 | Native screens |
| react-native-safe-area-context | ^4.14.0 | Safe area |
| axios | ^1.7.9 | HTTP client |
| expo-secure-store | ~14.0.0 | Secure storage |
| expo-document-picker | ~13.0.0 | File picker for document uploads |
| @react-native-async-storage/async-storage | ^2.1.0 | Async storage |

#### Mobile Testing (Development)

| Package | Version | Purpose |
|---------|---------|---------|
| jest | ^29.7.0 | Testing framework |
| jest-expo | ~52.0.0 | Expo-specific Jest preset |
| @testing-library/react-native | ^12.9.0 | React Native testing utilities |
| react-test-renderer | 18.3.1 | React test rendering |

---

## Dependency Conflict Notes

### Known Compatibility Issues

#### 1. TailwindCSS 4.x

**Status**: Stable at v4.1.18. Uses `@tailwindcss/vite` plugin. No compatibility issues.

#### 2. React 19

**Status**: Stable at v19.2.3. All libraries support React 19. No type issues with `@types/react@19`.

#### 3. Zod 4.x

**Status**: Stable at v4.x. No breaking changes encountered. Schema definitions working correctly.

#### 4. Radix UI Versions

**Issue**: Multiple Radix packages need compatible versions

**Impact**: UI components may break if mismatched

**Resolution**: Use consistent versions (all ^1.x)

---

## Transitive Dependencies

### Laravel Framework Dependencies

The `laravel/framework` package brings in:

- `illuminate/*` (all Laravel components)
- `symfony/*` (Symfony components)
- `psr/*` (PHP standards)
- `monolog/monolog` (logging)
- `league/flysystem` (filesystem)
- `ramsey/uuid` (UUID generation)
- `brick/math` (math operations)
- `dragonmantank/cron` (scheduler)

### React Dependencies

The `@inertiajs/react` package requires:

- react (16.x, 17.x, 18.x, or 19.x)
- react-dom (same version as react)

### shadcn Dependencies

The `shadcn` CLI installs:

- Radix UI primitives
- TailwindCSS utilities
- clsx, tailwind-merge, class-variance-authority

---

## Version Constraints Explained

| Constraint | Meaning |
|------------|---------|
| `^1.0` | >= 1.0.0 and < 2.0.0 |
| `~1.0` | >= 1.0.0 and < 1.1.0 |
| `1.0.x` | >= 1.0.0 and < 1.1.0 |
| `*` | Any version |
| `>=1.0 <2.0` | Between versions |

---

## Updating Dependencies

### Update PHP Dependencies

```bash
# Update all dependencies
composer update

# Update specific package
composer update laravel/framework

# Check for outdated
composer outdated
```

### Update Node Dependencies

```bash
# Update all dependencies
npm update

# Update specific package
npm update react

# Check for outdated
npm outdated
```

### Update All

```bash
# Install latest versions
composer update
npm install

# Clear caches
php artisan optimize:clear
```

---

## Security Considerations

### PHP Dependencies

| Package | Security Note |
|---------|---------------|
| laravel/fortify | Maintained by Laravel team |
| laravel/sanctum | Maintained by Laravel team |
| mockery/mockery | Development only |

### Node Dependencies

| Package | Security Note |
|---------|---------------|
| zod | Actively maintained |
| react-hook-form | Actively maintained |
| recharts | Check for vulnerabilities |

---

## Dependency File Locations

| Type | Location |
|------|----------|
| PHP (lock) | `composer.lock` |
| PHP (config) | `composer.json` |
| Node (lock) | `package-lock.json` |
| Node (config) | `package.json` |
| Mobile (lock) | `mobile/package-lock.json` |
| Mobile (config) | `mobile/package.json` |

---

## Summary

This dependency tree documentation covers:

1. **PHP Dependencies**: Core Laravel framework, Fortify, development tools
2. **Node.js Dependencies**: React, Inertia, shadcn/ui (Radix), form handling, charts
3. **Development Dependencies**: Build tools (Vite, TailwindCSS), TypeScript, linting
4. **Mobile Dependencies**: React Native/Expo packages
5. **Known Conflicts**: TailwindCSS 4, React 19, Zod 4, Radix UI versions
6. **Transitive Dependencies**: What each major package brings in
7. **Version Constraints**: Composer and NPM version syntax
8. **Updating Dependencies**: How to update packages
9. **Security**: Security considerations for dependencies
10. **File Locations**: Where dependencies are configured
