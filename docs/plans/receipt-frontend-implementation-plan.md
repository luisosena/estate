# Receipt Management Frontend Implementation Plan

> **Status**: Ready for Implementation  
> **Scope**: Web (Inertia/React) + Mobile (React Native)  
> **Backend State**: PDF streaming API complete (`application/pdf` binary response)

---

## Executive Summary

The backend receipt system has been refactored to use **on-demand PDF streaming**. The API endpoints now return binary PDF data instead of URLs. This plan details the frontend changes required to support this new approach.

### API Endpoints (Ready)
| Endpoint | Method | Response | Description |
|----------|--------|----------|-------------|
| `/api/v1/tenant/payments/{id}/receipt` | GET | `application/pdf` binary | Download tenant's payment receipt |
| `/api/v1/landlord/payments/{id}/receipt` | GET | `application/pdf` binary | Download landlord's payment receipt |

### Error Responses
| Status | Body | Meaning |
|--------|------|---------|
| 400 | `{"message": "Receipt not available for unpaid payments"}` | Payment not paid/partial |
| 404 | `{"message": "Payment not found"}` | Payment doesn't exist or wrong tenant/landlord |
| 429 | `{"message": "Too many requests"}` | Rate limit exceeded (10 req/min) |
| 500 | `{"message": "Unable to generate receipt. Please try again."}` | PDF generation failure (DomPDF error, memory issue, missing fonts) |

### Rate Limiting
Receipt endpoints have `throttle:10,1` middleware:
- **10 requests per minute per user**
- Prevents CPU exhaustion from PDF generation
- Frontend should handle 429 status with retry guidance

---

## Phase 1: Web App (Inertia.js/React)

### 1.1 Update Payment Type Definitions

**File**: `resources/js/types/index.ts`

```typescript
// REMOVE (no longer exists):
// receipt_path?: string | null;

// Payment interface should NOT include receipt_path anymore
// The column was dropped from database
```

### 1.2 Create Receipt Download Button Component

**New File**: `resources/js/components/payments/ReceiptDownloadButton.tsx`

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ReceiptDownloadButtonProps {
  paymentId: number;
  paymentStatus: 'paid' | 'partial' | 'pending' | 'overdue' | 'cancelled';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ReceiptDownloadButton({
  paymentId,
  paymentStatus,
  variant = 'outline',
  size = 'sm',
  className,
}: ReceiptDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Only show for paid or partial payments
  const canDownload = ['paid', 'partial'].includes(paymentStatus);

  const handleDownload = async () => {
    if (!canDownload) {
      toast.error('Receipt only available for completed payments');
      return;
    }

    setIsLoading(true);

    try {
      // Determine endpoint based on user role
      const isTenant = window.location.pathname.startsWith('/tenant');
      const endpoint = isTenant
        ? `/api/v1/tenant/payments/${paymentId}/receipt`
        : `/api/v1/landlord/payments/${paymentId}/receipt`;

      // Fetch PDF as blob
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/pdf',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Receipt not available for unpaid payments');
        } else if (response.status === 404) {
          throw new Error('Payment not found');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (response.status === 500) {
          throw new Error('Unable to generate receipt. Please try again later.');
        } else {
          throw new Error('Failed to download receipt');
        }
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `receipt-${paymentId}.pdf`;

      // Convert response to blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Receipt download failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to download receipt');
    } finally {
      setIsLoading(false);
    }
  };

  if (!canDownload) {
    return (
      <Button variant="ghost" size={size} disabled className={className}>
        <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
        <span className="text-muted-foreground">No Receipt</span>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <FileText className="h-4 w-4 mr-2" />
      )}
      {isLoading ? 'Downloading...' : 'Receipt'}
    </Button>
  );
}
```

### 1.3 Update Tenant Payments Page

**File**: `resources/js/pages/tenant/payments.tsx`

Add ReceiptDownloadButton to the payments table:

```typescript
import { ReceiptDownloadButton } from '@/components/payments/ReceiptDownloadButton';

