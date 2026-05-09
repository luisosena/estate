# Mobile Money Payment Verification System
## Design Document & Challenge Analysis

**Version:** 1.1  
**Stack:** LITTR (Laravel + Inertia + Tailwind + TypeScript + React) · React Native + Expo · MySQL  
**Last updated:** May 2026  
**Changelog v1.1:** Open questions resolved — Q1–Q7 decisions applied throughout.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Goals and Non-Goals](#2-goals-and-non-goals)
3. [How Money Moves — The Core Flow](#3-how-money-moves--the-core-flow)
4. [Verification Architecture](#4-verification-architecture)
   - 4.1 [Method 1 — Manual One-Tap Confirm (Default)](#41-method-1--manual-one-tap-confirm-default)
   - 4.2 [Method 2 — SMS Share (Cross-Platform Auto-Parse)](#42-method-2--sms-share-cross-platform-auto-parse)
   - 4.3 [Method 3 — Android Background SMS Listener (Optional)](#43-method-3--android-background-sms-listener-optional)
5. [Verification Decision Flow](#5-verification-decision-flow)
6. [Supported MNOs and SMS Formats](#6-supported-mnos-and-sms-formats)
7. [Data Model](#7-data-model)
8. [Backend Architecture](#8-backend-architecture)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Cost Model](#10-cost-model)
11. [Challenges and Mitigations](#11-challenges-and-mitigations)
12. [Design Decisions Log](#12-design-decisions-log)

---

## 1. System Overview

This system enables peer-to-peer mobile money payments to be recorded and verified within the app **without using a payment aggregator**. The payer sends money directly through their MNO's USSD menu (exactly as they would manually) and the recipient's app detects and records the confirmed payment.

**The key principle:** The app never touches, routes, or holds money. It is purely a verification and record-keeping layer. Because money moves through the MNO's standard P2P channel, the payer pays only the MNO's standard transfer fee — zero aggregator MDR, zero platform transaction fee.

### Actors

| Actor | Description |
|---|---|
| Payer | Sends money via USSD. Can be on any device — Android, iOS, or feature phone. |
| Recipient | Receives money on their daily MNO SIM. Has the app installed on Android or iOS. |
| MNO | Processes the transfer and sends SMS confirmations to both parties. |
| App backend | Stores pending and confirmed payment records. Notifies both parties. |

---

## 2. Goals and Non-Goals

### Goals

- Allow payers on any device (Android, iOS, feature phone) to initiate mobile money transfers via USSD and have those transfers recorded in the app.
- Allow recipients on both Android and iOS to confirm received payments, with the best UX the platform allows.
- Provide a single authoritative ledger of confirmed payments accessible to both parties.
- Operate with zero per-transaction cost to the platform (no aggregator MDR).
- Support all four major Tanzanian MNOs on the mainland: M-Pesa (Vodacom), Tigo Pesa, Airtel Money, and Halopesa — plus Zanzibar MNO variants (Zantel/Tigo and TTCL presence). Zanzibar-specific SMS format coverage to be confirmed during beta QA with Zanzibar-based testers before launch.

### Non-Goals

- The app does not initiate, process, or route money transfers.
- The app does not provide a wallet, float, or balance to users.
- The app does not act as a payment service provider under BoT regulations (it is a record-keeping tool).
- Guaranteed real-time confirmation — the system is best-effort, with manual fallback.
- iOS automatic background SMS reading — this is a hard Apple platform restriction.

---

## 3. How Money Moves — The Core Flow

```
Payer opens app
  → selects recipient and amount
  → app pre-fills USSD code and launches phone dialer (tel: link)
  → payer dials, navigates MNO USSD menu, enters PIN
  → MNO settles the transfer
  → MNO sends SMS to payer: "You sent TZS X to 07XXXXXXXX"
  → MNO sends SMS to recipient: "You received TZS X from 07XXXXXXXX"
  → recipient's app detects and records the payment (via one of three methods)
  → payer's app is notified: "Payment confirmed"
```

The payer's experience after launching the dialer is identical to a manual USSD transfer. The app's contribution is the USSD pre-fill, the pending transaction record, and the confirmation loop.

---

## 4. Verification Architecture

Three verification methods are combined in a single system. They are not mutually exclusive — they share a single pending transaction queue and a single ledger. Whichever method fires first closes the pending transaction.

### 4.1 Method 1 — Manual One-Tap Confirm (Default)

**Availability:** Android and iOS  
**User action required:** One tap by the recipient  
**Reliability:** Depends on recipient opening the app  

#### How it works

When a payer initiates a payment in the app, a `pending_payment` record is created in the backend. The recipient receives a push notification:

> "John sent you TZS 5,000. Tap to confirm you received it."

The recipient taps the notification, is taken to a pre-filled confirmation screen showing the payer's name, the amount, and the MNO. They tap "Confirm received" and the payment is recorded as confirmed with `verified_by: manual`.

#### Why this is the default for both platforms

- Works on iOS where SMS reading is not possible.
- Works even when Android SMS permission is denied or the background listener fails.
- Gives the recipient a moment to consciously verify the amount matches what was agreed.
- No SMS parsing required — no regex, no format-change risk.

#### Implementation notes (React Native)

```typescript
// RecipientConfirmScreen.tsx
interface PendingPayment {
  id: string;
  payerName: string;
  payerPhone: string;
  amount: number;
  mno: string;
  initiatedAt: string;
}

const RecipientConfirmScreen = ({ payment }: { payment: PendingPayment }) => {
  const handleConfirm = async () => {
    await api.post(`/payments/${payment.id}/confirm`, {
      method: 'manual',
      confirmedAt: new Date().toISOString(),
    });
  };

  return (
    <View>
      <Text>TZS {payment.amount.toLocaleString()}</Text>
      <Text>From {payment.payerName} via {payment.mno}</Text>
      <Button title="Confirm I received this" onPress={handleConfirm} />
    </View>
  );
};
```

---

### 4.2 Method 2 — SMS Share (Cross-Platform Auto-Parse)

**Availability:** Android and iOS  
**User action required:** Long-press SMS → Share → select app  
**Reliability:** High — parsed from actual MNO SMS text  

#### How it works

After the transfer, the MNO sends a confirmation SMS to the recipient's phone in the native Messages app (as always). The recipient can long-press this SMS and tap "Share." The app registers as a share target. When the MNO SMS text is shared into the app, it is parsed automatically — amount, sender phone, MNO, and transaction ID are extracted — and the payment is confirmed with `verified_by: sms_share`.

This gives iOS users a near-automatic experience. It is one extra step beyond Method 3 (Android auto), but requires no SMS permission and works identically on Android and iOS.

#### iOS share extension (Swift)

```swift
// ShareViewController.swift
import UIKit
import MobileCoreServices

class ShareViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        guard
            let item = extensionContext?.inputItems.first as? NSExtensionItem,
            let provider = item.attachments?.first,
            provider.hasItemConformingToTypeIdentifier(kUTTypePlainText as String)
        else { return }

        provider.loadItem(forTypeIdentifier: kUTTypePlainText as String) { [weak self] text, _ in
            guard let smsText = text as? String else { return }
            let payment = MnoSmsParser.parseRecipient(smsText)
            DispatchQueue.main.async {
                self?.submitConfirmation(payment)
            }
        }
    }

    private func submitConfirmation(_ payment: ParsedPayment?) {
        guard let payment else {
            // Show "this doesn't look like a payment SMS" message
            return
        }
        // POST to app backend
        PaymentAPI.shared.confirmBySmsShare(payment) { _ in
            self.extensionContext?.completeRequest(returningItems: nil)
        }
    }
}
```

#### Android share target (React Native)

```typescript
// Register in AndroidManifest.xml as ACTION_SEND receiver for text/plain
// In React Native, handle via react-native-share-menu or Linking

import ShareMenu from 'react-native-share-menu';

useEffect(() => {
  ShareMenu.getInitialShare(handleShare);
  const listener = ShareMenu.addNewShareListener(handleShare);
  return () => listener.remove();
}, []);

const handleShare = (share: ShareData) => {
  if (!share || share.mimeType !== 'text/plain') return;
  const parsed = parseMnoSms(share.data);
  if (parsed) confirmPayment(parsed, 'sms_share');
};
```

---

### 4.3 Method 3 — Android Background SMS Listener (Optional, Off by Default)

**Availability:** Android only  
**User action required:** None — fully automatic  
**Reliability:** High when running; dependent on device, permissions, and OEM  
**Default state:** Disabled. User must explicitly enable in Settings.  

#### Why it is off by default

- Requires `RECEIVE_SMS` permission, which Google Play scrutinises for non-messaging apps.
- Aggressive battery optimisation on Tecno, Infinix, Itel (dominant in TZ market) can silently kill the receiver.
- Some users are uncomfortable with apps reading all their SMS.
- Method 1 and Method 2 together cover the full use case acceptably without the friction of a sensitive permission request.

When the user explicitly enables this in Settings, they are shown a clear explanation of what the feature does, asked to grant SMS permission, and prompted to whitelist the app from battery optimisation.

#### Implementation (Kotlin broadcast receiver)

```kotlin
// AndroidManifest.xml
<uses-permission android:name="android.permission.RECEIVE_SMS"/>

<receiver
    android:name=".payment.SmsPaymentReceiver"
    android:exported="true"
    android:enabled="false"> <!-- disabled by default -->
    <intent-filter android:priority="999">
        <action android:name="android.provider.Telephony.SMS_RECEIVED"/>
    </intent-filter>
</receiver>
```

```kotlin
// SmsPaymentReceiver.kt
class SmsPaymentReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        // Check feature flag — double guard since receiver can be enabled/disabled
        val prefs = context.getSharedPreferences("settings", Context.MODE_PRIVATE)
        if (!prefs.getBoolean("auto_sms_verification", false)) return

        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
        for (sms in messages) {
            val payment = MnoSmsParser.parseRecipient(
                body = sms.messageBody,
                sender = sms.originatingAddress ?: continue
            ) ?: continue

            PaymentConfirmationWorker.enqueue(context, payment)
        }
    }
}
```

```kotlin
// Toggling the receiver on/off from Settings screen
fun setAutoSmsEnabled(context: Context, enabled: Boolean) {
    val component = ComponentName(context, SmsPaymentReceiver::class.java)
    val state = if (enabled)
        PackageManager.COMPONENT_ENABLED_STATE_ENABLED
    else
        PackageManager.COMPONENT_ENABLED_STATE_DISABLED

    context.packageManager.setComponentEnabledSetting(
        component, state, PackageManager.DONT_KILL_APP
    )

    context.getSharedPreferences("settings", Context.MODE_PRIVATE)
        .edit().putBoolean("auto_sms_verification", enabled).apply()
}
```

#### Enabling flow in the app (user-initiated)

```
Settings → Payment verification → "Automatic SMS detection"
  [OFF by default]

  "When enabled, the app reads incoming SMS messages from your MNO
   to automatically confirm received payments. Only payment confirmation
   messages from M-Pesa, Tigo Pesa, Airtel Money, and Halopesa are
   read. No other SMS messages are accessed or stored."

  [Enable]
    → Request RECEIVE_SMS permission
    → If granted: enable receiver, show battery optimisation prompt
    → If denied: show explanation, keep toggle off
```

---

## 5. Verification Decision Flow

All three methods write to the same `payments` table. The backend applies idempotency — the first confirmation that arrives closes the pending transaction regardless of which method triggered it.

```
Payment initiated by payer
  → backend creates pending_payment { id, payer, recipient, amount, mno, status: 'pending' }
  → push notification sent to recipient

On recipient's device:
  ┌─ Method 3 active? (Android + permission granted + feature enabled)
  │     └─ MNO SMS arrives in background
  │           └─ receiver parses SMS
  │                 └─ POST /payments/{id}/confirm { method: 'auto_sms' }
  │
  ├─ Recipient shares SMS (Method 2)
  │     └─ share extension receives text
  │           └─ parser extracts payment details
  │                 └─ POST /payments/{id}/confirm { method: 'sms_share' }
  │
  └─ Recipient taps confirm (Method 1, always available)
        └─ confirmation screen shown
              └─ POST /payments/{id}/confirm { method: 'manual' }

Backend (first confirmation wins):
  → validate: amount matches, sender matches, not already confirmed
  → update payment { status: 'confirmed', verified_by, confirmed_at }
  → notify payer via push/websocket
```

---

## 6. Supported MNOs and SMS Formats

The SMS parser handles recipient-side confirmation messages for all four major Tanzanian MNOs plus Zanzibar variants. These formats are accurate as of May 2026 but must be treated as living configuration — MNOs change wording without notice.

> **Zanzibar note (Q5):** Zantel (operating under Tigo branding in Zanzibar) and TTCL have historically shown SMS format variations from their mainland counterparts. Zanzibar-specific real-device testing is a required QA gate before production launch. Parser patterns for Zanzibar variants will be confirmed and added during beta.

### Recipient SMS formats (what your app parses)

| MNO | Example SMS | Key fields |
|---|---|---|
| M-Pesa (Vodacom) | `TZS5,000.00 received from JOHN DOE 0712345678 on 4/5/25. New M-Pesa balance TZS12,400.00. Transaction ID AB12345CD.` | Amount, phone, txn ID |
| Tigo Pesa | `Tigo Pesa: Umepokea TZS 5,000 kutoka 0712345678 (JOHN). Ref: 1234567890. Salio: TZS 8,200` | Amount, phone, ref |
| Airtel Money | `You have received TZS5,000.00 from 0784123456. Your new balance is TZS3,100.00. Transaction ID: AIR20250504XXXX` | Amount, phone, txn ID |
| Halopesa | `HaloPesa: Umepokea TZS 5,000 kutoka 0626123456. Txn: HP123456789` | Amount, phone, txn ID |

### Parser (TypeScript — shared between web and React Native)

```typescript
export interface ParsedPayment {
  mno: 'M-Pesa' | 'Tigo Pesa' | 'Airtel Money' | 'Halopesa';
  amount: number;           // in TZS, integer
  senderPhone: string;      // normalised to 07XXXXXXXXX
  txnId: string;
  rawSms: string;
  parsedAt: string;         // ISO timestamp
}

export function parseRecipientSms(text: string): ParsedPayment | null {
  const t = text.trim();

  // M-Pesa
  if (/received from/i.test(t) && /M-?Pesa/i.test(t)) {
    const amount = t.match(/TZS([\d,]+)\.\d{2} received/)?.[1]?.replace(/,/g, '');
    const phone  = t.match(/\b(07\d{8})\b/)?.[0];
    const txnId  = t.match(/Transaction ID ([A-Z0-9]+)/i)?.[1];
    if (amount && phone) return build('M-Pesa', amount, phone, txnId, t);
  }

  // Tigo Pesa
  if (/Umepokea/i.test(t) && /Tigo/i.test(t)) {
    const amount = t.match(/TZS ([\d,]+) kutoka/)?.[1]?.replace(/,/g, '');
    const phone  = t.match(/kutoka (\d{10})/)?.[1];
    const txnId  = t.match(/Ref: (\d+)/)?.[1];
    if (amount && phone) return build('Tigo Pesa', amount, phone, txnId, t);
  }

  // Airtel Money
  if (/You have received/i.test(t)) {
    const amount = t.match(/received TZS([\d,]+)/)?.[1]?.replace(/,/g, '');
    const phone  = t.match(/from (07\d{8})/)?.[1];
    const txnId  = t.match(/Transaction ID: ([A-Z0-9]+)/i)?.[1];
    if (amount && phone) return build('Airtel Money', amount, phone, txnId, t);
  }

  // Halopesa
  if (/HaloPesa/i.test(t) && /Umepokea/i.test(t)) {
    const amount = t.match(/TZS ([\d,]+) kutoka/)?.[1]?.replace(/,/g, '');
    const phone  = t.match(/kutoka (\d{10})/)?.[1];
    const txnId  = t.match(/Txn: ([A-Z0-9]+)/)?.[1];
    if (amount && phone) return build('Halopesa', amount, phone, txnId, t);
  }

  return null;
}

function build(
  mno: ParsedPayment['mno'],
  amount: string,
  phone: string,
  txnId: string | undefined,
  raw: string
): ParsedPayment {
  return {
    mno,
    amount: parseInt(amount, 10),
    senderPhone: normalisePhone(phone),
    txnId: txnId ?? `LOCAL-${Date.now()}`,
    rawSms: raw,
    parsedAt: new Date().toISOString(),
  };
}

function normalisePhone(phone: string): string {
  // Normalise 255712345678 → 0712345678
  return phone.startsWith('255') ? '0' + phone.slice(3) : phone;
}
```

---

## 7. Data Model

```sql
-- Pending and confirmed payments
CREATE TABLE payments (
  id              CHAR(36)      PRIMARY KEY,          -- UUID
  payer_user_id   BIGINT        NOT NULL,
  recipient_user_id BIGINT      NOT NULL,
  payer_phone     VARCHAR(15)   NOT NULL,
  recipient_phone VARCHAR(15)   NOT NULL,
  amount          INT UNSIGNED  NOT NULL,             -- TZS, integer
  mno             ENUM('M-Pesa','Tigo Pesa','Airtel Money','Halopesa') NOT NULL,
  reference       VARCHAR(255)  NULL,                 -- user-entered note
  status          ENUM('pending','confirmed','disputed','expired') DEFAULT 'pending',
  verified_by     ENUM('manual','sms_share','auto_sms') NULL,
  txn_id          VARCHAR(100)  NULL,                 -- MNO transaction ID from SMS
  raw_sms         TEXT          NULL,                 -- retained 48h post-confirmation then auto-purged (Q2)
  initiated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at    TIMESTAMP     NULL,
  expires_at      TIMESTAMP     NOT NULL,             -- tiered: <100k=24h, 100k-499k=12h, >=500k=6h (Q3)
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_payer      (payer_user_id),
  INDEX idx_recipient  (recipient_user_id),
  INDEX idx_status     (status),
  INDEX idx_txn_id     (txn_id),
  INDEX idx_expires    (expires_at)
);

-- Unmatched incoming SMS (for parser monitoring)
CREATE TABLE unmatched_sms (
  id          BIGINT    PRIMARY KEY AUTO_INCREMENT,
  raw_text    TEXT      NOT NULL,
  sender      VARCHAR(50) NULL,
  received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User device tokens for push notifications
CREATE TABLE device_tokens (
  id          BIGINT      PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT      NOT NULL,
  platform    ENUM('android','ios') NOT NULL,
  token       VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY  uq_token (token)
);
```

---

## 8. Backend Architecture

### Tiered expiry helper

```php
// Payment.php (model)
public static function expiryForAmount(int $amount): Carbon
{
    return match(true) {
        $amount >= 500_000 => now()->addHours(6),
        $amount >= 100_000 => now()->addHours(12),
        default            => now()->addHours(24),
    };
}
```

### High-value secondary confirm check

```php
// In PaymentController@confirm
// After standard confirmation via Method 2 or 3, check if secondary manual confirm is required

private function requiresSecondaryManualConfirm(Payment $payment): bool
{
    $singleThreshold  = config('payments.high_value_threshold', 500_000);      // TZS 500,000
    $rollingThreshold = config('payments.rolling_24h_threshold', 800_000);     // TZS 800,000
    $rollingWindow    = config('payments.rolling_window_hours', 24);

    if ($payment->amount >= $singleThreshold) return true;

    // Rolling window check: same payer → same recipient in last 24h
    $recentTotal = Payment::where('payer_user_id', $payment->payer_user_id)
        ->where('recipient_user_id', $payment->recipient_user_id)
        ->where('status', 'confirmed')
        ->where('confirmed_at', '>=', now()->subHours($rollingWindow))
        ->sum('amount');

    return ($recentTotal + $payment->amount) > $rollingThreshold;
}
```

### Laravel routes

```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/payments',               [PaymentController::class, 'initiate']);
    Route::post('/payments/{id}/confirm',  [PaymentController::class, 'confirm']);
    Route::get ('/payments/{id}',          [PaymentController::class, 'show']);
    Route::get ('/payments',               [PaymentController::class, 'index']);
    Route::post('/payments/{id}/dispute',  [PaymentController::class, 'dispute']);
});
```

### Confirmation controller

```php
// PaymentController.php
public function confirm(Request $request, string $id): JsonResponse
{
    $payment = Payment::findOrFail($id);

    // Only the recipient can confirm
    abort_if($payment->recipient_user_id !== auth()->id(), 403);

    // Idempotency: already confirmed
    if ($payment->status === 'confirmed') {
        return response()->json(['status' => 'already_confirmed', 'payment' => $payment]);
    }

    // Expired
    if (now()->isAfter($payment->expires_at)) {
        $payment->update(['status' => 'expired']);
        return response()->json(['error' => 'Payment confirmation window expired'], 422);
    }

    $validated = $request->validate([
        'method'    => 'required|in:manual,sms_share,auto_sms',
        'txn_id'    => 'nullable|string|max:100',
        'amount'    => 'nullable|integer',   // from SMS parse — used for cross-check
        'raw_sms'   => 'nullable|string',
    ]);

    // Cross-check parsed amount if provided
    if (isset($validated['amount'])) {
        $tolerance = 0; // exact match required
        abort_if(
            abs($validated['amount'] - $payment->amount) > $tolerance,
            422,
            'Parsed amount does not match expected amount'
        );
    }

    $payment->update([
        'status'       => 'confirmed',
        'verified_by'  => $validated['method'],
        'txn_id'       => $validated['txn_id'] ?? $payment->txn_id,
        'raw_sms'      => null,  // discard raw SMS after confirming
        'confirmed_at' => now(),
    ]);

    // Notify payer
    NotifyPayerOfConfirmation::dispatch($payment);

    return response()->json(['status' => 'confirmed', 'payment' => $payment]);
}
```

### Payer notification (queued job)

```php
// NotifyPayerOfConfirmation.php
class NotifyPayerOfConfirmation implements ShouldQueue
{
    public function handle(): void
    {
        $payer = $this->payment->payer;

        // Push notification via FCM (Android) / APNs (iOS)
        foreach ($payer->deviceTokens as $device) {
            PushNotificationService::send($device, [
                'title' => 'Payment confirmed',
                'body'  => vsprintf('TZS %s received by %s via %s', [
                    number_format($this->payment->amount),
                    $this->payment->recipient->name,
                    $this->payment->mno,
                ]),
                'data'  => ['payment_id' => $this->payment->id],
            ]);
        }
    }
}
```

---

## 9. Frontend Architecture

### Payer flow (React Native)

```typescript
// 1. Initiate — creates pending record and launches dialer
const initiatePayment = async (form: PaymentForm) => {
  const { data } = await api.post('/payments', form);
  setPendingId(data.id);

  // Launch USSD dialer with pre-filled code
  const code = ussdCodes[form.mno]; // e.g. *150*00#
  await Linking.openURL(`tel:${encodeURIComponent(code)}`);

  // Begin polling
  startPolling(data.id);
};

// 2. Poll for confirmation (every 5s, timeout 2 min)
const startPolling = (paymentId: string) => {
  const timer = setInterval(async () => {
    const { data } = await api.get(`/payments/${paymentId}`);
    if (data.status === 'confirmed') {
      clearInterval(timer);
      navigation.navigate('PaymentConfirmed', { payment: data });
    }
    if (data.status === 'expired') {
      clearInterval(timer);
      navigation.navigate('PaymentExpired', { payment: data });
    }
  }, 5000);
  // Timeout safety
  setTimeout(() => clearInterval(timer), 120_000);
};
```

### Settings screen (Android auto-SMS toggle)

```typescript
// AutoSmsToggle.tsx — shown only on Android
import { Platform, NativeModules } from 'react-native';

const AutoSmsToggle = () => {
  const [enabled, setEnabled] = useState(false);

  if (Platform.OS !== 'android') return null;

  const handleToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestSmsPermission();
      if (!granted) return;
      await NativeModules.SmsReceiverModule.enable();
    } else {
      await NativeModules.SmsReceiverModule.disable();
    }
    setEnabled(value);
  };

  return (
    <View>
      <Text>Automatic SMS detection</Text>
      <Text style={styles.description}>
        When enabled, incoming M-Pesa, Tigo Pesa, Airtel Money, and Halopesa
        payment confirmation messages are read automatically to confirm received
        payments. No other SMS messages are accessed.
      </Text>
      <Switch value={enabled} onValueChange={handleToggle} />
    </View>
  );
};
```

---

## 10. Cost Model

This section summarises why the architecture has zero per-transaction platform cost.

| Cost item | Amount | Borne by |
|---|---|---|
| MNO P2P transfer fee | Standard MNO rate (e.g. TZS 100–500) | Payer — same as any USSD transfer |
| Platform MDR (aggregator fee) | **TZS 0** | N/A — no aggregator used |
| Government levy | Standard MNO levy | Payer — included in MNO fee |
| SMS delivery (MNO to recipient) | Standard MNO inclusion | MNO — free to recipient |
| App backend hosting | Fixed monthly (e.g. $10–20/mo) | Platform — independent of volume |
| Push notification (FCM/APNs) | Free up to high volume | Platform |

The platform's only infrastructure cost is backend hosting, which is fixed regardless of transaction volume. There is no variable per-transaction cost to the platform at any scale.

---

## 11. Challenges and Mitigations

### 11.1 SMS Delivery Reliability

**Risk level: High**

MNO SMS delivery is not guaranteed. Messages can be delayed (minutes to hours), dropped entirely, or — less commonly — delivered twice.

**Specific failure modes:**

- **Delayed delivery:** The recipient's app polls the pending transaction as "waiting" while money is already in their wallet. The user sees a spinner and believes something failed.
- **Dropped SMS:** Network congestion, recipient SIM off, or MNO gateway failure means the confirmation SMS never arrives. Method 1 (manual confirm) is the only fallback.
- **Duplicate delivery:** The MNO retries a failed delivery after the first succeeded. Without an idempotency guard, the same payment could be confirmed twice.

**Mitigations:**

- Idempotency key on every confirmation: `txn_id` from SMS + `payment_id`. First confirmation wins; subsequent ones are silently ignored.
- **Pending transaction expiry is tiered by amount (resolved — Q3):**

  | Payment amount | Expiry window |
  |---|---|
  | < TZS 100,000 | 24 hours |
  | TZS 100,000 – 499,999 | 12 hours |
  | ≥ TZS 500,000 | 6 hours |

  Higher-value payments have a tighter window because the fraud cost of a spoofed late confirmation is proportionally higher, and large transfers are typically planned — the recipient is unlikely to be slow in confirming. All three values are stored as configurable backend constants.

- After expiry, the payment shows as "unconfirmed" and both parties are prompted to manually reconcile via MNO transaction history.
- Manual confirmation (Method 1) is always available as a fallback for dropped SMSes.
- Retry-tolerant confirmation endpoint: `POST /payments/{id}/confirm` is idempotent.
- **Raw SMS retention (resolved — Q2):** Raw SMS text (`raw_sms`) is retained for **48 hours** after a payment is confirmed, then automatically purged. This window supports dispute resolution for issues that surface quickly without holding sensitive data indefinitely.

  ```php
  // Scheduled hourly — clears raw_sms from confirmed payments older than 48h
  Payment::where('status', 'confirmed')
         ->where('confirmed_at', '<', now()->subHours(48))
         ->whereNotNull('raw_sms')
         ->update(['raw_sms' => null]);
  ```

  Privacy policy must state: *"Raw SMS content is retained for up to 48 hours following payment confirmation solely for dispute resolution, after which it is permanently deleted."*

---

### 11.2 MNO SMS Format Changes

**Risk level: High (operational)**

MNOs change their SMS wording without developer notice or changelog. A single regex that breaks silently means every payment after that moment goes unrecorded via Methods 2 and 3.

**Specific failure modes:**

- Vodacom Tanzania changed M-Pesa SMS wording at least twice in the last three years.
- Tigo Pesa Swahili phrasing varies by campaign season.
- New MNO product launches (e.g. a savings product) can introduce new SMS formats that partially match payment patterns.

**Mitigations:**

- Log every SMS that fails to parse to the `unmatched_sms` table with the full raw text.
- Alert the engineering team when `unmatched_sms` inserts exceed a threshold (e.g. 5 in 10 minutes from the same sender pattern).
- Build an admin screen to review unmatched SMSes and update parser patterns without a full app release.
- The parser is extracted into a standalone, independently testable module with a test suite of known-good SMS samples from each MNO.
- Method 1 (manual confirm) remains fully functional regardless of parser state.

---

### 11.3 iOS SMS Reading Restriction

**Risk level: Medium (platform, non-mitigable at root)**

Apple does not provide any API for third-party apps to read incoming SMS messages. This is a hard sandbox restriction, not a policy decision that can be appealed or worked around. Method 3 (auto background SMS) is therefore unavailable on iOS.

**Impact:**

- iOS recipients cannot get zero-tap automatic confirmation.
- iOS users must use Method 1 (one tap) or Method 2 (SMS share).

**Mitigations:**

- Method 1 is presented as the primary flow for iOS recipients. Push notification drives engagement — the tap-to-confirm is a familiar mobile UX pattern.
- Method 2 (SMS share) brings iOS close to automatic: long-press → Share → app → auto-parsed. This is two taps rather than one, but requires no special permissions.
- In the Tanzania market, Android penetration is approximately 85–90%, meaning the majority of recipients get the fully automatic experience.
- Frame Method 1 as an intentional UX choice: "Confirm you received it" gives recipients a moment to verify the amount before the record is finalised.

---

### 11.4 Fraud and SMS Spoofing

**Risk level: High**

SMS sender IDs (short codes and alphanumeric names such as "MPESA") are not cryptographically authenticated in standard SMS. An attacker with access to an SMS gateway can send a message with sender ID "MPESA" or "TigoPesa" to a recipient's phone. If that message matches your parser patterns, it could generate a fraudulent confirmation in your system.

**Specific attack scenario:**

1. Attacker agrees to pay Recipient for goods/services.
2. Attacker sends a spoofed "You received TZS 50,000 from 0712345678" SMS to Recipient's phone.
3. Recipient's app auto-parses the SMS (Method 3) or Recipient shares it (Method 2).
4. App records a confirmed payment of TZS 50,000.
5. No actual money moved.

**Mitigations:**

- **Pending transaction matching:** Only confirm a payment if an active pending transaction exists with a matching payer phone, recipient, and amount. Unsolicited confirmations (SMS with no corresponding pending record) are logged and ignored, never auto-confirmed.
- **Time-window validation:** Pending transactions expire on a tiered schedule based on amount (see Section 11.1 and Section 12, Q3). An SMS parsed after the expiry window is rejected.
- **Amount tolerance:** Allow zero tolerance by default — parsed amount must exactly match the pending amount. If the MNO adds fees to the SMS amount, this needs calibration.
- **Anomaly alerts:** Flag any payment confirmation where the SMS sender short code differs from the registered MNO short code for that provider.
- **For high-value payments (resolved threshold — see Section 12):** Always require Method 1 (manual confirm) as a mandatory secondary step regardless of whether Method 2 or 3 already fired, for any single payment at or above **TZS 500,000**. The recipient must explicitly tap "I confirm I received this" before the payment is finalised.
- **Rolling 24-hour window:** If the same payer sends to the same recipient more than **TZS 800,000 in aggregate within any 24-hour window**, all subsequent payments in that window require Method 1 manual confirm regardless of individual amount. This closes the transaction-splitting loophole.
- **Both thresholds are stored as configurable backend constants**, not hardcoded, so they can be adjusted based on post-launch usage patterns without a code deployment.
- **Do not store raw SMS longer than parsing:** Once parsed, `raw_sms` is set to `null` in the database. Sensitive data is not retained.

---

### 11.5 Android App Lifecycle and Battery Optimisation

**Risk level: Medium**

Android aggressively manages background processes, particularly on low-cost devices that dominate the Tanzanian market (Tecno, Infinix, Itel). The SMS broadcast receiver may not fire in time or at all if:

- The OS has put the app in a deep doze state.
- A device-specific process killer (common on MediaTek/Unisoc chipsets) has suspended the app.
- The user has manually disabled background activity for the app.
- The `RECEIVE_SMS` permission was revoked after a system update or factory reset.

This only affects Method 3 (auto-background SMS). Methods 1 and 2 are unaffected.

**Mitigations:**

- Method 3 is off by default. Users who enable it are shown a battery optimisation prompt immediately: "Exempt this app from battery optimisation to ensure reliable payment detection." Deep link to system settings.
- Use a foreground service with a persistent notification during the window when a payment is pending. The OS treats foreground services very differently from background receivers.
- Implement a `WorkManager` fallback that schedules a one-time confirmation check 5 minutes after a pending payment is created, in case the immediate broadcast was missed.
- On the confirmation screen, show a banner to Android users: "Auto-detection may be delayed on your device. Tap confirm if you have already received the SMS."

---

### 11.6 Regulatory and Compliance Exposure

**Risk level: Medium (jurisdiction-specific)**

Reading financial SMS data on users' devices, recording payment transactions, and maintaining a financial ledger touches several regulatory areas in Tanzania.

**Areas of concern:**

- **TCRA (Tanzania Communications Regulatory Authority):** Apps that process communications data may need disclosure. The `RECEIVE_SMS` permission use case must be declared in the Play Store listing and privacy policy.
- **Bank of Tanzania (BoT):** Recording and displaying payment transaction data could be viewed as operating a payment service or financial information service. The fact that money moves entirely through MNO channels (not the platform) is the key distinguishing argument. **Decision (resolved — Q4): BoT pre-registration is not required before launch.** The app is positioned as a technology record-keeping service, not a payment service provider. Post-launch engagement with BoT will be initiated if and when transaction volumes or feature scope warrant it.
- **Personal Data Protection Act (PDPA) Tanzania (2022):** Requires explicit informed consent for collecting and processing personal financial data, a declared purpose, and data minimisation.
- **Google Play policy:** Apps requesting `RECEIVE_SMS` that are not primarily messaging apps require a justification declaration. Payment verification is a recognised valid use case but must be clearly documented.

**Mitigations:**

- Engage a Tanzanian fintech legal advisor before public launch.
- Privacy policy must explicitly state: what SMS data is read, why, how long it is retained (none — parsed and discarded), and that no SMS content other than MNO payment confirmations is ever accessed.
- Implement SMS reading as truly minimal: only the `RECEIVE_SMS` broadcast is listened to; the app never reads the full SMS inbox. This is architecturally different from having `READ_SMS` permission.
- Present a clear in-app consent prompt when Method 3 is enabled, separate from the OS permission dialog.
- Store no raw SMS content in the database after parsing. Store only the extracted fields (amount, phone, txn ID) and the confirmation event.
- Consider registering with BoT as a technology service provider (not a payment service provider) proactively.

---

### 11.7 Transaction Matching Ambiguity

**Risk level: Medium**

Not all MNO confirmation SMSes include a unique transaction ID. When two payments of the same amount from the same sender arrive within a short window, the SMS alone cannot distinguish them.

**Specific failure modes:**

- User A sends TZS 5,000 to User B twice in quick succession for two separate reasons. Both SMSes are identical. Your system creates two pending records but receives two identical SMS signals.
- If both pending records have the same amount, payer phone, and recipient phone, neither can be definitively matched.

**Mitigations:**

- Always create a pending record before the payer dials. This record has a unique internal ID and a timestamp.
- Match incoming SMSes against pending records using: `payer_phone + amount + recipient_phone + time window (±15 min)`.
- If exactly one pending record matches: auto-confirm it.
- If zero records match: log to `unmatched_sms`, do not auto-confirm.
- If multiple records match: flag both as "needs manual confirmation." Notify both payer and recipient to manually confirm which payment corresponds to which purpose.
- For MNOs that do provide a txn ID (M-Pesa, Airtel, Halopesa): require the txn ID for any auto-confirmation. Tigo Pesa's Ref field is used where available.

---

### 11.8 Multi-SIM Phones and MNO Portability

**Risk level: Low–Medium**

Tanzania has high dual-SIM adoption. A recipient may have M-Pesa on SIM slot 1 and Tigo Pesa on SIM slot 2, or may have recently ported their number to a different MNO. The app's recipient record may be linked to one number while payments arrive on another.

**Mitigations:**

- During recipient onboarding, allow registration of up to two phone numbers.
- Each registered number can be associated with an MNO label.
- Payment matching considers all registered numbers for the recipient, not just the primary.
- If a recipient ports their number, provide a "Update my payment number" flow in Settings.

---

### 11.9 Silent Failures and Dispute Resolution

**Risk level: Medium**

The highest-stakes failure mode: the MNO transfer succeeded (money is in the recipient's wallet) but the app never recorded it because the SMS was missed, the parser failed, the user missed the notification, or the pending record expired. Neither party has an app record of the payment.

**Impact:**

- Payer believes payment is unconfirmed or failed.
- Recipient has the money but no record in the app.
- No automated resolution path exists.

**Mitigations:**

- Both parties retain their MNO's own transaction history as the source of truth. The app is a convenience layer, not the definitive record.
- Build a manual dispute/reconciliation flow on day one:
  - Recipient: "I received a payment not showing in the app" → enter payer phone, amount, MNO, and the MNO transaction reference → admin review → manual confirmation.
  - Payer: "I paid but it shows as pending" → same form → admin review.
- Provide an admin reconciliation screen that shows all `pending` and `expired` payments with their timestamps, allowing support staff to cross-reference against MNO transaction history by reference number.
- Set a clear expectation in the app UI: "Payments are confirmed by the recipient. If confirmation is delayed, check your MNO SMS for the transaction reference."

---

## 12. Design Decisions Log

All open questions from v1.0 have been resolved. The table below serves as the authoritative record of each decision.

| # | Question | Decision | Notes |
|---|---|---|---|
| 1 | High-value threshold for mandatory Method 1 secondary confirm | **TZS 500,000** single payment. **TZS 800,000** cumulative same payer→recipient within 24 hours. | Both values stored as configurable backend constants. The rolling window closes the transaction-splitting loophole. |
| 2 | Raw SMS retention after confirmation | **48 hours**, then auto-purged by scheduled job. | Supports early dispute resolution. Privacy policy must declare this explicitly. Purge job runs hourly. |
| 3 | Pending transaction expiry window | **Tiered by amount:** < TZS 100k → 24h; TZS 100k–499k → 12h; ≥ TZS 500k → 6h. | Higher-value payments have tighter windows. All three thresholds are configurable constants. |
| 4 | BoT pre-registration before launch | **Not required.** App launches without pre-registration. Post-launch BoT engagement if scope or volume warrants it. | App is positioned as a technology record-keeping service, not a payment service provider. |
| 5 | MNO coverage scope | **Tanzania mainland + Zanzibar variants.** | Zanzibar-specific SMS format QA is a required beta gate before production launch. Recruit Zanzibar-based testers during beta. |
| 6 | Payer reference/note field | **Not included in v1.** | Can be revisited post-launch based on user feedback. Low-effort addition when needed. |
| 7 | Data retention policy for confirmed payment records | **Deferred.** Not in scope for v1. | To be defined before any regulatory engagement or privacy policy finalisation. |
