# Facebook OAuth Setup

## Übersicht

Diese Anwendung verwendet eine eigene OAuth-Callback-URL anstelle der Standard-Supabase-Callback-URL. Die Callback-URL ist:

```
https://your-domain.com/api/auth/callback
```

## Facebook App Konfiguration

### 1. Facebook Developer Console

1. Gehen Sie zu [Facebook Developers](https://developers.facebook.com/)
2. Erstellen Sie eine neue App oder wählen Sie eine bestehende App
3. Fügen Sie das "Facebook Login" Produkt hinzu

### 2. OAuth Redirect URIs

In der Facebook App-Konfiguration müssen Sie folgende Redirect URIs hinzufügen:

**Für Produktion:**
```
https://your-domain.com/api/auth/callback
```

**Für Entwicklung:**
```
http://localhost:3000/api/auth/callback
```

### 3. App Domains

Fügen Sie Ihre Domain zur Liste der App-Domains hinzu:

**Für Produktion:**
```
your-domain.com
```

**Für Entwicklung:**
```
localhost
```

### 4. Valid OAuth Redirect URIs

Stellen Sie sicher, dass die folgenden URIs als gültig markiert sind:

```
https://your-domain.com/api/auth/callback
http://localhost:3000/api/auth/callback
```

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

### Häufige Probleme

1. **"Invalid redirect URI"**
   - Überprüfen Sie, ob die Callback-URL in Facebook korrekt konfiguriert ist
   - Stellen Sie sicher, dass die Domain in den App-Domains steht

2. **"OAuth error"**
   - Überprüfen Sie die Browser-Konsole für detaillierte Fehlermeldungen
   - Stellen Sie sicher, dass alle Umgebungsvariablen korrekt gesetzt sind

3. **"No authorization code received"**
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