// In the payments table, add a new column:
{
  payments.data.map((payment) => (
    <TableRow key={payment.id}>
      {/* ... existing columns ... */}
      <TableCell>
        <ReceiptDownloadButton
          paymentId={payment.id}
          paymentStatus={payment.status}
          size="sm"
          variant="outline"
        />
      </TableCell>
    </TableRow>
  ));
}
```

### 1.4 Update Landlord Payments Page

**File**: `resources/js/pages/landlord/payments/index.tsx`

Same approach as tenant - add ReceiptDownloadButton to the payments table.

### 1.5 Receipt Error Handling Component (Optional)

**New File**: `resources/js/components/payments/ReceiptErrorState.tsx`

For cases where receipt generation fails:

```typescript
interface ReceiptErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ReceiptErrorState({ error, onRetry }: ReceiptErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Receipt Unavailable</AlertTitle>
      <AlertDescription>
        {error}
        <Button variant="link" onClick={onRetry} className="ml-2">
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );
}
```

---

## Phase 2: Mobile App (React Native)

### 2.1 Verify/Add Dependencies

**Check `mobile/package.json`** for:
- `expo-file-system` - Save PDF to device
- `expo-sharing` - Share PDF to other apps
- `expo-web-browser` - Alternative: open PDF in browser

**If missing:**
```bash
cd mobile && npx expo install expo-file-system expo-sharing expo-web-browser
```

### 2.2 Create Receipt Hook

**New File**: `mobile/src/hooks/useReceipt.ts`

```typescript
import { useState, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

interface UseReceiptOptions {
  paymentId: number;
  isTenant: boolean;
}

interface UseReceiptReturn {
  downloadReceipt: () => Promise<void>;
  shareReceipt: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useReceipt({ paymentId, isTenant }: UseReceiptOptions): UseReceiptReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPath, setLocalPath] = useState<string | null>(null);

  const getEndpoint = () => {
    return isTenant
      ? `/api/v1/tenant/payments/${paymentId}/receipt`
      : `/api/v1/landlord/payments/${paymentId}/receipt`;
  };

  const downloadReceipt = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = getEndpoint();
      const filename = `receipt-${paymentId}-${Date.now()}.pdf`;
      const filePath = `${FileSystem.documentDirectory}${filename}`;

      // Download PDF file
      const downloadResult = await FileSystem.downloadAsync(
        endpoint,
        filePath,
        {
          headers: {
            'Accept': 'application/pdf',
          },
        }
      );

      if (downloadResult.status !== 200) {
        if (downloadResult.status === 400) {
          throw new Error('Receipt not available for unpaid payments');
        } else if (downloadResult.status === 404) {
          throw new Error('Payment not found');
        } else if (downloadResult.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (downloadResult.status === 500) {
          throw new Error('Unable to generate receipt. Please try again later.');
        } else {
          throw new Error('Failed to download receipt');
        }
      }

      setLocalPath(filePath);
      
      // On iOS, open the PDF directly
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(filePath, {
          UTI: 'com.adobe.pdf',
          mimeType: 'application/pdf',
        });
      } else {
        // On Android, show options
        Alert.alert(
          'Receipt Downloaded',
          'What would you like to do with the receipt?',
          [
            {
              text: 'Share',
              onPress: () => shareReceipt(),
            },
            {
              text: 'Open',
              onPress: async () => {
                await Sharing.shareAsync(filePath, {
                  mimeType: 'application/pdf',
                });
              },
            },
            {
              text: 'OK',
              style: 'cancel',
            },
          ]
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download receipt';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  }, [paymentId, isTenant]);

  const shareReceipt = useCallback(async () => {
    if (!localPath) {
      // Download first if not cached
      await downloadReceipt();
      return;
    }

    try {
      await Sharing.shareAsync(localPath, {
        mimeType: 'application/pdf',
      });
    } catch (err) {
      console.error('Failed to share receipt:', err);
    }
  }, [localPath, downloadReceipt]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    downloadReceipt,
    shareReceipt,
    isLoading,
    error,
    clearError,
  };
}
```

### 2.3 Create Receipt Action Component

**New File**: `mobile/src/components/payments/ReceiptAction.tsx`

```typescript
import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useReceipt } from '../../hooks/useReceipt';
import { colors } from '../../constants/colors';

interface ReceiptActionProps {
  paymentId: number;
  paymentStatus: 'paid' | 'partial' | 'pending' | 'overdue' | 'cancelled';
  isTenant: boolean;
  size?: 'small' | 'medium';
}

export function ReceiptAction({
  paymentId,
  paymentStatus,
  isTenant,
  size = 'small',
}: ReceiptActionProps) {
  const canDownload = ['paid', 'partial'].includes(paymentStatus);
  const { downloadReceipt, isLoading, error } = useReceipt({ paymentId, isTenant });

  if (!canDownload) {
    return null; // Don't show for unpaid payments
  }

  const handlePress = () => {
    if (isLoading) return;
    downloadReceipt();
  };

  const iconSize = size === 'small' ? 16 : 20;
  const textSize = size === 'small' ? 12 : 14;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <>
          <Ionicons name="receipt-outline" size={iconSize} color={colors.primary} />
          <Text style={[styles.text, { fontSize: textSize }]}>Receipt</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  text: {
    color: colors.primary,
    fontWeight: '600',
  },
});
```

### 2.4 Update Tenant Payments Screen

**File**: `mobile/src/screens/tenant/PaymentsScreen.tsx`

Add receipt action to payment rows:

```typescript
import { ReceiptAction } from '../../components/payments/ReceiptAction';

