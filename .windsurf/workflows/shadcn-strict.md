---
description: Strict shadcn component usage and installation workflow
---
# Strict shadcn Component Workflow

## Rules for Component Usage
1. **ALWAYS** use shadcn components first - check existing components in `resources/js/components/ui/`
2. **NEVER** create custom UI components when shadcn equivalent exists
3. **ONLY** install new components via MCP when no suitable shadcn component exists

## Available shadcn Components (Current)
- alert, avatar, badge, breadcrumb, button, card, chart, checkbox
- collapsible, dialog, drawer, dropdown-menu, field, form, input-otp, input
- label, navigation-menu, select, separator, sheet, sidebar, skeleton
- sonner, spinner, switch, table, tabs, textarea, toggle-group, toggle, tooltip

## Installation Process
1. Check if component exists in `resources/js/components/ui/`
2. If not found, use MCP to install: `npx shadcn@latest add [component-name]`
3. Verify installation in components.json and package.json
4. Import from `@/components/ui/[component-name]`

## Component Priority Order
1. Existing shadcn components (highest priority)
2. Install new shadcn component via MCP
3. Custom component (last resort - only if shadcn cannot fulfill requirement)

## MCP Commands for Installation
```bash
# Install single component
npx shadcn@latest add [component-name]

# Install multiple components
npx shadcn@latest add [component1] [component2] [component3]

# List available components
npx shadcn@latest add --help
```

## Import Pattern
```tsx
import { ComponentName } from "@/components/ui/component-name"
```

## Verification Checklist
- [ ] Component exists in shadcn registry
- [ ] Installed via MCP command
- [ ] Proper import path used
- [ ] Component follows shadcn patterns
- [ ] No duplicate custom components created
