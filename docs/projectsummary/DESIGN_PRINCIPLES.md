# Design Principles

> Last updated: 2026-05-22

## Overview
This document outlines the design patterns, coding conventions, architectural decisions, naming standards, and the technologies used in the Estate Practice application.

## Technology Stack

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Laravel | 12.x (12.59.0) | PHP framework |
| PHP | 8.5 | Server-side language |
| MySQL | 8.0+ | Primary database |
| Redis | - | Caching and sessions |

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.3 | UI framework |
| TypeScript | 5.7.x | Type safety |
| Inertia.js | 2.x (2.0.24) | SSR framework |
| TailwindCSS | 4.1.18 | Utility-first CSS |
| shadcn/ui | 3.7.x | Component library |
| Recharts | 2.15.x | Charting library |
| Zod | 4.3.x | Schema validation |
| Lucide React | 0.475.x | Icon library |

### Mobile Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | - | Mobile framework |
| Expo | - | Build toolchain |

---

## shadcn/ui Component Library Protocol

### Overview
The Estate Practice application heavily relies on shadcn/ui components. This is the PRIMARY and PREFERRED source for all UI components.

### Installation Process

**CRITICAL RULE**: When a new UI component is needed, it MUST be installed fresh from the official shadcn/ui component library using the shadcn CLI tool. NEVER manually create component variations or duplicate existing shadcn components.

### Installation Command
```bash
# From project root (where package.json is located)
npx shadcn@latest add [component-name]
```

For example, to add a button:
```bash
npx shadcn@latest add button
```

### Configuration
The shadcn configuration is stored in `components.json`:

```json
{
  "style": "new-york",
  "baseColor": "neutral",
  "cssVariables": true,
  "iconLibrary": "lucide",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "resources/css/app.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": [
    "@magicui",
    "@animate-ui",
    "@blocks",
    "@bundui"
  ]
}
```

### Available Components
The shadcn/ui library provides the following component categories:

#### Basic Components
- Button, Badge, Card, Avatar
- Input, Textarea, Select
- Checkbox, Radio, Switch
- Label, Form

#### Layout Components
- Sheet (slide-out panel)
- Dialog (modal)
- Dropdown Menu
- Popover, Tooltip
- Tabs, Accordion
- Card, Separator

#### Data Display
- Table
- List
- Calendar
- Skeleton (loading placeholder)

#### Feedback
- Alert, AlertDialog
- Toast, Sonner
- Progress, Spinner
- Skeleton

#### Navigation
- Navigation Menu
- Breadcrumb
- Pagination
- Tabs

### Component Customization Guidelines

#### Using TailwindCSS Utility Classes
All shadcn/ui components support TailwindCSS utility classes for customization. When customizing:

1. **Override styles using Tailwind classes**:
```tsx
<Button className="bg-primary hover:bg-primary/90 text-white">
  Custom Button
</Button>
```

2. **Use CSS variables for design tokens**:
```tsx
<div className="bg-background text-foreground">
  Content
</div>
```

3. **Responsive design**:
```tsx
<Button className="w-full md:w-auto">
  Responsive Button
</Button>
```

#### Available CSS Variables
```css
/* Backgrounds */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;

/* Primary */
--primary: 222.2 47.4% 11.2%;
--primary-foreground: 210 40% 98%;

/* Secondary */
--secondary: 210 40% 96.1%;
--secondary-foreground: 222.2 47.4% 11.2%;

/* Muted */
--muted: 210 40% 96.1%;
--muted-foreground: 215.4 16.3% 46.9%;

/* Accent */
--accent: 210 40% 96.1%;
--accent-foreground: 222.2 47.4% 11.2%;

/* Destructive */
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 210 40% 98%;

/* Borders */
--border: 214.3 31.8% 91.4%;
--input: 214.3 31.8% 91.4%;
--ring: 222.2 84% 4.9%;

/* Radius */
--radius: 0.5rem;
```

### Dark Mode Support
The application uses class-based dark mode. Toggle between modes using the `dark` class on the HTML element:

```tsx
// In a component
<div className="dark:bg-black">
  Content adapts to dark mode
</div>
```

### Never Do This
- ❌ Copy-paste shadcn component code into new files
- ❌ Modify the source files in `@/components/ui/`
- ❌ Create custom variants of existing shadcn components
- ❌ Use different component libraries for similar functionality

### Always Do This
- ✅ Install components via `npx shadcn@latest add`
- ✅ Customize via TailwindCSS utility classes
- ✅ Extend via component composition
- ✅ Use CSS variables for theming

