# Frontend Interfaces Implementation Plan
## Post-Payment Architecture Porting

> **Context**: The payment architecture from `architectural-refactoring` has been ported to `main`, including Payment Gateway abstraction (Manual/M-Pesa), ReceiptService for PDF generation, and gateway tracking fields. This plan identifies the **frontend interfaces** needed to expose these backend capabilities.

---

## Executive Summary

### Backend Capabilities Now Available
1. **Payment Gateway Abstraction**: Manual and M-Pesa gateways
2. **Receipt Generation**: PDF receipts via DomPDF, stored and retrievable
3. **Gateway Tracking**: `gateway`, `gateway_status`, `gateway_reference`, `receipt_path` fields on payments
4. **Notification Channels**: WhatsApp and Expo Push channels ready

### Frontend Gap Analysis
| Capability | Web (Inertia) | Mobile (React Native) |
|------------|---------------|----------------------|
| Receipt View/Download | ❌ Missing | ❌ Missing |
| Gateway Selection UI | ❌ Missing | ❌ Missing |
| Gateway Status Display | ❌ Missing | ❌ Missing |
| Payment Confirmation Flow | ❌ Missing | ❌ Missing |
| Notification Preferences | ❌ Missing | ❌ Missing |
| M-Pesa STK Push Flow | ❌ Missing | ❌ Missing |

---

## Phase 1: Receipt Management Interface

### 1.1 Web App - Receipt Components

**New Files:**
- `resources/js/components/payments/ReceiptViewer.tsx` - Modal/PDF viewer component
- `resources/js/components/payments/ReceiptDownloadButton.tsx` - Download button with states

**Modifications:**
- `resources/js/pages/tenant/payments.tsx` - Add receipt download column/action
- `resources/js/pages/landlord/payments/index.tsx` - Add receipt download for each payment

**Implementation Details:**
```typescript
// ReceiptViewer component props
interface ReceiptViewerProps {
  paymentId: number;
  receiptUrl: string | null;
  onClose: () => void;
  onGenerate: () => Promise<void>;
}

// States to handle:
// - "no_receipt": Payment not completed, no receipt available
// - "generating": Receipt is being generated (async job)
// - "ready": Receipt available, show download/view button
// - "error": Failed to generate/load
```

### 1.2 Mobile App - Receipt Screens

**New Files:**
- `mobile/src/screens/tenant/PaymentReceiptScreen.tsx` - Full-screen receipt viewer
- `mobile/src/components/payments/ReceiptCard.tsx` - Receipt info card component
- `mobile/src/hooks/useReceipt.ts` - Hook for fetching and managing receipt state

**Modifications:**
- `mobile/src/screens/tenant/PaymentsScreen.tsx` - Add receipt action to payment rows
- `mobile/src/navigation/AppNavigator.tsx` - Add receipt screen to navigation stack
- `mobile/src/screens/landlord/PaymentsScreen.tsx` - Add receipt action for landlord view

**Implementation Details:**
```typescript
// Receipt download flow:
// 1. Check if payment.receipt_path exists
// 2. If yes: Call tenantApi.getPaymentReceipt(paymentId) - returns Blob
// 3. If no: Show "Generate Receipt" button → triggers generation → polls for availability
// 4. Use react-native-fs or expo-file-system to save/open PDF
```

### 1.3 API Integration Requirements

The following API methods are already available:
- `GET /api/v1/tenant/payments/{id}/receipt` → Returns PDF blob
- `GET /api/v1/landlord/payments/{id}/receipt` → Returns PDF blob

**Mobile PDF Handling:**
- iOS: Use `react-native-webview` or `Linking` to open PDF URL
- Android: Use `react-native-pdf` or download to cache directory + system viewer
- Consider `expo-sharing` for share functionality

---

## Phase 2: Payment Gateway Selection & Status

### 2.1 Problem Statement