// In the payment row render:
{payments.map((payment, index) => (
  <View key={payment.id} style={styles.paymentRow}>
    {/* ... existing payment info ... */}
    
    {/* Add receipt action */}
    <ReceiptAction
      paymentId={payment.id}
      paymentStatus={payment.status}
      isTenant={true}
      size="small"
    />
  </View>
))}
```

### 2.5 Update Landlord Payments Screen

**File**: `mobile/src/screens/landlord/PaymentsScreen.tsx`

Same approach - add ReceiptAction to payment rows with `isTenant={false}`.

### 2.6 Update Payment Types (Remove receipt_path)

**File**: `mobile/src/types/index.ts`

```typescript
export interface Payment {
  id: number;
  // ... other fields ...
  
  // REMOVE this line - column no longer exists:
  // receipt_path?: string | null;
  
  gateway?: string | null;
  gateway_status?: string | null;
  gateway_reference?: string | null;
  gateway_confirmed_at?: string | null;
}
```

### 2.7 Update API Clients (Remove Old Methods)

**File**: `mobile/src/api/tenant.ts`

```typescript
// REMOVE the old getPaymentReceipt method that expected JSON response:
// getPaymentReceipt: (paymentId: number): Promise<Blob> =>
//   api.get<Blob>(`/tenant/payments/${paymentId}/receipt`, { responseType: 'blob' }),

