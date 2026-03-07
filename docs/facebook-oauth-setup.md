# Facebook OAuth Setup

## Übersicht

Diese Anwendung verwendet eine eigene OAuth-Callback-URL anstelle der Standard-Supabase-Callback-URL. Die Callback-URL ist:

```
https://your-domain.com/api/auth/callback
```

## 🚨 WICHTIG: Facebook App Permissions

**Fehler "Für diese App ist mindestens ein/e supported permission erforderlich"** bedeutet, dass Ihre Facebook App keine gültigen Permissions konfiguriert hat.

## Facebook App Konfiguration

### 1. Facebook Developer Console

1. Gehen Sie zu [Facebook Developers](https://developers.facebook.com/)
2. Erstellen Sie eine neue App oder wählen Sie eine bestehende App
3. Fügen Sie das "Facebook Login" Produkt hinzu

### 2. ⚠️ KRITISCH: App Permissions konfigurieren

**In der Facebook App-Konfiguration müssen Sie folgende Permissions hinzufügen:**

1. **Gehen Sie zu "App Review" → "Permissions and Features"**
2. **Fügen Sie diese Standard-Permissions hinzu:**
   - `email` - Benutzer-E-Mail-Adresse
   - `public_profile` - Öffentliches Profil (Name, Profilbild)

3. **Für erweiterte Features (optional):**
   - `user_friends` - Freundesliste (falls benötigt)
   - `user_photos` - Benutzer-Fotos (falls benötigt)

4. **WICHTIG: Aktivieren Sie diese Permissions:**
   - Klicken Sie auf "Add to App" für jede Permission
   - Stellen Sie sicher, dass der Status "Approved" oder "Available" ist

### 3. OAuth Redirect URIs

**Gehen Sie zu "Facebook Login" → "Settings"**

In der Facebook App-Konfiguration müssen Sie folgende Redirect URIs hinzufügen:

**Für Produktion:**
```
https://your-domain.com/api/auth/callback
```

**Für Entwicklung:**
```
http://localhost:3000/api/auth/callback
```

### 4. App Domains

**Gehen Sie zu "Settings" → "Basic"**

Fügen Sie Ihre Domain zur Liste der App-Domains hinzu:

**Für Produktion:**
```
your-domain.com
```

**Für Entwicklung:**
```
localhost
```

### 5. Valid OAuth Redirect URIs

**In "Facebook Login" → "Settings" → "Valid OAuth Redirect URIs"**

Stellen Sie sicher, dass die folgenden URIs als gültig markiert sind:

```
https://your-domain.com/api/auth/callback
http://localhost:3000/api/auth/callback
```

### 6. ⚠️ KRITISCH: App Status prüfen

**Gehen Sie zu "App Review" → "App Review"**

- Stellen Sie sicher, dass Ihre App den Status "Live" hat
- Oder dass sie mindestens im "Development" Modus ist
- **WICHTIG**: Ohne gültige Permissions kann die App nicht verwendet werden

## Umgebungsvariablen

Stellen Sie sicher, dass folgende Umgebungsvariablen gesetzt sind:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Funktionsweise

1. **Login-Start**: `/api/auth/login` - Startet den OAuth-Flow
2. **Callback-Verarbeitung**: `/api/auth/callback` - Verarbeitet die OAuth-Antwort
3. **Session-Erstellung**: Verwendet Supabase für die Session-Verwaltung

## Fehlerbehebung

### 🚨 KRITISCHE FEHLER

1. **"Für diese App ist mindestens ein/e supported permission erforderlich"**
   - **LÖSUNG**: Gehen Sie zu "App Review" → "Permissions and Features"
   - Fügen Sie mindestens `email` und `public_profile` hinzu
   - Klicken Sie auf "Add to App" für jede Permission
   - Stellen Sie sicher, dass der Status "Available" oder "Approved" ist

2. **"App not available" / "Diese App ist nicht verfügbar"**
   - **LÖSUNG**: Prüfen Sie den App-Status in "App Review" → "App Review"
   - Stellen Sie sicher, dass die App "Live" oder im "Development" Modus ist
   - Fügen Sie gültige Permissions hinzu (siehe oben)

### Häufige Probleme

3. **"Invalid redirect URI"**
   - Überprüfen Sie, ob die Callback-URL in Facebook korrekt konfiguriert ist
   - Stellen Sie sicher, dass die Domain in den App-Domains steht

4. **"OAuth error"**
   - Überprüfen Sie die Browser-Konsole für detaillierte Fehlermeldungen
   - Stellen Sie sicher, dass alle Umgebungsvariablen korrekt gesetzt sind

5. **"No authorization code received"**
   - Überprüfen Sie, ob der OAuth-Flow korrekt gestartet wurde
   - Stellen Sie sicher, dass die Facebook-App korrekt konfiguriert ist

### Debugging

Aktivieren Sie das Debug-Logging in der Entwicklungsumgebung:

```typescript
// In der Callback-Route
console.log('OAuth callback received:', { code, error, errorDescription });
```

## Sicherheit

- Die Callback-URL ist öffentlich zugänglich, aber sicher, da sie nur mit gültigen OAuth-Codes funktioniert
- Alle OAuth-Tokens werden über Supabase sicher verwaltet
- Keine sensiblen Daten werden in der URL übertragen
