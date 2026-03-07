# E-Mail-Setup mit Resend

## Übersicht

Diese Anwendung verwendet **Resend** für E-Mail-Versand. Resend ist ein moderner E-Mail-Service, der keine SMTP-Server-Konfiguration erfordert.

## 🔧 Konfiguration

### 1. Resend API Key

Fügen Sie Ihre Resend API Key zu den Umgebungsvariablen hinzu:

```env
RESEND_API_KEY=re_your_api_key_here
```

### 2. Domain-Verifizierung

**WICHTIG**: Sie müssen Ihre Domain in Resend verifizieren:

1. Gehen Sie zu [Resend Dashboard](https://resend.com/domains)
2. Fügen Sie Ihre Domain hinzu (z.B. `boostyourdate.com`)
3. Fügen Sie die DNS-Records zu Ihrer Domain hinzu
4. Warten Sie auf die Verifizierung

### 3. E-Mail-Absender konfigurieren

Aktualisieren Sie den `from`-Parameter in den E-Mail-Funktionen:

```typescript
// In sendVerificationEmail und sendWelcomeEmail
from: 'Boost Your Date <noreply@yourdomain.com>'
```

## 📧 E-Mail-Templates

### 1. Verifizierungs-E-Mail

**Wann**: Nach Benutzerregistrierung
**Zweck**: E-Mail-Adresse bestätigen
**Inhalt**:
- Willkommensnachricht
- Verifizierungs-Button
- 24h Ablaufzeit-Warnung
- Fallback-Link

### 2. Willkommens-E-Mail

**Wann**: Nach erfolgreicher E-Mail-Verifizierung
**Zweck**: Benutzer zum Dashboard weiterleiten
**Inhalt**:
- Bestätigung der Verifizierung
- Nächste Schritte
- Dashboard-Link
- Pro-Tipps

## 🚀 Implementierung

### E-Mail-Funktionen

```typescript
// Verifizierungs-E-Mail senden
await sendVerificationEmail(email, verificationToken);

// Willkommens-E-Mail senden
await sendWelcomeEmail(email);
```

### Fehlerbehandlung

- **API Key fehlt**: Fehler wird geloggt, Fallback auf Console-Log
- **E-Mail-Versand fehlgeschlagen**: Registrierung wird nicht blockiert
- **Domain nicht verifiziert**: Resend gibt Fehler zurück

## 🧪 Testing

### Entwicklung

1. **Console-Logging**: E-Mails werden in der Konsole geloggt
2. **Resend Test-Modus**: Verwenden Sie Test-API-Keys
3. **E-Mail-Preview**: Resend Dashboard zeigt E-Mail-Vorschau

### Produktion

1. **Domain verifizieren**: Stellen Sie sicher, dass Ihre Domain verifiziert ist
2. **DNS-Records**: Überprüfen Sie SPF, DKIM, DMARC
3. **E-Mail-Deliverability**: Überwachen Sie Bounce-Raten

## 📊 E-Mail-Analytics

Resend bietet integrierte Analytics:

- **Zustellraten**: Erfolgreich zugestellte E-Mails
- **Öffnungsraten**: Wie oft E-Mails geöffnet werden
- **Klickraten**: Klicks auf Links in E-Mails
- **Bounce-Raten**: Nicht zustellbare E-Mails

## 🔒 Sicherheit

### Best Practices

1. **API Key schützen**: Niemals in Client-Code verwenden
2. **Rate Limiting**: Resend hat eingebaute Rate Limits
3. **Token-Ablauf**: Verifizierungs-Tokens laufen nach 24h ab
4. **HTTPS**: Alle E-Mail-Links verwenden HTTPS

### Datenschutz

- **Keine sensiblen Daten**: E-Mails enthalten keine Passwörter
- **Minimale Daten**: Nur notwendige Informationen werden gesendet
- **DSGVO-konform**: Benutzer können E-Mails abbestellen

## 🛠️ Troubleshooting

### Häufige Probleme

1. **"Domain not verified"**
   - Lösung: Domain in Resend verifizieren
   - DNS-Records hinzufügen

2. **"Invalid API key"**
   - Lösung: API Key in Umgebungsvariablen überprüfen
   - Resend Dashboard prüfen

3. **E-Mails kommen nicht an**
   - Lösung: Spam-Ordner prüfen
   - DNS-Records überprüfen
   - Resend Analytics prüfen

### Debugging

```typescript
// E-Mail-Versand debuggen
console.log('Sending email to:', email);
console.log('Resend response:', data);
console.log('Resend error:', error);
```

## 📈 Monitoring

### Wichtige Metriken

- **Zustellrate**: > 95%
- **Bounce-Rate**: < 5%
- **Spam-Rate**: < 0.1%
- **Öffnungsrate**: > 20%

### Alerts

Richten Sie Alerts ein für:
- Hohe Bounce-Raten
- E-Mail-Versand-Fehler
- Domain-Verifizierungs-Probleme

## 🔄 Wartung

### Regelmäßige Aufgaben

1. **Domain-Status prüfen**: Monatlich
2. **DNS-Records überprüfen**: Bei Domain-Änderungen
3. **Analytics überprüfen**: Wöchentlich
4. **API Key rotieren**: Quartalsweise

### Updates

- **Resend SDK**: Regelmäßig aktualisieren
- **E-Mail-Templates**: Bei Design-Änderungen
- **Sicherheits-Updates**: Sofort implementieren

---

**Wichtig**: Stellen Sie sicher, dass Ihre Domain in Resend verifiziert ist, bevor Sie in die Produktion gehen!