---

## Coding Conventions

### PHP (Laravel)

#### Naming Conventions
- **Classes**: PascalCase (e.g., `UserController`, `PropertyService`)
- **Methods**: camelCase (e.g., `getUser()`, `createProperty()`)
- **Variables**: camelCase (e.g., `$userId`, `$propertyData`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Database Tables**: snake_case, plural (e.g., `user_roles`, `properties`)
- **Database Columns**: snake_case (e.g., `created_at`, `user_id`)

#### Code Style
- Use strict types declaration: `declare(strict_types=1);`
- Use PHP 8+ features (attributes, named arguments, union types)
- Follow PSR-12 coding standards
- Use Laravel's service container for dependency injection

#### Example Controller
```php
<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Landlord\PaymentStoreRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentServiceInterface $paymentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Payment::class);

        $payments = Payment::whereHas('tenancy.unit.property', function ($q) use ($request) {
            $q->where('owner_id', $request->user()->id);
        })->with(['tenant', 'tenancy.unit.property'])->paginate(15);

        return response()->json([
            'data' => PaymentResource::collection($payments),
            'meta' => ['current_page' => $payments->currentPage(), 'last_page' => $payments->lastPage(), 'total' => $payments->total()],
        ]);
    }

    public function store(PaymentStoreRequest $request): JsonResponse
    {
        $this->authorize('create', Payment::class);
        $validated = $request->validated();
        // ...
    }
}
```

### TypeScript/React

#### Naming Conventions
- **Components**: PascalCase (e.g., `PropertyCard.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useAuth.ts`)
- **Utilities**: camelCase (e.g., `formatCurrency.ts`)
- **Types/Interfaces**: PascalCase (e.g., `UserProps.ts`)
- **Constants**: PascalCase for exports, SCREAMING_SNAKE for internals

#### File Organization
```
src/
├── components/
│   ├── ui/              # shadcn components (DO NOT EDIT)
│   ├── layouts/         # Layout components
│   └── features/        # Feature-specific components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── types/               # TypeScript type definitions
└── app/                 # Next.js/React pages
```

#### Component Structure
```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PropertyCardProps {
  id: number;
  name: string;
  address: string;
  onEdit?: (id: number) => void;
}

export function PropertyCard({ id, name, address, onEdit }: PropertyCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-muted-foreground">{address}</p>
      <Button 
        onClick={() => onEdit?.(id)}
        disabled={isLoading}
      >
        Edit
      </Button>
    </Card>
  );
}
```

---

## Architectural Decisions

### 1. Inertia.js for SSR
The application uses Inertia.js for server-side rendering, providing:
- Fast initial page loads
- SEO-friendly pages
- Simplified data fetching
- Type-safe props passing

### 2. API-First Design
Both web and mobile clients use the same API endpoints:
- Web: Session-based authentication via Laravel Fortify
- Mobile: Token-based authentication via API routes

### 3. Role-Based Access Control (RBAC)
Three user roles with hierarchical permissions:
- **Admin**: Full system access
- **Landlord**: Property and tenant management
- **Tenant**: Personal data and payments only

### 4. Service Layer Pattern
Business logic is encapsulated in services with contract interfaces for DI and testability:
- `PaymentService` (implements `PaymentServiceInterface`): Payment processing logic
- `RentBillService` (implements `RentBillServiceInterface`): Rent bill management
- `UtilityService` (implements `UtilityServiceInterface`): Utility tracking operations
- `TenantService`, `UnitService`, `OnboardingService`, `DocumentService`, `NotificationService`, `ReceiptService`, `RevenueAnalyticsService`, `DashboardExportService`, `DocSyncService`

### 5. Form Request Validation
All form submissions use Laravel Form Requests (35+ across the codebase). API endpoints use dedicated requests under `app/Http/Requests/Api/`:
- **Landlord**: `PaymentStoreRequest`, `PaymentUpdateRequest`, `RentBillUpdateRequest`, `TenancyUtilityStoreRequest`, `TenancyUtilityUpdateRequest`, `TenantUpdateRequest`, `UnitStoreRequest`, `UnitUpdateRequest`, `UtilityBillUpdateRequest`
- **Tenant**: `PaymentStoreRequest`, `TenantProfileUpdateRequest`, `TenantUpdateRequest`
- **User**: `UserStoreRequest`, `UserProfileUpdateRequest`, `RegisterPushTokenRequest`
- **Settings**: `PasswordUpdateRequest`, `ProfileDeleteRequest`, `ProfileUpdateRequest`, `TwoFactorAuthenticationRequest`

---

## TailwindCSS Configuration

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
    './storage/framework/views/*.php',
    './resources/views/**/*.blade.php',
    './resources/js/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
```

---

## Directory Structure

### App Directory (Laravel)
```
app/
├── Actions/           # Fortify actions
├── Concerns/         # Shared concerns/traits (PhoneValidationRules, PasswordValidationRules, etc.)
├── Contracts/         # Service interfaces (PaymentServiceInterface, etc.)
├── Console/          # Artisan commands
│   └── Commands/
├── Exceptions/       # Exception handlers
├── Helpers/          # Helper functions
├── Http/
│   ├── Controllers/  # MVC controllers
│   ├── Middleware/   # HTTP middleware
│   └── Requests/     # Form requests
├── Models/           # Eloquent models
├── Notifications/    # Notification classes
├── Providers/        # Service providers
├── Responses/        # Custom responses
└── Services/         # Business logic services
```

### Database Directory
```
database/
├── factories/        # Model factories
├── migrations/      # Database migrations
└── seeders/         # Database seeders
```

---

## Version Control Guidelines

### Git Commit Messages
- Use imperative mood: "Add feature" not "Added feature"
- First line: Max 50 characters
- Body: Wrap at 72 characters
- Reference issues: "Fixes #123"

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

---

## Testing Standards

### Unit Tests
- Use Pest PHP for testing
- Test one thing per test
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### Example Test
```php
it('landlord can onboard a new tenant via API', function () {
    $freshUnit = Unit::factory()->create(['property_id' => $this->property->id, 'status' => 'available']);

    $response = $this->postJson('/api/v1/landlord/tenants', [
        'full_name' => 'John API',
        'email' => 'john.api@example.com',
        'phone' => '0700000001',
        'unit_id' => $freshUnit->id,
        'move_in_date' => now()->toDateString(),
        'monthly_rent' => 12000,
        'security_deposit' => 24000,
    ]);

    $response->assertCreated();
    $this->assertDatabaseHas('tenants', ['email' => 'john.api@example.com']);
});
```

---

## Security Best Practices

### Password Requirements
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special character
- Uses Laravel's password validation rules

### Authentication
- Laravel Fortify for web authentication
- API tokens for mobile access
- Two-factor authentication support
- Rate limiting on sensitive endpoints

### Data Validation
- Server-side validation via Form Requests
- Client-side validation via Zod schemas
- Input sanitization at controller level

---

## Mobile UX Patterns

### 1. Human-Centered Splash Experience
The mobile app uses a custom `SplashScreen` to provide a premium first impression:
- **Branding**: Utilizes the "Deep Teal & Gold" palette for a sophisticated look.
- **Animations**: 60fps fade and scale-up transitions using `react-native-reanimated`.
- **Minimalism**: Avoids "AI slop" or generic loaders in favor of clean, human-centered typography and spacing.

### 2. Background Loading Overlay
To eliminate "popping" or half-loaded components:
- The `AppNavigator` mounts *behind* the `SplashScreen` overlay.
- Data fetching and component mounting occur invisibly during the ~2.5s splash animation.
- Results in an instant, fully-rendered UI when the splash fades away.

### 3. Skeleton Loaders and Hybrid UI Strategy
As part of the transition towards a "Minimalist Luxury" design system:
- **Skeleton Loaders**: Custom `react-native-reanimated` skeleton screens (`Skeleton.tsx`, `SkeletonVariants.tsx`) replace standard loading spinners across mobile screens. This eliminates screen content jumping and provides a polished, non-blocking data fetching experience.
- **Hybrid UI**: While `react-native-paper` is still utilized for foundational elements (Typography, Inputs), the application is actively adopting custom specialized components where native aesthetics and animations provide a superior premium feel.

---

## Summary

This project follows:
1. **shadcn/ui as the primary component library** - Always install via CLI
2. **TailwindCSS for styling** - Use utility classes and CSS variables
3. **Laravel conventions** - Follow Laravel naming and coding standards
4. **TypeScript for type safety** - Strict typing throughout the codebase
5. **Inertia.js for SSR** - Server-side rendering with React components
6. **Service layer pattern** - Encapsulate business logic in services
7. **Form Request validation** - Use Laravel form requests for validation
8. **Role-based access control** - Three-tier permission system
9. **Premium Mobile UX** - Background loading, custom skeleton loaders, and human-centered animations via a hybrid React Native Paper/Custom Component strategy.
