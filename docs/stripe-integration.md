# Stripe Integration - Modern Implementation

## Übersicht

Diese Implementierung folgt den aktuellen Best Practices für Stripe-Integrationen mit Next.js 15 und Drizzle ORM (2024-2025). Das System kombiniert Stripe Checkout, Billing Portal und Webhooks für eine robuste Subscription-Verwaltung.

## Architektur

### **1. Datenbank-Schema**

#### **Users Tabelle** (erweitert)
```sql
-- Neue Felder für Stripe-Integration
stripe_customer_id: text                    -- Stripe Customer ID
subscription_status: text DEFAULT 'free'    -- Legacy field (wird durch subscriptions Tabelle ersetzt)
subscription_plan: text DEFAULT 'free'      -- Legacy field
subscription_start_date: timestamp          -- Legacy field
subscription_end_date: timestamp            -- Legacy field
is_pro: boolean DEFAULT false               -- Legacy field
```

#### **Subscriptions Tabelle** (neu)
```sql
subscription_id: text PRIMARY KEY           -- Stripe subscription ID
customer_id: text NOT NULL                  -- Stripe customer ID
user_id: uuid NOT NULL                      -- FK zu users.id
status: text NOT NULL                       -- 'trialing', 'active', 'past_due', 'canceled', etc.
cancel_at_period_end: boolean DEFAULT false
current_period_start: timestamp
current_period_end: timestamp
trial_end: timestamp
price_id: text                              -- Stripe price ID
product_id: text                            -- Stripe product ID
plan: text NOT NULL                         -- 'free', 'pro', 'enterprise'
quantity: integer DEFAULT 1
latest_invoice_id: text
created_at: timestamp DEFAULT NOW()
updated_at: timestamp DEFAULT NOW()
```

#### **Webhook Events Tabelle** (neu)
```sql
event_id: text PRIMARY KEY                  -- Stripe event ID
type: text NOT NULL                         -- Event type
object_id: text                             -- Related Stripe object ID
status: text NOT NULL                       -- 'processed' | 'failed' | 'aux'
error: text                                 -- Error message if failed
processed_at: timestamp NOT NULL
```

## **2. Implementierung**

### **Stripe Client (`src/lib/stripe.ts`)**
```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', // Pin API version for predictable behavior
});

// Price IDs für verschiedene Pläne
export const STRIPE_PRICES = {
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY,
  PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY,
  ENTERPRISE_MONTHLY: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
};
```

### **Server Actions (`src/app/actions/stripe.ts`)**
- `createSubscriptionCheckout()` - Erstellt Stripe Checkout Session
- `createBillingPortal()` - Öffnet Stripe Billing Portal
- `cancelSubscriptionAtPeriodEnd()` - Kündigt Abonnement
- `reactivateSubscription()` - Reaktiviert gekündigtes Abonnement

### **Webhook Endpoint (`src/app/api/stripe/webhook/route.ts`)**
- Verifiziert Stripe-Signaturen
- Verarbeitet alle Subscription-Events
- Implementiert Idempotency (verhindert Duplikate)
- Robuste Fehlerbehandlung mit Retry-Logic

## **3. Verwendung**

### **Checkout Session erstellen**
```typescript
import { createSubscriptionCheckout } from '@/app/actions/stripe';

// Im Client Component
const handleSubscribe = async () => {
  try {
    const { url } = await createSubscriptionCheckout(
      process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY!,
      userId
    );
    window.location.href = url; // Weiterleitung zu Stripe
  } catch (error) {
    console.error('Checkout failed:', error);
  }
};
```

### **Billing Portal öffnen**
```typescript
import { createBillingPortal } from '@/app/actions/stripe';

const handleManageBilling = async () => {
  try {
    const { url } = await createBillingPortal(userId);
    window.location.href = url;
  } catch (error) {
    console.error('Billing portal failed:', error);
  }
};
```

