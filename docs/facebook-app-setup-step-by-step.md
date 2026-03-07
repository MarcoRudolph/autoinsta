# Facebook App Setup - Schritt für Schritt

## 🚨 Problem: "Für diese App ist mindestens ein/e supported permission erforderlich"

Dieser Fehler tritt auf, wenn Ihre Facebook App keine gültigen Permissions konfiguriert hat.

## 📋 Schritt-für-Schritt Lösung

### Schritt 1: Facebook Developer Console öffnen

1. Gehen Sie zu [Facebook Developers](https://developers.facebook.com/)
2. Melden Sie sich mit Ihrem Facebook-Konto an
3. Klicken Sie auf "Meine Apps" → "App erstellen" (oder wählen Sie eine bestehende App)

### Schritt 2: App-Typ auswählen

1. Wählen Sie "Verbraucher" oder "Geschäft" (je nach Verwendungszweck)
2. Geben Sie einen App-Namen ein (z.B. "Boost Your Date")
3. Geben Sie eine Kontakt-E-Mail ein
4. Klicken Sie auf "App erstellen"

### Schritt 3: Facebook Login hinzufügen

1. In der App-Übersicht, scrollen Sie nach unten zu "Produkte hinzufügen"
2. Klicken Sie auf "Facebook Login" → "Einrichten"
3. Wählen Sie "Web" als Plattform

### Schritt 4: ⚠️ KRITISCH - Permissions konfigurieren

**Dies ist der wichtigste Schritt!**

1. **Gehen Sie zu "App Review" → "Permissions and Features"**
2. **Suchen Sie nach "email" und klicken Sie darauf**
3. **Klicken Sie auf "Add to App"**
4. **Suchen Sie nach "public_profile" und klicken Sie darauf**
5. **Klicken Sie auf "Add to App"**

**WICHTIG**: Ohne diese Permissions funktioniert die App nicht!

### Schritt 5: OAuth Redirect URIs konfigurieren

1. **Gehen Sie zu "Facebook Login" → "Settings"**
2. **Scrollen Sie zu "Valid OAuth Redirect URIs"**
3. **Fügen Sie diese URLs hinzu:**
   ```
   https://your-domain.com/api/auth/callback
   http://localhost:3000/api/auth/callback
   ```
4. **Klicken Sie auf "Änderungen speichern"**

### Schritt 6: App Domains konfigurieren

1. **Gehen Sie zu "Settings" → "Basic"**
2. **Scrollen Sie zu "App Domains"**
3. **Fügen Sie Ihre Domain hinzu:**
   ```
   your-domain.com
   localhost
   ```
4. **Klicken Sie auf "Änderungen speichern"**

### Schritt 7: App Status prüfen

1. **Gehen Sie zu "App Review" → "App Review"**
2. **Stellen Sie sicher, dass der Status "Live" oder "Development" ist**
3. **Falls "Development":**
   - Fügen Sie Testbenutzer hinzu
   - Oder wechseln Sie zu "Live" (erfordert Facebook-Review)

### Schritt 8: App-ID und App-Secret kopieren

1. **Gehen Sie zu "Settings" → "Basic"**
2. **Kopieren Sie die "App-ID"**
3. **Kopieren Sie das "App-Secret"**
4. **Fügen Sie diese zu Ihren Umgebungsvariablen hinzu**

## 🔧 Umgebungsvariablen

Fügen Sie diese zu Ihrer `.env.local` hinzu:

```env
# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Supabase (falls noch nicht vorhanden)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## ✅ Verifikation

Nach der Konfiguration sollten Sie:

1. **In "App Review" → "Permissions and Features" sehen:**
   - `email` - Status: "Available" oder "Approved"
   - `public_profile` - Status: "Available" oder "Approved"

2. **In "Facebook Login" → "Settings" sehen:**
   - Ihre Callback-URLs in "Valid OAuth Redirect URIs"

3. **In "Settings" → "Basic" sehen:**
   - Ihre Domain in "App Domains"

## 🚨 Häufige Fehler

### Fehler 1: "App not available"
**Lösung**: App-Status auf "Live" oder "Development" setzen

### Fehler 2: "Invalid redirect URI"
**Lösung**: Callback-URL in "Valid OAuth Redirect URIs" hinzufügen

### Fehler 3: "Permission required"
**Lösung**: Mindestens `email` und `public_profile` zu "Permissions and Features" hinzufügen

## 🧪 Testen

1. **Starten Sie Ihre Anwendung:**
   ```bash
   npm run dev
   ```

2. **Testen Sie Facebook Login:**
   - Gehen Sie zu Ihrer Login-Seite
   - Klicken Sie auf "Continue with Facebook"
   - Sie sollten zur Facebook-Autorisierung weitergeleitet werden

3. **Falls es nicht funktioniert:**
   - Überprüfen Sie die Browser-Konsole auf Fehler
   - Überprüfen Sie die Facebook Developer Console
   - Stellen Sie sicher, dass alle Permissions korrekt konfiguriert sind

## 📞 Support

Falls Sie weiterhin Probleme haben:

1. Überprüfen Sie die [Facebook Developer Dokumentation](https://developers.facebook.com/docs/facebook-login/web)
2. Stellen Sie sicher, dass alle Schritte korrekt befolgt wurden
3. Überprüfen Sie die Umgebungsvariablen
4. Testen Sie mit einem anderen Facebook-Konto

---

**WICHTIG**: Ohne korrekte Permissions-Konfiguration funktioniert Facebook Login nicht!

