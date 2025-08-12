# Subscription System Setup

## Übersicht

Das Subscription-System wurde in die `users` Tabelle integriert, um Pro-Plan-Features zu verwalten. Es kombiniert Stripe für die Zahlungsabwicklung mit lokalen Datenbank-Flags für schnelle Plan-Checks.

## Neue Datenbank-Felder

### Users Tabelle
```sql
-- Neue Felder in der users Tabelle
stripe_customer_id: text                    -- Stripe Customer ID
subscription_status: text DEFAULT 'free'    -- 'free', 'pro', 'cancelled', 'past_due'
subscription_plan: text DEFAULT 'free'      -- 'free', 'pro', 'enterprise'
subscription_start_date: timestamp          -- Abonnement-Start
subscription_end_date: timestamp            -- Abonnement-Ende
is_pro: boolean DEFAULT false               -- Schneller Pro-Check
```

## Verwendung

### 1. Plan-Status prüfen
```typescript
import { getUserPlan, isUserPro } from '@/lib/subscription';

// Plan abrufen
const plan = await getUserPlan(userId); // 'free' | 'pro' | 'enterprise'

// Pro-Status prüfen
const isPro = await isUserPro(userId); // boolean
```

### 2. React Hook verwenden
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

### 3. API-Endpoint
```typescript
// GET /api/subscription?userId=123
const response = await fetch('/api/subscription?userId=123');
const { isPro, subscriptionPlan, subscriptionStatus } = await response.json();
```

## Migration ausführen

Die Migration wurde bereits generiert. Führe sie aus mit:

```bash
# Migration anwenden
npx drizzle-kit migrate

# Oder manuell in der Datenbank
# Siehe: drizzle/migrations/0002_thankful_mikhail_rasputin.sql
```

## Nächste Schritte

1. **Stripe Integration**: Webhook-Endpoint für automatische Plan-Updates
2. **Checkout Flow**: Stripe Checkout für neue Abonnements
3. **Pro Features**: UI-Komponenten basierend auf Plan-Status
4. **Billing Portal**: Stripe Customer Portal für Abonnement-Verwaltung

## Typen

```typescript
export type SubscriptionStatus = 'free' | 'pro' | 'cancelled' | 'past_due' | 'incomplete';
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export interface UserSubscription {
  id: string;
  email: string;
  stripeCustomerId: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStartDate: Date | null;
  subscriptionEndDate: Date | null;
  isPro: boolean;
}
```