### **Subscription-Status prüfen**
```typescript
import { useSubscription, useProAccess } from '@/hooks/useSubscription';

function MyComponent({ userId }) {
  const { isPro, isLoading, error } = useProAccess(userId);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {isPro ? (
        <ProFeature />
      ) : (
        <UpgradePrompt />
      )}
    </div>
  );
}
```

## **4. Umgebungsvariablen**

### **Erforderliche Variablen**
```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (aus Stripe Dashboard)
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Webhook Events konfigurieren**
Im Stripe Dashboard folgende Events abonnieren:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

## **5. Migration**

### **Migration ausführen**
```bash
# Neue Migration generieren
npx drizzle-kit generate

# Migration in Datenbank anwenden
npx drizzle-kit migrate
```

### **Migration-Dateien**
- `0002_thankful_mikhail_rasputin.sql` - Erweiterte users Tabelle
- `0003_short_exiles.sql` - Neue subscriptions und webhook_events Tabellen

## **6. Best Practices**

### **Sicherheit**
✅ **Signature Verification**: Alle Webhooks werden mit Stripe-Signature verifiziert  
✅ **API Version Pinning**: Feste API-Version für vorhersagbares Verhalten  
✅ **Idempotency**: Verhindert Duplikate bei Webhook-Events  
✅ **Raw Body**: Webhook liest rohen Body für Signature-Verifikation  

### **Performance**
✅ **Datenbank-Flags**: Schnelle Plan-Checks ohne Stripe-API-Calls  
✅ **Webhook-Processing**: Asynchrone Event-Verarbeitung  
✅ **Caching**: Subscription-Status wird lokal gespeichert  

### **Zuverlässigkeit**
✅ **Retry-Logic**: Stripe wiederholt fehlgeschlagene Webhooks  
✅ **Error Handling**: Robuste Fehlerbehandlung mit Logging  
✅ **Transaction Safety**: Datenbank-Updates in Transaktionen  

## **7. Entwicklung & Testing**

### **Lokale Webhook-Tests**
```bash
# Stripe CLI installieren
npm install -g stripe

# Webhook-Forwarding starten
stripe listen --forward-to http://localhost:3000/api/stripe/webhook

# Webhook Secret aus der Ausgabe kopieren
```

### **Test-Daten**
```bash
# Test-Customer erstellen
stripe customers create --email test@example.com

# Test-Subscription erstellen
stripe subscriptions create --customer cus_... --price price_...
```

## **8. Deployment**

### **Vercel/Cloudflare Pages**
- Webhook-Endpoint konfigurieren
- Umgebungsvariablen setzen
- Webhook-URL in Stripe Dashboard eintragen

### **Webhook-URL**
```
https://yourdomain.com/api/stripe/webhook
```

## **9. Monitoring & Debugging**

### **Webhook-Logs**
- Alle Events werden in `webhook_events` Tabelle gespeichert
- Fehler werden mit Details protokolliert
- Idempotency verhindert Duplikate

### **Stripe Dashboard**
- Webhook-Delivery-Status überwachen
- Event-Logs einsehen
- Retry-Historie verfolgen

## **10. Nächste Schritte**

1. **Stripe Dashboard konfigurieren**
   - Products & Prices erstellen
   - Webhook-Endpoint einrichten
   - Test-Modus aktivieren

2. **UI-Integration**
   - Upgrade-Buttons implementieren
   - Pro-Features freischalten
   - Billing-Management integrieren

3. **Testing**
   - Webhook-Endpoint testen
   - Checkout-Flow validieren
   - Error-Handling prüfen

4. **Production**
   - Live Stripe-Keys verwenden
   - Webhook-Signature verifizieren
   - Monitoring einrichten

## **Support & Troubleshooting**

### **Häufige Probleme**
- **Webhook 400**: Überprüfe `STRIPE_WEBHOOK_SECRET`
- **Checkout-Fehler**: Validiere Price IDs
- **Datenbank-Fehler**: Führe Migrationen aus

### **Debugging**
- Stripe CLI für lokale Tests
- Webhook-Logs in Datenbank
- Stripe Dashboard für Event-Status
