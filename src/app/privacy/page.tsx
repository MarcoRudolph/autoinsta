export const metadata = {
  title: "Datenschutzerklärung - rudolpho-chat",
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[#334269] space-y-6">
      <h1 className="text-4xl font-bold text-center mb-8">Datenschutzerklärung</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
        <p className="text-sm text-blue-800">
          <strong>Letzte Aktualisierung:</strong> {new Date().toLocaleDateString('de-DE')}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Einleitung</h2>
        <p>
          Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Diese Datenschutzerklärung 
          informiert Sie über die Art, den Umfang und Zweck der Verarbeitung personenbezogener Daten 
          bei der Nutzung von rudolpho-chat.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Verantwortlicher</h2>
        <p>
          Verantwortlich für die Datenverarbeitung ist:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p><strong>rudolpho-chat</strong></p>
          <p>E-Mail: privacy@rudolpho-chat.de</p>
          <p>Adresse: [Ihre Geschäftsadresse]</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Erhobene Daten</h2>
        <p>Wir erheben folgende Arten von Daten:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Kontodaten:</strong> E-Mail-Adresse, Name (bei Registrierung)</li>
          <li><strong>Nutzungsdaten:</strong> Interaktionen mit dem Service, erstellte Personas</li>
          <li><strong>Technische Daten:</strong> IP-Adresse, Browser-Informationen, Gerätedaten</li>
          <li><strong>Instagram-Daten:</strong> Nachrichten und Kommentare (nur mit Ihrer Zustimmung)</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Zweck der Datenverarbeitung</h2>
        <p>Ihre Daten werden für folgende Zwecke verarbeitet:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Bereitstellung und Verbesserung des rudolpho-chat Services</li>
          <li>Verwaltung Ihres Kontos und Ihrer Personas</li>
          <li>Automatisierung Ihrer Instagram-Interaktionen</li>
          <li>Kundensupport und Kommunikation</li>
          <li>Analyse der Service-Nutzung zur Verbesserung</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Rechtsgrundlagen</h2>
        <p>Die Verarbeitung erfolgt auf folgenden Rechtsgrundlagen:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Vertragserfüllung:</strong> Für die Bereitstellung des Services</li>
          <li><strong>Einwilligung:</strong> Für Marketing-Kommunikation und Instagram-Integration</li>
          <li><strong>Berechtigte Interessen:</strong> Für Service-Verbesserungen und Sicherheit</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Datenweitergabe</h2>
        <p>
          Wir geben Ihre Daten nur in folgenden Fällen weiter:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>An Dienstleister, die uns bei der Service-Bereitstellung unterstützen</li>
          <li>An Instagram (Meta) für die API-Integration (nur mit Ihrer Zustimmung)</li>
          <li>Bei gesetzlicher Verpflichtung oder behördlicher Anordnung</li>
          <li>Zum Schutz unserer Rechte und der Sicherheit anderer Nutzer</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Datensicherheit</h2>
        <p>
          Wir implementieren angemessene technische und organisatorische Maßnahmen zum 
          Schutz Ihrer Daten vor unbefugtem Zugriff, Verlust oder Missbrauch.
        </p>
        <p>
          Alle Datenübertragungen erfolgen verschlüsselt (HTTPS/TLS). Ihre Daten werden 
          in sicheren Rechenzentren gespeichert.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">8. Ihre Rechte</h2>
        <p>Sie haben folgende Rechte bezüglich Ihrer Daten:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Auskunftsrecht:</strong> Informationen über verarbeitete Daten</li>
          <li><strong>Berichtigungsrecht:</strong> Korrektur falscher Daten</li>
          <li><strong>Löschungsrecht:</strong> Entfernung Ihrer Daten</li>
          <li><strong>Einschränkungsrecht:</strong> Begrenzung der Datenverarbeitung</li>
          <li><strong>Datenübertragbarkeit:</strong> Export Ihrer Daten</li>
          <li><strong>Widerspruchsrecht:</strong> Gegen bestimmte Verarbeitungen</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">9. Cookies</h2>
        <p>
          Wir verwenden Cookies und ähnliche Technologien. Details finden Sie in unserer 
          <a href="/cookie-policy" className="text-blue-600 hover:underline"> Cookie-Richtlinie</a>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">10. Speicherdauer</h2>
        <p>
          Wir speichern Ihre Daten nur so lange wie nötig:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Kontodaten:</strong> Bis zur Kündigung Ihres Kontos</li>
          <li><strong>Nutzungsdaten:</strong> 2 Jahre nach der letzten Aktivität</li>
          <li><strong>Instagram-Daten:</strong> Nur während der aktiven Verbindung</li>
          <li><strong>Log-Daten:</strong> 90 Tage für Sicherheitszwecke</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">11. Kontakt</h2>
        <p>
          Bei Fragen zum Datenschutz erreichen Sie uns unter:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p><strong>E-Mail:</strong> privacy@rudolpho-chat.de</p>
          <p><strong>Adresse:</strong> [Ihre Geschäftsadresse]</p>
        </div>
        <p>
          Sie haben auch das Recht, sich bei der zuständigen Aufsichtsbehörde zu beschweren.
        </p>
      </section>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Hinweis:</strong> Diese Datenschutzerklärung kann bei Bedarf aktualisiert werden. 
          Wesentliche Änderungen werden Ihnen per E-Mail mitgeteilt.
        </p>
      </div>
    </div>
  );
} 