Current payment flow only captures `payment_method` (mobile_money/bank_transfer) but doesn't:
- Allow selection of specific gateway (Manual vs M-Pesa)
- Show gateway-specific UI (M-Pesa STK push phone number input)
- Display gateway status tracking

### 2.2 Web App - Gateway Integration

**Modifications:**
- `resources/js/pages/tenant/payments/make.tsx`

**New UI Components:**
```typescript
// Add to PaymentFormData:
interface PaymentFormData {
  // ... existing fields
  gateway?: 'manual' | 'mpesa';
  mpesa_phone_number?: string; // For STK push
}

// Gateway selector (when mobile_money selected):
// - Radio: "Manual Entry" (landlord verifies)
// - Radio: "M-Pesa (Instant)" (STK push)

// When M-Pesa selected:
// - Phone number input (auto-populated from tenant.phone)
// - "Initiate Payment" button → triggers STK push
// - Polling for confirmation status
```

**New Component:**
- `resources/js/components/payments/MpesaPaymentFlow.tsx` - M-Pesa specific flow

**Implementation Flow:**
1. Tenant selects "Pay with M-Pesa"
2. Enter/confirm phone number
3. Submit creates payment with `gateway: 'mpesa'`, `gateway_status: 'pending'`
4. Backend initiates STK push via `MpesaGateway::initiate()`
5. Frontend polls for `gateway_status` update (webhook will update)
6. Show "Check your phone for M-Pesa prompt" message
7. On webhook confirmation → status changes to 'paid', receipt generated

### 2.3 Mobile App - Gateway Integration

**New Files:**
- `mobile/src/components/payments/GatewaySelector.tsx` - Gateway selection UI
- `mobile/src/components/payments/MpesaPaymentForm.tsx` - M-Pesa specific form
- `mobile/src/hooks/usePaymentStatus.ts` - Polling hook for payment status

**Modifications:**
- `mobile/src/screens/tenant/MakePaymentScreen.tsx`

**Implementation Details:**
```typescript
// Add to PaymentFormData:
interface PaymentFormData {
  amount: number;
  payment_type: 'rent' | 'utility';
  payment_method: 'mobile_money' | 'bank_transfer';
  gateway?: 'manual' | 'mpesa'; // NEW
  mpesa_phone_number?: string;  // NEW
  utility_bill_id?: number;
  rent_bill_id?: number;
  reference_number?: string;
  notes?: string;
}

// UI Flow:
// 1. User selects amount, payment type
// 2. If mobile_money selected → show GatewaySelector
// 3. If M-Pesa selected:
//    - Show phone number input (pre-filled from profile)
//    - "Request M-Pesa Prompt" button
// 4. On submit:
//    - Show "STK Push Sent" screen with:
//      - Phone number masked (e.g., 07XX XXX 123)
//      - Instructions: "Check your phone and enter M-Pesa PIN"
//      - "I've completed the payment" button (manual check)
//      - Auto-polling indicator (checking...)
// 5. Poll tenantApi.getPayments() every 5 seconds for 2 minutes
// 6. On confirmation → success screen with receipt download
```

### 2.4 Backend Requirements (Verify/Add)

**Check if needed:**
1. API endpoint to initiate M-Pesa STK push explicitly
2. Webhook route for M-Pesa callback (may exist in `routes/webhooks.php` - not found in current codebase)
3. Payment status polling endpoint with optimized response (only return changed fields)

**Potential New Backend Work:**
- `POST /api/v1/tenant/payments/{id}/initiate-mpesa` - Explicit STK push trigger
- `GET /api/v1/tenant/payments/{id}/status` - Lightweight status check
- `routes/webhooks.php` with M-Pesa callback handler

---

## Phase 3: Gateway Status Display

### 3.1 Update Payment Type Definitions

**Current (mobile/src/types/index.ts):**
```typescript
interface Payment {
  // ... existing fields
  gateway?: string | null;
  gateway_status?: string | null;
  gateway_reference?: string | null;
  receipt_path?: string | null;
  gateway_confirmed_at?: string | null;
}
```