// The receipt download is now handled directly by the hook using expo-file-system
// No API wrapper method needed
```

**File**: `mobile/src/api/landlord.ts`

Same - remove old `getPaymentReceipt` method.

---

## Phase 3: Testing & Verification

### 3.1 Web App Testing

**Test Cases:**
1. Paid payment - click Receipt button → PDF downloads successfully
2. Pending payment - Receipt button disabled or shows "No Receipt"
3. Failed payment - Receipt button shows error toast
4. Large PDF download - handles gracefully with loading state

**Manual Test Steps:**
```bash
# 1. Log in as tenant
# 2. Navigate to Payments page
# 3. Find a paid payment
# 4. Click "Receipt" button
# 5. Verify PDF downloads and opens in browser/system viewer
```

### 3.2 Mobile App Testing

**Test Cases:**
1. iOS: Receipt downloads and opens in share sheet
2. Android: Receipt downloads, shows alert with Open/Share options
3. Unpaid payment: Receipt action not visible
4. Network error: Shows appropriate error message

**Manual Test Steps:**
```bash
# 1. Build and run mobile app
# 2. Log in as tenant
# 3. Go to Payments tab
# 4. Tap "Receipt" on a paid payment
# 5. Verify PDF handling works correctly
```

---

## Implementation Checklist

### Web App
- [ ] Update Payment type (remove `receipt_path`)
- [ ] Create `ReceiptDownloadButton.tsx`
- [ ] Update `resources/js/pages/tenant/payments.tsx`
- [ ] Update `resources/js/pages/landlord/payments/index.tsx`
- [ ] Test PDF download in browser

### Mobile App
- [ ] Verify `expo-file-system` and `expo-sharing` installed
- [ ] Create `mobile/src/hooks/useReceipt.ts`
- [ ] Create `mobile/src/components/payments/ReceiptAction.tsx`
- [ ] Update `mobile/src/screens/tenant/PaymentsScreen.tsx`
- [ ] Update `mobile/src/screens/landlord/PaymentsScreen.tsx`
- [ ] Remove old `getPaymentReceipt` from API clients
- [ ] Test on iOS device/simulator
- [ ] Test on Android device/emulator

---

## Testing Checklist (Updated)

### Backend Verification (Completed ✅)
- [x] Error handling with try-catch and logging
- [x] Rate limiting (10 req/min) configured
- [x] Test methods standardized (getJson → get)
- [x] All 21 tests passing

### Web App Testing
- [ ] Paid payment - PDF downloads successfully
- [ ] Pending payment - Button disabled/"No Receipt"
- [ ] 429 rate limit - Shows retry message
- [ ] 500 error - Shows "try again later" message
- [ ] Large PDF - Handles gracefully with loading state

### Mobile App Testing
- [ ] iOS - PDF downloads and opens
- [ ] Android - PDF downloads with Open/Share options
- [ ] 429 rate limit - Shows appropriate error
- [ ] Unpaid payment - Receipt action not visible
- [ ] Network error - Shows error message

---

## Effort Estimate

| Task | Hours |
|------|-------|
| Web components (ReceiptDownloadButton) | 3-4 |
| Web page updates (Tenant + Landlord) | 2-3 |
| Mobile hook (useReceipt) | 3-4 |
| Mobile component (ReceiptAction) | 2-3 |
| Mobile screen updates | 2-3 |
| Testing & debugging | 3-4 |
| **Total** | **15-21 hours** |

---

## Backend Production Readiness (May 3, 2026)

The following production-ready enhancements have been implemented on the backend:

### 1. Error Handling in HandlesReceipts Trait
**File**: `app/Http/Controllers/Concerns/HandlesReceipts.php`

Added try-catch wrapper around `ReceiptService::stream()`:
- Catches DomPDF failures (missing fonts, memory issues)
- Logs errors with `payment_id` and `error_message` context
- Returns user-friendly 500 message instead of unhandled exception

```php
try {
    return $receiptService->stream($payment);
} catch (\Exception $e) {
    Log::error('Receipt generation failed', [
        'payment_id' => $payment->id,
        'error' => $e->getMessage(),
    ]);
    abort(500, 'Unable to generate receipt. Please try again.');
}
```

### 2. Rate Limiting on Receipt Endpoints
**File**: `routes/api.php`

Added `throttle:10,1` middleware to both endpoints:
- `GET /api/v1/tenant/payments/{paymentId}/receipt`
- `GET /api/v1/landlord/payments/{paymentId}/receipt`

**Configuration**: 10 requests per minute per user

### 3. Test Standardization
**Files**: 
- `tests/Feature/Api/Tenant/PaymentsApiTest.php`
- `tests/Feature/Api/Landlord/PaymentsApiTest.php`

Standardized HTTP methods:
- Changed `getJson()` to `get()` (binary PDF responses, not JSON)
- Removed JSON assertions from 400 error tests

### 4. Test Results
**Status**: ✅ All 21 tests passed (34 assertions)
- PDF download success (tenant & landlord)
- Unauthorized access returns 404
- Unpaid payment returns 400
- Generation failure returns 500

---

## Notes

### Key Differences from Original Plan

The original plan assumed a URL-based receipt system. Due to the backend refactor:

| Original Approach | Current Approach |
|-------------------|------------------|
| API returned JSON with URL | API returns binary PDF |
| Frontend fetched from URL | Frontend downloads PDF directly |
| Required URL generation/caching | No URLs, direct streaming |
| Complex mobile URL handling | Simple file download |

### Advantages of New Approach
1. **Simpler frontend code** - No URL handling, just download
2. **Always fresh data** - PDF generated on-demand
3. **No storage concerns** - Frontend doesn't manage receipt storage
4. **Better error handling** - Direct HTTP error to user feedback

### Migration Notes
- No database changes needed on frontend
- `receipt_path` field removed from Payment type
- Old receipt URLs (if any stored) will 404 - acceptable as this is new feature

---

## Next Steps

1. **Verify backend API** is deployed and returning PDFs correctly
2. **Start with Web App** - simpler to test and debug
3. **Then implement Mobile** - requires device/emulator testing
4. **Test both tenant and landlord** flows
5. **Handle edge cases** (unpaid payments, network errors, etc.)

---

*Plan Version: 1.0*  
*Based on: PDF Receipt Refactor (streaming approach)*  
*Created: 2026-05-03*
