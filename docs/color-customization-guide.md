You can edit text colors in the tenant show page using several approaches. Let me show you the current structure and how to customize colors:

Perfect! Here are the **5 ways to edit text colors** in your tenant show page sections:

## **🎨 Text Color Customization Methods:**

### **1. Direct Tailwind Classes (Most Common):**
```tsx
// Current structure
<p className="text-sm font-medium text-gray-500">Full Name</p>
<p className="mt-1 text-sm text-gray-900">{tenant.full_name}</p>

// Custom colors
<p className="text-sm font-medium text-blue-600">Full Name</p>
<p className="mt-1 text-sm text-slate-700">{tenant.full_name}</p>
```

### **2. CSS Variables (For Consistency):**
```tsx
// Define in your CSS file
:root {
  --label-color: #6b7280;  // gray-500
  --value-color: #111827;  // gray-900
  --primary-color: #2563eb; // blue-600
}

// Use in components
<p className="text-sm font-medium" style={{ color: 'var(--label-color)' }}>
  Full Name
</p>
<p className="mt-1 text-sm" style={{ color: 'var(--value-color)' }}>
  {tenant.full_name}
</p>
```

### **3. shadcn Custom CSS Classes:**
```tsx
// Create custom classes in your CSS
.text-label {
  @apply text-sm font-medium text-gray-500;
}

.text-value {
  @apply mt-1 text-sm text-gray-900;
}

.text-primary {
  @apply text-blue-600;
}

// Use in components
<p className="text-label">Full Name</p>
<p className="text-value">{tenant.full_name}</p>
```

### **4. Theme-Aware Colors:**
```tsx
// Using shadcn's semantic colors
<p className="text-sm font-medium text-muted-foreground">Full Name</p>
<p className="mt-1 text-sm text-foreground">{tenant.full_name}</p>

// Or use primary/secondary
<p className="text-sm font-medium text-primary">Full Name</p>
<p className="mt-1 text-sm text-secondary">{tenant.full_name}</p>
```

### **5. Dynamic Color Based on Status:**
```tsx
// Function to get colors based on status
const getStatusColor = (status: string) => {
  const colors = {
    active: 'text-green-600',
    ended: 'text-red-600',
    pending: 'text-yellow-600',
  };
  return colors[status] || 'text-gray-600';
};

// Usage
<p className={`text-sm font-medium ${getStatusColor(tenancy.status)}`}>
  {tenancy.status}
</p>
```

## **🔧 Quick Examples for Your Sections:**

### **Personal Information Section:**
```tsx
<div>
  <p className="text-sm font-medium text-blue-600">Full Name</p>
  <p className="mt-1 text-sm text-slate-800">{tenant.full_name}</p>
</div>
```

### **Emergency Contact Section:**
```tsx
<div>
  <p className="text-sm font-medium text-red-600">Emergency Contact</p>
  <p className="mt-1 text-sm text-slate-800">{tenant.emergency_contact_name}</p>
</div>
```

### **Tenancy Status:**
```tsx
<Badge 
  variant={tenancy.status === 'active' ? 'default' : 'secondary'}
  className="text-xs"
>
  {tenancy.status?.charAt(0).toUpperCase() + tenancy.status?.slice(1)}
</Badge>
```

## **🎯 Most Common Tailwind Color Classes:**

- **Grays:** `text-gray-500`, `text-gray-900`, `text-slate-600`, `text-slate-800`
- **Blues:** `text-blue-500`, `text-blue-600`, `text-blue-700`
- **Reds:** `text-red-500`, `text-red-600`, `text-rose-600`
- **Greens:** `text-green-500`, `text-green-600`, `text-emerald-600`
- **Yellows:** `text-yellow-500`, `text-yellow-600`, `text-amber-600`

**Which method would you like to use, or do you want me to implement specific color changes to certain sections?**