**Enhance with:**
```typescript
// Add to Payment interface
checkout_request_id?: string | null;
gateway_metadata?: Record<string, any> | null;

// Add helper type
type GatewayStatus = 'pending' | 'initiated' | 'processing' | 'completed' | 'failed' | null;
type GatewayType = 'manual' | 'mpesa' | null;
```

### 3.2 Web App - Status Badges

**Modifications:**
- `resources/js/pages/tenant/payments.tsx` - Update getStatusBadge to show gateway status

**New Badge Variants:**
```typescript
// For pending M-Pesa payments:
<Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
  <Smartphone className="mr-1 h-3 w-3" />
  Waiting for M-Pesa
</Badge>

// Add tooltip explaining: "Check your phone for M-Pesa prompt"
```

### 3.3 Mobile App - Status Indicators

**New Component:**
- `mobile/src/components/payments/PaymentStatusBadge.tsx` - Enhanced status display

**States to Display:**
```typescript
// Manual Gateway:
// - pending: "Pending Verification" (amber)
// - paid: "Paid" (green)

// M-Pesa Gateway:
// - pending: "Awaiting M-Pesa" (purple)
// - initiated: "STK Push Sent" (blue)
// - processing: "Processing" (amber)
// - completed: "Confirmed" (green)
// - failed: "Failed - Try Again" (red)
```

---

## Phase 4: Notification Preferences

### 4.1 Backend Context

The backend now includes:
- `WhatsAppChannel` - For WhatsApp notifications via Twilio
- `ExpoPushChannel` - For push notifications via Expo
- Notification classes: `PaymentReceived`, `RentBillGenerated`, `RentBillOverdue`

**Missing:** API endpoints for notification preferences management.

### 4.2 Required Backend Addition

**New API Endpoints Needed:**
```php
// For both tenant and landlord:
GET  /api/v1/tenant/notification-preferences
PUT  /api/v1/tenant/notification-preferences

// Response/Request shape:
{
  "data": {
    "email_enabled": true,
    "whatsapp_enabled": true,
    "push_enabled": true,
    "whatsapp_number": "+255712345678",
    "notification_types": {
      "payment_received": ["email", "whatsapp"],
      "rent_due": ["push", "email"],
      "bill_generated": ["email"]
    }
  }
}
```

### 4.3 Web App - Notification Settings

**New File:**
- `resources/js/pages/settings/notifications.tsx` - Notification preferences page

**UI Components:**
- Toggle switches for each channel (Email, WhatsApp, Push)
- WhatsApp number input (with verification)
- Per-event type preference matrix:
  ```
  Event Type        | Email | WhatsApp | Push
  ------------------|-------|----------|------
  Payment Received  |  [x]  |   [x]    | [ ]
  Rent Due          |  [x]  |   [ ]    | [x]
  Bill Generated    |  [x]  |   [x]    | [x]
  ```

**Modifications:**
- `resources/js/pages/settings/profile.tsx` - Add link to notification settings
- `routes/settings.php` - Add notification preferences route

### 4.4 Mobile App - Notification Settings

**New Files:**
- `mobile/src/screens/tenant/NotificationSettingsScreen.tsx`
- `mobile/src/screens/landlord/NotificationSettingsScreen.tsx`
- `mobile/src/components/settings/NotificationToggle.tsx`

**Modifications:**
- `mobile/src/screens/tenant/ProfileScreen.tsx` - Add "Notifications" menu item
- `mobile/src/screens/landlord/ProfileScreen.tsx` - Add "Notifications" menu item
- `mobile/src/api/tenant.ts` - Add notification preference methods
- `mobile/src/api/landlord.ts` - Add notification preference methods

