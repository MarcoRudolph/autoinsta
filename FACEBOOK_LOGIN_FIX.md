# 🚨 Facebook Login Fehler - Sofortige Lösung

## Problem
**Fehler**: "Scheinbar ist diese App nicht verfügbar - Für diese App ist mindestens ein/e supported permission erforderlich"

## 🎯 Sofortige Lösung (5 Minuten)

### Schritt 1: Facebook Developer Console öffnen
1. Gehen Sie zu [Facebook Developers](https://developers.facebook.com/)
2. Wählen Sie Ihre App aus

### Schritt 2: Permissions hinzufügen (KRITISCH!)
1. **Klicken Sie auf "App Review" → "Permissions and Features"**
2. **Suchen Sie nach "email"**
3. **Klicken Sie auf "Add to App"**
4. **Suchen Sie nach "public_profile"**
5. **Klicken Sie auf "Add to App"**

### Schritt 3: App Status prüfen
1. **Gehen Sie zu "App Review" → "App Review"**
2. **Stellen Sie sicher, dass der Status "Live" oder "Development" ist**

### Schritt 4: Testen
1. Gehen Sie zurück zu Ihrer App
2. Versuchen Sie Facebook Login erneut

## ✅ Erwartetes Ergebnis

Nach diesen Schritten sollten Sie sehen:
- `email` - Status: "Available"
- `public_profile` - Status: "Available"

## 🔍 Vollständige Anleitung

Für detaillierte Schritte siehe: [Facebook App Setup Guide](docs/facebook-app-setup-step-by-step.md)

## ⚠️ Wichtige Hinweise

- **Ohne Permissions funktioniert Facebook Login nicht**
- **Mindestens `email` und `public_profile` sind erforderlich**
- **App muss "Live" oder "Development" Status haben**

## 🆘 Falls es immer noch nicht funktioniert

1. Überprüfen Sie die Browser-Konsole auf weitere Fehler
2. Stellen Sie sicher, dass alle Umgebungsvariablen korrekt sind
3. Testen Sie mit einem anderen Facebook-Konto
4. Überprüfen Sie die Callback-URLs in der Facebook App

---

**Dieser Fehler ist sehr häufig und wird durch fehlende Permissions verursacht. Die Lösung oben sollte das Problem sofort beheben.**