**UI Structure:**
```typescript
// Settings sections:
// 1. Communication Channels
//    - [Toggle] Enable Email Notifications
//    - [Toggle] Enable WhatsApp
//      - [Input] WhatsApp Number (if enabled)
//    - [Toggle] Enable Push Notifications
//
// 2. Notify Me About
//    - Payment Received: [Email] [WhatsApp] [Push]
//    - Rent Due: [Email] [WhatsApp] [Push]
//    - Utility Bill Generated: [Email] [WhatsApp] [Push]
//    - Overdue Reminders: [Email] [WhatsApp] [Push]
```

---

## Phase 5: M-Pesa STK Push Flow (Mobile-First)

### 5.1 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     M-PESA PAYMENT FLOW                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. TENANT selects rent/utility bill                                │
│          ↓                                                          │
│  2. Selects "M-Pesa" as gateway                                     │
│          ↓                                                          │
│  3. Confirms/modifies phone number                                  │
│          ↓                                                          │
│  4. Taps "Request M-Pesa Prompt"                                   │
│          ↓                                                          │
│  5. BACKEND creates payment record:                                 │
│     - gateway: 'mpesa'                                             │
│     - gateway_status: 'initiated'                                   │
│     - checkout_request_id: generated                                │
│          ↓                                                          │
│  6. BACKEND calls MpesaGateway::initiate()                         │
│     → Sends STK push to Safaricom                                   │
│          ↓                                                          │
│  7. FRONTEND shows "Check Your Phone" screen                       │
│     - Polling every 5s for status update                          │
│     - "I haven't received the prompt" button                      │
│          ↓                                                          │
│  8. TENANT receives STK push, enters PIN                           │
│          ↓                                                          │
│  9. SAFARICOM sends webhook callback                              │
│          ↓                                                          │
│  10. BACKEND updates payment:                                      │
│     - gateway_status: 'completed'                                  │
│     - status: 'paid'                                                 │
│     - generates receipt                                             │
│          ↓                                                          │
│  11. FRONTEND detects status change → Success screen                │
│     - Show "Payment Confirmed!"                                     │
│     - Download receipt button                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 New Mobile Screens

**New File:** `mobile/src/screens/tenant/MpesaPaymentScreen.tsx`

**State Machine:**
```typescript
type MpesaFlowState = 
  | 'form'           // Initial form with phone input
  | 'initiating'     // API call in progress
  | 'stk_sent'       // Waiting for user PIN entry
  | 'polling'        // Polling for confirmation
  | 'confirmed'      // Success!
  | 'failed'         // STK failed or timeout
  | 'retry'          // Offer retry options
```

**Screen Content by State:**
```typescript
// 'form':
// - Amount display (read-only)
// - Phone number input
// - "Request M-Pesa Payment" button

// 'initiating':
// - Loading spinner
// - "Connecting to M-Pesa..."

// 'stk_sent':
// - M-Pesa logo/icon
// - "Check your phone"
// - Masked phone: "07XX XXX 123"
// - Instructions: "Enter your M-Pesa PIN to complete"
// - "I didn't receive the prompt" button
// - Polling indicator: "Waiting for confirmation..."

// 'confirmed':
// - Success animation (checkmark)
// - "Payment Confirmed!"
// - Amount paid
// - Transaction reference
// - "View Receipt" button
// - "Back to Dashboard" button

// 'failed':
// - Error icon
// - Failure reason (if known)
// - "Try Again" button (returns to form)
// - "Pay with Bank Transfer" alternative
```

### 5.3 Web App M-Pesa Flow

Similar flow but adapted for web:
- Use QR code option (if M-Pesa supports) OR
- Phone number input with SMS-like instructions
- Real-time status updates via polling or SSE

---

## Phase 6: Implementation Priority & Estimates

### Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Receipt View/Download (Web) | High | Medium | **P1** |
| Receipt View/Download (Mobile) | High | Medium | **P1** |
| Gateway Status Display | Medium | Low | **P2** |
| M-Pesa STK Push (Mobile) | High | High | **P3** |
| M-Pesa Flow (Web) | Medium | High | **P4** |
| Notification Preferences | Medium | Medium | **P5** |

### Effort Estimates

**Phase 1: Receipt Management**
- Web components: 4-6 hours
- Mobile screen + hook: 6-8 hours
- Testing (PDF handling): 4 hours
- **Total: 14-18 hours**

**Phase 2: Gateway Selection**
- Web modifications: 4-6 hours
- Mobile modifications: 6-8 hours
- **Total: 10-14 hours**

**Phase 3: Status Display**
- Web badge updates: 2 hours
- Mobile component: 3 hours
- **Total: 5 hours**

**Phase 4: Notification Preferences**
- Backend API: 4-6 hours (if not exists)
- Web settings page: 4 hours
- Mobile settings screen: 6 hours
- **Total: 14-16 hours**

**Phase 5: M-Pesa STK Push**
- Mobile flow implementation: 12-16 hours
- Polling mechanism: 4 hours
- Error handling: 4 hours
- **Total: 20-24 hours**

### Recommended Order

1. **Start with Phase 1 (Receipts)** - Immediate value, builds on existing API
2. **Phase 3 (Status Display)** - Low effort, improves UX
3. **Phase 2 (Gateway Selection)** - Enables M-Pesa
4. **Phase 5 (M-Pesa STK Push)** - Highest impact but most complex
5. **Phase 4 (Notifications)** - Nice-to-have, can be deferred

---

## Technical Considerations

### PDF Handling in Mobile

**Option 1: In-App PDF Viewer**
```bash
npm install react-native-pdf react-native-blob-util
# or for Expo
npx expo install expo-file-system expo-sharing
```

**Option 2: External Viewer (simpler)**
- Download PDF to cache directory
- Use `Linking.openURL()` with `file://` scheme
- Or use `expo-sharing` to share to other apps

### Polling Strategy

```typescript
// usePaymentStatus hook
const usePaymentStatus = (paymentId: number, initialStatus: string) => {
  const [status, setStatus] = useState(initialStatus);
  const [isPolling, setIsPolling] = useState(false);

  const startPolling = useCallback(() => {
    setIsPolling(true);
    const pollInterval = setInterval(async () => {
      const payment = await tenantApi.getPayment(paymentId);
      setStatus(payment.status);
      
      if (['paid', 'failed', 'cancelled'].includes(payment.status)) {
        clearInterval(pollInterval);
        setIsPolling(false);
      }
    }, 5000); // Every 5 seconds

    // Stop after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsPolling(false);
    }, 120000);
  }, [paymentId]);

  return { status, isPolling, startPolling };
};
```

### M-Pesa Phone Number Validation

```typescript
// Kenyan/Tanzanian phone number validation
const isValidMpesaNumber = (phone: string): boolean => {
  // Support formats:
  // +254712345678
  // 254712345678
  // 0712345678
  // 712345678
  
  const cleaned = phone.replace(/\s+/g, '');
  const patterns = [
    /^\+254[0-9]{9}$/,      // +254 prefix
    /^254[0-9]{9}$/,        // 254 prefix
    /^0[0-9]{9}$/,          // 0 prefix
    /^[0-9]{9}$/,           // no prefix (assume local)
  ];
  
  return patterns.some(p => p.test(cleaned));
};

const formatMpesaNumber = (phone: string): string => {
  // Normalize to 254XXXXXXXXX format for API
  const cleaned = phone.replace(/\s+/g, '').replace(/^0/, '');
  if (cleaned.startsWith('254')) return cleaned;
  if (cleaned.startsWith('+254')) return cleaned.slice(1);
  return `254${cleaned}`;
};
```

---

## Files to Create/Modify Summary

### Web App (Inertia/React)

**New Files:**
```
resources/js/components/payments/ReceiptViewer.tsx
resources/js/components/payments/ReceiptDownloadButton.tsx
resources/js/components/payments/GatewaySelector.tsx
resources/js/components/payments/MpesaPaymentFlow.tsx
resources/js/pages/settings/notifications.tsx
```

**Modifications:**
```
resources/js/pages/tenant/payments.tsx
resources/js/pages/tenant/payments/make.tsx
resources/js/pages/landlord/payments/index.tsx
resources/js/pages/settings/profile.tsx
resources/js/types/index.ts (add gateway types)
routes/settings.php
```

### Mobile App (React Native)

**New Files:**
```
mobile/src/screens/tenant/PaymentReceiptScreen.tsx
mobile/src/screens/tenant/MpesaPaymentScreen.tsx
mobile/src/screens/tenant/NotificationSettingsScreen.tsx
mobile/src/screens/landlord/NotificationSettingsScreen.tsx
mobile/src/components/payments/ReceiptCard.tsx
mobile/src/components/payments/GatewaySelector.tsx
mobile/src/components/payments/MpesaPaymentForm.tsx
mobile/src/components/payments/PaymentStatusBadge.tsx
mobile/src/components/settings/NotificationToggle.tsx
mobile/src/hooks/useReceipt.ts
mobile/src/hooks/usePaymentStatus.ts
```

**Modifications:**
```
mobile/src/screens/tenant/PaymentsScreen.tsx
mobile/src/screens/tenant/MakePaymentScreen.tsx
mobile/src/screens/tenant/ProfileScreen.tsx
mobile/src/screens/landlord/PaymentsScreen.tsx
mobile/src/screens/landlord/ProfileScreen.tsx
mobile/src/navigation/AppNavigator.tsx
mobile/src/types/index.ts (enhance Payment type)
mobile/src/api/tenant.ts (add notification prefs)
mobile/src/api/landlord.ts (add notification prefs)
```

---

## Dependencies to Add

### Mobile
```bash
# PDF handling
cd mobile && npm install react-native-pdf react-native-blob-util
# or for Expo managed workflow:
npx expo install expo-file-system expo-sharing expo-web-browser

# Phone number validation
cd mobile && npm install libphonenumber-js
```

### Web
```bash
# PDF viewer
npm install react-pdf

# Phone input (for M-Pesa)
npm install react-phone-input-2
```

---

## Testing Checklist

### Receipt Feature
- [ ] Generate receipt for paid payment
- [ ] View receipt in web browser
- [ ] Download receipt in mobile app
- [ ] Handle receipt not ready (still generating)
- [ ] Error handling for failed generation

### Gateway Selection
- [ ] Toggle between Manual and M-Pesa
- [ ] Phone validation works correctly
- [ ] Form submits correct gateway field

### M-Pesa Flow
- [ ] STK push initiated successfully
- [ ] Polling detects status change
- [ ] Success screen shows correct info
- [ ] Failure handling works
- [ ] Timeout handling works

### Notification Preferences
- [ ] Load current preferences
- [ ] Toggle channels on/off
- [ ] Per-event type preferences save
- [ ] WhatsApp number validation

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| M-Pesa API integration complexity | High | Start with mock flow, integrate real API in separate phase |
| PDF handling cross-platform | Medium | Use well-tested libraries, test on both iOS/Android |
| Polling battery drain | Medium | Implement exponential backoff, max polling duration |
| Webhook reliability | High | Add manual "Check Status" button, clear error messages |
| Phone number format variations | Low | Normalize on frontend, validate on backend |

---

## Next Steps

1. **Review this plan** with stakeholders to confirm priorities
2. **Verify backend API** endpoints for notification preferences
3. **Check M-Pesa integration status** - is webhook route configured?
4. **Select Phase 1** and begin implementation
5. **Create sub-plans** for each phase with detailed mockups

---

*Plan Version: 1.0*
*Created: 2026-05-02*
*Based on: Payment Architecture Porting Plan implementation*
